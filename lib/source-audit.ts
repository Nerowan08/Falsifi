import {
  buildSourceGroups,
  canonicalEvidenceSource,
  isUserAddedEvidence,
  type EvidenceItem,
  type ThesisCase,
} from "./falsifi.ts";
import { signatureSimilarity } from "./web-material.ts";

export type SourceSuggestionReason =
  | "near-identical-title"
  | "same-event"
  | "filing-follow-up"
  | "shared-original-link"
  | "direct-citation"
  | "content-overlap";

export type SourceSuggestion = {
  id: string;
  primaryId: string;
  relatedId: string;
  confidence: "high" | "medium";
  reason: SourceSuggestionReason;
  similarity: number;
  dayGap: number;
  sharedEvent?: string;
  sharedSourceUrl?: string;
};

export type SourceAuditResult = {
  materials: EvidenceItem[];
  confirmedGroupCount: number;
  duplicateMaterialCount: number;
  unverifiedCount: number;
  suggestions: SourceSuggestion[];
};

const EVENT_PATTERNS: Array<[string, RegExp]> = [
  ["earnings", /(?:业绩|盈利|利润|营收|收入|年报|半年报|季报|季度报告|earnings|revenue|profit|results|guidance)/iu],
  ["repurchase", /(?:回购|buyback|repurchase)/iu],
  ["dividend", /(?:分红|派息|股息|dividend)/iu],
  ["acquisition", /(?:收购|并购|出售资产|acquisition|merger|takeover)/iu],
  ["investigation", /(?:立案|调查|处罚|问询|investigation|probe|penalty)/iu],
  ["litigation", /(?:诉讼|仲裁|litigation|lawsuit|arbitration)/iu],
  ["contract", /(?:合同|中标|订单|contract|order win|tender)/iu],
  ["financing", /(?:增发|配股|可转债|发行|融资|offering|convertible|financing)/iu],
  ["management", /(?:董事长|董事|高管|首席执行官|ceo|cfo|chairman|director)/iu],
];

const LATIN_STOP_WORDS = new Set([
  "about", "after", "announces", "company", "corp", "corporation",
  "from", "group", "holdings", "inc", "limited", "ltd", "news",
  "report", "reports", "says", "shares", "stock", "the", "with",
]);

const normalizeTitle = (value: string) =>
  value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/<[^>]*>/gu, " ")
    .replace(/[\p{P}\p{S}\s]+/gu, " ")
    .trim();

function titleTokens(title: string) {
  const normalized = normalizeTitle(title);
  const tokens = normalized
    .split(/\s+/u)
    .filter((token) => token.length > 1 && !LATIN_STOP_WORDS.has(token));
  const compactCjk = Array.from(
    normalized.replace(/[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu, ""),
  );
  for (let index = 0; index < compactCjk.length - 1; index += 1) {
    tokens.push(`${compactCjk[index]}${compactCjk[index + 1]}`);
  }
  return new Set(tokens);
}

function diceSimilarity(left: string, right: string) {
  const leftTokens = titleTokens(left);
  const rightTokens = titleTokens(right);
  if (!leftTokens.size || !rightTokens.size) return 0;
  let intersection = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1;
  }
  return (2 * intersection) / (leftTokens.size + rightTokens.size);
}

const dayGap = (left: EvidenceItem, right: EvidenceItem) => {
  const leftTime = Date.parse(left.asOf);
  const rightTime = Date.parse(right.asOf);
  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) return 999;
  return Math.abs(leftTime - rightTime) / 86_400_000;
};

function sharedEvent(left: string, right: string) {
  return EVENT_PATTERNS.find(
    ([, pattern]) => pattern.test(left) && pattern.test(right),
  )?.[0];
}

function confirmedGroupByItem(thesisCase: ThesisCase) {
  const groups = buildSourceGroups(thesisCase);
  const byItem = new Map<string, string>();
  for (const group of groups) {
    for (const id of group.evidenceIds) byItem.set(id, group.id);
  }
  return { groups, byItem };
}

function preferredPrimary(left: EvidenceItem, right: EvidenceItem) {
  if (left.group === "Official filing" && right.group !== "Official filing") {
    return [left, right] as const;
  }
  if (right.group === "Official filing" && left.group !== "Official filing") {
    return [right, left] as const;
  }
  return left.asOf <= right.asOf
    ? ([left, right] as const)
    : ([right, left] as const);
}

const sourceKey = (value: string) => canonicalEvidenceSource(value);

