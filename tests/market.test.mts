import assert from "node:assert/strict";
import test from "node:test";

import {
  isMarketSnapshot,
  isThesisCase,
  runStressTest,
} from "../lib/falsifi.ts";
import {
  buildMarketCase,
  buildResearchCase,
  calculateMarketMetrics,
  inferMarketRegion,
  normalizeMarketCase,
  normalizeSymbolInput,
  parseYahooChart,
  parseYahooSearch,
  refreshMarketCase,
  relocalizeMarketCase,
} from "../lib/market.ts";
import type { MarketPoint } from "../lib/falsifi.ts";

const START = 1_720_000_000;
const closes = Array.from({ length: 260 }, (_, index) =>
  Number((100 + index * 0.18 + Math.sin(index / 8) * 2.5).toFixed(4)),
);
const timestamps = closes.map((_, index) => START + index * 86_400);
const volumes = closes.map((_, index) => 1_000_000 + index * 1_000);

const chartPayload = {
  chart: {
    result: [
      {
        meta: {
          currency: "USD",
          symbol: "TEST",
          longName: "Test Company",
          fullExchangeName: "Nasdaq",
          instrumentType: "EQUITY",
          regularMarketPrice: closes.at(-1),
          chartPreviousClose: closes[0],
          regularMarketTime: timestamps.at(-1),
        },
        timestamp: timestamps,
        indicators: {
          quote: [
            {
              close: closes,
              volume: volumes,
            },
          ],
          adjclose: [{ adjclose: closes }],
        },
      },
    ],
    error: null,
  },
};

test("starts an evidence-only case when market context is unavailable", () => {
  const thesisCase = buildResearchCase(
    {
      symbol: "NEW",
      name: "Newly Listed Company",
      exchange: "NMS",
      exchangeName: "Nasdaq",
      type: "EQUITY",
      region: "us",
    },
    "en",
  );

  assert.equal(isThesisCase(thesisCase), true);
  assert.equal(thesisCase.marketSnapshot, undefined);
  assert.equal(thesisCase.evidence.length, 0);
  assert.equal(runStressTest(thesisCase).score, 50);
});

test("parses a real-market chart response into a bounded snapshot", () => {
  const snapshot = parseYahooChart(chartPayload);

  assert.equal(snapshot.symbol, "TEST");
  assert.equal(snapshot.name, "Test Company");
  assert.equal(snapshot.history.length, 260);
  assert.equal(snapshot.priceBasis, "adjusted");
  assert.ok(snapshot.price > 0);
  assert.equal(snapshot.previousClose, closes.at(-2));
  assert.notEqual(snapshot.previousClose, closes[0]);
  assert.ok(snapshot.metrics.sma200 > 0);
  assert.ok(snapshot.metrics.yearReturn > 0);
  assert.ok(snapshot.metrics.rsi14 >= 0);
  assert.ok(snapshot.metrics.rsi14 <= 100);
});

test("uses one price basis for the entire history", () => {
  const payload = structuredClone(chartPayload);
  const adjusted = closes.map((value) => value * 0.5) as Array<number | null>;
  adjusted[42] = null;
  payload.chart.result[0].indicators.adjclose[0].adjclose =
    adjusted as number[];

  const snapshot = parseYahooChart(payload);

  assert.equal(snapshot.priceBasis, "close");
  assert.equal(snapshot.history.length, closes.length);
  assert.equal(snapshot.history[42].close, closes[42]);
  const thesisCase = buildMarketCase(snapshot, "zh-CN");
  const oneYearEvidence = thesisCase.evidence.find(
    (item) => item.id === "market-momentum-year",
  );
  assert.ok(oneYearEvidence);
  assert.equal(oneYearEvidence.title.includes("复权"), false);
  assert.equal(oneYearEvidence.note.includes("复权"), false);
});

