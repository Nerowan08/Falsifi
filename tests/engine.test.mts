import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import { DEMO_CASE } from "../lib/demo.ts";
import {
  MAX_JOINT_FLIP_STATES,
  auditEvidenceIndependence,
  buildEvidenceRoots,
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

test("the synthetic case reproduces its group-aware baseline", () => {
  const score = scoreCase(DEMO_CASE);
  assert.ok(Math.abs(score - 59.432) < 0.001);
  assert.equal(getPosture(DEMO_CASE, score), "Balanced");
});

test("the smallest item-level evidence flip is deterministic", () => {
  const flipSet = findMinimumFlipSet(DEMO_CASE);
  assert.deepEqual(
    flipSet.map((item) => item.id),
    ["ev-discounting"],
  );

  const scoreAfterRemoval = scoreCase(
    DEMO_CASE,
    flipSet.map((item) => item.id),
  );
  assert.equal(getPosture(DEMO_CASE, scoreAfterRemoval), "Constructive");
});

test("the nearest scenario-input cliff is deterministic", () => {
  const flip = findAssumptionFlip(DEMO_CASE);
  assert.ok(flip);
  assert.equal(flip.assumptionId, "growth");
  assert.ok(Math.abs(flip.delta - 0.4) < 0.001);
  assert.equal(flip.resultingPosture, "Constructive");
});

test("the published stability metric is deterministic", () => {
  const result = runStressTest(DEMO_CASE);
  assert.equal(result.stabilityScore, 16);
  assert.equal(result.minimumFlipSet.length, 1);
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
  assert.equal(result.stabilityScore, 0);
});

test("duplicating evidence in the same declared origin does not inflate score", () => {
  const singleItemCase = structuredClone(DEMO_CASE);
  singleItemCase.baseScore = 50;
  singleItemCase.evidence = [structuredClone(DEMO_CASE.evidence[0])];
  singleItemCase.assumptions.forEach((item) => {
    item.value = item.baseline;
  });
  const singleScore = scoreCase(singleItemCase);

  const duplicate = {
    ...structuredClone(singleItemCase.evidence[0]),
    id: "duplicate-same-origin",
    relation: "duplicate" as const,
  };
  const duplicatedCase = {
    ...singleItemCase,
    evidence: [...singleItemCase.evidence, duplicate],
  };

  assert.equal(scoreCase(duplicatedCase), singleScore);
  assert.equal(scoreCase(duplicatedCase, [duplicate.id]), singleScore);
});

test("duplicating one argument inside a multi-argument group changes nothing", () => {
  const multiArgumentCase = structuredClone(DEMO_CASE);
  multiArgumentCase.baseScore = 50;
  multiArgumentCase.constructiveThreshold = 58;
  multiArgumentCase.cautiousThreshold = 42;
  multiArgumentCase.assumptions.forEach((item) => {
    item.value = item.baseline;
    item.impactPerUnit = 0;
  });
  const template = structuredClone(DEMO_CASE.evidence[0]);
  multiArgumentCase.evidence = [
    {
      ...template,
      id: "argument-trend",
      originId: "same-market-series",
      claimId: "trend",
      impact: 4,
      reliability: 1,
    },
    {
      ...template,
      id: "argument-momentum",
      originId: "same-market-series",
      claimId: "momentum",
      impact: 8,
      reliability: 1,
    },
  ];

  const duplicatedCase = structuredClone(multiArgumentCase);
  const duplicatedArgument = duplicatedCase.evidence[0];
  duplicatedCase.evidence.push(
    ...Array.from({ length: 8 }, (_, index) => ({
      ...structuredClone(duplicatedArgument),
      id: `argument-trend-copy-${index + 1}`,
      relation: "duplicate" as const,
    })),
  );

  const originalRoot = buildEvidenceRoots(multiArgumentCase)[0];
  const duplicatedRoot = buildEvidenceRoots(duplicatedCase)[0];
  const originalResult = runStressTest(multiArgumentCase);
  const duplicatedResult = runStressTest(duplicatedCase);

  assert.equal(originalRoot.netContribution, 6);
  assert.equal(duplicatedRoot.netContribution, 6);
  assert.equal(scoreCase(duplicatedCase), scoreCase(multiArgumentCase));
  assert.equal(
    duplicatedResult.stabilityScore,
    originalResult.stabilityScore,
  );
});

test("evidence exclusions preserve the case's declared group topology", () => {
  const groupedCase = structuredClone(DEMO_CASE);
  groupedCase.baseScore = 50;
  groupedCase.assumptions.forEach((item) => {
    item.value = item.baseline;
  });
  const template = structuredClone(DEMO_CASE.evidence[0]);
  groupedCase.evidence = [
    {
      ...template,
      id: "bridge-a",
      originId: "origin-a",
      claimId: "claim-a",
      impact: 4,
      reliability: 1,
    },
    {
      ...template,
      id: "bridge-b",
      originId: "origin-a",
      claimId: "claim-b",
      impact: 4,
      reliability: 1,
    },
    {
      ...template,
      id: "bridge-c",
      originId: "origin-c",
      claimId: "claim-b",
      impact: 4,
      reliability: 1,
    },
  ];

  assert.equal(scoreCase(groupedCase), 54);
  assert.equal(scoreCase(groupedCase, ["bridge-b"]), 54);
});

test("a one-group assessment flip is reported as clearly fragile", () => {
  const fragileCase = structuredClone(DEMO_CASE);
  fragileCase.baseScore = 50;
  fragileCase.constructiveThreshold = 58;
  fragileCase.cautiousThreshold = 42;
  fragileCase.evidence = [
    {
      ...structuredClone(DEMO_CASE.evidence[0]),
      impact: 9,
      reliability: 1,
      direction: "supports",
    },
  ];
  fragileCase.assumptions.forEach((item) => {
    item.value = item.baseline;
    item.impactPerUnit = 0;
  });

  const result = runStressTest(fragileCase);

  assert.equal(result.posture, "Constructive");
  assert.equal(result.independenceAudit.independentRootCount, 1);
  assert.equal(result.independenceAudit.maximumRootShare, 1);
  assert.equal(result.minimumIndependentFlip.found, true);
  assert.equal(result.minimumIndependentFlip.rootIds.length, 1);
  assert.ok(result.stabilityScore <= 33);
});

test("the independence audit clusters shared provenance deterministically", () => {
  const audit = auditEvidenceIndependence(DEMO_CASE);
  const repeated = auditEvidenceIndependence(DEMO_CASE);

  assert.deepEqual(audit, repeated);
  assert.equal(audit.enabledEvidenceCount, 8);
  assert.equal(audit.independentRootCount, 3);
  assert.equal(audit.duplicateCount, 5);
  assert.equal(audit.declaredDuplicateCount, 0);
  assert.ok(Math.abs(audit.maximumRootShare - 0.4648924122) < 1e-9);
  assert.ok(Math.abs(audit.concentrationHhi - 0.3610625519) < 1e-9);
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

test("the related-group flip removes a whole group", () => {
  const result = findMinimumIndependentFlip(DEMO_CASE);

  assert.equal(result.found, true);
  assert.equal(result.exact, true);
  assert.equal(result.exhaustive, true);
  assert.equal(result.totalRoots, 3);
  assert.equal(result.searchedThroughRootCount, 1);
  assert.deepEqual(result.rootIds, ["ev-latency"]);
  assert.equal(result.evidence.length, 1);
  assert.equal(result.resultingPosture, "Constructive");
  assert.ok(
    Math.abs((result.resultingScore ?? Number.NaN) - 60.482) < 0.001,
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
  assert.deepEqual(result.points[0].deltas, [0.2, 1]);
  assert.equal(result.points[0].requiresBoth, true);
  assert.equal(result.points[0].resultingPosture, "Constructive");
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

  assert.deepEqual(comparison.evidenceIds, ["ev-discounting"]);
  assert.equal(remove.flipsPosture, true);
  assert.equal(degrade.flipsPosture, false);
  assert.equal(contradict.flipsPosture, true);
  assert.ok(contradict.score > remove.score);
  assert.ok(remove.score > degrade.score);
  assert.ok(degrade.score > scoreCase(DEMO_CASE));
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

test("the optional research plan is validated without breaking legacy cases", () => {
  const plannedCase = structuredClone(DEMO_CASE);
  plannedCase.researchPlan = {
    purpose: "holding-review",
    thesisConfirmed: false,
    invalidationCriteria: "",
    nextReviewDate: "",
  };
  assert.equal(isThesisCase(plannedCase), true);

  plannedCase.researchPlan.nextReviewDate = "not-a-date";
  assert.equal(isThesisCase(plannedCase), false);

  delete plannedCase.researchPlan;
  assert.equal(isThesisCase(plannedCase), true);
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
