"use client";

import {
  ArrowLeft,
  CheckCircle2,
  FileSearch,
  FileText,
  Link2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef } from "react";

import type { Locale } from "@/lib/i18n";

type GuideItem = {
  title: string;
  body: string;
};

type GuideCopy = {
  title: string;
  subtitle: string;
  duration: string;
  backToWorkspace: string;
  backToSearch: string;
  toc: string;
  overview: {
    nav: string;
    title: string;
    body: string;
    callout: string;
  };
  workflow: {
    nav: string;
    title: string;
    intro: string;
    steps: GuideItem[];
  };
  evidence: {
    nav: string;
    title: string;
    intro: string;
    items: GuideItem[];
  };
  result: {
    nav: string;
    title: string;
    intro: string;
    items: GuideItem[];
    example: string;
  };
  accuracy: {
    nav: string;
    title: string;
    intro: string;
    items: string[];
  };
  faq: {
    nav: string;
    title: string;
    items: GuideItem[];
  };
  closing: string;
};

export const GUIDE_COPY: Record<Locale, GuideCopy> = {
  en: {
    title: "How to use Falsifi",
    subtitle:
      "One task: see how the material recorded for one stock thesis groups by source.",
    duration: "About 3 minutes",
    backToWorkspace: "Back to workspace",
    backToSearch: "Back to stock search",
    toc: "In this guide",
    overview: {
      nav: "Purpose",
      title: "What Falsifi reports",
      body:
        "Several articles may repeat one filing, dataset, interview, or republication. Falsifi puts matching links and sources you mark as the same into one group.",
      callout:
        "Falsifi only organizes sources. It does not judge a stock, predict returns, or issue buy and sell signals.",
    },
    workflow: {
      nav: "How it works",
      title: "Use it in your own order",
      intro: "Nothing is locked. Choose the action you need.",
      steps: [
        {
          title: "1. Choose a stock",
          body:
            "Search a U.S., mainland China, or Hong Kong listed stock and open its workspace.",
        },
        {
          title: "2. Find or add material",
          body:
            "Use “Find public sources” to get candidates, or paste a link yourself. You can write a claim or set a check date at any time.",
        },
        {
          title: "3. Read the source result",
          body:
            "Matching links group automatically. If different links come from the same document, dataset, interview, or republication, group them yourself.",
        },
      ],
    },
    evidence: {
      nav: "Add material correctly",
      title: "Record material without manufacturing precision",
      intro:
        "Search can save time, but every result remains unverified until you check it.",
      items: [
        {
          title: "Find public sources",
          body:
            "Click the button to search for the selected company. Nothing is selected or added automatically. You can change the search terms without sending your claim.",
        },
        {
          title: "Open the page before using it",
          body:
            "Search results can be old, duplicated, unrelated, or behind a subscription. Open the page, check the publisher and date, then select only useful material.",
        },
        {
          title: "Add a link yourself",
          body:
            "For material the search misses, add the page title and HTTP or HTTPS link manually. Publisher, date, type, and notes are optional.",
        },
        {
          title: "Shared underlying source",
          body:
            "Select an existing item when both materials ultimately trace to the same document, dataset, interview, or republication chain. This relationship makes them count as one source group.",
        },
        {
          title: "Check status and optional details",
          body:
            "Found pages are added as unverified and not classified as supporting or weakening a claim. Update the check status only after you review the page.",
        },
      ],
    },
    result: {
      nav: "Read the result",
      title: "How to read the evidence card",
      intro:
        "The main result is descriptive and deliberately simple.",
      items: [
        {
          title: "User-added materials",
          body:
            "The number of enabled, manually added items. Automatic market observations are excluded.",
        },
        {
          title: "Source groups",
          body:
            "Groups formed by matching canonical URLs, shared source identity, or an explicit same-source relationship. A group is not proof of statistical independence.",
        },
        {
          title: "Grouped with another item",
          body:
            "How many extra items collapse into an existing source group. For example, 8 copies of the same URL produce 8 materials, 1 source group, and 7 grouped items.",
        },
        {
          title: "Your controls",
          body:
            "Write or edit the claim, add material, change check settings, or save the record whenever you want.",
        },
      ],
      example:
        "Example: You add a filing, two articles quoting that filing, and one unrelated customer-data source. Falsifi should report 4 materials but only 2 source groups. The articles do not create two additional sources.",
    },
    accuracy: {
      nav: "Accuracy boundaries",
      title: "What the grouping can and cannot know",
      intro:
        "The tool uses deterministic rules so the same record produces the same result.",
      items: [
        "The same canonical URL is always grouped, even when tracking parameters, fragments, host casing, or a trailing slash differ.",
        "A user cannot split the same canonical URL into several groups by entering different labels.",
        "Different links are grouped only when a stored source identity or explicit same-source relationship connects them.",
        "Falsifi does not crawl every page, compare full article text, or guarantee that it has discovered every syndication chain.",
        "Public-source search uses Yahoo Finance and is not a complete filing or news archive. Coverage can be thin for mainland China and Hong Kong stocks.",
        "More source groups do not prove the investment thesis true.",
        "Delayed market data is background only and is not counted as user material.",
      ],
    },
    faq: {
      nav: "FAQ",
      title: "Common questions",
      items: [
        {
          title: "Why can eight links count as one group?",
          body:
            "Because eight pages may all trace to one original filing, dataset, interview, or republication chain. Link count is not source diversity.",
        },
        {
          title: "Does a larger source-group count mean the thesis is correct?",
          body:
            "No. It only means the recorded material is less concentrated. Quality, relevance, timeliness, and interpretation still require human judgment.",
        },
        {
          title: "Do I have to add contrary material?",
          body:
            "No. Falsifi can show that your material leans one way, but you decide what to add.",
        },
        {
          title: "Where is my work stored?",
          body:
            "The active record and saved reviews stay in this browser unless you export the JSON file. There is no brokerage connection.",
        },
      ],
    },
    closing:
      "The useful result is simple: “These eight materials currently form two source groups.”",
  },
  "zh-CN": {
    title: "使用 Falsifi",
    subtitle: "整理股票材料，查看它们被归成几组。",
    duration: "约 3 分钟",
    backToWorkspace: "返回工具",
    backToSearch: "返回股票搜索",
    toc: "本页内容",
    overview: {
      nav: "工具用途",
      title: "它能做什么",
      body:
        "很多文章其实都在引用同一份财报、数据或采访。Falsifi 会把同源材料放在一起，让你看到当前共有几组。",
      callout:
        "Falsifi 只整理材料来源，不判断股票好坏，也不给买卖建议。",
    },
    workflow: {
      nav: "怎么使用",
      title: "按你的习惯操作",
      intro: "没有固定顺序。需要做什么，就点什么。",
      steps: [
        {
          title: "1. 选择股票",
          body:
            "搜索美股、A 股或港股，进入这只股票的工具页。",
        },
        {
          title: "2. 让工具找，或自己添加",
          body:
            "点“帮我找材料”查看候选网页，也可以自己贴链接。判断和复查日期随时可填。",
        },
        {
          title: "3. 查看来源组",
          body:
            "相同链接会自动归组。不同链接如果来自同一文件、数据或采访，也可以手动归组。",
        },
      ],
    },
    evidence: {
      nav: "添加材料",
      title: "只填需要的信息",
      intro: "搜索可以省时间，但在你打开网页核对前，结果一律标为“未核实”。",
      items: [
        {
          title: "让工具找材料",
          body:
            "点击按钮后，工具会搜索当前公司。不会自动勾选，也不会自动加入。你可以改搜索词，系统不会发送你的判断。",
        },
        {
          title: "先打开网页核对",
          body:
            "搜索结果可能过时、重复、不相关，也可能需要订阅。确认发布方和日期后，再勾选有用的材料。",
        },
        {
          title: "自己添加链接",
          body:
            "搜索没有找到时，可以自己填写材料内容和网页链接。发布方、日期、类型和备注按需补充。",
        },
        {
          title: "是否来自同一来源",
          body:
            "如果两项材料最终来自同一文件、数据集、采访或转载链，请选择已有材料。它们会按一个来源组计算。",
        },
        {
          title: "核查状态和更多选项",
          body:
            "搜索加入的材料默认“尚未核查”，也不会自动归为支持或不支持判断。看过网页后再修改核查状态。",
        },
      ],
    },
    result: {
      nav: "读懂结果",
      title: "怎么看结果",
      intro: "页面只显示三个数字。",
      items: [
        {
          title: "材料",
          body:
            "你添加了多少条材料。行情不会算进去。",
        },
        {
          title: "来源组",
          body:
            "当前材料被归成多少组。不同组不代表它们一定互相独立。",
        },
        {
          title: "重复来源",
          body:
            "有多少条材料和其他材料来自同一来源。",
        },
        {
          title: "你的操作",
          body:
            "写判断、加材料、改复查设置或保存记录，随时都能操作。",
        },
      ],
      example:
        "例：你加入一份财报、两篇引用该财报的文章，以及一份无关的客户数据来源。Falsifi 应显示 4 项材料，但只有 2 个来源组；两篇文章不会额外制造两个来源。",
    },
    accuracy: {
      nav: "准确性边界",
      title: "系统能知道什么，不能知道什么",
      intro: "归组采用确定性规则，因此相同记录会得到相同结果。",
      items: [
        "同一个链接会归为一组；跟踪参数、网页片段或末尾斜杠不会制造新来源。",
        "修改材料名称，不会把同一个链接拆成多组。",
        "不同链接只有在你标记为来自同一来源时才会归组。",
        "Falsifi 不会抓取并比较所有文章全文，也不能保证发现互联网上全部转载链。",
        "公开材料搜索使用 Yahoo Finance，不是完整公告库或新闻库；A 股和港股的结果可能较少。",
        "来源组更多，不代表投资判断正确。",
        "延迟行情只是背景，不会算作你添加的材料。",
      ],
    },
    faq: {
      nav: "常见问题",
      title: "常见问题",
      items: [
        {
          title: "为什么 8 个链接可能只算 1 组？",
          body:
            "因为 8 个页面可能最终都来自同一份原始披露、同一组数据、同一次采访或同一转载链。链接数量不等于来源多样性。",
        },
        {
          title: "来源组更多，是否代表判断正确？",
          body:
            "不是。它只说明记录的材料没有过度集中；材料质量、相关性、时效性和解释仍需要人工判断。",
        },
        {
          title: "一定要加入不支持判断的材料吗？",
          body:
            "不用。工具可以显示材料目前偏向哪一边，但是否补充由你决定。",
        },
        {
          title: "我的记录保存在哪里？",
          body:
            "当前判断和复核记录默认保存在这个浏览器中，除非你导出 JSON 文件；网站不会连接券商账户。",
        },
      ],
    },
    closing:
      "结果很简单：这 8 条材料，当前被归为 2 组。",
  },
  ja: {
    title: "Falsifi の使い方",
    subtitle:
      "株式の資料を整理し、いくつの出典グループに分かれるか確認します。",
    duration: "約3分",
    backToWorkspace: "作業画面に戻る",
    backToSearch: "銘柄検索に戻る",
    toc: "このガイド",
    overview: {
      nav: "目的",
      title: "Falsifi が行うこと",
      body:
        "複数の記事が、同じ決算資料、データ、インタビューを繰り返していることがあります。Falsifi は同じ出典の資料を一つのグループにまとめます。",
      callout:
        "資料の出典だけを整理します。株価予測や売買推奨は行いません。",
    },
    workflow: {
      nav: "使い方",
      title: "好きな順番で使う",
      intro: "操作の順番は自由です。必要なものを選んでください。",
      steps: [
        {
          title: "1. 銘柄を選ぶ",
          body:
            "米国、中国A株、香港株から検索できます。",
        },
        {
          title: "2. 資料を探す・追加する",
          body:
            "「公開資料を探す」で候補を表示するか、自分でリンクを追加します。仮説や確認日はいつでも記録できます。",
        },
        {
          title: "3. 出典グループを見る",
          body:
            "同じURLは自動でまとまります。別のURLが同じ文書やインタビューに由来する場合は、自分で関連付けできます。",
        },
      ],
    },
    evidence: {
      nav: "資料の追加",
      title: "恣意的な数値ではなく事実と出典を記録",
      intro: "検索は時間を節約しますが、ページを確認するまではすべて未確認です。",
      items: [
        {
          title: "公開資料を探す",
          body:
            "ボタンを押すと選択中の企業を検索します。自動選択や自動追加はしません。仮説を送信せずに検索語を変更できます。",
        },
        {
          title: "追加前にページを確認",
          body:
            "結果は古い、重複、無関係、または購読が必要な場合があります。発行者と日付を確認してから選んでください。",
        },
        {
          title: "リンクを手動で追加",
          body:
            "検索で見つからない場合は、資料の内容とHTTP/HTTPSリンクを入力します。発行者、日付、種類、メモは任意です。",
        },
        {
          title: "共通の底層ソース",
          body:
            "同じ文書、データセット、インタビュー、転載経路に由来する場合、既存項目を選択し一つの出典群として数えます。",
        },
        {
          title: "確認方法と任意の役割分類",
          body:
            "検索から追加した資料は未確認で、仮説を支持・反証するものとして自動分類されません。確認後に状態を更新してください。",
        },
      ],
    },
    result: {
      nav: "結果",
      title: "エビデンスカードの読み方",
      intro: "主結果は意図的に簡潔な記述です。",
      items: [
        {
          title: "ユーザー追加資料",
          body: "有効な手動追加資料の数。自動市場観察は除外します。",
        },
        {
          title: "出典群",
          body:
            "正規化URL、共通の出典ID、明示された同一出典関係で接続された群。統計的独立性の証明ではありません。",
        },
        {
          title: "他資料と同じ群",
          body:
            "既存群へ入る追加資料数。同じURL8件なら資料8件、出典群1件、関連資料7件です。",
        },
        {
          title: "操作",
          body:
            "判断の編集、資料の追加、確認設定、記録の保存はいつでも選べます。",
        },
      ],
      example:
        "決算資料1件、それを引用する記事2件、独立した顧客データ1件なら、資料4件でも出典群は2件です。",
    },
    accuracy: {
      nav: "精度の境界",
      title: "分かること・分からないこと",
      intro: "同じ記録は同じ結果になる決定的ルールを使います。",
      items: [
        "追跡パラメータ、フラグメント、ホストの大小文字、末尾スラッシュが違っても同じ正規化URLは一群です。",
        "異なるラベルで同じURLを複数群に分割できません。",
        "異なるリンクは記録済みの共通ソース・主張・関係がある場合のみまとめます。",
        "全記事本文をクロールせず、全転載関係の発見を保証しません。",
        "公開資料検索は Yahoo Finance を使用し、完全な開示・ニュースアーカイブではありません。中国A株・香港株は結果が少ない場合があります。",
        "構造完成は仮説の正しさを証明しません。",
        "遅延市場データは背景のみで、証拠要件を満たしません。",
      ],
    },
    faq: {
      nav: "FAQ",
      title: "よくある質問",
      items: [
        {
          title: "8リンクが1群になる理由は？",
          body:
            "同じ原資料、データセット、インタビュー、転載経路に由来する可能性があるためです。",
        },
        {
          title: "群数が多いと仮説は正しい？",
          body: "いいえ。集中度が低いだけで、品質や解釈は人が確認します。",
        },
        {
          title: "反証資料は必須ですか？",
          body: "いいえ。何を追加するかは自分で決められます。",
        },
        {
          title: "記録はどこに保存？",
          body:
            "このブラウザ内に保存され、必要に応じてJSONをエクスポートできます。証券口座接続はありません。",
        },
      ],
    },
    closing:
      "結果は簡単です。この8件の資料は、現在2つの出典グループに分かれています。",
  },
  es: {
    title: "Cómo usar Falsifi",
    subtitle:
      "Una tarea: ver cómo se agrupan por fuente los materiales registrados para una tesis bursátil.",
    duration: "Unos 3 minutos",
    backToWorkspace: "Volver a mi ficha",
    backToSearch: "Volver a buscar",
    toc: "En esta guía",
    overview: {
      nav: "Propósito",
      title: "Qué hace Falsifi",
      body:
        "Varios artículos pueden repetir el mismo informe, conjunto de datos o entrevista. Falsifi reúne los materiales que proceden de la misma fuente.",
      callout:
        "Solo organiza las fuentes. No predice precios ni recomienda comprar o vender.",
    },
    workflow: {
      nav: "Uso",
      title: "Úsalo en el orden que prefieras",
      intro: "No hay un orden obligatorio. Elige la acción que necesites.",
      steps: [
        {
          title: "1. Elige una acción",
          body:
            "Busca una acción de EE. UU., China continental o Hong Kong.",
        },
        {
          title: "2. Busca o añade material",
          body:
            "Usa «Buscar fuentes públicas» para ver candidatos o pega un enlace. La tesis y la fecha de revisión se pueden añadir en cualquier momento.",
        },
        {
          title: "3. Lee los grupos de fuentes",
          body:
            "La misma URL se agrupa automáticamente. También puedes relacionar enlaces distintos que proceden del mismo documento o entrevista.",
        },
      ],
    },
    evidence: {
      nav: "Añadir material",
      title: "Registra hechos y procedencia, no precisión inventada",
      intro:
        "La búsqueda ahorra tiempo, pero todo resultado queda sin verificar hasta que abras la página.",
      items: [
        {
          title: "Buscar fuentes públicas",
          body:
            "El botón busca la empresa seleccionada. No marca ni añade nada automáticamente. Puedes cambiar los términos sin enviar tu tesis.",
        },
        {
          title: "Abrir la página antes de usarla",
          body:
            "Los resultados pueden ser antiguos, repetidos, irrelevantes o requerir suscripción. Revisa el editor y la fecha antes de elegir.",
        },
        {
          title: "Añadir un enlace a mano",
          body:
            "Si la búsqueda no lo encuentra, añade el título y el enlace HTTP/HTTPS. Editor, fecha, tipo y nota son opcionales.",
        },
        {
          title: "Misma fuente subyacente",
          body:
            "Relaciona con un elemento existente si ambos proceden del mismo documento, conjunto de datos, entrevista o cadena de republicación.",
        },
        {
          title: "Verificación y papel opcional",
          body:
            "El material encontrado se añade sin verificar y sin clasificarlo como apoyo o rechazo de la tesis. Cambia el estado solo después de revisarlo.",
        },
      ],
    },
    result: {
      nav: "Leer el resultado",
      title: "Cómo leer la ficha",
      intro: "El resultado principal es descriptivo y sencillo.",
      items: [
        {
          title: "Materiales añadidos por el usuario",
          body: "Elementos manuales activos; excluye observaciones automáticas.",
        },
        {
          title: "Grupos de fuentes",
          body:
            "Material conectado por URL canónica, identidad de fuente o una relación explícita de misma fuente; no prueba independencia estadística.",
        },
        {
          title: "Agrupados con otro",
          body:
            "Elementos adicionales en grupos existentes. Ocho copias de una URL producen 8 materiales, 1 grupo y 7 agrupados.",
        },
        {
          title: "Controles",
          body:
            "Puedes editar la tesis, añadir material, cambiar la revisión o guardar cuando quieras.",
        },
      ],
      example:
        "Un informe, dos artículos que lo citan y una fuente de clientes distinta son 4 materiales pero 2 grupos.",
    },
    accuracy: {
      nav: "Límites",
      title: "Qué puede y no puede saber",
      intro: "Usa reglas deterministas para resultados reproducibles.",
      items: [
        "La misma URL canónica se agrupa pese a parámetros de seguimiento, fragmentos, mayúsculas del host o barra final.",
        "No se puede dividir la misma URL usando etiquetas diferentes.",
        "Enlaces distintos solo se agrupan mediante una identidad de fuente o una relación explícita de misma fuente.",
        "No rastrea todo el texto web ni garantiza descubrir todas las republicaciones.",
        "La búsqueda usa Yahoo Finance y no es un archivo completo de noticias o documentos. La cobertura puede ser limitada para acciones chinas y de Hong Kong.",
        "Una estructura completa no prueba que la tesis sea cierta.",
        "Los datos retrasados de mercado son contexto y no cumplen los requisitos de evidencia.",
      ],
    },
    faq: {
      nav: "Preguntas",
      title: "Preguntas frecuentes",
      items: [
        {
          title: "¿Por qué ocho enlaces pueden ser un grupo?",
          body: "Porque pueden repetir el mismo documento o hecho original.",
        },
        {
          title: "¿Más grupos significa que la tesis es correcta?",
          body: "No. Solo indica menor concentración del material registrado.",
        },
        {
          title: "¿Es obligatoria la evidencia contraria?",
          body: "No. Tú decides qué material añadir.",
        },
        {
          title: "¿Dónde se guarda mi trabajo?",
          body:
            "En este navegador, salvo que exportes JSON. No hay conexión con un bróker.",
        },
      ],
    },
    closing:
      "El resultado es sencillo: estos ocho materiales forman ahora dos grupos de fuentes.",
  },
};