test("keeps headline quote changes on the ordinary-close basis", () => {
  const payload = structuredClone(chartPayload);
  payload.chart.result[0].indicators.adjclose[0].adjclose = closes.map(
    (value) => value * 0.5,
  );
  delete (payload.chart.result[0].meta as Record<string, unknown>).previousClose;

  const snapshot = parseYahooChart(payload);

  assert.equal(snapshot.priceBasis, "adjusted");
  assert.equal(snapshot.history.at(-1)?.close, (closes.at(-1) ?? 0) * 0.5);
  assert.equal(snapshot.previousClose, closes.at(-2));
  assert.equal(
    snapshot.change,
    Number(((closes.at(-1) ?? 0) - (closes.at(-2) ?? 0)).toFixed(4)),
  );
});

test("does not infer a missing instrument type", () => {
  const payload = structuredClone(chartPayload);
  delete (payload.chart.result[0].meta as Record<string, unknown>).instrumentType;

  const snapshot = parseYahooChart(payload);

  assert.equal(snapshot.instrumentType, "UNKNOWN");
  assert.equal(isMarketSnapshot(snapshot), false);
});

test("calculates Wilder RSI from the standard 14-session seed", () => {
  const exampleCloses = [
    44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84,
    46.08, 45.89, 46.03, 45.61, 46.28, 46.28,
  ];
  const history: MarketPoint[] = exampleCloses.map((close, index) => ({
    timestamp: START + index * 86_400,
    close,
    volume: null,
  }));

  assert.equal(calculateMarketMetrics(history).rsi14, 70.46);
});

test("keeps maximum drawdown negative internally for rule calculations", () => {
  const history: MarketPoint[] = [100, 120, 90, 108].map((close, index) => ({
    timestamp: START + index * 86_400,
    close,
    volume: null,
  }));

  assert.equal(calculateMarketMetrics(history).maxDrawdown, -25);
});

test("does not backfill missing recent volume with older observations", () => {
  const history: MarketPoint[] = closes.map((close, index) => ({
    timestamp: timestamps[index],
    close,
    volume: index === closes.length - 10 ? null : volumes[index],
  }));

  assert.equal(calculateMarketMetrics(history).volumeRatio20, null);
});

test("builds a valid non-demo case from market data", () => {
  const snapshot = parseYahooChart(chartPayload);
  const thesisCase = buildMarketCase(snapshot, "en");
  const analysis = runStressTest(thesisCase);

  assert.equal(isThesisCase(thesisCase), true);
  assert.equal(thesisCase.isDemo, false);
  assert.equal(thesisCase.marketSnapshot?.symbol, "TEST");
  assert.equal(thesisCase.evidence.length, 4);
  assert.equal(thesisCase.assumptions.length, 4);
  const drawdown = thesisCase.assumptions.find(
    (item) => item.id === "market-drawdown",
  );
  assert.ok(drawdown);
  assert.ok(drawdown.value >= 0);
  assert.equal(drawdown.direction, -1);
  assert.equal(analysis.independenceAudit.independentRootCount, 1);
});

test("normalizes legacy automatic market rows to explicit system provenance", () => {
  const thesisCase = buildMarketCase(parseYahooChart(chartPayload), "en");
  thesisCase.evidence.forEach((item) => {
    delete item.provenance;
    delete item.verification;
    delete item.relation;
    delete item.originId;
  });

  const normalized = normalizeMarketCase(thesisCase);

  assert.ok(
    normalized.evidence.every(
      (item) =>
        item.provenance === "system-market" &&
        item.verification === "reviewed" &&
        item.relation === "derived",
    ),
  );
});

