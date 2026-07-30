"use client";

import {
  ArrowRight,
  CalendarClock,
  Check,
  Circle,
  FileCheck2,
  RefreshCcw,
  ShieldAlert,
  X,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ResearchPlan,
  ResearchPurpose,
  ThesisCase,
} from "@/lib/falsifi";
import type { Locale } from "@/lib/i18n";
import type {
  ReadinessAction,
  ReadinessCheckId,
  ResearchReadiness,
  ResearchReadinessStatus,
} from "@/lib/readiness";

type ResearchCopy = {
  eyebrow: string;
  statuses: Record<ResearchReadinessStatus, string>;
  statusHelp: Record<
    ResearchReadinessStatus,
    (groups: number, manual: number) => string
  >;
  progress: (done: number, total: number) => string;
  checksTitle: string;
  checks: Record<ReadinessCheckId, string>;
  nextTitle: string;
  nextActions: Record<ReadinessAction, string>;
  editPlan: string;
  refresh: string;
  refreshing: string;
  saveBaseline: string;
  changesTitle: string;
  noBaseline: string;
  noChange: string;
  changes: {
    price: (value: string) => string;
    momentum: (value: string) => string;
    volatility: (value: string) => string;
    drawdown: (value: string) => string;
  };
  marketOnly: string;
  advancedTitle: string;
  advancedHelp: string;
  modal: {
    eyebrow: string;
    title: string;
    subtitle: string;
    purpose: string;
    purposes: Record<ResearchPurpose, string>;
    thesis: string;
    thesisPlaceholder: string;
    horizon: string;
    horizonPlaceholder: string;
    invalidation: string;
    invalidationPlaceholder: string;
    reviewDate: string;
    validation: string;
    cancel: string;
    save: string;
    close: string;
  };
};

