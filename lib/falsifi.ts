import { sha256 as hashSha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";

export type Posture = "Constructive" | "Balanced" | "Cautious";

export type EvidenceDirection = "supports" | "contradicts";

export type EvidenceRelation = "direct" | "derived" | "duplicate";

export type EvidenceGroup =
  | "Official filing"
  | "Management"
  | "Market data"
  | "External estimate";

export type MarketPoint = {
  timestamp: number;
  close: number;
  volume: number | null;
};

export type MarketMetricSet = {
  dayReturn: number;
  monthReturn: number;
  quarterReturn: number;
  yearReturn: number;
  annualizedVolatility: number;
  maxDrawdown: number;
  rsi14: number;
  sma20: number;
  sma50: number;
  sma200: number;
  distanceFromSma200: number;
  high52Week: number;
  low52Week: number;
  volumeRatio20: number | null;
};

export type MarketSnapshot = {
  provider: string;
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  instrumentType: string;
  priceBasis?: "adjusted" | "close";
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketTime: string;
  fetchedAt: string;
  sourceUrl: string;
  history: MarketPoint[];
  metrics: MarketMetricSet;
};

export type EvidenceItem = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  asOf: string;
  group: EvidenceGroup;
  direction: EvidenceDirection;
  impact: number;
  reliability: number;
  note: string;
  enabled: boolean;
  originId?: string;
  claimId?: string;
  dependsOnIds?: string[];
  relation?: EvidenceRelation;
};

export type Assumption = {
  id: string;
  label: string;
  value: number;
  baseline: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  impactPerUnit: number;
  direction: 1 | -1;
  typicalShock: number;
};

export type ThesisCase = {
  schemaVersion: 1;
  id: string;
  company: string;
  ticker: string;
  isDemo: boolean;
  thesis: string;
  horizon: string;
  baseScore: number;
  constructiveThreshold: number;
  cautiousThreshold: number;
  lastUpdated: string;
  modelVersion: string;
  marketSnapshot?: MarketSnapshot;
  evidence: EvidenceItem[];
  assumptions: Assumption[];
};

export type AssumptionFlip = {
  assumptionId: string;
  label: string;
  from: number;
  to: number;
  delta: number;
  unit: string;
  resultingScore: number;
  resultingPosture: Posture;
};

export type AblationResult = {
  evidenceId: string;
  title: string;
  delta: number;
  resultingScore: number;
  resultingPosture: Posture;
};

export type SensitivityPoint = {
  value: number;
  score: number;
  posture: Posture;
};

export type EvidenceRoot = {
  id: string;
  evidenceIds: string[];
  originIds: string[];
  claimIds: string[];
  directions: EvidenceDirection[];
  netContribution: number;
  absoluteContribution: number;
  shareOfAbsoluteContribution: number;
};

export type EvidenceDirectionConflict = {
  rootId: string;
  evidenceIds: string[];
  directions: EvidenceDirection[];
};

export type SourceShockResult = {
  group: EvidenceGroup;
  evidenceIds: string[];
  evidenceCount: number;
  delta: number;
  resultingScore: number;
  resultingPosture: Posture;
};

export type EvidenceIndependenceAudit = {
  enabledEvidenceCount: number;
  independentRootCount: number;
  duplicateCount: number;
  declaredDuplicateCount: number;
  maximumRootShare: number;
  concentrationHhi: number;
  directionConflicts: EvidenceDirectionConflict[];
  staleAfterDays: number;
  staleCount: number;
  staleEvidenceIds: string[];
  roots: EvidenceRoot[];
  sourceShocks: SourceShockResult[];
};

export type MinimumIndependentFlipResult = {
  found: boolean;
  rootIds: string[];
  evidence: EvidenceItem[];
  resultingScore: number | null;
  resultingPosture: Posture | null;
  exact: boolean;
  exhaustive: boolean;
  totalRoots: number;
  maxRootSetSize: number;
  searchedThroughRootCount: number;
  combinationsEvaluated: number;
};

export type JointFlipPoint = {
  assumptionIds: [string, string];
  labels: [string, string];
  from: [number, number];
  to: [number, number];
  deltas: [number, number];
  units: [string, string];
  normalizedShocks: [number, number];
  normalizedL2: number;
  normalizedMaxShock: number;
  resultingScore: number;
  resultingPosture: Posture;
  requiresBoth: boolean;
};

export type JointFlipFrontier = {
  points: JointFlipPoint[];
  evaluatedStates: number;
  plannedStates: number;
  exact: boolean;
  maxStates: number;
  totalPairs: number;
  pairsEvaluated: number;
  resolutionStride: number;
  rangeTypicalShocks: number;
};

export type EvidenceStressMode = "remove" | "degrade" | "contradict";

export type EvidenceStressOutcome = {
  mode: EvidenceStressMode;
  score: number;
  delta: number;
  posture: Posture;
  flipsPosture: boolean;
};

export type EvidenceStressComparison = {
  basis: "minimum-item-flip-set";
  evidenceIds: string[];
  degradeFactor: number;
  outcomes: Record<EvidenceStressMode, EvidenceStressOutcome>;
};

export type StressResult = {
  score: number;
  posture: Posture;
  stabilityScore: number;
  minimumFlipSet: EvidenceItem[];
  assumptionFlip: AssumptionFlip | null;
  ablations: AblationResult[];
  sensitivity: SensitivityPoint[];
  driver: Assumption;
  independenceAudit: EvidenceIndependenceAudit;
  minimumIndependentFlip: MinimumIndependentFlipResult;
  jointFlipFrontier: JointFlipFrontier;
  evidenceStress: EvidenceStressComparison;
};

