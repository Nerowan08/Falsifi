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
