"use client";

import {
  Check,
  ExternalLink,
  FileSearch,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { EvidenceItem, ThesisCase } from "@/lib/falsifi";
import type { Locale } from "@/lib/i18n";
import {
  isCandidateAlreadyAdded,
  isMaterialCandidate,
  type MaterialCandidate,
} from "@/lib/materials";

type FinderCopy = {
  title: string;
  subtitle: string;
  searchLabel: string;
  searchPlaceholder: string;
  search: string;
  searching: string;
  notice: string;
  privacy: string;
  noResults: string;
  unavailable: string;
  openPage: string;
  unverified: string;
  alreadyAdded: string;
  selectAll: string;
  clear: string;
  selected: (count: number) => string;
  add: (count: number) => string;
  cancel: string;
  limit: (count: number) => string;
  provider: (providers: string) => string;
  filing: string;
  news: string;
  selectItem: (title: string) => string;
};

const COPY: Record<Locale, FinderCopy> = {
  en: {
    title: "Search public sources",
    subtitle: "Review the pages first, then choose what to add.",
    searchLabel: "Search terms",
    searchPlaceholder: "Company, ticker, or keywords",
    search: "Search",
    searching: "Searching…",
    notice:
      "These are candidate sources. Open the original page to check it. Nothing is added until you select and confirm it.",
    privacy:
      "For A-shares, the ticker is sent to CNINFO. The company name, ticker, and search terms are sent to Yahoo Finance. Your claim is never sent.",
    noResults: "No matching pages found. Try different keywords.",
    unavailable:
      "Search is unavailable right now. You can still add material manually.",
    openPage: "Open page",
    unverified: "Unverified",
    alreadyAdded: "Already added",
    selectAll: "Select all",
    clear: "Clear",
    selected: (count) => `${count} selected`,
    add: (count) => `Add ${count}`,
    cancel: "Cancel",
    limit: (count) => `You can add up to ${count} more.`,
    provider: (providers) => `Sources: ${providers}`,
    filing: "Company filing",
    news: "News",
    selectItem: (title) => `Select: ${title}`,
  },
  "zh-CN": {
    title: "帮我找材料",
    subtitle: "选中需要的材料，再加入。",
    searchLabel: "搜索词",
    searchPlaceholder: "公司名、股票代码或关键词",
    search: "搜索",
    searching: "正在搜索…",
    notice: "加入前请查看原文，确认内容与这只股票有关。",
    privacy:
      "A 股代码会发送给巨潮资讯；公司名、代码和搜索词会发送给 Yahoo Finance。不会发送你的判断。",
    noResults: "没有找到匹配网页。换个关键词试试。",
    unavailable: "暂时无法搜索。你仍可以手动添加材料。",
    openPage: "查看原文",
    unverified: "待核对",
    alreadyAdded: "已在材料中",
    selectAll: "全选",
    clear: "清空",
    selected: (count) => `已选 ${count} 条`,
    add: (count) => `确认加入 ${count} 条`,
    cancel: "取消",
    limit: (count) => `还可以加入 ${count} 条。`,
    provider: (providers) => `来源：${providers}`,
    filing: "公司公告",
    news: "新闻",
    selectItem: (title) => `选择：${title}`,
  },
  ja: {
    title: "公開資料を検索",
    subtitle: "ページを確認してから、追加する資料を選びます。",
    searchLabel: "検索キーワード",
    searchPlaceholder: "企業名、銘柄コード、キーワード",
    search: "検索",
    searching: "検索中…",
    notice:
      "結果は古い、重複している、またはログインが必要な場合があります。ページを開いて確認してください。選択して確定するまで追加されません。",
    privacy:
      "中国A株のコードはCNINFOに送信されます。企業名、コード、検索語はYahoo Financeに送信されます。仮説は送信されません。",
    noResults: "一致するページがありません。別のキーワードを試してください。",
    unavailable:
      "現在検索できません。資料は手動で追加できます。",
    openPage: "ページを開く",
    unverified: "未確認",
    alreadyAdded: "追加済み",
    selectAll: "すべて選択",
    clear: "選択解除",
    selected: (count) => `${count}件選択`,
    add: (count) => `${count}件を追加`,
    cancel: "キャンセル",
    limit: (count) => `あと${count}件追加できます。`,
    provider: (providers) => `検索元：${providers}`,
    filing: "企業開示",
    news: "ニュース",
    selectItem: (title) => `選択：${title}`,
  },
  es: {
    title: "Buscar fuentes públicas",
    subtitle: "Revisa las páginas y elige qué material añadir.",
    searchLabel: "Términos de búsqueda",
    searchPlaceholder: "Empresa, ticker o palabras clave",
    search: "Buscar",
    searching: "Buscando…",
    notice:
      "Los resultados pueden estar desactualizados, repetidos o requerir acceso. Abre la página y compruébala. No se añade nada hasta que lo selecciones y confirmes.",
    privacy:
      "Para acciones A, el ticker se envía a CNINFO. El nombre, el ticker y los términos se envían a Yahoo Finance. Tu tesis no se envía.",
    noResults:
      "No se encontraron páginas coincidentes. Prueba otras palabras.",
    unavailable:
      "La búsqueda no está disponible. Aún puedes añadir material a mano.",
    openPage: "Abrir página",
    unverified: "Sin verificar",
    alreadyAdded: "Ya añadido",
    selectAll: "Seleccionar todo",
    clear: "Limpiar",
    selected: (count) => `${count} seleccionados`,
    add: (count) => `Añadir ${count}`,
    cancel: "Cancelar",
    limit: (count) => `Puedes añadir ${count} más.`,
    provider: (providers) => `Fuentes: ${providers}`,
    filing: "Documento oficial",
    news: "Noticia",
    selectItem: (title) => `Seleccionar: ${title}`,
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

export function MaterialFinderModal({
  thesisCase,
  locale,
  existingEvidence,
  remainingSlots,
  onClose,
  onAdd,
}: {
  thesisCase: ThesisCase;
  locale: Locale;
  existingEvidence: EvidenceItem[];
  remainingSlots: number;
  onClose: () => void;
  onAdd: (candidates: MaterialCandidate[]) => void;
}) {
  const copy = COPY[locale];
  const [query, setQuery] = useState(thesisCase.company);
  const [candidates, setCandidates] = useState<MaterialCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  const runSearch = useCallback(
    async (rawQuery: string) => {
      const trimmed = rawQuery.normalize("NFKC").trim();
      if (!trimmed) return;
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      setLoading(true);
      setUnavailable(false);
      setSelected(new Set());
      try {
        const params = new URLSearchParams({
          symbol: thesisCase.ticker,
          name: thesisCase.company,
          q: trimmed,
          locale,
        });
        const response = await fetch(
          `/api/stocks/materials?${params.toString()}`,
          {
            headers: { accept: "application/json" },
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error("Search failed.");
        const payload = (await response.json()) as {
          candidates?: unknown;
          providerStatus?: unknown;
          providers?: unknown;
        };
        const nextCandidates = Array.isArray(payload.candidates)
          ? payload.candidates.filter(isMaterialCandidate)
          : [];
        setCandidates(nextCandidates);
        setUnavailable(payload.providerStatus === "unavailable");
        setProviders(
          Array.isArray(payload.providers)
            ? payload.providers.filter(
                (provider): provider is string =>
                  typeof provider === "string" && provider.length <= 80,
              )
            : [],
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setCandidates([]);
        setUnavailable(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setSearched(true);
        }
      }
    },
    [locale, thesisCase.company, thesisCase.ticker],
  );

  const providerNames = providers
    .map((provider) =>
      provider === "CNINFO"
        ? locale === "zh-CN"
          ? "巨潮资讯"
          : "CNINFO"
        : provider,
    )
    .join(locale === "en" || locale === "es" ? ", " : "、");

  useEffect(() => {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    inputRef.current?.focus();
    const initialSearch = window.setTimeout(
      () => void runSearch(thesisCase.company),
      0,
    );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href]',
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
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(initialSearch);
      requestRef.current?.abort();
      window.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [runSearch, thesisCase.company]);

  const alreadyAdded = useMemo(
    () =>
      new Set(
        candidates
          .filter((candidate) =>
            isCandidateAlreadyAdded(candidate, existingEvidence),
          )
          .map((candidate) => candidate.id),
      ),
    [candidates, existingEvidence],
  );
  const available = candidates.filter(
    (candidate) => !alreadyAdded.has(candidate.id),
  );

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runSearch(query);
  };

  const toggle = (candidate: MaterialCandidate) => {
    if (alreadyAdded.has(candidate.id) || remainingSlots <= 0) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(candidate.id)) {
        next.delete(candidate.id);
      } else if (next.size < remainingSlots) {
        next.add(candidate.id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelected(
      new Set(
        available
          .slice(0, remainingSlots)
          .map((candidate) => candidate.id),
      ),
    );
  };

  const confirm = () => {
    const chosen = candidates.filter((candidate) =>
      selected.has(candidate.id),
    );
    if (chosen.length) onAdd(chosen);
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="modal material-finder-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="material-finder-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="material-finder-title">{copy.title}</h2>
            <p>{copy.subtitle}</p>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label={copy.cancel}
          >
            <X size={18} />
          </button>
        </div>

        <form className="material-search-form" onSubmit={submitSearch}>
          <label>
            <span className="sr-only">{copy.searchLabel}</span>
            <Search size={16} />
            <input
              ref={inputRef}
              value={query}
              maxLength={160}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
            />
          </label>
          <button
            className="button primary"
            type="submit"
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <LoaderCircle size={15} className="spin" />
            ) : (
              <Search size={15} />
            )}
            {loading ? copy.searching : copy.search}
          </button>
        </form>

        <div className="material-search-notice">
          <p>{copy.notice}</p>
          <small>{copy.privacy}</small>
        </div>

        <div className="material-result-toolbar">
          <span>
            {copy.provider(
              providerNames ||
                (locale === "zh-CN"
                  ? "巨潮资讯、Yahoo Finance"
                  : "CNINFO, Yahoo Finance"),
            )}
          </span>
          <div>
            <button
              type="button"
              onClick={selectAll}
              disabled={!available.length || remainingSlots <= 0}
            >
              {copy.selectAll}
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              disabled={!selected.size}
            >
              {copy.clear}
            </button>
          </div>
        </div>

        <div className="material-candidate-list" aria-live="polite">
          {loading ? (
            <div className="material-search-state">
              <LoaderCircle size={20} className="spin" />
              {copy.searching}
            </div>
          ) : unavailable ? (
            <div className="material-search-state">
              <FileSearch size={21} />
              {copy.unavailable}
            </div>
          ) : searched && !candidates.length ? (
            <div className="material-search-state">
              <FileSearch size={21} />
              {copy.noResults}
            </div>
          ) : (
            candidates.map((candidate) => {
              const exists = alreadyAdded.has(candidate.id);
              const checked = selected.has(candidate.id);
              const disabled =
                exists ||
                remainingSlots <= 0 ||
                (!checked && selected.size >= remainingSlots);
              return (
                <article
                  className={`material-candidate ${checked ? "selected" : ""} ${exists ? "disabled" : ""}`}
                  key={candidate.id}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      aria-label={copy.selectItem(candidate.title)}
                      onChange={() => toggle(candidate)}
                    />
                    <span className="candidate-check" aria-hidden="true">
                      {checked && <Check size={12} />}
                    </span>
                  </label>
                  <div>
                    <strong>{candidate.title}</strong>
                    <p>
                      {candidate.publisher} ·{" "}
                      {formatDate(candidate.publishedAt, locale)}
                    </p>
                    <span className="candidate-status">
                      {candidate.kind === "filing"
                        ? copy.filing
                        : copy.news}
                      {" · "}
                      {exists ? copy.alreadyAdded : copy.unverified}
                    </span>
                  </div>
                  <a
                    href={candidate.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {copy.openPage}
                    <ExternalLink size={13} />
                  </a>
                </article>
              );
            })
          )}
        </div>

        <div className="material-finder-actions">
          <div>
            <strong>{copy.selected(selected.size)}</strong>
            <small>{copy.limit(Math.max(0, remainingSlots))}</small>
          </div>
          <button className="button ghost" type="button" onClick={onClose}>
            {copy.cancel}
          </button>
          <button
            className="button primary"
            type="button"
            onClick={confirm}
            disabled={!selected.size}
          >
            <Check size={15} />
            {copy.add(selected.size)}
          </button>
        </div>
      </div>
    </div>
  );
}