export const DEFAULT_STALE_AFTER_DAYS = 90;
export const MAX_INDEPENDENT_FLIP_ROOTS = 4;
export const MAX_JOINT_FLIP_STATES = 100_000;
export const JOINT_FLIP_RANGE_TYPICAL_SHOCKS = 2;

const EVIDENCE_GROUP_ORDER: EvidenceGroup[] = [
  "Official filing",
  "Management",
  "Market data",
  "External estimate",
];

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

export function scoreCase(
  thesisCase: ThesisCase,
  disabledEvidenceIds: string[] = [],
  assumptionOverrides: Record<string, number> = {},
) {
  const disabled = new Set(disabledEvidenceIds);
  const evidenceScore = thesisCase.evidence.reduce((total, item) => {
    if (!item.enabled || disabled.has(item.id)) return total;
    const sign = item.direction === "supports" ? 1 : -1;
    return total + sign * item.impact * item.reliability;
  }, 0);

  const assumptionScore = thesisCase.assumptions.reduce((total, assumption) => {
    const current =
      assumptionOverrides[assumption.id] === undefined
        ? assumption.value
        : assumptionOverrides[assumption.id];
    return (
      total +
      (current - assumption.baseline) *
        assumption.impactPerUnit *
        assumption.direction
    );
  }, 0);

  return clamp(thesisCase.baseScore + evidenceScore + assumptionScore);
}

export function getPosture(thesisCase: ThesisCase, score: number): Posture {
  if (score >= thesisCase.constructiveThreshold) return "Constructive";
  if (score < thesisCase.cautiousThreshold) return "Cautious";
  return "Balanced";
}

function combinations<T>(items: T[], size: number): T[][] {
  const output: T[][] = [];

  const walk = (start: number, chosen: T[]) => {
    if (chosen.length === size) {
      output.push([...chosen]);
      return;
    }
    for (let index = start; index < items.length; index += 1) {
      chosen.push(items[index]);
      walk(index + 1, chosen);
      chosen.pop();
    }
  };

  walk(0, []);
  return output;
}

const evidenceContribution = (item: EvidenceItem) =>
  (item.direction === "supports" ? 1 : -1) *
  item.impact *
  item.reliability;

const compareStrings = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

/**
 * Groups enabled evidence by declared relationships. Shared origin IDs,
 * shared claim IDs, and explicit dependency edges place items in the same
 * connected group. The graph is intentionally undirected for clustering:
 * dependency direction is source metadata, not additional score weight.
 *
 * The public API retains the historical EvidenceRoot name for schema and
 * import compatibility; the UI calls these "related evidence groups."
 */
export function buildEvidenceRoots(thesisCase: ThesisCase): EvidenceRoot[] {
  const evidence = thesisCase.evidence
    .filter((item) => item.enabled)
    .slice()
    .sort((a, b) => compareStrings(a.id, b.id));
  const byId = new Map(evidence.map((item) => [item.id, item]));
  const parent = new Map(evidence.map((item) => [item.id, item.id]));

  const find = (id: string): string => {
    const current = parent.get(id);
    if (!current || current === id) return id;
    const root = find(current);
    parent.set(id, root);
    return root;
  };

  const union = (left: string, right: string) => {
    if (!parent.has(left) || !parent.has(right)) return;
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot === rightRoot) return;
    const [first, second] =
      compareStrings(leftRoot, rightRoot) <= 0
        ? [leftRoot, rightRoot]
        : [rightRoot, leftRoot];
    parent.set(second, first);
  };

  const firstByOrigin = new Map<string, string>();
  const firstByClaim = new Map<string, string>();

  evidence.forEach((item) => {
    if (item.originId) {
      const first = firstByOrigin.get(item.originId);
      if (first) union(first, item.id);
      else firstByOrigin.set(item.originId, item.id);
    }
    if (item.claimId) {
      const first = firstByClaim.get(item.claimId);
      if (first) union(first, item.id);
      else firstByClaim.set(item.claimId, item.id);
    }
    item.dependsOnIds?.forEach((dependencyId) => {
      if (byId.has(dependencyId)) union(item.id, dependencyId);
    });
  });

  const components = new Map<string, EvidenceItem[]>();
  evidence.forEach((item) => {
    const root = find(item.id);
    const items = components.get(root) ?? [];
    items.push(item);
    components.set(root, items);
  });

  const totalAbsoluteContribution = evidence.reduce(
    (total, item) => total + Math.abs(evidenceContribution(item)),
    0,
  );

  return Array.from(components.values())
    .map((items) => {
      const sortedItems = items
        .slice()
        .sort((a, b) => compareStrings(a.id, b.id));
      const absoluteContribution = sortedItems.reduce(
        (total, item) => total + Math.abs(evidenceContribution(item)),
        0,
      );
      const directions = (["supports", "contradicts"] as const).filter(
        (direction) =>
          sortedItems.some((item) => item.direction === direction),
      );

      return {
        id: sortedItems[0].id,
        evidenceIds: sortedItems.map((item) => item.id),
        originIds: Array.from(
          new Set(
            sortedItems
              .map((item) => item.originId)
              .filter((id): id is string => Boolean(id)),
          ),
        ).sort(compareStrings),
        claimIds: Array.from(
          new Set(
            sortedItems
              .map((item) => item.claimId)
              .filter((id): id is string => Boolean(id)),
          ),
        ).sort(compareStrings),
        directions,
        netContribution: sortedItems.reduce(
          (total, item) => total + evidenceContribution(item),
          0,
        ),
        absoluteContribution,
        shareOfAbsoluteContribution:
          totalAbsoluteContribution === 0
            ? 0
            : absoluteContribution / totalAbsoluteContribution,
      };
    })
    .sort((a, b) => compareStrings(a.id, b.id));
}

