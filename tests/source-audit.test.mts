import assert from "node:assert/strict";
import test from "node:test";

import { DEMO_CASE } from "../lib/demo.ts";
import { auditSources, suggestSourceRelationships } from "../lib/source-audit.ts";

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