function extractedUrls(item: EvidenceItem) {
  const urls = [item.sourceUrl, item.extraction?.finalUrl, item.extraction?.canonicalUrl]
    .filter((value): value is string => Boolean(value))
    .map(sourceKey);
  return new Set(urls);
}

function directCitation(citing: EvidenceItem, cited: EvidenceItem) {
  const targets = extractedUrls(cited);
  return citing.extraction?.sourceLinks.find((url) => targets.has(sourceKey(url)))
    ?? citing.extraction?.outboundUrls.find((url) => targets.has(sourceKey(url)));
}

function sharedOriginalLink(left: EvidenceItem, right: EvidenceItem) {
  const rightSources = new Set((right.extraction?.sourceLinks ?? []).map(sourceKey));
  return left.extraction?.sourceLinks.find((url) => rightSources.has(sourceKey(url)));
}

export function suggestSourceRelationships(
  thesisCase: ThesisCase,
): SourceSuggestion[] {
  const materials = thesisCase.evidence.filter((item) =>
    isUserAddedEvidence(thesisCase, item),
  );
  const { byItem } = confirmedGroupByItem({ ...thesisCase, evidence: materials });
  const suggestions: SourceSuggestion[] = [];

  for (let leftIndex = 0; leftIndex < materials.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < materials.length; rightIndex += 1) {
      const left = materials[leftIndex];
      const right = materials[rightIndex];
      if (byItem.get(left.id) === byItem.get(right.id)) continue;

      const similarity = diceSimilarity(left.title, right.title);
      const gap = dayGap(left, right);
      const event = sharedEvent(left.title, right.title);
      const hasOfficial =
        left.group === "Official filing" || right.group === "Official filing";
      const leftCitesRight = directCitation(left, right);
      const rightCitesLeft = directCitation(right, left);
      const commonSource = sharedOriginalLink(left, right);
      const contentOverlap = signatureSimilarity(
        left.extraction?.signature ?? [],
        right.extraction?.signature ?? [],
      );
      let reason: SourceSuggestionReason | null = null;
      let confidence: "high" | "medium" = "medium";
      let selectedPrimary: EvidenceItem | undefined;
      let selectedRelated: EvidenceItem | undefined;

      if (leftCitesRight) {
        reason = "direct-citation";
        confidence = "high";
        selectedPrimary = right;
        selectedRelated = left;
      } else if (rightCitesLeft) {
        reason = "direct-citation";
        confidence = "high";
        selectedPrimary = left;
        selectedRelated = right;
      } else if (commonSource) {
        reason = "shared-original-link";
        confidence = "high";
      } else if (contentOverlap >= 0.82) {
        reason = "content-overlap";
        confidence = "high";
      } else if (contentOverlap >= 0.62 && gap <= 14) {
        reason = "content-overlap";
      } else if (similarity >= 0.78 && gap <= 14) {
        reason = "near-identical-title";
        confidence = similarity >= 0.9 ? "high" : "medium";
      } else if (event && hasOfficial && gap <= 3 && similarity >= 0.18) {
        reason = "filing-follow-up";
      } else if (event && gap <= 2 && similarity >= 0.42) {
        reason = "same-event";
      }
      if (!reason) continue;

      const [primary, related] = selectedPrimary && selectedRelated
        ? [selectedPrimary, selectedRelated]
        : preferredPrimary(left, right);
      suggestions.push({
        id: [primary.id, related.id].sort().join("::"),
        primaryId: primary.id,
        relatedId: related.id,
        confidence,
        reason,
        similarity: Math.max(similarity, contentOverlap),
        dayGap: gap,
        sharedEvent: event,
        sharedSourceUrl: leftCitesRight ?? rightCitesLeft ?? commonSource,
      });
    }
  }

  return suggestions.sort((left, right) => {
    const confidence = Number(right.confidence === "high") - Number(left.confidence === "high");
    return confidence || right.similarity - left.similarity || left.id.localeCompare(right.id);
  });
}

export function auditSources(thesisCase: ThesisCase): SourceAuditResult {
  const materials = thesisCase.evidence.filter((item) =>
    isUserAddedEvidence(thesisCase, item),
  );
  const manualCase = { ...thesisCase, evidence: materials };
  const { groups } = confirmedGroupByItem(manualCase);
  return {
    materials,
    confirmedGroupCount: groups.length,
    duplicateMaterialCount: groups.reduce(
      (count, group) => count + Math.max(0, group.evidenceIds.length - 1),
      0,
    ),
    unverifiedCount: materials.filter(
      (item) => (item.verification ?? "unverified") === "unverified",
    ).length,
    suggestions: suggestSourceRelationships(manualCase),
  };
}
