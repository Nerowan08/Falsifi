import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalEvidenceSource,
  isThesisCase,
  runStressTest,
} from "../lib/falsifi.ts";
import {
  isCandidateAlreadyAdded,
  isMaterialCandidate,
  materialCandidateToEvidence,
  mergeMaterialCandidates,
  mergeMaterialCandidatesInOrder,
  parseCninfoMaterialCandidates,
  parseYahooMaterialCandidates,
} from "../lib/materials.ts";
import { buildResearchCase } from "../lib/market.ts";

const now = Math.floor(Date.now() / 1_000) - 60;

const payload = {
  news: [
    {
      uuid: "relevant-one",
      title: "Apple reports quarterly results",
      publisher: "Example News",
      link: "https://example.com/apple-results?utm_source=feed",
      providerPublishTime: now,
      type: "STORY",
      relatedTickers: ["AAPL"],
    },
    {
      uuid: "same-url",
      title: "Apple reports quarterly results",
      publisher: "Example News",
      link: "https://example.com/apple-results",
      providerPublishTime: now - 1,
      type: "STORY",
      relatedTickers: ["AAPL"],
    },
    {
      uuid: "name-match",
      title: "Apple opens a new research center",
      publisher: "Another Publisher",
      link: "https://another.example/apple-center",
      providerPublishTime: now - 2,
      type: "STORY",
      relatedTickers: [],
    },
    {
      uuid: "wrong-company",
      title: "Amazon reports quarterly results",
      publisher: "Example News",
      link: "https://example.com/amazon-results",
      providerPublishTime: now - 3,
      type: "STORY",
      relatedTickers: ["AMZN"],
    },
    {
      uuid: "bad-url",
      title: "Apple item with an invalid link",
      publisher: "Example News",
      link: "javascript:alert(1)",
      providerPublishTime: now - 4,
      type: "STORY",
      relatedTickers: ["AAPL"],
    },
    {
      uuid: "bad-time",
      title: "Apple item without a usable publication date",
      publisher: "Example News",
      link: "https://example.com/bad-time",
      providerPublishTime: "today",
      type: "STORY",
      relatedTickers: ["AAPL"],
    },
  ],
};

test("parses relevant public-source candidates conservatively", () => {
  const candidates = parseYahooMaterialCandidates(payload, {
    symbol: "AAPL",
    companyName: "Apple Inc.",
  });

  assert.equal(candidates.length, 2);
  assert.deepEqual(
    candidates.map((candidate) => candidate.id),
    ["yahoo:relevant-one", "yahoo:name-match"],
  );
  assert.equal(
    canonicalEvidenceSource(candidates[0].sourceUrl),
    "https://example.com/apple-results",
  );
});

test("keeps same-title pages when their source URLs differ", () => {
  const candidates = parseYahooMaterialCandidates(
    {
      news: [
        {
          uuid: "one",
          title: "Apple result",
          publisher: "Publisher A",
          link: "https://a.example/result",
          providerPublishTime: now,
          relatedTickers: ["AAPL"],
        },
        {
          uuid: "two",
          title: "Apple result",
          publisher: "Publisher B",
          link: "https://b.example/result",
          providerPublishTime: now,
          relatedTickers: ["AAPL"],
        },
      ],
    },
    {
      symbol: "AAPL",
      companyName: "Apple Inc.",
    },
  );

  assert.equal(candidates.length, 2);
});

test("merges provider results by canonical URL and orders newest first", () => {
  const first = parseYahooMaterialCandidates(payload, {
    symbol: "AAPL",
    companyName: "Apple Inc.",
  });
  const merged = mergeMaterialCandidates([first, [...first].reverse()]);

  assert.equal(merged.length, first.length);
  assert.deepEqual(
    merged.map((candidate) => candidate.id),
    first.map((candidate) => candidate.id),
  );
});

test("accepted search results remain unverified and unclassified", () => {
  const candidate = parseYahooMaterialCandidates(payload, {
    symbol: "AAPL",
    companyName: "Apple Inc.",
  })[0];
  assert.ok(candidate);

  const item = materialCandidateToEvidence(candidate, "found-one");
  const thesisCase = buildResearchCase(
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      exchange: "NMS",
      exchangeName: "Nasdaq",
      type: "EQUITY",
      region: "us",
    },
    "en",
  );
  const baselineScore = runStressTest(thesisCase).score;
  thesisCase.evidence.push(item);

  assert.equal(item.verification, "unverified");
  assert.equal(item.direction, "unclassified");
  assert.equal(item.provenance, "user");
  assert.equal(isThesisCase(thesisCase), true);
  assert.equal(runStressTest(thesisCase).score, baselineScore);
});

test("detects a candidate whose canonical URL is already recorded", () => {
  const candidate = parseYahooMaterialCandidates(payload, {
    symbol: "AAPL",
    companyName: "Apple Inc.",
  })[0];
  assert.ok(candidate);
  const item = materialCandidateToEvidence(candidate, "found-one");
  item.sourceUrl = "https://example.com/apple-results?utm_medium=email";

  assert.equal(isCandidateAlreadyAdded(candidate, [item]), true);
});