const COPY: Record<Locale, ResearchCopy> = {
  en: {
    eyebrow: "Research action",
    statuses: {
      "market-context": "Market context only",
      incomplete: "Research incomplete",
      reviewable: "Ready for structured review",
    },
    statusHelp: {
      "market-context": (groups) =>
        `The automatic indicators come from ${groups} market-data group. They are context, not an investment case.`,
      incomplete: (groups, manual) =>
        `${manual} manually reviewed evidence item(s) across ${groups} related group(s). Complete the missing checks before relying on the model.`,
      reviewable: (groups, manual) =>
        `${manual} manually reviewed evidence item(s) across ${groups} related group(s). The case is ready to be challenged and revisited.`,
    },
    progress: (done, total) => `${done} of ${total} research checks complete`,
    checksTitle: "Research checks",
    checks: {
      "case-definition": "A specific, user-confirmed research claim",
      "invalidation-criteria": "A written condition that would weaken the claim",
      "primary-source": "At least one company or regulatory filing",
      "counter-evidence": "At least one independently reviewed challenge",
      "source-diversity": "At least three genuinely different evidence groups",
      "review-date": "A scheduled review date",
    },
    nextTitle: "Next best research action",
    nextActions: {
      "define-case": "Write the actual claim you want to test",
      "add-invalidation": "State what evidence would make you reconsider",
      "add-primary-source": "Add the latest company or regulatory filing",
      "add-counter-evidence": "Add one credible fact that weakens the claim",
      "add-independent-source": "Find another genuinely independent source",
      "set-review-date": "Choose when this case must be reviewed again",
      "save-baseline": "Save this case as the comparison baseline",
    },
    editPlan: "Define research case",
    refresh: "Refresh market data",
    refreshing: "Refreshing…",
    saveBaseline: "Save baseline",
    changesTitle: "Since the saved baseline",
    noBaseline:
      "No baseline exists yet. Save one after defining the case to make future reviews useful.",
    noChange: "No material tracked metric changed from the saved baseline.",
    changes: {
      price: (value) => `Price ${value}`,
      momentum: (value) => `3-month momentum ${value} pp`,
      volatility: (value) => `30-day volatility ${value} pp`,
      drawdown: (value) => `Maximum drawdown ${value} pp`,
    },
    marketOnly:
      "The rule score and sensitivity tests below describe the current model only. They are not a recommendation or a complete stock analysis.",
    advancedTitle: "Advanced model stress test",
    advancedHelp:
      "Inspect rule sensitivity, related evidence groups, and scenario boundaries.",
    modal: {
      eyebrow: "Case definition",
      title: "Define what you are testing",
      subtitle:
        "A useful stress test starts with a specific claim, a condition that could prove it wrong, and a date to review it.",
      purpose: "Research task",
      purposes: {
        "new-research": "New research",
        "holding-review": "Review an existing holding",
        watchlist: "Track a watchlist idea",
      },
      thesis: "Research claim",
      thesisPlaceholder:
        "Example: Over the next 12 months, operating-margin recovery can outpace slower revenue growth.",
      horizon: "Time horizon",
      horizonPlaceholder: "Example: 12 months",
      invalidation: "What would materially weaken this claim?",
      invalidationPlaceholder:
        "Use an observable condition, not a vague feeling. Example: two quarters of organic growth below 8%.",
      reviewDate: "Review again on",
      validation:
        "Complete the claim, time horizon, invalidation condition, and review date.",
      cancel: "Cancel",
      save: "Save research case",
      close: "Close case definition",
    },
  },
  "zh-CN": {
    eyebrow: "研究行动",
    statuses: {
      "market-context": "仅有行情背景",
      incomplete: "研究尚未完成",
      reviewable: "已具备结构化复核条件",
    },
    statusHelp: {
      "market-context": (groups) =>
        `自动指标只来自 ${groups} 个行情数据组，只能作为背景，不能构成完整投资论点。`,
      incomplete: (groups, manual) =>
        `目前有 ${manual} 条人工核查证据，分属 ${groups} 个关联组。补齐缺口后再依赖模型结论。`,
      reviewable: (groups, manual) =>
        `目前有 ${manual} 条人工核查证据，分属 ${groups} 个关联组，可以开始系统反证并定期复核。`,
    },
    progress: (done, total) => `已完成 ${done}/${total} 项研究检查`,
    checksTitle: "研究检查",
    checks: {
      "case-definition": "已确认一条具体、可检验的研究判断",
      "invalidation-criteria": "已写明什么情况会削弱该判断",
      "primary-source": "至少一份公司或监管机构原始披露",
      "counter-evidence": "至少一条经过核查的反向证据",
      "source-diversity": "至少三个真正不同的证据组",
      "review-date": "已设置下一次复核日期",
    },
    nextTitle: "下一项最值得完成的研究",
    nextActions: {
      "define-case": "写下你真正想检验的判断",
      "add-invalidation": "明确什么证据会让你重新考虑",
      "add-primary-source": "补充最新公司公告或监管披露",
      "add-counter-evidence": "加入一条可信、会削弱判断的事实",
      "add-independent-source": "寻找另一个真正独立的信息来源",
      "set-review-date": "确定必须重新检查本案例的日期",
      "save-baseline": "保存当前案例，作为以后比较的基准",
    },
    editPlan: "定义研究案例",
    refresh: "刷新行情",
    refreshing: "正在刷新…",
    saveBaseline: "保存比较基准",
    changesTitle: "相对已保存基准的变化",
    noBaseline:
      "尚未保存比较基准。定义案例后保存一次，下一次复核才知道具体发生了什么变化。",
    noChange: "与已保存基准相比，当前跟踪指标没有明显变化。",
    changes: {
      price: (value) => `股价 ${value}`,
      momentum: (value) => `三个月动量 ${value} 个百分点`,
      volatility: (value) => `30 日波动率 ${value} 个百分点`,
      drawdown: (value) => `最大回撤 ${value} 个百分点`,
    },
    marketOnly:
      "下方规则评分和敏感性测试只描述当前模型，不是股票推荐，也不是完整股票分析。",
    advancedTitle: "高级模型压力测试",
    advancedHelp: "查看规则敏感性、关联证据组和情景边界。",
    modal: {
      eyebrow: "案例定义",
      title: "先定义你真正要检验的判断",
      subtitle:
        "有效的压力测试需要一条具体判断、一个可能推翻它的条件，以及明确的复核日期。",
      purpose: "研究任务",
      purposes: {
        "new-research": "研究一只新股票",
        "holding-review": "复核现有持仓",
        watchlist: "跟踪观察名单",
      },
      thesis: "研究判断",
      thesisPlaceholder:
        "例如：未来 12 个月，经营利润率改善能够抵消收入增速放缓。",
      horizon: "研究期限",
      horizonPlaceholder: "例如：12 个月",
      invalidation: "什么情况会实质性削弱这项判断？",
      invalidationPlaceholder:
        "请使用可观察条件，而不是模糊感受。例如：有机收入连续两个季度低于 8%。",
      reviewDate: "下次复核日期",
      validation: "请完整填写研究判断、期限、失效条件和复核日期。",
      cancel: "取消",
      save: "保存研究案例",
      close: "关闭案例定义",
    },
  },
  ja: {
    eyebrow: "次の調査行動",
    statuses: {
      "market-context": "市場データの背景のみ",
      incomplete: "調査は未完了",
      reviewable: "構造化レビューが可能",
    },
    statusHelp: {
      "market-context": (groups) =>
        `自動指標は ${groups} つの市場データ群だけに基づきます。投資判断ではなく背景情報です。`,
      incomplete: (groups, manual) =>
        `手動確認済みエビデンスは ${manual} 件、関連グループは ${groups} 件です。未完了項目を先に補ってください。`,
      reviewable: (groups, manual) =>
        `手動確認済みエビデンスは ${manual} 件、関連グループは ${groups} 件です。反証と定期レビューを行える状態です。`,
    },
    progress: (done, total) => `調査チェック ${done}/${total} 完了`,
    checksTitle: "調査チェック",
    checks: {
      "case-definition": "具体的で確認済みの調査仮説",
      "invalidation-criteria": "仮説を弱める条件を明記",
      "primary-source": "企業または規制当局の一次資料が1件以上",
      "counter-evidence": "確認済みの反証材料が1件以上",
      "source-diversity": "実質的に異なるエビデンス群が3件以上",
      "review-date": "次回レビュー日を設定",
    },
    nextTitle: "次に行うべき調査",
    nextActions: {
      "define-case": "検証したい実際の仮説を書く",
      "add-invalidation": "再検討が必要になる条件を書く",
      "add-primary-source": "最新の企業・規制当局資料を追加する",
      "add-counter-evidence": "仮説を弱める信頼できる事実を追加する",
      "add-independent-source": "別の独立した情報源を探す",
      "set-review-date": "次回レビュー日を決める",
      "save-baseline": "今後の比較基準として保存する",
    },
    editPlan: "調査ケースを定義",
    refresh: "市場データを更新",
    refreshing: "更新中…",
    saveBaseline: "比較基準を保存",
    changesTitle: "保存した基準からの変化",
    noBaseline:
      "比較基準がまだありません。ケース定義後に保存すると次回レビューで変化を確認できます。",
    noChange: "保存した基準から重要な追跡指標の変化はありません。",
    changes: {
      price: (value) => `株価 ${value}`,
      momentum: (value) => `3か月モメンタム ${value} pt`,
      volatility: (value) => `30日ボラティリティ ${value} pt`,
      drawdown: (value) => `最大ドローダウン ${value} pt`,
    },
    marketOnly:
      "以下のルールスコアと感応度テストは現在のモデルだけを説明します。推奨や完全な銘柄分析ではありません。",
    advancedTitle: "高度なモデル・ストレステスト",
    advancedHelp:
      "ルール感応度、関連エビデンス群、シナリオ境界を確認します。",
    modal: {
      eyebrow: "ケース定義",
      title: "検証する内容を定義",
      subtitle:
        "有用なストレステストには、具体的な仮説、反証条件、次回レビュー日が必要です。",
      purpose: "調査目的",
      purposes: {
        "new-research": "新規調査",
        "holding-review": "保有銘柄の見直し",
        watchlist: "ウォッチリストの追跡",
      },
      thesis: "調査仮説",
      thesisPlaceholder:
        "例：今後12か月、営業利益率の回復が売上成長の鈍化を上回る。",
      horizon: "調査期間",
      horizonPlaceholder: "例：12か月",
      invalidation: "何がこの仮説を実質的に弱めますか？",
      invalidationPlaceholder:
        "曖昧な印象ではなく観察可能な条件を記入してください。",
      reviewDate: "次回レビュー日",
      validation: "仮説、期間、反証条件、レビュー日をすべて入力してください。",
      cancel: "キャンセル",
      save: "調査ケースを保存",
      close: "ケース定義を閉じる",
    },
  },
  es: {
    eyebrow: "Acción de investigación",
    statuses: {
      "market-context": "Solo contexto de mercado",
      incomplete: "Investigación incompleta",
      reviewable: "Lista para una revisión estructurada",
    },
    statusHelp: {
      "market-context": (groups) =>
        `Los indicadores automáticos proceden de ${groups} grupo de datos de mercado. Son contexto, no una tesis de inversión.`,
      incomplete: (groups, manual) =>
        `Hay ${manual} evidencia(s) revisada(s) manualmente en ${groups} grupo(s) relacionado(s). Completa las comprobaciones pendientes.`,
      reviewable: (groups, manual) =>
        `Hay ${manual} evidencia(s) revisada(s) manualmente en ${groups} grupo(s) relacionado(s). El caso ya se puede cuestionar y revisar.`,
    },
    progress: (done, total) =>
      `${done} de ${total} comprobaciones completadas`,
    checksTitle: "Comprobaciones de investigación",
    checks: {
      "case-definition": "Una tesis específica y confirmada por el usuario",
      "invalidation-criteria": "Una condición escrita que debilitaría la tesis",
      "primary-source": "Al menos una fuente empresarial o regulatoria",
      "counter-evidence": "Al menos una evidencia contraria revisada",
      "source-diversity": "Al menos tres grupos de evidencia realmente distintos",
      "review-date": "Una fecha de revisión programada",
    },
    nextTitle: "Siguiente acción de investigación",
    nextActions: {
      "define-case": "Escribe la tesis real que quieres comprobar",
      "add-invalidation": "Indica qué te haría reconsiderarla",
      "add-primary-source": "Añade la última comunicación oficial",
      "add-counter-evidence": "Añade un hecho fiable que debilite la tesis",
      "add-independent-source": "Busca otra fuente verdaderamente independiente",
      "set-review-date": "Elige cuándo revisar de nuevo el caso",
      "save-baseline": "Guarda el caso como base de comparación",
    },
    editPlan: "Definir el caso",
    refresh: "Actualizar datos",
    refreshing: "Actualizando…",
    saveBaseline: "Guardar base",
    changesTitle: "Cambios desde la base guardada",
    noBaseline:
      "Aún no hay una base de comparación. Guárdala tras definir el caso para que la próxima revisión sea útil.",
    noChange: "No hubo cambios importantes en los indicadores seguidos.",
    changes: {
      price: (value) => `Precio ${value}`,
      momentum: (value) => `Impulso a 3 meses ${value} pp`,
      volatility: (value) => `Volatilidad de 30 días ${value} pp`,
      drawdown: (value) => `Máxima caída ${value} pp`,
    },
    marketOnly:
      "La puntuación y las pruebas de sensibilidad siguientes solo describen el modelo actual. No son una recomendación ni un análisis completo.",
    advancedTitle: "Prueba avanzada de estrés del modelo",
    advancedHelp:
      "Examina la sensibilidad de reglas, los grupos relacionados y los límites del escenario.",
    modal: {
      eyebrow: "Definición del caso",
      title: "Define lo que quieres comprobar",
      subtitle:
        "Una prueba útil empieza con una tesis concreta, una condición que podría refutarla y una fecha de revisión.",
      purpose: "Tarea de investigación",
      purposes: {
        "new-research": "Nueva investigación",
        "holding-review": "Revisar una posición existente",
        watchlist: "Seguir una idea",
      },
      thesis: "Tesis de investigación",
      thesisPlaceholder:
        "Ejemplo: en 12 meses, la recuperación del margen operativo compensará el menor crecimiento.",
      horizon: "Horizonte temporal",
      horizonPlaceholder: "Ejemplo: 12 meses",
      invalidation: "¿Qué debilitaría materialmente esta tesis?",
      invalidationPlaceholder:
        "Usa una condición observable, no una sensación imprecisa.",
      reviewDate: "Próxima revisión",
      validation:
        "Completa la tesis, el horizonte, la condición de invalidación y la fecha.",
      cancel: "Cancelar",
      save: "Guardar el caso",
      close: "Cerrar la definición",
    },
  },
};

