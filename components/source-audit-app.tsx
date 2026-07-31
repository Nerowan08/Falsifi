"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  ExternalLink,
  FileSearch,
  Github,
  Link2,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { MaterialFinderModal } from "@/components/material-finder";
import { StockPicker } from "@/components/market-workspace";
import {
  canonicalEvidenceSource,
  isHttpUrl,
  isThesisCase,
  type EvidenceDirection,
  type EvidenceGroup,
  type EvidenceItem,
  type MarketSnapshot,
  type ThesisCase,
} from "@/lib/falsifi";
import {
  LOCALE_OPTIONS,
  resolveLocale,
  type Locale,
} from "@/lib/i18n";
import {
  buildResearchCase,
  normalizeMarketCase,
  type StockSearchResult,
} from "@/lib/market";
import {
  isCandidateAlreadyAdded,
  materialCandidateToEvidence,
  type MaterialCandidate,
} from "@/lib/materials";
import {
  auditSources,
  type SourceSuggestion,
  type SourceSuggestionReason,
} from "@/lib/source-audit";
import type { ExtractedWebMaterial } from "@/lib/web-material";

const CASE_KEY = "falsifi.case.v2";
const LOCALE_KEY = "falsifi.locale.v1";
const REJECTION_KEY = "falsifi.source-rejections.v1";

