# Architecture

## Product layers

```text
Multilingual browser UI
  ├── local case and evidence editor
  ├── independence and source-shock audit
  ├── assumption controls and flip-frontier views
  ├── JSON import/export
  └── restorable SHA-256 snapshot history
        │
Deterministic TypeScript engine
  ├── bounded scoring and item ablation
  ├── provenance-root clustering
  ├── item and independent-root minimum flips
  ├── one- and two-variable counterfactual search
  ├── remove / degrade / contradict semantics
  └── stability and freshness diagnostics
        │
Optional adapters
  └── SEC submissions and CompanyFacts (Node / GitHub Actions)
```

The deployed product does not require a database. Browser storage contains the
device-local case, snapshot history, and interface locale. The pure engine has
no network dependency, paid API, model call, or random state.

## Data contracts

`schemaVersion: 1` remains backward compatible. v0.3 adds optional evidence
provenance fields:

- `originId`: common underlying source;
- `claimId`: common underlying claim;
- `dependsOnIds`: explicit evidence dependencies; and
- `relation`: `direct`, `derived`, or `duplicate`.

The runtime validator rejects self-references and dangling dependencies. Old v1
case files without these fields continue to work, with each unlinked item
treated as its own root.

## Search boundaries

- Item minimum flip: exhaustive through four evidence items.
- Independent minimum flip: exhaustive through four evidence roots.
- Joint frontier: every assumption pair, with a 100,000-state global budget.
- Dense joint grids are sampled deterministically and marked non-exact.

Search metadata is returned with every advanced result so the UI does not
present a heuristic or bounded absence as mathematical proof.

## Internationalization boundary

Stable UI strings live in `lib/i18n.ts` for English, Simplified Chinese,
Japanese, and Spanish. The bundled synthetic case has explicit localized copy
looked up by stable IDs.

Imported and user-authored text remains verbatim. Switching the interface
language never rewrites evidence, notes, sources, or exported JSON.

## Trust boundary

- UI state and user-entered research remain in the browser.
- API keys are never accepted in browser code.
- The SEC adapter runs in Node or GitHub Actions.
- Vendor feeds are intentionally absent from the public demo.
- Synthetic data are labeled throughout the interface.
- A local SHA-256 fingerprint is not a trusted timestamp or signature.

## Extension points

Future adapters should emit provenance-rich observations with instrument
identity, metric/tag, value and unit, period, filed/fetched timestamps, source
URL, freshness, licensing profile, and caveats.

Adapters should not silently turn raw observations into investment
recommendations or overwrite original-language evidence.
