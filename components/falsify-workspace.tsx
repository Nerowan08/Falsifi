"use client";

import {
  ArrowRight,
  Check,
  Circle,
  ExternalLink,
  FileText,
  Link2,
  Pencil,
  Plus,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import { useMemo } from "react";

import { auditEvidenceStructure } from "@/lib/evidence-audit";
import type { EvidenceItem, ThesisCase } from "@/lib/falsifi";
import type { Locale } from "@/lib/i18n";
import type {
  ReadinessAction,
  ResearchReadiness,
} from "@/lib/readiness";

type WorkspaceCopy = {
  toolLabel: string;
  cardTitle: string;
  steps: [string, string, string];
  status: {
    define: string;
    primary: string;
    challenge: string;
    diversity: string;
    date: string;
    ready: string;
  };
  body: {
    define: string;
    primary: string;
    challenge: string;
    diversity: string;
    date: string;
    ready: (materials: number, groups: number, related: number) => string;
  };
  actions: Record<ReadinessAction, string>;
  saveReview: string;
  materials: string;
  sourceGroups: string;
  relatedMaterials: string;
  verification: Record<"original" | "reviewed" | "unverified", string>;
  claimTitle: string;
  claimEmpty: string;
  invalidation: string;
  horizon: string;
  reviewDate: string;
  edit: string;
  evidenceTitle: string;
  evidenceHelp: string;
  addEvidence: string;
  noEvidence: string;
  group: (index: number) => string;
  oneMaterial: string;
  manyMaterials: (count: number) => string;
  groupedNote: string;
  supports: string;
  challenges: string;
  mixed: string;
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
    toolLabel: "Source-group check",
    cardTitle: "Thesis evidence card",
    steps: ["Define one claim", "Add key material", "Review source grouping"],
    status: {
      define: "First, make the claim testable.",
      primary: "Add one company or regulatory source.",
      challenge: "Your material only argues one side.",
      diversity: "The supporting and challenging material still form only one source group.",
      date: "Decide when this claim must be checked again.",
      ready: "Your evidence structure is ready to review.",
    },
    body: {
      define:
        "Write one claim, what would weaken it, and a review date. Falsifi will not invent a thesis from price data.",
      primary:
        "A news article may summarize someone else. Start with the issuer or regulator document it ultimately relies on.",
      challenge:
        "Add one credible fact that weakens your claim before collecting more supporting material.",
      diversity:
        "More links do not necessarily mean more sources. Add at least one material from a different document, dataset, interview, or publication chain.",
      date:
        "A dated review prevents the thesis from quietly changing after the outcome is known.",
      ready: (materials, groups, related) =>
        `This record contains ${materials} user-added material(s) in ${groups} identified source group(s). ${related} material(s) are grouped with another item by URL, source identity, or an explicit same-source relationship.`,
    },
    actions: {
      "define-case": "Define my claim",
      "add-invalidation": "Define what would weaken it",
      "add-primary-source": "Add an original disclosure",
      "add-counter-evidence": "Add a challenging fact",
      "add-independent-source": "Add a different source",
      "set-review-date": "Set a review date",
      "save-baseline": "Save this review",
    },
    saveReview: "Save this review",
    materials: "User-added materials",
    sourceGroups: "Identified source groups",
    relatedMaterials: "Grouped with another item",
    verification: {
      original: "Original checked",
      reviewed: "Secondary source checked",
      unverified: "Not yet checked",
    },
    claimTitle: "Claim being checked",
    claimEmpty: "No user-authored claim yet.",
    invalidation: "What would weaken it",
    horizon: "Time horizon",
    reviewDate: "Review on",
    edit: "Edit",
    evidenceTitle: "Materials and source relationships",
    evidenceHelp:
      "Matching canonical URLs are always grouped. You can also declare that different links trace to the same document, dataset, interview, or republication chain.",
    addEvidence: "Add material",
    noEvidence:
      "No user-added material yet. Automatic price observations are kept as market context and do not count here.",
    group: (index) => `Source group ${index}`,
    oneMaterial: "1 material",
    manyMaterials: (count) => `${count} materials`,
    groupedNote: "These items count as one source group.",
    supports: "Supports",
    challenges: "Challenges",
    mixed: "Mixed",
    marketTitle: "Market context",
    marketHelp:
      "Delayed market data is background only; it never satisfies the evidence check.",
    marketUnavailable:
      "Market context is unavailable. The evidence check still works without it.",
    price: "Latest price",
    dailyMove: "Daily move",
    marketTime: "Market time",
    source: "Source",
    refresh: "Refresh",
    refreshing: "Refreshing…",
    boundary:
      "Falsifi checks the structure of the material you provide. It does not prove the claim true, predict returns, or discover every republication chain.",
  },
  "zh-CN": {
    toolLabel: "股票判断来源归组",
    cardTitle: "判断证据卡",
    steps: ["定义一个判断", "添加关键材料", "查看来源归组"],
    status: {
      define: "先把这项判断写成可以检验的句子。",
      primary: "先补充一份公司或监管机构的原始披露。",
      challenge: "你现在的材料只在支持同一个方向。",
      diversity: "支持与削弱判断的材料目前仍只形成一个来源组。",
      date: "确定下一次必须重新检查这项判断的日期。",
      ready: "这项判断的证据结构已经可以复核。",
    },
    body: {
      define:
        "写下一个判断、什么情况会削弱它，以及复核日期。Falsifi 不会根据股价替你编造投资论点。",
      primary:
        "新闻往往只是转述。先加入它最终依赖的公司公告、财报或监管披露。",
      challenge:
        "在继续收集支持材料前，先加入一条可信、会削弱这项判断的事实。",
      diversity:
        "链接更多，不代表来源更多。请至少加入一项来自不同文件、数据集、采访或发布链的材料。",
      date:
        "提前写下复核日期，可以防止结果出现后悄悄修改原来的判断。",
      ready: (materials, groups, related) =>
        `当前记录包含 ${materials} 项人工录入材料，识别为 ${groups} 个来源组；其中 ${related} 项因网址、来源身份或明确的同源关系与其他材料归组。`,
    },
    actions: {
      "define-case": "写下我的判断",
      "add-invalidation": "写明什么会削弱它",
      "add-primary-source": "添加原始披露",
      "add-counter-evidence": "添加一条反方事实",
      "add-independent-source": "添加不同来源",
      "set-review-date": "设置复核日期",
      "save-baseline": "保存本次复核",
    },
    saveReview: "保存本次复核",
    materials: "人工录入材料",
    sourceGroups: "当前识别的来源组",
    relatedMaterials: "与其他材料归为一组",
    verification: {
      original: "已核对原始文件",
      reviewed: "已核对二手来源",
      unverified: "尚未核查",
    },
    claimTitle: "正在核查的判断",
    claimEmpty: "还没有用户自己写下的判断。",
    invalidation: "什么情况会削弱它",
    horizon: "判断期限",
    reviewDate: "下次复核",
    edit: "编辑",
    evidenceTitle: "材料与来源关系",
    evidenceHelp:
      "相同的规范化网址一定归为一组；不同链接若最终来自同一文件、数据集、采访或转载链，也可以明确标记为同源。",
    addEvidence: "添加材料",
    noEvidence:
      "还没有人工录入材料。自动行情只作为背景，不会被算成研究证据。",
    group: (index) => `来源组 ${index}`,
    oneMaterial: "1 项材料",
    manyMaterials: (count) => `${count} 项材料`,
    groupedNote: "这些材料只按一个来源组计算。",
    supports: "支持判断",
    challenges: "削弱判断",
    mixed: "方向混合",
    marketTitle: "行情背景",
    marketHelp: "延迟行情只提供背景，永远不能替代研究证据。",
    marketUnavailable: "行情背景不可用，但证据核查仍可正常继续。",
    price: "最新价格",
    dailyMove: "当日涨跌",
    marketTime: "行情时间",
    source: "数据来源",
    refresh: "刷新",
    refreshing: "正在刷新…",
    boundary:
      "Falsifi 只检查你提供的材料结构；它不会证明判断正确、预测收益，也不能发现互联网上所有转载关系。",
  },
  ja: {
    toolLabel: "株式仮説の出典グループ確認",
    cardTitle: "仮説エビデンスカード",
    steps: ["仮説を定義", "資料を追加", "出典のグループ化を確認"],
    status: {
      define: "まず、検証可能な仮説を書いてください。",
      primary: "企業または規制当局の一次資料を追加してください。",
      challenge: "現在の資料は一方向の主張だけです。",
      diversity: "支持資料と反証資料は、まだ1つの出典群にまとまっています。",
      date: "この仮説を再確認する日を決めてください。",
      ready: "エビデンス構造をレビューできます。",
    },
    body: {
      define:
        "仮説、弱める条件、次回確認日を記録します。価格データから仮説を自動生成しません。",
      primary:
        "ニュースは二次情報の場合があります。発行体または規制当局の原資料から始めてください。",
      challenge:
        "支持材料を増やす前に、仮説を弱める信頼できる事実を1つ追加してください。",
      diversity:
        "リンク数と出典数は同じではありません。異なる文書、データセット、インタビュー、または公開経路の資料を1件以上追加してください。",
      date: "事後的な仮説変更を防ぐため、次回確認日を先に決めます。",
      ready: (materials, groups, related) =>
        `この記録にはユーザー追加資料が${materials}件あり、${groups}件の出典群として識別されています。${related}件はURL、出典ID、または明示した同一出典関係により他の資料と同じ群です。`,
    },
    actions: {
      "define-case": "仮説を定義",
      "add-invalidation": "弱める条件を書く",
      "add-primary-source": "一次資料を追加",
      "add-counter-evidence": "反証材料を追加",
      "add-independent-source": "別の出典を追加",
      "set-review-date": "確認日を設定",
      "save-baseline": "今回の確認を保存",
    },
    saveReview: "今回の確認を保存",
    materials: "ユーザー追加資料",
    sourceGroups: "識別された出典群",
    relatedMaterials: "他資料と同じ群",
    verification: {
      original: "原資料を確認済み",
      reviewed: "二次資料を確認済み",
      unverified: "未確認",
    },
    claimTitle: "確認中の仮説",
    claimEmpty: "ユーザーが記録した仮説はまだありません。",
    invalidation: "仮説を弱める条件",
    horizon: "期間",
    reviewDate: "次回確認日",
    edit: "編集",
    evidenceTitle: "資料と出典の関係",
    evidenceHelp:
      "同一の正規化URLは必ず同じ群になります。異なるリンクが同じ文書、データセット、インタビュー、転載経路に由来する場合も同一出典として指定できます。",
    addEvidence: "資料を追加",
    noEvidence:
      "ユーザー追加資料はまだありません。自動市場データは背景であり、証拠には数えません。",
    group: (index) => `出典群 ${index}`,
    oneMaterial: "資料1件",
    manyMaterials: (count) => `資料${count}件`,
    groupedNote: "これらは1つの出典群として数えます。",
    supports: "支持",
    challenges: "反証",
    mixed: "混在",
    marketTitle: "市場背景",
    marketHelp: "遅延市場データは背景のみで、証拠要件を満たしません。",
    marketUnavailable:
      "市場背景は利用できませんが、証拠チェックはそのまま続けられます。",
    price: "直近価格",
    dailyMove: "日次変化",
    marketTime: "市場時刻",
    source: "出典",
    refresh: "更新",
    refreshing: "更新中…",
    boundary:
      "Falsifi は提供された資料の構造を確認します。仮説の正しさや将来収益を証明せず、全ての転載関係を発見するものではありません。",
  },
  es: {
    toolLabel: "Comprobación de grupos de fuentes",
    cardTitle: "Ficha de evidencia de la tesis",
    steps: ["Definir una tesis", "Añadir material", "Revisar la agrupación"],
    status: {
      define: "Primero, convierte la tesis en algo comprobable.",
      primary: "Añade una fuente empresarial o regulatoria original.",
      challenge: "Tu material solo defiende un lado.",
      diversity: "El material favorable y contrario aún forma un solo grupo de fuentes.",
      date: "Decide cuándo revisar de nuevo esta tesis.",
      ready: "La estructura de evidencia está lista para revisar.",
    },
    body: {
      define:
        "Escribe una tesis, qué la debilitaría y una fecha de revisión. Falsifi no inventa una tesis a partir del precio.",
      primary:
        "Una noticia puede resumir a otra fuente. Empieza por el documento del emisor o regulador.",
      challenge:
        "Antes de reunir más apoyo, añade un hecho fiable que debilite la tesis.",
      diversity:
        "Más enlaces no siempre significan más fuentes. Añade al menos un material de otro documento, conjunto de datos, entrevista o cadena de publicación.",
      date:
        "Una fecha previa evita cambiar silenciosamente la tesis después del resultado.",
      ready: (materials, groups, related) =>
        `Este registro contiene ${materials} material(es) añadido(s) por el usuario en ${groups} grupo(s) de fuentes identificados; ${related} se agrupan con otro elemento por URL, identidad de fuente o una relación explícita de misma fuente.`,
    },
    actions: {
      "define-case": "Definir mi tesis",
      "add-invalidation": "Definir qué la debilita",
      "add-primary-source": "Añadir fuente original",
      "add-counter-evidence": "Añadir un hecho contrario",
      "add-independent-source": "Añadir otra fuente",
      "set-review-date": "Fijar fecha de revisión",
      "save-baseline": "Guardar esta revisión",
    },
    saveReview: "Guardar esta revisión",
    materials: "Materiales añadidos",
    sourceGroups: "Grupos de fuentes identificados",
    relatedMaterials: "Agrupados con otro elemento",
    verification: {
      original: "Original comprobado",
      reviewed: "Fuente secundaria comprobada",
      unverified: "Aún sin comprobar",
    },
    claimTitle: "Tesis comprobada",
    claimEmpty: "Aún no hay una tesis escrita por el usuario.",
    invalidation: "Qué la debilitaría",
    horizon: "Horizonte",
    reviewDate: "Revisar el",
    edit: "Editar",
    evidenceTitle: "Materiales y relaciones de fuente",
    evidenceHelp:
      "Las URL canónicas iguales siempre se agrupan. También puedes indicar que enlaces distintos proceden del mismo documento, conjunto de datos, entrevista o cadena de republicación.",
    addEvidence: "Añadir material",
    noEvidence:
      "Aún no hay material añadido por el usuario. Los datos automáticos de mercado son contexto y no cuentan como evidencia.",
    group: (index) => `Grupo de fuentes ${index}`,
    oneMaterial: "1 material",
    manyMaterials: (count) => `${count} materiales`,
    groupedNote: "Estos elementos cuentan como un solo grupo.",
    supports: "Apoya",
    challenges: "Cuestiona",
    mixed: "Mixto",
    marketTitle: "Contexto de mercado",
    marketHelp:
      "Los datos retrasados son solo contexto y nunca satisfacen la comprobación de evidencia.",
    marketUnavailable:
      "El contexto de mercado no está disponible. La comprobación de evidencia sigue funcionando.",
    price: "Último precio",
    dailyMove: "Cambio diario",
    marketTime: "Hora del mercado",
    source: "Fuente",
    refresh: "Actualizar",
    refreshing: "Actualizando…",
    boundary:
      "Falsifi comprueba la estructura del material aportado. No demuestra que la tesis sea cierta, no predice rentabilidad ni descubre todas las cadenas de republicación.",
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

function outcomeFor(
  readiness: ResearchReadiness,
  copy: WorkspaceCopy,
) {
  const action = readiness.nextAction;
  if (action === "define-case" || action === "add-invalidation") {
    return { title: copy.status.define, body: copy.body.define };
  }
  if (action === "add-primary-source") {
    return { title: copy.status.primary, body: copy.body.primary };
  }
  if (action === "add-counter-evidence") {
    return { title: copy.status.challenge, body: copy.body.challenge };
  }
  if (action === "add-independent-source") {
    return { title: copy.status.diversity, body: copy.body.diversity };
  }
  if (action === "set-review-date") {
    return { title: copy.status.date, body: copy.body.date };
  }
  return { title: copy.status.ready, body: "" };
}

export function FalsifyWorkspace({
  thesisCase,
  readiness,
  locale,
  refreshing,
  onEditPlan,
  onNextAction,
  onAddEvidence,
  onEditEvidence,
  onRefresh,
  onSaveReview,
}: {
  thesisCase: ThesisCase;
  readiness: ResearchReadiness;
  locale: Locale;
  refreshing: boolean;
  onEditPlan: () => void;
  onNextAction: (action: ReadinessAction) => void;
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
  const outcome = outcomeFor(readiness, copy);
  const planChecks = readiness.checks.filter((check) =>
    ["case-definition", "invalidation-criteria", "review-date"].includes(
      check.id,
    ),
  );
  const planComplete = planChecks.every((check) => check.complete);
  const evidenceComplete = readiness.checks
    .filter((check) =>
      ["primary-source", "counter-evidence", "source-diversity"].includes(
        check.id,
      ),
    )
    .every((check) => check.complete);
  const reviewable = readiness.status === "reviewable";
  const nextAction = readiness.nextAction;
  const market = thesisCase.marketSnapshot;

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
        <span className="focus-card-name">{copy.cardTitle}</span>
      </header>

      <ol className="focus-steps" aria-label={copy.cardTitle}>
        {copy.steps.map((step, index) => {
          const complete =
            index === 0
              ? planComplete
              : index === 1
                ? evidenceComplete
                : reviewable;
          const active =
            !complete &&
            (index === 0 ||
              (index === 1 && planComplete) ||
              (index === 2 && evidenceComplete));
          return (
            <li
              className={`${complete ? "complete" : ""} ${active ? "active" : ""}`}
              key={step}
            >
              <span>{complete ? <Check size={14} /> : index + 1}</span>
              {step}
            </li>
          );
        })}
      </ol>

      <article
        className={`focus-outcome ${reviewable ? "ready" : "waiting"}`}
      >
        <div className="focus-outcome-copy">
          <span>
            {reviewable ? <Check size={15} /> : <ShieldAlert size={15} />}
            {reviewable
              ? `${audit.sourceGroupCount} ${copy.sourceGroups}`
              : `${readiness.completedCount}/${readiness.totalCount}`}
          </span>
          <h2>{outcome.title}</h2>
          <p>
            {reviewable
              ? copy.body.ready(
                  audit.materialCount,
                  audit.sourceGroupCount,
                  audit.relatedMaterialCount,
                )
              : outcome.body}
          </p>
        </div>

        {audit.materialCount > 0 && (
          <div className="focus-counts" aria-label={copy.evidenceTitle}>
            <div>
              <strong>{audit.materialCount}</strong>
              <span>{copy.materials}</span>
            </div>
            <ArrowRight size={18} />
            <div>
              <strong>{audit.sourceGroupCount}</strong>
              <span>{copy.sourceGroups}</span>
            </div>
            <div className="focus-related-count">
              <strong>{audit.relatedMaterialCount}</strong>
              <span>{copy.relatedMaterials}</span>
            </div>
          </div>
        )}

        <div className="focus-primary-action">
          {nextAction ? (
            <button
              className="button primary"
              onClick={() => onNextAction(nextAction)}
            >
              {copy.actions[nextAction]}
              <ArrowRight size={15} />
            </button>
          ) : (
            <button className="button primary" onClick={onSaveReview}>
              {copy.saveReview}
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </article>

      <section className="focus-claim">
        <div className="focus-section-heading">
          <div>
            <span>01</span>
            <h2>{copy.claimTitle}</h2>
          </div>
          <button onClick={onEditPlan}>
            <Pencil size={14} />
            {copy.edit}
          </button>
        </div>
        {thesisCase.researchPlan?.thesisConfirmed ? (
          <>
            <blockquote>{thesisCase.thesis}</blockquote>
            <dl>
              <div>
                <dt>{copy.invalidation}</dt>
                <dd>
                  {thesisCase.researchPlan.invalidationCriteria || "—"}
                </dd>
              </div>
              <div>
                <dt>{copy.horizon}</dt>
                <dd>{thesisCase.horizon}</dd>
              </div>
              <div>
                <dt>{copy.reviewDate}</dt>
                <dd>
                  {thesisCase.researchPlan.nextReviewDate
                    ? formatDate(
                        thesisCase.researchPlan.nextReviewDate,
                        locale,
                      )
                    : "—"}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="focus-empty">{copy.claimEmpty}</p>
        )}
      </section>

      <details className="focus-details">
        <summary>
          <span>
            <strong>{copy.evidenceTitle}</strong>
            <small>{copy.evidenceHelp}</small>
          </span>
          <span>{audit.materialCount}</span>
        </summary>
        <div className="focus-details-body">
          {audit.groups.length ? (
            <div className="source-group-list">
              {audit.groups.map((group, index) => {
                const direction =
                  group.directions.length > 1
                    ? copy.mixed
                    : group.directions[0] === "supports"
                      ? copy.supports
                      : copy.challenges;
                return (
                  <article key={group.id}>
                    <header>
                      <div>
                        <strong>{copy.group(index + 1)}</strong>
                        <span>{direction}</span>
                      </div>
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
          <button className="focus-add-link" onClick={onAddEvidence}>
            <Plus size={15} />
            {copy.addEvidence}
          </button>
        </div>
      </details>

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
