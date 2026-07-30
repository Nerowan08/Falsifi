import {
  mergeMaterialCandidatesInOrder,
  mergeMaterialCandidates,
  parseCninfoMaterialCandidates,
  parseYahooMaterialCandidates,
} from "@/lib/materials";
import {
  fetchCninfoAnnouncements,
  resolveCninfoSecurity,
} from "@/lib/cninfo";
import {
  inferMarketRegion,
  type MarketRegion,
} from "@/lib/market";

const validSymbol = /^[A-Z0-9^=.-]{1,24}$/;

const isRegion = (value: string): value is MarketRegion =>
  ["all", "us", "cn", "hk"].includes(value);

const yahooLocale = (locale: string, market: MarketRegion) => {
  if (locale.startsWith("zh")) {
    return {
      lang: market === "hk" ? "zh-Hant-HK" : "zh-CN",
      region: market === "hk" ? "HK" : "CN",
    };
  }
  if (locale.startsWith("ja")) return { lang: "ja-JP", region: "JP" };
  if (locale.startsWith("es")) return { lang: "es-US", region: "US" };
  return { lang: "en-US", region: market === "hk" ? "HK" : "US" };
};

async function fetchYahooNews(
  query: string,
  locale: { lang: string; region: string },
  timeoutMs = 7_000,
) {
  let lastError: unknown;
  for (const host of [
    "query1.finance.yahoo.com",
    "query2.finance.yahoo.com",
  ]) {
    try {
      const url = new URL(`https://${host}/v1/finance/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("quotesCount", "0");
      url.searchParams.set("newsCount", "20");
      url.searchParams.set("lang", locale.lang);
      url.searchParams.set("region", locale.region);
      const response = await fetch(url, {
        headers: {
          accept: "application/json",
          "accept-language": locale.lang,
          "user-agent":
            "Falsifi/0.7 (+https://github.com/Nerowan08/Falsifi)",
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) {
        throw new Error(`Public source search returned ${response.status}.`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("Public source search failed.");
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const symbol = (requestUrl.searchParams.get("symbol") ?? "")
    .normalize("NFKC")
    .trim()
    .toUpperCase();
  const companyName = (requestUrl.searchParams.get("name") ?? "")
    .normalize("NFKC")
    .trim()
    .slice(0, 300);
  const query = (requestUrl.searchParams.get("q") ?? companyName)
    .normalize("NFKC")
    .trim()
    .slice(0, 160);
  const rawMarket = requestUrl.searchParams.get("market") ?? "all";
  const requestedMarket: MarketRegion = isRegion(rawMarket)
    ? rawMarket
    : "all";
  const inferredMarket = inferMarketRegion(symbol);
  const market: MarketRegion =
    requestedMarket === "all" &&
    ["us", "cn", "hk"].includes(inferredMarket)
      ? (inferredMarket as MarketRegion)
      : requestedMarket;

  if (!validSymbol.test(symbol) || !companyName || !query) {
    return Response.json(
      {
        error: "Enter a valid stock and search term.",
        code: "INVALID_QUERY",
      },
      {
        status: 400,
        headers: { "cache-control": "no-store" },
      },
    );
  }

  const locale = yahooLocale(
    requestUrl.searchParams.get("locale") ?? "en",
    market,
  );
  const localeVariants = [
    locale,
    { lang: "en-US", region: market === "hk" ? "HK" : "US" },
  ].filter(
    (value, index, values) =>
      values.findIndex(
        (candidate) =>
          candidate.lang === value.lang &&
          candidate.region === value.region,
      ) === index,
  );
  const terms = Array.from(
    new Set([query, symbol].filter((term) => term.trim().length > 0)),
  ).slice(0, 2);
  const yahooRequest = Promise.allSettled(
    terms.flatMap((term) =>
      localeVariants.map((variant) =>
        fetchYahooNews(
          term,
          variant,
          market === "cn" ? 3_500 : 7_000,
        ),
      ),
    ),
  );
  const cninfoRequest =
    market === "cn"
      ? (async () => {
          try {
            const security = await resolveCninfoSecurity(symbol);
            if (!security) {
              return {
                candidates: [] as ReturnType<
                  typeof parseCninfoMaterialCandidates
                >,
                resolvedCompanyName: null as string | null,
                available: false,
              };
            }
            const payload = await fetchCninfoAnnouncements(security);
            return {
              candidates: parseCninfoMaterialCandidates(payload, {
                symbol,
                companyName: security.name,
                limit: 12,
              }),
              resolvedCompanyName: security.name,
              available: true,
            };
          } catch {
            return {
              candidates: [] as ReturnType<
                typeof parseCninfoMaterialCandidates
              >,
              resolvedCompanyName: null as string | null,
              available: false,
            };
          }
        })()
      : Promise.resolve({
          candidates: [] as ReturnType<
            typeof parseCninfoMaterialCandidates
          >,
          resolvedCompanyName: null as string | null,
          available: false,
        });
  const [settled, cninfoResult] = await Promise.all([
    yahooRequest,
    cninfoRequest,
  ]);
  const successfulPayloads = settled
    .filter(
      (result): result is PromiseFulfilledResult<unknown> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);
  const yahooCandidates = mergeMaterialCandidates(
    successfulPayloads.map((payload) =>
      parseYahooMaterialCandidates(payload, {
        symbol,
        companyName,
        limit: 20,
      }),
    ),
    12,
  );
  const candidates =
    market === "cn"
      ? mergeMaterialCandidatesInOrder(
          [cninfoResult.candidates.slice(0, 8), yahooCandidates],
          12,
        )
      : yahooCandidates;
  const providers = [
    ...(cninfoResult.available ? ["CNINFO"] : []),
    ...(successfulPayloads.length > 0 ? ["Yahoo Finance"] : []),
  ];

  return Response.json(
    {
      candidates,
      providers,
      providerStatus:
        providers.length > 0 ? "ok" : "unavailable",
      resolvedCompanyName: cninfoResult.resolvedCompanyName,
      searchedAt: new Date().toISOString(),
    },
    {
      headers: {
        "cache-control":
          providers.length > 0
            ? "public, max-age=60, s-maxage=300, stale-while-revalidate=900"
            : "no-store",
      },
    },
  );
}
