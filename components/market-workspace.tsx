"use client";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Database,
  ExternalLink,
  FileUp,
  LoaderCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  isMarketSnapshot,
  type MarketSnapshot,
} from "@/lib/falsifi";
import type { Locale } from "@/lib/i18n";
import {
  MarketRegion,
  isExplicitSymbolInput,
  isStockSearchResult,
  normalizeSymbolInput,
  StockSearchResult,
} from "@/lib/market";

type MarketCopy = {
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  searchPlaceholder: string;
  searchLabel: string;
  marketsLabel: string;
  markets: Record<MarketRegion, string>;
  quickTitle: string;
  realData: string;
  noAccount: string;
  delayed: string;
  searchHint: string;
  empty: string;
  unavailable: string;
  errors: {
    invalidSymbol: string;
    unsupportedInstrument: string;
    insufficientHistory: string;
    notFound: string;
  };
  analyzing: string;
  analyze: string;
  changeStock: string;
  importCase: string;
  overview: string;
  oneYearHistory: string;
  source: string;
  fetched: string;
  metrics: {
    month: string;
    quarter: string;
    year: string;
    volatility: string;
    drawdown: string;
    rsi: string;
  };
  verify: string;
};

const MARKET_COPY: Record<Locale, MarketCopy> = {
  en: {
    heroEyebrow: "Live research workspace",
    heroTitle: "Choose a real stock. Test the case, not a demo.",
    heroBody:
      "Search U.S., mainland China, or Hong Kong equities. Falsifi loads one year of delayed market data, builds an inspectable case, and shows what would flip it.",
    searchPlaceholder: "Ticker or company name — e.g. AAPL, 603901, Tencent",
    searchLabel: "Search stocks",
    marketsLabel: "Stock markets",
    markets: {
      all: "All markets",
      us: "U.S.",
      cn: "A-shares",
      hk: "Hong Kong",
    },
    quickTitle: "Start with a real company",
    realData: "Real delayed market data",
    noAccount: "No account or API key",
    delayed: "Source-linked and time-stamped",
    searchHint: "Type a company name or ticker to search.",
    empty: "No matching listed stock was found.",
    unavailable:
      "Market data is temporarily unavailable. Try the ticker again shortly.",
    errors: {
      invalidSymbol: "Enter a valid listed stock ticker.",
      unsupportedInstrument: "This workspace supports listed stocks only.",
      insufficientHistory:
        "This stock does not yet have the 200 daily observations required for the analysis.",
      notFound: "No listed stock was found for that ticker.",
    },
    analyzing: "Loading market history…",
    analyze: "Analyze",
    changeStock: "Change stock",
    importCase: "Import an existing Falsifi case",
    overview: "Market snapshot",
    oneYearHistory: "Adjusted close · 1 year",
    source: "Source",
    fetched: "Retrieved",
    metrics: {
      month: "1-month return",
      quarter: "3-month return",
      year: "1-year return",
      volatility: "30-day volatility",
      drawdown: "Maximum drawdown",
      rsi: "RSI (14)",
    },
    verify:
      "Quotes may be delayed or incomplete. Verify material figures with the exchange or issuer.",
  },
  "zh-CN": {
    heroEyebrow: "真实研究工作台",
    heroTitle: "选择一只真实股票，而不是查看演示。",
    heroBody:
      "搜索美股、A 股或港股。Falsifi 会读取一年延迟行情，自动构建可审查的研究案例，并找出什么变化会推翻当前判断。",
    searchPlaceholder: "股票代码或公司名称，例如 AAPL、603901、腾讯",
    searchLabel: "搜索股票",
    marketsLabel: "股票市场",
    markets: {
      all: "全部市场",
      us: "美股",
      cn: "A 股",
      hk: "港股",
    },
    quickTitle: "从真实公司开始",
    realData: "真实延迟行情",
    noAccount: "无需账号或 API Key",
    delayed: "带来源与时间戳",
    searchHint: "输入公司名称或股票代码开始搜索。",
    empty: "没有找到匹配的上市股票。",
    unavailable: "行情服务暂时不可用，请稍后重新尝试该代码。",
    errors: {
      invalidSymbol: "请输入有效的上市股票代码。",
      unsupportedInstrument: "当前工作台仅支持上市股票。",
      insufficientHistory: "该股票尚不足 200 个日度数据点，暂时无法生成分析。",
      notFound: "没有找到该代码对应的上市股票。",
    },
    analyzing: "正在读取行情历史…",
    analyze: "分析",
    changeStock: "更换股票",
    importCase: "导入已有 Falsifi 案例",
    overview: "真实行情快照",
    oneYearHistory: "复权收盘价 · 1 年",
    source: "数据来源",
    fetched: "获取时间",
    metrics: {
      month: "1 个月收益",
      quarter: "3 个月收益",
      year: "1 年收益",
      volatility: "30 日波动率",
      drawdown: "最大回撤",
      rsi: "RSI（14 日）",
    },
    verify: "行情可能延迟或不完整，重大数据请以交易所或公司披露为准。",
  },
  ja: {
    heroEyebrow: "実データ・リサーチ",
    heroTitle: "デモではなく、実在する銘柄を選択。",
    heroBody:
      "米国株、中国A株、香港株を検索できます。1年分の遅延市場データから検証可能なケースを作り、何が判断を反転させるかを示します。",
    searchPlaceholder: "ティッカーまたは企業名 — AAPL、603901、Tencent",
    searchLabel: "銘柄を検索",
    marketsLabel: "株式市場",
    markets: {
      all: "すべて",
      us: "米国",
      cn: "中国A株",
      hk: "香港",
    },
    quickTitle: "実在企業から始める",
    realData: "実際の遅延市場データ",
    noAccount: "アカウント・APIキー不要",
    delayed: "出典と時刻を明示",
    searchHint: "企業名またはティッカーを入力してください。",
    empty: "一致する上場銘柄が見つかりません。",
    unavailable:
      "市場データを一時的に取得できません。しばらくして再試行してください。",
    errors: {
      invalidSymbol: "有効な上場株式ティッカーを入力してください。",
      unsupportedInstrument: "このワークスペースは上場株式のみ対応します。",
      insufficientHistory:
        "分析に必要な200営業日分のデータがまだありません。",
      notFound: "そのティッカーに一致する上場株式が見つかりません。",
    },
    analyzing: "市場履歴を読み込み中…",
    analyze: "分析",
    changeStock: "銘柄を変更",
    importCase: "既存の Falsifi ケースを読み込む",
    overview: "市場スナップショット",
    oneYearHistory: "調整後終値 · 1年",
    source: "出典",
    fetched: "取得時刻",
    metrics: {
      month: "1か月リターン",
      quarter: "3か月リターン",
      year: "1年リターン",
      volatility: "30日ボラティリティ",
      drawdown: "最大ドローダウン",
      rsi: "RSI（14）",
    },
    verify:
      "価格は遅延または不完全な場合があります。重要な数値は取引所・発行体で確認してください。",
  },
  es: {
    heroEyebrow: "Análisis con datos reales",
    heroTitle: "Elige una acción real, no una demostración.",
    heroBody:
      "Busca acciones de EE. UU., China continental o Hong Kong. Falsifi carga un año de datos retrasados, crea un caso examinable y muestra qué lo haría cambiar.",
    searchPlaceholder: "Ticker o empresa — AAPL, 603901, Tencent",
    searchLabel: "Buscar acciones",
    marketsLabel: "Mercados bursátiles",
    markets: {
      all: "Todos",
      us: "EE. UU.",
      cn: "Acciones A",
      hk: "Hong Kong",
    },
    quickTitle: "Empieza con una empresa real",
    realData: "Datos reales con retraso",
    noAccount: "Sin cuenta ni clave API",
    delayed: "Fuente y hora visibles",
    searchHint: "Escribe el nombre de una empresa o su ticker.",
    empty: "No se encontró una acción cotizada coincidente.",
    unavailable:
      "Los datos de mercado no están disponibles temporalmente. Inténtalo de nuevo.",
    errors: {
      invalidSymbol: "Introduce un ticker bursátil válido.",
      unsupportedInstrument: "Este espacio solo admite acciones cotizadas.",
      insufficientHistory:
        "La acción aún no tiene las 200 observaciones diarias requeridas.",
      notFound: "No se encontró una acción cotizada con ese ticker.",
    },
    analyzing: "Cargando historial de mercado…",
    analyze: "Analizar",
    changeStock: "Cambiar acción",
    importCase: "Importar un caso de Falsifi",
    overview: "Instantánea de mercado",
    oneYearHistory: "Cierre ajustado · 1 año",
    source: "Fuente",
    fetched: "Obtenido",
    metrics: {
      month: "Rentabilidad 1 mes",
      quarter: "Rentabilidad 3 meses",
      year: "Rentabilidad 1 año",
      volatility: "Volatilidad 30 días",
      drawdown: "Caída máxima",
      rsi: "RSI (14)",
    },
    verify:
      "Las cotizaciones pueden estar retrasadas o incompletas. Verifica las cifras relevantes con la bolsa o el emisor.",
  },
};

