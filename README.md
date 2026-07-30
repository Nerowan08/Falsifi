# Falsifi

> **See how your stock-thesis material groups by source.**

Falsifi is an open-source source-group checker for stock theses. Give it
one listed stock, one concrete claim, and the material behind that claim. It
groups matching canonical URLs and explicit same-source relationships, then
reports:

1. how many user-added materials are in the record;
2. how many source groups the current record identifies;
3. which items collapse into an existing group; and
4. the one missing research action to complete next.

It does **not** predict returns, calculate target prices, recommend trades, or
prove a thesis true.

[简体中文](./README.zh-CN.md) ·
[Method](./docs/METHODOLOGY.md) ·
[Product and competitor audit](./docs/UNIQUENESS.md) ·
[Data-source boundaries](./DATA_SOURCES.md)

Live app: [thesis-trace.nerowan22.chatgpt.site](https://thesis-trace.nerowan22.chatgpt.site)

## The single job

Eight articles can still trace to one source when all eight repeat the same
filing, dataset, interview, or republication chain. Link count is not source
diversity.

Falsifi turns that problem into one reproducible workflow:

```text
choose one stock + write one claim
→ define what would weaken it
→ add original and contrary material
→ group matching URLs and declared same-source material
→ show the source groups identified in the current record
→ identify the next missing research action
```

The first screen contains one stock field, one thesis field, and one primary
button. Market charts, rule scores, scenario sliders, dependency pages, and
history are not part of the primary product path.

## What v0.6 changes

- **One clear landing-page task.** Falsifi no longer presents itself as a
  general stock-analysis dashboard.
- **One action per state.** The workflow moves through claim definition,
  evidence entry, and evidence-diversity review.
- **Primary output without subjective scores.** The main card reports material
  count, connected source groups, grouped items, and the next gap. User-entered
  0–100 impact and confidence numbers are no longer required in the normal form.
- **Canonical-URL enforcement.** Tracking parameters, fragments, host casing,
  and trailing slashes cannot make the same document appear independent.
  User labels may join more material but cannot split an identical canonical
  URL into multiple groups.
- **User evidence only.** Automatic price observations remain optional delayed
  market context and cannot satisfy original-source, contrary-evidence, or
  source-diversity requirements. Missing or short price history never blocks
  the evidence workflow.
- **Simpler evidence entry.** Users record the fact, publisher, link, date,
  direction, how they checked it, and whether it shares an underlying source
  with another item. Unverified material remains visible but cannot complete
  review-readiness checks. Optional qualitative importance replaces arbitrary
  percentages.
- **Progressive disclosure.** The claim, source relationships, and compact
  market context appear in a single vertical record. Secondary information is
  collapsed by default.
- **Four languages and a rewritten guide.** English, Simplified Chinese,
  Japanese, and Spanish now explain the same focused task and its limits.

## Accurate grouping rules

Falsifi forms connected source groups from:

- the same canonical HTTP(S) URL;
- a shared stored source identifier;
- an explicit same-source relationship to another evidence item.

A shared factual claim or logical dependency does not merge two sources:
independent publishers can report the same fact.

The canonical URL removes common tracking parameters and fragments, normalizes
the host, preserves meaningful query parameters, and normalizes the trailing
slash. Different links are **not** automatically declared independent, and the
tool does not claim to find every syndication chain on the internet.

Example:

```text
8 manually added copies of the same canonical URL
→ 8 user-added materials
→ 1 source group
→ 7 items grouped with another item
```

## Use it

1. Search a U.S., mainland China, or Hong Kong listed equity.
2. Write one specific stock thesis.
3. Record an observable condition that would weaken it and a future review
   date.
4. Add an issuer or regulatory original document that you read.
5. Add a credible fact that challenges the thesis.
6. Connect material that traces to the same document, dataset, interview, or
   republication chain.
7. Read the source-group count and complete the single suggested next action.

Delayed Yahoo Finance data supplies only compact market context. The adapter is
undocumented and suitable for personal or self-hosted evaluation, not a public
commercial market-data service. See [DATA_SOURCES.md](./DATA_SOURCES.md).

## Run locally

Requires Node.js `>=22.13.0`.

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

Production build:

```bash
npm run build
```

## Repository map

```text
app/                         Product route and same-origin market endpoints
components/market-workspace  Focused stock-and-thesis entry
components/falsify-workspace Single evidence-card workflow
components/user-guide        Four-language practical guide
lib/evidence-audit.ts        Weight-free primary evidence-structure output
lib/falsifi.ts               Canonical grouping and deterministic model engine
lib/readiness.ts             Missing-requirement and next-action selection
lib/market.ts                Market normalization and background metrics
tests/                       Engine, grouping, locale, market, and worker tests
```

## Honest differentiation

Thesis journals, invalidation conditions, AI bull/bear analysis, alerts,
decision history, primary-source links, and scenario testing already exist.
Falsifi does not claim to be the world’s first.

The narrow gap found in the public product review is the combination of:

```text
same-source relationship grouping
+ canonical-URL anti-splitting
+ a primary “materials → source groups” output
+ a deterministic next missing evidence action
```

This is a bounded positioning claim, not proof that no private or undocumented
tool offers the same workflow. See [docs/UNIQUENESS.md](./docs/UNIQUENESS.md).

## Privacy and disclaimer

The active record and saved reviews stay in the browser unless exported. There
is no account, telemetry, or brokerage connection.

Falsifi is an educational research-record tool. It does not provide investment
advice, recommendations, forecasts, suitability assessments, or trade
execution. Evidence grouping describes the supplied record; it does not prove
truth, quality, statistical independence, or future returns. Investing can
lose principal.

Code is available under the [MIT License](./LICENSE).
