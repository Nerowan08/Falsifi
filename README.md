# Falsifi

> **Trace the sources behind stock research.**

Falsifi is an open-source source audit for stock research. It answers one
question: **how many original sources are your materials actually based on?**

[Open Falsifi](https://thesis-trace.nerowan22.chatgpt.site) ·
[简体中文](./README.zh-CN.md) ·
[Method](./docs/METHODOLOGY.md) ·
[Data sources](./DATA_SOURCES.md)

## The problem

Ten articles can all repeat one filing, interview, press release, or dataset.
Counting links makes the research look more independent than it is.

Falsifi turns:

```text
12 materials → 3 confirmed source groups → 2 relationships to review
```

It then gives one concrete next step: verify an original, review a possible
duplicate, add an independent source, or look for material that challenges the
claim.

## How it works

1. Choose an A-share, Hong Kong, or U.S. listed stock.
2. Ask Falsifi to find public material, or paste your own links.
3. Open the original pages and mark only the material you checked.
4. Review possible source relationships. You decide whether two materials are
   grouped.
5. Follow the next-step prompt to improve the record.

Writing a stock thesis is optional. If you add one, each material can be marked
as supporting, challenging, or not yet classified.

## What is automatic

- Canonically identical links are grouped automatically. Tracking parameters,
  fragments, host casing, `www`, and trailing slashes cannot create fake source
  diversity.
- Highly similar titles published near each other create a review suggestion.
- A news item published near an official filing on the same detected company
  event can create a review suggestion.
- U.S. official filings come from SEC EDGAR; A-share announcements come from
  CNINFO. Yahoo Finance is supplemental.

Approximate matches are **never** merged automatically. Every suggestion states
why it appeared, and the user chooses “group together” or “keep separate.”

## What Falsifi does not do

Falsifi does not predict prices, recommend trades, calculate target prices, or
decide whether a thesis is true. Source grouping measures confirmed provenance
in the current record; it does not prove editorial independence or factual
accuracy.

## Languages and privacy

The interface and guide support English, Simplified Chinese, Japanese, and
Spanish. The active audit is stored in the browser. Falsifi has no account,
telemetry, brokerage connection, or OpenAI API dependency.

For public-material search, the stock identity and visible search terms are
sent only to the named public providers. The user's thesis is never sent.

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

## Repository map

```text
components/source-audit-app.tsx   Focused source-audit interface
lib/source-audit.ts               Explainable relationship suggestions
lib/falsifi.ts                    Canonical URL and confirmed-source grouping
lib/sec.ts                        SEC EDGAR filing adapter
lib/cninfo.ts                     CNINFO announcement adapter
app/api/stocks/materials          Public-material search endpoint
tests/                            Grouping, false-positive, provider, and UI tests
```

## Honest differentiation

Reference managers detect duplicate records, and research platforms cite source
documents. Falsifi's narrower focus is the **source dependency between several
stock-research materials**, with an A-share-first official filing path and a
human confirmation loop. It does not claim to be the world's first or only
tool in this category. See [the product audit](./docs/UNIQUENESS.md).

MIT licensed. Investing can lose principal.
