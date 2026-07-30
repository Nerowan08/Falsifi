"use client";

import {
  Check,
  Circle,
  ExternalLink,
  FileText,
  Link2,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Settings2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { auditEvidenceStructure } from "@/lib/evidence-audit";
import type { EvidenceItem, ThesisCase } from "@/lib/falsifi";
import type { Locale } from "@/lib/i18n";

type WorkspaceCopy = {
  toolLabel: string;
  actionTitle: string;
  editClaim: string;
  addEvidence: string;
  editReview: string;
  saveReview: string;
  saved: string;
  resultTitle: string;
  resultEmpty: string;
  result: (materials: number, groups: number, related: number) => string;
  materials: string;
  sourceGroups: string;
  relatedMaterials: string;
  verification: Record<"original" | "reviewed" | "unverified", string>;
  claimTitle: string;
  claimEmpty: string;
  invalidation: string;
  reviewDate: string;
  settingsEmpty: string;
  edit: string;
  evidenceTitle: string;
  evidenceHelp: string;
  noEvidence: string;
  group: (index: number) => string;
  oneMaterial: string;
  manyMaterials: (count: number) => string;
  groupedNote: string;
  marketTitle: string;
  marketHelp: string;
  marketUnavailable: string;
  price: string;
  dailyMove: string;
  marketTime: string;
  source: string;
  refresh: string;
  refreshing: string;
  boundary: string;
};

const COPY: Record<Locale, WorkspaceCopy> = {
  en: {
    toolLabel: "Source check",
    actionTitle: "Actions",
    editClaim: "Write / edit claim",
    addEvidence: "Add material",
    editReview: "Check settings",
    saveReview: "Save record",
    saved: "Saved",
    resultTitle: "Source result",
    resultEmpty: "No material yet.",
    result: (materials, groups, related) =>
      `${materials} material${materials === 1 ? "" : "s"}, currently grouped into ${groups}. ${related ? `${related} share a source with another item.` : ""}`.trim(),
    materials: "Materials",
    sourceGroups: "Source groups",
    relatedMaterials: "Shared sources",
    verification: {
      original: "Original checked",
      reviewed: "Secondary source checked",
      unverified: "Not checked",
    },
    claimTitle: "Your claim",
    claimEmpty: "No claim yet.",
    invalidation: "What would change your view",
    reviewDate: "Check again",
    settingsEmpty: "Not set.",
    edit: "Edit",
    evidenceTitle: "Materials",
    evidenceHelp:
      "Matching links group automatically. You can also group different links that come from the same document, dataset, interview, or republication.",
    noEvidence: "No material yet.",
    group: (index) => `Group ${index}`,
    oneMaterial: "1 material",
    manyMaterials: (count) => `${count} materials`,
    groupedNote: "These materials are in the same group.",
    marketTitle: "Market data",
    marketHelp: "For context only. It is not counted as material.",
    marketUnavailable: "Market data is unavailable.",
    price: "Latest price",
    dailyMove: "Daily move",
    marketTime: "Market time",
    source: "Source",
    refresh: "Refresh",
    refreshing: "Refreshing…",
    boundary:
      "Falsifi organizes the material you add. It does not judge the stock or predict returns.",
  },
  "zh-CN": {
    toolLabel: "材料来源检查",
    actionTitle: "操作",
    editClaim: "写或改判断",
    addEvidence: "添加材料",
    editReview: "复查设置",
    saveReview: "保存记录",
    saved: "已保存",
    resultTitle: "归组结果",
    resultEmpty: "还没有材料。",
    result: (materials, groups, related) =>
      `${materials} 条材料，当前归为 ${groups} 组。${related ? `其中 ${related} 条与其他材料同源。` : ""}`,
    materials: "材料",
    sourceGroups: "来源组",
    relatedMaterials: "同源材料",
    verification: {
      original: "已看原始文件",
      reviewed: "已看可靠转述",
      unverified: "尚未核查",
    },
    claimTitle: "你的判断",
    claimEmpty: "还没写判断。",
    invalidation: "什么情况会让你改判断",
    reviewDate: "下次检查",
    settingsEmpty: "还没设置。",
    edit: "修改",
    evidenceTitle: "材料",
    evidenceHelp:
      "相同链接会自动放在一起。不同链接如果来自同一份文件、数据或采访，也可以手动归组。",
    noEvidence: "还没有材料。",
    group: (index) => `第 ${index} 组`,
    oneMaterial: "1 条材料",
    manyMaterials: (count) => `${count} 条材料`,
    groupedNote: "这些材料已归为同一组。",
    marketTitle: "行情",
    marketHelp: "仅供参考，不计入材料。",
    marketUnavailable: "暂时没有行情。",
    price: "最新价格",
    dailyMove: "当日涨跌",
    marketTime: "行情时间",
    source: "来源",
    refresh: "刷新",
    refreshing: "正在刷新…",
    boundary: "只整理你添加的材料，不判断股票涨跌。",
  },
  ja: {
    toolLabel: "出典チェック",
    actionTitle: "操作",
    editClaim: "仮説を書く・編集",
    addEvidence: "資料を追加",
    editReview: "確認設定",
    saveReview: "記録を保存",
    saved: "保存済み",
    resultTitle: "出典の結果",
    resultEmpty: "資料はまだありません。",
    result: (materials, groups, related) =>
      `${materials}件の資料を、現在${groups}グループに分類しています。${related ? `${related}件は他の資料と同じ出典です。` : ""}`,
    materials: "資料",
    sourceGroups: "出典グループ",
    relatedMaterials: "同じ出典",
    verification: {
      original: "原文を確認",
      reviewed: "二次資料を確認",
      unverified: "未確認",
    },
    claimTitle: "仮説",
    claimEmpty: "仮説はまだありません。",
    invalidation: "判断を変える条件",
    reviewDate: "次回確認",
    settingsEmpty: "未設定です。",
    edit: "編集",
    evidenceTitle: "資料",
    evidenceHelp:
      "同じリンクは自動でまとまります。同じ文書、データ、インタビューから来た別リンクも手動でまとめられます。",
    noEvidence: "資料はまだありません。",
    group: (index) => `グループ ${index}`,
    oneMaterial: "資料 1件",
    manyMaterials: (count) => `資料 ${count}件`,
    groupedNote: "同じグループにまとめています。",
    marketTitle: "市場データ",
    marketHelp: "参考のみ。資料には数えません。",
    marketUnavailable: "市場データはありません。",
    price: "最新価格",
    dailyMove: "当日変化",
    marketTime: "市場時刻",
    source: "出典",
    refresh: "更新",
    refreshing: "更新中…",
    boundary:
      "追加した資料を整理するツールです。銘柄の評価やリターン予測はしません。",
  },
  es: {
    toolLabel: "Revisión de fuentes",
    actionTitle: "Acciones",
    editClaim: "Escribir / editar tesis",
    addEvidence: "Añadir material",
    editReview: "Ajustes de revisión",
    saveReview: "Guardar registro",
    saved: "Guardado",
    resultTitle: "Resultado de fuentes",
    resultEmpty: "Aún no hay material.",
    result: (materials, groups, related) =>
      `${materials} material${materials === 1 ? "" : "es"}, agrupado${materials === 1 ? "" : "s"} ahora en ${groups}. ${related ? `${related} comparten fuente con otro elemento.` : ""}`.trim(),
    materials: "Materiales",
    sourceGroups: "Grupos de fuentes",
    relatedMaterials: "Fuentes repetidas",
    verification: {
      original: "Original revisado",
      reviewed: "Fuente secundaria revisada",
      unverified: "Sin revisar",
    },
    claimTitle: "Tu tesis",
    claimEmpty: "Aún no hay tesis.",
    invalidation: "Qué te haría cambiar de opinión",
    reviewDate: "Próxima revisión",
    settingsEmpty: "Sin configurar.",
    edit: "Editar",
    evidenceTitle: "Materiales",
    evidenceHelp:
      "Los enlaces iguales se agrupan solos. También puedes agrupar enlaces distintos que vengan del mismo documento, conjunto de datos, entrevista o republicación.",
    noEvidence: "Aún no hay material.",
    group: (index) => `Grupo ${index}`,
    oneMaterial: "1 material",
    manyMaterials: (count) => `${count} materiales`,
    groupedNote: "Estos materiales están en el mismo grupo.",
    marketTitle: "Datos de mercado",
    marketHelp: "Solo como contexto. No cuenta como material.",
    marketUnavailable: "No hay datos de mercado.",
    price: "Último precio",
    dailyMove: "Cambio diario",
    marketTime: "Hora del mercado",
    source: "Fuente",
    refresh: "Actualizar",
    refreshing: "Actualizando…",
    boundary:
      "Falsifi organiza el material que añades. No valora la acción ni predice rentabilidad.",
  },
};

function formatDate(value: string, locale: Locale) {
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T12:00:00`
      : value,
  );
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatPrice(value: number, currency: string, locale: Locale) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: value < 10 ? 3 : 2,
    }).format(value);
  } catch {
    return value.toLocaleString(locale, { maximumFractionDigits: 3 });
  }
}

export function FalsifyWorkspace({
  thesisCase,
  locale,
  refreshing,
  onEditClaim,
  onEditReview,
  onAddEvidence,
  onEditEvidence,
  onRefresh,
  onSaveReview,
}: {
  thesisCase: ThesisCase;
  locale: Locale;
  refreshing: boolean;
  onEditClaim: () => void;
  onEditReview: () => void;
  onAddEvidence: () => void;
  onEditEvidence: (item: EvidenceItem) => void;
  onRefresh: () => void;
  onSaveReview: () => void;
}) {
  const copy = COPY[locale];
  const audit = useMemo(
    () => auditEvidenceStructure(thesisCase),
    [thesisCase],
  );
  const market = thesisCase.marketSnapshot;
  const plan = thesisCase.researchPlan;
  const [savedVersion, setSavedVersion] = useState<string | null>(null);
  const saved = savedVersion === thesisCase.lastUpdated;

  const saveRecord = () => {
    onSaveReview();
    setSavedVersion(thesisCase.lastUpdated);
  };

  return (
    <section className="focus-workspace">
      <header className="focus-case-header">
        <div>
          <span>{copy.toolLabel}</span>
          <h1>
            {thesisCase.company}
            <small>{thesisCase.ticker}</small>
          </h1>
        </div>
      </header>

      <section className="focus-command-bar" aria-label={copy.actionTitle}>
        <h2>{copy.actionTitle}</h2>
        <div>
          <button className="button ghost" onClick={onEditClaim}>
            <Pencil size={15} />
            {copy.editClaim}
          </button>
          <button className="button primary" onClick={onAddEvidence}>
            <Plus size={15} />
            {copy.addEvidence}
          </button>
          <button className="button ghost" onClick={onEditReview}>
            <Settings2 size={15} />
            {copy.editReview}
          </button>
          <button className="button ghost" onClick={saveRecord}>
            {saved ? <Check size={15} /> : <Save size={15} />}
            {saved ? copy.saved : copy.saveReview}
          </button>
        </div>
      </section>

      <article className="focus-result-card">
        <span>{copy.resultTitle}</span>
        <h2 data-testid="source-summary">
          {audit.materialCount
            ? copy.result(
                audit.materialCount,
                audit.sourceGroupCount,
                audit.relatedMaterialCount,
              )
            : copy.resultEmpty}
        </h2>
        <div className="focus-counts" aria-label={copy.resultTitle}>
          <div>
            <strong>{audit.materialCount}</strong>
            <span>{copy.materials}</span>
          </div>
          <div>
            <strong>{audit.sourceGroupCount}</strong>
            <span>{copy.sourceGroups}</span>
          </div>
          <div>
            <strong>{audit.relatedMaterialCount}</strong>
            <span>{copy.relatedMaterials}</span>
          </div>
        </div>
      </article>

      <section className="focus-claim">
        <div className="focus-section-heading">
          <h2>{copy.claimTitle}</h2>
          <button onClick={onEditClaim}>
            <Pencil size={14} />
            {copy.edit}
          </button>
        </div>
        {plan?.thesisConfirmed ? (
          <blockquote data-testid="current-thesis">
            {thesisCase.thesis}
          </blockquote>
        ) : (
          <p className="focus-empty">{copy.claimEmpty}</p>
        )}

        <div className="focus-review-settings">
          <div>
            <span>{copy.invalidation}</span>
            <strong>{plan?.invalidationCriteria || copy.settingsEmpty}</strong>
          </div>
          <div>
            <span>{copy.reviewDate}</span>
            <strong>
              {plan?.nextReviewDate
                ? formatDate(plan.nextReviewDate, locale)
                : copy.settingsEmpty}
            </strong>
          </div>
          <button onClick={onEditReview}>
            <Settings2 size={14} />
            {copy.edit}
          </button>
        </div>
      </section>

      <section className="focus-materials">
        <div className="focus-section-heading">
          <div>
            <h2>{copy.evidenceTitle}</h2>
            <p>{copy.evidenceHelp}</p>
          </div>
          <button className="button primary" onClick={onAddEvidence}>
            <Plus size={15} />
            {copy.addEvidence}
          </button>
        </div>

        {audit.groups.length ? (
          <div className="source-group-list">
            {audit.groups.map((group, index) => {
              return (
                <article key={group.id}>
                  <header>
                    <strong>{copy.group(index + 1)}</strong>
                    <small>
                      {group.items.length === 1
                        ? copy.oneMaterial
                        : copy.manyMaterials(group.items.length)}
                    </small>
                  </header>
                  {group.items.length > 1 && (
                    <p className="source-group-note">
                      <Link2 size={13} />
                      {copy.groupedNote}
                    </p>
                  )}
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <button
                          className="source-item-main"
                          onClick={() => onEditEvidence(item)}
                        >
                          <FileText size={15} />
                          <span>
                            <strong>{item.title}</strong>
                            <small>
                              {item.source} · {formatDate(item.asOf, locale)}
                            </small>
                            <em
                              className={`source-verification ${item.verification ?? "unverified"}`}
                            >
                              {
                                copy.verification[
                                  item.verification ?? "unverified"
                                ]
                              }
                            </em>
                          </span>
                        </button>
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${copy.source}: ${item.source}`}
                        >
                          <ExternalLink size={14} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="focus-empty">{copy.noEvidence}</p>
        )}
      </section>

      {market ? (
        <details className="focus-details">
          <summary>
            <span>
              <strong>{copy.marketTitle}</strong>
              <small>{copy.marketHelp}</small>
            </span>
          </summary>
          <div className="market-context-row">
            <div>
              <span>{copy.price}</span>
              <strong>
                {formatPrice(market.price, market.currency, locale)}
              </strong>
            </div>
            <div>
              <span>{copy.dailyMove}</span>
              <strong>
                {market.changePercent > 0 ? "+" : ""}
                {market.changePercent.toFixed(2)}%
              </strong>
            </div>
            <div>
              <span>{copy.marketTime}</span>
              <strong>{formatDate(market.marketTime, locale)}</strong>
            </div>
            <a href={market.sourceUrl} target="_blank" rel="noreferrer">
              {copy.source}
              <ExternalLink size={13} />
            </a>
            <button onClick={onRefresh} disabled={refreshing}>
              <RefreshCcw
                size={14}
                className={refreshing ? "spin" : undefined}
              />
              {refreshing ? copy.refreshing : copy.refresh}
            </button>
          </div>
        </details>
      ) : (
        <p className="focus-market-unavailable">
          <Circle size={9} />
          {copy.marketUnavailable}
        </p>
      )}

      <p className="focus-boundary">
        <Circle size={9} />
        {copy.boundary}
      </p>
    </section>
  );
}
