import {
  buildSourceGroups,
  isUserAddedEvidence,
  isVerifiedEvidence,
  type EvidenceDirection,
  type EvidenceItem,
  type ThesisCase,
} from "./falsifi.ts";

export type EvidenceStructureGroup = {
  id: string;
  items: EvidenceItem[];
  directions: EvidenceDirection[];
};

export type EvidenceStructureAudit = {
  materialCount: number;
  verifiedMaterialCount: number;
  unverifiedMaterialCount: number;
  sourceGroupCount: number;
  relatedMaterialCount: number;
  supportingGroupCount: number;
  challengingGroupCount: number;
  mixedGroupCount: number;
  groups: EvidenceStructureGroup[];
};

/**
 * Describes user-added material without using model weights or
 * market-derived indicators. This powers the product's primary output: how
 * many source groups the current record identifies.
 */
export function auditEvidenceStructure(
  thesisCase: ThesisCase,
): EvidenceStructureAudit {
  const manualEvidence = thesisCase.evidence.filter((item) =>
    isUserAddedEvidence(thesisCase, item),
  );
  const manualCase: ThesisCase = {
    ...thesisCase,
    evidence: manualEvidence,
  };
  const evidenceById = new Map(
    manualEvidence.map((item) => [item.id, item]),
  );
  const groups = buildSourceGroups(manualCase).map((root) => ({
    id: root.id,
    items: root.evidenceIds
      .map((id) => evidenceById.get(id))
      .filter((item): item is EvidenceItem => Boolean(item)),
    directions: root.directions,
  }));

  return {
    materialCount: manualEvidence.length,
    verifiedMaterialCount: manualEvidence.filter(isVerifiedEvidence)
      .length,
    unverifiedMaterialCount: manualEvidence.filter(
      (item) => !isVerifiedEvidence(item),
    ).length,
    sourceGroupCount: groups.length,
    relatedMaterialCount: groups.reduce(
      (total, group) => total + Math.max(0, group.items.length - 1),
      0,
    ),
    supportingGroupCount: groups.filter(
      (group) =>
        group.directions.includes("supports") &&
        !group.directions.includes("contradicts"),
    ).length,
    challengingGroupCount: groups.filter(
      (group) =>
        group.directions.includes("contradicts") &&
        !group.directions.includes("supports"),
    ).length,
    mixedGroupCount: groups.filter(
      (group) =>
        group.directions.includes("supports") &&
        group.directions.includes("contradicts"),
    ).length,
    groups,
  };
}
