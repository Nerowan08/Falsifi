import type {
  EvidenceDirection,
  MarketMetricSet,
  MarketPoint,
  MarketSnapshot,
  ThesisCase,
} from "./falsifi";
import type { Locale } from "./i18n";

export type MarketRegion = "all" | "us" | "cn" | "hk";

export type StockSearchResult = {
  symbol: string;
  name: string;
  exchange: string;
  exchangeName: string;
  type: string;
  region: Exclude<MarketRegion, "all"> | "other";
};

type YahooChartResult = {
  meta?: Record<string, unknown>;
  timestamp?: unknown[];
  indicators?: {
    quote?: Array<Record<string, unknown>>;
    adjclose?: Array<Record<string, unknown>>;
  };
};

const copy: Record<
  Locale,
  {
    thesis: (name: string) => string;
    horizon: string;
    source: string;
    labels: {
      trend200: string;
      cross: string;
      momentum3m: string;
      momentum1y: string;
      volatility: string;
      drawdown: string;
      rsi: string;
      volume: string;
      assumptionMomentum: string;
      assumptionTrend: string;
      assumptionVolatility: string;
      assumptionDrawdown: string;
    };
    notes: {
      trend200: (value: number) => string;
      cross: (above: boolean) => string;
      momentum3m: (value: number) => string;
      momentum1y: (value: number) => string;
      volatility: (value: number) => string;
      drawdown: (value: number) => string;
      rsi: (value: number) => string;
      volume: (ratio: number, change: number) => string;
    };
  }
