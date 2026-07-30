import {
  canonicalEvidenceSource,
  isHttpUrl,
  type EvidenceItem,
} from "./falsifi.ts";

export type MaterialCandidate = {
  id: string;
  title: string;
  publisher: string;
  sourceUrl: string;
  publishedAt: string;
  provider: "Yahoo Finance";
  kind: "news";
};

type YahooNewsItem = {
  uuid?: unknown;
  title?: unknown;
  publisher?: unknown;
  link?: unknown;
  providerPublishTime?: unknown;
  relatedTickers?: unknown;
  type?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizedText = (value: string) =>
  value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]+/gu, "");

const COMPANY_SUFFIXES = new Set([
  "co",
  "company",
  "beijing",
  "china",
  "chinese",
  "corp",
  "corporation",
  "electric",
  "electrical",
  "equipment",
  "global",
  "guangdong",
  "group",
  "holding",
  "holdings",
  "hong",
  "inc",
  "incorporated",
  "industries",
  "industry",
  "intelligent",
  "international",
  "jiangsu",
  "kong",
  "limited",
  "ltd",
  "plc",
  "sa",
  "shanghai",
  "shenzhen",
  "systems",
  "tech",
  "technologies",
  "technology",
  "zhejiang",
]);

function companyTerms(companyName: string) {
  const normalizedName = companyName.normalize("NFKC").trim();
  const compact = normalizedText(
    normalizedName
      .replace(/股份有限公司|有限责任公司|有限公司|集团$/gu, "")
      .trim(),
  );
  const wordTerms = normalizedName
    .toLocaleLowerCase("en")
    .split(/[^\p{L}\p{N}]+/gu)
    .map((word) => normalizedText(word))
    .filter(
      (word) =>
        word.length >= 4 &&
        !COMPANY_SUFFIXES.has(word),
    );
  return Array.from(
    new Set([compact, ...wordTerms].filter((term) => term.length >= 3)),
  );
}

function hasMatchingTicker(item: YahooNewsItem, symbol: string) {
  if (!Array.isArray(item.relatedTickers)) return false;
  const expected = symbol.toUpperCase();
  return item.relatedTickers.some(
    (ticker) =>
      typeof ticker === "string" &&
      ticker.trim().toUpperCase() === expected,
  );
}

function hasMatchingName(title: string, companyName: string) {
  const normalizedTitle = normalizedText(title);
  return companyTerms(companyName).some((term) =>
    normalizedTitle.includes(term),
  );
}

function publishedDate(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const date = new Date(value * 1_000);
  const timestamp = date.getTime();
  const earliest = Date.UTC(1990, 0, 1);
  const latest = Date.now() + 48 * 60 * 60 * 1_000;
  if (
    Number.isNaN(timestamp) ||
    timestamp < earliest ||
    timestamp > latest
  ) {
    return null;
  }
  return date.toISOString();
}

function candidateId(item: YahooNewsItem, sourceUrl: string) {
  if (
    typeof item.uuid === "string" &&
    /^[a-zA-Z0-9-]{1,100}$/.test(item.uuid)
  ) {
    return `yahoo:${item.uuid}`;
  }
  return `yahoo-url:${canonicalEvidenceSource(sourceUrl)}`;
}

export function parseYahooMaterialCandidates(
  payload: unknown,
  {
    symbol,
    companyName,
    limit = 12,
  }: {
    symbol: string;
    companyName: string;
    limit?: number;
  },
): MaterialCandidate[] {
  if (!isRecord(payload) || !Array.isArray(payload.news)) return [];

  const bySource = new Map<string, MaterialCandidate>();
  for (const rawItem of payload.news) {
    if (!isRecord(rawItem)) continue;
    const item = rawItem as YahooNewsItem;
    const title =
      typeof item.title === "string" ? item.title.trim().slice(0, 500) : "";
    const publisher =
      typeof item.publisher === "string"
        ? item.publisher.trim().slice(0, 300)
        : "";
    const sourceUrl =
      typeof item.link === "string" ? item.link.trim().slice(0, 2_048) : "";
    const publishedAt = publishedDate(item.providerPublishTime);
    const kind =
      typeof item.type === "string" ? item.type.toUpperCase() : "STORY";

    if (
      !title ||
      !publisher ||
      !isHttpUrl(sourceUrl) ||
      !publishedAt ||
      !["STORY", "VIDEO", "PRESS_RELEASE"].includes(kind) ||
      (!hasMatchingTicker(item, symbol) &&
        !hasMatchingName(title, companyName))
    ) {
      continue;
    }

    const sourceKey = canonicalEvidenceSource(sourceUrl);
    if (bySource.has(sourceKey)) continue;
    bySource.set(sourceKey, {
      id: candidateId(item, sourceUrl),
      title,
      publisher,
      sourceUrl,
      publishedAt,
      provider: "Yahoo Finance",
      kind: "news",
    });
  }

  return Array.from(bySource.values())
    .sort((left, right) => {
      const dateOrder = right.publishedAt.localeCompare(left.publishedAt);
      return dateOrder || left.id.localeCompare(right.id);
    })
    .slice(0, Math.max(0, Math.min(limit, 20)));
}

export function mergeMaterialCandidates(
  groups: MaterialCandidate[][],
  limit = 12,
) {
  const bySource = new Map<string, MaterialCandidate>();
  groups.flat().forEach((candidate) => {
    const key = canonicalEvidenceSource(candidate.sourceUrl);
    const existing = bySource.get(key);
    if (
      !existing ||
      candidate.publishedAt > existing.publishedAt
    ) {
      bySource.set(key, candidate);
    }
  });
  return Array.from(bySource.values())
    .sort((left, right) => {
      const dateOrder = right.publishedAt.localeCompare(left.publishedAt);
      return dateOrder || left.id.localeCompare(right.id);
    })
    .slice(0, Math.max(0, Math.min(limit, 20)));
}

export function isMaterialCandidate(
  value: unknown,
): value is MaterialCandidate {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 2_100 &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    value.title.length <= 500 &&
    typeof value.publisher === "string" &&
    value.publisher.trim().length > 0 &&
    value.publisher.length <= 300 &&
    isHttpUrl(value.sourceUrl) &&
    typeof value.publishedAt === "string" &&
    !Number.isNaN(Date.parse(value.publishedAt)) &&
    value.provider === "Yahoo Finance" &&
    value.kind === "news"
  );
}

export function materialCandidateToEvidence(
  candidate: MaterialCandidate,
  id: string,
): EvidenceItem {
  return {
    id,
    title: candidate.title,
    source: candidate.publisher,
    sourceUrl: candidate.sourceUrl,
    asOf: candidate.publishedAt.slice(0, 10),
    group: "External estimate",
    direction: "unclassified",
    impact: 3,
    reliability: 0.4,
    note: "",
    enabled: true,
    originId: `source:${canonicalEvidenceSource(candidate.sourceUrl)}`.slice(
      0,
      120,
    ),
    relation: "direct",
    verification: "unverified",
    provenance: "user",
  };
}

export function isCandidateAlreadyAdded(
  candidate: MaterialCandidate,
  evidence: EvidenceItem[],
) {
  const source = canonicalEvidenceSource(candidate.sourceUrl);
  return evidence.some(
    (item) =>
      canonicalEvidenceSource(item.sourceUrl) === source,
  );
}