export function auditEvidenceIndependence(
  thesisCase: ThesisCase,
  staleAfterDays = DEFAULT_STALE_AFTER_DAYS,
): EvidenceIndependenceAudit {
  const enabledEvidence = thesisCase.evidence.filter((item) => item.enabled);
  const roots = buildEvidenceRoots(thesisCase);
  const baseScore = scoreCase(thesisCase);
  const referenceTime = Date.parse(thesisCase.lastUpdated);
  const safeStaleAfterDays =
    Number.isFinite(staleAfterDays) && staleAfterDays >= 0
      ? staleAfterDays
      : DEFAULT_STALE_AFTER_DAYS;
  const staleEvidenceIds = enabledEvidence
    .filter((item) => {
      const evidenceTime = Date.parse(`${item.asOf}T00:00:00.000Z`);
      if (!Number.isFinite(referenceTime) || !Number.isFinite(evidenceTime)) {
        return false;
      }
      return (
        (referenceTime - evidenceTime) / (24 * 60 * 60 * 1_000) >
        safeStaleAfterDays
      );
    })
    .map((item) => item.id)
    .sort(compareStrings);

  const directionConflicts = roots
    .filter((root) => root.directions.length > 1)
    .map((root) => ({
      rootId: root.id,
      evidenceIds: root.evidenceIds,
      directions: root.directions,
    }));

  const sourceShocks = EVIDENCE_GROUP_ORDER.map((group) => {
    const evidenceIds = enabledEvidence
      .filter((item) => item.group === group)
      .map((item) => item.id)
      .sort(compareStrings);
    const resultingScore = scoreCase(thesisCase, evidenceIds);
    return {
      group,
      evidenceIds,
      evidenceCount: evidenceIds.length,
      delta: resultingScore - baseScore,
      resultingScore,
      resultingPosture: getPosture(thesisCase, resultingScore),
    };
  });

  return {
    enabledEvidenceCount: enabledEvidence.length,
    independentRootCount: roots.length,
    duplicateCount: Math.max(0, enabledEvidence.length - roots.length),
    declaredDuplicateCount: enabledEvidence.filter(
      (item) => item.relation === "duplicate",
    ).length,
    maximumRootShare:
      roots.length === 0
        ? 0
        : Math.max(...roots.map((root) => root.shareOfAbsoluteContribution)),
    concentrationHhi: roots.reduce(
      (total, root) =>
        total + root.shareOfAbsoluteContribution * root.shareOfAbsoluteContribution,
      0,
    ),
    directionConflicts,
    staleAfterDays: safeStaleAfterDays,
    staleCount: staleEvidenceIds.length,
    staleEvidenceIds,
    roots,
    sourceShocks,
  };
}

export function findMinimumIndependentFlip(
  thesisCase: ThesisCase,
): MinimumIndependentFlipResult {
  const roots = buildEvidenceRoots(thesisCase);
  const baseScore = scoreCase(thesisCase);
  const basePosture = getPosture(thesisCase, baseScore);
  const searchedThroughRootCount = Math.min(
    MAX_INDEPENDENT_FLIP_ROOTS,
    roots.length,
  );
  const exhaustive = roots.length <= MAX_INDEPENDENT_FLIP_ROOTS;
  let combinationsEvaluated = 0;

  for (let size = 1; size <= searchedThroughRootCount; size += 1) {
    const flips = combinations(roots, size)
      .map((rootSet) => {
        combinationsEvaluated += 1;
        const evidenceIds = rootSet.flatMap((root) => root.evidenceIds);
        const resultingScore = scoreCase(thesisCase, evidenceIds);
        return {
          rootSet,
          resultingScore,
          resultingPosture: getPosture(thesisCase, resultingScore),
        };
      })
      .filter((result) => result.resultingPosture !== basePosture)
      .sort((a, b) => {
        const impactDifference =
          Math.abs(baseScore - a.resultingScore) -
          Math.abs(baseScore - b.resultingScore);
        if (Math.abs(impactDifference) > Number.EPSILON) {
          return impactDifference;
        }
        return compareStrings(
          a.rootSet.map((root) => root.id).join("\u0000"),
          b.rootSet.map((root) => root.id).join("\u0000"),
        );
      });

    if (flips[0]) {
      const rootIds = flips[0].rootSet.map((root) => root.id);
      const evidenceIds = new Set(
        flips[0].rootSet.flatMap((root) => root.evidenceIds),
      );
      return {
        found: true,
        rootIds,
        evidence: thesisCase.evidence
          .filter((item) => evidenceIds.has(item.id))
          .slice()
          .sort((a, b) => compareStrings(a.id, b.id)),
        resultingScore: flips[0].resultingScore,
        resultingPosture: flips[0].resultingPosture,
        exact: true,
        exhaustive,
        totalRoots: roots.length,
        maxRootSetSize: MAX_INDEPENDENT_FLIP_ROOTS,
        searchedThroughRootCount: size,
        combinationsEvaluated,
      };
    }
  }

  return {
    found: false,
    rootIds: [],
    evidence: [],
    resultingScore: null,
    resultingPosture: null,
    exact: exhaustive,
    exhaustive,
    totalRoots: roots.length,
    maxRootSetSize: MAX_INDEPENDENT_FLIP_ROOTS,
    searchedThroughRootCount,
    combinationsEvaluated,
  };
}

