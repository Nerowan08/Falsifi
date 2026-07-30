import {
  inferMarketRegion,
  isSupportedListedEquitySymbol,
  MarketRegion,
  parseYahooChart,
} from "@/lib/market";

const validSymbol = /^[A-Z0-9^=.-]{1,24}$/;
const isRegion = (value: string): value is MarketRegion =>
  ["all", "us", "cn", "hk"].includes(value);

class UpstreamHttpError extends Error {
  constructor(readonly status: number) {
    super(`Market data returned HTTP ${status}.`);
  }
}

async function fetchYahooChart(host: string, symbol: string) {
  const url = new URL(
    `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}`,
  );
  url.searchParams.set("range", "1y");
  url.searchParams.set("interval", "1d");
  url.searchParams.set("includeAdjustedClose", "true");
  url.searchParams.set("events", "div,splits");

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.8",
      "user-agent": "Falsifi/0.4 (+https://github.com/Nerowan08/Falsifi)",
    },
    signal: AbortSignal.timeout(9_000),
  });
  if (!response.ok) {
    throw new UpstreamHttpError(response.status);
  }
  return response.json();
}

const errorResponse = (error: string, code: string, status: number) =>
  Response.json(
    { error, code },
    {
      status,
      headers: { "cache-control": "no-store" },
    },
  );

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const symbol = (requestUrl.searchParams.get("symbol") ?? "")
    .normalize("NFKC")
    .trim()
    .toUpperCase();
  const name = (requestUrl.searchParams.get("name") ?? "")
    .normalize("NFKC")
    .trim()
    .slice(0, 300);
  const rawRegion = requestUrl.searchParams.get("market") ?? "all";
  const region: MarketRegion = isRegion(rawRegion) ? rawRegion : "all";

  if (!validSymbol.test(symbol)) {
    return errorResponse(
      "Enter a valid ticker symbol.",
      "INVALID_SYMBOL",
      400,
    );
  }

  let failureStatus = 404;
  let failureCode = "NOT_FOUND";
  for (const host of [
    "query1.finance.yahoo.com",
    "query2.finance.yahoo.com",
  ]) {
    try {
      const payload = await fetchYahooChart(host, symbol);
      const snapshot = parseYahooChart(payload, name);
      if (snapshot.instrumentType.toUpperCase() !== "EQUITY") {
        return errorResponse(
          "This workspace supports listed equities only.",
          "UNSUPPORTED_INSTRUMENT",
          400,
        );
      }
      const snapshotRegion = inferMarketRegion(
        snapshot.symbol,
        snapshot.exchange,
      );
      if (
        snapshotRegion === "other" ||
        !isSupportedListedEquitySymbol(snapshot.symbol, snapshotRegion) ||
        (region !== "all" && snapshotRegion !== region)
      ) {
        return errorResponse(
          "This workspace supports U.S., mainland China, and Hong Kong listed equities only.",
          "UNSUPPORTED_INSTRUMENT",
          400,
        );
      }
      return Response.json(
        {
          snapshot,
          notice:
            "Quotes may be delayed. Verify material figures with the relevant exchange or issuer.",
        },
        {
          headers: {
            "cache-control":
              "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
          },
        },
      );
    } catch (error) {
      if (
        error instanceof DOMException &&
        ["AbortError", "TimeoutError"].includes(error.name)
      ) {
        failureStatus = 504;
        failureCode = "SERVICE_UNAVAILABLE";
      } else if (error instanceof UpstreamHttpError) {
        if (error.status !== 404) {
          failureStatus = 503;
          failureCode = "SERVICE_UNAVAILABLE";
        }
      } else if (
        error instanceof Error &&
        error.message.startsWith("At least 200")
      ) {
        failureStatus = 422;
        failureCode = "INSUFFICIENT_HISTORY";
      } else {
        failureStatus = 502;
        failureCode = "SERVICE_UNAVAILABLE";
      }
    }
  }

  return errorResponse(
    failureCode === "INSUFFICIENT_HISTORY"
      ? `At least 200 daily observations are required for ${symbol}.`
      : failureCode === "NOT_FOUND"
        ? `No listed equity was found for ${symbol}.`
        : "The market data service is temporarily unavailable.",
    failureCode,
    failureStatus,
  );
}