const sections = [
  "overview",
  "workflow",
  "evidence",
  "result",
  "accuracy",
  "faq",
] as const;

export function UserGuide({
  locale,
  hasCase,
  onClose,
}: {
  locale: Locale;
  hasCase: boolean;
  onClose: () => void;
}) {
  const copy = GUIDE_COPY[locale];
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <article className="guide-page">
      <header className="guide-hero">
        <div>
          <span className="picker-eyebrow">
            <FileSearch size={15} />
            Falsifi
          </span>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
          <small>{copy.duration}</small>
        </div>
        <button className="button secondary" onClick={onClose}>
          <ArrowLeft size={15} />
          {hasCase ? copy.backToWorkspace : copy.backToSearch}
        </button>
      </header>

      <div className="guide-layout">
        <nav className="guide-toc" aria-label={copy.toc}>
          <strong>{copy.toc}</strong>
          {sections.map((section) => (
            <a href={`#guide-${section}`} key={section}>
              {copy[section].nav}
            </a>
          ))}
        </nav>

        <div className="guide-content">
          <section className="guide-section" id="guide-overview">
            <span className="guide-section-number">01</span>
            <h2>{copy.overview.title}</h2>
            <p>{copy.overview.body}</p>
            <aside className="guide-callout">
              <ShieldCheck size={20} />
              <p>{copy.overview.callout}</p>
            </aside>
          </section>

          <section className="guide-section" id="guide-workflow">
            <span className="guide-section-number">02</span>
            <h2>{copy.workflow.title}</h2>
            <p>{copy.workflow.intro}</p>
            <div className="guide-step-grid">
              {copy.workflow.steps.map((step) => (
                <div key={step.title}>
                  <CheckCircle2 size={18} />
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="guide-section" id="guide-evidence">
            <span className="guide-section-number">03</span>
            <h2>{copy.evidence.title}</h2>
            <p>{copy.evidence.intro}</p>
            <div className="guide-definition-list">
              {copy.evidence.items.map((item) => (
                <div key={item.title}>
                  <dt>{item.title}</dt>
                  <dd>{item.body}</dd>
                </div>
              ))}
            </div>
          </section>

          <section className="guide-section" id="guide-result">
            <span className="guide-section-number">04</span>
            <h2>{copy.result.title}</h2>
            <p>{copy.result.intro}</p>
            <div className="guide-definition-list">
              {copy.result.items.map((item) => (
                <div key={item.title}>
                  <dt>{item.title}</dt>
                  <dd>{item.body}</dd>
                </div>
              ))}
            </div>
            <aside className="guide-callout">
              <Link2 size={20} />
              <p>{copy.result.example}</p>
            </aside>
          </section>

          <section className="guide-section" id="guide-accuracy">
            <span className="guide-section-number">05</span>
            <h2>{copy.accuracy.title}</h2>
            <p>{copy.accuracy.intro}</p>
            <ul className="guide-bullet-list">
              {copy.accuracy.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="guide-section" id="guide-faq">
            <span className="guide-section-number">06</span>
            <h2>{copy.faq.title}</h2>
            <div className="guide-faq-list">
              {copy.faq.items.map((item) => (
                <details key={item.title}>
                  <summary>{item.title}</summary>
                  <p>{item.body}</p>
                </details>
              ))}
            </div>
          </section>

          <footer className="guide-closing">
            <FileText size={19} />
            <p>{copy.closing}</p>
            <button className="button primary" onClick={onClose}>
              <Search size={15} />
              {hasCase ? copy.backToWorkspace : copy.backToSearch}
            </button>
          </footer>
        </div>
      </div>
    </article>
  );
}
