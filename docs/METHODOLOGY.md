# Methodology

Falsifi treats an investment thesis as an explicit, testable model rather than
a block of persuasive prose. Every result is deterministic for the same valid
case JSON and engine version.

## 1. Case score

For base score `b`, evidence items `i`, and assumptions `j`:

```text
score =
  b
  + Σ direction_i × impact_i × reliability_i
  + Σ (value_j − baseline_j) × impact_per_unit_j × direction_j
```

The score is clamped to `[0, 100]`. User-defined thresholds divide it into
`Constructive`, `Balanced`, and `Cautious` research postures.

The score is not a probability, forecast, expected return, or suitability
assessment.

## 2. Item ablation

For every enabled evidence item, the engine removes that item, recomputes the
case, and records the actual score delta and resulting posture. This is a
removal-based explanation of the configured model.

Removing an observation does not mean its opposite is true, and it does not
establish a real-world causal effect.

## 3. Evidence independence

Flat evidence lists often double-count the same underlying information. v0.3
groups enabled items into independent roots when they share:

- an explicit `originId`;
- an explicit `claimId`; or
- a `dependsOnIds` edge.

The dependency graph is treated as undirected for clustering. Root diagnostics
include:

- raw item count and independent-root count;
- duplicate count;
- root contribution shares and Herfindahl concentration (`Σ share²`);
- roots containing both supporting and contradicting items;
- evidence older than the configured freshness window; and
- score effects from removing each source group.

These diagnostics do not silently change the base score. Users remain
responsible for declaring dependencies correctly.

## 4. Minimum item and independent-root flips

The legacy item-level test enumerates evidence subsets in increasing
cardinality, currently through four items:

```text
argmin |E′| such that posture(case − E′) ≠ posture(case)
```

The v0.3 independent test performs the same search over evidence roots, removing
every linked item together:

```text
argmin |R′| such that posture(case − evidence(R′)) ≠ posture(case)
```

When a flip is found at cardinality `k ≤ 4`, minimal cardinality is exact.
When there are more than four roots and no flip is found, the result explicitly
reports that the search was not exhaustive. “Not found” is not proof of
robustness.

## 5. Single-variable assumption cliff

Each assumption is swept in both directions using its declared step and bounds.
All other inputs stay fixed. Candidate flips are ranked by:

```text
|value − current| / max(typicalShock, step)
```

This is ceteris-paribus sensitivity analysis, not a forecast or causal model.

## 6. Joint flip frontier

The joint search evaluates every pair of assumptions. Each variable is tested
inside both its declared `[min, max]` range and `current ± 2 × typicalShock`.
States in which both variables change are scored and filtered to posture flips.

Candidates are ranked by normalized distance:

```text
z_j = (candidate_j − current_j) / typicalShock_j
distance = sqrt(z_1² + z_2²)
```

Within each variable pair and directional quadrant, dominated paths are
removed. The closest five frontier points are returned, with `L∞` and a stable
lexicographic order as tie-breakers.

The exhaustive-state budget is 100,000. If the full pair grid would exceed it,
all pairs receive a deterministic equal-stride sample and the result marks
`exact: false`, along with planned/evaluated state counts and the actual
resolution stride.

The frontier does not infer variable correlations or claim that a tested
combination is economically feasible.

## 7. Three evidence stress semantics

For the current minimum item-level flip set, Falsifi compares:

| Mode | Operation | Question answered |
|---|---|---|
| Remove | contribution becomes zero | What if this evidence were unavailable? |
| Degrade | reliability is multiplied by `0.5` | What if this source deserved less trust? |
| Contradict | direction is reversed | What if equally strong contrary evidence appeared? |

These operations answer different counterfactual questions. Their scores should
not be interpreted as interchangeable.

## 8. Stability score

The visible stability diagnostic remains:

```text
35% × evidence buffer
+ 25% × nearest assumption buffer
+ 40% × score margin to the posture threshold
```

- Evidence buffer: minimum item flip size divided by three, capped at one.
- Assumption buffer: nearest cliff distance divided by typical shock, capped at
  one.
- Score margin: distance to the relevant threshold divided by 9.5 points,
  capped at one.

This is a comparative fragility diagnostic, not a financial-risk estimate.

## 9. Snapshot fingerprint

The browser canonicalizes case JSON by sorting object keys and generates a
SHA-256 digest. A changed case creates a changed digest. The corresponding case
state can be restored locally.

SHA-256 proves content equality, not when the content existed or who created
it. The snapshot is not a digital signature, blockchain, trusted timestamp, or
tamper-proof registry.

## Known limitations

- User-defined weights and thresholds can encode bias.
- Dependencies are declared, not automatically verified from URLs or text.
- Root grouping prevents some double counting but is not a causal graph.
- The pairwise frontier can miss interactions involving three or more
  assumptions.
- Tested parameter combinations can be unrealistic.
- Source reliability is a judgment, not a calibrated measurement.
- A stable thesis can still lose money; a fragile thesis can still make money.
