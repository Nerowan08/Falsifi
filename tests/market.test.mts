import assert from "node:assert/strict";
import test from "node:test";

import {
  isMarketSnapshot,
  isThesisCase,
  runStressTest,
} from "../lib/falsifi.ts";
import {
  buildMarketCase,
  normalizeSymbolInput,
  parseYahooChart,
  parseYahooSearch,
  relocalizeMarketCase,
} from "../lib/market.ts";

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

test("parses a real-market chart response into a bounded snapshot", () => {
  const snapshot = parseYahooChart(chartPayload);

  assert.equal(snapshot.symbol, "TEST");
  assert.equal(snapshot.name, "Test Company");
  assert.equal(snapshot.history.length, 260);
  assert.ok(snapshot.price > 0);
  assert.equal(snapshot.previousClose, closes.at(-2));
  assert.notEqual(snapshot.previousClose, closes[0]);
  assert.ok(snapshot.metrics.sma200 > 0);
  assert.ok(snapshot.metrics.yearReturn > 0);
  assert.ok(snapshot.metrics.rsi14 >= 0);
  assert.ok(snapshot.metrics.rsi14 <= 100);
});

test("builds a valid non-demo case from market data", () => {
  const snapshot = parseYahooChart(chartPayload);
  const thesisCase = buildMarketCase(snapshot, "en");
  const analysis = runStressTest(thesisCase);

  assert.equal(isThesisCase(thesisCase), true);
  assert.equal(thesisCase.isDemo, false);
  assert.equal(thesisCase.marketSnapshot?.symbol, "TEST");
  assert.equal(thesisCase.evidence.length, 8);
  assert.equal(thesisCase.assumptions.length, 4);
  assert.equal(analysis.independenceAudit.independentRootCount, 1);
});

test("omits volume evidence when the provider has no volume series", () => {
  const payload = structuredClone(chartPayload);
  payload.chart.result[0].indicators.quote[0].volume =
    Array.from({ length: closes.length }, () => null) as unknown as number[];
  const thesisCase = buildMarketCase(parseYahooChart(payload), "en");

  assert.equal(thesisCase.evidence.length, 7);
  assert.equal(
    thesisCase.evidence.some((item) => item.id === "market-volume"),
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
