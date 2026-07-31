import assert from "node:assert/strict";
import test from "node:test";

import {
  contentSignature,
  extractWebMaterial,
  normalizePublicUrl,
  signatureSimilarity,
  validatePublicUrl,
} from "../lib/web-material.ts";

const paragraph = `Acme reported quarterly revenue of 4.2 billion dollars. Management said gross margin improved because logistics costs fell and product mix shifted toward enterprise customers. The company expects capital expenditure to remain stable while free cash flow improves during the next two quarters. Analysts should compare this statement with the filed quarterly report and the investor presentation.`;

test("extracts declared metadata, canonical URL, readable text and source links", () => {
  const html = `<!doctype html><html><head>
    <title>Fallback title</title>
    <meta property="og:title" content="Acme quarterly results">
    <meta property="og:site_name" content="Example News">
    <meta property="article:published_time" content="2026-07-30T08:00:00Z">
    <link rel="canonical" href="/results?utm_source=mail">
  </head><body><article><h1>Acme results</h1><p>${paragraph}</p>
    <a href="https://www.sec.gov/Archives/example.htm">Original SEC filing</a>
  </article><script>secret noise</script></body></html>`;
  const result = extractWebMaterial(html, "https://news.example.com/story?ref=home", "2026-07-31T00:00:00Z");
  assert.equal(result.title, "Acme quarterly results");
  assert.equal(result.extraction.publisher, "Example News");
  assert.equal(result.extraction.publishedAt, "2026-07-30");
  assert.equal(result.extraction.canonicalUrl, "https://news.example.com/results");
  assert.equal(result.extraction.status, "extracted");
  assert.deepEqual(result.extraction.sourceLinks, ["https://www.sec.gov/Archives/example.htm"]);
  assert.ok(result.extraction.signature.length >= 20);
});

test("content signatures recognize syndicated copies but reject unrelated material", () => {
  const copy = `${paragraph} ${paragraph} The figures are unaudited and remain subject to final review.`;
  const edited = `Updated at 10:00. ${paragraph.replace("4.2 billion", "approximately 4.2 billion")} ${paragraph} Read more company news.`;
  const unrelated = `The city opened a new railway station after five years of construction. Passenger services will run every fifteen minutes. Local officials discussed public transport, ticket prices, accessibility, tourism and the surrounding park. ${"Weather forecasts call for rain throughout the weekend. ".repeat(8)}`;
  assert.ok(signatureSimilarity(contentSignature(copy), contentSignature(edited)) >= 0.82);
  assert.ok(signatureSimilarity(contentSignature(copy), contentSignature(unrelated)) < 0.2);
});

test("CJK copies produce a useful signature", () => {
  const original = "公司发布季度报告，营业收入同比增长百分之十二，毛利率改善两个百分点。管理层表示主要原因是产品结构改善和运输成本下降。未来两个季度，公司将控制资本开支，并优先提高自由现金流。投资者应当同时查看交易所公告和审计报告。".repeat(4);
  const copy = `快讯：${original.replace("百分之十二", "12%")}`;
  assert.ok(signatureSimilarity(contentSignature(original), contentSignature(copy)) >= 0.7);
});

test("normalizes tracking parameters and rejects private network targets", () => {
  assert.equal(normalizePublicUrl("https://example.com/report/?utm_source=x&gclid=1#top"), "https://example.com/report");
  assert.equal(validatePublicUrl("https://example.com/report"), true);
  for (const url of [
    "http://localhost/admin",
    "http://127.0.0.1/",
    "http://10.1.2.3/",
    "http://169.254.169.254/latest/meta-data",
    "http://[::1]/",
    "https://service.internal/path",
    "https://example.com:8080/path",
  ]) assert.equal(validatePublicUrl(url), false, url);
});

test("fixture benchmark keeps high precision on labeled pairs", () => {
  const base = [
    paragraph.repeat(3),
    "The board approved a share repurchase program after reviewing leverage, liquidity and long-term capital allocation. The authorization permits purchases in the open market and may be suspended at any time.".repeat(5),
    "The regulator opened an investigation into accounting controls. The company said it is cooperating and cannot estimate a financial impact. The inquiry concerns revenue recognition and disclosure procedures.".repeat(5),
    "A new factory contract will supply battery systems for ten years. Production begins next summer and the customer may expand annual volumes if quality targets are met.".repeat(5),
  ];
  const labeled = base.flatMap((text, index) => [
    { same: true, left: text, right: `Update ${index}. ${text} Boilerplate legal notice.` },
    { same: false, left: text, right: base[(index + 1) % base.length] },
    { same: true, left: text, right: text.replace(/company/giu, "issuer") },
    { same: false, left: text, right: base[(index + 2) % base.length] },
    { same: true, left: text, right: `${text.slice(0, -80)} revised ending with the same reported facts.` },
  ]);
  let truePositive = 0;
  let falsePositive = 0;
  let falseNegative = 0;
  for (const pair of labeled) {
    const predicted = signatureSimilarity(contentSignature(pair.left), contentSignature(pair.right)) >= 0.62;
    if (predicted && pair.same) truePositive += 1;
    if (predicted && !pair.same) falsePositive += 1;
    if (!predicted && pair.same) falseNegative += 1;
  }
  const precision = truePositive / (truePositive + falsePositive);
  const recall = truePositive / (truePositive + falseNegative);
  assert.ok(precision >= 0.85, `precision ${precision}`);
  assert.ok(recall >= 0.7, `recall ${recall}`);
});
