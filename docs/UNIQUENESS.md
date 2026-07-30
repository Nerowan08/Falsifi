# Public landscape and uniqueness audit

**Scan date:** July 30, 2026  
**Scope:** publicly indexable open-source repositories and public product
pages related to equity research, thesis tracking, scenario analysis,
counter-evidence, and research provenance.

## Short conclusion

We found no public open-source project with the same integrated workflow as
Falsifi v0.3:

```text
provenance-aware evidence roots
→ measured item and root ablation
→ minimum evidence flip
→ one- and two-variable assumption cliffs
→ remove / degrade / contradict semantics
→ restorable SHA-256 local snapshots
```

This supports the claim that Falsifi has a **distinct integrated workflow**. It
does **not** support “world first,” “never done before,” or ownership of any
individual method. Private institutional systems, unpublished projects, and
unindexed products cannot be verified.

Confidence in the public/open-source landscape conclusion is approximately
`0.8`. Confidence in any global first claim would be low.

## Closest public projects

| Project | Closest overlap | Difference visible in public materials |
|---|---|---|
| [Mira](https://github.com/byteseek/Mira) | Claim-level evidence logs, source registry, disconfirming evidence, expectation maps, decision logs, refresh conditions, translation provenance | No public implementation found for calculated minimum evidence flips, measured row ablation, or a numeric assumption cliff |
| [FundOps](https://github.com/jhchang0407-lang/fundops) | Source-backed evidence, thesis health, versioned constitution, monitoring plans, superseding artifacts, SEC-driven refresh | No public minimum-flip search, ablation matrix, or numeric counterfactual frontier found |
| [StockSense-AI](https://github.com/Spkap/StockSense-AI) | Bull/bear/skeptic workflow, claim-level counter-evidence, evidence grading, kill criteria, thesis history | No public evidence-root minimum flip, real deletion rerun, or content-addressed local snapshot found |
| [Thesis Investment OS](https://github.com/youngseongshin/thesis-investment-os) | Thesis, evidence, action, prediction, and feedback separation; invalidation; local-first audit trail | No public numeric assumption cliff or evidence-subset flip search found |
| [MingCang](https://github.com/Zeeechenn/MingCang) | Local-first A-share research cases, counter-evidence, debate, review, outcome-gated memory | No public deterministic thesis-robustness engine with minimum roots and a joint frontier found |
| [ThesisLoop](https://thesisloop.ai/) | Cited insights, assumptions, counter-evidence, catalysts, monitoring, bull/base/bear mapping | No public minimum evidence flip, measured ablation, or SHA case fingerprint found |
| [Chartloom Scenario Lab](https://www.chartloom.com/feature/scenario-lab) | Interactive growth and margin scenarios with immediate valuation changes | No provenance-aware evidence ledger or evidence-removal stress test found |
| [Pantheon Research](https://github.com/0xjacobzhao-byte/pantheon-research-qwen-hackathon) | SHA-256 evidence packs, evidence lineage, model disagreement, human-review gates | No public thesis minimum-flip mechanism or assumption-frontier search found |
| [Horyzon Thesis Tracker](https://horyzonapp.com/investment-thesis-tracker/) | Records why an asset is owned, what would change the view, and review dates | Primarily a record and review workflow rather than a deterministic perturbation engine |
| [AimyTrade](https://aimytrade.io/) | Markets a pre-trade thesis stress test intended to challenge conviction | Public materials do not expose Falsifi’s reproducible evidence-root, ablation, frontier, and local snapshot mechanics |

## Capability matrix

`●` visible native capability · `◐` partial or adjacent capability · `—` not
found in the public material reviewed

| Product | Thesis + evidence | Disconfirmation | Numeric scenarios | Minimum evidence flip | Measured ablation | Version trail | SHA content fingerprint |
|---|---:|---:|---:|---:|---:|---:|---:|
| Falsifi v0.3 | ● | ● | ● | ● | ● | ● | ● |
| Mira | ● | ● | ◐ | — | — | ◐ | — |
| FundOps | ● | ● | — | — | — | ● | — |
| StockSense-AI | ● | ● | ◐ | — | — | ◐ | — |
| Thesis Investment OS | ● | ● | — | — | — | ◐ | — |
| MingCang | ● | ● | ◐ | — | — | ◐ | — |
| ThesisLoop | ● | ● | ◐ | — | — | ◐ | — |
| Chartloom | ◐ | — | ● | — | — | — | — |
| Pantheon Research | ◐ | ◐ | ◐ | — | — | ◐ | ● |
| Horyzon | ● | ● | — | — | — | ◐ | — |

The matrix is a bounded review of public documentation, not a certification of
feature absence.

## Methodological prior art

Falsifi did not invent counterfactual explanation or feature removal:

- [Microsoft’s counterfactual analysis overview](https://learn.microsoft.com/en-us/azure/machine-learning/concept-counterfactual-analysis)
  describes finding the smallest feature changes that produce a different
  decision.
- Covert, Lundberg, and Lee’s
  [Explaining by Removing](https://arxiv.org/abs/2011.14878) unifies a broad
  class of explanation methods that remove inputs and measure the effect.

Therefore:

- `minimum flip` is counterfactual explanation applied to an investment case;
- `measured ablation` is removal-based explanation;
- `assumption cliff` is threshold sensitivity analysis;
- `joint flip frontier` is bounded pairwise counterfactual search; and
- a SHA-256 snapshot is content addressing, not a trusted timestamp.

The defensible innovation is the product integration, explicit search
boundaries, evidence semantics, and interaction design.

## What changed in v0.3

The audit identified three weaknesses that could otherwise make the product
look more novel than it is.

### 1. Evidence independence

Repeated stories can originate from one filing, call, or data release. v0.3
adds `originId`, `claimId`, and declared dependency edges; clusters related
items; reports concentration and conflicts; and searches minimum flips over
whole evidence roots.

This prevents a copied observation from automatically looking like an
independent corroboration. It does not prove that unlinked evidence is truly
independent.

### 2. Joint flip frontier

One-variable-at-a-time cliffs can miss a realistic combination of two modest
changes. v0.3 searches every assumption pair within declared bounds and a
normalized `±2 typical-shock` range, returns non-dominated paths, and reports
whether the search was exhaustive or sampled.

This still does not infer correlations or economic feasibility.

### 3. Stress semantics

Deleting evidence is not the same as observing the opposite. v0.3 calculates
three separate cases:

- **Remove:** the observation is unavailable.
- **Degrade:** its reliability is reduced.
- **Contradict:** equally weighted evidence points in the opposite direction.

The UI keeps these results separate to avoid turning missing information into
false contrary information.

## Claims we can and cannot make

Reasonable:

> Falsifi is an evidence-first investment-thesis stress lab. In our July 2026
> public scan, we found no exact open-source equivalent to its integrated
> provenance-root, minimum-flip, joint-frontier, and restorable-snapshot
> workflow.

Not reasonable:

- “the world’s first AI stock stress test”;
- “no one has ever done this”;
- “a patented/new counterfactual algorithm”;
- “proof that a thesis is correct”;
- “an objective confidence or probability score”; or
- “tamper-proof research history.”

## 中文摘要

截至本次公开检索，没有发现与 Falsifi v0.3 完全同构的开源项目。它最有辨识度
的地方，是把“证据来源依赖审计、整根删项、最小翻转、双变量联合前沿、三种
压力语义和可恢复本地快照”做成一条统一工作流。

但这些单项都有公开先例，全球私有系统也无法核实。因此可以说“公开开源范围
内未发现完全同构者”，不能说“世界首创”或“从来没人做过”。
