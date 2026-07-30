import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { resolveLocale } from "../lib/i18n.ts";

test("locale resolution checks every browser preference in order", () => {
  assert.equal(resolveLocale(["fr-FR", "ja-JP"]), "ja");
  assert.equal(resolveLocale(["de-DE", "es-MX", "en-US"]), "es");
});

test("user-facing source does not reintroduce retired internal jargon", async () => {
  const sources = await Promise.all(
    [
      "app/page.tsx",
      "components/falsify-workspace.tsx",
      "components/market-workspace.tsx",
      "components/user-guide.tsx",
      "lib/i18n.ts",
    ].map((path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")),
  );
  const visibleSource = sources.join("\n");

  for (const retired of [
    "独立根",
    "证据根",
    "研究姿态",
    "实测消融",
    "压力语义",
    "联合翻转前沿",
    "Single-variable cliff",
    "Joint flip frontier",
    "Evidence root",
    "Stress semantics",
    "内部ルールの値",
    "申告された",
    "サンプル計算",
    "puntuación de reglas",
    "pregunta refutable",
    "Cálculo por muestreo",
  ]) {
    assert.doesNotMatch(visibleSource, new RegExp(retired, "i"));
  }
});

test("the four-language guide explains the single source-group task", async () => {
  const guide = await readFile(
    new URL("../components/user-guide.tsx", import.meta.url),
    "utf8",
  );

  assert.match(guide, /groups by source/);
  assert.match(guide, /来源组/);
  assert.match(guide, /出典グループ/);
  assert.match(guide, /grupos de fuentes/);
  assert.match(guide, /canonical URL/i);
  assert.doesNotMatch(guide, /shared source or claim metadata/i);
  assert.doesNotMatch(guide, /按顺序完成/);
  assert.doesNotMatch(guide, /各段階で主要操作は一つだけ/);
  assert.doesNotMatch(guide, /Cada etapa presenta una sola acción principal/);
});

test("the main workflow leaves every action under user control", async () => {
  const [page, workspace, finder, editor] = await Promise.all(
    [
      "app/page.tsx",
      "components/falsify-workspace.tsx",
      "components/material-finder.tsx",
      "components/research-action.tsx",
    ].map((path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")),
  );

  assert.match(workspace, /onEditClaim/);
  assert.match(workspace, /onAddEvidence/);
  assert.match(workspace, /onFindEvidence/);
  assert.match(workspace, /onEditReview/);
  assert.match(workspace, /onSaveReview/);
  assert.doesNotMatch(workspace, /readiness\.nextAction/);
  assert.doesNotMatch(workspace, /focus-steps/);
  assert.doesNotMatch(page, /setShowResearchPlanModal\(true\)/);
  assert.match(page, /onFindEvidence=\{\(\) => setShowMaterialFinder\(true\)\}/);
  assert.match(finder, /useState<Set<string>>\(new Set\(\)\)/);
  assert.match(finder, /Nothing is added until you select and confirm it/);
  assert.doesNotMatch(finder, /onResolveCompanyName/);
  assert.doesNotMatch(page, /onResolveCompanyName/);
  assert.match(editor, /mode: ResearchPlanEditorMode/);
});

test("the material finder names its A-share source in every language", async () => {
  const [finder, guide] = await Promise.all(
    [
      "components/material-finder.tsx",
      "components/user-guide.tsx",
    ].map((path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")),
  );

  assert.match(finder, /CNINFO/);
  assert.match(finder, /巨潮资讯/);
  assert.match(finder, /公司公告/);
  assert.match(guide, /exact-ticker CNINFO filings/);
  assert.match(guide, /巨潮资讯的公司公告/);
  assert.match(guide, /CNINFO開示/);
  assert.match(guide, /documentos de CNINFO/);
});
