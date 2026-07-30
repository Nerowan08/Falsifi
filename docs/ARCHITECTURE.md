# Architecture

## Product layers

```text
Multilingual browser UI
  ├── real-stock search and source-linked market snapshot
  ├── local case and evidence editor
  ├── evidence dependency and source-type exclusion checks
  ├── scenario controls and one- / two-variable sensitivity views
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
  ├── bounded scoring and item-removal recalculation
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
device-local case, snapshot history, and interface locale. The pure engine has
no network dependency, paid API, model call, or random state.

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

v0.4 adds an optional `marketSnapshot` with instrument metadata, fetch and
market timestamps, normalized daily observations, calculated metrics, and a
source URL. Imported cases without a snapshot remain valid.

## Search boundaries

- Item-level smallest-change search: exhaustive through four evidence items.
- Related-group minimum change: exhaustive through four evidence groups.
- Two-variable search: every scenario-input pair, with a 100,000-state global budget.
- Dense joint grids are sampled deterministically and marked non-exact.

Search metadata is returned with every advanced result so the UI does not
present a heuristic or bounded absence as mathematical proof.

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
