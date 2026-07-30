type CninfoStockRecord = {
  code?: unknown;
  orgId?: unknown;
  zwjc?: unknown;
  category?: unknown;
};

type CninfoStockPayload = {
  stockList?: unknown;
};

export type CninfoSecurity = {
  code: string;
  orgId: string;
  name: string;
  exchange: "sh" | "sz";
};

const STOCK_LIST_URL =
  "https://www.cninfo.com.cn/new/data/szse_stock.json";
const SECURITY_SEARCH_URL =
  "https://www.cninfo.com.cn/new/information/topSearch/query";
const ANNOUNCEMENT_URL =
  "https://www.cninfo.com.cn/new/hisAnnouncement/query";
const CACHE_MS = 6 * 60 * 60 * 1_000;

let stockCache:
  | {
      expiresAt: number;
      byCode: Map<string, CninfoSecurity>;
    }
  | undefined;
let stockRequest: Promise<Map<string, CninfoSecurity>> | undefined;
const securityCache = new Map<
  string,
  { expiresAt: number; security: CninfoSecurity }
>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const aShareCode = (symbol: string) => {
  const normalized = symbol.normalize("NFKC").trim().toUpperCase();
  const match = normalized.match(/^(\d{6})(?:\.(?:SS|SZ))?$/);
  return match?.[1] ?? null;
};

const exchangeForCode = (code: string): "sh" | "sz" =>
  /^(?:5|6|9)/.test(code) ? "sh" : "sz";

const securityFromRecord = (
  rawItem: unknown,
  expectedCode?: string,
): CninfoSecurity | null => {
  if (!isRecord(rawItem)) return null;
  const item = rawItem as CninfoStockRecord;
  const code =
    typeof item.code === "string" ? item.code.trim() : "";
  const orgId =
    typeof item.orgId === "string" ? item.orgId.trim() : "";
  const name =
    typeof item.zwjc === "string" ? item.zwjc.trim() : "";
  const category =
    typeof item.category === "string" ? item.category.trim() : "";
  if (
    !/^\d{6}$/.test(code) ||
    (expectedCode && code !== expectedCode) ||
    !orgId ||
    orgId.length > 80 ||
    !/^[a-zA-Z0-9_-]+$/.test(orgId) ||
    !name ||
    name.length > 120 ||
    category !== "A股"
  ) {
    return null;
  }
  return {
    code,
    orgId,
    name,
    exchange: exchangeForCode(code),
  };
};

async function loadCninfoStocks() {
  if (stockCache && stockCache.expiresAt > Date.now()) {
    return stockCache.byCode;
  }
  if (stockRequest) return stockRequest;

  stockRequest = (async () => {
    const response = await fetch(STOCK_LIST_URL, {
      headers: {
        accept: "application/json",
        "accept-language": "zh-CN,zh;q=0.9",
        "user-agent":
          "Falsifi/0.7 (+https://github.com/Nerowan08/Falsifi)",
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      throw new Error(`CNINFO security lookup returned ${response.status}.`);
    }

    const payload = (await response.json()) as CninfoStockPayload;
    if (!isRecord(payload) || !Array.isArray(payload.stockList)) {
      throw new Error("CNINFO security lookup returned an invalid response.");
    }

    const byCode = new Map<string, CninfoSecurity>();
    for (const rawItem of payload.stockList) {
      const security = securityFromRecord(rawItem);
      if (security) byCode.set(security.code, security);
    }

    if (!byCode.size) {
      throw new Error("CNINFO security lookup returned no A-share records.");
    }
    stockCache = {
      expiresAt: Date.now() + CACHE_MS,
      byCode,
    };
    return byCode;
  })();

  try {
    return await stockRequest;
  } finally {
    stockRequest = undefined;
  }
}

export async function resolveCninfoSecurity(symbol: string) {
  const code = aShareCode(symbol);
  if (!code) return null;
  const cached = securityCache.get(code);
  if (cached && cached.expiresAt > Date.now()) return cached.security;

  try {
    const response = await fetch(SECURITY_SEARCH_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        referer: "https://www.cninfo.com.cn/",
        "user-agent":
          "Falsifi/0.7 (+https://github.com/Nerowan08/Falsifi)",
      },
      body: new URLSearchParams({
        keyWord: code,
        maxSecNum: "10",
      }),
      signal: AbortSignal.timeout(6_000),
    });
    if (!response.ok) {
      throw new Error(`CNINFO security search returned ${response.status}.`);
    }
    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) {
      throw new Error("CNINFO security search returned an invalid response.");
    }
    const security = payload
      .map((item) => securityFromRecord(item, code))
      .find((item): item is CninfoSecurity => Boolean(item));
    if (security) {
      securityCache.set(code, {
        expiresAt: Date.now() + CACHE_MS,
        security,
      });
      return security;
    }
  } catch {
    // Fall back to the official security list below.
  }

  const stocks = await loadCninfoStocks();
  const security = stocks.get(code) ?? null;
  if (security) {
    securityCache.set(code, {
      expiresAt: Date.now() + CACHE_MS,
      security,
    });
  }
  return security;
}

const shanghaiDate = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
};

export async function fetchCninfoAnnouncements(
  security: CninfoSecurity,
) {
  const end = shanghaiDate(new Date());
  const [year, month, day] = end.split("-");
  const start = `${Number(year) - 3}-${month}-${day}`;

  const fetchPage = async (pageNum: number) => {
    const body = new URLSearchParams({
      pageNum: String(pageNum),
      pageSize: "30",
      column: "szse",
      tabName: "fulltext",
      plate: security.exchange,
      stock: `${security.code},${security.orgId}`,
      searchkey: "",
      secid: "",
      category: "",
      trade: "",
      seDate: `${start}~${end}`,
      sortName: "",
      sortType: "",
      isHLtitle: "true",
    });

    const response = await fetch(ANNOUNCEMENT_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        referer: "https://www.cninfo.com.cn/",
        "user-agent":
          "Falsifi/0.7 (+https://github.com/Nerowan08/Falsifi)",
      },
      body,
      signal: AbortSignal.timeout(9_000),
    });
    if (!response.ok) {
      throw new Error(
        `CNINFO announcement search returned ${response.status}.`,
      );
    }
    return response.json() as Promise<Record<string, unknown>>;
  };

  const pages = await Promise.allSettled([fetchPage(1), fetchPage(2)]);
  const payloads = pages
    .filter(
      (
        result,
      ): result is PromiseFulfilledResult<Record<string, unknown>> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);
  if (!payloads.length) {
    throw new Error("CNINFO announcement search failed.");
  }

  return {
    announcements: payloads.flatMap((payload) =>
      Array.isArray(payload.announcements) ? payload.announcements : [],
    ),
  };
}
