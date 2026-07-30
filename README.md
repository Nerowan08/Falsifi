# Falsifi

> **See how your stock-thesis material groups by source.**

Falsifi is an open-source tool for sorting stock-research material by source.
Pick a listed stock and add the material you used. Writing a claim is optional.
Falsifi groups matching links and items that you mark as coming from the same
source. It then shows:

1. how many user-added materials are in the record;
2. how many source groups the current record identifies;
3. which items are grouped together.

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

Falsifi keeps the job small:

```text
your material
→ matching links and user-confirmed relationships
→ source groups
```

There is no required research sequence. After opening a workspace, the user
chooses whether to add material, edit the claim, or inspect the source groups.
Market data and optional review notes do not control the grouping result.

## What v0.6 changes

- **One clear landing-page task.** Falsifi no longer presents itself as a
  general stock-analysis dashboard.
- **The user chooses what to do.** Adding material, editing the claim, and
  reviewing groups are available without a forced sequence or automatic
  follow-up dialog.
- **A clear output without subjective scores.** The main view reports material
  count, source-group count, and grouped items. It does not need user-entered
  0–100 impact or confidence numbers.
- **Matching links stay together.** Common tracking parameters, page fragments,
  host casing, and trailing slashes cannot make the same link look like several
  sources. Users may group more items together, but cannot split a matching
  link into several groups.
- **User material only.** Automatic price observations remain optional market
  context and do not count as user-added material. Missing price history never
  blocks source grouping.
- **Simple material entry.** Users add a title and link, then may record the
  publisher, date, review status, and a same-source relationship.
  Unchecked material remains clearly labeled.
- **Progressive disclosure.** The claim, source relationships, and compact
  market context appear in one record. Secondary information stays out of the
  way.
- **Four languages and a rewritten guide.** English, Simplified Chinese,
  Japanese, and Spanish now explain the same focused task and its limits.

## When material is grouped

Falsifi forms connected source groups from:

- HTTP(S) links that match after common tracking parts are removed;
- a shared stored source identifier;
- a same-source relationship added by the user.

A shared factual claim or logical dependency does not merge two sources:
independent publishers can report the same fact.

Before comparing links, Falsifi removes common tracking parameters and page
fragments, makes host names consistent, and handles trailing slashes. It keeps
query parameters that may point to different documents. Different links are
**not** automatically declared independent, and the tool does not claim to
find every copied or republished article on the internet.

Example:

```text
8 manually added copies of the same link
→ 8 user-added materials
→ 1 source group
→ 7 items grouped with another item
```

## Basic use

- Search a U.S., mainland China, or Hong Kong listed equity.
- Add the material you want to organize, in any order.
- Write a claim if it helps you keep the material in context.
- If two items come from the same document, dataset, interview, or
  republication chain, link them.
- Review the groups and edit any relationship that is wrong.

Review dates, invalidation conditions, and contrary material can be useful, but
they are optional and do not block source grouping.

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
components/falsify-workspace User-controlled source-group workspace
components/user-guide        Four-language practical guide
lib/evidence-audit.ts        Weight-free primary evidence-structure output
lib/falsifi.ts               Canonical grouping and deterministic model engine
lib/readiness.ts             Optional research-status suggestions
lib/market.ts                Market normalization and background metrics
tests/                       Engine, grouping, locale, market, and worker tests
```

## Honest differentiation

Thesis journals, source links, AI research tools, and provenance systems
already exist. Falsifi does not claim to be the first or only product in this
area. Its current focus is simply:

```text
matching links stay together
+ user-confirmed same-source relationships
+ a primary “materials → source groups” output
```

This describes the product, not a claim that no other public, private, or
undocumented tool can do the same thing. See
[docs/UNIQUENESS.md](./docs/UNIQUENESS.md).

## Privacy and disclaimer

The active record and saved reviews stay in the browser unless exported. There
is no account, telemetry, or brokerage connection.

Falsifi is an educational research-record tool. It does not provide investment
advice, recommendations, forecasts, suitability assessments, or trade
execution. Evidence grouping describes the supplied record; it does not prove
truth, quality, statistical independence, or future returns. Investing can
lose principal.

Code is available under the [MIT License](./LICENSE).
