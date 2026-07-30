import assert from "node:assert/strict";
import test from "node:test";

import { DEMO_CASE } from "../lib/demo.ts";
import { auditEvidenceStructure } from "../lib/evidence-audit.ts";
import {
  buildSourceGroups,
  canonicalEvidenceSource,
  scoreCase,
} from "../lib/falsifi.ts";

test("canonical source identity removes tracking noise without dropping meaningful parameters", () => {
  assert.equal(
    canonicalEvidenceSource(
      "https://WWW.Example.com/report/?id=42&utm_source=newsletter#page-2",
    ),
    "https://example.com/report?id=42",
  );
});

test("the same canonical URL cannot be split by different user origin labels", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  const template = thesisCase.evidence[0];
  thesisCase.evidence = Array.from({ length: 8 }, (_, index) => ({
    ...template,
    id: `copy-${index}`,
    sourceUrl:
      index % 2
        ? "https://www.example.com/report/?utm_source=feed"
        : "https://example.com/report",
    originId: `claimed-origin-${index}`,
    claimId: undefined,
    relation: "direct" as const,
  }));

  assert.equal(buildSourceGroups(thesisCase).length, 1);
});

test("the primary evidence audit excludes market-derived observations", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.evidence = thesisCase.evidence.map((item) => ({
    ...item,
    relation: "derived" as const,
    group: "Market data" as const,
  }));

  assert.deepEqual(auditEvidenceStructure(thesisCase), {
    materialCount: 0,
    verifiedMaterialCount: 0,
    unverifiedMaterialCount: 0,
    sourceGroupCount: 0,
    relatedMaterialCount: 0,
    supportingGroupCount: 0,
    challengingGroupCount: 0,
    mixedGroupCount: 0,
    groups: [],
  });
});

test("eight repeated materials are reported as one source group", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  const template = thesisCase.evidence[0];
  thesisCase.evidence = Array.from({ length: 8 }, (_, index) => ({
    ...template,
    id: `material-${index}`,
    sourceUrl: "https://example.com/filing",
    originId: undefined,
    claimId: undefined,
    relation: "direct" as const,
  }));

  const audit = auditEvidenceStructure(thesisCase);

  assert.equal(audit.materialCount, 8);
  assert.equal(audit.sourceGroupCount, 1);
  assert.equal(audit.relatedMaterialCount, 7);
});

test("sharing one factual claim does not merge independent sources", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.evidence = thesisCase.evidence.slice(0, 2).map(
    (item, index) => ({
      ...item,
      id: `source-${index}`,
      sourceUrl: `https://publisher-${index + 1}.example/report`,
      originId: undefined,
      claimId: "same-factual-claim",
      dependsOnIds: [],
      sameSourceAsIds: [],
      relation: "direct" as const,
    }),
  );

  assert.equal(buildSourceGroups(thesisCase).length, 2);
});

test("repeating one canonical URL cannot increase legacy score influence", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.baseScore = 50;
  thesisCase.assumptions = thesisCase.assumptions.map((item) => ({
    ...item,
    value: item.baseline,
  }));
  const support = {
    ...thesisCase.evidence[0],
    id: "support",
    sourceUrl: "https://source-a.example/report",
    originId: "source-a",
    claimId: "claim-a",
    sameSourceAsIds: undefined,
    direction: "supports" as const,
    impact: 6,
    reliability: 1,
    relation: "direct" as const,
  };
  const challenge = {
    ...thesisCase.evidence[4],
    id: "challenge",
    sourceUrl: "https://source-b.example/report",
    originId: "source-b",
    claimId: "claim-b",
    sameSourceAsIds: ["support"],
    direction: "contradicts" as const,
    impact: 6,
    reliability: 1,
    relation: "direct" as const,
  };
  thesisCase.evidence = [support, challenge];
  const baseline = scoreCase(thesisCase);

  thesisCase.evidence.push(
    ...Array.from({ length: 8 }, (_, index) => ({
      ...support,
      id: `duplicate-${index}`,
      sourceUrl:
        "https://www.source-a.example/report?utm_source=republisher",
      originId: `changed-label-${index}`,
    })),
  );

  assert.equal(buildSourceGroups(thesisCase).length, 1);
  assert.equal(scoreCase(thesisCase), baseline);
});