export const marketUi = (locale: Locale) => MARKET_COPY[locale];

const QUICK_PICKS: Array<StockSearchResult> = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NMS",
    exchangeName: "Nasdaq",
    type: "EQUITY",
    region: "us",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NMS",
    exchangeName: "Nasdaq",
    type: "EQUITY",
    region: "us",
  },
  {
    symbol: "603901.SS",
    name: "Zhejiang Yongchuang Intelligent Equipment",
    exchange: "SHH",
    exchangeName: "Shanghai",
    type: "EQUITY",
    region: "cn",
  },
  {
    symbol: "002441.SZ",
    name: "Zhongyeda Electric",
    exchange: "SHZ",
    exchangeName: "Shenzhen",
    type: "EQUITY",
    region: "cn",
  },
  {
    symbol: "0700.HK",
    name: "Tencent Holdings",
    exchange: "HKG",
    exchangeName: "Hong Kong",
    type: "EQUITY",
    region: "hk",
  },
];

const responseMessage = async (
  response: Response,
  text: MarketCopy,
) => {
  try {
    const body = (await response.json()) as { code?: string };
    if (body.code === "INVALID_SYMBOL") return text.errors.invalidSymbol;
    if (body.code === "UNSUPPORTED_INSTRUMENT") {
      return text.errors.unsupportedInstrument;
    }
    if (body.code === "INSUFFICIENT_HISTORY") {
      return text.errors.insufficientHistory;
    }
    if (body.code === "NOT_FOUND") return text.errors.notFound;
    return text.unavailable;
  } catch {
    return text.unavailable;
  }
};

