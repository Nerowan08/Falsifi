import { NextResponse } from "next/server";

import {
  extractWebMaterial,
  normalizePublicUrl,
  validatePublicUrl,
  type ExtractedWebMaterial,
} from "@/lib/web-material";

export const dynamic = "force-dynamic";

const MAX_URLS = 12;
const MAX_BYTES = 2 * 1024 * 1024;

async function readLimited(response: Response) {
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) throw new Error("page-too-large");
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      throw new Error("page-too-large");
    }
    text += decoder.decode(chunk.value, { stream: true });
  }
  return text + decoder.decode();
}

async function fetchOne(requestedUrl: string): Promise<ExtractedWebMaterial> {
  let current = normalizePublicUrl(requestedUrl);
  if (!current || !validatePublicUrl(current)) throw new Error("unsafe-url");

  for (let redirects = 0; redirects <= 4; redirects += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    let response: Response;
    try {
      response = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,application/pdf;q=0.4", "User-Agent": "Falsifi/0.9 source-audit (+https://github.com/Nerowan08/Falsifi)" },
      });
    } finally {
      clearTimeout(timer);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirects === 4) throw new Error("redirect-failed");
      const next = normalizePublicUrl(location, current);
      if (!next || !validatePublicUrl(next)) throw new Error("unsafe-redirect");
      current = next;
      continue;
    }
    if (!response.ok) throw new Error(`http-${response.status}`);

    const contentType = response.headers.get("content-type")?.toLocaleLowerCase("en") ?? "";
    if (contentType.includes("application/pdf")) {
      return {
        requestedUrl,
        title: current.split("/").filter(Boolean).at(-1) ?? new URL(current).hostname,
        extraction: {
          status: "partial",
          fetchedAt: new Date().toISOString(),
          finalUrl: current,
          canonicalUrl: current,
          wordCount: 0,
          signature: [],
          outboundUrls: [],
          sourceLinks: [],
          publisher: new URL(current).hostname.replace(/^www\./u, ""),
          reason: "pdf-not-read",
        },
      };
    }
    if (contentType && !/(?:text\/html|application\/xhtml\+xml|text\/plain)/u.test(contentType)) throw new Error("unsupported-page");
    const html = await readLimited(response);
    const material = extractWebMaterial(html, current);
    material.requestedUrl = requestedUrl;
    return material;
  }
  throw new Error("redirect-failed");
}

const publicReason = (error: unknown) => {
  if (error instanceof Error && error.name === "AbortError") return "The website took too long to respond.";
  const reason = error instanceof Error ? error.message : "fetch-failed";
  if (reason === "unsafe-url" || reason === "unsafe-redirect") return "This address cannot be read safely.";
  if (reason === "page-too-large") return "This page is too large to read.";
  if (reason === "unsupported-page") return "This file type is not supported yet.";
  if (reason === "pdf-not-read") return "The PDF link was added, but its text could not be read.";
  if (reason.startsWith("http-")) return `The website returned ${reason.slice(5)}.`;
  if (reason === "redirect-failed") return "The page redirected too many times.";
  return "The public page could not be read.";
};

function blockedMaterial(url: string, reason: string): ExtractedWebMaterial {
  const normalized = normalizePublicUrl(url);
  const publisher = new URL(normalized).hostname.replace(/^www\./u, "");
  return {
    requestedUrl: url,
    title: publisher,
    extraction: {
      status: "blocked",
      fetchedAt: new Date().toISOString(),
      finalUrl: normalized,
      canonicalUrl: normalized,
      publisher,
      wordCount: 0,
      signature: [],
      outboundUrls: [],
      sourceLinks: [],
      reason: reason.slice(0, 120),
    },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const urls = typeof body === "object" && body !== null && Array.isArray((body as { urls?: unknown }).urls)
    ? (body as { urls: unknown[] }).urls
    : [];
  const unique = Array.from(new Set(urls.filter((url): url is string => typeof url === "string").map((url) => url.trim()).filter(Boolean)));
  if (!unique.length || unique.length > MAX_URLS) return NextResponse.json({ error: `Send between 1 and ${MAX_URLS} public links.` }, { status: 400 });

  const results = await Promise.all(unique.map(async (url) => {
    try { return { ok: true as const, material: await fetchOne(url) }; }
    catch (error) {
      const message = publicReason(error);
      return validatePublicUrl(url)
        ? { ok: true as const, material: blockedMaterial(url, message) }
        : { ok: false as const, url, error: message };
    }
  }));
  return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
