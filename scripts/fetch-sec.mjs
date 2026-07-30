#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);

function readArg(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

const singleTicker = readArg("--ticker");
const tickerList = readArg("--tickers");
const outputArg = readArg("--output") ?? "outputs/sec";
const tickers = (tickerList ?? singleTicker ?? "")
  .split(",")
  .map((ticker) => ticker.trim().toUpperCase())
  .filter(Boolean);
const userAgent = process.env.SEC_USER_AGENT?.trim();

if (!tickers.length) {
  console.error(
    "Usage: node scripts/fetch-sec.mjs --ticker AAPL --output outputs/sec/aapl.json",
  );
  process.exit(2);
}

if (!userAgent || !userAgent.includes("@")) {
  console.error(
    "SEC_USER_AGENT is required and should include contact information, for example: Falsifi research you@example.com",
  );
  process.exit(2);
}

const headers = {
  Accept: "application/json",
  "Accept-Encoding": "gzip, deflate",
  "User-Agent": userAgent,
};

let lastRequestAt = 0;

async function secJson(url) {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < 550) {
    await new Promise((resolve) => setTimeout(resolve, 550 - elapsed));
  }
  lastRequestAt = Date.now();

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`SEC request failed (${response.status}) for ${url}`);
  }
  return response.json();
}

function latestUsdFact(facts, tags) {
  const candidates = tags.flatMap((tag, tagPriority) => {
    const fact = facts?.["us-gaap"]?.[tag];
    const rows = fact?.units?.USD;
    if (!Array.isArray(rows)) return [];

    return rows
      .filter(
        (row) =>
          Number.isFinite(row.val) &&
          ["10-K", "10-Q"].includes(row.form) &&
          row.filed &&
          row.end,
      )
      .map((row) => ({
        row,
        tag,
        tagPriority,
        label: fact.label,
        description: fact.description,
      }));
  });

  const selected = candidates.sort((a, b) => {
    const filedDelta = String(b.row.filed).localeCompare(String(a.row.filed));
    if (filedDelta !== 0) return filedDelta;
    const endDelta = String(b.row.end).localeCompare(String(a.row.end));
    if (endDelta !== 0) return endDelta;
    const frameDelta = Number(Boolean(b.row.frame)) - Number(Boolean(a.row.frame));
    if (frameDelta !== 0) return frameDelta;
    const startDelta = String(b.row.start ?? "").localeCompare(
      String(a.row.start ?? ""),
    );
    if (startDelta !== 0) return startDelta;
    return a.tagPriority - b.tagPriority;
  })[0];

  if (!selected) return null;

  const latest = selected.row;
  return {
    tag: selected.tag,
    label: selected.label,
    description: selected.description,
    unit: "USD",
    value: latest.val,
    start: latest.start ?? null,
    end: latest.end,
    fiscalYear: latest.fy ?? null,
    fiscalPeriod: latest.fp ?? null,
    form: latest.form,
    filed: latest.filed,
    accessionNumber: latest.accn,
    frame: latest.frame ?? null,
  };
}

function metricSet(companyFacts) {
  const facts = companyFacts.facts;
  return {
    revenue: latestUsdFact(facts, [
      "RevenueFromContractWithCustomerExcludingAssessedTax",
      "Revenues",
      "SalesRevenueNet",
    ]),
    operatingIncome: latestUsdFact(facts, ["OperatingIncomeLoss"]),
    netIncome: latestUsdFact(facts, ["NetIncomeLoss"]),
    operatingCashFlow: latestUsdFact(facts, [
      "NetCashProvidedByUsedInOperatingActivities",
    ]),
    cash: latestUsdFact(facts, [
      "CashAndCashEquivalentsAtCarryingValue",
      "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents",
    ]),
  };
}

function addSourceUrls(metrics, cik) {
  return Object.fromEntries(
    Object.entries(metrics).map(([key, metric]) => {
      if (!metric) return [key, null];
      const accessionPath = metric.accessionNumber.replaceAll("-", "");
      return [
        key,
        {
          ...metric,
          sourceUrl: `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionPath}/`,
        },
      ];
    }),
  );
}

async function fetchTickerMap() {
  const rows = await secJson("https://www.sec.gov/files/company_tickers.json");
  return new Map(
    Object.values(rows).map((row) => [
      String(row.ticker).toUpperCase(),
      {
        ticker: String(row.ticker).toUpperCase(),
        cik: String(row.cik_str).padStart(10, "0"),
        title: row.title,
      },
    ]),
  );
}

async function buildSnapshot(ticker, tickerMap) {
  const company = tickerMap.get(ticker);
  if (!company) throw new Error(`Ticker not found in SEC map: ${ticker}`);

  const companyFacts = await secJson(
    `https://data.sec.gov/api/xbrl/companyfacts/CIK${company.cik}.json`,
  );
  const numericCik = String(Number(company.cik));
  const metrics = addSourceUrls(metricSet(companyFacts), numericCik);

  return {
    schemaVersion: 1,
    provider: "SEC EDGAR",
    fetchedAt: new Date().toISOString(),
    instrument: {
      ticker: company.ticker,
      cik: company.cik,
      entityName: companyFacts.entityName ?? company.title,
    },
    metrics,
    provenance: {
      companyFactsUrl: `https://data.sec.gov/api/xbrl/companyfacts/CIK${company.cik}.json`,
      tickerMapUrl: "https://www.sec.gov/files/company_tickers.json",
      fairAccess:
        "https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data",
    },
    caveats: [
      "Latest facts are selected by filing date and period end; review amendments and context before analysis.",
      "YTD and standalone-quarter values are not converted or mixed by this adapter.",
      "Missing or custom-tagged values remain null.",
      "This is an observation bundle, not an investment recommendation.",
    ],
  };
}

const tickerMap = await fetchTickerMap();
const multiple = tickers.length > 1;

for (const ticker of tickers) {
  const snapshot = await buildSnapshot(ticker, tickerMap);
  const outputPath = multiple
    ? path.join(outputArg, `${ticker.toLowerCase()}.json`)
    : outputArg.endsWith(".json")
      ? outputArg
      : path.join(outputArg, `${ticker.toLowerCase()}.json`);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(`Wrote ${ticker} SEC observations to ${outputPath}`);
}
