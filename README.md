# Falsifi

> **Find what would flip your view.**

Falsifi is an open-source, source-linked stress-testing workspace for stock
research. It does not produce another buy/sell signal. It makes a research case
explicit, tests which changes would alter the current assessment, and preserves
the exact state for later review.

[简体中文](./README.zh-CN.md) · [Methodology](./docs/METHODOLOGY.md) ·
[Landscape review](./docs/UNIQUENESS.md) · [Data sources](./DATA_SOURCES.md)

Live app: [thesis-trace.nerowan22.chatgpt.site](https://thesis-trace.nerowan22.chatgpt.site)

## Why this exists

Most AI stock tools ask, “What should I buy?”

Falsifi asks a more disciplined question: “What is the smallest tested change
that would alter my current assessment?”

The result is a debugger for investor reasoning—not an oracle, probability
model, or trading system.

## What v0.4 includes

- **Real stock entry point** — search or enter U.S., mainland China, and Hong
  Kong symbols instead of landing in a fictional demo.
- **Source-linked market snapshot** — loads one year of delayed daily prices,
  shows market time, retrieval time, and source details, and calculates
  returns, annualized volatility, maximum drawdown, Wilder RSI, moving averages,
  and recent volume relative to its 20-session average. A complete adjusted-close
  series is used when available; otherwise the full ordinary-close series is
  used, and the interface labels the actual basis.
  Analysis requires at least 200 valid daily observations.
- **Inspectable case generation** — converts those market observations into a
  non-demo technical starting case. Every generated item remains editable and
  cites its upstream market series. The generated case is not a return
  forecast.
- **Evidence dependency check** — groups items that share an original source,
  underlying claim, or declared dependency. Separate groups are not proof of
  statistical independence, and grouping does not automatically change any
  assigned weight.
- **Smallest tested assessment change** — removes whole related evidence groups
  and finds the smallest tested group set that crosses an assessment threshold.
- **Two-variable threshold combinations** — searches pairs of scenario inputs
  inside declared ranges and returns the closest normalized combinations that
  cross a threshold.
- **Three evidence test modes** — compares excluding evidence, reducing its
  confidence weight by half, and reversing its direction.
- **Score change if excluded** — removes each enabled item and recomputes the
  rule score. It is a model explanation, not a causal estimate or backtest.
- **One-variable sensitivity** — finds the nearest tested change in one
  scenario input while the other inputs stay fixed.
- **Source-type exclusion and freshness checks** — recomputes the case after
  excluding each source category and identifies observations older than the
  configured window.
- **Local evidence list** — add, edit, disable, search, and delete sourced
  observations without creating an account.
- **Restorable SHA-256 snapshots** — freezes canonical case JSON for local
  version comparison. This is a content fingerprint, not a trusted timestamp.
- **Four interface languages** — English, Simplified Chinese, Japanese, and
  Spanish. Generated case text follows the selected language; user-authored
  research is never silently translated.
- **Built-in practical guide** — the header and stock-search page both link to
  a complete four-language walkthrough of the data, controls, limits, local
  storage, and common errors.
- **Local-first workspace** — no telemetry, database, brokerage connection, or
  user account is required. A network request is required to load market data.

## Quick start

Requirements: Node.js `>=22.13.0`.

```bash
npm ci
npm run dev
```

Quality gates:

```bash
npm run lint
npm run typecheck
npm test
```

Production Worker build:

```bash
npm run build
```

## Analyze a real stock

1. Choose U.S., A-share, Hong Kong, or all markets.
2. Search by company name or enter a ticker such as `AAPL`, `603901`,
   `002441`, or `0700.HK`.
3. Select the company. Falsifi retrieves delayed daily history and builds the
   initial case. Only listed equities with at least 200 valid daily
   observations are accepted; ETFs, indexes, futures, FX, and crypto are
   rejected.
4. Add regulatory filings, management disclosures, or third-party research in
   **Evidence**. Market-derived observations intentionally share one related
   evidence group because they come from one market series. Review or adjust
   their weights yourself; grouping reports the relationship but does not
   reweight the score.
5. Change scenario inputs, save a snapshot, or export the complete case JSON.

The built-in Yahoo Finance chart/search adapter is undocumented and intended
for personal or self-hosted evaluation. It can be delayed, throttled, or
changed upstream. A licensed provider is required before operating a public
commercial data service. See [Data sources](./DATA_SOURCES.md).

The machine-readable schema is
[`data/case.schema.json`](./data/case.schema.json). A starter case is in
[`examples/case-template.json`](./examples/case-template.json).

## Deterministic engine

For the same valid case JSON and engine version, Falsifi returns the same
result. The core engine is pure TypeScript with no network dependency.

- related-group removal search is exact through four groups;
- two-variable search is exhaustive until the 100,000-state limit, then
  switches to deterministic sampling and reports that fact;
- an absent result means “not found inside the tested bounds,” not proof that a
  thesis is true or robust.

See [`docs/METHODOLOGY.md`](./docs/METHODOLOGY.md) for the formulas and search
boundaries.

## Optional SEC filing data

The SEC `data.sec.gov` API requires a descriptive `User-Agent` with contact
information:

```bash
export SEC_USER_AGENT="Falsifi research you@example.com"
npm run sec:fetch -- --ticker AAPL --output outputs/sec/aapl.json
```

For a comma-separated watchlist:

```bash
npm run sec:fetch -- --tickers AAPL,MSFT,NVDA --output outputs/sec
```

The adapter keeps the XBRL tag, unit, filing period, form, accession number,
filing date, and source URL attached to each observation. It does not scrape
exchange websites or redistribute vendor feeds.

## Repository map

```text
app/                    Multilingual product and same-origin market routes
components/             Real-stock picker and market snapshot UI
lib/falsifi.ts          Deterministic stress-testing engine
lib/i18n.ts             Four-language core UI
lib/market.ts           Market normalization, metrics, and case generation
lib/demo.ts             Synthetic engine test fixture (not the landing page)
data/                   JSON schema
examples/               Importable case template
scripts/fetch-sec.mjs   Optional official SEC adapter
tests/                  Engine and rendered-worker tests
docs/                   Method, architecture, and landscape audit
```

## Honest differentiation

Individual ideas such as thesis tracking, scenario analysis, counterfactual
explanations, evidence records, and SHA-256 evidence packs already exist.
Falsifi’s distinction is their integration into an evidence-first workflow:

```text
evidence relationship graph → related-group removal test
                            → one- and two-variable sensitivity
                            → restorable local versions
```

Our public landscape scan found no exact open-source equivalent, but this is
not a “world first” claim. Private, unpublished, and unindexed systems cannot be
verified. Read the evidence and comparison matrix in
[`docs/UNIQUENESS.md`](./docs/UNIQUENESS.md).

## What Falsifi does not do

- No personalized investment advice or suitability assessment
- No buy/sell recommendation or target price
- No autonomous trading or brokerage connection
- No promise of alpha, accuracy, or future returns
- No claim that a research score is a probability
- No automatic translation that overwrites the original research text

## Security, privacy, and licensing

Code is released under the [MIT License](./LICENSE). Third-party data are not.
Local research can still be sensitive; exported files are the user’s
responsibility. See [`SECURITY.md`](./SECURITY.md) and
[`DATA_SOURCES.md`](./DATA_SOURCES.md).

## Disclaimer

Falsifi is an educational research and decision-journaling tool. It does not
provide investment advice, recommendations, forecasts, suitability assessment,
or trade execution. Scores are user-defined research constructs, not objective
odds. Market data can be delayed, incomplete, or unavailable; historical returns
may use adjusted or ordinary closing prices as labeled. Verify primary sources.
Investing involves risk, including loss of principal.
