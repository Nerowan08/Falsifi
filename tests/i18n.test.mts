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

test("the four-language guide states the exact default score boundaries", async () => {
  const guide = await readFile(
    new URL("../components/user-guide.tsx", import.meta.url),
    "utf8",
  );

  assert.match(guide, /58 or higher/);
  assert.match(guide, /58 分及以上/);
  assert.match(guide, /58以上/);
  assert.match(guide, /58 o más/);
});
