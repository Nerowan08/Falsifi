"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  Copy,
  Download,
  ExternalLink,
  Globe2,
  History,
  Import,
  Info,
  Link2,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import {
  FormEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MarketOverview,
  marketUi,
  StockPicker,
} from "@/components/market-workspace";
import { FalsifyWorkspace } from "@/components/falsify-workspace";
import {
  ResearchActionSummary,
  ResearchPlanModal,
  researchUi,
} from "@/components/research-action";
import { UserGuide } from "@/components/user-guide";
import {
  demoLocalizedCopy,
  LOCALE_OPTIONS,
  Locale,
  resolveLocale,
  t,
  TranslationKey,
} from "@/lib/i18n";
import {
  EvidenceDirection,
  EvidenceGroup,
  EvidenceItem,
  EvidenceStressMode,
  canonicalEvidenceSource,
  isHttpUrl,
  isMarketSnapshot,
  isThesisCase,
  MarketSnapshot,
  Posture,
  runStressTest,
  sha256,
  StressResult,
  ThesisCase,
} from "@/lib/falsifi";
import {
  buildResearchCase,
  normalizeMarketCase,
  refreshMarketCase,
  relocalizeMarketCase,
  type StockSearchResult,
} from "@/lib/market";
import {
  assessResearchReadiness,
  type ReadinessAction,
  type ResearchReadiness,
} from "@/lib/readiness";

type View =
  | "stress"
  | "evidence"
  | "audit"
  | "history"
  | "method"
  | "guide";

type Snapshot = {
  id: string;
  createdAt: string;
  score: number;
  posture: Posture;
  stability: number;
  hash: string;
  evidenceCount: number;
  label: string;
  modelVersion?: string;
  parentHash?: string;
  caseState: ThesisCase;
};

const CASE_STORAGE_KEY = "falsifi.case.v2";
const LEGACY_CASE_STORAGE_KEY = "falsifi.case.v1";
const SNAPSHOT_STORAGE_KEY = "falsifi.snapshots.v2";
const LOCALE_STORAGE_KEY = "falsifi.locale.v1";
const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

const postureKeys: Record<Posture, TranslationKey> = {
  Constructive: "posture.constructive",
  Balanced: "posture.balanced",
  Cautious: "posture.cautious",
};

const postureHelpKeys: Record<Posture, TranslationKey> = {
  Constructive: "posture.constructiveHelp",
  Balanced: "posture.balancedHelp",
  Cautious: "posture.cautiousHelp",
};

const groupKeys: Record<EvidenceGroup, TranslationKey> = {
  "Official filing": "evidence.group.official",
  Management: "evidence.group.management",
  "Market data": "evidence.group.market",
  "External estimate": "evidence.group.external",
};

const stressModeKeys: Record<EvidenceStressMode, TranslationKey> = {
  remove: "stress.semantics.remove",
  degrade: "stress.semantics.degrade",
  contradict: "stress.semantics.contradict",
};

const stressHelpKeys: Record<EvidenceStressMode, TranslationKey> = {
  remove: "stress.semantics.removeHelp",
  degrade: "stress.semantics.degradeHelp",
  contradict: "stress.semantics.contradictHelp",
};

const formatDate = (
  value: string,
  locale: Locale,
  withTime = false,
) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
};

