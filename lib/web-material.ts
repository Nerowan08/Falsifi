export type EvidenceExtractionStatus = "extracted" | "partial" | "blocked";

export type EvidenceExtraction = {
  status: EvidenceExtractionStatus;
  fetchedAt: string;
  finalUrl: string;
  canonicalUrl?: string;
  publishedAt?: string;
  publisher?: string;
  wordCount: number;
  signature: number[];
  outboundUrls: string[];
  sourceLinks: string[];
  reason?: string;
};

export type ExtractedWebMaterial = {
  requestedUrl: string;
  title: string;
  extraction: EvidenceExtraction;
};

const MAX_HTML_CHARS = 250_000;
const MAX_SIGNATURE = 160;
const SOURCE_WORDS = /(?:original|primary source|source|reference|citation|filing|press release|annual report|quarterly report|公告|原文|来源|出处|披露|申报|開示|原典|出典|fuente|original)/iu;
const OFFICIAL_HOSTS = /(?:^|\.)(?:sec\.gov|cninfo\.com\.cn|hkexnews\.hk|sse\.com\.cn|szse\.cn)$/iu;

const decodeEntities = (value: string) => value
  .replace(/&#(\d+);/gu, (_, code: string) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/giu, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&nbsp;/giu, " ")
  .replace(/&amp;/giu, "&")
  .replace(/&quot;/giu, "\"")
  .replace(/&#39;|&apos;/giu, "'")
  .replace(/&lt;/giu, "<")
  .replace(/&gt;/giu, ">");

const cleanText = (value: string) => decodeEntities(value)
  .replace(/<[^>]+>/gu, " ")
  .replace(/\s+/gu, " ")
  .trim();

function attribute(tag: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = tag.match(new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))`, "iu"));
  return decodeEntities(match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
}

function metaValue(html: string, keys: string[]) {
  for (const tag of html.match(/<meta\b[^>]*>/giu) ?? []) {
    const key = (attribute(tag, "property") || attribute(tag, "name") || attribute(tag, "itemprop")).toLocaleLowerCase("en");
    if (keys.includes(key)) {
      const content = attribute(tag, "content");
      if (content) return cleanText(content);
    }
  }
  return "";
}

function linkValue(html: string, relation: string) {
  for (const tag of html.match(/<link\b[^>]*>/giu) ?? []) {
    const rel = attribute(tag, "rel").toLocaleLowerCase("en").split(/\s+/u);
    if (rel.includes(relation)) return attribute(tag, "href");
  }
  return "";
}

function normalizedDate(value: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
}

export function normalizePublicUrl(value: string, base?: string) {
  try {
    const url = base ? new URL(value, base) : new URL(value);
    if (!/^https?:$/u.test(url.protocol)) return "";
    url.hash = "";
    for (const key of Array.from(url.searchParams.keys())) {
      if (/^(?:utm_.+|fbclid|gclid|mc_[ce]id|ref|source)$/iu.test(key)) url.searchParams.delete(key);
    }
    if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/u, "");
    return url.toString();
  } catch {
    return "";
  }
}

function extractLinks(html: string, baseUrl: string) {
  const scored = new Map<string, number>();
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/giu)) {
    const href = attribute(`<a ${match[1]}>`, "href");
    const url = normalizePublicUrl(href, baseUrl);
    if (!url) continue;
    const anchor = cleanText(match[2]).slice(0, 300);
    let score = SOURCE_WORDS.test(`${anchor} ${href}`) ? 2 : 0;
    try {
      if (OFFICIAL_HOSTS.test(new URL(url).hostname)) score += 3;
    } catch { /* normalized above */ }
    scored.set(url, Math.max(scored.get(url) ?? 0, score));
  }
  const outboundUrls = Array.from(scored.keys()).slice(0, 20);
  const sourceLinks = Array.from(scored.entries())
    .filter(([, score]) => score >= 2)
    .sort((left, right) => right[1] - left[1])
    .map(([url]) => url)
    .slice(0, 12);
  return { outboundUrls, sourceLinks };
}

function articleText(html: string) {
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/iu)?.[1]
    ?? html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/iu)?.[1]
    ?? html;
  return cleanText(article
    .slice(0, MAX_HTML_CHARS)
    .replace(/<!--[^]*?-->/gu, " ")
    .replace(/<(?:script|style|svg|noscript|template|nav|footer)\b[^>]*>[^]*?<\/(?:script|style|svg|noscript|template|nav|footer)>/giu, " ")
    .replace(/<br\s*\/?>|<\/p>|<\/div>|<\/li>|<\/h[1-6]>/giu, "\n"));
}

function textFeatures(text: string) {
  const normalized = text.normalize("NFKC").toLocaleLowerCase("en");
  const latin = normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
  const features: string[] = [];
  for (let index = 0; index < latin.length - 2; index += 1) {
    features.push(`${latin[index]} ${latin[index + 1]} ${latin[index + 2]}`);
  }
  for (const run of normalized.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]{4,}/gu) ?? []) {
    const chars = Array.from(run);
    for (let index = 0; index < chars.length - 3; index += 1) {
      features.push(chars.slice(index, index + 4).join(""));
    }
  }
  return features;
}

function hash32(value: string) {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

export function contentSignature(text: string) {
  const hashes = new Set(textFeatures(text).map(hash32));
  return Array.from(hashes).sort((left, right) => left - right).slice(0, MAX_SIGNATURE);
}

export function signatureSimilarity(left: number[], right: number[]) {
  if (left.length < 20 || right.length < 20) return 0;
  const rightSet = new Set(right);
  let intersection = 0;
  for (const hash of left) if (rightSet.has(hash)) intersection += 1;
  return intersection / Math.min(left.length, right.length);
}

export function extractWebMaterial(htmlInput: string, finalUrl: string, fetchedAt = new Date().toISOString()): ExtractedWebMaterial {
  const html = htmlInput.slice(0, MAX_HTML_CHARS);
  const titleTag = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/iu)?.[1] ?? "";
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/iu)?.[1] ?? "";
  const title = metaValue(html, ["og:title", "twitter:title", "headline"]) || cleanText(titleTag) || cleanText(h1) || new URL(finalUrl).hostname;
  const declaredCanonical = linkValue(html, "canonical");
  const canonicalUrl = normalizePublicUrl(declaredCanonical, finalUrl) || normalizePublicUrl(finalUrl);
  const publisher = metaValue(html, ["og:site_name", "application-name", "publisher"]) || new URL(finalUrl).hostname.replace(/^www\./u, "");
  const publishedAt = normalizedDate(metaValue(html, ["article:published_time", "datepublished", "date", "pubdate"]));
  const text = articleText(html);
  const { outboundUrls, sourceLinks } = extractLinks(html, finalUrl);
  return {
    requestedUrl: finalUrl,
    title: title.slice(0, 500),
    extraction: {
      status: text.length >= 180 ? "extracted" : "partial",
      fetchedAt,
      finalUrl: normalizePublicUrl(finalUrl),
      canonicalUrl,
      publishedAt,
      publisher: publisher.slice(0, 300),
      wordCount: text.split(/\s+/u).filter(Boolean).length,
      signature: contentSignature(text),
      outboundUrls,
      sourceLinks,
      reason: text.length >= 180 ? undefined : "not-enough-readable-text",
    },
  };
}

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/u.test(part) || Number(part) > 255)) return false;
  const [a, b] = parts.map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

export function validatePublicUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLocaleLowerCase("en").replace(/^\[|\]$/gu, "");
    if (!/^https?:$/u.test(url.protocol) || (url.port && !["80", "443"].includes(url.port))) return false;
    if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return false;
    if (isPrivateIpv4(host) || host === "::1" || host === "0:0:0:0:0:0:0:1" || /^f[cd][\da-f]{2}:/iu.test(host) || /^fe[89ab][\da-f]:/iu.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}