export function findMinimumFlipSet(thesisCase: ThesisCase) {
  const baseScore = scoreCase(thesisCase);
  const basePosture = getPosture(thesisCase, baseScore);
  const candidates = thesisCase.evidence.filter((item) => item.enabled);
  const maxSize = Math.min(4, candidates.length);

  for (let size = 1; size <= maxSize; size += 1) {
    const flips = combinations(candidates, size)
      .map((set) => {
        const resultingScore = scoreCase(
          thesisCase,
          set.map((item) => item.id),
        );
        return {
          set,
          resultingScore,
          flips: getPosture(thesisCase, resultingScore) !== basePosture,
        };
      })
      .filter((result) => result.flips)
      .sort((a, b) => {
        const impactA = Math.abs(baseScore - a.resultingScore);
        const impactB = Math.abs(baseScore - b.resultingScore);
        return impactA - impactB;
      });

    if (flips[0]) return flips[0].set;
  }

  return [];
}

export function findAssumptionFlip(
  thesisCase: ThesisCase,
): AssumptionFlip | null {
  const baseScore = scoreCase(thesisCase);
  const basePosture = getPosture(thesisCase, baseScore);
  const results: (AssumptionFlip & { normalizedDistance: number })[] = [];

  thesisCase.assumptions.forEach((assumption) => {
    const maxSteps = Math.ceil(
      Math.max(
        Math.abs(assumption.max - assumption.value),
        Math.abs(assumption.value - assumption.min),
      ) / assumption.step,
    );

    for (let count = 1; count <= maxSteps; count += 1) {
      for (const direction of [-1, 1]) {
        const value = Number(
          (assumption.value + direction * count * assumption.step).toFixed(6),
        );
        if (value < assumption.min || value > assumption.max) continue;
        const resultingScore = scoreCase(thesisCase, [], {
          [assumption.id]: value,
        });
        const resultingPosture = getPosture(thesisCase, resultingScore);
        if (resultingPosture !== basePosture) {
          results.push({
            assumptionId: assumption.id,
            label: assumption.label,
            from: assumption.value,
            to: value,
            delta: Number((value - assumption.value).toFixed(6)),
            unit: assumption.unit,
            resultingScore,
            resultingPosture,
            normalizedDistance:
              Math.abs(value - assumption.value) /
              Math.max(assumption.typicalShock, assumption.step),
          });
          return;
        }
      }
    }
  });

  return (
    results.sort((a, b) => a.normalizedDistance - b.normalizedDistance)[0] ??
    null
  );
}

type ShockGridPoint = {
  value: number;
  normalizedShock: number;
};

const roundForEngine = (value: number) => Number(value.toFixed(10));

function buildShockGrid(assumption: Assumption): ShockGridPoint[] {
  const lowerBound = Math.max(
    assumption.min,
    assumption.value -
      JOINT_FLIP_RANGE_TYPICAL_SHOCKS * assumption.typicalShock,
  );
  const upperBound = Math.min(
    assumption.max,
    assumption.value +
      JOINT_FLIP_RANGE_TYPICAL_SHOCKS * assumption.typicalShock,
  );
  const downwardSteps = Math.floor(
    (assumption.value - lowerBound) / assumption.step + 1e-9,
  );
  const upwardSteps = Math.floor(
    (upperBound - assumption.value) / assumption.step + 1e-9,
  );

  return Array.from(
    { length: downwardSteps + upwardSteps + 1 },
    (_, index) => {
      const stepOffset = index - downwardSteps;
      const value = roundForEngine(
        assumption.value + stepOffset * assumption.step,
      );
      return {
        value,
        normalizedShock: roundForEngine(
          (value - assumption.value) / assumption.typicalShock,
        ),
      };
    },
  );
}

function sampleShockGrid(
  grid: ShockGridPoint[],
  stride: number,
): ShockGridPoint[] {
  if (stride <= 1 || grid.length <= 5) return grid;
  const currentIndex = grid.findIndex(
    (point) => Math.abs(point.normalizedShock) < 1e-10,
  );
  const safeCurrentIndex =
    currentIndex >= 0 ? currentIndex : Math.floor(grid.length / 2);
  const indexes = new Set<number>([
    0,
    grid.length - 1,
    safeCurrentIndex,
    Math.max(0, safeCurrentIndex - 1),
    Math.min(grid.length - 1, safeCurrentIndex + 1),
  ]);

  for (
    let offset = stride;
    safeCurrentIndex - offset >= 0 ||
    safeCurrentIndex + offset < grid.length;
    offset += stride
  ) {
    if (safeCurrentIndex - offset >= 0) {
      indexes.add(safeCurrentIndex - offset);
    }
    if (safeCurrentIndex + offset < grid.length) {
      indexes.add(safeCurrentIndex + offset);
    }
  }

  return Array.from(indexes)
    .sort((a, b) => a - b)
    .map((index) => grid[index]);
}

const jointStateCount = (grids: ShockGridPoint[][]) => {
  let total = 0;
  for (let first = 0; first < grids.length; first += 1) {
    for (let second = first + 1; second < grids.length; second += 1) {
      const firstChanged = grids[first].filter(
        (point) => Math.abs(point.normalizedShock) >= 1e-10,
      ).length;
      const secondChanged = grids[second].filter(
        (point) => Math.abs(point.normalizedShock) >= 1e-10,
      ).length;
      total += firstChanged * secondChanged;
    }
  }
  return total;
};