type Copy = {
  tagline: string;
  guide: string;
  github: string;
  changeStock: string;
  toolTitle: string;
  toolBody: string;
  claimLabel: string;
  claimOptional: string;
  claimPlaceholder: string;
  save: string;
  edit: string;
  find: string;
  auditLinks: string;
  addLink: string;
  batchTitle: string;
  batchHelp: string;
  batchPlaceholder: string;
  batchRun: string;
  batchReading: string;
  batchPrivacy: string;
  batchAdded: (count: number) => string;
  batchFailed: (count: number) => string;
  extraction: Record<"extracted" | "partial" | "blocked", string>;
  resultLabel: string;
  emptyResult: string;
  result: (materials: number, groups: number) => string;
  materials: string;
  sourceGroups: string;
  confirmedDuplicates: string;
  pending: string;
  next: string;
  nextEmpty: string;
  nextReview: (count: number) => string;
  nextVerify: (count: number) => string;
  nextIndependent: string;
  nextChallenge: string;
  possibleSameSource: string;
  possibleHelp: string;
  confirmSame: string;
  keepSeparate: string;
  reasons: Record<SourceSuggestionReason, string>;
  confidence: Record<"high" | "medium", string>;
  materialTitle: string;
  noMaterials: string;
  reviewed: string;
  unverified: string;
  markReviewed: string;
  relation: string;
  directions: Record<EvidenceDirection, string>;
  original: string;
  remove: string;
  manualTitle: string;
  url: string;
  title: string;
  publisher: string;
  date: string;
  type: string;
  filing: string;
  news: string;
  cancel: string;
  invalidUrl: string;
  duplicateUrl: string;
  boundary: string;
  local: string;
  guideTitle: string;
  guideSteps: Array<{ title: string; body: string }>;
  guideAccuracy: string;
  guideAccuracyBody: string;
  close: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    tagline: "Trace the sources behind stock research",
    guide: "How it works",
    github: "GitHub",
    changeStock: "Change stock",
    toolTitle: "Check where these materials really come from.",
    toolBody: "Find the original source, group repeated coverage, and see what evidence is still missing.",
    claimLabel: "Claim",
    claimOptional: "optional",
    claimPlaceholder: "e.g. Gross-margin recovery can offset slower revenue growth over the next year.",
    save: "Save",
    edit: "Edit",
    find: "Find public materials",
    auditLinks: "Audit links",
    addLink: "Add a link",
    batchTitle: "Audit public links",
    batchHelp: "Paste one link per line. Up to 12 at a time.",
    batchPlaceholder: "https://company.com/filing\nhttps://news.example.com/story",
    batchRun: "Read and audit",
    batchReading: "Reading public pages…",
    batchPrivacy: "Reads public pages only. Your claim is not sent. No sign-in or paywall bypass.",
    batchAdded: (count) => `Added ${count} material${count === 1 ? "" : "s"}.`,
    batchFailed: (count) => `${count} link${count === 1 ? "" : "s"} could not be read.`,
    extraction: { extracted: "Text read", partial: "Basic details only", blocked: "Could not read" },
    resultLabel: "Source audit",
    emptyResult: "Add materials to start the audit.",
    result: (materials, groups) => `${materials} materials → ${groups} confirmed source groups`,
    materials: "Materials",
    sourceGroups: "Confirmed sources",
    confirmedDuplicates: "Grouped repeats",
    pending: "Needs review",
    next: "Next step",
    nextEmpty: "Add the first material.",
    nextReview: (count) => `Review ${count} possible source relationship${count === 1 ? "" : "s"}.`,
    nextVerify: (count) => `Open and check ${count} unverified material${count === 1 ? "" : "s"}.`,
    nextIndependent: "Add an independent source, not another retelling.",
    nextChallenge: "Add one credible source that could weaken your claim.",
    possibleSameSource: "Possibly the same source",
    possibleHelp: "The tool found overlap. You decide whether to group it.",
    confirmSame: "Group together",
    keepSeparate: "Keep separate",
    reasons: {
      "near-identical-title": "The titles and publication dates are highly similar.",
      "same-event": "Both materials appear to cover the same company event.",
      "filing-follow-up": "The later item appears to follow a company filing on the same event.",
      "shared-original-link": "Both pages point to the same original source.",
      "direct-citation": "One page links directly to the other as a source.",
      "content-overlap": "Large parts of the readable text overlap.",
    },
    confidence: { high: "High-confidence match", medium: "Possible match" },
    materialTitle: "Materials",
    noMaterials: "No materials yet. Let Falsifi search, or add a link yourself.",
    reviewed: "Checked",
    unverified: "Not checked",
    markReviewed: "Mark checked",
    relation: "Relation to claim",
    directions: { supports: "Supports", contradicts: "Challenges", unclassified: "Not set" },
    original: "Open original",
    remove: "Remove",
    manualTitle: "Add a material",
    url: "URL",
    title: "Title",
    publisher: "Publisher",
    date: "Date",
    type: "Type",
    filing: "Company filing",
    news: "News or analysis",
    cancel: "Cancel",
    invalidUrl: "Enter a valid http or https URL.",
    duplicateUrl: "This link is already in the audit.",
    boundary: "Falsifi does not predict prices or make investment decisions.",
    local: "Your audit is stored in this browser.",
    guideTitle: "How to use Falsifi",
    guideSteps: [
      { title: "Choose a stock", body: "Search by company name or ticker. Falsifi supports A-shares, Hong Kong stocks, and U.S. stocks." },
      { title: "Audit links", body: "Paste up to 12 public links. Falsifi reads the pages and looks for the original source, citations, and repeated text." },
      { title: "Review the result", body: "Exact canonical links are grouped automatically. All approximate matches require your confirmation." },
      { title: "Fill the gap", body: "Follow the single next step: check an original, resolve a match, or add an independent or challenging source." },
    ],
    guideAccuracy: "What the result means",
    guideAccuracyBody: "A source group is a confirmed shared origin, not a claim that the articles agree. Similar titles and dates are hints only. If the tool is unsure, it asks you to decide.",
    close: "Close",
  },
  "zh-CN": {
    tagline: "查清股票材料的真正来源",
    guide: "使用教程",
    github: "GitHub",
    changeStock: "更换股票",
    toolTitle: "查清这些材料到底来自哪里",
    toolBody: "找原始来源，合并重复转述，告诉你下一步该补什么。",
    claimLabel: "你的判断",
    claimOptional: "可选",
    claimPlaceholder: "例如：未来一年，毛利率改善可以抵消收入增速放缓。",
    save: "保存",
    edit: "修改",
    find: "让工具找材料",
    auditLinks: "批量审计链接",
    addLink: "自己加链接",
    batchTitle: "批量审计公开链接",
    batchHelp: "每行粘贴一个链接，一次最多 12 条。",
    batchPlaceholder: "https://公司公告链接\nhttps://新闻链接",
    batchRun: "读取并审计",
    batchReading: "正在读取公开网页…",
    batchPrivacy: "只读取公开网页，不发送你的判断；不登录，不绕过付费墙。",
    batchAdded: (count) => `已加入 ${count} 份材料。`,
    batchFailed: (count) => `${count} 个链接无法读取。`,
    extraction: { extracted: "已读取正文", partial: "只读到基本信息", blocked: "无法自动读取" },
    resultLabel: "来源审计结果",
    emptyResult: "加入材料后，这里会显示结果。",
    result: (materials, groups) => `${materials} 份材料 → ${groups} 个已确认来源`,
    materials: "材料",
    sourceGroups: "已确认来源",
    confirmedDuplicates: "重复转述",
    pending: "待确认关系",
    next: "下一步",
    nextEmpty: "先加入一份材料。",
    nextReview: (count) => `确认 ${count} 组可能同源的材料。`,
    nextVerify: (count) => `打开并核对 ${count} 份材料。`,
    nextIndependent: "补一个独立来源，不要再加同一消息的转述。",
    nextChallenge: "补一份可能推翻你判断的可靠材料。",
    possibleSameSource: "可能来自同一来源",
    possibleHelp: "工具发现了重合点，是否归组由你决定。",
    confirmSame: "归为同一来源",
    keepSeparate: "保持独立",
    reasons: {
      "near-identical-title": "标题和发布时间高度接近。",
      "same-event": "两份材料可能在讲同一件公司事件。",
      "filing-follow-up": "后一份材料可能在转述同一事件的公司公告。",
      "shared-original-link": "两个网页都指向同一份原始材料。",
      "direct-citation": "其中一个网页直接引用了另一个网页。",
      "content-overlap": "两个网页的大段正文相同。",
    },
    confidence: { high: "高度匹配", medium: "可能匹配" },
    materialTitle: "材料",
    noMaterials: "还没有材料。让工具搜索，或自己加链接。",
    reviewed: "已核对",
    unverified: "待核对",
    markReviewed: "标记为已核对",
    relation: "与判断的关系",
    directions: { supports: "支持", contradicts: "反驳", unclassified: "未设置" },
    original: "查看原文",
    remove: "删除",
    manualTitle: "添加材料",
    url: "链接",
    title: "标题",
    publisher: "发布方",
    date: "发布日期",
    type: "材料类型",
    filing: "公司公告",
    news: "新闻或分析",
    cancel: "取消",
    invalidUrl: "请输入有效的 http 或 https 链接。",
    duplicateUrl: "这条链接已经添加过。",
    boundary: "Falsifi 不预测股价，也不替你做投资决定。",
    local: "审计记录保存在当前浏览器。",
    guideTitle: "Falsifi 使用教程",
    guideSteps: [
      { title: "1. 选择股票", body: "输入公司名或股票代码。支持 A 股、港股和美股。" },
      { title: "2. 批量粘贴链接", body: "一次粘贴最多 12 个公开网页。工具会读取正文，查找原始材料、引用关系和重复内容。" },
      { title: "3. 确认不确定关系", body: "网页明确声明同一规范链接时会自动归组。正文相似或引用关系只会提示，由你决定。" },
      { title: "4. 补齐缺口", body: "只看结果里的一个“下一步”：核对原文、确认关系，或补独立来源和反面材料。" },
    ],
    guideAccuracy: "结果怎么理解",
    guideAccuracyBody: "“同一来源”只表示材料来自同一份原始信息，不表示观点相同。相似标题和日期只是线索，不是结论；工具拿不准时会让你确认。",
    close: "关闭",
  },
  ja: {
    tagline: "株式調査資料の出典を確認",
    guide: "使い方",
    github: "GitHub",
    changeStock: "銘柄を変更",
    toolTitle: "資料の本当の出典を確認します",
    toolBody: "原典を探し、重複記事をまとめ、次に必要な資料を示します。",
    claimLabel: "あなたの仮説",
    claimOptional: "任意",
    claimPlaceholder: "例：今後1年、粗利益率の改善が売上成長の鈍化を補う。",
    save: "保存",
    edit: "編集",
    find: "公開資料を探す",
    auditLinks: "リンクを一括監査",
    addLink: "リンクを追加",
    batchTitle: "公開リンクを一括監査",
    batchHelp: "1行に1件、最大12件まで貼り付けられます。",
    batchPlaceholder: "https://company.com/filing\nhttps://news.example.com/story",
    batchRun: "読み取って監査",
    batchReading: "公開ページを読み取り中…",
    batchPrivacy: "公開ページのみを読み取ります。判断内容は送信せず、ログインやペイウォール回避は行いません。",
    batchAdded: (count) => `${count}件の資料を追加しました。`,
    batchFailed: (count) => `${count}件のリンクを読み取れませんでした。`,
    extraction: { extracted: "本文を取得済み", partial: "基本情報のみ", blocked: "自動取得不可" },
    resultLabel: "出典監査",
    emptyResult: "資料を追加すると結果が表示されます。",
    result: (materials, groups) => `${materials}件の資料 → ${groups}件の確認済み出典`,
    materials: "資料",
    sourceGroups: "確認済み出典",
    confirmedDuplicates: "重複記事",
    pending: "要確認",
    next: "次の手順",
    nextEmpty: "まず資料を1件追加してください。",
    nextReview: (count) => `${count}組の出典関係を確認してください。`,
    nextVerify: (count) => `${count}件の未確認資料を開いて確認してください。`,
    nextIndependent: "同じ話の転載ではなく、独立した出典を追加してください。",
    nextChallenge: "仮説を弱める可能性のある信頼できる資料を追加してください。",
    possibleSameSource: "同じ出典の可能性",
    possibleHelp: "重複の手掛かりがあります。まとめるかはあなたが決めます。",
    confirmSame: "同じ出典にまとめる",
    keepSeparate: "別の出典として残す",
    reasons: { "near-identical-title": "見出しと公開日が非常に近いです。", "same-event": "同じ企業イベントを扱っている可能性があります。", "filing-follow-up": "後の記事が同じイベントの会社開示を参照している可能性があります。", "shared-original-link": "両方のページが同じ原典を示しています。", "direct-citation": "一方のページが他方を出典として直接リンクしています。", "content-overlap": "本文の大部分が重複しています。" },
    confidence: { high: "一致度が高い", medium: "一致の可能性" },
    materialTitle: "資料",
    noMaterials: "資料はまだありません。検索するかリンクを追加してください。",
    reviewed: "確認済み",
    unverified: "未確認",
    markReviewed: "確認済みにする",
    relation: "仮説との関係",
    directions: { supports: "支持", contradicts: "反証", unclassified: "未設定" },
    original: "原文を開く",
    remove: "削除",
    manualTitle: "資料を追加",
    url: "URL",
    title: "タイトル",
    publisher: "発行元",
    date: "公開日",
    type: "種類",
    filing: "会社開示",
    news: "ニュース・分析",
    cancel: "キャンセル",
    invalidUrl: "有効な http または https URLを入力してください。",
    duplicateUrl: "このリンクはすでに追加されています。",
    boundary: "Falsifiは株価を予測せず、投資判断を代行しません。",
    local: "監査記録はこのブラウザに保存されます。",
    guideTitle: "Falsifiの使い方",
    guideSteps: [
      { title: "1. 銘柄を選ぶ", body: "会社名またはティッカーで検索します。中国A株、香港株、米国株に対応します。" },
      { title: "2. リンクを一括追加", body: "公開ページを最大12件貼り付けます。原典、引用関係、本文の重複を自動で調べます。" },
      { title: "3. 結果を確認", body: "同じ正規URLだけ自動でまとめます。類似本文や引用関係は、確認後にのみまとめます。" },
      { title: "4. 不足を補う", body: "表示された次の一手に従い、原典確認、関係確認、独立した出典や反証資料の追加を行います。" },
    ],
    guideAccuracy: "結果の意味",
    guideAccuracyBody: "出典グループは共通の情報源を示すもので、記事の意見が同じという意味ではありません。類似性は手掛かりであり結論ではありません。",
    close: "閉じる",
  },
  es: {
    tagline: "Rastrea las fuentes del análisis bursátil",
    guide: "Cómo funciona",
    github: "GitHub",
    changeStock: "Cambiar acción",
    toolTitle: "Comprueba de dónde vienen realmente estos materiales.",
    toolBody: "Encuentra la fuente original, agrupa repeticiones y descubre qué evidencia falta.",
    claimLabel: "Tu tesis",
    claimOptional: "opcional",
    claimPlaceholder: "Ej.: La mejora del margen bruto compensará el menor crecimiento durante el próximo año.",
    save: "Guardar",
    edit: "Editar",
    find: "Buscar materiales públicos",
    auditLinks: "Auditar enlaces",
    addLink: "Añadir enlace",
    batchTitle: "Auditar enlaces públicos",
    batchHelp: "Pega un enlace por línea. Hasta 12 cada vez.",
    batchPlaceholder: "https://empresa.com/informe\nhttps://noticias.example.com/articulo",
    batchRun: "Leer y auditar",
    batchReading: "Leyendo páginas públicas…",
    batchPrivacy: "Solo lee páginas públicas. No envía tu tesis, inicia sesión ni elude muros de pago.",
    batchAdded: (count) => `Se añadieron ${count} material${count === 1 ? "" : "es"}.`,
    batchFailed: (count) => `No se pudieron leer ${count} enlace${count === 1 ? "" : "s"}.`,
    extraction: { extracted: "Texto leído", partial: "Solo datos básicos", blocked: "No se pudo leer" },
    resultLabel: "Auditoría de fuentes",
    emptyResult: "Añade materiales para iniciar la auditoría.",
    result: (materials, groups) => `${materials} materiales → ${groups} fuentes confirmadas`,
    materials: "Materiales",
    sourceGroups: "Fuentes confirmadas",
    confirmedDuplicates: "Repeticiones agrupadas",
    pending: "Por revisar",
    next: "Siguiente paso",
    nextEmpty: "Añade el primer material.",
    nextReview: (count) => `Revisa ${count} posible${count === 1 ? "" : "s"} relación${count === 1 ? "" : "es"} de fuente.`,
    nextVerify: (count) => `Abre y comprueba ${count} material${count === 1 ? "" : "es"}.`,
    nextIndependent: "Añade una fuente independiente, no otra repetición.",
    nextChallenge: "Añade una fuente fiable que pueda debilitar tu tesis.",
    possibleSameSource: "Posible fuente común",
    possibleHelp: "La herramienta encontró coincidencias. Tú decides si agruparlas.",
    confirmSame: "Agrupar",
    keepSeparate: "Mantener separadas",
    reasons: { "near-identical-title": "Los títulos y las fechas son muy similares.", "same-event": "Ambos materiales parecen tratar el mismo evento.", "filing-follow-up": "El material posterior parece seguir una comunicación oficial sobre el mismo evento.", "shared-original-link": "Ambas páginas apuntan a la misma fuente original.", "direct-citation": "Una página enlaza directamente a la otra como fuente.", "content-overlap": "Gran parte del texto legible coincide." },
    confidence: { high: "Coincidencia alta", medium: "Coincidencia posible" },
    materialTitle: "Materiales",
    noMaterials: "Aún no hay materiales. Busca fuentes o añade un enlace.",
    reviewed: "Comprobado",
    unverified: "Sin comprobar",
    markReviewed: "Marcar como comprobado",
    relation: "Relación con la tesis",
    directions: { supports: "Apoya", contradicts: "Cuestiona", unclassified: "Sin definir" },
    original: "Abrir original",
    remove: "Eliminar",
    manualTitle: "Añadir material",
    url: "URL",
    title: "Título",
    publisher: "Editor",
    date: "Fecha",
    type: "Tipo",
    filing: "Comunicación de empresa",
    news: "Noticia o análisis",
    cancel: "Cancelar",
    invalidUrl: "Introduce una URL http o https válida.",
    duplicateUrl: "Este enlace ya está en la auditoría.",
    boundary: "Falsifi no predice precios ni toma decisiones de inversión.",
    local: "La auditoría se guarda en este navegador.",
    guideTitle: "Cómo usar Falsifi",
    guideSteps: [
      { title: "1. Elige una acción", body: "Busca por empresa o ticker. Compatible con acciones A, Hong Kong y EE. UU." },
      { title: "2. Audita enlaces", body: "Pega hasta 12 páginas públicas. Falsifi busca la fuente original, citas y texto repetido." },
      { title: "3. Revisa el resultado", body: "Solo las URL canónicas idénticas se agrupan automáticamente. Las coincidencias aproximadas requieren tu confirmación." },
      { title: "4. Completa lo que falta", body: "Sigue un único siguiente paso: comprobar el original, resolver una coincidencia o añadir una fuente independiente o contraria." },
    ],
    guideAccuracy: "Qué significa el resultado",
    guideAccuracyBody: "Un grupo confirma un origen común, no que los artículos estén de acuerdo. La similitud es una pista, no una conclusión.",
    close: "Cerrar",
  },
};

