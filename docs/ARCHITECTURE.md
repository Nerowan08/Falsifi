# Architecture

## Product layers

```text
Multilingual browser UI
  ├── real-stock search and clearly labeled market context
  ├── research claim, invalidation condition, purpose, and review date
  ├── readiness checks and next-research-action summary
  ├── local evidence editor and related-evidence-group audit
  ├── baseline comparison and refresh
  ├── bounded group-removal and scenario sensitivity diagnostics
  ├── JSON import/export
  └── restorable SHA-256 snapshot history
        │
Same-origin market routes
  ├── symbol validation and market normalization
  ├── bounded upstream fetch with a secondary host
  ├── normalized one-year price history
  └── explicit cache, source, delay, and failure states
        │
Deterministic TypeScript engine
  ├── group-aware scoring and item-removal recalculation
  ├── source / claim / dependency relationship grouping
  ├── smallest tested item and related-group changes
  ├── one- and two-variable counterfactual search
  ├── exclude / lower-confidence / reverse-direction modes
  └── model-robustness and freshness diagnostics
        │
Additional adapters
  └── SEC submissions and CompanyFacts (Node / GitHub Actions)
```

The deployed product does not require a database. Browser storage contains the
device-local case, snapshot history, and interface locale. The pure engine and
readiness checks have no network dependency, paid API, model call, or random
state.

## Decision boundary

The market adapter answers “what has the price series done?” It does not answer
“why should this stock be owned?” or “what will it return?” Automatically
generated moving averages, momentum, volatility, drawdown, RSI, and volume
observations are therefore labeled as market context.

The research-readiness layer is a separate deterministic workflow gate. It
requires a user-confirmed research claim, an observable invalidation condition,
primary material, counter-evidence, source diversity, and a review date. Passing
the gate means that the required fields exist; it does not validate the truth,
quality, or completeness of the research.

Advanced score and sensitivity outputs are model diagnostics. They are not
buy/sell signals, forecasts, confidence probabilities, suitability assessments,
or measures of investment safety.

## Data contracts

`schemaVersion: 1` remains backward compatible. v0.3 added optional evidence
provenance fields:

- `originId`: common underlying source;
- `claimId`: common underlying claim;
- `dependsOnIds`: explicit evidence dependencies; and
- `relation`: `direct`, `derived`, or `duplicate`.

The runtime validator rejects self-references and dangling dependencies. Old v1
case files without these fields continue to work, with each unlinked item
treated as its own related group.

v0.4 added an optional `marketSnapshot` with instrument metadata, fetch and
market timestamps, normalized daily observations, calculated metrics, and a
source URL. Imported cases without a snapshot remain valid.

v0.5 adds an optional `researchPlan`:

- `purpose`: new research, holding review, or watchlist;
- `thesisConfirmed`: whether the displayed claim is the user’s actual claim;
- `invalidationCriteria`: an observable condition that would disconfirm the
  claim; and
- `nextReviewDate`: the planned review date.

The optional object preserves backward compatibility. An older case without a
research plan is valid but does not pass the readiness gate.

## Group-aware evidence model

`originId`, `claimId`, and `dependsOnIds` connect evidence that reuses an
underlying source or claim. The engine builds connected related evidence groups.
For enabled items, it:

1. calculates each item’s signed weighted contribution;
2. averages items with the same declared source-and-claim pair into one
   argument unit;
3. averages those argument units inside each related evidence group; and
4. adds the resulting group contributions to the case score.

This prevents duplicated items from one declared source from multiplying that
source’s model contribution. It does not detect an undeclared relationship,
prove statistical independence between groups, or establish causality.

The readiness layer applies a separate source-diversity rule: at least three
related evidence groups and at least two user-added evidence items. Market-
derived items do not satisfy the primary-source or counter-evidence checks.

## Search boundaries

- Item-level smallest-change search: exhaustive through four evidence items.
- Related-group minimum change: exhaustive through four evidence groups.
- Two-variable search: every scenario-input pair, with a 100,000-state global budget.
- Dense joint grids are sampled deterministically and marked non-exact.

Search metadata is returned with every advanced result so the UI does not
present a heuristic or bounded absence as mathematical proof. A “not found”
result means only that no threshold change was found within the tested bounds.

## Baseline and action summary

Saving a snapshot stores the complete canonical case locally. On a later
review, the current market snapshot can be compared with the latest saved case
for the same instrument. The comparison is descriptive: it reports tracked
market-context changes and does not infer a cause or expected return.

The action selector chooses the first incomplete readiness requirement. When
the case is reviewable but has no saved snapshot, it recommends saving a
baseline. This ordering is explicit and deterministic; it is not generated by
an AI model.

## Internationalization boundary

Stable UI strings live in `lib/i18n.ts` and the market workspace copy for
English, Simplified Chinese, Japanese, and Spanish. System-generated market
cases use the locale selected at creation time.

Imported and user-authored text remains verbatim. Switching the interface
language never rewrites evidence, notes, sources, or exported JSON.

## Trust boundary

- UI state and user-entered research remain in the browser.
- API keys are never accepted in browser code.
- The SEC adapter runs in Node or GitHub Actions.
- The current keyless market adapter is explicitly experimental and suitable
  only for personal/self-hosted evaluation.
- Public or commercial deployments must use a licensed provider adapter.
- A local SHA-256 fingerprint is not a trusted timestamp or signature.

## Extension points

Future adapters should emit provenance-rich observations with instrument
identity, metric/tag, value and unit, period, filed/fetched timestamps, source
URL, freshness, licensing profile, and caveats.

Adapters should not silently turn raw observations into investment
recommendations or overwrite original-language evidence.
