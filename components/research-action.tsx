"use client";

import {
  ArrowRight,
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
    titles: Record<ResearchPlanEditorMode, string>;
    subtitles: Record<ResearchPlanEditorMode, string>;
    thesis: string;
    thesisPlaceholder: string;
    invalidation: string;
    invalidationPlaceholder: string;
    reviewDate: string;
    dateValidation: string;
    cancel: string;
    save: string;
    close: string;
  };
};

export type ResearchPlanEditorMode = "claim" | "review";

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
        `${manual} user-added material(s); ${groups} verified source group(s). Complete the missing checks before reviewing the record.`,
      reviewable: (groups, manual) =>
        `${manual} user-added material(s); ${groups} verified source group(s). The record is ready to challenge and revisit.`,
    },
    progress: (done, total) => `${done} of ${total} research checks complete`,
    checksTitle: "Research checks",
    checks: {
      "case-definition": "A specific, user-confirmed research claim",
      "invalidation-criteria": "A written condition that would weaken the claim",
      "primary-source": "At least one company or regulatory filing",
      "counter-evidence": "At least one independently reviewed challenge",
      "source-diversity": "At least two verified source groups",
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
      titles: {
        claim: "Edit claim",
        review: "Check settings",
      },
      subtitles: {
        claim: "",
        review: "Both fields are optional.",
      },
      thesis: "Your claim",
      thesisPlaceholder:
        "Example: Over the next 12 months, operating-margin recovery can outpace slower revenue growth.",
      invalidation: "What would make you change your view?",
      invalidationPlaceholder:
        "Example: organic growth stays below 8% for two quarters.",
      reviewDate: "Check again",
      dateValidation: "Choose a valid date.",
      cancel: "Cancel",
      save: "Save",
      close: "Close",
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
        `目前有 ${manual} 项人工录入材料、${groups} 个已核查来源组。请先补齐缺口。`,
      reviewable: (groups, manual) =>
        `目前有 ${manual} 项人工录入材料、${groups} 个已核查来源组，可以开始反证并定期复核。`,
    },
    progress: (done, total) => `已完成 ${done}/${total} 项研究检查`,
    checksTitle: "研究检查",
    checks: {
      "case-definition": "已确认一条具体、可检验的研究判断",
      "invalidation-criteria": "已写明什么情况会削弱该判断",
      "primary-source": "至少一份公司或监管机构原始披露",
      "counter-evidence": "至少一条经过核查的反向证据",
      "source-diversity": "至少两个已核查来源组",
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
      titles: {
        claim: "编辑判断",
        review: "复查设置",
      },
      subtitles: {
        claim: "",
        review: "两项都可不填。",
      },
      thesis: "你的判断",
      thesisPlaceholder:
        "例如：未来 12 个月，经营利润率改善能够抵消收入增速放缓。",
      invalidation: "什么情况会让你改变判断？",
      invalidationPlaceholder:
        "例如：有机收入连续两个季度低于 8%",
      reviewDate: "下次检查",
      dateValidation: "请选择有效日期。",
      cancel: "取消",
      save: "保存",
      close: "关闭",
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
        `ユーザー追加資料は ${manual} 件、確認済み出典群は ${groups} 件です。未完了項目を先に補ってください。`,
      reviewable: (groups, manual) =>
        `ユーザー追加資料は ${manual} 件、確認済み出典群は ${groups} 件です。反証と定期レビューを行える状態です。`,
    },
    progress: (done, total) => `調査チェック ${done}/${total} 完了`,
    checksTitle: "調査チェック",
    checks: {
      "case-definition": "具体的で確認済みの調査仮説",
      "invalidation-criteria": "仮説を弱める条件を明記",
      "primary-source": "企業または規制当局の一次資料が1件以上",
      "counter-evidence": "確認済みの反証材料が1件以上",
      "source-diversity": "確認済みの出典群が2件以上",
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
      titles: {
        claim: "仮説を編集",
        review: "確認設定",
      },
      subtitles: {
        claim: "",
        review: "どちらも任意です。",
      },
      thesis: "調査仮説",
      thesisPlaceholder:
        "例：今後12か月、営業利益率の回復が売上成長の鈍化を上回る。",
      invalidation: "何があれば判断を変えますか？",
      invalidationPlaceholder:
        "例：有機成長率が2四半期連続で8%を下回る。",
      reviewDate: "次回確認",
      dateValidation: "有効な日付を選んでください。",
      cancel: "キャンセル",
      save: "保存",
      close: "閉じる",
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
        `Hay ${manual} material(es) añadido(s) y ${groups} grupo(s) de fuentes verificado(s). Completa las comprobaciones pendientes.`,
      reviewable: (groups, manual) =>
        `Hay ${manual} material(es) añadido(s) y ${groups} grupo(s) de fuentes verificado(s). El registro ya se puede cuestionar y revisar.`,
    },
    progress: (done, total) =>
      `${done} de ${total} comprobaciones completadas`,
    checksTitle: "Comprobaciones de investigación",
    checks: {
      "case-definition": "Una tesis específica y confirmada por el usuario",
      "invalidation-criteria": "Una condición escrita que debilitaría la tesis",
      "primary-source": "Al menos una fuente empresarial o regulatoria",
      "counter-evidence": "Al menos una evidencia contraria revisada",
      "source-diversity": "Al menos dos grupos de fuentes verificados",
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
      titles: {
        claim: "Editar tesis",
        review: "Ajustes de revisión",
      },
      subtitles: {
        claim: "",
        review: "Ambos campos son opcionales.",
      },
      thesis: "Tesis de investigación",
      thesisPlaceholder:
        "Ejemplo: en 12 meses, la recuperación del margen operativo compensará el menor crecimiento.",
      invalidation: "¿Qué te haría cambiar de opinión?",
      invalidationPlaceholder:
        "Ejemplo: crecimiento orgánico inferior al 8% durante dos trimestres.",
      reviewDate: "Próxima revisión",
      dateValidation: "Elige una fecha válida.",
      cancel: "Cancelar",
      save: "Guardar",
      close: "Cerrar",
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
  mode,
  onClose,
  onSave,
}: {
  thesisCase: ThesisCase;
  locale: Locale;
  mode: ResearchPlanEditorMode;
  onClose: () => void;
  onSave: (value: {
    thesis: string;
    horizon: string;
    researchPlan: ResearchPlan;
  }) => void;
}) {
  const copy = COPY[locale].modal;
  const [error, setError] = useState("");
  const claimFieldRef = useRef<HTMLTextAreaElement>(null);
  const reviewFieldRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  const initialPlan: ResearchPlan = thesisCase.researchPlan ?? {
    purpose: "new-research",
    thesisConfirmed: false,
    invalidationCriteria: "",
    nextReviewDate: "",
  };

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (mode === "claim") {
      claimFieldRef.current?.focus();
    } else {
      reviewFieldRef.current?.focus();
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]',
        ),
      ).filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      returnFocusRef.current?.focus();
    };
  }, [mode]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (mode === "claim") {
      const thesis = String(form.get("thesis") ?? "").trim();
      onSave({
        thesis: thesis || thesisCase.thesis,
        horizon: thesisCase.horizon,
        researchPlan: {
          ...initialPlan,
          thesisConfirmed: Boolean(thesis),
        },
      });
      return;
    }

    const nextReviewDate = String(form.get("nextReviewDate") ?? "").trim();
    if (
      nextReviewDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(nextReviewDate)
    ) {
      setError(copy.dateValidation);
      return;
    }
    onSave({
      thesis: thesisCase.thesis,
      horizon: thesisCase.horizon,
      researchPlan: {
        ...initialPlan,
        invalidationCriteria: String(
          form.get("invalidationCriteria") ?? "",
        ).trim(),
        nextReviewDate,
      },
    });
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="modal research-plan-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="research-plan-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="research-plan-title">{copy.titles[mode]}</h2>
            {copy.subtitles[mode] && <p>{copy.subtitles[mode]}</p>}
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
          {mode === "claim" ? (
            <label className="field">
              <span>{copy.thesis}</span>
              <textarea
                ref={claimFieldRef}
                name="thesis"
                rows={4}
                maxLength={5000}
                defaultValue={
                  initialPlan.thesisConfirmed ? thesisCase.thesis : ""
                }
                placeholder={copy.thesisPlaceholder}
              />
            </label>
          ) : (
            <>
              <label className="field">
                <span>{copy.invalidation}</span>
                <textarea
                  ref={reviewFieldRef}
                  name="invalidationCriteria"
                  rows={3}
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
                  defaultValue={initialPlan.nextReviewDate}
                />
              </label>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button type="button" className="button ghost" onClick={onClose}>
              {copy.cancel}
            </button>
            <button type="submit" className="button primary">
              <Check size={15} />
              {copy.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
