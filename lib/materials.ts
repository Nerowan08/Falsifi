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
  provider: "CNINFO" | "Yahoo Finance";
  kind: "filing" | "news";
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

type CninfoAnnouncement = {
  announcementId?: unknown;
  announcementTitle?: unknown;
  announcementTime?: unknown;
  adjunctUrl?: unknown;
  secCode?: unknown;
  secName?: unknown;
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

const cleanCninfoTitle = (value: string) =>
  value
    .replace(/<[^>]*>/gu, "")
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">")
    .replace(/\s+/gu, " ")
    .trim();

const filingPriority = (title: string) => {
  if (/说明会/u.test(title)) return 1;
  if (
    /(?:年度报告|半年度报告|季度报告)$/u.test(title)
  ) {
    return 6;
  }
  if (
    /报告摘要$|业绩预告|业绩快报|业绩预增|业绩预减|审计报告|利润分配|减值损失|风险提示|异常波动|立案|处罚|问询|增持|减持|发行|可转债/u.test(
      title,
    )
  ) {
    return 5;
  }
  if (
    /重大|收购|出售|投资|合同|诉讼|仲裁|担保|关联交易|权益变动|回购|分红|权益分派/u.test(
      title,
    )
  ) {
    return 4;
  }
  if (/股东大会|董事会|监事会/u.test(title)) return 2;
  return 1;
};

export function parseCninfoMaterialCandidates(
  payload: unknown,
  {
    symbol,
    companyName,
    limit = 12,
  }: {
    symbol: string;
    companyName?: string;
    limit?: number;
  },
): MaterialCandidate[] {
  if (!isRecord(payload) || !Array.isArray(payload.announcements)) {
    return [];
  }

  const expectedCode = symbol.toUpperCase().split(".")[0];
  if (!/^\d{6}$/.test(expectedCode)) return [];

  const candidates: Array<{
    candidate: MaterialCandidate;
    priority: number;
  }> = [];
  const sources = new Set<string>();

  for (const rawItem of payload.announcements) {
    if (!isRecord(rawItem)) continue;
    const item = rawItem as CninfoAnnouncement;
    const secCode =
      typeof item.secCode === "string" ? item.secCode.trim() : "";
    if (secCode !== expectedCode) continue;

    const rawTitle =
      typeof item.announcementTitle === "string"
        ? item.announcementTitle
        : "";
    const secName =
      typeof item.secName === "string" ? item.secName.trim() : "";
    const cleanedTitle = cleanCninfoTitle(rawTitle).slice(0, 460);
    const title =
      secName &&
      !cleanedTitle.includes(secName) &&
      !(companyName && cleanedTitle.includes(companyName))
        ? `${secName}：${cleanedTitle}`.slice(0, 500)
        : cleanedTitle;
    const path =
      typeof item.adjunctUrl === "string" ? item.adjunctUrl.trim() : "";
    const pathMatch = path.match(
      /^finalpage\/(\d{4}-\d{2}-\d{2})\/[a-zA-Z0-9._-]+\.PDF$/i,
    );
    const publishedAt = pathMatch?.[1] ?? null;
    const publishedDate = publishedAt
      ? new Date(`${publishedAt}T12:00:00.000Z`)
      : null;
    if (
      !title ||
      !publishedAt ||
      !publishedDate ||
      Number.isNaN(publishedDate.getTime()) ||
      publishedDate.getTime() < Date.UTC(1990, 0, 1) ||
      publishedDate.getTime() > Date.now() + 48 * 60 * 60 * 1_000
    ) {
      continue;
    }

    const sourceUrl = `https://static.cninfo.com.cn/${path}`;
    if (!isHttpUrl(sourceUrl)) continue;
    const sourceKey = canonicalEvidenceSource(sourceUrl);
    if (sources.has(sourceKey)) continue;
    sources.add(sourceKey);

    const announcementId =
      typeof item.announcementId === "string" &&
      /^[a-zA-Z0-9_-]{1,100}$/.test(item.announcementId)
        ? item.announcementId
        : sourceKey;
    candidates.push({
      priority: filingPriority(title),
      candidate: {
        id: `cninfo:${announcementId}`,
        title,
        publisher: "巨潮资讯",
        sourceUrl,
        publishedAt,
        provider: "CNINFO",
        kind: "filing",
      },
    });
  }

  return candidates
    .sort((left, right) => {
      const priorityOrder = right.priority - left.priority;
      if (priorityOrder) return priorityOrder;
      const dateOrder = right.candidate.publishedAt.localeCompare(
        left.candidate.publishedAt,
      );
      return dateOrder || left.candidate.id.localeCompare(right.candidate.id);
    })
    .slice(0, Math.max(0, Math.min(limit, 20)))
    .map(({ candidate }) => candidate);
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

export function mergeMaterialCandidatesInOrder(
  groups: MaterialCandidate[][],
  limit = 12,
) {
  const bySource = new Map<string, MaterialCandidate>();
  for (const candidate of groups.flat()) {
    const key = canonicalEvidenceSource(candidate.sourceUrl);
    if (!bySource.has(key)) bySource.set(key, candidate);
  }
  return Array.from(bySource.values()).slice(
    0,
    Math.max(0, Math.min(limit, 20)),
  );
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
    ((value.provider === "CNINFO" && value.kind === "filing") ||
      (value.provider === "Yahoo Finance" && value.kind === "news"))
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
    group:
      candidate.kind === "filing"
        ? "Official filing"
        : "External estimate",
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
