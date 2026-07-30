import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import { DEMO_CASE } from "../lib/demo.ts";
import {
  MAX_JOINT_FLIP_STATES,
  auditEvidenceIndependence,
  canonicalStringify,
  compareEvidenceStressSemantics,
  findAssumptionFlip,
  findJointFlipFrontier,
  findMinimumIndependentFlip,
  findMinimumFlipSet,
  getPosture,
  isThesisCase,
  runStressTest,
  scoreCase,
  sha256,
} from "../lib/falsifi.ts";

test("the synthetic case reproduces its documented baseline", () => {
  const score = scoreCase(DEMO_CASE);
  assert.ok(Math.abs(score - 67.642) < 0.001);
  assert.equal(getPosture(DEMO_CASE, score), "Constructive");
});

test("the smallest evidence flip requires two items", () => {
  const flipSet = findMinimumFlipSet(DEMO_CASE);
  assert.equal(flipSet.length, 2);

  const scoreAfterRemoval = scoreCase(
    DEMO_CASE,
    flipSet.map((item) => item.id),
  );
  assert.equal(getPosture(DEMO_CASE, scoreAfterRemoval), "Balanced");
});

test("the nearest assumption cliff is a 2.6pp growth reduction", () => {
  const flip = findAssumptionFlip(DEMO_CASE);
  assert.ok(flip);
  assert.equal(flip.assumptionId, "growth");
  assert.ok(Math.abs(flip.delta - -2.6) < 0.001);
  assert.equal(flip.resultingPosture, "Balanced");
});

test("the published stability metric is deterministic", () => {
  const result = runStressTest(DEMO_CASE);
  assert.equal(result.stabilityScore, 68);
  assert.equal(result.minimumFlipSet.length, 2);
  assert.ok(result.ablations[0].delta !== 0);
  assert.equal(result.independenceAudit.independentRootCount, 3);
  assert.equal(result.minimumIndependentFlip.found, true);
  assert.equal(result.jointFlipFrontier.points.length, 5);
  assert.equal(result.evidenceStress.degradeFactor, 0.5);
});

test("a case with no enabled evidence gets no evidence-buffer credit", () => {
  const emptyEvidenceCase = structuredClone(DEMO_CASE);
  emptyEvidenceCase.baseScore = 50;
  emptyEvidenceCase.evidence.forEach((item) => {
    item.enabled = false;
  });
  emptyEvidenceCase.assumptions.forEach((item) => {
    item.value = item.baseline;
    item.impactPerUnit = 0;
  });

  const result = runStressTest(emptyEvidenceCase);

  assert.equal(result.minimumFlipSet.length, 0);
  assert.equal(result.assumptionFlip, null);
  assert.equal(result.stabilityScore, 59);
});

test("the independence audit clusters shared provenance deterministically", () => {
  const audit = auditEvidenceIndependence(DEMO_CASE);
  const repeated = auditEvidenceIndependence(DEMO_CASE);

  assert.deepEqual(audit, repeated);
  assert.equal(audit.enabledEvidenceCount, 8);
  assert.equal(audit.independentRootCount, 3);
  assert.equal(audit.duplicateCount, 5);
  assert.equal(audit.declaredDuplicateCount, 0);
  assert.ok(Math.abs(audit.maximumRootShare - 0.9256783327) < 1e-9);
  assert.ok(Math.abs(audit.concentrationHhi - 0.8596763277) < 1e-9);
  assert.equal(audit.directionConflicts.length, 1);
  assert.deepEqual(audit.directionConflicts[0].directions, [
    "supports",
    "contradicts",
  ]);
  assert.equal(audit.staleCount, 0);
  assert.deepEqual(
    audit.sourceShocks.map((shock) => shock.group),
    [
      "Official filing",
      "Management",
      "Market data",
      "External estimate",
    ],
  );
  assert.ok(
    audit.sourceShocks.every((shock) => shock.evidenceCount === 2),
  );
});

