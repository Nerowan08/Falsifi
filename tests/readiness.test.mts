import assert from "node:assert/strict";
import test from "node:test";

import { DEMO_CASE } from "../lib/demo.ts";
import { assessResearchReadiness } from "../lib/readiness.ts";

test("a market-style case with no manual research is context only", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.researchPlan = {
    purpose: "new-research",
    thesisConfirmed: false,
    invalidationCriteria: "",
    nextReviewDate: "",
  };
  thesisCase.evidence = thesisCase.evidence.map((item) => ({
    ...item,
    group: "Market data",
    originId: "one-market-series",
    relation: "derived",
  }));

  const readiness = assessResearchReadiness(thesisCase);

  assert.equal(readiness.status, "market-context");
  assert.equal(readiness.completedCount, 0);
  assert.equal(readiness.nextAction, "define-case");
});

test("readiness requires a defined case, primary source, challenge, diversity, and review date", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.researchPlan = {
    purpose: "holding-review",
    thesisConfirmed: true,
    invalidationCriteria:
      "Reassess if organic revenue growth remains below 8% for two quarters.",
    nextReviewDate: "2026-09-30",
  };
  thesisCase.evidence = thesisCase.evidence.map((item, index) => ({
    ...item,
    relation: "direct",
    originId: `source-${index}`,
  }));

  const readiness = assessResearchReadiness(thesisCase);

  assert.equal(readiness.status, "reviewable");
  assert.equal(readiness.completedCount, readiness.totalCount);
  assert.equal(readiness.nextAction, null);
});

test("duplicating one market source does not satisfy source diversity", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.researchPlan = {
    purpose: "watchlist",
    thesisConfirmed: true,
    invalidationCriteria: "Reassess if the stated growth driver fails.",
    nextReviewDate: "2026-09-30",
  };
  thesisCase.evidence = thesisCase.evidence.map((item) => ({
    ...item,
    group: "Market data",
    originId: "same-source",
    relation: "direct",
  }));

  const readiness = assessResearchReadiness(thesisCase);
  const sourceCheck = readiness.checks.find(
    (check) => check.id === "source-diversity",
  );

  assert.equal(sourceCheck?.complete, false);
  assert.equal(readiness.relatedGroupCount, 1);
});

test("a self-labelled filing only satisfies the primary-source check after original review", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.researchPlan = {
    purpose: "new-research",
    thesisConfirmed: true,
    invalidationCriteria:
      "Reassess if the disclosed revenue driver does not materialize.",
    nextReviewDate: "2026-09-30",
  };
  thesisCase.evidence = [
    {
      ...thesisCase.evidence[0],
      id: "claimed-filing",
      group: "Official filing",
      reliability: 0.75,
      verification: "reviewed",
      relation: "direct",
    },
  ];

  const readiness = assessResearchReadiness(thesisCase);
  const primary = readiness.checks.find(
    (check) => check.id === "primary-source",
  );

  assert.equal(primary?.complete, false);
  assert.equal(readiness.primarySourceCount, 0);

  thesisCase.evidence[0].verification = "original";
  assert.equal(
    assessResearchReadiness(thesisCase).primarySourceCount,
    1,
  );
});

test("a review date before the case update date is incomplete", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.lastUpdated = "2026-10-01T12:00:00.000Z";
  thesisCase.researchPlan = {
    purpose: "holding-review",
    thesisConfirmed: true,
    invalidationCriteria:
      "Reassess if organic revenue growth remains below 8%.",
    nextReviewDate: "2026-09-30",
  };

  const readiness = assessResearchReadiness(thesisCase);
  const reviewDate = readiness.checks.find(
    (check) => check.id === "review-date",
  );

  assert.equal(reviewDate?.complete, false);
});

test("manual items with the same canonical URL never satisfy source diversity", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.researchPlan = {
    purpose: "watchlist",
    thesisConfirmed: true,
    invalidationCriteria:
      "Reassess if the stated expansion driver is withdrawn.",
    nextReviewDate: "2026-09-30",
  };
  thesisCase.evidence = thesisCase.evidence.slice(0, 4).map(
    (item, index) => ({
      ...item,
      id: `manual-${index}`,
      sourceUrl:
        index % 2
          ? "https://www.example.com/report/?utm_source=feed"
          : "https://example.com/report",
      originId: `user-label-${index}`,
      relation: "direct" as const,
      reliability: 1,
    }),
  );

  const readiness = assessResearchReadiness(thesisCase);
  const diversity = readiness.checks.find(
    (check) => check.id === "source-diversity",
  );

  assert.equal(readiness.relatedGroupCount, 1);
  assert.equal(diversity?.complete, false);
});