const signed = (value: number, digits = 1) =>
  `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;

const formatValue = (value: number, unit: string, digits = 1) =>
  `${value.toFixed(digits)}${unit}`;

const isSnapshot = (value: unknown): value is Snapshot => {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<Snapshot>;
  return (
    typeof snapshot.id === "string" &&
    typeof snapshot.createdAt === "string" &&
    typeof snapshot.score === "number" &&
    ["Constructive", "Balanced", "Cautious"].includes(
      snapshot.posture ?? "",
    ) &&
    typeof snapshot.stability === "number" &&
    typeof snapshot.hash === "string" &&
    typeof snapshot.evidenceCount === "number" &&
    typeof snapshot.label === "string" &&
    isThesisCase(snapshot.caseState)
  );
};

function localizedEvidence(
  item: EvidenceItem,
  thesisCase: ThesisCase,
  locale: Locale,
) {
  if (!thesisCase.isDemo) {
    return { title: item.title, note: item.note, source: item.source };
  }
  const copy = demoLocalizedCopy(locale).evidence as Record<
    string,
    { title: string; note: string; source: string }
  >;
  return copy[item.id] ?? {
    title: item.title,
    note: item.note,
    source: item.source,
  };
}

function localizedAssumption(
  id: string,
  fallback: string,
  thesisCase: ThesisCase,
  locale: Locale,
) {
  if (!thesisCase.isDemo) return fallback;
  const copy = demoLocalizedCopy(locale).assumptions as Record<string, string>;
  return copy[id] ?? fallback;
}

function localizedThesis(thesisCase: ThesisCase, locale: Locale) {
  if (!thesisCase.isDemo) {
    return { thesis: thesisCase.thesis, horizon: thesisCase.horizon };
  }
  const copy = demoLocalizedCopy(locale);
  return { thesis: copy.thesis, horizon: copy.horizon };
}

function AppHeader({
  activeView,
  locale,
  thesisCase,
  onHome,
  onChangeLocale,
  onChangeStock,
  onOpenGuide,
  guideButtonRef,
}: {
  activeView: View;
  locale: Locale;
  thesisCase: ThesisCase | null;
  onHome: () => void;
  onChangeLocale: (locale: Locale) => void;
  onChangeStock: () => void;
  onOpenGuide: () => void;
  guideButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <header className="app-header">
      <a className="skip-link" href="#main-content">
        {t(locale, "nav.skipToContent")}
      </a>
      <div className="header-inner">
        <button
          className="brand"
          onClick={onHome}
          aria-label={t(locale, "app.name")}
        >
          <span className="brand-symbol" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>Falsifi</strong>
            <small>{t(locale, "app.tagline")}</small>
          </span>
        </button>

        <div className="header-actions">
          {thesisCase && (
            <>
              <button
                className="button ghost change-stock"
                onClick={onChangeStock}
              >
                <Search size={14} />
                {marketUi(locale).changeStock}
              </button>
              <span className="ticker-chip">{thesisCase.ticker}</span>
            </>
          )}
          <button
            ref={guideButtonRef}
            className={`button ghost guide-trigger ${
              activeView === "guide" ? "active" : ""
            }`}
            onClick={onOpenGuide}
            aria-current={activeView === "guide" ? "page" : undefined}
            aria-label={t(locale, "guide.open")}
          >
            <CircleHelp size={15} />
            <span>{t(locale, "guide.open")}</span>
          </button>
          <label className="language-select">
            <Globe2 size={15} />
            <span className="sr-only">{t(locale, "aria.selectLanguage")}</span>
            <select
              value={locale}
              onChange={(event) =>
                onChangeLocale(resolveLocale(event.target.value))
              }
              aria-label={t(locale, "aria.selectLanguage")}
            >
              {LOCALE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}

function CaseIntro({
  thesisCase,
  locale,
}: {
  thesisCase: ThesisCase;
  locale: Locale;
}) {
  const copy = localizedThesis(thesisCase, locale);
  return (
    <section className="case-intro">
      <div className="case-title">
        <div className="case-meta">
          <span className="status-badge">
            <i />
            {thesisCase.marketSnapshot
              ? marketUi(locale).realData
              : t(
                  locale,
                  thesisCase.isDemo ? "app.demoCase" : "app.localCase",
                )}
          </span>
          <span>{copy.horizon}</span>
          <span>
            {t(locale, "app.lastUpdated")}{" "}
            {formatDate(thesisCase.lastUpdated, locale)}
          </span>
        </div>
        <h1>
          {thesisCase.company}
          <span>{thesisCase.ticker}</span>
        </h1>
        <p>{copy.thesis}</p>
      </div>
      <div className="case-promise">
        <span>{t(locale, "app.description")}</span>
        <strong>{thesisCase.modelVersion}</strong>
      </div>
    </section>
  );
}

function MetricGrid({
  analysis,
  locale,
  readiness,
}: {
  analysis: StressResult;
  locale: Locale;
  readiness: ResearchReadiness;
}) {
  const ready = readiness.status === "reviewable";
  const copy = researchUi(locale);

  return (
    <section className="metric-grid" aria-label={t(locale, "common.score")}>
      <article>
        <span>{t(locale, "metrics.posture")}</span>
        <strong
          className={
            ready ? `posture ${analysis.posture.toLowerCase()}` : "posture"
          }
        >
          {ready
            ? t(locale, postureKeys[analysis.posture])
            : copy.statuses[readiness.status]}
        </strong>
        <small className="metric-help">
          {ready
            ? t(locale, postureHelpKeys[analysis.posture])
            : copy.statusHelp[readiness.status](
                readiness.relatedGroupCount,
                readiness.manualEvidenceCount,
              )}
        </small>
      </article>
      <article>
        <span>{t(locale, "metrics.score")}</span>
        <strong>
          {ready ? analysis.score.toFixed(1) : "—"}
          {ready && <small>/100</small>}
        </strong>
        <small className="metric-help">
          {ready ? t(locale, "metrics.scoreHelp") : copy.marketOnly}
        </small>
      </article>
      <article>
        <span>{t(locale, "metrics.stability")}</span>
        <strong>
          {ready ? analysis.stabilityScore : "—"}
          {ready && <small>/100</small>}
        </strong>
        <small className="metric-help">
          {ready ? t(locale, "metrics.stabilityHelp") : copy.marketOnly}
        </small>
      </article>
      <article>
        <span>{t(locale, "metrics.independentRoots")}</span>
        <strong>
          {analysis.independenceAudit.independentRootCount}
          <small className="metric-note">
            {t(locale, "audit.rawCount", {
              count: analysis.independenceAudit.enabledEvidenceCount,
            })}
          </small>
        </strong>
        <small className="metric-help">
          {t(locale, "metrics.rootsHelp")}
        </small>
      </article>
    </section>
  );
}

function SensitivityChart({
  analysis,
  thesisCase,
  locale,
}: {
  analysis: StressResult;
  thesisCase: ThesisCase;
  locale: Locale;
}) {
  const points = analysis.sensitivity;
  if (!points.length) return null;
  const minX = points[0].value;
  const maxX = points[points.length - 1].value;
  const chartWidth = 650;
  const left = 42;
  const right = 624;
  const top = 24;
  const bottom = 218;
  const x = (value: number) =>
    left + ((value - minX) / Math.max(maxX - minX, 0.000001)) * (right - left);
  const y = (value: number) =>
    bottom - (value / 100) * (bottom - top);
  const line = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${x(point.value).toFixed(1)} ${y(
          point.score,
        ).toFixed(1)}`,
    )
    .join(" ");
  const currentX = x(analysis.driver.value);
  const currentY = y(analysis.score);
  const flip = analysis.assumptionFlip;
  const flipInChart =
    flip !== null && flip.to >= minX && flip.to <= maxX;
  const flipX = flipInChart && flip ? x(flip.to) : null;
  const driverLabel = localizedAssumption(
    analysis.driver.id,
    analysis.driver.label,
    thesisCase,
    locale,
  );

  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${chartWidth} 264`}
        role="img"
        aria-label={t(locale, "aria.cliffChart", { name: driverLabel })}
      >
        <defs>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#625bf6" stopOpacity="0.16" />
            <stop offset="1" stopColor="#625bf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[40, 60, 80].map((tick) => (
          <g key={tick}>
            <line
              x1={left}
              x2={right}
              y1={y(tick)}
              y2={y(tick)}
              className="chart-gridline"
            />
            <text x={left - 10} y={y(tick) + 4} textAnchor="end">
              {tick}
            </text>
          </g>
        ))}
        <line
          x1={left}
          x2={right}
          y1={y(thesisCase.constructiveThreshold)}
          y2={y(thesisCase.constructiveThreshold)}
          className="chart-threshold"
        />
        <line
          x1={left}
          x2={right}
          y1={y(thesisCase.cautiousThreshold)}
          y2={y(thesisCase.cautiousThreshold)}
          className="chart-threshold lower"
        />
        <path
          d={`${line} L ${right} ${bottom} L ${left} ${bottom} Z`}
          fill="url(#chartFill)"
        />
        <path d={line} className="chart-line" />
        {flipX !== null && (
          <>
            <line
              x1={flipX}
              x2={flipX}
              y1={top}
              y2={bottom}
              className="chart-flip-guide"
            />
            <text x={flipX} y={15} textAnchor="middle" className="chart-flip">
              {t(locale, "stress.cliff.flipPoint")}
            </text>
          </>
        )}
        <line
          x1={currentX}
          x2={currentX}
          y1={currentY}
          y2={bottom}
          className="chart-current-guide"
        />
        <circle cx={currentX} cy={currentY} r="5.5" className="chart-dot" />
        <text x={left} y="254" className="chart-axis">
          {driverLabel} ({analysis.driver.unit})
        </text>
        <text x={right} y="254" textAnchor="end" className="chart-axis">
          {t(locale, "common.score")} {analysis.score.toFixed(1)}
        </text>
        </svg>
        {flip && !flipInChart && (
          <p className="chart-range-note">
            {t(locale, "stress.cliff.outsideChart", {
              value: formatValue(flip.to, flip.unit),
            })}
          </p>
        )}
    </div>
  );
}

function FlipSummary({
  thesisCase,
  analysis,
  locale,
}: {
  thesisCase: ThesisCase;
  analysis: StressResult;
  locale: Locale;
}) {
  const independent = analysis.minimumIndependentFlip;
  const flip = analysis.assumptionFlip;
  const independentItems = independent.evidence.slice(0, 3);

  return (
    <article className="card flip-card">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">{t(locale, "stress.flip.title")}</span>
          <h2>{t(locale, "stress.flip.description")}</h2>
        </div>
        <span className="proof-chip">
          {t(
            locale,
            independent.exhaustive
              ? "stress.search.complete"
              : "stress.search.groupLimit",
            { count: independent.maxRootSetSize },
          )}{" "}
          ·{" "}
          {t(locale, "stress.search.testedCombinations", {
            count: independent.combinationsEvaluated.toLocaleString(locale),
          })}
        </span>
      </div>

      <div className="flip-route">
        {independent.found ? (
          <>
            <strong>{independent.rootIds.length}</strong>
            <div>
              <span>
                {t(locale, "metrics.independentRoots")}
              </span>
              <small>
                {t(locale, "common.items", {
                  count: independent.evidence.length,
                })}
              </small>
            </div>
          </>
        ) : (
          <p>{t(locale, "stress.flip.noEvidenceSet")}</p>
        )}
      </div>

      {independentItems.length > 0 && (
        <div className="flip-evidence">
          {independentItems.map((item) => (
            <span key={item.id}>
              <i className={item.direction} />
              {localizedEvidence(item, thesisCase, locale).title}
            </span>
          ))}
          {independent.evidence.length > independentItems.length && (
            <span>+{independent.evidence.length - independentItems.length}</span>
          )}
        </div>
      )}

      <div className="alternative-route">
        <span>{t(locale, "stress.flip.assumptionMove")}</span>
        {flip ? (
          <strong>
            {localizedAssumption(
              flip.assumptionId,
              flip.label,
              thesisCase,
              locale,
            )}
            <em>
              {signed(flip.delta)}
              {flip.unit}
            </em>
          </strong>
        ) : (
          <strong>{t(locale, "stress.flip.noAssumptionMove")}</strong>
        )}
      </div>
    </article>
  );
}

export function StressView({
  thesisCase,
  setThesisCase,
  analysis,
  locale,
  readiness,
  previousCase,
  refreshing,
  onRefresh,
  onEditPlan,
  onNextAction,
  onSaveBaseline,
}: {
  thesisCase: ThesisCase;
  setThesisCase: (value: ThesisCase) => void;
  analysis: StressResult;
  locale: Locale;
  readiness: ResearchReadiness;
  previousCase?: ThesisCase;
  refreshing: boolean;
  onRefresh: () => void;
  onEditPlan: () => void;
  onNextAction: (action: ReadinessAction) => void;
  onSaveBaseline: () => void;
}) {
  const actionCopy = researchUi(locale);
  const updateAssumption = (id: string, value: number) => {
    setThesisCase({
      ...thesisCase,
      assumptions: thesisCase.assumptions.map((assumption) =>
        assumption.id === id ? { ...assumption, value } : assumption,
      ),
      lastUpdated: new Date().toISOString(),
    });
  };

  const resetAssumptions = () => {
    setThesisCase({
      ...thesisCase,
      assumptions: thesisCase.assumptions.map((assumption) => ({
        ...assumption,
        value: assumption.baseline,
      })),
      lastUpdated: new Date().toISOString(),
    });
  };

  const changedAssumptions = thesisCase.assumptions.filter(
    (assumption) =>
      Math.abs(assumption.value - assumption.baseline) > Number.EPSILON,
  ).length;

  return (
    <>
      <CaseIntro thesisCase={thesisCase} locale={locale} />
      {thesisCase.marketSnapshot && (
        <MarketOverview
          snapshot={thesisCase.marketSnapshot}
          locale={locale}
        />
      )}
      <ResearchActionSummary
        thesisCase={thesisCase}
        previousCase={previousCase}
        readiness={readiness}
        locale={locale}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEditPlan={onEditPlan}
        onNextAction={onNextAction}
        onSaveBaseline={onSaveBaseline}
      />

      <details
        className="advanced-analysis"
        open={readiness.status === "reviewable"}
      >
        <summary>
          <span>
            <strong>{actionCopy.advancedTitle}</strong>
            <small>{actionCopy.advancedHelp}</small>
          </span>
        </summary>
        <div className="advanced-analysis-body">
          <MetricGrid
            analysis={analysis}
            locale={locale}
            readiness={readiness}
          />

          <section className="primary-grid">
            <FlipSummary
              thesisCase={thesisCase}
              analysis={analysis}
              locale={locale}
            />
            <article className="card chart-card">
              <div className="section-heading compact">
                <div>
                  <span className="eyebrow">
                    {t(locale, "stress.cliff.title")}
                  </span>
                  <h2>{t(locale, "stress.cliff.description")}</h2>
                </div>
                <strong className="mini-score">
                  {readiness.status === "reviewable"
                    ? analysis.score.toFixed(1)
                    : "—"}
                </strong>
              </div>
              <SensitivityChart
                analysis={analysis}
                thesisCase={thesisCase}
                locale={locale}
              />
            </article>
          </section>

          <section className="card assumption-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  {t(locale, "stress.assumptions.title")}
                </span>
                <h2>{t(locale, "stress.assumptions.description")}</h2>
              </div>
              <button className="button ghost" onClick={resetAssumptions}>
                <RefreshCcw size={14} />
                {changedAssumptions
                  ? t(locale, "stress.assumptions.changedCount", {
                      count: changedAssumptions,
                    })
                  : t(locale, "stress.assumptions.noChanges")}
              </button>
            </div>
            <div className="assumption-grid">
              {thesisCase.assumptions.map((assumption) => {
                const label = localizedAssumption(
                  assumption.id,
                  assumption.label,
                  thesisCase,
                  locale,
                );
                const digits = assumption.step < 1 ? 1 : 0;
                return (
                  <label className="assumption-control" key={assumption.id}>
                    <span className="assumption-topline">
                      <strong>{label}</strong>
                      <output>
                        {formatValue(
                          assumption.value,
                          assumption.unit,
                          digits,
                        )}
                      </output>
                    </span>
                    <input
                      type="range"
                      min={assumption.min}
                      max={assumption.max}
                      step={assumption.step}
                      value={assumption.value}
                      onChange={(event) =>
                        updateAssumption(
                          assumption.id,
                          Number(event.target.value),
                        )
                      }
                      aria-label={t(locale, "aria.assumptionSlider", {
                        name: label,
                      })}
                    />
                    <span className="assumption-meta">
                      <small>
                        {t(locale, "stress.assumptions.baseline", {
                          value: formatValue(
                            assumption.baseline,
                            assumption.unit,
                            digits,
                          ),
                        })}
                      </small>
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          updateAssumption(
                            assumption.id,
                            assumption.baseline,
                          );
                        }}
                        aria-label={t(locale, "aria.resetAssumption", {
                          name: label,
                        })}
                      >
                        <RefreshCcw size={12} />
                      </button>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="secondary-grid">
            <article className="card frontier-card">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    {t(locale, "stress.frontier.title")}
                  </span>
                  <h2>{t(locale, "stress.frontier.description")}</h2>
                </div>
                <span className="proof-chip">
                  {t(
                    locale,
                    analysis.jointFlipFrontier.exact
                      ? "stress.search.completeGrid"
                      : "stress.search.sampled",
                  )}{" "}
                  ·{" "}
                  {t(locale, "stress.search.testedCombinations", {
                    count:
                      analysis.jointFlipFrontier.evaluatedStates.toLocaleString(
                        locale,
                      ),
                  })}
                </span>
              </div>
              <p className="search-scope-note">
                {t(locale, "stress.frontier.scope")}{" "}
                {t(locale, "stress.search.stateLimit", {
                  count:
                    analysis.jointFlipFrontier.maxStates.toLocaleString(locale),
                })}
              </p>
              <div className="frontier-list">
                {analysis.jointFlipFrontier.points.length ? (
                  analysis.jointFlipFrontier.points
                    .slice(0, 4)
                    .map((point, i) => (
                      <div
                        className="frontier-row"
                        key={`${point.assumptionIds}-${i}`}
                      >
                        <span className="route-number">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <strong>
                            {localizedAssumption(
                              point.assumptionIds[0],
                              point.labels[0],
                              thesisCase,
                              locale,
                            )}
                            <em>
                              {signed(point.deltas[0])}
                              {point.units[0]}
                            </em>
                          </strong>
                          <strong>
                            {localizedAssumption(
                              point.assumptionIds[1],
                              point.labels[1],
                              thesisCase,
                              locale,
                            )}
                            <em>
                              {signed(point.deltas[1])}
                              {point.units[1]}
                            </em>
                          </strong>
                          <small className="combination-scope">
                            {t(
                              locale,
                              point.requiresBoth
                                ? "stress.frontier.requiresBoth"
                                : "stress.frontier.oneSufficient",
                            )}
                          </small>
                        </div>
                        <span
                          className={`posture-tag ${point.resultingPosture.toLowerCase()}`}
                        >
                          {t(locale, postureKeys[point.resultingPosture])} ·{" "}
                          {point.resultingScore.toFixed(1)}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="empty-state">
                    {t(locale, "stress.frontier.noFrontier")}
                  </div>
                )}
              </div>
            </article>

            <article className="card semantics-card">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    {t(locale, "stress.semantics.title")}
                  </span>
                  <h2>{t(locale, "stress.semantics.description")}</h2>
                </div>
              </div>
              <div
                className="semantics-grid"
                aria-label={t(locale, "aria.stressSemantics")}
              >
                {(
                  ["remove", "degrade", "contradict"] as EvidenceStressMode[]
                ).map((mode) => {
                  const outcome = analysis.evidenceStress.outcomes[mode];
                  return (
                    <div
                      className={`semantic-option ${outcome.flipsPosture ? "flips" : ""}`}
                      key={mode}
                      title={t(locale, stressHelpKeys[mode])}
                    >
                      <span>{t(locale, stressModeKeys[mode])}</span>
                      <strong>{outcome.score.toFixed(1)}</strong>
                      <small>
                        {signed(outcome.delta)} ·{" "}
                        {t(locale, postureKeys[outcome.posture])}
                      </small>
                      <p className="semantic-help">
                        {t(locale, stressHelpKeys[mode])}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="semantic-note">
                <Info size={14} />
                {t(locale, "stress.semantics.scope", {
                  count: analysis.evidenceStress.evidenceIds.length,
                })}
              </p>
            </article>
          </section>
        </div>
      </details>
    </>
  );
}

function ViewHeading({
  eyebrow,
  title,
  subtitle,
  locale,
  action,
}: {
  eyebrow: TranslationKey;
  title: TranslationKey;
  subtitle: TranslationKey;
  locale: Locale;
  action?: React.ReactNode;
}) {
  return (
    <div className="view-heading">
      <div>
        <span className="eyebrow">{t(locale, eyebrow)}</span>
        <h1>{t(locale, title)}</h1>
        <p>{t(locale, subtitle)}</p>
      </div>
      {action}
    </div>
  );
}

function EvidenceView({
  thesisCase,
  analysis,
  locale,
  searchQuery,
  setSearchQuery,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: {
  thesisCase: ThesisCase;
  analysis: StressResult;
  locale: Locale;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onAdd: () => void;
  onEdit: (item: EvidenceItem) => void;
  onDelete: (item: EvidenceItem) => void;
  onToggle: (item: EvidenceItem) => void;
}) {
  const query = searchQuery.trim().toLocaleLowerCase(locale);
  const filtered = thesisCase.evidence.filter((item) => {
    const copy = localizedEvidence(item, thesisCase, locale);
    return [copy.title, copy.note, copy.source, item.group, item.originId]
      .join(" ")
      .toLocaleLowerCase(locale)
      .includes(query);
  });

  return (
    <>
      <ViewHeading
        eyebrow="nav.evidence"
        title="evidence.title"
        subtitle="evidence.subtitle"
        locale={locale}
        action={
          <button className="button primary" onClick={onAdd}>
            <Plus size={15} />
            {t(locale, "evidence.add.title")}
          </button>
        }
      />

      <div className="evidence-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t(locale, "evidence.searchPlaceholder")}
            aria-label={t(locale, "aria.searchEvidence")}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label={t(locale, "aria.clearSearch")}
            >
              <X size={14} />
            </button>
          )}
        </label>
        <span>
          {t(locale, "evidence.resultCount", { count: filtered.length })}
        </span>
      </div>

      <section className="evidence-list">
        {filtered.map((item) => {
          const copy = localizedEvidence(item, thesisCase, locale);
          const ablation = analysis.ablations.find(
            (result) => result.evidenceId === item.id,
          );
          return (
            <article
              className={`evidence-row ${item.enabled ? "" : "disabled"}`}
              key={item.id}
            >
              <button
                className={`check ${item.enabled ? "checked" : ""}`}
                onClick={() => onToggle(item)}
                aria-label={t(locale, "aria.toggleEvidence", {
                  action: t(
                    locale,
                    item.enabled ? "evidence.exclude" : "evidence.include",
                  ),
                  name: copy.title,
                })}
              >
                {item.enabled && <Check size={13} />}
              </button>
              <div className="evidence-main">
                <div className="evidence-titleline">
                  <strong>{copy.title}</strong>
                  <span className={`direction ${item.direction}`}>
                    {item.direction === "supports" ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                    {t(
                      locale,
                      item.direction === "supports"
                        ? "common.supports"
                        : "common.contradicts",
                    )}
                  </span>
                </div>
                <p>{copy.note}</p>
                <div className="provenance-line">
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                    <Link2 size={12} />
                    {copy.source}
                    <ExternalLink size={11} />
                  </a>
                  <span>{t(locale, groupKeys[item.group])}</span>
                  <span>{formatDate(item.asOf, locale)}</span>
                  {item.relation === "derived" &&
                  thesisCase.marketSnapshot ? (
                    <span>
                      {t(locale, "evidence.sameMarketDataset")}
                    </span>
                  ) : (
                    <>
                      {item.originId && (
                        <span>
                          {t(locale, "evidence.sourceGroupLabel", {
                            id: item.originId,
                          })}
                        </span>
                      )}
                      {item.claimId && (
                        <span>
                          {t(locale, "evidence.claimGroupLabel", {
                            id: item.claimId,
                          })}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="evidence-numbers">
                <span>
                  <small>{t(locale, "common.reliability")}</small>
                  {Math.round(item.reliability * 100)}%
                </span>
                <span>
                  <small>{t(locale, "evidence.column.declaredImpact")}</small>
                  {item.impact.toFixed(1)}
                </span>
                <span>
                  <small>{t(locale, "evidence.column.measuredImpact")}</small>
                  {signed(ablation?.delta ?? 0)}
                </span>
              </div>
              <div className="row-actions">
                <button
                  onClick={() => onEdit(item)}
                  aria-label={t(locale, "aria.editEvidence", {
                    name: copy.title,
                  })}
                >
                  <SlidersHorizontal size={15} />
                </button>
                <button
                  onClick={() => onDelete(item)}
                  aria-label={t(locale, "aria.deleteEvidence", {
                    name: copy.title,
                  })}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          );
        })}
        {!filtered.length && (
          <div className="empty-state">
            <Search size={24} />
            {t(
              locale,
              thesisCase.evidence.length
                ? "empty.evidenceSearch"
                : "empty.evidence",
            )}
          </div>
        )}
      </section>
    </>
  );
}

function AuditView({
  thesisCase,
  analysis,
  locale,
}: {
  thesisCase: ThesisCase;
  analysis: StressResult;
  locale: Locale;
}) {
  const audit = analysis.independenceAudit;

  return (
    <>
      <ViewHeading
        eyebrow="nav.audit"
        title="audit.title"
        subtitle="audit.subtitle"
        locale={locale}
      />

      <section className="audit-summary">
        <article>
          <span>{t(locale, "metrics.independentRoots")}</span>
          <strong>{audit.independentRootCount}</strong>
          <small>
            {t(locale, "audit.rawCount", {
              count: audit.enabledEvidenceCount,
            })}
          </small>
        </article>
        <article>
          <span>{t(locale, "audit.root.duplicate")}</span>
          <strong>{audit.duplicateCount}</strong>
          <small>{t(locale, "audit.dependencyWarning")}</small>
        </article>
        <article>
          <span>{t(locale, "audit.concentration")}</span>
          <strong>
            {Math.round(audit.concentrationHhi * 100)}
            <small>/100</small>
          </strong>
          <small>{t(locale, "audit.concentrationHelp")}</small>
        </article>
        <article>
          <span>{t(locale, "audit.stale")}</span>
          <strong>{audit.staleCount}</strong>
          <small>{t(locale, "audit.staleHelp")}</small>
        </article>
      </section>

      <section className="audit-grid">
        <article className="card root-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{t(locale, "audit.root.title")}</span>
              <h2>{t(locale, "audit.dependencyWarning")}</h2>
            </div>
            <span className="proof-chip">
              {t(locale, "audit.maximumGroupShare", {
                value: `${Math.round(audit.maximumRootShare * 100)}%`,
              })}
            </span>
          </div>
          <div className="root-list">
            {audit.roots.map((root, index) => {
              const items = root.evidenceIds
                .map((id) =>
                  thesisCase.evidence.find((item) => item.id === id),
                )
                .filter((item): item is EvidenceItem => Boolean(item));
              const first = items[0];
              const declaredOrigin = root.originIds[0];
              const declaredClaim = root.claimIds[0];
              const rootName =
                first?.relation === "derived" && thesisCase.marketSnapshot
                  ? t(locale, "evidence.sameMarketDataset")
                  : declaredOrigin
                    ? t(locale, "evidence.sourceGroupLabel", {
                        id: declaredOrigin,
                      })
                    : declaredClaim
                      ? t(locale, "evidence.claimGroupLabel", {
                          id: declaredClaim,
                      })
                    : first
                      ? localizedEvidence(first, thesisCase, locale).source
                      : root.id;
              return (
                <div className="root-row" key={root.id}>
                  <span className="root-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="root-content">
                    <div>
                      <strong>{rootName}</strong>
                      <span>
                        {t(locale, "common.items", {
                          count: root.evidenceIds.length,
                        })}
                      </span>
                    </div>
                    <p>
                      {items
                        .slice(0, 2)
                        .map(
                          (item) =>
                            localizedEvidence(item, thesisCase, locale).title,
                        )
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="root-share">
                    <strong>
                      {Math.round(root.shareOfAbsoluteContribution * 100)}%
                    </strong>
                    <span
                      className={
                        root.directions.length > 1 ? "conflict" : "clean"
                      }
                    >
                      {root.directions.length > 1
                        ? `${t(locale, "common.supports")} / ${t(locale, "common.contradicts")}`
                        : t(
                            locale,
                            root.directions[0] === "contradicts"
                              ? "common.contradicts"
                              : "common.supports",
                          )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="card shock-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {t(locale, "audit.shocks.title")}
              </span>
              <h2>{t(locale, "audit.shocks.description")}</h2>
            </div>
          </div>
          <div className="shock-list">
            {audit.sourceShocks.map((shock) => (
              <div className="shock-row" key={shock.group}>
                <div>
                  <strong>{t(locale, groupKeys[shock.group])}</strong>
                  <small>
                    {t(locale, "common.items", {
                      count: shock.evidenceCount,
                    })}
                  </small>
                </div>
                <span className="shock-track">
                  <i
                    className={shock.delta >= 0 ? "positive" : "negative"}
                    style={{
                      width: `${Math.min(100, Math.abs(shock.delta) * 7)}%`,
                    }}
                  />
                </span>
                <strong className={shock.delta >= 0 ? "positive" : "negative"}>
                  {signed(shock.delta)}
                </strong>
                <span className={`posture-tag ${shock.resultingPosture.toLowerCase()}`}>
                  {t(locale, postureKeys[shock.resultingPosture])}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function HistoryView({
  thesisCase,
  analysis,
  snapshots,
  locale,
  onSnapshot,
  onRestore,
  onExport,
  onImport,
  onReset,
  onCopy,
}: {
  thesisCase: ThesisCase;
  analysis: StressResult;
  snapshots: Snapshot[];
  locale: Locale;
  onSnapshot: () => void;
  onRestore: (snapshot: Snapshot) => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
  onCopy: (value: string) => void;
}) {
  return (
    <>
      <ViewHeading
        eyebrow="nav.history"
        title="history.title"
        subtitle="history.subtitle"
        locale={locale}
        action={
          <button className="button primary" onClick={onSnapshot}>
            <History size={15} />
            {t(locale, "history.snapshot.save")}
          </button>
        }
      />

      <section className="history-tools" aria-label={t(locale, "aria.snapshotActions")}>
        <button className="button secondary" onClick={onExport}>
          <Download size={15} />
          {t(locale, "history.export.action")}
        </button>
        <button className="button secondary" onClick={onImport}>
          <Import size={15} />
          {t(locale, "history.import.action")}
        </button>
        <button className="button ghost danger" onClick={onReset}>
          <Search size={14} />
          {marketUi(locale).changeStock}
        </button>
      </section>

      <section className="snapshot-list">
        {snapshots.length ? (
          snapshots.map((snapshot, index) => {
            const scoreDelta = analysis.score - snapshot.score;
            const stabilityDelta =
              analysis.stabilityScore - snapshot.stability;
            return (
              <article className="snapshot-row" key={snapshot.id}>
                <span className="snapshot-index">
                  {String(snapshots.length - index).padStart(2, "0")}
                </span>
                <div className="snapshot-main">
                  <div>
                    <strong>{snapshot.label}</strong>
                    <time>
                      {t(locale, "history.snapshot.savedAt", {
                        date: formatDate(snapshot.createdAt, locale, true),
                      })}
                    </time>
                  </div>
                  <div className="snapshot-stats">
                    <span>
                      {t(locale, "common.score")}{" "}
                      <strong>{snapshot.score.toFixed(1)}</strong>{" "}
                      <em>{signed(scoreDelta)}</em>
                    </span>
                    <span>
                      {t(locale, "metrics.stability")}{" "}
                      <strong>{snapshot.stability}</strong>{" "}
                      <em>{signed(stabilityDelta, 0)}</em>
                    </span>
                    <span>
                      {t(locale, "common.evidence")}{" "}
                      <strong>{snapshot.evidenceCount}</strong>
                    </span>
                  </div>
                  <div className="fingerprint">
                    <code title={snapshot.hash}>{snapshot.hash}</code>
                    <button
                      onClick={() => onCopy(snapshot.hash)}
                      aria-label={t(locale, "action.copy")}
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
                <button
                  className="button secondary"
                  onClick={() => onRestore(snapshot)}
                >
                  <RefreshCcw size={14} />
                  {t(locale, "action.restore")}
                </button>
              </article>
            );
          })
        ) : (
          <div className="empty-state large">
            <History size={28} />
            <strong>{t(locale, "empty.history")}</strong>
            <span>{t(locale, "history.subtitle")}</span>
          </div>
        )}
      </section>

      <p className="history-boundary">
        <ShieldCheck size={14} />
        {thesisCase.modelVersion} · {t(locale, "method.disclaimer.body")}
      </p>
    </>
  );
}

function MethodView({ locale }: { locale: Locale }) {
  const cards: {
    number: string;
    title: TranslationKey;
    body: TranslationKey;
    formula: TranslationKey;
  }[] = [
    {
      number: "01",
      title: "method.score.title",
      body: "method.score.body",
      formula: "method.formula.score",
    },
    {
      number: "02",
      title: "method.independence.title",
      body: "method.independence.body",
      formula: "method.formula.dependencies",
    },
    {
      number: "03",
      title: "method.flip.title",
      body: "method.flip.body",
      formula: "method.formula.groups",
    },
    {
      number: "04",
      title: "method.cliff.title",
      body: "method.cliff.body",
      formula: "method.formula.oneVariable",
    },
    {
      number: "05",
      title: "method.frontier.title",
      body: "method.frontier.body",
      formula: "method.formula.twoVariable",
    },
    {
      number: "06",
      title: "method.semantics.title",
      body: "method.semantics.body",
      formula: "method.formula.modes",
    },
  ];

  return (
    <>
      <ViewHeading
        eyebrow="nav.method"
        title="method.title"
        subtitle="method.subtitle"
        locale={locale}
      />
      <section className="method-grid">
        {cards.map((card) => (
          <article className="method-card" key={card.number}>
            <span>{card.number}</span>
            <h2>{t(locale, card.title)}</h2>
            <p>{t(locale, card.body)}</p>
            <code>{t(locale, card.formula)}</code>
          </article>
        ))}
      </section>
      <section className="boundary-card">
        <ShieldCheck size={21} />
        <div>
          <h2>{t(locale, "method.boundary.title")}</h2>
          <p>{t(locale, "method.boundary.body")}</p>
          <p>
            {t(locale, "method.disclaimer.body")}{" "}
            {t(locale, "method.disclaimer.noBrokerage")}{" "}
            {t(locale, "method.disclaimer.verify")}
          </p>
        </div>
      </section>
    </>
  );
}

type EvidenceDefaults = {
  direction?: EvidenceDirection;
  group?: EvidenceGroup;
};

const defaultOriginId = (sourceUrl: string) => {
  return `source:${canonicalEvidenceSource(sourceUrl)}`.slice(0, 120);
};

const SIMPLE_EVIDENCE_COPY: Record<
  Locale,
  {
    relationship: string;
    relationshipHelp: string;
    noRelationship: string;
    details: string;
    importance: string;
    importanceOptions: Record<"pivotal" | "material" | "context", string>;
    verification: string;
    verificationPrompt: string;
    verificationRequired: string;
    verificationOptions: Record<
      "original" | "reviewed" | "unverified",
      string
    >;
  }
> = {
  en: {
    relationship: "Does this repeat the same underlying source?",
    relationshipHelp:
      "Choose another item only when both ultimately trace to the same document, dataset, interview, or republication chain.",
    noRelationship: "No known relationship",
    details: "Optional classification details",
    importance: "Role in your thesis",
    importanceOptions: {
      pivotal: "Pivotal — the claim depends on it",
      material: "Important — it could change the claim",
      context: "Context — useful background only",
    },
    verification: "How you checked it",
    verificationPrompt: "Select how you checked this material",
    verificationRequired:
      "Select how you checked this material before saving it.",
    verificationOptions: {
      original: "Read the original document",
      reviewed: "Checked a reliable secondary source",
      unverified: "Not independently checked yet",
    },
  },
  "zh-CN": {
    relationship: "这项材料是否重复了已有材料的同一底层来源？",
    relationshipHelp:
      "只有在两项材料最终来自同一文件、数据集、采访或转载链时才选择已有材料。",
    noRelationship: "暂未发现关联",
    details: "可选分类信息",
    importance: "它在判断中的作用",
    importanceOptions: {
      pivotal: "关键：没有它就难以支持判断",
      material: "重要：它可能明显改变判断",
      context: "背景：只提供补充信息",
    },
    verification: "你如何核查它",
    verificationPrompt: "请选择你对这项材料的核查方式",
    verificationRequired: "保存前请选择你对这项材料的核查方式。",
    verificationOptions: {
      original: "已阅读原始文件",
      reviewed: "已核对可靠二手来源",
      unverified: "尚未独立核查",
    },
  },
  ja: {
    relationship: "既存資料と同じ底層ソースを繰り返していますか？",
    relationshipHelp:
      "同じ文書、データセット、インタビュー、転載経路に由来する場合のみ選択してください。",
    noRelationship: "既知の関連なし",
    details: "任意の分類情報",
    importance: "仮説での役割",
    importanceOptions: {
      pivotal: "中核：仮説がこれに依存",
      material: "重要：仮説を大きく変え得る",
      context: "背景：補足情報のみ",
    },
    verification: "確認方法",
    verificationPrompt: "この資料の確認方法を選択",
    verificationRequired: "保存する前に確認方法を選択してください。",
    verificationOptions: {
      original: "原資料を確認済み",
      reviewed: "信頼できる二次資料を確認",
      unverified: "未確認",
    },
  },
  es: {
    relationship: "¿Repite la misma fuente subyacente?",
    relationshipHelp:
      "Elige otro elemento solo si ambos proceden del mismo documento, conjunto de datos, entrevista o cadena de republicación.",
    noRelationship: "Sin relación conocida",
    details: "Clasificación opcional",
    importance: "Papel en tu tesis",
    importanceOptions: {
      pivotal: "Esencial — la tesis depende de ello",
      material: "Importante — podría cambiar la tesis",
      context: "Contexto — solo información de fondo",
    },
    verification: "Cómo lo comprobaste",
    verificationPrompt: "Selecciona cómo comprobaste este material",
    verificationRequired:
      "Selecciona cómo comprobaste este material antes de guardarlo.",
    verificationOptions: {
      original: "Leí el documento original",
      reviewed: "Revisé una fuente secundaria fiable",
      unverified: "Aún no lo verifiqué",
    },
  },
};

function EvidenceModal({
  locale,
  initial,
  defaults,
  evidenceItems,
  onClose,
  onSave,
}: {
  locale: Locale;
  initial: EvidenceItem | null;
  defaults?: EvidenceDefaults;
  evidenceItems: EvidenceItem[];
  onClose: () => void;
  onSave: (item: EvidenceItem) => void;
}) {
  const simpleCopy = SIMPLE_EVIDENCE_COPY[locale];
  const initialImportance =
    (initial?.impact ?? 3) >= 5
      ? "pivotal"
      : (initial?.impact ?? 3) <= 1
        ? "context"
        : "material";
  const initialVerification = initial?.verification ?? "";
  const [direction, setDirection] = useState<EvidenceDirection>(
    initial?.direction ?? defaults?.direction ?? "contradicts",
  );
  const [error, setError] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);
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
    const title = String(form.get("title") ?? "").trim();
    const source = String(form.get("source") ?? "").trim();
    const sourceUrl = String(form.get("sourceUrl") ?? "").trim();
    const asOf = String(form.get("asOf") ?? "").trim();
    const group = String(form.get("group") ?? "") as EvidenceGroup;
    const note = String(form.get("note") ?? "").trim();
    const relatedToId = String(form.get("relatedToId") ?? "").trim();
    const importance = String(form.get("importance") ?? "material") as
      | "pivotal"
      | "material"
      | "context";
    const verification = String(form.get("verification") ?? "") as
      | "original"
      | "reviewed"
      | "unverified"
      | "";

    if (!title) {
      setError(t(locale, "evidence.validation.titleRequired"));
      return;
    }
    if (!source) {
      setError(t(locale, "evidence.validation.sourceRequired"));
      return;
    }
    if (!isHttpUrl(sourceUrl)) {
      setError(t(locale, "evidence.validation.urlInvalid"));
      return;
    }
    if (!asOf) {
      setError(t(locale, "evidence.validation.dateRequired"));
      return;
    }
    if (
      !["original", "reviewed", "unverified"].includes(verification)
    ) {
      setError(simpleCopy.verificationRequired);
      return;
    }
    const selectedVerification = verification as
      | "original"
      | "reviewed"
      | "unverified";
    const impactByImportance = {
      pivotal: 6,
      material: 3,
      context: 1,
    } as const;
    const reliabilityByVerification = {
      original: 1,
      reviewed: 0.75,
      unverified: 0.4,
    } as const;

    onSave({
      id: initial?.id ?? `ev-${Date.now()}`,
      title,
      source,
      sourceUrl,
      asOf,
      group,
      direction,
      impact: impactByImportance[importance] ?? 3,
      reliability:
        reliabilityByVerification[selectedVerification] ?? 0.75,
      note,
      enabled: initial?.enabled ?? true,
      originId: defaultOriginId(sourceUrl),
      claimId: initial?.claimId,
      dependsOnIds: initial?.dependsOnIds,
      sameSourceAsIds: relatedToId ? [relatedToId] : undefined,
      relation: initial?.relation ?? "direct",
      verification: selectedVerification,
      provenance: initial?.provenance ?? "user",
    });
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              {t(
                locale,
                initial ? "evidence.edit.subtitle" : "evidence.add.subtitle",
              )}
            </span>
            <h2 id="evidence-modal-title">
              {t(
                locale,
                initial ? "evidence.edit.title" : "evidence.add.title",
              )}
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label={t(locale, "aria.closeDialog")}
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit}>
          <label className="field">
            <span>{t(locale, "evidence.form.title")}</span>
            <input
              ref={firstFieldRef}
              name="title"
              required
              maxLength={500}
              defaultValue={initial?.title}
              placeholder={t(locale, "evidence.form.titlePlaceholder")}
            />
          </label>
          <div className="form-grid">
            <label className="field">
              <span>{t(locale, "evidence.form.source")}</span>
              <input
                name="source"
                required
                maxLength={300}
                defaultValue={initial?.source}
                placeholder={t(locale, "evidence.form.sourcePlaceholder")}
              />
            </label>
            <label className="field">
              <span>{t(locale, "evidence.form.sourceGroup")}</span>
              <select
                name="group"
                defaultValue={
                  initial?.group ?? defaults?.group ?? "External estimate"
                }
              >
                {(Object.keys(groupKeys) as EvidenceGroup[]).map((group) => (
                  <option key={group} value={group}>
                    {t(locale, groupKeys[group])}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-grid">
            <label className="field wide">
              <span>{t(locale, "evidence.form.sourceUrl")}</span>
              <input
                name="sourceUrl"
                type="url"
                required
                maxLength={2048}
                defaultValue={initial?.sourceUrl}
                placeholder={t(locale, "evidence.form.sourceUrlPlaceholder")}
              />
            </label>
            <label className="field">
              <span>{t(locale, "evidence.form.asOf")}</span>
              <input
                name="asOf"
                type="date"
                required
                defaultValue={
                  initial?.asOf ?? new Date().toISOString().slice(0, 10)
                }
              />
            </label>
          </div>
          <fieldset className="field">
            <legend>{t(locale, "evidence.form.direction")}</legend>
            <div className="segmented">
              {(["supports", "contradicts"] as EvidenceDirection[]).map(
                (value) => (
                  <button
                    type="button"
                    key={value}
                    className={direction === value ? "active" : ""}
                    onClick={() => setDirection(value)}
                    aria-pressed={direction === value}
                  >
                    {t(
                      locale,
                      value === "supports"
                        ? "common.supports"
                        : "common.contradicts",
                    )}
                  </button>
                ),
              )}
            </div>
          </fieldset>
          <label className="field">
            <span>{simpleCopy.relationship}</span>
            <select
              name="relatedToId"
              defaultValue={initial?.sameSourceAsIds?.[0] ?? ""}
            >
              <option value="">{simpleCopy.noRelationship}</option>
              {evidenceItems
                .filter(
                  (item) =>
                    item.id !== initial?.id &&
                    item.relation !== "derived" &&
                    item.provenance !== "system-market",
                )
                .map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.title}
                  </option>
                ))}
            </select>
            <small>{simpleCopy.relationshipHelp}</small>
          </label>
          <label className="field">
            <span>{t(locale, "evidence.form.note")}</span>
            <textarea
              name="note"
              rows={3}
              maxLength={2000}
              defaultValue={initial?.note}
              placeholder={t(locale, "evidence.form.notePlaceholder")}
            />
          </label>
          <label className="field">
            <span>{simpleCopy.verification}</span>
            <select
              name="verification"
              defaultValue={initialVerification}
              required
            >
              <option value="" disabled>
                {simpleCopy.verificationPrompt}
              </option>
              {(
                ["original", "reviewed", "unverified"] as const
              ).map((value) => (
                <option value={value} key={value}>
                  {simpleCopy.verificationOptions[value]}
                </option>
              ))}
            </select>
          </label>
          <details className="evidence-entry-details">
            <summary>{simpleCopy.details}</summary>
            <div>
              <label className="field">
                <span>{simpleCopy.importance}</span>
                <select
                  name="importance"
                  defaultValue={initialImportance}
                >
                  {(
                    ["pivotal", "material", "context"] as const
                  ).map((value) => (
                    <option value={value} key={value}>
                      {simpleCopy.importanceOptions[value]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </details>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="button ghost" onClick={onClose}>
              {t(locale, "action.cancel")}
            </button>
            <button type="submit" className="button primary">
              <Check size={15} />
              {t(
                locale,
                initial
                  ? "evidence.form.saveEdit"
                  : "evidence.form.saveAdd",
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeView, setActiveView] = useState<View>("stress");
  const [guideReturnView, setGuideReturnView] =
    useState<Exclude<View, "guide">>("stress");
  const [thesisCase, setThesisCase] = useState<ThesisCase | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [locale, setLocale] = useState<Locale>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEvidence, setEditingEvidence] =
    useState<EvidenceItem | null>(null);
  const [evidenceDefaults, setEvidenceDefaults] =
    useState<EvidenceDefaults>();
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showResearchPlanModal, setShowResearchPlanModal] = useState(false);
  const [refreshingMarket, setRefreshingMarket] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const guideButtonRef = useRef<HTMLButtonElement>(null);
  const analysis = useMemo(
    () => (thesisCase ? runStressTest(thesisCase) : null),
    [thesisCase],
  );
  const readiness = useMemo(
    () => (thesisCase ? assessResearchReadiness(thesisCase) : null),
    [thesisCase],
  );
  const caseSnapshots = useMemo(
    () =>
      thesisCase
        ? snapshots.filter(
            (snapshot) =>
              snapshot.caseState.ticker === thesisCase.ticker,
          )
        : [],
    [snapshots, thesisCase],
  );

  useEffect(() => {
    const loadStoredState = window.setTimeout(() => {
      try {
        const storedCase =
          window.localStorage.getItem(CASE_STORAGE_KEY) ??
          window.localStorage.getItem(LEGACY_CASE_STORAGE_KEY);
        const storedSnapshots =
          window.localStorage.getItem(SNAPSHOT_STORAGE_KEY);
        const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);

        if (storedCase) {
          const parsed = JSON.parse(storedCase);
          if (isThesisCase(parsed) && !parsed.isDemo) {
            setThesisCase(normalizeMarketCase(parsed));
          }
          window.localStorage.removeItem(LEGACY_CASE_STORAGE_KEY);
        }
        if (storedSnapshots) {
          const parsed = JSON.parse(storedSnapshots);
          if (Array.isArray(parsed)) {
            setSnapshots(parsed.filter(isSnapshot));
          }
        }
        setLocale(
          resolveLocale(
            storedLocale || navigator.languages || navigator.language,
          ),
        );
      } catch {
        try {
          window.localStorage.removeItem(CASE_STORAGE_KEY);
          window.localStorage.removeItem(LEGACY_CASE_STORAGE_KEY);
          window.localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
        } catch {
          // Continue with an in-memory workspace when storage is unavailable.
        }
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(loadStoredState);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    if (!hydrated) return;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Language switching remains usable even when browser storage is blocked.
    }
  }, [hydrated, locale]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (thesisCase) {
        window.localStorage.setItem(
          CASE_STORAGE_KEY,
          JSON.stringify(thesisCase),
        );
      } else {
        window.localStorage.removeItem(CASE_STORAGE_KEY);
      }
      window.localStorage.setItem(
        SNAPSHOT_STORAGE_KEY,
        JSON.stringify(snapshots),
      );
    } catch {
      // The active in-memory workspace remains usable when storage is blocked
      // or its browser quota is exhausted.
    }
  }, [hydrated, snapshots, thesisCase]);

  const createSnapshot = async (stayOnCurrentView = false) => {
    if (!thesisCase || !analysis) return;
    const hash = await sha256(thesisCase);
    const now = new Date().toISOString();
    setSnapshots((current) =>
      [
        {
          id: `snapshot-${Date.now()}`,
          createdAt: now,
          score: analysis.score,
          posture: analysis.posture,
          stability: analysis.stabilityScore,
          hash,
          evidenceCount: thesisCase.evidence.filter((item) => item.enabled)
            .length,
          label: `${thesisCase.ticker} · ${formatDate(now, locale)}`,
          modelVersion: thesisCase.modelVersion,
          parentHash: current.find(
            (snapshot) =>
              snapshot.caseState.ticker === thesisCase.ticker,
          )?.hash,
          caseState: structuredClone(thesisCase),
        },
        ...current,
      ].slice(0, 30),
    );
    if (!stayOnCurrentView) setActiveView("history");
  };

  const saveEvidence = (item: EvidenceItem) => {
    if (!thesisCase) return;
    const exists = thesisCase.evidence.some(
      (evidence) => evidence.id === item.id,
    );
    const nextCase: ThesisCase = {
      ...thesisCase,
      evidence: exists
        ? thesisCase.evidence.map((evidence) =>
            evidence.id === item.id ? item : evidence,
          )
        : [...thesisCase.evidence, item],
      lastUpdated: new Date().toISOString(),
    };
    if (!isThesisCase(nextCase)) {
      window.alert(t(locale, "error.invalidCase"));
      return;
    }
    setThesisCase(nextCase);
    setEditingEvidence(null);
    setEvidenceDefaults(undefined);
    setShowEvidenceModal(false);
    setActiveView("stress");
  };

  const openAddEvidence = (defaults?: EvidenceDefaults) => {
    if (!thesisCase) return;
    if (thesisCase.evidence.length >= 40) {
      window.alert(t(locale, "error.evidenceLimit"));
      return;
    }
    setEditingEvidence(null);
    setEvidenceDefaults(defaults);
    setShowEvidenceModal(true);
  };

  const toggleEvidence = (item: EvidenceItem) => {
    if (!thesisCase) return;
    setThesisCase({
      ...thesisCase,
      evidence: thesisCase.evidence.map((evidence) =>
        evidence.id === item.id
          ? { ...evidence, enabled: !evidence.enabled }
          : evidence,
      ),
      lastUpdated: new Date().toISOString(),
    });
  };

  const deleteEvidence = (item: EvidenceItem) => {
    if (!thesisCase) return;
    const name = localizedEvidence(item, thesisCase, locale).title;
    if (!window.confirm(`${t(locale, "action.delete")} “${name}”?`)) return;
    setThesisCase({
      ...thesisCase,
      evidence: thesisCase.evidence
        .filter((evidence) => evidence.id !== item.id)
        .map((evidence) => {
          if (
            !evidence.dependsOnIds?.includes(item.id) &&
            !evidence.sameSourceAsIds?.includes(item.id)
          ) {
            return evidence;
          }
          const dependsOnIds = evidence.dependsOnIds?.filter(
            (dependencyId) => dependencyId !== item.id,
          );
          const sameSourceAsIds = evidence.sameSourceAsIds?.filter(
            (relatedId) => relatedId !== item.id,
          );
          return {
            ...evidence,
            dependsOnIds:
              dependsOnIds && dependsOnIds.length > 0
                ? dependsOnIds
                : undefined,
            sameSourceAsIds:
              sameSourceAsIds && sameSourceAsIds.length > 0
                ? sameSourceAsIds
                : undefined,
          };
        }),
      lastUpdated: new Date().toISOString(),
    });
  };

  const exportCase = () => {
    if (!thesisCase) return;
    const blob = new Blob([JSON.stringify(thesisCase, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${thesisCase.ticker.toLowerCase()}-falsifi-case.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importCase = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      window.alert(
        t(locale, "error.importTooLarge", { max: "2 MB" }),
      );
      if (importRef.current) importRef.current.value = "";
      return;
    }
    try {
      const parsed = JSON.parse(await file.text());
      if (!isThesisCase(parsed) || parsed.isDemo) {
        throw new Error("Invalid case schema");
      }
      if (
        thesisCase &&
        !window.confirm(
          t(locale, "history.import.confirm", {
            name: parsed.company,
          }),
        )
      ) {
        return;
      }
      setThesisCase(normalizeMarketCase(parsed));
      setSearchQuery("");
      setActiveView("stress");
    } catch {
      window.alert(t(locale, "error.invalidCase"));
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const saveResearchPlan = ({
    thesis,
    horizon,
    researchPlan,
  }: {
    thesis: string;
    horizon: string;
    researchPlan: NonNullable<ThesisCase["researchPlan"]>;
  }) => {
    if (!thesisCase) return;
    const hasManualEvidence = thesisCase.evidence.some(
      (item) => item.relation !== "derived",
    );
    setThesisCase({
      ...thesisCase,
      thesis,
      horizon,
      researchPlan,
      lastUpdated: new Date().toISOString(),
    });
    setShowResearchPlanModal(false);
    if (!hasManualEvidence) {
      setEditingEvidence(null);
      setEvidenceDefaults({
        group: "Official filing",
        direction: "supports",
      });
      setShowEvidenceModal(true);
    }
  };

  const refreshCurrentMarket = async () => {
    if (!thesisCase?.marketSnapshot || refreshingMarket) return;
    const symbol = thesisCase.marketSnapshot.symbol;
    setRefreshingMarket(true);
    try {
      const params = new URLSearchParams({
        symbol,
        name: thesisCase.company,
      });
      const response = await fetch(`/api/stocks/quote?${params}`);
      if (!response.ok) throw new Error("Market refresh failed");
      const body = (await response.json()) as { snapshot?: unknown };
      if (!isMarketSnapshot(body.snapshot)) {
        throw new Error("Invalid market snapshot");
      }
      const snapshot = body.snapshot;
      setThesisCase((current) =>
        current?.ticker === symbol
          ? refreshMarketCase(current, snapshot, locale)
          : current,
      );
    } catch {
      window.alert(marketUi(locale).unavailable);
    } finally {
      setRefreshingMarket(false);
    }
  };

  const handleReadinessAction = (action: ReadinessAction) => {
    if (
      action === "define-case" ||
      action === "add-invalidation" ||
      action === "set-review-date"
    ) {
      setShowResearchPlanModal(true);
      return;
    }
    if (action === "save-baseline") {
      void createSnapshot(true);
      return;
    }

    if (action === "add-primary-source") {
      openAddEvidence({
        group: "Official filing",
        direction: "supports",
      });
    } else if (action === "add-counter-evidence") {
      openAddEvidence({
        group: "External estimate",
        direction: "contradicts",
      });
    } else {
      openAddEvidence({
        group: "External estimate",
        direction: "supports",
      });
    }
  };

  const selectStock = (
    stock: StockSearchResult,
    thesisDraft: string,
    snapshot?: MarketSnapshot,
  ) => {
    const starterCase = buildResearchCase(stock, locale, snapshot);
    const horizon: Record<Locale, string> = {
      en: "12 months",
      "zh-CN": "12 个月",
      ja: "12か月",
      es: "12 meses",
    };
    setThesisCase({
      ...starterCase,
      thesis: thesisDraft.trim(),
      horizon: horizon[locale],
      researchPlan: {
        purpose: "new-research",
        thesisConfirmed: true,
        invalidationCriteria: "",
        nextReviewDate: "",
      },
      lastUpdated: new Date().toISOString(),
    });
    setSearchQuery("");
    setEditingEvidence(null);
    setEvidenceDefaults(undefined);
    setShowEvidenceModal(false);
    setShowResearchPlanModal(true);
    setActiveView("stress");
  };

  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setThesisCase((current) =>
      current?.marketSnapshot
        ? relocalizeMarketCase(current, nextLocale)
        : current,
    );
  };

  const changeStock = () => {
    if (
      thesisCase &&
      !window.confirm(t(locale, "history.changeStockConfirm"))
    ) {
      return;
    }
    setThesisCase(null);
    setSearchQuery("");
    setEditingEvidence(null);
    setEvidenceDefaults(undefined);
    setShowEvidenceModal(false);
    setShowResearchPlanModal(false);
    setActiveView("stress");
  };

  const openGuide = () => {
    if (activeView !== "guide") {
      setGuideReturnView(activeView);
    }
    setActiveView("guide");
  };

  const closeGuide = () => {
    setActiveView(thesisCase ? guideReturnView : "stress");
    window.requestAnimationFrame(() => guideButtonRef.current?.focus());
  };

  const restoreSnapshot = (snapshot: Snapshot) => {
    if (
      !window.confirm(
        t(locale, "history.snapshot.restoreConfirm", {
          name: snapshot.label,
        }),
      )
    ) {
      return;
    }
    setThesisCase(
      normalizeMarketCase(structuredClone(snapshot.caseState)),
    );
    setSearchQuery("");
    setActiveView("stress");
  };

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      window.alert(t(locale, "error.clipboard"));
    }
  };

  return (
    <div className="app-shell">
      <AppHeader
        activeView={activeView}
        locale={locale}
        thesisCase={thesisCase}
        onHome={() => setActiveView("stress")}
        onChangeLocale={changeLocale}
        onChangeStock={changeStock}
        onOpenGuide={openGuide}
        guideButtonRef={guideButtonRef}
      />

      <main
        id="main-content"
        className={`page ${
          !thesisCase && activeView !== "guide" ? "picker-page" : ""
        }`}
      >
        {activeView === "guide" ? (
          <UserGuide
            locale={locale}
            hasCase={Boolean(thesisCase)}
            onClose={closeGuide}
          />
        ) : !thesisCase || !analysis || !readiness ? (
          <StockPicker
            locale={locale}
            onSelect={selectStock}
            onImport={() => importRef.current?.click()}
          />
        ) : (
          <>
            {activeView === "stress" && (
              <FalsifyWorkspace
                thesisCase={thesisCase}
                readiness={readiness}
                locale={locale}
                refreshing={refreshingMarket}
                onEditPlan={() => setShowResearchPlanModal(true)}
                onNextAction={handleReadinessAction}
                onAddEvidence={() => openAddEvidence()}
                onEditEvidence={(item) => {
                  setEditingEvidence(item);
                  setEvidenceDefaults(undefined);
                  setShowEvidenceModal(true);
                }}
                onRefresh={() => void refreshCurrentMarket()}
                onSaveReview={() => void createSnapshot(true)}
              />
            )}
            {activeView === "evidence" && (
              <EvidenceView
                thesisCase={thesisCase}
                analysis={analysis}
                locale={locale}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onAdd={() => openAddEvidence()}
                onEdit={(item) => {
                  setEditingEvidence(item);
                  setEvidenceDefaults(undefined);
                  setShowEvidenceModal(true);
                }}
                onDelete={deleteEvidence}
                onToggle={toggleEvidence}
              />
            )}
            {activeView === "audit" && (
              <AuditView
                thesisCase={thesisCase}
                analysis={analysis}
                locale={locale}
              />
            )}
            {activeView === "history" && (
              <HistoryView
                thesisCase={thesisCase}
                analysis={analysis}
                snapshots={caseSnapshots}
                locale={locale}
                onSnapshot={() => void createSnapshot()}
                onRestore={restoreSnapshot}
                onExport={exportCase}
                onImport={() => importRef.current?.click()}
                onReset={changeStock}
                onCopy={copyText}
              />
            )}
            {activeView === "method" && <MethodView locale={locale} />}
          </>
        )}
      </main>

      <footer className="app-footer">
        <span>
          <ShieldCheck size={13} />
          {thesisCase
            ? thesisCase.marketSnapshot
              ? marketUi(locale).realData
              : t(
                  locale,
                  thesisCase.isDemo ? "app.demoCase" : "app.localCase",
                )
            : marketUi(locale).realData}{" "}
          ·{" "}
          {t(locale, "method.disclaimer.body")}
        </span>
        <span>{t(locale, "app.openSourceLocal")}</span>
      </footer>

      <input
        ref={importRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(event) => importCase(event.target.files?.[0])}
      />

      {showEvidenceModal && thesisCase && (
        <EvidenceModal
          locale={locale}
          initial={editingEvidence}
          defaults={evidenceDefaults}
          evidenceItems={thesisCase.evidence.filter(
            (item) => item.relation !== "derived",
          )}
          onClose={() => {
            setEditingEvidence(null);
            setEvidenceDefaults(undefined);
            setShowEvidenceModal(false);
          }}
          onSave={saveEvidence}
        />
      )}

      {showResearchPlanModal && thesisCase && (
        <ResearchPlanModal
          thesisCase={thesisCase}
          locale={locale}
          onClose={() => setShowResearchPlanModal(false)}
          onSave={saveResearchPlan}
        />
      )}
    </div>
  );
}