test("staleness is measured against the case timestamp, not the wall clock", () => {
  const staleCase = structuredClone(DEMO_CASE);
  staleCase.evidence[0].asOf = "2026-01-01";
  const audit = auditEvidenceIndependence(staleCase);

  assert.equal(audit.staleAfterDays, 90);
  assert.equal(audit.staleCount, 1);
  assert.deepEqual(audit.staleEvidenceIds, ["ev-sec-revenue"]);
});

test("the independent flip removes a whole provenance root", () => {
  const result = findMinimumIndependentFlip(DEMO_CASE);

  assert.equal(result.found, true);
  assert.equal(result.exact, true);
  assert.equal(result.exhaustive, true);
  assert.equal(result.totalRoots, 3);
  assert.equal(result.searchedThroughRootCount, 1);
  assert.deepEqual(result.rootIds, ["ev-capex"]);
  assert.equal(result.evidence.length, 6);
  assert.equal(result.resultingPosture, "Balanced");
  assert.ok(
    Math.abs((result.resultingScore ?? Number.NaN) - 57.79) < 0.001,
  );
});

test("an absent independent flip states the four-root search boundary", () => {
  const boundedCase = structuredClone(DEMO_CASE);
  boundedCase.baseScore = 80;
  boundedCase.evidence.forEach((item) => {
    item.impact = 0.1;
    delete item.originId;
    delete item.claimId;
    delete item.dependsOnIds;
    delete item.relation;
  });

  const result = findMinimumIndependentFlip(boundedCase);
  assert.equal(result.found, false);
  assert.equal(result.exact, false);
  assert.equal(result.exhaustive, false);
  assert.equal(result.totalRoots, 8);
  assert.equal(result.searchedThroughRootCount, 4);
  assert.equal(result.combinationsEvaluated, 162);
});

test("the joint flip frontier finds reproducible two-variable paths", () => {
  const result = findJointFlipFrontier(DEMO_CASE);
  const repeated = findJointFlipFrontier(DEMO_CASE);

  assert.deepEqual(result, repeated);
  assert.equal(result.exact, true);
  assert.equal(result.evaluatedStates, result.plannedStates);
  assert.equal(result.evaluatedStates, 14_626);
  assert.equal(result.totalPairs, 6);
  assert.equal(result.pairsEvaluated, 6);
  assert.equal(result.points.length, 5);
  assert.deepEqual(result.points[0].assumptionIds, [
    "growth",
    "operating-leverage",
  ]);
  assert.deepEqual(result.points[0].deltas, [-2.4, -1]);
  assert.equal(result.points[0].requiresBoth, true);
  assert.equal(result.points[0].resultingPosture, "Balanced");
});

test("dense joint grids respect the 100k hard state budget", () => {
  const denseCase = structuredClone(DEMO_CASE);
  denseCase.assumptions = [
    {
      id: "dense-a",
      label: "Dense A",
      value: 0,
      baseline: 0,
      min: -2,
      max: 2,
      step: 0.005,
      unit: "x",
      impactPerUnit: 5,
      direction: 1,
      typicalShock: 1,
    },
    {
      id: "dense-b",
      label: "Dense B",
      value: 0,
      baseline: 0,
      min: -2,
      max: 2,
      step: 0.005,
      unit: "x",
      impactPerUnit: 5,
      direction: 1,
      typicalShock: 1,
    },
  ];

  const result = findJointFlipFrontier(denseCase);
  assert.equal(result.exact, false);
  assert.ok(result.plannedStates > MAX_JOINT_FLIP_STATES);
  assert.ok(result.evaluatedStates <= MAX_JOINT_FLIP_STATES);
  assert.equal(result.totalPairs, 1);
  assert.equal(result.pairsEvaluated, 1);
  assert.ok(result.resolutionStride > 1);
});

