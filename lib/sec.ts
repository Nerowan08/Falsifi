import { canonicalEvidenceSource, isHttpUrl } from "./falsifi.ts";
import type { MaterialCandidate } from "./materials.ts";

type SecTickerRow = {
  cik_str?: unknown;
  ticker?: unknown;
  title?: unknown;
};

type SecRecent = {
  accessionNumber?: unknown;
  filingDate?: unknown;
  form?: unknown;
  primaryDocument?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const SUPPORTED_FORMS = new Set([
  "10-K",
  "10-Q",
  "8-K",
  "20-F",
  "6-K",
  "DEF 14A",
]);

const FORM_LABELS: Record<string, string> = {
  "10-K": "Annual report",
  "10-Q": "Quarterly report",
  "8-K": "Current report",
  "20-F": "Annual report",
  "6-K": "Foreign issuer report",
  "DEF 14A": "Definitive proxy statement",
};

export function resolveSecCompany(
  payload: unknown,
  symbol: string,
) {
  if (!isRecord(payload)) return null;
  const expected = symbol.trim().toUpperCase().replace(/\.[A-Z]+$/u, "");
  for (const value of Object.values(payload)) {
    if (!isRecord(value)) continue;
    const row = value as SecTickerRow;
    if (
      typeof row.ticker !== "string" ||
      row.ticker.trim().toUpperCase() !== expected ||
      typeof row.cik_str !== "number" ||
      !Number.isInteger(row.cik_str) ||
      row.cik_str <= 0
    ) {
      continue;
    }
    return {
      cik: row.cik_str,
      name: typeof row.title === "string" ? row.title.trim() : expected,
    };
  }
  return null;
}

export function parseSecMaterialCandidates(
  payload: unknown,
  {
    cik,
    companyName,
    limit = 10,
  }: { cik: number; companyName: string; limit?: number },
): MaterialCandidate[] {
  if (!isRecord(payload) || !isRecord(payload.filings)) return [];
  const recent = payload.filings.recent;
  if (!isRecord(recent)) return [];
  const data = recent as SecRecent;
  if (
    !Array.isArray(data.accessionNumber) ||
    !Array.isArray(data.filingDate) ||
    !Array.isArray(data.form) ||
    !Array.isArray(data.primaryDocument)
  ) {
    return [];
  }

  const count = Math.min(
    data.accessionNumber.length,
    data.filingDate.length,
    data.form.length,
    data.primaryDocument.length,
    500,
  );
  const bySource = new Map<string, MaterialCandidate>();
  for (let index = 0; index < count; index += 1) {
    const accession = data.accessionNumber[index];
    const filingDate = data.filingDate[index];
    const form = data.form[index];
    const document = data.primaryDocument[index];
    if (
      typeof accession !== "string" ||
      !/^\d{10}-\d{2}-\d{6}$/u.test(accession) ||
      typeof filingDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/u.test(filingDate) ||
      typeof form !== "string" ||
      !SUPPORTED_FORMS.has(form) ||
      typeof document !== "string" ||
      !/^[a-zA-Z0-9._-]{1,240}$/u.test(document)
    ) {
      continue;
    }
    const sourceUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accession.replaceAll("-", "")}/${document}`;
    if (!isHttpUrl(sourceUrl)) continue;
    const sourceKey = canonicalEvidenceSource(sourceUrl);
    bySource.set(sourceKey, {
      id: `sec:${accession}:${document}`,
      title: `${companyName}: ${FORM_LABELS[form] ?? form} (${form})`,
      publisher: "SEC EDGAR",
      sourceUrl,
      publishedAt: filingDate,
      provider: "SEC EDGAR",
      kind: "filing",
    });
  }

  return Array.from(bySource.values())
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, Math.max(0, Math.min(limit, 20)));
}
