import {
  inferMarketRegion,
  isExplicitSymbolInput,
  MarketRegion,
  normalizeSymbolInput,
  parseYahooSearch,
  StockSearchResult,
} from "@/lib/market";

const yahooLocale = (locale: string) => {
  if (locale.startsWith("zh")) return { lang: "zh-CN", region: "CN" };
  if (locale.startsWith("ja")) return { lang: "ja-JP", region: "JP" };
  if (locale.startsWith("es")) return { lang: "es-US", region: "US" };
  return { lang: "en-US", region: "US" };
};

const isRegion = (value: string): value is MarketRegion =>
  ["all", "us", "cn", "hk"].includes(value);

const directCandidate = (
  symbol: string,
  region: MarketRegion,
): StockSearchResult => {
  const inferred = inferMarketRegion(symbol);
  return {
    symbol,
    name: symbol,
    exchange: "",
    exchangeName:
      region === "cn"
        ? "Mainland China"
        : region === "hk"
          ? "Hong Kong"
          : region === "us"
            ? "United States"
            : "",
    type: "EQUITY",
    region: inferred,
  };
};

async function fetchYahooSearch(url: URL) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "accept-language": url.searchParams.get("lang") ?? "en-US",
      "user-agent": "Falsifi/0.4 (+https://github.com/Nerowan08/Falsifi)",
    },
    signal: AbortSignal.timeout(7_000),
  });
  if (!response.ok) {
    throw new Error(`Market search returned HTTP ${response.status}.`);
  }
  return response.json();
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const query = (requestUrl.searchParams.get("q") ?? "")
    .normalize("NFKC")
    .trim()
    .slice(0, 80);
  const rawRegion = requestUrl.searchParams.get("market") ?? "all";
  const region: MarketRegion = isRegion(rawRegion) ? rawRegion : "all";

  if (query.length < 1) {
    return Response.json({ results: [] });
  }

  const locale = yahooLocale(requestUrl.searchParams.get("locale") ?? "en");
  const endpoints = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"];
  let results: StockSearchResult[] = [];
  let lastError = "";

  for (const host of endpoints) {
    try {
      const url = new URL(`https://${host}/v1/finance/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("quotesCount", "12");
      url.searchParams.set("newsCount", "0");
      url.searchParams.set("lang", locale.lang);
      url.searchParams.set("region", locale.region);
      const payload = await fetchYahooSearch(url);
      results = parseYahooSearch(payload, region);
      if (results.length) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Search failed.";
    }
  }

  const normalized = normalizeSymbolInput(query, region);
  if (normalized && isExplicitSymbolInput(query) && !results.length) {
    results.push(directCandidate(normalized, region));
  }

  if (!results.length && lastError) {
    return Response.json(
      {
        error: "The market search service is temporarily unavailable.",
        code: "SERVICE_UNAVAILABLE",
      },
      {
        status: 503,
        headers: { "cache-control": "no-store" },
      },
    );
  }

  return Response.json(
    {
      results: results.slice(0, 8),
      provider: "Yahoo Finance",
    },
    {
      headers: {
        "cache-control":
          "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