function paretoJointPoints(points: JointFlipPoint[]) {
  const byPath = new Map<string, JointFlipPoint[]>();
  points.forEach((point) => {
    const path = `${point.assumptionIds.join("\u0000")}:${Math.sign(
      point.normalizedShocks[0],
    )}:${Math.sign(point.normalizedShocks[1])}`;
    const entries = byPath.get(path) ?? [];
    entries.push(point);
    byPath.set(path, entries);
  });

  const frontier: JointFlipPoint[] = [];
  byPath.forEach((pathPoints) => {
    const sorted = pathPoints.slice().sort((a, b) => {
      const firstDifference =
        Math.abs(a.normalizedShocks[0]) -
        Math.abs(b.normalizedShocks[0]);
      if (Math.abs(firstDifference) > 1e-10) return firstDifference;
      const secondDifference =
        Math.abs(a.normalizedShocks[1]) -
        Math.abs(b.normalizedShocks[1]);
      if (Math.abs(secondDifference) > 1e-10) return secondDifference;
      const scoreDifference =
        Math.abs(a.resultingScore) - Math.abs(b.resultingScore);
      if (Math.abs(scoreDifference) > 1e-10) return scoreDifference;
      return compareStrings(a.to.join(","), b.to.join(","));
    });
    let smallestSecondShock = Number.POSITIVE_INFINITY;
    sorted.forEach((point) => {
      const secondShock = Math.abs(point.normalizedShocks[1]);
      if (secondShock < smallestSecondShock - 1e-10) {
        frontier.push(point);
        smallestSecondShock = secondShock;
      }
    });
  });

  return frontier;
}

/**
 * Searches every two-assumption path inside a +/-2 typical-shock box. If the
 * complete stepped grid exceeds the hard state budget, every pair is still
 * covered using a deterministic coarser grid and `exact` is set to false.
 */
export function findJointFlipFrontier(
  thesisCase: ThesisCase,
): JointFlipFrontier {
  const assumptions = thesisCase.assumptions;
  const totalPairs = (assumptions.length * (assumptions.length - 1)) / 2;
  const fullGrids = assumptions.map(buildShockGrid);
  const plannedStates = jointStateCount(fullGrids);
  let resolutionStride =
    plannedStates > MAX_JOINT_FLIP_STATES
      ? Math.max(
          2,
          Math.ceil(
            Math.sqrt(plannedStates / MAX_JOINT_FLIP_STATES),
          ),
        )
      : 1;
  let grids = fullGrids.map((grid) =>
    sampleShockGrid(grid, resolutionStride),
  );

  while (
    jointStateCount(grids) > MAX_JOINT_FLIP_STATES &&
    resolutionStride < 10_000
  ) {
    resolutionStride += 1;
    grids = fullGrids.map((grid) =>
      sampleShockGrid(grid, resolutionStride),
    );
  }

  const baseScore = scoreCase(thesisCase);
  const basePosture = getPosture(thesisCase, baseScore);
  const candidates: JointFlipPoint[] = [];
  let evaluatedStates = 0;
  let pairsEvaluated = 0;

  for (let first = 0; first < assumptions.length; first += 1) {
    for (let second = first + 1; second < assumptions.length; second += 1) {
      pairsEvaluated += 1;
      const firstAssumption = assumptions[first];
      const secondAssumption = assumptions[second];
      const firstGrid = grids[first].filter(
        (point) => Math.abs(point.normalizedShock) >= 1e-10,
      );
      const secondGrid = grids[second].filter(
        (point) => Math.abs(point.normalizedShock) >= 1e-10,
      );

      firstGrid.forEach((firstPoint) => {
        secondGrid.forEach((secondPoint) => {
          if (evaluatedStates >= MAX_JOINT_FLIP_STATES) return;
          evaluatedStates += 1;
          const resultingScore = scoreCase(thesisCase, [], {
            [firstAssumption.id]: firstPoint.value,
            [secondAssumption.id]: secondPoint.value,
          });
          const resultingPosture = getPosture(
            thesisCase,
            resultingScore,
          );
          if (resultingPosture === basePosture) return;

          const firstOnlyScore = scoreCase(thesisCase, [], {
            [firstAssumption.id]: firstPoint.value,
          });
          const secondOnlyScore = scoreCase(thesisCase, [], {
            [secondAssumption.id]: secondPoint.value,
          });
          const normalizedL2 = Math.hypot(
            firstPoint.normalizedShock,
            secondPoint.normalizedShock,
          );

          candidates.push({
            assumptionIds: [firstAssumption.id, secondAssumption.id],
            labels: [firstAssumption.label, secondAssumption.label],
            from: [firstAssumption.value, secondAssumption.value],
            to: [firstPoint.value, secondPoint.value],
            deltas: [
              roundForEngine(firstPoint.value - firstAssumption.value),
              roundForEngine(secondPoint.value - secondAssumption.value),
            ],
            units: [firstAssumption.unit, secondAssumption.unit],
            normalizedShocks: [
              firstPoint.normalizedShock,
              secondPoint.normalizedShock,
            ],
            normalizedL2: roundForEngine(normalizedL2),
            normalizedMaxShock: roundForEngine(
              Math.max(
                Math.abs(firstPoint.normalizedShock),
                Math.abs(secondPoint.normalizedShock),
              ),
            ),
            resultingScore,
            resultingPosture,
            requiresBoth:
              getPosture(thesisCase, firstOnlyScore) === basePosture &&
              getPosture(thesisCase, secondOnlyScore) === basePosture,
          });
        });
      });
    }
  }

  const points = paretoJointPoints(candidates)
    .sort((a, b) => {
      const l2Difference = a.normalizedL2 - b.normalizedL2;
      if (Math.abs(l2Difference) > 1e-10) return l2Difference;
      const maxDifference =
        a.normalizedMaxShock - b.normalizedMaxShock;
      if (Math.abs(maxDifference) > 1e-10) return maxDifference;
      if (a.requiresBoth !== b.requiresBoth) {
        return a.requiresBoth ? -1 : 1;
      }
      const pathDifference = compareStrings(
        a.assumptionIds.join("\u0000"),
        b.assumptionIds.join("\u0000"),
      );
      if (pathDifference !== 0) return pathDifference;
      return compareStrings(a.to.join(","), b.to.join(","));
    })
    .slice(0, 5);

  return {
    points,
    evaluatedStates,
    plannedStates,
    exact: resolutionStride === 1,
    maxStates: MAX_JOINT_FLIP_STATES,
    totalPairs,
    pairsEvaluated,
    resolutionStride,
    rangeTypicalShocks: JOINT_FLIP_RANGE_TYPICAL_SHOCKS,
  };
}