test("parses exact-ticker CNINFO filings and rejects other companies", () => {
  const candidates = parseCninfoMaterialCandidates(
    {
      announcements: [
        {
          announcementId: "1225374133",
          announcementTitle: "2025年度权益分派实施公告",
          announcementTime: Date.UTC(2026, 5, 17),
          adjunctUrl: "finalpage/2026-06-17/1225374133.PDF",
          secCode: "002441",
          secName: "众业达",
        },
        {
          announcementId: "wrong-company",
          announcementTitle: "年度报告",
          announcementTime: Date.UTC(2026, 4, 1),
          adjunctUrl: "finalpage/2026-05-01/9999999999.PDF",
          secCode: "000001",
          secName: "平安银行",
        },
        {
          announcementId: "unsafe-link",
          announcementTitle: "2025年年度报告",
          announcementTime: Date.UTC(2026, 3, 18),
          adjunctUrl: "https://evil.example/redirect.PDF",
          secCode: "002441",
          secName: "众业达",
        },
      ],
    },
    {
      symbol: "002441.SZ",
      companyName: "众业达",
    },
  );

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].provider, "CNINFO");
  assert.equal(candidates[0].kind, "filing");
  assert.equal(candidates[0].publisher, "巨潮资讯");
  assert.equal(candidates[0].publishedAt, "2026-06-17");
  assert.equal(
    candidates[0].sourceUrl,
    "https://static.cninfo.com.cn/finalpage/2026-06-17/1225374133.PDF",
  );
  assert.match(candidates[0].title, /众业达/);
  assert.equal(isMaterialCandidate(candidates[0]), true);
});

test("prioritizes financial reports in CNINFO results", () => {
  const candidates = parseCninfoMaterialCandidates(
    {
      announcements: [
        {
          announcementId: "new-rules",
          announcementTitle: "董事会秘书工作细则",
          announcementTime: Date.UTC(2026, 6, 1),
          adjunctUrl: "finalpage/2026-07-01/1000000001.PDF",
          secCode: "002441",
          secName: "众业达",
        },
        {
          announcementId: "earnings-increase",
          announcementTitle: "2026年半年度业绩预增公告",
          announcementTime: Date.UTC(2026, 5, 30),
          adjunctUrl: "finalpage/2026-07-01/1000000003.PDF",
          secCode: "002441",
          secName: "众业达",
        },
        {
          announcementId: "annual-report",
          announcementTitle: "2025年年度报告",
          announcementTime: Date.UTC(2026, 3, 18),
          adjunctUrl: "finalpage/2026-04-18/1000000002.PDF",
          secCode: "002441",
          secName: "众业达",
        },
      ],
    },
    {
      symbol: "002441.SZ",
      companyName: "众业达",
    },
  );

  assert.equal(candidates[0].id, "cninfo:annual-report");
  assert.equal(candidates[1].id, "cninfo:earnings-increase");
});

test("keeps official filings ahead of supplemental news", () => {
  const filing = parseCninfoMaterialCandidates(
    {
      announcements: [
        {
          announcementId: "filing",
          announcementTitle: "2025年年度报告",
          announcementTime: Date.UTC(2026, 3, 18),
          adjunctUrl: "finalpage/2026-04-18/1000000002.PDF",
          secCode: "002441",
          secName: "众业达",
        },
      ],
    },
    {
      symbol: "002441.SZ",
      companyName: "众业达",
    },
  );
  const news = parseYahooMaterialCandidates(payload, {
    symbol: "AAPL",
    companyName: "Apple Inc.",
  });
  const merged = mergeMaterialCandidatesInOrder([filing, news], 3);

  assert.equal(merged[0].provider, "CNINFO");
  assert.equal(merged.length, 3);
});

test("official filings remain unverified, unclassified, and score-neutral", () => {
  const candidate = parseCninfoMaterialCandidates(
    {
      announcements: [
        {
          announcementId: "annual-report",
          announcementTitle: "2025年年度报告",
          announcementTime: Date.UTC(2026, 3, 18),
          adjunctUrl: "finalpage/2026-04-18/1000000002.PDF",
          secCode: "002441",
          secName: "众业达",
        },
      ],
    },
    {
      symbol: "002441.SZ",
      companyName: "众业达",
    },
  )[0];
  assert.ok(candidate);

  const item = materialCandidateToEvidence(candidate, "cninfo-filing");
  const thesisCase = buildResearchCase(
    {
      symbol: "002441.SZ",
      name: "众业达",
      exchange: "SHZ",
      exchangeName: "Shenzhen",
      type: "EQUITY",
      region: "cn",
    },
    "zh-CN",
  );
  const baselineScore = runStressTest(thesisCase).score;
  thesisCase.evidence.push(item);

  assert.equal(item.group, "Official filing");
  assert.equal(item.verification, "unverified");
  assert.equal(item.direction, "unclassified");
  assert.equal(runStressTest(thesisCase).score, baselineScore);
});

test("rejects unknown material providers and kinds", () => {
  const base = {
    id: "candidate",
    title: "Example",
    publisher: "Example",
    sourceUrl: "https://example.com/source",
    publishedAt: new Date().toISOString(),
    provider: "Unknown",
    kind: "news",
  };

  assert.equal(isMaterialCandidate(base), false);
  assert.equal(
    isMaterialCandidate({
      ...base,
      provider: "CNINFO",
      kind: "opinion",
    }),
    false,
  );
  assert.equal(
    isMaterialCandidate({
      ...base,
      provider: "CNINFO",
      kind: "news",
    }),
    false,
  );
  assert.equal(
    isMaterialCandidate({
      ...base,
      provider: "Yahoo Finance",
      kind: "filing",
    }),
    false,
  );
});