test("refreshes market-derived inputs while preserving the user's research case", () => {
  const initialSnapshot = parseYahooChart(chartPayload);
  const initial = buildMarketCase(initialSnapshot, "en");
  initial.thesis = "Margins can recover while demand remains resilient.";
  initial.horizon = "12 months";
  initial.researchPlan = {
    purpose: "holding-review",
    thesisConfirmed: true,
    invalidationCriteria:
      "Two consecutive quarters of weaker demand and lower margins.",
    nextReviewDate: "2026-09-30",
  };
  initial.evidence.push({
    id: "manual-filing",
    title: "Latest quarterly filing",
    source: "Issuer filing",
    sourceUrl: "https://example.com/filing",
    asOf: "2026-07-30",
    group: "Official filing",
    direction: "supports",
    impact: 3,
    reliability: 0.9,
    note: "Manually reviewed evidence remains attached after a refresh.",
    enabled: true,
    originId: "issuer-q2",
    claimId: "margin-recovery",
    relation: "direct",
  });

  const nextPayload = structuredClone(chartPayload);
  nextPayload.chart.result[0].meta.regularMarketPrice =
    (closes.at(-1) ?? 0) + 5;
  nextPayload.chart.result[0].meta.regularMarketTime =
    (timestamps.at(-1) ?? 0) + 86_400;
  const refreshed = refreshMarketCase(
    initial,
    parseYahooChart(nextPayload),
    "en",
  );

  assert.equal(refreshed.id, initial.id);
  assert.equal(refreshed.thesis, initial.thesis);
  assert.equal(refreshed.horizon, initial.horizon);
  assert.deepEqual(refreshed.researchPlan, initial.researchPlan);
  assert.equal(
    refreshed.evidence.some((item) => item.id === "manual-filing"),
    true,
  );
  assert.equal(
    refreshed.evidence.filter((item) => item.relation === "derived").length,
    4,
  );
});

test("migrates legacy negative drawdown inputs without changing the score", () => {
  const current = buildMarketCase(parseYahooChart(chartPayload), "en");
  const legacy = structuredClone(current);
  const legacyDrawdown = legacy.assumptions.find(
    (item) => item.id === "market-drawdown",
  );
  assert.ok(legacyDrawdown);
  legacyDrawdown.value *= -1;
  legacyDrawdown.baseline *= -1;
  legacyDrawdown.min = -100;
  legacyDrawdown.max = 0;
  legacyDrawdown.direction = 1;
  const before = runStressTest(legacy).score;

  const migrated = normalizeMarketCase(legacy);
  const migratedAgain = normalizeMarketCase(migrated);
  const migratedDrawdown = migrated.assumptions.find(
    (item) => item.id === "market-drawdown",
  );

  assert.ok(migratedDrawdown);
  assert.equal(migratedDrawdown.min, 0);
  assert.equal(migratedDrawdown.max, 100);
  assert.equal(migratedDrawdown.direction, -1);
  assert.equal(runStressTest(migrated).score, before);
  assert.deepEqual(migratedAgain, migrated);
  assert.equal(isThesisCase(migrated), true);
});

test("keeps volume as context rather than directional evidence", () => {
  const payload = structuredClone(chartPayload);
  payload.chart.result[0].indicators.quote[0].volume =
    Array.from({ length: closes.length }, () => null) as unknown as number[];
  const thesisCase = buildMarketCase(parseYahooChart(payload), "en");

  assert.equal(thesisCase.evidence.length, 4);
  assert.equal(thesisCase.marketSnapshot?.metrics.volumeRatio20, null);
  assert.equal(
    thesisCase.evidence.some((item) => item.id === "market-volume"),
    false,
  );
});

test("keeps directionally ambiguous risk metrics out of evidence scoring", () => {
  const thesisCase = buildMarketCase(parseYahooChart(chartPayload), "en");
  const ids = thesisCase.evidence.map((item) => item.id).sort();

  assert.deepEqual(ids, [
    "market-momentum-quarter",
    "market-momentum-year",
    "market-trend-200",
    "market-trend-cross",
  ]);
  assert.equal(
    ids.some(
      (id) =>
        id.includes("volatility") ||
        id.includes("drawdown") ||
        id.includes("rsi") ||
        id.includes("volume"),
    ),
    false,
  );
});

