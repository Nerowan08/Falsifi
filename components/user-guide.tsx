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
    duration: "About 6 minutes",
    backToWorkspace: "Back to my evidence card",
    backToSearch: "Back to stock search",
    toc: "In this guide",
    overview: {
      nav: "Purpose",
      title: "What Falsifi reports",
      body:
        "Investors often collect several articles that ultimately repeat one filing, dataset, interview, or republication chain. Falsifi turns one stock thesis and its material into an evidence card. It joins matching canonical URLs and same-source relationships you declare, then reports the source groups identified in the current record, the grouped material, and the next missing research step.",
      callout:
        "Falsifi checks evidence structure. It does not decide whether a stock is good, predict returns, calculate a target price, or issue buy and sell signals.",
    },
    workflow: {
      nav: "Three-step workflow",
      title: "Complete one evidence check",
      intro:
        "The interface shows one primary action at a time. Follow it in order.",
      steps: [
        {
          title: "1. Choose a stock and write one claim",
          body:
            "Search a U.S., mainland China, or Hong Kong listed stock. Write one concrete claim about what you expect over a stated period. Do not paste a general company description.",
        },
        {
          title: "2. Define what would weaken it",
          body:
            "Record an observable event or fact that would make you reconsider, choose the time horizon, and set a future review date. This prevents the thesis from quietly changing after the outcome is known.",
        },
        {
          title: "3. Add original, contrary, and differently sourced material",
          body:
            "Start with a company or regulatory original document, then add a credible fact that challenges the thesis. When another link traces to the same document, dataset, interview, or republication chain, connect it to the existing item.",
        },
      ],
    },
    evidence: {
      nav: "Add material correctly",
      title: "Record material without manufacturing precision",
      intro:
        "The normal form asks for facts and provenance, not arbitrary numerical confidence scores.",
      items: [
        {
          title: "Title, publisher, URL, and date",
          body:
            "Describe the specific fact, link the page you actually checked, and use the observation or publication date. The URL must be an HTTP or HTTPS link.",
        },
        {
          title: "Source type",
          body:
            "Choose company or regulatory disclosure only when you checked the original document. Management comments, market data, and external analysis are separate categories.",
        },
        {
          title: "Supports or challenges",
          body:
            "Choose the direction of this fact relative to your exact thesis—not whether the news sounds generally positive or negative.",
        },
        {
          title: "Shared underlying source",
          body:
            "Select an existing item when both materials ultimately trace to the same document, dataset, interview, or republication chain. This relationship makes them count as one source group.",
        },
        {
          title: "Verification and optional role",
          body:
            "You must state whether you read the original, checked a reliable secondary source, or have not independently verified it. Classifying the item as pivotal, important, or context is optional.",
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
          title: "Next action",
          body:
            "The single button identifies the first structural gap: define the claim, add an original disclosure, add contrary material, add a different source, or set the review date.",
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
        "A completed evidence structure does not prove the investment thesis true. It only means the record contains the required kinds of material.",
        "Delayed market data is background only and never satisfies the original-source, contrary-evidence, or source-diversity checks.",
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
          title: "Why does Falsifi require contrary material?",
          body:
            "Without a credible challenge, the record mainly measures how much supporting material you collected, not whether you tested the thesis.",
        },
        {
          title: "Where is my work stored?",
          body:
            "The active record and saved reviews stay in this browser unless you export the JSON file. There is no brokerage connection.",
        },
      ],
    },
    closing:
      "A useful result is not “the stock is good.” It is “these eight materials represent two source groups, and this is the next different fact I need to check.”",
  },
  "zh-CN": {
    title: "Falsifi 完整使用教程",
    subtitle:
      "只完成一个任务：查看一项股票判断的材料如何按来源归组。",
    duration: "约 6 分钟",
    backToWorkspace: "返回我的判断证据卡",
    backToSearch: "返回股票搜索",
    toc: "本页内容",
    overview: {
      nav: "工具用途",
      title: "Falsifi 到底解决什么问题",
      body:
        "投资者经常收集多篇文章，但它们最终可能都来自同一份财报、同一组数据、同一次采访或同一转载链。Falsifi 把一项股票判断和相关材料整理成一张证据卡：相同规范化网址一定归组，你明确声明为同源的材料也会归组，然后显示当前记录中识别的来源组、哪些材料被合并，以及下一项最缺的研究任务。",
      callout:
        "Falsifi 检查的是证据结构，不判断股票好坏，不预测收益，不计算目标价，也不给买卖信号。",
    },
    workflow: {
      nav: "三步流程",
      title: "完成一次证据核查",
      intro: "页面每个阶段只显示一个主要操作，按顺序完成即可。",
      steps: [
        {
          title: "1. 选择股票，写下一个判断",
          body:
            "搜索美股、A 股或港股。写下一项在明确期限内可能被检验的判断，不要填写笼统的公司介绍。",
        },
        {
          title: "2. 提前写明什么会削弱它",
          body:
            "记录一个会让你重新考虑的可观察事件或事实，确认判断期限，并设置未来的复核日期。这样可以避免结果出现后悄悄修改原来的判断。",
        },
        {
          title: "3. 添加原始披露、反方事实和不同来源",
          body:
            "先加入公司或监管机构的原始文件，再加入一条可信、会削弱判断的事实。若另一篇材料最终来自同一文件、数据集、采访或转载链，请把它关联到已有材料。",
        },
      ],
    },
    evidence: {
      nav: "正确添加材料",
      title: "记录事实和来源，不制造虚假精确",
      intro:
        "普通表单只要求事实与来源关系，不再要求用户随意填写影响分数或可信度百分比。",
      items: [
        {
          title: "标题、发布方、网址和日期",
          body:
            "标题应描述具体事实；网址必须是你实际核查过的 HTTP 或 HTTPS 页面；日期使用观察日期或发布日期。",
        },
        {
          title: "来源类型",
          body:
            "只有确实阅读公司或监管机构原始文件时，才选择“公司或监管披露”。管理层发言、行情数据和外部分析分别记录。",
        },
        {
          title: "支持判断或削弱判断",
          body:
            "方向必须相对于你写下的那项具体判断，而不是笼统判断这条新闻是利好还是利空。",
        },
        {
          title: "是否共享同一底层来源",
          body:
            "如果两项材料最终来自同一文件、数据集、采访或转载链，请选择已有材料。它们会按一个来源组计算。",
        },
        {
          title: "核查方式与可选作用分类",
          body:
            "必须选择你是阅读了原始文件、核对了可靠二手来源，还是尚未独立核查；把材料标为关键、重要或背景则是可选项。",
        },
      ],
    },
    result: {
      nav: "读懂结果",
      title: "如何阅读判断证据卡",
      intro: "主结果是描述性的，刻意保持简单。",
      items: [
        {
          title: "人工录入材料",
          body:
            "当前启用、由用户人工添加的材料数量。自动行情观察不会被算进来。",
        },
        {
          title: "当前识别的来源组",
          body:
            "由相同规范化网址、共享来源身份或用户明确声明的同源关系形成的归组结果。“不同组”不等于已经证明统计独立。",
        },
        {
          title: "与其他材料归为一组",
          body:
            "被并入已有来源组的额外材料数量。例如同一网址复制 8 次，会显示 8 项材料、1 个来源组、7 项归组材料。",
        },
        {
          title: "下一项操作",
          body:
            "唯一的主按钮指出第一个结构性缺口：定义判断、加入原始披露、加入反方事实、加入不同来源，或设置复核日期。",
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
        "同一规范化网址一定归为一组；跟踪参数、网页片段、主机名大小写或末尾斜杠不会制造新来源。",
        "用户无法通过填写不同标签，把同一规范化网址拆成多个来源组。",
        "不同链接只有在共享已记录的来源身份，或存在明确的同源关系时才会归组。",
        "Falsifi 不会抓取并比较所有文章全文，也不能保证发现互联网上全部转载链。",
        "证据结构完整，不代表投资判断已经正确；它只表示记录中包含了所要求的材料类型。",
        "延迟行情永远只是背景，不会满足原始披露、反方证据或不同来源检查。",
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
          title: "为什么必须加入反方材料？",
          body:
            "如果没有可信的挑战，你记录的只是收集了多少支持材料，而不是是否真正检验过这项判断。",
        },
        {
          title: "我的记录保存在哪里？",
          body:
            "当前判断和复核记录默认保存在这个浏览器中，除非你导出 JSON 文件；网站不会连接券商账户。",
        },
      ],
    },
    closing:
      "有价值的结果不是“这只股票很好”，而是“这 8 项材料在当前记录中被识别为 2 个来源组，下一步最该核查的是另一来源的材料”。",
  },
  ja: {
    title: "Falsifi の使い方",
    subtitle:
      "一つのタスク：株式仮説の資料が出典ごとにどう分かれるかを確認します。",
    duration: "約6分",
    backToWorkspace: "エビデンスカードに戻る",
    backToSearch: "銘柄検索に戻る",
    toc: "このガイド",
    overview: {
      nav: "目的",
      title: "Falsifi が行うこと",
      body:
        "複数の記事が同じ決算資料、データセット、インタビュー、転載経路に由来することがあります。Falsifi は一つの仮説と資料をカード化し、同じ正規化URLと明示された同一出典関係をまとめ、現在の記録で識別された出典群と次に不足する調査を示します。",
      callout:
        "証拠構造を確認するツールです。株価予測、目標株価、売買推奨、銘柄の良否判断は行いません。",
    },
    workflow: {
      nav: "3ステップ",
      title: "一回の証拠チェックを完了",
      intro: "各段階で主要操作は一つだけです。",
      steps: [
        {
          title: "1. 銘柄と一つの仮説を入力",
          body:
            "米国、中国A株、香港株を検索し、期間内に検証可能な具体的仮説を一つ記録します。",
        },
        {
          title: "2. 弱める条件を事前に記録",
          body:
            "再考が必要になる観察可能な事実、期間、将来の確認日を設定します。",
        },
        {
          title: "3. 一次資料、反証、別の出典を追加",
          body:
            "企業・規制当局の原資料から始め、反証事実を追加します。同じ底層資料を繰り返す場合は既存項目に関連付けます。",
        },
      ],
    },
    evidence: {
      nav: "資料の追加",
      title: "恣意的な数値ではなく事実と出典を記録",
      intro: "通常フォームでは数値の信頼度や影響点を要求しません。",
      items: [
        {
          title: "タイトル、発行者、URL、日付",
          body:
            "具体的事実を記述し、実際に確認したHTTP/HTTPSページと観察・公開日を記録します。",
        },
        {
          title: "出典タイプ",
          body:
            "原文を確認した場合のみ企業・規制当局資料を選びます。経営陣発言、市場データ、外部分析は別です。",
        },
        {
          title: "支持または反証",
          body:
            "一般的な好材料・悪材料ではなく、記録した仮説に対する方向を選びます。",
        },
        {
          title: "共通の底層ソース",
          body:
            "同じ文書、データセット、インタビュー、転載経路に由来する場合、既存項目を選択し一つの出典群として数えます。",
        },
        {
          title: "確認方法と任意の役割分類",
          body:
            "原文確認・二次資料確認・未確認のいずれかは必須です。中核・重要・背景の役割分類は任意です。",
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
          title: "次の操作",
          body:
            "仮説定義、一次資料、反証、別出典、確認日のうち最初の不足を一つ示します。",
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
          title: "反証資料が必要な理由は？",
          body: "支持材料の収集と仮説の検証は異なるためです。",
        },
        {
          title: "記録はどこに保存？",
          body:
            "このブラウザ内に保存され、必要に応じてJSONをエクスポートできます。証券口座接続はありません。",
        },
      ],
    },
    closing:
      "有用な結果は「良い株」ではなく、「8件の資料は2つの出典群で、次にこの別の事実を確認すべき」です。",
  },
  es: {
    title: "Cómo usar Falsifi",
    subtitle:
      "Una tarea: ver cómo se agrupan por fuente los materiales registrados para una tesis bursátil.",
    duration: "Unos 6 minutos",
    backToWorkspace: "Volver a mi ficha",
    backToSearch: "Volver a buscar",
    toc: "En esta guía",
    overview: {
      nav: "Propósito",
      title: "Qué hace Falsifi",
      body:
        "Varios artículos pueden proceder del mismo informe, conjunto de datos, entrevista o cadena de republicación. Falsifi convierte una tesis y sus materiales en una ficha, agrupa URL canónicas iguales y relaciones explícitas de misma fuente, y muestra los grupos identificados en el registro y el siguiente vacío de investigación.",
      callout:
        "Comprueba la estructura de evidencia. No predice rentabilidad, calcula precio objetivo ni recomienda comprar o vender.",
    },
    workflow: {
      nav: "Tres pasos",
      title: "Completa una comprobación",
      intro: "Cada etapa presenta una sola acción principal.",
      steps: [
        {
          title: "1. Elige una acción y escribe una tesis",
          body:
            "Busca una acción de EE. UU., China continental o Hong Kong y escribe una tesis concreta con plazo.",
        },
        {
          title: "2. Define qué la debilitaría",
          body:
            "Registra un hecho observable que te haría reconsiderar, el horizonte y una fecha futura de revisión.",
        },
        {
          title: "3. Añade fuente original, evidencia contraria y otra fuente",
          body:
            "Empieza con el emisor o regulador, añade un hecho contrario y relaciona materiales que repitan la misma fuente.",
        },
      ],
    },
    evidence: {
      nav: "Añadir material",
      title: "Registra hechos y procedencia, no precisión inventada",
      intro: "El formulario normal no pide porcentajes arbitrarios.",
      items: [
        {
          title: "Título, editor, URL y fecha",
          body:
            "Describe el hecho, enlaza la página HTTP/HTTPS revisada y registra la fecha.",
        },
        {
          title: "Tipo de fuente",
          body:
            "Marca fuente empresarial o regulatoria solo si revisaste el documento original.",
        },
        {
          title: "Apoya o cuestiona",
          body:
            "Elige la dirección respecto a tu tesis exacta, no si la noticia parece positiva o negativa.",
        },
        {
          title: "Misma fuente subyacente",
          body:
            "Relaciona con un elemento existente si ambos proceden del mismo documento, conjunto de datos, entrevista o cadena de republicación.",
        },
        {
          title: "Verificación y papel opcional",
          body:
            "Debes indicar si leíste el original, comprobaste una fuente secundaria o aún no lo verificaste. Marcarlo como esencial, importante o contexto es opcional.",
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
          title: "Siguiente acción",
          body:
            "Muestra el primer vacío: tesis, fuente original, evidencia contraria, fuente distinta o fecha.",
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
          title: "¿Por qué exigir evidencia contraria?",
          body: "Recopilar apoyo no equivale a poner a prueba una tesis.",
        },
        {
          title: "¿Dónde se guarda mi trabajo?",
          body:
            "En este navegador, salvo que exportes JSON. No hay conexión con un bróker.",
        },
      ],
    },
    closing:
      "Un resultado útil no es “buena acción”, sino “estos ocho materiales son dos grupos y esta es la siguiente fuente distinta que debo comprobar”.",
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