function scoreEvidenceStress(
  thesisCase: ThesisCase,
  evidenceIds: string[],
  mode: EvidenceStressMode,
  degradeFactor: number,
) {
  if (mode === "remove") return scoreCase(thesisCase, evidenceIds);
  const selected = new Set(evidenceIds);
  const transformedCase: ThesisCase = {
    ...thesisCase,
    evidence: thesisCase.evidence.map((item) => {
      if (!selected.has(item.id)) return item;
      if (mode === "degrade") {
        return { ...item, reliability: item.reliability * degradeFactor };
      }
      return {
        ...item,
        direction:
          item.direction === "supports" ? "contradicts" : "supports",
      };
    }),
  };
  return scoreCase(transformedCase);
}

export function compareEvidenceStressSemantics(
  thesisCase: ThesisCase,
  evidenceSet = findMinimumFlipSet(thesisCase),
  degradeFactor = 0.5,
): EvidenceStressComparison {
  const safeDegradeFactor = clamp(degradeFactor, 0, 1);
  const evidenceIds = evidenceSet
    .map((item) => item.id)
    .slice()
    .sort(compareStrings);
  const baseScore = scoreCase(thesisCase);
  const basePosture = getPosture(thesisCase, baseScore);
  const makeOutcome = (
    mode: EvidenceStressMode,
  ): EvidenceStressOutcome => {
    const score = scoreEvidenceStress(
      thesisCase,
      evidenceIds,
      mode,
      safeDegradeFactor,
    );
    const posture = getPosture(thesisCase, score);
    return {
      mode,
      score,
      delta: score - baseScore,
      posture,
      flipsPosture: posture !== basePosture,
    };
  };

  return {
    basis: "minimum-item-flip-set",
    evidenceIds,
    degradeFactor: safeDegradeFactor,
    outcomes: {
      remove: makeOutcome("remove"),
      degrade: makeOutcome("degrade"),
      contradict: makeOutcome("contradict"),
    },
  };
}

export function buildSensitivity(
  thesisCase: ThesisCase,
  assumptionId: string,
) {
  const assumption = thesisCase.assumptions.find(
    (item) => item.id === assumptionId,
  );
  if (!assumption) return [];

  const width = Math.min(
    assumption.max - assumption.min,
    assumption.typicalShock * 2.4,
  );
  const start = Math.max(assumption.min, assumption.value - width / 2);
  const end = Math.min(assumption.max, assumption.value + width / 2);
  const points = 18;

  return Array.from({ length: points + 1 }, (_, index) => {
    const value = start + ((end - start) * index) / points;
    const score = scoreCase(thesisCase, [], {
      [assumption.id]: value,
    });
    return {
      value,
      score,
      posture: getPosture(thesisCase, score),
    };
  });
}

function calculateStabilityScore(
  thesisCase: ThesisCase,
  score: number,
  minimumFlipSet: EvidenceItem[],
  assumptionFlip: AssumptionFlip | null,
) {
  const nearestThreshold =
    getPosture(thesisCase, score) === "Constructive"
      ? thesisCase.constructiveThreshold
      : getPosture(thesisCase, score) === "Cautious"
        ? thesisCase.cautiousThreshold
        : Math.min(
            Math.abs(score - thesisCase.cautiousThreshold),
            Math.abs(thesisCase.constructiveThreshold - score),
          );

  const margin =
    typeof nearestThreshold === "number"
      ? getPosture(thesisCase, score) === "Balanced"
        ? nearestThreshold
        : Math.abs(score - nearestThreshold)
      : 0;
  const enabledEvidenceCount = thesisCase.evidence.filter(
    (item) => item.enabled,
  ).length;
  const testedEvidenceBuffer =
    minimumFlipSet.length > 0
      ? minimumFlipSet.length
      : Math.min(enabledEvidenceCount, 4);
  const evidenceResilience =
    enabledEvidenceCount === 0
      ? 0
      : clamp(testedEvidenceBuffer / 3, 0, 1);
  const assumption = assumptionFlip
    ? thesisCase.assumptions.find(
        (item) => item.id === assumptionFlip.assumptionId,
      )
    : null;
  const assumptionResilience =
    assumptionFlip && assumption
      ? clamp(
          Math.abs(assumptionFlip.delta) /
            Math.max(assumption.typicalShock, assumption.step),
          0,
          1,
        )
      : 1;
  const marginResilience = clamp(margin / 9.5, 0, 1);

  return Math.round(
    100 *
      (0.35 * evidenceResilience +
        0.25 * assumptionResilience +
        0.4 * marginResilience),
  );
}

