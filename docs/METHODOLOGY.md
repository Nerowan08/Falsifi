# Methodology

Falsifi treats an investment thesis as an explicit, testable model rather than
a block of persuasive prose. Every result is deterministic for the same valid
case JSON and engine version.

## 1. Case score

For base score `b`, evidence items `i`, and scenario inputs `j`:

```text
score =
  b
  + Σ evidence_sign_i × impact_i × reliability_i
  + Σ (value_j − baseline_j) × impact_per_unit_j × input_direction_j
```

The first summation adds each enabled evidence item. `evidence_sign` is `+1`
for supporting evidence and `−1` for weakening evidence. The second adds each
scenario input’s change from its baseline; `input_direction` is the configured
slope sign (`+1` or `−1`) for that input.

The score is clamped to `[0, 100]`. User-defined thresholds divide it into
favorable, neutral, and cautious assessments. With the current defaults, the
ranges are `score ≥ 58`, `42 ≤ score < 58`, and `score < 42`, respectively.

The score is not a probability, forecast, expected return, or suitability
assessment.

## 2. Score change if an item is excluded

For every enabled evidence item, the engine removes that item, recomputes the
case, and records the score delta and resulting assessment. This explains the
configured rule model; it is not a backtest.

Removing an observation does not mean its opposite is true, and it does not
establish a real-world causal effect.

## 3. Evidence dependency grouping

Flat evidence lists can reuse the same underlying information. Falsifi places
enabled items in the same **related evidence group** when they share:

- an explicit `originId`;
- an explicit `claimId`; or
- a `dependsOnIds` edge.

The relationship graph is treated as undirected for grouping. Diagnostics
include:

- enabled item count and related-group count;
- the number of items consolidated into those groups;
- each group’s share of absolute rule-score influence and an internal
  0–100 influence-concentration measure;
- groups containing both supporting and weakening items;
- evidence older than the configured freshness window; and
- score effects from excluding each source category.

This process does not prove statistical independence, detect copied text, or
automatically change the base score. Users remain responsible for declaring
relationships and reviewing, disabling, or editing weights when several items
reuse the same information.

## 4. Smallest tested item and related-group changes

The item-level test enumerates evidence subsets in increasing cardinality,
currently through four items:

```text
argmin |E′| such that assessment(case − E′) ≠ assessment(case)
```

The related-group test performs the same search over groups, excluding every
linked item together:

```text
argmin |G′| such that assessment(case − evidence(G′)) ≠ assessment(case)
```

When a flip is found at cardinality `k ≤ 4`, minimal cardinality is exact.
When there are more than four groups and no change is found, the result explicitly
reports that the search was not exhaustive. “Not found” is not proof of
robustness.

## 5. One-variable sensitivity analysis

Each scenario input is swept in both directions using its declared step and bounds.
All other inputs stay fixed. Candidate assessment changes are ranked by:

```text
|value − current| / max(typicalShock, step)
```

This is ceteris-paribus sensitivity analysis, not a forecast or causal model.

## 6. Two-variable threshold combinations

The joint search evaluates every pair of scenario inputs. Each variable is tested
inside both its declared `[min, max]` range and `current ± 2 × typicalShock`.
States in which both variables change are scored and filtered to assessment
changes. A returned pair can have `requiresBoth: false` when either one-variable
change already crosses the threshold.

Candidates are ranked by normalized distance:

```text
z_j = (candidate_j − current_j) / typicalShock_j
distance = sqrt(z_1² + z_2²)
```

Within each variable pair and directional quadrant, dominated combinations are
removed. The closest five combinations are returned, with `L∞` distance and a
stable lexicographic order as tie-breakers.

The exhaustive-state budget is 100,000. If the full pair grid would exceed it,
all pairs receive a deterministic equal-stride sample and the result marks
`exact: false`, along with planned/evaluated state counts and the actual
resolution stride.

The search does not infer variable correlations or claim that a tested
combination is economically feasible.

## 7. Three evidence test modes

For the current minimum item-level flip set, Falsifi compares:

| Mode | Operation | Question answered |
|---|---|---|
| Exclude | contribution becomes zero | What if this evidence were unavailable? |
| Lower confidence | confidence weight is multiplied by `0.5` | What if this source deserved less trust? |
| Reverse direction | direction is reversed | What if equally strong contrary evidence appeared? |

These operations answer different counterfactual questions. Their scores should
not be interpreted as interchangeable.

## 8. Model robustness score

The visible model-robustness diagnostic is:

```text
35% × evidence buffer
+ 25% × nearest scenario-input buffer
+ 40% × score margin to the assessment threshold
```

- Evidence buffer: when a change is found, its smallest item count divided by
  three and capped at one. If no change is found, the number of enabled items
  actually tested (up to four) is divided by three and capped at one. A case
  with no enabled evidence receives zero for this component.
- Scenario-input buffer: nearest one-variable threshold distance divided by
  typical change and capped at one.
- Score margin: distance to the relevant assessment threshold divided by 9.5 points,
  capped at one.

This is an internal comparative diagnostic, not stock-price stability,
investment safety, or a financial-risk estimate.

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
- Related-group reporting does not reweight evidence and is not a causal graph.
- The pairwise search can miss interactions involving three or more
  scenario inputs.
- Tested parameter combinations can be unrealistic.
- A confidence weight is a judgment, not a calibrated measurement.
- A case with a high model-robustness score can still lose money; a case with a
  low score can still make money.