test("rejects non-equity or semantically invalid market snapshots", () => {
  const snapshot = parseYahooChart(chartPayload);
  assert.equal(isMarketSnapshot(snapshot), true);
  assert.equal(
    isMarketSnapshot({ ...snapshot, instrumentType: "CRYPTOCURRENCY" }),
    false,
  );
  assert.equal(
    isMarketSnapshot({
      ...snapshot,
      metrics: { ...snapshot.metrics, rsi14: 900 },
    }),
    false,
  );
});

test("relocalizes market copy without resetting user state", () => {
  const snapshot = parseYahooChart(chartPayload);
  const original = buildMarketCase(snapshot, "zh-CN");
  original.assumptions[0].value = original.assumptions[0].baseline - 7;
  original.evidence[0].enabled = false;
  original.evidence[0].note = "My edited interpretation";
  original.thesis = "My edited thesis";

  const localized = relocalizeMarketCase(original, "en");

  assert.equal(localized.thesis, "My edited thesis");
  assert.equal(localized.evidence[0].note, "My edited interpretation");
  assert.equal(
    localized.evidence[0].title,
    "Price position versus the 200-day average",
  );
  assert.equal(localized.evidence[0].enabled, false);
  assert.equal(
    localized.assumptions[0].value,
    original.assumptions[0].baseline - 7,
  );
  assert.equal(localized.assumptions[0].label, "Three-month momentum");
});

test("normalizes common U.S., A-share, and Hong Kong symbols", () => {
  assert.equal(normalizeSymbolInput("aapl", "us"), "AAPL");
  assert.equal(normalizeSymbolInput("603901", "cn"), "603901.SS");
  assert.equal(normalizeSymbolInput("002441", "all"), "002441.SZ");
  assert.equal(normalizeSymbolInput("430047", "cn"), "430047.BJ");
  assert.equal(normalizeSymbolInput("700", "hk"), "0700.HK");
  assert.equal(normalizeSymbolInput("900901", "cn"), "");
  assert.equal(normalizeSymbolInput("200002", "cn"), "");
});

test("does not classify unsupported or similarly named exchanges as U.S. listings", () => {
  assert.equal(inferMarketRegion("AAPL", "NasdaqGS"), "us");
  assert.equal(inferMarketRegion("VOD.L", "LSE"), "other");
  assert.equal(inferMarketRegion("SHOP.TO", "Toronto"), "other");
  assert.equal(inferMarketRegion("ERIC-B.ST", "Nasdaq Stockholm"), "other");
  assert.equal(inferMarketRegion("TEST", "PNK"), "other");
  assert.equal(inferMarketRegion("HKG"), "us");
  assert.equal(inferMarketRegion("0700.HK", "HKG"), "hk");
});

test("filters Yahoo search results by market and instrument type", () => {
  const payload = {
    quotes: [
      {
        symbol: "AAPL",
        longname: "Apple Inc.",
        quoteType: "EQUITY",
        exchange: "NMS",
        exchDisp: "Nasdaq",
      },
      {
        symbol: "0700.HK",
        longname: "Tencent Holdings",
        quoteType: "EQUITY",
        exchange: "HKG",
        exchDisp: "Hong Kong",
      },
      {
        symbol: "BTC-USD",
        shortname: "Bitcoin USD",
        quoteType: "CRYPTOCURRENCY",
        exchange: "CCC",
      },
      {
        symbol: "SPY",
        shortname: "SPDR S&P 500 ETF",
        quoteType: "ETF",
        exchange: "PCX",
      },
      {
        symbol: "ERIC-B.ST",
        longname: "Telefonaktiebolaget LM Ericsson",
        quoteType: "EQUITY",
        exchange: "Nasdaq Stockholm",
      },
      {
        symbol: "TEST",
        longname: "Test OTC",
        quoteType: "EQUITY",
        exchange: "PNK",
      },
    ],
  };

  assert.deepEqual(
    parseYahooSearch(payload, "hk").map((item) => item.symbol),
    ["0700.HK"],
  );
  assert.deepEqual(
    parseYahooSearch(payload, "all").map((item) => item.symbol),
    ["AAPL", "0700.HK"],
  );
});
