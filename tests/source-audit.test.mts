import assert from "node:assert/strict";
import test from "node:test";

import { DEMO_CASE } from "../lib/demo.ts";
import { auditSources, suggestSourceRelationships } from "../lib/source-audit.ts";
import { contentSignature } from "../lib/web-material.ts";

const baseItem = structuredClone(DEMO_CASE.evidence[0]);

test("exact canonical links are confirmed as one source without a suggestion", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.evidence = [
    { ...baseItem, id: "a", sourceUrl: "https://example.com/report?utm_source=x", originId: undefined, provenance: "user" as const },
    { ...baseItem, id: "b", sourceUrl: "https://www.example.com/report/", originId: undefined, provenance: "user" as const },
  ];
  const audit = auditSources(thesisCase);
  assert.equal(audit.confirmedGroupCount, 1);
  assert.equal(audit.duplicateMaterialCount, 1);
  assert.equal(audit.suggestions.length, 0);
});

test("near-identical timely headlines are suggested, not auto-merged", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.evidence = [
    { ...baseItem, id: "a", title: "Acme reports fourth quarter revenue growth and profit", source: "Wire A", sourceUrl: "https://a.example/story", asOf: "2026-07-20", originId: undefined, provenance: "user" as const },
    { ...baseItem, id: "b", title: "Acme reports fourth-quarter revenue growth and profit", source: "Paper B", sourceUrl: "https://b.example/story", asOf: "2026-07-21", originId: undefined, provenance: "user" as const },
  ];
  const audit = auditSources(thesisCase);
  assert.equal(audit.confirmedGroupCount, 2);
  assert.equal(audit.suggestions.length, 1);
  assert.equal(audit.suggestions[0].reason, "near-identical-title");
});

test("a filing and nearby article on the same event create an explainable suggestion", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.evidence = [
    { ...baseItem, id: "filing", title: "公司关于股份回购方案的公告", source: "交易所", sourceUrl: "https://exchange.example/filing", asOf: "2026-07-20", group: "Official filing" as const, originId: undefined, provenance: "user" as const },
    { ...baseItem, id: "news", title: "公司拟启动新一轮股份回购", source: "财经媒体", sourceUrl: "https://news.example/story", asOf: "2026-07-21", group: "External estimate" as const, originId: undefined, provenance: "user" as const },
  ];
  const suggestions = suggestSourceRelationships(thesisCase);
  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].primaryId, "filing");
  assert.equal(suggestions[0].reason, "filing-follow-up");
});

test("unrelated materials stay independent", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.evidence = [
    { ...baseItem, id: "a", title: "Board appoints a new chief financial officer", sourceUrl: "https://a.example/story", asOf: "2026-01-01", originId: undefined, provenance: "user" as const },
    { ...baseItem, id: "b", title: "Factory wins a ten-year energy contract", sourceUrl: "https://b.example/story", asOf: "2026-07-20", originId: undefined, provenance: "user" as const },
  ];
  assert.equal(suggestSourceRelationships(thesisCase).length, 0);
});

test("a direct source link names the cited page as the likely origin", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  thesisCase.evidence = [
    { ...baseItem, id: "filing", title: "Acme 10-Q", sourceUrl: "https://sec.example/filing", group: "Official filing" as const, originId: undefined, provenance: "user" as const },
    { ...baseItem, id: "story", title: "What Acme reported", sourceUrl: "https://news.example/story", originId: undefined, provenance: "user" as const, extraction: { status: "extracted" as const, fetchedAt: "2026-07-31T00:00:00Z", finalUrl: "https://news.example/story", wordCount: 300, signature: [], outboundUrls: [], sourceLinks: ["https://sec.example/filing"] } },
  ];
  const suggestion = suggestSourceRelationships(thesisCase)[0];
  assert.equal(suggestion.reason, "direct-citation");
  assert.equal(suggestion.primaryId, "filing");
  assert.equal(auditSources(thesisCase).confirmedGroupCount, 2);
});

test("pages sharing an original link are suggested but not auto-merged", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  const extraction = { status: "extracted" as const, fetchedAt: "2026-07-31T00:00:00Z", wordCount: 300, signature: [], outboundUrls: [], sourceLinks: ["https://company.example/results"] };
  thesisCase.evidence = [
    { ...baseItem, id: "a", title: "Analyst A on results", sourceUrl: "https://a.example/story", originId: undefined, provenance: "user" as const, extraction: { ...extraction, finalUrl: "https://a.example/story" } },
    { ...baseItem, id: "b", title: "Analyst B reviews quarter", sourceUrl: "https://b.example/story", originId: undefined, provenance: "user" as const, extraction: { ...extraction, finalUrl: "https://b.example/story" } },
  ];
  const audit = auditSources(thesisCase);
  assert.equal(audit.suggestions[0].reason, "shared-original-link");
  assert.equal(audit.confirmedGroupCount, 2);
});

test("strong body overlap creates an explainable suggestion without an automatic merge", () => {
  const thesisCase = structuredClone(DEMO_CASE);
  thesisCase.isDemo = false;
  const body = "Quarterly revenue rose as enterprise demand improved. Management expects gross margin and free cash flow to improve while capital spending remains stable. ".repeat(14);
  const signature = contentSignature(body);
  thesisCase.evidence = [
    { ...baseItem, id: "a", title: "Wire report", sourceUrl: "https://a.example/wire", originId: undefined, provenance: "user" as const, extraction: { status: "extracted" as const, fetchedAt: "2026-07-31T00:00:00Z", finalUrl: "https://a.example/wire", wordCount: 250, signature, outboundUrls: [], sourceLinks: [] } },
    { ...baseItem, id: "b", title: "Republished report", sourceUrl: "https://b.example/copy", originId: undefined, provenance: "user" as const, extraction: { status: "extracted" as const, fetchedAt: "2026-07-31T00:00:00Z", finalUrl: "https://b.example/copy", wordCount: 260, signature, outboundUrls: [], sourceLinks: [] } },
  ];
  const audit = auditSources(thesisCase);
  assert.equal(audit.suggestions[0].reason, "content-overlap");
  assert.equal(audit.suggestions[0].confidence, "high");
  assert.equal(audit.confirmedGroupCount, 2);
});
