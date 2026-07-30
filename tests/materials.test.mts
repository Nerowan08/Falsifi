import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalEvidenceSource,
  isThesisCase,
  runStressTest,
} from "../lib/falsifi.ts";
import {
  isCandidateAlreadyAdded,
  materialCandidateToEvidence,
  mergeMaterialCandidates,
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