const formatDate = (value: string, locale: Locale) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(date);
};

function AppHeader({
  locale,
  onLocale,
  onGuide,
}: {
  locale: Locale;
  onLocale: (locale: Locale) => void;
  onGuide: () => void;
}) {
  const copy = COPY[locale];
  return (
    <header className="audit-header">
      <div className="audit-header-inner">
        <div className="audit-brand">
          <span aria-hidden="true"><i /><i /><i /></span>
          <div><strong>Falsifi</strong><small>{copy.tagline}</small></div>
        </div>
        <nav>
          <button onClick={onGuide}>{copy.guide}</button>
          <a href="https://github.com/Nerowan08/Falsifi" target="_blank" rel="noreferrer">
            <Github size={15} />{copy.github}
          </a>
          <select value={locale} onChange={(event) => onLocale(event.target.value as Locale)} aria-label="Language">
            {LOCALE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </nav>
      </div>
    </header>
  );
}

function Guide({ copy, onClose }: { copy: Copy; onClose: () => void }) {
  return (
    <div className="audit-overlay" role="presentation" onMouseDown={onClose}>
      <section className="audit-guide" role="dialog" aria-modal="true" aria-labelledby="guide-title" onMouseDown={(event) => event.stopPropagation()}>
        <header><h2 id="guide-title">{copy.guideTitle}</h2><button onClick={onClose} aria-label={copy.close}><X size={19} /></button></header>
        <div className="guide-steps">{copy.guideSteps.map((step) => <article key={step.title}><h3>{step.title}</h3><p>{step.body}</p></article>)}</div>
        <aside><strong>{copy.guideAccuracy}</strong><p>{copy.guideAccuracyBody}</p></aside>
        <button className="audit-primary" onClick={onClose}>{copy.close}</button>
      </section>
    </div>
  );
}

function ManualMaterialForm({
  copy,
  onCancel,
  onAdd,
  existing,
}: {
  copy: Copy;
  onCancel: () => void;
  onAdd: (item: EvidenceItem) => void;
  existing: EvidenceItem[];
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [group, setGroup] = useState<EvidenceGroup>("External estimate");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const cleanUrl = url.trim();
    if (!isHttpUrl(cleanUrl)) return setError(copy.invalidUrl);
    const canonical = canonicalEvidenceSource(cleanUrl);
    if (existing.some((item) => canonicalEvidenceSource(item.sourceUrl) === canonical)) return setError(copy.duplicateUrl);
    let fallbackPublisher = "Source";
    try { fallbackPublisher = new URL(cleanUrl).hostname.replace(/^www\./u, ""); } catch { /* validated above */ }
    onAdd({
      id: `manual-${Date.now().toString(36)}`,
      title: title.trim(),
      source: publisher.trim() || fallbackPublisher,
      sourceUrl: cleanUrl,
      asOf: date,
      group,
      direction: "unclassified",
      impact: 3,
      reliability: 0.4,
      note: "",
      enabled: true,
      originId: `source:${canonical}`.slice(0, 120),
      relation: "direct",
      verification: "unverified",
      provenance: "user",
    });
  };
  return (
    <form className="manual-material" onSubmit={submit}>
      <div className="section-heading"><h3>{copy.manualTitle}</h3><button type="button" onClick={onCancel}><X size={17} /></button></div>
      <label className="wide"><span>{copy.url}</span><input value={url} onChange={(event) => { setUrl(event.target.value); setError(""); }} placeholder="https://" autoFocus required /></label>
      <label className="wide"><span>{copy.title}</span><input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
      <label><span>{copy.publisher}</span><input value={publisher} onChange={(event) => setPublisher(event.target.value)} /></label>
      <label><span>{copy.date}</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
      <label><span>{copy.type}</span><select value={group} onChange={(event) => setGroup(event.target.value as EvidenceGroup)}><option value="Official filing">{copy.filing}</option><option value="External estimate">{copy.news}</option></select></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="manual-actions"><button type="button" onClick={onCancel}>{copy.cancel}</button><button className="audit-primary" type="submit" disabled={!url.trim() || !title.trim()}><Plus size={15} />{copy.addLink}</button></div>
    </form>
  );
}

type ExtractionResponse = {
  results?: Array<
    | { ok: true; material: ExtractedWebMaterial }
    | { ok: false; url: string; error: string }
  >;
};

function BatchMaterialForm({
  copy,
  existing,
  onCancel,
  onAdd,
}: {
  copy: Copy;
  existing: EvidenceItem[];
  onCancel: () => void;
  onAdd: (items: EvidenceItem[]) => void;
}) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const urls = Array.from(new Set(value.split(/\r?\n/u).map((item) => item.trim()).filter(Boolean))).slice(0, 12);

  const run = async () => {
    if (!urls.length || loading) return;
    setLoading(true);
    setMessage("");
    setFailedUrls([]);
    try {
      const response = await fetch("/api/materials/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      if (!response.ok) throw new Error("request-failed");
      const payload = await response.json() as ExtractionResponse;
      const known = new Set(existing.map((item) => canonicalEvidenceSource(item.sourceUrl)));
      const added: EvidenceItem[] = [];
      const failed: string[] = [];
      for (const result of payload.results ?? []) {
        if (!result.ok) {
          failed.push(result.url);
          continue;
        }
        const sourceUrl = result.material.extraction.finalUrl || result.material.requestedUrl;
        if (known.has(canonicalEvidenceSource(sourceUrl))) continue;
        known.add(canonicalEvidenceSource(sourceUrl));
        const extraction = result.material.extraction;
        const canonical = extraction.canonicalUrl || sourceUrl;
        const official = /(?:sec\.gov|cninfo\.com\.cn|hkexnews\.hk|sse\.com\.cn|szse\.cn)/iu.test(canonical);
        added.push({
          id: `web-${Date.now().toString(36)}-${added.length}`,
          title: result.material.title,
          source: extraction.publisher || new URL(sourceUrl).hostname.replace(/^www\./u, ""),
          sourceUrl,
          asOf: extraction.publishedAt || new Date().toISOString().slice(0, 10),
          group: official ? "Official filing" : "External estimate",
          direction: "unclassified",
          impact: 3,
          reliability: official ? 0.85 : 0.45,
          note: "",
          enabled: true,
          originId: `source:${canonicalEvidenceSource(canonical)}`.slice(0, 120),
          relation: "direct",
          verification: "unverified",
          provenance: "user",
          extraction,
        });
      }
      if (added.length) onAdd(added);
      setFailedUrls(failed);
      setMessage([added.length ? copy.batchAdded(added.length) : "", failed.length ? copy.batchFailed(failed.length) : ""].filter(Boolean).join(" "));
      if (added.length && !failed.length) setValue("");
    } catch {
      setMessage(copy.batchFailed(urls.length));
      setFailedUrls(urls);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="batch-material">
      <div className="section-heading"><div><h2>{copy.batchTitle}</h2><p>{copy.batchHelp}</p></div><button onClick={onCancel} aria-label={copy.close}><X size={17} /></button></div>
      <textarea value={value} onChange={(event) => { setValue(event.target.value); setMessage(""); }} placeholder={copy.batchPlaceholder} rows={5} autoFocus />
      <div className="batch-actions"><small><ShieldCheck size={13} />{copy.batchPrivacy}</small><button className="audit-primary" onClick={() => void run()} disabled={!urls.length || loading}><FileSearch size={15} />{loading ? copy.batchReading : `${copy.batchRun}${urls.length ? ` (${urls.length})` : ""}`}</button></div>
      {message && <p className="batch-message" role="status">{message}</p>}
      {failedUrls.length > 0 && <ul className="batch-errors">{failedUrls.map((url) => <li key={url}>{url}</li>)}</ul>}
    </section>
  );
}

function suggestionReason(copy: Copy, suggestion: SourceSuggestion) {
  return copy.reasons[suggestion.reason];
}

function Workspace({
  locale,
  thesisCase,
  rejected,
  onCase,
  onReject,
  onFind,
  onChangeStock,
}: {
  locale: Locale;
  thesisCase: ThesisCase;
  rejected: Set<string>;
  onCase: (next: ThesisCase) => void;
  onReject: (id: string) => void;
  onFind: () => void;
  onChangeStock: () => void;
}) {
  const copy = COPY[locale];
  const audit = useMemo(() => auditSources(thesisCase), [thesisCase]);
  const suggestions = audit.suggestions.filter((item) => !rejected.has(item.id));
  const byId = new Map(audit.materials.map((item) => [item.id, item]));
  const [editingClaim, setEditingClaim] = useState(!thesisCase.researchPlan?.thesisConfirmed);
  const [claim, setClaim] = useState(thesisCase.researchPlan?.thesisConfirmed ? thesisCase.thesis : "");
  const [showManual, setShowManual] = useState(false);
  const [showBatch, setShowBatch] = useState(!audit.materials.length);

  const updateEvidence = (id: string, patch: Partial<EvidenceItem>) => {
    onCase({ ...thesisCase, evidence: thesisCase.evidence.map((item) => item.id === id ? { ...item, ...patch } : item), lastUpdated: new Date().toISOString() });
  };
  const confirmSuggestion = (suggestion: SourceSuggestion) => {
    const related = byId.get(suggestion.relatedId);
    if (!related) return;
    updateEvidence(related.id, { sameSourceAsIds: Array.from(new Set([...(related.sameSourceAsIds ?? []), suggestion.primaryId])) });
  };
  const saveClaim = () => {
    const clean = claim.trim();
    onCase({
      ...thesisCase,
      thesis: clean,
      researchPlan: {
        purpose: thesisCase.researchPlan?.purpose ?? "new-research",
        thesisConfirmed: Boolean(clean),
        invalidationCriteria: thesisCase.researchPlan?.invalidationCriteria ?? "",
        nextReviewDate: thesisCase.researchPlan?.nextReviewDate ?? "",
      },
      lastUpdated: new Date().toISOString(),
    });
    setEditingClaim(false);
  };
  const addMaterial = (item: EvidenceItem) => {
    onCase({ ...thesisCase, evidence: [...thesisCase.evidence, item], lastUpdated: new Date().toISOString() });
    setShowManual(false);
  };
  const addMaterials = (items: EvidenceItem[]) => {
    if (!items.length) return;
    onCase({ ...thesisCase, evidence: [...thesisCase.evidence, ...items].slice(0, 40), lastUpdated: new Date().toISOString() });
  };
  const hasChallenge = audit.materials.some((item) => item.direction === "contradicts");
  const nextStep = !audit.materials.length
    ? copy.nextEmpty
    : suggestions.length
      ? copy.nextReview(suggestions.length)
      : audit.unverifiedCount
        ? copy.nextVerify(audit.unverifiedCount)
        : audit.confirmedGroupCount < 2
          ? copy.nextIndependent
          : thesisCase.researchPlan?.thesisConfirmed && !hasChallenge
            ? copy.nextChallenge
            : copy.nextIndependent;

  return (
    <main className="audit-main" id="main-content">
      <div className="workspace-topline"><button onClick={onChangeStock}>{copy.changeStock}</button><ChevronRight size={13} /><span>{thesisCase.company}</span><code>{thesisCase.ticker}</code></div>
      <section className="audit-hero">
        <div><h1>{copy.toolTitle}</h1><p>{copy.toolBody}</p></div>
        <div className="hero-actions"><button className="audit-primary" onClick={() => setShowBatch((value) => !value)}><Link2 size={16} />{copy.auditLinks}</button><button onClick={onFind}><FileSearch size={16} />{copy.find}</button></div>
      </section>

      <section className="claim-strip">
        <div className="claim-label"><strong>{copy.claimLabel}</strong><span>{copy.claimOptional}</span></div>
        {editingClaim ? (
          <div className="claim-editor"><textarea value={claim} onChange={(event) => setClaim(event.target.value)} placeholder={copy.claimPlaceholder} maxLength={500} /><button onClick={saveClaim}>{copy.save}</button></div>
        ) : (
          <button className="claim-value" onClick={() => setEditingClaim(true)}><span>{thesisCase.thesis || copy.claimPlaceholder}</span><em>{copy.edit}</em></button>
        )}
      </section>

      {showBatch && <BatchMaterialForm copy={copy} existing={audit.materials} onCancel={() => setShowBatch(false)} onAdd={addMaterials} />}
      {showManual && <ManualMaterialForm copy={copy} existing={audit.materials} onCancel={() => setShowManual(false)} onAdd={addMaterial} />}

      <section className="audit-result">
        <div className="result-main"><span>{copy.resultLabel}</span><h2>{audit.materials.length ? copy.result(audit.materials.length, audit.confirmedGroupCount) : copy.emptyResult}</h2></div>
        <dl>
          <div><dt>{copy.materials}</dt><dd>{audit.materials.length}</dd></div>
          <div><dt>{copy.sourceGroups}</dt><dd>{audit.confirmedGroupCount}</dd></div>
          <div><dt>{copy.confirmedDuplicates}</dt><dd>{audit.duplicateMaterialCount}</dd></div>
          <div className={suggestions.length ? "attention" : ""}><dt>{copy.pending}</dt><dd>{suggestions.length}</dd></div>
        </dl>
        <aside><span>{copy.next}</span><strong>{nextStep}</strong><ArrowRight size={18} /></aside>
      </section>

      {suggestions.length > 0 && (
        <section className="suggestion-section">
          <div className="section-heading"><div><h2>{copy.possibleSameSource}</h2><p>{copy.possibleHelp}</p></div><span>{suggestions.length}</span></div>
          <div className="suggestion-list">{suggestions.map((suggestion) => {
            const primary = byId.get(suggestion.primaryId);
            const related = byId.get(suggestion.relatedId);
            if (!primary || !related) return null;
            return <article key={suggestion.id}>
              <div className="match-label"><Link2 size={15} /><strong>{copy.confidence[suggestion.confidence]}</strong><span>{suggestionReason(copy, suggestion)}</span></div>
              <div className="match-pair"><div><small>{primary.source}</small><strong>{primary.title}</strong></div><div><small>{related.source}</small><strong>{related.title}</strong></div></div>
              <div className="match-actions"><button onClick={() => onReject(suggestion.id)}>{copy.keepSeparate}</button><button className="audit-primary" onClick={() => confirmSuggestion(suggestion)}><Check size={14} />{copy.confirmSame}</button></div>
            </article>;
          })}</div>
        </section>
      )}

      <section className="materials-section">
        <div className="section-heading"><div><h2>{copy.materialTitle}</h2><p>{audit.materials.length ? `${audit.unverifiedCount} ${copy.unverified}` : copy.noMaterials}</p></div><div><button onClick={onFind}><FileSearch size={15} />{copy.find}</button><button onClick={() => setShowManual(true)}><Plus size={15} />{copy.addLink}</button></div></div>
        {audit.materials.length > 0 && <div className="material-list">{audit.materials.map((item) => {
          const checked = (item.verification ?? "unverified") !== "unverified";
          return <article key={item.id}>
            <div className="material-status"><span className={checked ? "checked" : ""}>{checked ? <Check size={13} /> : null}{checked ? copy.reviewed : copy.unverified}</span><small>{item.extraction ? copy.extraction[item.extraction.status] : item.group === "Official filing" ? copy.filing : copy.news}</small></div>
            <div className="material-copy"><h3>{item.title}</h3><p>{item.source} · {formatDate(item.asOf, locale)}</p></div>
            <div className="material-controls">
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">{copy.original}<ExternalLink size={13} /></a>
              {!checked && <button onClick={() => updateEvidence(item.id, { verification: "reviewed" })}>{copy.markReviewed}</button>}
              {thesisCase.researchPlan?.thesisConfirmed && <label><span>{copy.relation}</span><select value={item.direction} onChange={(event) => updateEvidence(item.id, { direction: event.target.value as EvidenceDirection })}><option value="unclassified">{copy.directions.unclassified}</option><option value="supports">{copy.directions.supports}</option><option value="contradicts">{copy.directions.contradicts}</option></select></label>}
              <button className="danger" aria-label={copy.remove} onClick={() => onCase({ ...thesisCase, evidence: thesisCase.evidence.filter((candidate) => candidate.id !== item.id).map((candidate) => ({ ...candidate, sameSourceAsIds: candidate.sameSourceAsIds?.filter((id) => id !== item.id) })), lastUpdated: new Date().toISOString() })}><Trash2 size={14} /></button>
            </div>
          </article>;
        })}</div>}
      </section>

      <footer className="audit-boundary"><span><ShieldCheck size={14} />{copy.boundary}</span><span>{copy.local}</span></footer>
    </main>
  );
}

export function SourceAuditApp() {
  const [locale, setLocale] = useState<Locale>("en");
  const [thesisCase, setThesisCase] = useState<ThesisCase | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showFinder, setShowFinder] = useState(false);
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = window.setTimeout(() => {
      try {
        const nextLocale = resolveLocale(localStorage.getItem(LOCALE_KEY) || navigator.languages || navigator.language);
        setLocale(nextLocale);
        const storedCase = localStorage.getItem(CASE_KEY);
        if (storedCase) {
          const parsed: unknown = JSON.parse(storedCase);
          if (isThesisCase(parsed) && !parsed.isDemo) setThesisCase(normalizeMarketCase(parsed));
        }
        const storedRejected = localStorage.getItem(REJECTION_KEY);
        if (storedRejected) {
          const parsed: unknown = JSON.parse(storedRejected);
          if (Array.isArray(parsed)) setRejected(new Set(parsed.filter((id): id is string => typeof id === "string")));
        }
      } catch { /* Start with an empty in-memory audit. */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(load);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    if (!hydrated) return;
    try { localStorage.setItem(LOCALE_KEY, locale); } catch { /* Keep working in memory. */ }
  }, [hydrated, locale]);
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (thesisCase) localStorage.setItem(CASE_KEY, JSON.stringify(thesisCase));
      else localStorage.removeItem(CASE_KEY);
      localStorage.setItem(REJECTION_KEY, JSON.stringify(Array.from(rejected)));
    } catch { /* Keep working in memory. */ }
  }, [hydrated, rejected, thesisCase]);

  const selectStock = (stock: StockSearchResult, snapshot?: MarketSnapshot) => {
    setThesisCase(buildResearchCase(stock, locale, snapshot));
    setRejected(new Set());
  };
  const addFoundMaterials = (candidates: MaterialCandidate[]) => {
    setThesisCase((current) => {
      if (!current) return current;
      const accepted: EvidenceItem[] = [];
      for (const candidate of candidates) {
        if (current.evidence.length + accepted.length >= 40 || isCandidateAlreadyAdded(candidate, [...current.evidence, ...accepted])) continue;
        accepted.push(materialCandidateToEvidence(candidate, `found-${Date.now().toString(36)}-${accepted.length}`));
      }
      return accepted.length ? { ...current, evidence: [...current.evidence, ...accepted], lastUpdated: new Date().toISOString() } : current;
    });
    setShowFinder(false);
  };

  return <div className="audit-app">
    <AppHeader locale={locale} onLocale={setLocale} onGuide={() => setShowGuide(true)} />
    {!hydrated ? <main className="audit-loading" /> : thesisCase ? (
      <Workspace locale={locale} thesisCase={thesisCase} rejected={rejected} onCase={setThesisCase} onReject={(id) => setRejected((current) => new Set([...current, id]))} onFind={() => setShowFinder(true)} onChangeStock={() => setThesisCase(null)} />
    ) : (
      <main className="audit-picker-page"><StockPicker locale={locale} onSelect={selectStock} onImport={() => importRef.current?.click()} /></main>
    )}
    {showGuide && <Guide copy={COPY[locale]} onClose={() => setShowGuide(false)} />}
    {showFinder && thesisCase && <MaterialFinderModal thesisCase={thesisCase} locale={locale} existingEvidence={thesisCase.evidence} remainingSlots={Math.max(0, 40 - thesisCase.evidence.length)} onClose={() => setShowFinder(false)} onAdd={addFoundMaterials} />}
    <input ref={importRef} type="file" hidden accept="application/json" onChange={(event) => {
      const file = event.target.files?.[0];
      if (!file || file.size > 2 * 1024 * 1024) return;
      void file.text().then((text) => { try { const parsed: unknown = JSON.parse(text); if (isThesisCase(parsed) && !parsed.isDemo) setThesisCase(normalizeMarketCase(parsed)); } catch { /* Ignore invalid imports. */ } });
      event.currentTarget.value = "";
    }} />
  </div>;
}