> = {
  en: {
    thesis: (name) =>
      `This case tests whether ${name}'s current price trend, momentum, and risk profile remain resilient over the next 12 months.`,
    horizon: "12 months",
    source: "Yahoo Finance delayed market data (experimental adapter)",
    labels: {
      trend200: "Price position versus the 200-day average",
      cross: "50-day versus 200-day trend structure",
      momentum3m: "Three-month price momentum",
      momentum1y: "One-year price momentum",
      volatility: "Thirty-day annualized volatility",
      drawdown: "Largest drawdown in the last year",
      rsi: "Fourteen-day relative strength",
      volume: "Latest volume confirmation",
      assumptionMomentum: "Three-month momentum",
      assumptionTrend: "Distance from 200-day average",
      assumptionVolatility: "Annualized volatility",
      assumptionDrawdown: "Maximum drawdown",
    },
    notes: {
      trend200: (value) =>
        `The latest close is ${formatSigned(value)}% from its 200-day moving average.`,
      cross: (above) =>
        `The 50-day moving average is ${above ? "above" : "below"} the 200-day moving average.`,
      momentum3m: (value) =>
        `The adjusted close changed ${formatSigned(value)}% over roughly 63 trading sessions.`,
      momentum1y: (value) =>
        `The adjusted close changed ${formatSigned(value)}% across the available one-year window.`,
      volatility: (value) =>
        `Annualized volatility from the latest 30 daily returns is ${formatNumber(value)}%.`,
      drawdown: (value) =>
        `The largest peak-to-trough decline in the available window is ${formatNumber(value)}%.`,
      rsi: (value) =>
        `The 14-session RSI is ${formatNumber(value)}; this is a momentum diagnostic, not a forecast.`,
      volume: (ratio, change) =>
        `Latest volume is ${formatNumber(ratio)}× its 20-session average while the daily move is ${formatSigned(change)}%.`,
    },
  },
  "zh-CN": {
    thesis: (name) =>
      `本案例检验 ${name} 当前的价格趋势、动量与风险结构，能否在未来 12 个月内保持韧性。`,
    horizon: "12 个月",
    source: "Yahoo Finance 延迟行情（实验性适配器）",
    labels: {
      trend200: "股价相对 200 日均线的位置",
      cross: "50 日与 200 日趋势结构",
      momentum3m: "三个月价格动量",
      momentum1y: "一年价格动量",
      volatility: "30 日年化波动率",
      drawdown: "过去一年最大回撤",
      rsi: "14 日相对强弱指标",
      volume: "最新成交量确认",
      assumptionMomentum: "三个月动量",
      assumptionTrend: "偏离 200 日均线",
      assumptionVolatility: "年化波动率",
      assumptionDrawdown: "最大回撤",
    },
    notes: {
      trend200: (value) =>
        `最新收盘价较 200 日移动平均线偏离 ${formatSigned(value)}%。`,
      cross: (above) =>
        `50 日移动平均线位于 200 日移动平均线${above ? "上方" : "下方"}。`,
      momentum3m: (value) =>
        `约 63 个交易日内，复权收盘价变动 ${formatSigned(value)}%。`,
      momentum1y: (value) =>
        `在当前可用的一年窗口内，复权收盘价变动 ${formatSigned(value)}%。`,
      volatility: (value) =>
        `按最近 30 个日收益率计算的年化波动率为 ${formatNumber(value)}%。`,
      drawdown: (value) =>
        `当前数据窗口内最大的峰谷跌幅为 ${formatNumber(value)}%。`,
      rsi: (value) =>
        `14 个交易日 RSI 为 ${formatNumber(value)}；它是动量诊断，不是预测。`,
      volume: (ratio, change) =>
        `最新成交量为 20 日均量的 ${formatNumber(ratio)} 倍，当日涨跌为 ${formatSigned(change)}%。`,
    },
  },
  ja: {
    thesis: (name) =>
      `このケースは、${name} の現在の価格トレンド、モメンタム、リスク構造が今後 12 か月も維持できるかを検証します。`,
    horizon: "12か月",
    source: "Yahoo Finance の遅延市場データ（実験的アダプター）",
    labels: {
      trend200: "200日移動平均に対する価格位置",
      cross: "50日・200日トレンド構造",
      momentum3m: "3か月価格モメンタム",
      momentum1y: "1年間の価格モメンタム",
      volatility: "30日年率換算ボラティリティ",
      drawdown: "過去1年の最大ドローダウン",
      rsi: "14日相対力指数",
      volume: "直近出来高の確認",
      assumptionMomentum: "3か月モメンタム",
      assumptionTrend: "200日平均からの乖離",
      assumptionVolatility: "年率換算ボラティリティ",
      assumptionDrawdown: "最大ドローダウン",
    },
    notes: {
      trend200: (value) =>
        `直近終値は200日移動平均から ${formatSigned(value)}% 乖離しています。`,
      cross: (above) =>
        `50日移動平均は200日移動平均の${above ? "上" : "下"}にあります。`,
      momentum3m: (value) =>
        `約63取引日で調整後終値は ${formatSigned(value)}% 変化しました。`,
      momentum1y: (value) =>
        `利用可能な1年間で調整後終値は ${formatSigned(value)}% 変化しました。`,
      volatility: (value) =>
        `直近30日リターンによる年率換算ボラティリティは ${formatNumber(value)}% です。`,
      drawdown: (value) =>
        `利用可能期間の最大ピーク・トゥ・トラフ下落率は ${formatNumber(value)}% です。`,
      rsi: (value) =>
        `14日RSIは ${formatNumber(value)}。これはモメンタム診断であり予測ではありません。`,
      volume: (ratio, change) =>
        `直近出来高は20日平均の ${formatNumber(ratio)} 倍、日次変化は ${formatSigned(change)}% です。`,
    },
  },
  es: {
    thesis: (name) =>
      `Este caso prueba si la tendencia, el impulso y el perfil de riesgo actuales de ${name} pueden resistir durante los próximos 12 meses.`,
    horizon: "12 meses",
    source: "Datos retrasados de Yahoo Finance (adaptador experimental)",
    labels: {
      trend200: "Precio frente a la media de 200 días",
      cross: "Estructura de tendencia de 50 y 200 días",
      momentum3m: "Impulso del precio a tres meses",
      momentum1y: "Impulso del precio a un año",
      volatility: "Volatilidad anualizada de 30 días",
      drawdown: "Máxima caída del último año",
      rsi: "Fuerza relativa de 14 días",
      volume: "Confirmación del volumen reciente",
      assumptionMomentum: "Impulso a tres meses",
      assumptionTrend: "Distancia a la media de 200 días",
      assumptionVolatility: "Volatilidad anualizada",
      assumptionDrawdown: "Máxima caída",
    },
    notes: {
      trend200: (value) =>
        `El último cierre está a ${formatSigned(value)}% de su media móvil de 200 días.`,
      cross: (above) =>
        `La media de 50 días está ${above ? "por encima" : "por debajo"} de la media de 200 días.`,
      momentum3m: (value) =>
        `El cierre ajustado cambió ${formatSigned(value)}% en unas 63 sesiones.`,
      momentum1y: (value) =>
        `El cierre ajustado cambió ${formatSigned(value)}% durante el año disponible.`,
      volatility: (value) =>
        `La volatilidad anualizada de los últimos 30 rendimientos diarios es ${formatNumber(value)}%.`,
      drawdown: (value) =>
        `La mayor caída desde un máximo en la ventana disponible es ${formatNumber(value)}%.`,
      rsi: (value) =>
        `El RSI de 14 sesiones es ${formatNumber(value)}; es un diagnóstico, no un pronóstico.`,
      volume: (ratio, change) =>
        `El último volumen es ${formatNumber(ratio)}× su media de 20 sesiones y el cambio diario es ${formatSigned(change)}%.`,
    },
  },
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;

const finite = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const stringValue = (value: unknown, fallback = "") =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const round = (value: number, digits = 2) => {
  const multiplier = 10 ** digits;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
};

const formatNumber = (value: number) => round(value, 1).toFixed(1);
const formatSigned = (value: number) =>
  `${value > 0 ? "+" : ""}${formatNumber(value)}`;

const valueAt = (values: number[], sessionsBack: number) => {
  const index = Math.max(0, values.length - 1 - sessionsBack);
  return values[index];
};

const returnBetween = (from: number, to: number) =>
  from > 0 ? ((to / from) - 1) * 100 : 0;

const average = (values: number[]) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

const standardDeviation = (values: number[]) => {
  if (values.length < 2) return 0;
  const mean = average(values);
  return Math.sqrt(
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      (values.length - 1),
  );
};

const movingAverage = (values: number[], sessions: number) =>
  average(values.slice(-Math.min(values.length, sessions)));

const calculateRsi = (values: number[], sessions = 14) => {
  if (values.length < sessions + 1) return 50;
  const slice = values.slice(-(sessions + 1));
  let gains = 0;
  let losses = 0;
  for (let index = 1; index < slice.length; index += 1) {
    const delta = slice[index] - slice[index - 1];
    if (delta >= 0) gains += delta;
    else losses += Math.abs(delta);
  }
  if (losses === 0) return gains === 0 ? 50 : 100;
  const relativeStrength = gains / losses;
  return 100 - 100 / (1 + relativeStrength);
};

const calculateMaxDrawdown = (values: number[]) => {
  let peak = values[0] ?? 0;
  let maximumDrawdown = 0;
  for (const value of values) {
    peak = Math.max(peak, value);
    if (peak > 0) {
      maximumDrawdown = Math.min(
        maximumDrawdown,
        ((value / peak) - 1) * 100,
      );
    }
  }
  return maximumDrawdown;
};

export function calculateMarketMetrics(
  history: MarketPoint[],
): MarketMetricSet {
  if (history.length < 2) {
    throw new Error("At least two valid market observations are required.");
  }

  const closes = history.map((point) => point.close);
  const volumes = history
    .map((point) => point.volume)
    .filter((value): value is number => value !== null && value >= 0);
  const latest = closes.at(-1) ?? 0;
  const previous = closes.at(-2) ?? latest;
  const dailyReturns = closes.slice(1).map((value, index) =>
    returnBetween(closes[index], value) / 100,
  );
  const recentReturns = dailyReturns.slice(-30);
  const sma20 = movingAverage(closes, 20);
  const sma50 = movingAverage(closes, 50);
  const sma200 = movingAverage(closes, 200);
  const averageVolume20 = average(volumes.slice(-20));
  const latestVolume = history.at(-1)?.volume ?? null;

  return {
    dayReturn: round(returnBetween(previous, latest)),
    monthReturn: round(returnBetween(valueAt(closes, 21), latest)),
    quarterReturn: round(returnBetween(valueAt(closes, 63), latest)),
    yearReturn: round(returnBetween(closes[0], latest)),
    annualizedVolatility: round(
      standardDeviation(recentReturns) * Math.sqrt(252) * 100,
    ),
    maxDrawdown: round(calculateMaxDrawdown(closes)),
    rsi14: round(calculateRsi(closes)),
    sma20: round(sma20, 4),
    sma50: round(sma50, 4),
    sma200: round(sma200, 4),
    distanceFromSma200: round(returnBetween(sma200, latest)),
    high52Week: round(Math.max(...closes), 4),
    low52Week: round(Math.min(...closes), 4),
    volumeRatio20:
      latestVolume !== null && averageVolume20 > 0
        ? round(latestVolume / averageVolume20)
        : null,
  };
}

export function parseYahooChart(
  payload: unknown,
  nameHint = "",
): MarketSnapshot {
  const root = asRecord(payload);
  const chart = asRecord(root?.chart);
  const results = Array.isArray(chart?.result) ? chart.result : [];
  const result = asRecord(results[0]) as YahooChartResult | null;
  if (!result) {
    const error = asRecord(chart?.error);
    throw new Error(stringValue(error?.description, "Market data not found."));
  }

  const meta = result.meta ?? {};
  const timestamps = Array.isArray(result.timestamp) ? result.timestamp : [];
  const quote = result.indicators?.quote?.[0] ?? {};
  const adjusted = result.indicators?.adjclose?.[0] ?? {};
  const quoteCloses = Array.isArray(quote.close) ? quote.close : [];
  const adjustedCloses = Array.isArray(adjusted.adjclose)
    ? adjusted.adjclose
    : [];
  const volumes = Array.isArray(quote.volume) ? quote.volume : [];

  const history: MarketPoint[] = [];
  for (let index = 0; index < timestamps.length; index += 1) {
    const timestamp = finite(timestamps[index]);
    const adjustedClose = finite(adjustedCloses[index]);
    const close = adjustedClose ?? finite(quoteCloses[index]);
    if (timestamp === null || close === null || close <= 0) continue;
    history.push({
      timestamp: Math.round(timestamp),
      close: round(close, 4),
      volume: finite(volumes[index]),
    });
  }

  if (history.length < 200) {
    throw new Error(
      "At least 200 valid daily observations are required for this analysis.",
    );
  }

  const symbol = stringValue(meta.symbol).toUpperCase();
  if (!symbol) throw new Error("The market response did not include a symbol.");
  const price =
    finite(meta.regularMarketPrice) ??
    history.at(-1)?.close ??
    0;
  const previousClose =
    finite(meta.previousClose) ??
    history.at(-2)?.close ??
    price;
  const marketTime =
    finite(meta.regularMarketTime) ?? history.at(-1)?.timestamp ?? 0;
  const name =
    stringValue(meta.longName) ||
    stringValue(meta.shortName) ||
    nameHint ||
    symbol;
  const metrics = calculateMarketMetrics(history);

  return {
    provider: "Yahoo Finance (experimental)",
    symbol,
    name,
    exchange:
      stringValue(meta.fullExchangeName) ||
      stringValue(meta.exchangeName, "Unknown exchange"),
    currency: stringValue(meta.currency, ""),
    instrumentType: stringValue(meta.instrumentType, "EQUITY"),
    price: round(price, 4),
    previousClose: round(previousClose, 4),
    change: round(price - previousClose, 4),
    changePercent:
      previousClose > 0
        ? round(((price / previousClose) - 1) * 100)
        : metrics.dayReturn,
    marketTime: new Date(marketTime * 1000).toISOString(),
    fetchedAt: new Date().toISOString(),
    sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`,
    history,
    metrics,
  };
}

export function normalizeSymbolInput(
  rawValue: string,
  region: MarketRegion,
) {
  const value = rawValue.normalize("NFKC").trim().toUpperCase();
  if (!value) return "";
  if (/^[A-Z0-9^=.-]{1,24}$/.test(value) && value.includes(".")) {
    return value;
  }
  if (region === "hk" && /^\d{1,5}$/.test(value)) {
    return `${value.padStart(4, "0")}.HK`;
  }
  if ((region === "cn" || region === "all") && /^\d{6}$/.test(value)) {
    if (/^(43|83|87|88|92)/.test(value)) return `${value}.BJ`;
    if (/^[569]/.test(value)) return `${value}.SS`;
    if (/^[0123]/.test(value)) return `${value}.SZ`;
    if (/^[478]/.test(value)) return `${value}.BJ`;
  }
  return /^[A-Z0-9^=-]{1,24}$/.test(value) ? value : "";
}

export function isExplicitSymbolInput(rawValue: string) {
  const value = rawValue.normalize("NFKC").trim();
  return (
    /^\d{1,6}$/.test(value) ||
    /^[A-Z][A-Z0-9^=]{0,5}(?:[.-][A-Z0-9]{1,5})?$/.test(value)
  );
}

export function inferMarketRegion(
  symbol: string,
  exchange = "",
): StockSearchResult["region"] {
  const upper = `${symbol} ${exchange}`.toUpperCase();
  if (/\.(SS|SZ|BJ)\b|SHANGHAI|SHENZHEN|BEIJING/.test(upper)) return "cn";
  if (/\.HK\b|HONG KONG|HKG/.test(upper)) return "hk";
  if (
    /NASDAQ|NYSE|AMEX|NMS|NYQ|ASE|PCX|NGM|NCM|BATS|BTS|PNK/.test(
      upper,
    )
  ) {
    return "us";
  }
  return "other";
}

export function isStockSearchResult(
  value: unknown,
): value is StockSearchResult {
  const item = asRecord(value);
  return Boolean(
    item &&
      isBoundedString(item.symbol, 24) &&
      isBoundedString(item.name, 300) &&
      typeof item.exchange === "string" &&
      item.exchange.length <= 80 &&
      typeof item.exchangeName === "string" &&
      item.exchangeName.length <= 120 &&
      item.type === "EQUITY" &&
      ["us", "cn", "hk", "other"].includes(String(item.region)),
  );
}

const isBoundedString = (value: unknown, maxLength: number) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.length <= maxLength;

export function parseYahooSearch(
  payload: unknown,
  region: MarketRegion,
): StockSearchResult[] {
  const root = asRecord(payload);
  const quotes = Array.isArray(root?.quotes) ? root.quotes : [];
  const seen = new Set<string>();
  const results: StockSearchResult[] = [];

  for (const candidate of quotes) {
    const item = asRecord(candidate);
    if (!item) continue;
    const symbol = stringValue(item.symbol).toUpperCase();
    const type = stringValue(item.quoteType).toUpperCase();
    if (!symbol || type !== "EQUITY" || seen.has(symbol)) {
      continue;
    }
    const exchange = stringValue(item.exchange);
    const inferredRegion = inferMarketRegion(symbol, exchange);
    if (region !== "all" && inferredRegion !== region) continue;
    seen.add(symbol);
    results.push({
      symbol,
      name:
        stringValue(item.longname) ||
        stringValue(item.shortname) ||
        stringValue(item.name) ||
        symbol,
      exchange,
      exchangeName:
        stringValue(item.exchDisp) ||
        stringValue(item.exchangeDisplay) ||
        exchange,
      type,
      region: inferredRegion,
    });
    if (results.length >= 8) break;
  }

  return results;
}

const evidenceImpact = (value: number, scale: number, floor = 2.2, cap = 7) =>
  round(clamp(Math.abs(value) * scale + floor, floor, cap), 1);

export function buildMarketCase(
  snapshot: MarketSnapshot,
  locale: Locale,
): ThesisCase {
  const text = copy[locale];
  const metrics = snapshot.metrics;
  const asOf = snapshot.marketTime.slice(0, 10);
  const originId = `market-series-${snapshot.symbol
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}-${asOf}`;
  const source = text.source;
  const latestVolumeRatio = metrics.volumeRatio20;
  const trendCrossPositive = metrics.sma50 >= metrics.sma200;
  const rsiPositive = metrics.rsi14 >= 45 && metrics.rsi14 <= 70;
  const volumePositive =
    latestVolumeRatio !== null &&
    latestVolumeRatio >= 1 &&
    snapshot.changePercent >= 0;

  const makeEvidence = (
    id: string,
    title: string,
    direction: EvidenceDirection,
    impact: number,
    reliability: number,
    note: string,
    claimId: string,
  ) => ({
    id,
    title,
    source,
    sourceUrl: snapshot.sourceUrl,
    asOf,
    group: "Market data" as const,
    direction,
    impact,
    reliability,
    note,
    enabled: true,
    originId,
    claimId,
    relation: "derived" as const,
  });

  return {
    schemaVersion: 1,
    id: `market-${snapshot.symbol
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    company: snapshot.name,
    ticker: snapshot.symbol,
    isDemo: false,
    thesis: text.thesis(snapshot.name),
    horizon: text.horizon,
    baseScore: 50,
    constructiveThreshold: 58,
    cautiousThreshold: 42,
    lastUpdated: snapshot.fetchedAt,
    modelVersion: "Falsifi 0.4.0",
    marketSnapshot: snapshot,
    evidence: [
      makeEvidence(
        "market-trend-200",
        text.labels.trend200,
        metrics.distanceFromSma200 >= 0 ? "supports" : "contradicts",
        evidenceImpact(metrics.distanceFromSma200, 0.14),
        0.9,
        text.notes.trend200(metrics.distanceFromSma200),
        "long-term-trend",
      ),
      makeEvidence(
        "market-trend-cross",
        text.labels.cross,
        trendCrossPositive ? "supports" : "contradicts",
        4.8,
        0.88,
        text.notes.cross(trendCrossPositive),
        "moving-average-structure",
      ),
      makeEvidence(
        "market-momentum-quarter",
        text.labels.momentum3m,
        metrics.quarterReturn >= 0 ? "supports" : "contradicts",
        evidenceImpact(metrics.quarterReturn, 0.12),
        0.82,
        text.notes.momentum3m(metrics.quarterReturn),
        "medium-term-momentum",
      ),
      makeEvidence(
        "market-momentum-year",
        text.labels.momentum1y,
        metrics.yearReturn >= 0 ? "supports" : "contradicts",
        evidenceImpact(metrics.yearReturn, 0.08),
        0.8,
        text.notes.momentum1y(metrics.yearReturn),
        "long-term-momentum",
      ),
      makeEvidence(
        "market-volatility",
        text.labels.volatility,
        metrics.annualizedVolatility <= 35 ? "supports" : "contradicts",
        evidenceImpact(metrics.annualizedVolatility - 35, 0.08, 2.2, 5.5),
        0.75,
        text.notes.volatility(metrics.annualizedVolatility),
        "realized-risk",
      ),
      makeEvidence(
        "market-drawdown",
        text.labels.drawdown,
        metrics.maxDrawdown >= -25 ? "supports" : "contradicts",
        evidenceImpact(metrics.maxDrawdown + 25, 0.1, 2.2, 5.5),
        0.78,
        text.notes.drawdown(metrics.maxDrawdown),
        "drawdown-risk",
      ),
      makeEvidence(
        "market-rsi",
        text.labels.rsi,
        rsiPositive ? "supports" : "contradicts",
        2.8,
        0.62,
        text.notes.rsi(metrics.rsi14),
        "short-term-momentum",
      ),
      makeEvidence(
        "market-volume",
        text.labels.volume,
        volumePositive ? "supports" : "contradicts",
        2.4,
        0.68,
        text.notes.volume(latestVolumeRatio ?? 0, snapshot.changePercent),
        "volume-confirmation",
      ),
    ].filter(
      (item) =>
        item.id !== "market-volume" || metrics.volumeRatio20 !== null,
    ),
    assumptions: [
      {
        id: "market-quarter-momentum",
        label: text.labels.assumptionMomentum,
        value: clamp(metrics.quarterReturn, -100, 100),
        baseline: clamp(metrics.quarterReturn, -100, 100),
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
        impactPerUnit: 0.32,
        direction: 1,
        typicalShock: 15,
      },
      {
        id: "market-trend-distance",
        label: text.labels.assumptionTrend,
        value: clamp(metrics.distanceFromSma200, -100, 100),
        baseline: clamp(metrics.distanceFromSma200, -100, 100),
        min: -100,
        max: 100,
        step: 1,
        unit: "%",
        impactPerUnit: 0.3,
        direction: 1,
        typicalShock: 15,
      },
      {
        id: "market-volatility",
        label: text.labels.assumptionVolatility,
        value: clamp(metrics.annualizedVolatility, 1, 180),
        baseline: clamp(metrics.annualizedVolatility, 1, 180),
        min: 1,
        max: 180,
        step: 1,
        unit: "%",
        impactPerUnit: 0.16,
        direction: -1,
        typicalShock: 15,
      },
      {
        id: "market-drawdown",
        label: text.labels.assumptionDrawdown,
        value: clamp(metrics.maxDrawdown, -100, 0),
        baseline: clamp(metrics.maxDrawdown, -100, 0),
        min: -100,
        max: 0,
        step: 1,
        unit: "%",
        impactPerUnit: 0.2,
        direction: 1,
        typicalShock: 12,
      },
    ],
  };
}

export function relocalizeMarketCase(
  thesisCase: ThesisCase,
  locale: Locale,
): ThesisCase {
  if (!thesisCase.marketSnapshot) return thesisCase;

  const localized = buildMarketCase(thesisCase.marketSnapshot, locale);
  const variants = (Object.keys(copy) as Locale[]).map((item) =>
    buildMarketCase(thesisCase.marketSnapshot as MarketSnapshot, item),
  );
  const localizedEvidence = new Map(
    localized.evidence.map((item) => [item.id, item]),
  );
  const localizedAssumptions = new Map(
    localized.assumptions.map((item) => [item.id, item]),
  );

  return {
    ...thesisCase,
    thesis: variants.some((item) => item.thesis === thesisCase.thesis)
      ? localized.thesis
      : thesisCase.thesis,
    horizon: variants.some((item) => item.horizon === thesisCase.horizon)
      ? localized.horizon
      : thesisCase.horizon,
    evidence: thesisCase.evidence.map((item) => {
      const translation = localizedEvidence.get(item.id);
      if (
        !translation ||
        item.originId !== translation.originId ||
        item.relation !== "derived"
      ) {
        return item;
      }
      const priorTranslations = variants
        .map((variant) =>
          variant.evidence.find((candidate) => candidate.id === item.id),
        )
        .filter((candidate) => candidate !== undefined);
      return {
        ...item,
        title: priorTranslations.some(
          (candidate) => candidate.title === item.title,
        )
          ? translation.title
          : item.title,
        note: priorTranslations.some(
          (candidate) => candidate.note === item.note,
        )
          ? translation.note
          : item.note,
        source: priorTranslations.some(
          (candidate) => candidate.source === item.source,
        )
          ? translation.source
          : item.source,
      };
    }),
    assumptions: thesisCase.assumptions.map((item) => {
      const translation = localizedAssumptions.get(item.id);
      const priorLabels = variants
        .map((variant) =>
          variant.assumptions.find(
            (candidate) => candidate.id === item.id,
          ),
        )
        .filter((candidate) => candidate !== undefined)
        .map((candidate) => candidate.label);
      return translation && priorLabels.includes(item.label)
        ? { ...item, label: translation.label }
        : item;
    }),
  };
}