export function runStressTest(thesisCase: ThesisCase): StressResult {
  const score = scoreCase(thesisCase);
  const posture = getPosture(thesisCase, score);
  const minimumFlipSet = findMinimumFlipSet(thesisCase);
  const assumptionFlip = findAssumptionFlip(thesisCase);
  const independenceAudit = auditEvidenceIndependence(thesisCase);
  const minimumIndependentFlip =
    findMinimumIndependentFlip(thesisCase);
  const jointFlipFrontier = findJointFlipFrontier(thesisCase);
  const evidenceStress = compareEvidenceStressSemantics(
    thesisCase,
    minimumFlipSet,
  );
  const driver =
    thesisCase.assumptions.find(
      (item) => item.id === assumptionFlip?.assumptionId,
    ) ?? thesisCase.assumptions[0];

  const ablations = thesisCase.evidence
    .filter((item) => item.enabled)
    .map((item) => {
      const resultingScore = scoreCase(thesisCase, [item.id]);
      return {
        evidenceId: item.id,
        title: item.title,
        delta: resultingScore - score,
        resultingScore,
        resultingPosture: getPosture(thesisCase, resultingScore),
      };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return {
    score,
    posture,
    minimumFlipSet,
    assumptionFlip,
    stabilityScore: calculateStabilityScore(
      thesisCase,
      score,
      minimumFlipSet,
      assumptionFlip,
    ),
    ablations,
    sensitivity: buildSensitivity(thesisCase, driver.id),
    driver,
    independenceAudit,
    minimumIndependentFlip,
    jointFlipFrontier,
    evidenceStress,
  };
}

export function canonicalStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value
      .map((item) =>
        item === undefined ||
        typeof item === "function" ||
        typeof item === "symbol"
          ? "null"
          : canonicalStringify(item),
      )
      .join(",")}]`;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .filter(
        (key) =>
          record[key] !== undefined &&
          typeof record[key] !== "function" &&
          typeof record[key] !== "symbol",
      )
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonicalStringify(record[key])}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export async function sha256(value: unknown) {
  const payload = new TextEncoder().encode(canonicalStringify(value));
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    try {
      const digest = await subtle.digest("SHA-256", payload);
      return bytesToHex(new Uint8Array(digest));
    } catch {
      // Local HTTP previews may expose crypto without a usable SubtleCrypto.
    }
  }
  return bytesToHex(hashSha256(payload));
}

const evidenceGroups = new Set<EvidenceGroup>(EVIDENCE_GROUP_ORDER);

const evidenceDirections = new Set<EvidenceDirection>([
  "supports",
  "contradicts",
]);

const evidenceRelations = new Set<EvidenceRelation>([
  "direct",
  "derived",
  "duplicate",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isNonEmptyString = (value: unknown, maxLength = 10_000) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.length <= maxLength;

export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2_048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isEvidenceItem(value: unknown): value is EvidenceItem {
  if (!isRecord(value)) return false;
  const hasValidDependencies =
    value.dependsOnIds === undefined ||
    (Array.isArray(value.dependsOnIds) &&
      value.dependsOnIds.length <= 40 &&
      value.dependsOnIds.every((id) => isNonEmptyString(id, 120)) &&
      new Set(value.dependsOnIds).size === value.dependsOnIds.length);
  return (
    isNonEmptyString(value.id, 120) &&
    isNonEmptyString(value.title, 500) &&
    isNonEmptyString(value.source, 300) &&
    isHttpUrl(value.sourceUrl) &&
    typeof value.asOf === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.asOf) &&
    evidenceGroups.has(value.group as EvidenceGroup) &&
    evidenceDirections.has(value.direction as EvidenceDirection) &&
    isFiniteNumber(value.impact) &&
    value.impact > 0 &&
    value.impact <= 100 &&
    isFiniteNumber(value.reliability) &&
    value.reliability >= 0 &&
    value.reliability <= 1 &&
    typeof value.note === "string" &&
    value.note.length <= 2_000 &&
    typeof value.enabled === "boolean" &&
    (value.originId === undefined ||
      isNonEmptyString(value.originId, 120)) &&
    (value.claimId === undefined ||
      isNonEmptyString(value.claimId, 120)) &&
    hasValidDependencies &&
    (value.relation === undefined ||
      evidenceRelations.has(value.relation as EvidenceRelation))
  );
}

function isAssumption(value: unknown): value is Assumption {
  if (!isRecord(value)) return false;
  if (
    !isNonEmptyString(value.id, 120) ||
    !isNonEmptyString(value.label, 300) ||
    !isNonEmptyString(value.unit, 24) ||
    !isFiniteNumber(value.value) ||
    !isFiniteNumber(value.baseline) ||
    !isFiniteNumber(value.min) ||
    !isFiniteNumber(value.max) ||
    !isFiniteNumber(value.step) ||
    !isFiniteNumber(value.impactPerUnit) ||
    !isFiniteNumber(value.typicalShock) ||
    (value.direction !== 1 && value.direction !== -1)
  ) {
    return false;
  }

  return (
    value.min < value.max &&
    value.value >= value.min &&
    value.value <= value.max &&
    value.baseline >= value.min &&
    value.baseline <= value.max &&
    value.step > 0 &&
    value.typicalShock > 0 &&
    (value.max - value.min) / value.step <= 2_000
  );
}

const marketMetricKeys: (keyof Omit<
  MarketMetricSet,
  "volumeRatio20"
>)[] = [
  "dayReturn",
  "monthReturn",
  "quarterReturn",
  "yearReturn",
  "annualizedVolatility",
  "maxDrawdown",
  "rsi14",
  "sma20",
  "sma50",
  "sma200",
  "distanceFromSma200",
  "high52Week",
  "low52Week",
];

export function isMarketSnapshot(value: unknown): value is MarketSnapshot {
  if (!isRecord(value) || !isRecord(value.metrics)) return false;
  const metrics = value.metrics;
  if (
    !isNonEmptyString(value.provider, 120) ||
    !isNonEmptyString(value.symbol, 24) ||
    !isNonEmptyString(value.name, 300) ||
    !isNonEmptyString(value.exchange, 120) ||
    typeof value.currency !== "string" ||
    value.currency.length > 12 ||
    value.instrumentType !== "EQUITY" ||
    (value.priceBasis !== undefined &&
      value.priceBasis !== "adjusted" &&
      value.priceBasis !== "close") ||
    !isFiniteNumber(value.price) ||
    value.price <= 0 ||
    !isFiniteNumber(value.previousClose) ||
    value.previousClose <= 0 ||
    !isFiniteNumber(value.change) ||
    !isFiniteNumber(value.changePercent) ||
    !isNonEmptyString(value.marketTime, 64) ||
    Number.isNaN(Date.parse(value.marketTime as string)) ||
    !isNonEmptyString(value.fetchedAt, 64) ||
    Number.isNaN(Date.parse(value.fetchedAt as string)) ||
    !isHttpUrl(value.sourceUrl) ||
    !Array.isArray(value.history) ||
    value.history.length < 200 ||
    value.history.length > 400 ||
    !marketMetricKeys.every((key) => isFiniteNumber(metrics[key])) ||
    (metrics.volumeRatio20 !== null &&
      !isFiniteNumber(metrics.volumeRatio20))
  ) {
    return false;
  }

  const boundedMetrics = metrics as unknown as MarketMetricSet;
  if (
    boundedMetrics.dayReturn < -100 ||
    boundedMetrics.monthReturn < -100 ||
    boundedMetrics.quarterReturn < -100 ||
    boundedMetrics.yearReturn < -100 ||
    boundedMetrics.annualizedVolatility < 0 ||
    boundedMetrics.maxDrawdown < -100 ||
    boundedMetrics.maxDrawdown > 0 ||
    boundedMetrics.rsi14 < 0 ||
    boundedMetrics.rsi14 > 100 ||
    boundedMetrics.sma20 <= 0 ||
    boundedMetrics.sma50 <= 0 ||
    boundedMetrics.sma200 <= 0 ||
    boundedMetrics.distanceFromSma200 < -100 ||
    boundedMetrics.high52Week <= 0 ||
    boundedMetrics.low52Week <= 0 ||
    boundedMetrics.high52Week < boundedMetrics.low52Week ||
    (boundedMetrics.volumeRatio20 !== null &&
      boundedMetrics.volumeRatio20 < 0)
  ) {
    return false;
  }

  let previousTimestamp = 0;
  for (const point of value.history) {
    if (
      !isRecord(point) ||
      !isFiniteNumber(point.timestamp) ||
      !Number.isSafeInteger(point.timestamp) ||
      point.timestamp <= previousTimestamp ||
      !isFiniteNumber(point.close) ||
      point.close <= 0 ||
      (point.volume !== null &&
        (!isFiniteNumber(point.volume) || point.volume < 0))
    ) {
      return false;
    }
    previousTimestamp = point.timestamp as number;
  }

  return true;
}

export function isThesisCase(value: unknown): value is ThesisCase {
  if (!isRecord(value)) return false;
  if (
    value.schemaVersion !== 1 ||
    !isNonEmptyString(value.id, 120) ||
    !isNonEmptyString(value.company, 300) ||
    !isNonEmptyString(value.ticker, 24) ||
    typeof value.isDemo !== "boolean" ||
    !isNonEmptyString(value.thesis, 5_000) ||
    !isNonEmptyString(value.horizon, 120) ||
    !isFiniteNumber(value.baseScore) ||
    !isFiniteNumber(value.constructiveThreshold) ||
    !isFiniteNumber(value.cautiousThreshold) ||
    !isNonEmptyString(value.lastUpdated, 64) ||
    Number.isNaN(Date.parse(value.lastUpdated as string)) ||
    !isNonEmptyString(value.modelVersion, 120) ||
    !Array.isArray(value.evidence) ||
    !Array.isArray(value.assumptions) ||
    value.evidence.length > 40 ||
    value.assumptions.length < 1 ||
    value.assumptions.length > 12
  ) {
    return false;
  }

  if (
    value.baseScore < 0 ||
    value.baseScore > 100 ||
    value.cautiousThreshold < 0 ||
    value.constructiveThreshold > 100 ||
    value.cautiousThreshold >= value.constructiveThreshold ||
    (value.marketSnapshot !== undefined &&
      (!isMarketSnapshot(value.marketSnapshot) ||
        value.marketSnapshot.symbol !== value.ticker)) ||
    !value.evidence.every(isEvidenceItem) ||
    !value.assumptions.every(isAssumption)
  ) {
    return false;
  }

  const evidenceIds = value.evidence.map((item) => item.id);
  const assumptionIds = value.assumptions.map((item) => item.id);
  const evidenceIdSet = new Set(evidenceIds);
  return (
    evidenceIdSet.size === evidenceIds.length &&
    new Set(assumptionIds).size === assumptionIds.length &&
    value.evidence.every((item) =>
      (item.dependsOnIds ?? []).every(
        (dependencyId) =>
          dependencyId !== item.id && evidenceIdSet.has(dependencyId),
      ),
    )
  );
}
