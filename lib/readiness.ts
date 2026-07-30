import {
  buildEvidenceRoots,
  type EvidenceItem,
  type ThesisCase,
} from "./falsifi.ts";

export type ReadinessCheckId =
  | "case-definition"
  | "invalidation-criteria"
  | "primary-source"
  | "counter-evidence"
  | "source-diversity"
  | "review-date";

export type ReadinessAction =
  | "define-case"
  | "add-invalidation"
  | "add-primary-source"
  | "add-counter-evidence"
  | "add-independent-source"
  | "set-review-date"
  | "save-baseline";

export type ResearchReadinessStatus =
  | "market-context"
  | "incomplete"
  | "reviewable";

export type ReadinessCheck = {
  id: ReadinessCheckId;
  complete: boolean;
};

export type ResearchReadiness = {
  status: ResearchReadinessStatus;
  checks: ReadinessCheck[];
  completedCount: number;
  totalCount: number;
  nextAction: ReadinessAction | null;
  manualEvidenceCount: number;
  relatedGroupCount: number;
  primarySourceCount: number;
  counterEvidenceCount: number;
};

const isManualEvidence = (item: EvidenceItem) =>
  item.enabled && item.relation !== "derived";

const hasReviewDate = (value: string | undefined) =>
  Boolean(
    value &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(`${value}T00:00:00.000Z`)),
  );

/**
 * A transparent completeness gate, not another predictive score.
 *
 * Market-derived indicators are useful context but do not satisfy the primary
 * source or counter-evidence checks. A case becomes reviewable only after the
 * user defines a falsifiable question, records a review date, and adds
 * genuinely different evidence.
 */
export function assessResearchReadiness(
  thesisCase: ThesisCase,
): ResearchReadiness {
  const enabledEvidence = thesisCase.evidence.filter((item) => item.enabled);
  const manualEvidence = enabledEvidence.filter(isManualEvidence);
  const roots = buildEvidenceRoots(thesisCase);
  const plan = thesisCase.researchPlan;
  const primarySourceCount = manualEvidence.filter(
    (item) => item.group === "Official filing",
  ).length;
  const counterEvidenceCount = manualEvidence.filter(
    (item) => item.direction === "contradicts",
  ).length;

  const checks: ReadinessCheck[] = [
    {
      id: "case-definition",
      complete:
        plan?.thesisConfirmed === true &&
        thesisCase.thesis.trim().length >= 12 &&
        thesisCase.horizon.trim().length > 0,
    },
    {
      id: "invalidation-criteria",
      complete: (plan?.invalidationCriteria.trim().length ?? 0) >= 12,
    },
    {
      id: "primary-source",
      complete: primarySourceCount > 0,
    },
    {
      id: "counter-evidence",
      complete: counterEvidenceCount > 0,
    },
    {
      id: "source-diversity",
      complete: roots.length >= 3 && manualEvidence.length >= 2,
    },
    {
      id: "review-date",
      complete: hasReviewDate(plan?.nextReviewDate),
    },
  ];

  const completedCount = checks.filter((check) => check.complete).length;
  const nextCheck = checks.find((check) => !check.complete)?.id;
  const nextActions: Record<ReadinessCheckId, ReadinessAction> = {
    "case-definition": "define-case",
    "invalidation-criteria": "add-invalidation",
    "primary-source": "add-primary-source",
    "counter-evidence": "add-counter-evidence",
    "source-diversity": "add-independent-source",
    "review-date": "set-review-date",
  };
  const marketContextOnly =
    manualEvidence.length === 0 && plan?.thesisConfirmed !== true;

  return {
    status:
      completedCount === checks.length
        ? "reviewable"
        : marketContextOnly
          ? "market-context"
          : "incomplete",
    checks,
    completedCount,
    totalCount: checks.length,
    nextAction: nextCheck ? nextActions[nextCheck] : null,
    manualEvidenceCount: manualEvidence.length,
    relatedGroupCount: roots.length,
    primarySourceCount,
    counterEvidenceCount,
  };
}