test("two verified source groups satisfy the minimum diversity check", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.researchPlan = {
    purpose: "watchlist",
    thesisConfirmed: true,
    invalidationCriteria:
      "Reassess if the stated expansion driver is withdrawn.",
    nextReviewDate: "2026-09-30",
  };
  thesisCase.evidence = thesisCase.evidence.slice(0, 2).map(
    (item, index) => ({
      ...item,
      id: `manual-${index}`,
      sourceUrl: `https://source-${index + 1}.example/report`,
      originId: `source-${index + 1}`,
      claimId: `claim-${index + 1}`,
      dependsOnIds: [],
      relation: "direct" as const,
      reliability: 1,
    }),
  );

  const readiness = assessResearchReadiness(thesisCase);
  const diversity = readiness.checks.find(
    (check) => check.id === "source-diversity",
  );

  assert.equal(readiness.relatedGroupCount, 2);
  assert.equal(diversity?.complete, true);
});

test("an unverified challenge cannot make a case reviewable", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.researchPlan = {
    purpose: "watchlist",
    thesisConfirmed: true,
    invalidationCriteria:
      "Reassess if the stated expansion driver is withdrawn.",
    nextReviewDate: "2026-09-30",
  };
  thesisCase.evidence = [
    {
      ...thesisCase.evidence[0],
      id: "original",
      sourceUrl: "https://issuer.example/filing",
      originId: "issuer-filing",
      direction: "supports",
      group: "Official filing",
      relation: "direct",
      verification: "original",
    },
    {
      ...thesisCase.evidence[4],
      id: "unverified-challenge",
      sourceUrl: "https://research.example/challenge",
      originId: "research-challenge",
      direction: "contradicts",
      group: "External estimate",
      relation: "direct",
      verification: "unverified",
    },
  ];

  const readiness = assessResearchReadiness(thesisCase);
  const counter = readiness.checks.find(
    (check) => check.id === "counter-evidence",
  );
  const diversity = readiness.checks.find(
    (check) => check.id === "source-diversity",
  );

  assert.equal(counter?.complete, false);
  assert.equal(diversity?.complete, false);
  assert.notEqual(readiness.status, "reviewable");
});

test("legacy automatic market items never become manual evidence", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.marketSnapshot = {
    provider: "Example",
    symbol: thesisCase.ticker,
    name: thesisCase.company,
    exchange: "NMS",
    currency: "USD",
    instrumentType: "EQUITY",
    price: 100,
    previousClose: 99,
    change: 1,
    changePercent: 1.01,
    marketTime: "2026-07-29T20:00:00.000Z",
    fetchedAt: "2026-07-29T20:01:00.000Z",
    sourceUrl: "https://finance.example/chart",
    history: [],
    metrics: {
      dayReturn: 1,
      monthReturn: 2,
      quarterReturn: 3,
      yearReturn: 4,
      annualizedVolatility: 20,
      maxDrawdown: -10,
      rsi14: 50,
      sma20: 100,
      sma50: 98,
      sma200: 90,
      distanceFromSma200: 11.1,
      high52Week: 110,
      low52Week: 80,
      volumeRatio20: 1,
    },
  };
  thesisCase.researchPlan = {
    purpose: "watchlist",
    thesisConfirmed: true,
    invalidationCriteria:
      "Reassess if the stated expansion driver is withdrawn.",
    nextReviewDate: "2026-09-30",
  };
  thesisCase.evidence = [
    {
      ...thesisCase.evidence[0],
      id: "manual-filing",
      sourceUrl: "https://issuer.example/filing",
      originId: "issuer-filing",
      group: "Official filing",
      direction: "supports",
      relation: "direct",
      verification: "original",
      provenance: "user",
    },
    ...thesisCase.evidence.slice(0, 4).map((item, index) => ({
      ...item,
      id: `market-legacy-${index}`,
      sourceUrl: thesisCase.marketSnapshot!.sourceUrl,
      originId: undefined,
      relation: undefined,
      provenance: undefined,
      verification: undefined,
      group: "Market data" as const,
      direction: index === 0 ? ("contradicts" as const) : item.direction,
    })),
  ];

  const readiness = assessResearchReadiness(thesisCase);

  assert.equal(readiness.manualEvidenceCount, 1);
  assert.equal(readiness.counterEvidenceCount, 0);
  assert.notEqual(readiness.status, "reviewable");
});