export function StockPicker({
  locale,
  onSelect,
  onImport,
}: {
  locale: Locale;
  onSelect: (snapshot: MarketSnapshot) => void;
  onImport: () => void;
}) {
  const text = marketUi(locale);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<MarketRegion>("all");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [resultKey, setResultKey] = useState("");
  const [searching, setSearching] = useState(false);
  const [loadingSymbol, setLoadingSymbol] = useState("");
  const [error, setError] = useState("");
  const trimmedQuery = query.trim();
  const minimumLength = /^\d+$/.test(trimmedQuery) ? 1 : 2;
  const queryReady = trimmedQuery.length >= minimumLength;
  const searchKey = `${region}:${trimmedQuery.toLocaleLowerCase(locale)}`;
  const visibleResults = resultKey === searchKey ? results : [];
  const isSearching =
    queryReady && (searching || resultKey !== searchKey);

  useEffect(() => {
    if (!queryReady) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setError("");
      try {
        const params = new URLSearchParams({
          q: trimmedQuery,
          market: region,
          locale,
        });
        const response = await fetch(`/api/stocks/search?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(await responseMessage(response, text));
        }
        const body = (await response.json()) as { results?: unknown };
        setResults(
          Array.isArray(body.results)
            ? body.results.filter(isStockSearchResult)
            : [],
        );
        setResultKey(searchKey);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setResults([]);
        setResultKey(searchKey);
        setError(caught instanceof Error ? caught.message : text.unavailable);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 260);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    locale,
    queryReady,
    region,
    searchKey,
    text,
    trimmedQuery,
  ]);

  const analyze = async (stock: StockSearchResult) => {
    setLoadingSymbol(stock.symbol);
    setError("");
    try {
      const params = new URLSearchParams({
        symbol: stock.symbol,
        name: stock.name,
      });
      const response = await fetch(`/api/stocks/quote?${params}`);
      if (!response.ok) {
        throw new Error(await responseMessage(response, text));
      }
      const body = (await response.json()) as { snapshot?: unknown };
      if (!isMarketSnapshot(body.snapshot)) throw new Error(text.unavailable);
      onSelect(body.snapshot);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : text.unavailable);
    } finally {
      setLoadingSymbol("");
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (visibleResults[0]) {
      void analyze(visibleResults[0]);
      return;
    }
    const symbol = normalizeSymbolInput(trimmedQuery, region);
    if (!symbol || !isExplicitSymbolInput(trimmedQuery)) {
      setError(text.empty);
      return;
    }
    void analyze({
      symbol,
      name: symbol,
      exchange: "",
      exchangeName: text.markets[region],
      type: "EQUITY",
      region: region === "all" ? "other" : region,
    });
  };

  const visiblePicks =
    region === "all"
      ? QUICK_PICKS
      : QUICK_PICKS.filter((item) => item.region === region);

  return (
    <section className="stock-picker">
      <div className="stock-picker-copy">
        <span className="picker-eyebrow">
          <i />
          {text.heroEyebrow}
        </span>
        <h1>{text.heroTitle}</h1>
        <p>{text.heroBody}</p>
        <div className="picker-trust">
          <span>
            <Database size={14} />
            {text.realData}
          </span>
          <span>
            <ShieldCheck size={14} />
            {text.noAccount}
          </span>
          <span>{text.delayed}</span>
        </div>
      </div>

      <div className="stock-search-panel">
        <div
          className="market-tabs"
          role="tablist"
          aria-label={text.marketsLabel}
        >
          {(Object.keys(text.markets) as MarketRegion[]).map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={region === item}
              className={region === item ? "active" : ""}
              key={item}
              onClick={() => setRegion(item)}
            >
              {text.markets[item]}
            </button>
          ))}
        </div>

        <form className="stock-search" onSubmit={submit}>
          <Search size={19} aria-hidden="true" />
          <label className="sr-only" htmlFor="stock-search-input">
            {text.searchLabel}
          </label>
          <input
            id="stock-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={text.searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            className="button primary"
            disabled={
              !trimmedQuery || Boolean(loadingSymbol) || isSearching
            }
          >
            {isSearching ? (
              <LoaderCircle className="spin" size={15} />
            ) : (
              <ArrowRight size={15} />
            )}
            {text.analyze}
          </button>
        </form>

        {trimmedQuery && (
          <div className="stock-results" aria-live="polite">
            {isSearching && !visibleResults.length ? (
              <div className="search-state">
                <LoaderCircle className="spin" size={16} />
                {text.searchHint}
              </div>
            ) : visibleResults.length ? (
              visibleResults.map((stock) => (
                <button
                  type="button"
                  key={stock.symbol}
                  onClick={() => void analyze(stock)}
                  disabled={Boolean(loadingSymbol)}
                >
                  <span className="result-symbol">{stock.symbol}</span>
                  <span className="result-company">
                    <strong>{stock.name}</strong>
                    <small>
                      {stock.exchangeName || stock.exchange || stock.type}
                    </small>
                  </span>
                  {loadingSymbol === stock.symbol ? (
                    <LoaderCircle className="spin" size={16} />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              ))
            ) : !error ? (
              <div className="search-state">{text.empty}</div>
            ) : null}
          </div>
        )}

        {error && (
          <p className="market-error" role="alert">
            {error}
          </p>
        )}

        {!trimmedQuery && (
          <div className="quick-picks">
            <span>{text.quickTitle}</span>
            <div>
              {visiblePicks.map((stock) => (
                <button
                  type="button"
                  key={stock.symbol}
                  onClick={() => void analyze(stock)}
                  disabled={Boolean(loadingSymbol)}
                >
                  <strong>{stock.symbol}</strong>
                  <span>{stock.name}</span>
                  {loadingSymbol === stock.symbol ? (
                    <LoaderCircle className="spin" size={14} />
                  ) : (
                    <ArrowRight size={14} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="picker-import">
          <button type="button" onClick={onImport}>
            <FileUp size={14} />
            {text.importCase}
          </button>
        </div>
      </div>
    </section>
  );
}

const formatPercent = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

const formatPrice = (
  value: number,
  currency: string,
  locale: Locale,
) => {
  try {
    if (!currency) throw new Error("No currency");
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: value < 10 ? 2 : 1,
      maximumFractionDigits: value < 10 ? 3 : 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: value < 10 ? 3 : 2,
    }).format(value);
  }
};

export function MarketOverview({
  snapshot,
  locale,
}: {
  snapshot: MarketSnapshot;
  locale: Locale;
}) {
  const text = marketUi(locale);
  const chart = useMemo(() => {
    const width = 760;
    const height = 148;
    const left = 4;
    const right = width - 4;
    const top = 8;
    const bottom = height - 20;
    const values = snapshot.history.map((point) => point.close);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(max - min, 0.000001);
    const x = (index: number) =>
      left + (index / Math.max(values.length - 1, 1)) * (right - left);
    const y = (value: number) =>
      bottom - ((value - min) / range) * (bottom - top);
    const line = values
      .map(
        (value, index) =>
          `${index === 0 ? "M" : "L"} ${x(index).toFixed(2)} ${y(value).toFixed(2)}`,
      )
      .join(" ");
    return {
      width,
      height,
      bottom,
      line,
      area: `${line} L ${right} ${bottom} L ${left} ${bottom} Z`,
      positive: snapshot.metrics.yearReturn >= 0,
    };
  }, [snapshot]);
  const metrics = snapshot.metrics;
  const metricItems = [
    [text.metrics.month, formatPercent(metrics.monthReturn)],
    [text.metrics.quarter, formatPercent(metrics.quarterReturn)],
    [text.metrics.year, formatPercent(metrics.yearReturn)],
    [text.metrics.volatility, `${metrics.annualizedVolatility.toFixed(1)}%`],
    [text.metrics.drawdown, `${metrics.maxDrawdown.toFixed(1)}%`],
    [text.metrics.rsi, metrics.rsi14.toFixed(1)],
  ];
  const changeClass = snapshot.changePercent >= 0 ? "positive" : "negative";
  const gradientId = `market-area-${snapshot.symbol.replace(
    /[^a-z0-9]/gi,
    "",
  )}`;

  return (
    <section className="market-overview card">
      <div className="market-overview-head">
        <div>
          <span className="eyebrow">{text.overview}</span>
          <strong className="market-price">
            {formatPrice(snapshot.price, snapshot.currency, locale)}
          </strong>
          <span className={`market-change ${changeClass}`}>
            {snapshot.changePercent >= 0 ? (
              <ArrowUpRight size={15} />
            ) : (
              <ArrowDownRight size={15} />
            )}
            {formatPrice(Math.abs(snapshot.change), snapshot.currency, locale)}
            <b>{formatPercent(snapshot.changePercent)}</b>
          </span>
        </div>
        <div className="market-source">
          <span>
            {snapshot.exchange}
            {snapshot.currency ? ` · ${snapshot.currency}` : ""}
          </span>
          <a href={snapshot.sourceUrl} target="_blank" rel="noreferrer">
            {text.source}: {snapshot.provider}
            <ExternalLink size={12} />
          </a>
          <small>
            {text.fetched}:{" "}
            {new Intl.DateTimeFormat(locale, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(snapshot.fetchedAt))}
          </small>
        </div>
      </div>

      <div className={`market-history ${chart.positive ? "up" : "down"}`}>
        <span>{text.oneYearHistory}</span>
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          aria-label={`${snapshot.symbol} ${text.oneYearHistory}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={chart.area} fill={`url(#${gradientId})`} />
          <path d={chart.line} className="market-history-line" />
        </svg>
      </div>

      <div className="market-metrics">
        {metricItems.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <p className="market-verify">
        <ShieldCheck size={13} />
        {text.verify}
      </p>
    </section>
  );
}