export const researchUi = (locale: Locale) => COPY[locale];

const signed = (value: number, digits = 1) =>
  `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;

function trackedChanges(
  currentCase: ThesisCase,
  previousCase: ThesisCase | undefined,
  copy: ResearchCopy,
) {
  const current = currentCase.marketSnapshot;
  const previous = previousCase?.marketSnapshot;
  if (!current || !previous) return [];

  const changes = [
    {
      magnitude: Math.abs((current.price / previous.price - 1) * 100),
      text: copy.changes.price(
        signed((current.price / previous.price - 1) * 100) + "%",
      ),
    },
    {
      magnitude: Math.abs(
        current.metrics.quarterReturn - previous.metrics.quarterReturn,
      ),
      text: copy.changes.momentum(
        signed(
          current.metrics.quarterReturn -
            previous.metrics.quarterReturn,
        ),
      ),
    },
    {
      magnitude: Math.abs(
        current.metrics.annualizedVolatility -
          previous.metrics.annualizedVolatility,
      ),
      text: copy.changes.volatility(
        signed(
          current.metrics.annualizedVolatility -
            previous.metrics.annualizedVolatility,
        ),
      ),
    },
    {
      magnitude: Math.abs(
        current.metrics.maxDrawdown - previous.metrics.maxDrawdown,
      ),
      text: copy.changes.drawdown(
        signed(
          current.metrics.maxDrawdown -
            previous.metrics.maxDrawdown,
        ),
      ),
    },
  ];

  return changes
    .filter((item) => item.magnitude >= 0.1)
    .sort((a, b) => b.magnitude - a.magnitude)
    .slice(0, 3)
    .map((item) => item.text);
}

export function ResearchActionSummary({
  thesisCase,
  previousCase,
  readiness,
  locale,
  refreshing,
  onRefresh,
  onEditPlan,
  onNextAction,
  onSaveBaseline,
}: {
  thesisCase: ThesisCase;
  previousCase?: ThesisCase;
  readiness: ResearchReadiness;
  locale: Locale;
  refreshing: boolean;
  onRefresh: () => void;
  onEditPlan: () => void;
  onNextAction: (action: ReadinessAction) => void;
  onSaveBaseline: () => void;
}) {
  const copy = COPY[locale];
  const changes = useMemo(
    () => trackedChanges(thesisCase, previousCase, copy),
    [copy, previousCase, thesisCase],
  );
  const nextAction =
    readiness.nextAction ?? (previousCase ? null : "save-baseline");

  return (
    <section className={`research-action ${readiness.status}`}>
      <div className="research-action-main">
        <span className="eyebrow">{copy.eyebrow}</span>
        <div className="research-status-line">
          <div>
            <strong>{copy.statuses[readiness.status]}</strong>
            <p>
              {copy.statusHelp[readiness.status](
                readiness.relatedGroupCount,
                readiness.manualEvidenceCount,
              )}
            </p>
          </div>
          <span className="readiness-progress">
            {copy.progress(
              readiness.completedCount,
              readiness.totalCount,
            )}
          </span>
        </div>

        <div className="research-action-buttons">
          <button className="button primary" onClick={onEditPlan}>
            <FileCheck2 size={15} />
            {copy.editPlan}
          </button>
          {thesisCase.marketSnapshot && (
            <button
              className="button secondary"
              onClick={onRefresh}
              disabled={refreshing}
            >
              <RefreshCcw
                size={14}
                className={refreshing ? "spin" : undefined}
              />
              {refreshing ? copy.refreshing : copy.refresh}
            </button>
          )}
          {!previousCase && (
            <button className="button ghost" onClick={onSaveBaseline}>
              {copy.saveBaseline}
            </button>
          )}
        </div>
      </div>

      <div className="research-checks">
        <strong>{copy.checksTitle}</strong>
        <div>
          {readiness.checks.map((check) => (
            <span className={check.complete ? "complete" : ""} key={check.id}>
              {check.complete ? <Check size={13} /> : <Circle size={13} />}
              {copy.checks[check.id]}
            </span>
          ))}
        </div>
      </div>

      <div className="research-next">
        <div>
          <span>{copy.nextTitle}</span>
          {nextAction ? (
            <button onClick={() => onNextAction(nextAction)}>
              <strong>{copy.nextActions[nextAction]}</strong>
              <ArrowRight size={15} />
            </button>
          ) : (
            <strong>{copy.statuses.reviewable}</strong>
          )}
        </div>
        <div>
          <span>{copy.changesTitle}</span>
          {previousCase ? (
            changes.length ? (
              <ul>
                {changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            ) : (
              <p>{copy.noChange}</p>
            )
          ) : (
            <p>{copy.noBaseline}</p>
          )}
        </div>
      </div>

      {readiness.status !== "reviewable" && (
        <p className="market-context-warning">
          <ShieldAlert size={14} />
          {copy.marketOnly}
        </p>
      )}
    </section>
  );
}

export function ResearchPlanModal({
  thesisCase,
  locale,
  onClose,
  onSave,
}: {
  thesisCase: ThesisCase;
  locale: Locale;
  onClose: () => void;
  onSave: (value: {
    thesis: string;
    horizon: string;
    researchPlan: ResearchPlan;
  }) => void;
}) {
  const copy = COPY[locale].modal;
  const [error, setError] = useState("");
  const firstFieldRef = useRef<HTMLSelectElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    firstFieldRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      returnFocusRef.current?.focus();
    };
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const purpose = String(form.get("purpose")) as ResearchPurpose;
    const thesis = String(form.get("thesis") ?? "").trim();
    const horizon = String(form.get("horizon") ?? "").trim();
    const invalidationCriteria = String(
      form.get("invalidationCriteria") ?? "",
    ).trim();
    const nextReviewDate = String(
      form.get("nextReviewDate") ?? "",
    ).trim();

    if (
      !["new-research", "holding-review", "watchlist"].includes(purpose) ||
      thesis.length < 12 ||
      !horizon ||
      invalidationCriteria.length < 12 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(nextReviewDate)
    ) {
      setError(copy.validation);
      return;
    }

    onSave({
      thesis,
      horizon,
      researchPlan: {
        purpose,
        thesisConfirmed: true,
        invalidationCriteria,
        nextReviewDate,
      },
    });
  };

  const initialPlan: ResearchPlan = thesisCase.researchPlan ?? {
    purpose: "new-research",
    thesisConfirmed: false,
    invalidationCriteria: "",
    nextReviewDate: "",
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal research-plan-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="research-plan-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">{copy.eyebrow}</span>
            <h2 id="research-plan-title">{copy.title}</h2>
            <p>{copy.subtitle}</p>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label={copy.close}
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit}>
          <label className="field">
            <span>{copy.purpose}</span>
            <select
              ref={firstFieldRef}
              name="purpose"
              defaultValue={initialPlan.purpose}
            >
              {(Object.keys(copy.purposes) as ResearchPurpose[]).map(
                (purpose) => (
                  <option value={purpose} key={purpose}>
                    {copy.purposes[purpose]}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="field">
            <span>{copy.thesis}</span>
            <textarea
              name="thesis"
              rows={3}
              required
              minLength={12}
              maxLength={5000}
              defaultValue={
                initialPlan.thesisConfirmed ? thesisCase.thesis : ""
              }
              placeholder={copy.thesisPlaceholder}
            />
          </label>
          <label className="field">
            <span>{copy.horizon}</span>
            <input
              name="horizon"
              required
              maxLength={120}
              defaultValue={
                initialPlan.thesisConfirmed ? thesisCase.horizon : ""
              }
              placeholder={copy.horizonPlaceholder}
            />
          </label>
          <label className="field">
            <span>{copy.invalidation}</span>
            <textarea
              name="invalidationCriteria"
              rows={3}
              required
              minLength={12}
              maxLength={2000}
              defaultValue={initialPlan.invalidationCriteria}
              placeholder={copy.invalidationPlaceholder}
            />
          </label>
          <label className="field">
            <span>{copy.reviewDate}</span>
            <input
              name="nextReviewDate"
              type="date"
              required
              defaultValue={initialPlan.nextReviewDate}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="button ghost" onClick={onClose}>
              {copy.cancel}
            </button>
            <button type="submit" className="button primary">
              <CalendarClock size={15} />
              {copy.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