test("remove, degrade, and contradict have distinct stress semantics", () => {
  const comparison = compareEvidenceStressSemantics(DEMO_CASE);
  const { remove, degrade, contradict } = comparison.outcomes;

  assert.deepEqual(comparison.evidenceIds, [
    "ev-retention",
    "ev-rpo",
  ]);
  assert.equal(remove.flipsPosture, true);
  assert.equal(degrade.flipsPosture, false);
  assert.equal(contradict.flipsPosture, true);
  assert.ok(contradict.score < remove.score);
  assert.ok(remove.score < degrade.score);
  assert.ok(degrade.score < scoreCase(DEMO_CASE));
  assert.ok(Math.abs(remove.delta - 2 * degrade.delta) < 1e-9);
  assert.ok(Math.abs(contradict.delta - 2 * remove.delta) < 1e-9);
});

test("canonical JSON does not depend on object key order", () => {
  assert.equal(
    canonicalStringify({ beta: 2, alpha: { y: 2, x: 1 } }),
    canonicalStringify({ alpha: { x: 1, y: 2 }, beta: 2 }),
  );
});

test("canonical JSON follows JSON semantics for undefined values", async () => {
  const withOptionalFields = {
    alpha: 1,
    omitted: undefined,
    values: [1, undefined, 3],
  };
  const afterJsonRoundTrip = JSON.parse(JSON.stringify(withOptionalFields));

  assert.equal(
    canonicalStringify(withOptionalFields),
    canonicalStringify(afterJsonRoundTrip),
  );
  assert.equal(
    await sha256(withOptionalFields),
    await sha256(afterJsonRoundTrip),
  );
});

test("snapshot fingerprints are real SHA-256 digests", async () => {
  const expected = createHash("sha256")
    .update(canonicalStringify(DEMO_CASE))
    .digest("hex");
  assert.equal(await sha256(DEMO_CASE), expected);
});

test("the import guard rejects incomplete files", () => {
  assert.equal(isThesisCase(DEMO_CASE), true);
  assert.equal(isThesisCase({ ticker: "NSTR" }), false);
  assert.equal(isThesisCase(null), false);
});

test("the import guard blocks unsafe or non-terminating cases", () => {
  const noAssumptions = structuredClone(DEMO_CASE);
  noAssumptions.assumptions = [];
  assert.equal(isThesisCase(noAssumptions), false);

  const zeroStep = structuredClone(DEMO_CASE);
  zeroStep.assumptions[0].step = 0;
  assert.equal(isThesisCase(zeroStep), false);

  const unsafeSource = structuredClone(DEMO_CASE);
  unsafeSource.evidence[0].sourceUrl = "javascript:alert(1)";
  assert.equal(isThesisCase(unsafeSource), false);

  const danglingDependency = structuredClone(DEMO_CASE);
  danglingDependency.evidence[0].dependsOnIds = ["missing-evidence"];
  assert.equal(isThesisCase(danglingDependency), false);
});

test("schema version 1 cases without provenance metadata remain valid", () => {
  const legacyCase = structuredClone(DEMO_CASE);
  legacyCase.modelVersion = "Falsifi 0.2.0";
  legacyCase.evidence.forEach((item) => {
    delete item.originId;
    delete item.claimId;
    delete item.dependsOnIds;
    delete item.relation;
  });

  assert.equal(legacyCase.schemaVersion, 1);
  assert.equal(isThesisCase(legacyCase), true);
  const audit = auditEvidenceIndependence(legacyCase);
  assert.equal(audit.independentRootCount, legacyCase.evidence.length);
  assert.equal(audit.duplicateCount, 0);
});

test("the starter case exposes an assumption-only flip", () => {
  const starter = JSON.parse(
    readFileSync(
      new URL("../examples/case-template.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(isThesisCase(starter), true);

  const result = runStressTest(starter);
  assert.equal(result.minimumFlipSet.length, 0);
  assert.ok(result.assumptionFlip);
});
