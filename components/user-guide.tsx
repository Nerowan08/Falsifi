"use client";

import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  Database,
  FileText,
  History,
  Info,
  Link2,
  Search,
  ShieldCheck,
  SlidersHorizontal,
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
  backToAnalysis: string;
  backToPicker: string;
  toc: string;
  overview: {
    nav: string;
    title: string;
    body: string;
    callout: string;
  };
  quickStart: {
    nav: string;
    title: string;
    intro: string;
    steps: GuideItem[];
  };
  results: {
    nav: string;
    title: string;
    intro: string;
    market: GuideItem[];
    metrics: GuideItem[];
    example: string;
  };
  stress: {
    nav: string;
    title: string;
    intro: string;
    items: GuideItem[];
    modesTitle: string;
    modes: GuideItem[];
    boundary: string;
  };
  evidence: {
    nav: string;
    title: string;
    intro: string;
    fields: GuideItem[];
    groupingTitle: string;
    grouping: string[];
    warning: string;
  };
  audit: {
    nav: string;
    title: string;
    intro: string;
    items: GuideItem[];
  };
  method: {
    nav: string;
    title: string;
    intro: string;
    items: GuideItem[];
  };
  history: {
    nav: string;
    title: string;
    intro: string;
    items: string[];
  };
  limits: {
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
    title: "Falsifi user guide",
    subtitle:
      "A practical walkthrough from choosing a stock to saving a reviewable research case.",
    duration: "About 8–10 minutes",
    backToAnalysis: "Back to analysis",
    backToPicker: "Back to stock search",
    toc: "On this page",
    overview: {
      nav: "What Falsifi does",
      title: "What Falsifi does—and does not do",
      body:
        "Falsifi turns delayed price and volume data into an inspectable, rule-based starting case. It then tests how easily that assessment changes when evidence or scenario inputs change.",
      callout:
        "It does not forecast returns, calculate a target price, recommend a trade, or connect to a brokerage. Its 0–100 score is an internal rule score, not a probability.",
    },
    quickStart: {
      nav: "Quick start",
      title: "Five-minute workflow",
      intro:
        "Use this order the first time. It keeps the data check separate from your interpretation.",
      steps: [
        {
          title: "1. Find the listed stock",
          body:
            "Choose a market, then search by company name or ticker. Confirm the company and exchange before opening it.",
        },
        {
          title: "2. Check the market snapshot",
          body:
            "Review the exchange, currency, market-data time, retrieval time, provider, and the price basis named above the chart. Quotes are delayed and may be incomplete.",
        },
        {
          title: "3. Read the starting assessment",
          body:
            "Treat the assessment, rule score, and robustness score as model outputs—not as buy, sell, risk, or return signals.",
        },
        {
          title: "4. Test the scenario inputs",
          body:
            "Move one scenario input at a time. Note the nearest threshold and the combinations that change the current assessment.",
        },
        {
          title: "5. Inspect and add evidence",
          body:
            "Verify every source. Add filings, management disclosures, and third-party research instead of relying on price indicators alone.",
        },
        {
          title: "6. Save before changing stock",
          body:
            "Save a browser snapshot or export the current case as JSON before replacing the active stock.",
        },
      ],
    },
    results: {
      nav: "Read the results",
      title: "How to read the market data and summary",
      intro:
        "The automatic case uses roughly one year of daily prices and, when available, volume. It requires at least 200 valid daily observations.",
      market: [
        {
          title: "Price basis",
          body:
            "The model uses adjusted closing prices when a complete adjusted series is available; otherwise it uses regular closing prices. The chart states which basis was used.",
        },
        {
          title: "1-month and 3-month returns",
          body:
            "Changes over about 21 and 63 trading sessions. The one-year figure covers the available window, not a guaranteed full calendar year.",
        },
        {
          title: "Annualized volatility (30 sessions)",
          body:
            "The sample standard deviation of the latest 30 daily returns, annualized with √252. It is historical, not forecast volatility.",
        },
        {
          title: "Maximum drawdown",
          body:
            "The largest peak-to-subsequent-trough loss in the available window, shown as a positive loss magnitude.",
        },
        {
          title: "RSI (14)",
          body:
            "Wilder's 14-session relative strength index. It is a momentum indicator, not a prediction.",
        },
        {
          title: "Automatic evidence directions",
          body:
            "The fixed heuristics count the following as supporting: price at or above SMA200; SMA50 at or above SMA200; nonnegative 3-month and available-year returns; annualized volatility of 35% or less; drawdown loss of 25% or less; RSI from 45 to 70; and, when volume exists, a volume ratio of at least 1 with a nonnegative daily return. Otherwise the item weakens the score. These are not validated trading rules.",
        },
      ],
      metrics: [
        {
          title: "Current assessment",
          body:
            "With the default thresholds, favorable means 58 or higher, neutral means 42 or higher but below 58, and cautious means below 42.",
        },
        {
          title: "Rule score",
          body:
            "The automatic case starts at 50, then combines enabled evidence, confidence weights, assigned impact, and scenario-input changes. An imported case can define another base score. It is not a probability.",
        },
        {
          title: "Model robustness",
          body:
            "An internal diagnostic: 35% item-level evidence buffer, 25% nearest one-variable buffer, and 40% distance from the current score to an assessment threshold. It is not stock-price stability or investment safety.",
        },
        {
          title: "Related evidence groups",
          body:
            "Evidence linked by a shared original source, shared claim, or declared dependency is grouped together. Separate groups have not been proven statistically independent.",
        },
      ],
      example:
        "An automatic case normally shows 7–8 evidence items in 1 related group. Every item comes from the same price-and-volume dataset, and the volume item is omitted when volume is unavailable; these are not separate original sources.",
    },
    stress: {
      nav: "Run stress tests",
      title: "Use the stress-test workspace",
      intro:
        "Stress tests answer counterfactual questions inside the current rule model. They do not estimate what will happen in the market.",
      items: [
        {
          title: "Smallest tested assessment change",
          body:
            "Removes whole related evidence groups and searches for the smallest tested group set that crosses an assessment threshold.",
        },
        {
          title: "One-variable sensitivity",
          body:
            "Changes one scenario input while holding the others fixed, then locates the nearest tested assessment threshold.",
        },
        {
          title: "Scenario inputs",
          body:
            "Sliders update the case immediately in your browser. Baseline is the recorded reference value. Typical change is a preset normalization scale in the case JSON, not a statistically estimated typical move.",
        },
        {
          title: "Two-variable threshold combinations",
          body:
            "Shows nearby pairs of input changes that cross a threshold. A listed pair may be economically unrealistic, and some pairs do not require both changes.",
        },
      ],
      modesTitle: "The three evidence test modes",
      modes: [
        {
          title: "Exclude evidence",
          body: "Treats the selected item-level evidence as unavailable.",
        },
        {
          title: "Lower confidence",
          body:
            "Keeps its direction but multiplies its confidence weight by 0.5.",
        },
        {
          title: "Reverse direction",
          body:
            "Keeps assigned impact and confidence, but changes supporting evidence to weakening evidence and vice versa.",
        },
      ],
      boundary:
        "The three modes use the smallest item-level evidence set, while the large summary card searches whole related groups. The interface labels both search scopes. “Not found” always means not found within the displayed search limits.",
    },
    evidence: {
      nav: "Manage evidence",
      title: "Check, edit, and add evidence",
      intro:
        "The automatic case is a technical-market starting point. A serious research case should add primary company disclosures, relevant management statements, and genuinely independent third-party evidence.",
      fields: [
        {
          title: "Confidence weight",
          body:
            "Your editable judgment about source reliability, from 0% to 100%. It is not statistical confidence.",
        },
        {
          title: "Assigned impact",
          body:
            "The model points assigned before the confidence weight is applied. It is a rule input, not an empirical effect.",
        },
        {
          title: "Score change if excluded",
          body:
            "The score difference after removing that item and recalculating the model. It is not a causal estimate or a backtest.",
        },
        {
          title: "Source date and link",
          body:
            "Open the original source, check the observation date, and record caveats in the research note.",
        },
        {
          title: "Direction and enabled status",
          body:
            "Supports or weakens is the item’s direction inside this rule model. The check control temporarily includes or excludes the item from calculations.",
        },
        {
          title: "Source type",
          body:
            "Regulatory filing, management disclosure, market data, or third-party estimate is a category used by the source-type exclusion test. It is separate from the source-group ID.",
        },
      ],
      groupingTitle: "Declare relationships between evidence",
      grouping: [
        "Use the same source-group ID for items derived from one original document—for example, a quarterly report and an article quoting that report.",
        "Use the same claim-group ID when different materials support the same underlying claim—for example, gross-margin pressure.",
        "An imported case can also declare item-to-item dependencies with dependsOnIds. This advanced field is available in JSON, not in the current evidence form.",
      ],
      warning:
        "The dependency check identifies and reports relationships; it does not automatically reduce assigned impact inside a group. Review, disable, or edit weights when several indicators repeat the same underlying information.",
    },
    audit: {
      nav: "Check relationships",
      title: "Read the evidence dependency check",
      intro:
        "This page describes relationships and concentration inside the configured rule model. It does not prove that evidence is independent in the real world.",
      items: [
        {
          title: "Related groups and grouped items",
          body:
            "Related groups are connected by a shared source, shared claim, or imported dependency. Grouped items equals enabled evidence items minus related groups; it is not a duplicate-content count.",
        },
        {
          title: "Impact concentration (0–100)",
          body:
            "An internal index based on squared shares of each group’s absolute rule-score influence. A higher value means fewer groups account for more of the model impact.",
        },
        {
          title: "Older evidence",
          body:
            "By default, an item is older when its observation date is more than 90 days before the case update date. Older does not automatically mean invalid.",
        },
        {
          title: "Source-type exclusion test",
          body:
            "Excludes every enabled item in one source category, then recalculates the rule score and assessment. It is a model sensitivity check, not a market forecast.",
        },
      ],
    },
    method: {
      nav: "Understand the method",
      title: "Understand the calculation and search limits",
      intro:
        "The Method page in the top navigation summarizes the calculation. The repository’s METHODOLOGY.md gives the full definitions; these are the points needed to interpret the interface correctly.",
      items: [
        {
          title: "Score calculation",
          body:
            "The score equals the base score plus each enabled item’s signed assigned impact multiplied by its confidence weight, plus each scenario input’s change from baseline multiplied by its configured per-unit effect and direction. The result is limited to 0–100.",
        },
        {
          title: "Relationship grouping",
          body:
            "Shared source-group IDs, claim-group IDs, and imported dependency links form connected groups. Grouping exposes reused information but does not automatically change weights or prove independence.",
        },
        {
          title: "Discrete searches",
          body:
            "Item and group searches test sets up to four. One- and two-variable searches use each input’s declared step and bounds; the two-variable search is limited to 100,000 states and is labeled sampled when the full step grid exceeds that budget.",
        },
        {
          title: "Model-robustness score",
          body:
            "The 35/25/40 diagnostic combines the tested evidence buffer, nearest one-variable buffer, and score margin. No enabled evidence contributes zero to the evidence component; a missing threshold inside the tested range is not proof of safety.",
        },
      ],
    },
    history: {
      nav: "Save and restore",
      title: "Snapshots, import, and export",
      intro:
        "Save a version before changing an important scenario input, removing evidence, restoring an older case, or switching stocks.",
      items: [
        "Snapshots are stored only in this browser. The site keeps up to 30 snapshots in total across stocks.",
        "Clearing site data, changing browser, or changing device does not carry snapshots with you.",
        "Restoring a snapshot replaces unsaved changes in the active case.",
        "The SHA-256 content fingerprint can compare identical case content. It is not a trusted timestamp, signature, or proof of authorship.",
        "Export JSON currently includes the active case only; it does not include snapshot history.",
        "Language changes update fixed interface text and untouched automatic copy. Your edited text remains unchanged.",
      ],
    },
    limits: {
      nav: "Limits and privacy",
      title: "Know the research boundary",
      intro:
        "Use Falsifi as a structured checklist and sensitivity tool, not as a complete stock-analysis service.",
      items: [
        "The Yahoo Finance integration is experimental. Data can be delayed, incomplete, throttled, or changed by the provider.",
        "The default case uses price and volume indicators only. It does not automatically analyze financial statements, valuation, news, industry structure, or management quality.",
        "The rule weights, confidence values, thresholds, and test ranges are heuristic settings and may contain subjective judgment.",
        "One-variable analysis holds other inputs fixed. Two-variable analysis does not model three-way interactions or infer real-world correlation.",
        "During a trading session, the latest daily bar and volume can be provisional until the market closes.",
        "Cases and snapshots are stored locally, but stock search and market-data requests require a network connection to the site and data provider.",
        "Verify material figures with the exchange, regulator, and issuer's original disclosures before making any decision.",
      ],
    },
    faq: {
      nav: "Common questions",
      title: "Common questions",
      items: [
        {
          title: "Why do 7–8 indicators form one related group?",
          body:
            "They all came from the same price-and-volume series; the volume item is omitted when volume is unavailable. Multiple calculations from one dataset do not create multiple original sources.",
        },
        {
          title: "Does a high score mean I should buy?",
          body:
            "No. It only reflects the current rule inputs and thresholds. It is not expected return, win probability, suitability, or a recommendation.",
        },
        {
          title: "Does “not found” mean the case is safe?",
          body:
            "No. It means the current search did not find a threshold change within its displayed bounds. Untested combinations, missing evidence, and model error remain possible.",
        },
        {
          title: "Why can a stock not be analyzed?",
          body:
            "It may not be a listed stock, may have fewer than 200 valid daily observations, may not match the selected market, or the data service may be unavailable.",
        },
        {
          title: "How do I back up my work?",
          body:
            "Export the active case JSON. Browser snapshots are convenient local versions, not cross-device backups.",
        },
      ],
    },
    closing:
      "Good use of Falsifi starts with a falsifiable question, verifiable sources, and an explicit record of what would change your mind.",
  },
  "zh-CN": {
    title: "Falsifi 使用指南",
    subtitle: "从选择股票到保存研究版本，一步步完成可核查的股票分析。",
    duration: "约 8–10 分钟",
    backToAnalysis: "返回分析",
    backToPicker: "返回选股",
    toc: "本页目录",
    overview: {
      nav: "工具用途",
      title: "Falsifi 能做什么，不能做什么",
      body:
        "Falsifi 会把延迟的价格和成交量数据整理成一个可检查的规则模型初始案例，再测试当证据或情景参数变化时，当前判断有多容易改变。",
      callout:
        "它不预测收益，不计算目标价，不推荐买卖，也不连接券商。0–100 分是内部规则评分，不是概率。",
    },
    quickStart: {
      nav: "快速开始",
      title: "五分钟上手流程",
      intro: "第一次使用时建议按这个顺序操作，先核对数据，再做判断。",
      steps: [
        {
          title: "1. 找到正确的上市股票",
          body:
            "先选择市场，再输入公司名称或股票代码。进入前核对公司名称和交易所。",
        },
        {
          title: "2. 核对行情概览",
          body:
            "查看交易所、币种、行情时间、获取时间、数据提供方，以及图表上标明的价格口径。行情可能延迟或不完整。",
        },
        {
          title: "3. 阅读初始判断",
          body:
            "把当前判断、规则评分和模型内稳健度当作规则模型输出，不要当成买卖、风险或收益信号。",
        },
        {
          title: "4. 调整情景参数",
          body:
            "一次调整一个参数，观察最近临界值，以及哪些参数组合会改变当前判断。",
        },
        {
          title: "5. 核查并补充证据",
          body:
            "逐条打开来源核验。不要只依赖价格指标，应补充公司公告、监管文件、管理层披露和独立第三方资料。",
        },
        {
          title: "6. 更换股票前先保存",
          body:
            "更换当前股票前，先保存浏览器快照，或把当前案例导出为 JSON。",
        },
      ],
    },
    results: {
      nav: "理解结果",
      title: "如何阅读行情指标与摘要",
      intro:
        "自动案例使用约一年的日线价格，以及可用时的成交量。至少需要 200 个有效日度数据点。",
      market: [
        {
          title: "价格口径",
          body:
            "如果提供方返回完整的复权序列，模型使用复权收盘价；否则整段使用普通收盘价，不会把两种价格混在一起。图表会标明实际口径。",
        },
        {
          title: "1 个月和 3 个月区间涨跌幅",
          body:
            "分别按约 21 个和 63 个交易日计算。近一年数据按当前可用窗口首尾计算，不保证刚好覆盖一个完整自然年。",
        },
        {
          title: "最近 30 个交易日年化波动率",
          body:
            "使用最近 30 个日收益率的样本标准差，再乘以 √252 年化。它是历史波动，不是预测波动。",
        },
        {
          title: "最大回撤",
          body:
            "当前窗口内，从阶段高点到随后低点的最大跌幅，以正的损失幅度显示。",
        },
        {
          title: "RSI（14）",
          body:
            "采用 Wilder 平滑方法计算的 14 日相对强弱指标。它是动量指标，不是预测。",
        },
        {
          title: "自动证据的方向规则",
          body:
            "以下固定规则会记为“支持”：价格不低于 200 日均线；50 日均线不低于 200 日均线；3 个月及当前可用近一年涨跌幅不为负；年化波动率不高于 35%；最大回撤损失不高于 25%；RSI 在 45–70；有成交量时，量比不低于 1 且当日涨跌幅不为负。其他情况记为“削弱”。这些是启发式规则，不是经过验证的交易标准。",
        },
      ],
      metrics: [
        {
          title: "当前判断",
          body:
            "按默认阈值，58 分及以上为偏积极，42 分及以上但低于 58 分为中性，低于 42 分为偏谨慎。",
        },
        {
          title: "规则评分",
          body:
            "自动案例从 50 分开始，结合已启用证据、可信度权重、设定影响分和情景参数变化计算；导入案例可以设置其他基础分。它不是概率。",
        },
        {
          title: "模型内稳健度",
          body:
            "内部诊断由三部分组成：35% 为逐条证据缓冲，25% 为最近单因素临界距离，40% 为当前分数到判断阈值的距离。它不代表股价稳定、投资安全或未来风险。",
        },
        {
          title: "关联证据组",
          body:
            "共享原始来源、共享研究主张或存在已声明依赖关系的证据会被归为一组。不同组并不等于已经过统计独立性检验。",
        },
      ],
      example:
        "自动案例通常显示“7–8 条证据 · 1 个关联组”。这些指标都来自同一份价格与成交量数据；没有成交量时会省略成交量项，因此不能把它们当作多个原始信息来源。",
    },
    stress: {
      nav: "压力测试",
      title: "如何使用压力测试工作台",
      intro:
        "压力测试回答的是当前规则模型里的反事实问题，并不估计市场接下来会发生什么。",
      items: [
        {
          title: "改变判断的最小已测试条件",
          body:
            "按关联证据组整组剔除，寻找能让规则评分跨过判断阈值的最小已测试组合。",
        },
        {
          title: "单因素敏感性分析",
          body:
            "保持其他参数不变，只调整一个情景参数，并寻找最近的判断变化临界值。",
        },
        {
          title: "情景参数",
          body:
            "滑块会在浏览器中即时重算。基准值是案例记录的参考值；“典型变动幅度”是案例 JSON 中预设的归一化尺度，不是统计估算出的典型变化。",
        },
        {
          title: "双因素临界组合",
          body:
            "列出距离当前状态较近、可跨过阈值的两项参数变化。组合可能不符合现实经济关系，而且有些组合中单独一项就已足够。",
        },
      ],
      modesTitle: "三种证据处理方式",
      modes: [
        {
          title: "剔除证据",
          body: "把选中的逐条证据视为不可用，不再计入评分。",
        },
        {
          title: "降低可信度",
          body: "方向不变，把可信度权重乘以 0.5。",
        },
        {
          title: "方向反转",
          body: "保留设定影响分和可信度，但把支持改为削弱，反之亦然。",
        },
      ],
      boundary:
        "三种处理方式作用于“逐条证据的最小组合”；左侧大卡片测试的是“整组关联证据”，两者范围不同，页面会分别标明。任何“未找到”都只表示在页面显示的测试范围内未找到。",
    },
    evidence: {
      nav: "管理证据",
      title: "核查、编辑和补充证据",
      intro:
        "自动案例只是技术面起点。严肃的股票研究还应加入公司原始披露、相关管理层说明，以及真正独立的第三方资料。",
      fields: [
        {
          title: "可信度权重",
          body:
            "你对来源可靠程度的可编辑判断，范围为 0%–100%。它不是统计置信度。",
        },
        {
          title: "设定影响分",
          body:
            "应用可信度权重前，由规则模型设定的分值。它不是实证影响。",
        },
        {
          title: "剔除后评分变化",
          body:
            "把该条证据移出模型后重新计算得到的分差，不代表因果效应或回测结果。",
        },
        {
          title: "来源日期与链接",
          body:
            "打开原始来源，核对观察日期，并在研究注释中记录限制与待核查事项。",
        },
        {
          title: "方向与启用状态",
          body:
            "“支持/削弱”只表示该条证据在当前规则模型中的方向。勾选控件用于临时纳入或排除该条证据。",
        },
        {
          title: "来源类型",
          body:
            "公司公告/监管文件、管理层披露、市场数据、第三方研究/估算是来源类型，用于来源类型剔除测试；它与来源组 ID 不是同一字段。",
        },
      ],
      groupingTitle: "声明证据之间的关系",
      grouping: [
        "来自同一份原始材料的内容应使用相同的来源组 ID，例如一份季报及引用该季报的新闻。",
        "不同材料如果都在支持同一个底层主张，应使用相同的论点组 ID，例如“毛利率承压”。",
        "导入的案例还可以通过 dependsOnIds 声明逐条证据之间的依赖关系；这是 JSON 高级字段，当前证据表单不能直接编辑。",
      ],
      warning:
        "证据依赖检查只识别并提示关联关系，不会自动调低组内的设定影响分。多项指标重复使用同一底层信息时，请自行停用或调整权重。",
    },
    audit: {
      nav: "检查证据关系",
      title: "如何阅读证据依赖检查",
      intro:
        "这一页说明当前规则模型内部的证据关系与影响集中情况，不会证明现实中的证据彼此独立。",
      items: [
        {
          title: "关联证据组与已归并项",
          body:
            "共享来源、共享研究主张或导入依赖关系的证据会归入同一关联组。“已归并项”=已启用证据数−关联证据组数，不是内容重复检测结果。",
        },
        {
          title: "影响集中度（0–100）",
          body:
            "这是内部指数，按各关联组对规则评分绝对影响占比的平方和计算。数值越高，说明模型影响越集中在少数关联组。",
        },
        {
          title: "较旧证据",
          body:
            "默认指观察日期比案例更新时间早 90 天以上的证据。时间较旧不等于自动失效，仍需结合来源与事实核查。",
        },
        {
          title: "来源类型剔除测试",
          body:
            "剔除某一来源类型下的全部已启用证据，再重新计算规则评分与当前判断。它是模型敏感性检查，不是市场预测。",
        },
      ],
    },
    method: {
      nav: "理解计算方法",
      title: "理解计算方式与搜索边界",
      intro:
        "顶部导航中的“方法”页概括计算逻辑，仓库内的 METHODOLOGY.md 提供完整定义。下面四点足以帮助你正确解读页面结果。",
      items: [
        {
          title: "评分计算",
          body:
            "规则评分=基础分+各条已启用证据的方向×设定影响分×可信度权重+各情景参数相对基准值的变化×单位影响×方向，最终限制在 0–100。自动案例基础分为 50。",
        },
        {
          title: "证据关系归组",
          body:
            "相同来源组 ID、相同论点组 ID 或导入的依赖链接会形成关联证据组。归组只让重复使用的信息可见，不会自动改权重，也不能证明组间独立。",
        },
        {
          title: "离散搜索",
          body:
            "逐条证据和关联组最多测试四项组合；单因素和双因素搜索按每个参数声明的步长与边界进行。双因素完整步长网格最多计算 100,000 个状态，超过后会明确标为抽样搜索。",
        },
        {
          title: "模型内稳健度",
          body:
            "35/25/40 指标结合已测试证据缓冲、最近单因素临界距离和当前评分到阈值的距离。没有已启用证据时，证据部分计 0；测试范围内未找到临界值，也不等于安全。",
        },
      ],
    },
    history: {
      nav: "保存与恢复",
      title: "快照、导入与导出",
      intro:
        "修改重要情景参数、删除证据、恢复旧版本或更换股票之前，建议先保存一个快照。",
      items: [
        "快照只保存在当前浏览器中；所有股票合计最多保留 30 条。",
        "清除网站数据、更换浏览器或更换设备，快照不会自动跟随。",
        "恢复快照会替换当前尚未保存的修改。",
        "SHA-256 内容指纹只能用于比较案例内容是否一致，不是可信时间戳、数字签名或作者身份证明。",
        "当前导出 JSON 只包含正在分析的案例，不包含快照历史。",
        "切换语言会更新固定界面和未被改写的自动文案；你编辑过的文字会保持原样。",
      ],
    },
    limits: {
      nav: "限制与隐私",
      title: "了解研究边界",
      intro:
        "请把 Falsifi 当作结构化检查清单和敏感性分析工具，不要把它当成完整的股票分析服务。",
      items: [
        "Yahoo Finance 行情接入为实验性接口，可能出现延迟、缺失、限流或接口变更。",
        "默认案例只使用价格和成交量指标，不会自动分析财务报表、估值、新闻、行业结构或管理层质量。",
        "规则权重、可信度、判断阈值和测试范围都是启发式设定，可能包含主观判断。",
        "单因素分析默认其他参数不变；双因素分析不处理三个以上参数联动，也不会推断现实中的相关性。",
        "交易时段内，最新一根日线和成交量在收盘前可能仍是暂定值。",
        "案例和快照保存在浏览器本地，但股票搜索和行情请求需要连接本站后端及行情提供方。",
        "作出任何决定前，请以交易所、监管机构和公司原始披露核验重大数据。",
      ],
    },
    faq: {
      nav: "常见问题",
      title: "常见问题",
      items: [
        {
          title: "为什么 7–8 个指标只有 1 个关联证据组？",
          body:
            "因为它们都由同一份价格和成交量序列计算而来；没有成交量时会少一项。同一数据集的多种计算方式，不会变成多个原始信息来源。",
        },
        {
          title: "分数高是不是就应该买入？",
          body:
            "不是。它只反映当前规则输入和阈值，不是预期收益、上涨概率、适当性判断或投资建议。",
        },
        {
          title: "“未找到”是不是表示很安全？",
          body:
            "不是。它只表示当前搜索在所示范围内没有找到判断变化。未测试组合、缺失证据和模型误差仍然存在。",
        },
        {
          title: "为什么某只股票无法分析？",
          body:
            "它可能不是上市股票、有效日度数据不足 200 个、与当前市场筛选不符，或行情服务暂时不可用。",
        },
        {
          title: "如何备份研究内容？",
          body:
            "请导出当前案例 JSON。浏览器快照便于本地恢复，但不是跨设备备份。",
        },
      ],
    },
    closing:
      "Falsifi 最有价值的用法，是提出一个可以被推翻的问题、核验原始来源，并明确记录什么变化会让你改变判断。",
  },
  ja: {
    title: "Falsifi 利用ガイド",
    subtitle:
      "銘柄の選択から、検証可能な分析ケースの保存までを順に説明します。",
    duration: "約8～10分",
    backToAnalysis: "分析に戻る",
    backToPicker: "銘柄検索に戻る",
    toc: "目次",
    overview: {
      nav: "できること",
      title: "Falsifi ができること・できないこと",
      body:
        "Falsifi は遅延した価格・出来高データから確認可能なルールベースの初期ケースを作り、エビデンスやシナリオ入力が変わったときに現在の評価がどれほど変わりやすいかを検証します。",
      callout:
        "将来リターンや目標株価を予測せず、売買を推奨せず、証券会社にも接続しません。0～100の値はルールに基づく内部スコアで、確率ではありません。",
    },
    quickStart: {
      nav: "クイックスタート",
      title: "5分で始める手順",
      intro:
        "初回はこの順序で、データの確認と解釈を分けて進めてください。",
      steps: [
        {
          title: "1. 上場銘柄を探す",
          body:
            "市場を選び、企業名またはティッカーで検索します。企業名と取引所を確認してから開きます。",
        },
        {
          title: "2. 市場データを確認する",
          body:
            "取引所、通貨、市場データ時刻、取得時刻、提供元、チャート上部に表示された価格基準を確認します。データは遅延・欠損する場合があります。",
        },
        {
          title: "3. 初期評価を読む",
          body:
            "現在の評価、ルールスコア、モデル内の頑健性を、売買・リスク・リターンのシグナルと解釈しないでください。",
        },
        {
          title: "4. シナリオ入力を動かす",
          body:
            "一度に1項目を変更し、最も近いしきい値と評価が変わる組み合わせを確認します。",
        },
        {
          title: "5. エビデンスを確認・追加する",
          body:
            "すべての出典を確認し、価格指標だけでなく法定開示、経営陣の説明、独立した第三者資料を追加します。",
        },
        {
          title: "6. 銘柄変更前に保存する",
          body:
            "現在の銘柄を置き換える前に、ブラウザー内にスナップショットを保存するか、JSONをエクスポートします。",
        },
      ],
    },
    results: {
      nav: "結果の読み方",
      title: "市場指標と要約の読み方",
      intro:
        "自動ケースは約1年分の日次価格と、利用可能な場合は出来高を使います。200件以上の有効な日次データが必要です。",
      market: [
        {
          title: "価格基準",
          body:
            "完全な調整後終値系列が利用できる場合はそれを使い、それ以外は通常の終値系列全体を使います。2種類を混在させず、実際の基準をチャート上に表示します。",
        },
        {
          title: "1か月・3か月リターン",
          body:
            "約21・63取引日の変化です。1年値は利用可能な期間の始点と終点で計算し、暦年を完全に含むとは限りません。",
        },
        {
          title: "直近30取引日の年率換算ボラティリティ",
          body:
            "直近30日リターンの標本標準偏差を√252で年率換算します。将来予測ではありません。",
        },
        {
          title: "最大ドローダウン",
          body:
            "期間内の高値からその後の安値までの最大下落幅を、正の損失幅で表示します。",
        },
        {
          title: "RSI（14）",
          body:
            "Wilder方式の14日相対力指数です。モメンタム指標であり、予測ではありません。",
        },
        {
          title: "自動エビデンスの方向ルール",
          body:
            "次の固定ルールを支持方向とします。価格がSMA200以上、SMA50がSMA200以上、3か月および利用可能期間の約1年リターンが0以上、年率換算ボラティリティが35%以下、ドローダウン損失が25%以下、RSIが45～70、出来高がある場合は出来高比率が1以上かつ日次リターンが0以上です。それ以外は反対方向です。検証済みの売買ルールではありません。",
        },
      ],
      metrics: [
        {
          title: "現在の評価",
          body:
            "既定値では、58以上が前向き、42以上58未満が中立、42未満が慎重です。",
        },
        {
          title: "ルールスコア",
          body:
            "自動ケースは50を基準に、有効なエビデンス、信頼度ウェイト、設定した影響度、シナリオ入力の変化を合成します。インポートしたケースは別の基準スコアを設定できます。確率ではありません。",
        },
        {
          title: "モデル内の頑健性",
          body:
            "内部指標は、項目単位のエビデンス余力35%、最も近い1変数しきい値までの余力25%、現在スコアから評価しきい値までの距離40%で構成されます。株価の安定性や投資の安全性ではありません。",
        },
        {
          title: "関連エビデンス群",
          body:
            "同じ原資料、同じ主張、または指定された依存関係で結ばれた項目をまとめます。別の群でも統計的独立性が証明されたわけではありません。",
        },
      ],
      example:
        "自動ケースは通常「エビデンス7～8件・関連グループ1件」です。すべて同じ価格・出来高データから計算され、出来高がない場合は出来高項目を省きます。別々の原情報源ではありません。",
    },
    stress: {
      nav: "ストレステスト",
      title: "ストレステスト画面の使い方",
      intro:
        "ストレステストは現在のルールモデル内の反実仮想を調べるもので、市場の将来を推定するものではありません。",
      items: [
        {
          title: "評価が変わる最小のテスト済み条件",
          body:
            "関連エビデンス群を単位に除外し、評価のしきい値を越える最小のテスト済み組み合わせを探します。",
        },
        {
          title: "1変数感応度分析",
          body:
            "他の入力を固定し、1つのシナリオ入力だけを変えて最も近い評価変更しきい値を探します。",
        },
        {
          title: "シナリオ入力",
          body:
            "スライダーはブラウザー内で即時再計算されます。基準値は記録上の参照値です。「典型的な変動幅」はケースJSON内の正規化用の設定値で、統計的に推定した典型値ではありません。",
        },
        {
          title: "2変数の臨界組み合わせ",
          body:
            "しきい値を越える近い入力ペアを表示します。現実には成立しない場合や、一方の変更だけで十分な場合があります。",
        },
      ],
      modesTitle: "3つのエビデンス処理",
      modes: [
        {
          title: "エビデンスを除外",
          body: "選択した項目単位のエビデンスを利用不可として扱います。",
        },
        {
          title: "信頼度を下げる",
          body: "方向は維持し、信頼度ウェイトを0.5倍にします。",
        },
        {
          title: "方向を反転",
          body: "設定した影響度と信頼度を保ち、支持方向と反対方向を入れ替えます。",
        },
      ],
      boundary:
        "3つの処理は項目単位の最小集合を対象とし、大きな要約カードは関連グループ全体を対象とします。画面は両方の範囲を明示します。「見つからない」は表示されたテスト範囲内での結果です。",
    },
    evidence: {
      nav: "エビデンス管理",
      title: "エビデンスの確認・編集・追加",
      intro:
        "自動ケースはテクニカル面の出発点です。本格的な分析では企業が公表した一次資料（法定開示など）、経営陣による説明、独立した第三者資料を追加してください。",
      fields: [
        {
          title: "信頼度ウェイト",
          body:
            "情報源の信頼性に対する編集可能な判断（0～100%）です。統計的信頼度ではありません。",
        },
        {
          title: "設定した影響度",
          body:
            "信頼度を適用する前のモデル上の点数です。実証された効果ではありません。",
        },
        {
          title: "除外時のスコア変化",
          body:
            "その項目を除外して再計算した差です。因果効果やバックテスト結果ではありません。",
        },
        {
          title: "出典日とリンク",
          body:
            "原資料を開き、観測日を確認し、制約や次の確認事項をメモします。",
        },
        {
          title: "方向と有効・無効",
          body:
            "「支持/弱める」は現在のルールモデル内での方向です。チェック操作で、その項目を計算に含めるか一時的に除外するかを切り替えます。",
        },
        {
          title: "情報源の種類",
          body:
            "法定開示、経営陣の説明、市場データ、第三者の調査・推計は、情報源タイプ別の除外テストに使う分類です。情報源グループIDとは別です。",
        },
      ],
      groupingTitle: "エビデンス間の関係を設定する",
      grouping: [
        "同じ原資料から派生した項目には同じ情報源グループIDを使います。例：四半期報告書と、その報告書を引用する記事。",
        "異なる資料が共通する主張を支える場合は同じ主張グループIDを使います。例：粗利益率への圧力。",
        "インポートするケースでは dependsOnIds で項目間の依存関係も指定できます。これはJSONの上級項目で、現在の入力画面では編集できません。",
      ],
      warning:
        "依存関係チェックは関係を可視化するだけで、群内の設定した影響度を自動調整しません。同じ情報を繰り返す指標は無効化またはウェイト調整してください。",
    },
    audit: {
      nav: "関係を確認",
      title: "エビデンスの依存関係チェックの読み方",
      intro:
        "この画面は、設定したルールモデル内の関係と影響の集中を示します。現実のエビデンスが互いに独立していることを証明するものではありません。",
      items: [
        {
          title: "関連グループとグループ化された項目",
          body:
            "同じ出典、共通する主張、またはインポート時に指定された依存関係で項目をまとめます。「グループ化された項目」は有効な項目数から関連グループ数を引いた値で、重複内容の検出件数ではありません。",
        },
        {
          title: "影響の集中度（0～100）",
          body:
            "各グループがルールスコアに与える絶対影響の比率を二乗して計算する内部指数です。高いほど、少数のグループに影響が集中しています。",
        },
        {
          title: "古いエビデンス",
          body:
            "既定では、観測日がケース更新日より90日を超えて前の項目です。古いというだけで無効になるわけではありません。",
        },
        {
          title: "情報源タイプ別の除外テスト",
          body:
            "1つの情報源タイプに属する有効な項目をすべて除外し、ルールスコアと評価を再計算します。モデルの感応度確認であり、市場予測ではありません。",
        },
      ],
    },
    method: {
      nav: "計算方法を理解する",
      title: "計算方法と検索範囲を理解する",
      intro:
        "上部ナビゲーションの「方法」ページは計算の概要を示し、リポジトリの METHODOLOGY.md に完全な定義があります。画面を正しく読むための要点は次の4つです。",
      items: [
        {
          title: "スコア計算",
          body:
            "ルールスコアは、基準スコアに各有効項目の方向×設定した影響度×信頼度を加え、さらに各シナリオ入力の基準値からの変化×単位当たり影響×方向を加えて、0～100に収めた値です。自動ケースの基準は50です。",
        },
        {
          title: "関係によるグループ化",
          body:
            "同じ情報源グループID、主張グループID、またはインポートした依存リンクで接続された項目をまとめます。再利用された情報を見える化しますが、ウェイトを自動変更せず、独立性も証明しません。",
        },
        {
          title: "離散的な検索",
          body:
            "項目・関連グループの検索は最大4件の組み合わせまでです。1変数・2変数検索は各入力に設定された刻み幅と上下限を使います。2変数の完全な刻み幅グリッドが100,000状態を超える場合はサンプリング検索と明示します。",
        },
        {
          title: "モデル内の頑健性",
          body:
            "35/25/40の内部指標は、テスト済みエビデンス余力、最も近い1変数しきい値までの余力、スコアから評価しきい値までの距離を組み合わせます。有効なエビデンスが0件ならエビデンス部分も0です。範囲内でしきい値が見つからなくても安全を意味しません。",
        },
      ],
    },
    history: {
      nav: "保存と復元",
      title: "スナップショット・インポート・エクスポート",
      intro:
        "重要なシナリオ入力の変更、エビデンス削除、スナップショットの復元、銘柄変更の前にスナップショットを保存してください。",
      items: [
        "スナップショットはこのブラウザーだけに保存され、全銘柄合計で最大30件です。",
        "サイトデータの削除、ブラウザーや端末の変更では自動移行されません。",
        "スナップショットの復元は、現在の未保存変更を置き換えます。",
        "SHA-256コンテンツ指紋は同一内容の比較用です。信頼できるタイムスタンプ、署名、作者証明ではありません。",
        "現在のJSONエクスポートにはアクティブなケースだけが含まれ、保存履歴は含まれません。",
        "言語変更は固定UIと未編集の自動文だけを更新し、ユーザーが編集した文章は維持します。",
      ],
    },
    limits: {
      nav: "制約とプライバシー",
      title: "分析の境界を理解する",
      intro:
        "Falsifiは構造化チェックリストと感応度分析として使い、完全な銘柄分析サービスとは考えないでください。",
      items: [
        "Yahoo Finance連携は実験的で、遅延、欠損、制限、仕様変更が起こり得ます。",
        "既定ケースは価格と出来高だけを使い、財務諸表、バリュエーション、ニュース、業界構造、経営品質を自動分析しません。",
        "ルールウェイト、信頼度、しきい値、テスト範囲はヒューリスティックな設定で、主観を含みます。",
        "1変数分析は他を固定します。2変数分析は3変数以上の相互作用や現実の相関を推定しません。",
        "取引時間中の最新日足・出来高は、引けまで暫定値の場合があります。",
        "ケースとスナップショットはブラウザーに保存されますが、検索と市場データ取得にはサイトと提供元への通信が必要です。",
        "重要な数値は取引所、規制当局、発行体の一次開示で確認してください。",
      ],
    },
    faq: {
      nav: "よくある質問",
      title: "よくある質問",
      items: [
        {
          title: "7～8指標なのに関連グループが1つなのはなぜですか？",
          body:
            "同じ価格・出来高系列から計算され、出来高がない場合は1項目省かれるためです。1つのデータセットから複数の計算をしても、原情報源は増えません。",
        },
        {
          title: "高スコアなら買うべきですか？",
          body:
            "いいえ。現在のルール入力としきい値を示すだけで、期待収益、上昇確率、適合性、推奨ではありません。",
        },
        {
          title: "「見つからない」は安全という意味ですか？",
          body:
            "いいえ。表示範囲の検索で評価変更が見つからなかっただけです。未テストの組み合わせ、欠落情報、モデル誤差は残ります。",
        },
        {
          title: "分析できない銘柄があるのはなぜですか？",
          body:
            "上場株式でない、有効な日次データが200件未満、市場フィルター不一致、またはデータサービス停止の可能性があります。",
        },
        {
          title: "分析内容をバックアップするには？",
          body:
            "現在のケースをJSONでエクスポートしてください。ブラウザー内のスナップショットは端末間バックアップではありません。",
        },
      ],
    },
    closing:
      "Falsifiは、反証可能な問い、確認できる一次資料、そして判断を変える条件の明示があって初めて有効に使えます。",
  },
  es: {
    title: "Guía de uso de Falsifi",
    subtitle:
      "Un recorrido práctico desde la selección de una acción hasta el guardado de un caso de análisis verificable.",
    duration: "Unos 8–10 minutos",
    backToAnalysis: "Volver al análisis",
    backToPicker: "Volver a buscar acciones",
    toc: "En esta página",
    overview: {
      nav: "Qué hace",
      title: "Qué hace Falsifi y qué no hace",
      body:
        "Falsifi transforma datos retrasados de precio y volumen en un caso inicial verificable basado en reglas. Después comprueba cuánto cambia la evaluación cuando varían las evidencias o las variables del escenario.",
      callout:
        "No pronostica rentabilidades, no calcula precios objetivo, no recomienda operaciones y no se conecta a un bróker. La puntuación de 0 a 100 está basada en reglas internas; no es una probabilidad.",
    },
    quickStart: {
      nav: "Inicio rápido",
      title: "Flujo de cinco minutos",
      intro:
        "La primera vez, sigue este orden para separar la comprobación de datos de su interpretación.",
      steps: [
        {
          title: "1. Busca la acción cotizada",
          body:
            "Elige un mercado y busca por empresa o ticker. Confirma la empresa y la bolsa antes de abrirla.",
        },
        {
          title: "2. Comprueba los datos de mercado",
          body:
            "Revisa bolsa, moneda, hora del dato, hora de consulta, proveedor y la base de precios indicada sobre el gráfico. Los datos pueden estar retrasados o incompletos.",
        },
        {
          title: "3. Lee la evaluación inicial",
          body:
            "Interpreta la evaluación, la puntuación basada en reglas y la robustez como salidas del modelo, no como señales de compra, venta, riesgo o rentabilidad.",
        },
        {
          title: "4. Cambia las variables del escenario",
          body:
            "Mueve una variable cada vez y observa el umbral más cercano y las combinaciones que cambian la evaluación.",
        },
        {
          title: "5. Comprueba y añade evidencias",
          body:
            "Verifica cada fuente y añade documentos regulatorios, declaraciones de la dirección y fuentes externas independientes.",
        },
        {
          title: "6. Guarda antes de cambiar de acción",
          body:
            "Guarda una instantánea en el navegador o exporta el caso actual como JSON antes de sustituir la acción activa.",
        },
      ],
    },
    results: {
      nav: "Leer resultados",
      title: "Cómo leer los datos y el resumen",
      intro:
        "El caso automático usa aproximadamente un año de precios diarios y, si existe, volumen. Se requieren al menos 200 observaciones diarias válidas.",
      market: [
        {
          title: "Base de precios",
          body:
            "El modelo usa cierres ajustados cuando hay una serie ajustada completa; en caso contrario, usa toda la serie de cierres ordinarios. No mezcla ambas bases y el gráfico indica cuál se utilizó.",
        },
        {
          title: "Rentabilidad de 1 y 3 meses",
          body:
            "Cambios de unas 21 y 63 sesiones. La cifra anual cubre la ventana disponible y no necesariamente un año natural completo.",
        },
        {
          title: "Volatilidad anualizada de 30 sesiones",
          body:
            "Desviación estándar muestral de las últimas 30 rentabilidades diarias, anualizada con √252. No es volatilidad prevista.",
        },
        {
          title: "Drawdown máximo",
          body:
            "Mayor pérdida desde un máximo hasta un mínimo posterior en la ventana, mostrada como magnitud positiva de pérdida.",
        },
        {
          title: "RSI (14)",
          body:
            "Índice de fuerza relativa de 14 sesiones con suavizado de Wilder. Es un indicador de impulso, no un pronóstico.",
        },
        {
          title: "Reglas de dirección de la evidencia automática",
          body:
            "Las reglas fijas consideran favorables: precio igual o superior a la SMA200; SMA50 igual o superior a la SMA200; rentabilidades no negativas a 3 meses y en el período anual disponible; volatilidad anualizada de hasta 35%; pérdida por drawdown de hasta 25%; RSI entre 45 y 70; y, si hay volumen, una razón de volumen de al menos 1 junto con rentabilidad diaria no negativa. En los demás casos, la evidencia es desfavorable. Son reglas heurísticas, no criterios de negociación validados.",
        },
      ],
      metrics: [
        {
          title: "Evaluación actual",
          body:
            "Con los umbrales predeterminados, favorable es 58 o más; neutral, desde 42 hasta menos de 58; y prudente, menos de 42.",
        },
        {
          title: "Puntuación basada en reglas",
          body:
            "El caso automático parte de 50 y combina evidencias activas, pesos de confianza, impacto asignado y cambios del escenario. Un caso importado puede definir otra puntuación base. No es una probabilidad.",
        },
        {
          title: "Robustez dentro del modelo",
          body:
            "Diagnóstico interno compuesto por un 35% de margen ante evidencias por elemento, un 25% de margen hasta el umbral univariable más cercano y un 40% de distancia de la puntuación a un umbral. No mide estabilidad del precio ni seguridad de la inversión.",
        },
        {
          title: "Grupos de evidencias relacionadas",
          body:
            "Agrupa elementos con una fuente original, afirmación o dependencia declarada común. Los grupos separados no han demostrado independencia estadística.",
        },
      ],
      example:
        "El caso automático suele mostrar «7–8 evidencias · 1 grupo relacionado». Todas proceden del mismo conjunto de precio y volumen; la evidencia de volumen se omite si ese dato no está disponible. No son fuentes originales separadas.",
    },
    stress: {
      nav: "Pruebas de estrés",
      title: "Cómo usar las pruebas de estrés",
      intro:
        "Las pruebas responden preguntas contrafactuales dentro del modelo actual; no estiman lo que ocurrirá en el mercado.",
      items: [
        {
          title: "Condición mínima probada que cambia la evaluación",
          body:
            "Excluye grupos completos de evidencias relacionadas y busca el conjunto mínimo probado que cruza un umbral.",
        },
        {
          title: "Sensibilidad de una variable",
          body:
            "Cambia una variable manteniendo las demás fijas y localiza el umbral probado más cercano.",
        },
        {
          title: "Variables del escenario",
          body:
            "Los controles recalculan el caso en el navegador. El valor base es la referencia registrada. El cambio típico es una escala de normalización predefinida en el JSON, no una estimación estadística.",
        },
        {
          title: "Combinaciones críticas de dos variables",
          body:
            "Muestra pares cercanos que cruzan un umbral. Un par puede no ser realista y, en algunos, una sola variable ya es suficiente.",
        },
      ],
      modesTitle: "Tres modos de tratar la evidencia",
      modes: [
        {
          title: "Excluir evidencia",
          body: "Trata las evidencias seleccionadas por elemento como no disponibles.",
        },
        {
          title: "Reducir la confianza",
          body: "Mantiene la dirección y multiplica el peso de confianza por 0,5.",
        },
        {
          title: "Invertir la dirección",
          body:
            "Mantiene el impacto y la confianza, pero cambia evidencia favorable por desfavorable y viceversa.",
        },
      ],
      boundary:
        "Los tres modos usan el conjunto mínimo de elementos de evidencia; la tarjeta principal busca grupos relacionados completos. La interfaz distingue ambos ámbitos. «No encontrado» siempre significa no encontrado dentro de los límites mostrados.",
    },
    evidence: {
      nav: "Gestionar evidencias",
      title: "Comprobar, editar y añadir evidencias",
      intro:
        "El caso automático es solo un punto de partida técnico. Un análisis serio debe añadir documentos originales publicados por la empresa, explicaciones de la dirección y fuentes externas realmente independientes.",
      fields: [
        {
          title: "Peso de confianza",
          body:
            "Juicio editable sobre la fiabilidad de la fuente, del 0% al 100%. No es confianza estadística.",
        },
        {
          title: "Impacto asignado",
          body:
            "Puntos del modelo antes de aplicar la confianza. Es una entrada de reglas, no un efecto empírico.",
        },
        {
          title: "Cambio de puntuación al excluirla",
          body:
            "Diferencia tras retirar el elemento y recalcular. No es una estimación causal ni un backtest (prueba retrospectiva).",
        },
        {
          title: "Fecha y enlace de la fuente",
          body:
            "Abre la fuente original, comprueba la fecha y registra limitaciones y tareas pendientes.",
        },
        {
          title: "Dirección y estado activo",
          body:
            "Apoya o debilita indica la dirección del elemento dentro del modelo de reglas. La casilla permite incluirlo o excluirlo temporalmente del cálculo.",
        },
        {
          title: "Tipo de fuente",
          body:
            "Documento regulatorio, declaración de la dirección, datos de mercado o investigación/estimación de terceros son categorías usadas por la prueba de exclusión. No son el ID del grupo de fuentes.",
        },
      ],
      groupingTitle: "Declara relaciones entre evidencias",
      grouping: [
        "Usa el mismo ID de grupo de fuente para elementos derivados del mismo documento, por ejemplo un informe trimestral y una noticia que lo cita.",
        "Usa el mismo ID de grupo de afirmación si varios materiales apoyan la misma idea, por ejemplo presión sobre el margen bruto.",
        "Un caso importado también puede declarar dependencias entre elementos con dependsOnIds. Es un campo avanzado de JSON que el formulario actual no permite editar.",
      ],
      warning:
        "La comprobación muestra relaciones, pero no reduce automáticamente el impacto dentro del grupo. Desactiva o ajusta pesos cuando varios indicadores repitan la misma información.",
    },
    audit: {
      nav: "Revisar relaciones",
      title: "Cómo leer la comprobación de dependencias",
      intro:
        "Esta página describe relaciones y concentración dentro del modelo de reglas configurado. No demuestra que las evidencias sean independientes en el mundo real.",
      items: [
        {
          title: "Grupos relacionados y elementos agrupados",
          body:
            "Los elementos se agrupan por fuente, afirmación o dependencia importada compartida. Elementos agrupados equivale a evidencias activas menos grupos relacionados; no es un detector de contenido duplicado.",
        },
        {
          title: "Concentración del impacto (0–100)",
          body:
            "Índice interno basado en la suma de los cuadrados de la cuota de impacto absoluto de cada grupo en la puntuación. Un valor alto indica que pocos grupos concentran más impacto.",
        },
        {
          title: "Evidencia antigua",
          body:
            "Por defecto, una evidencia es antigua si su fecha es más de 90 días anterior a la actualización del caso. Antigua no significa inválida automáticamente.",
        },
        {
          title: "Prueba de exclusión por tipo de fuente",
          body:
            "Excluye todos los elementos activos de una categoría y recalcula la puntuación y la evaluación. Es una prueba de sensibilidad del modelo, no un pronóstico.",
        },
      ],
    },
    method: {
      nav: "Entender el método",
      title: "Entender el cálculo y los límites de búsqueda",
      intro:
        "La página «Método» de la navegación superior resume el cálculo; METHODOLOGY.md en el repositorio contiene las definiciones completas. Estos cuatro puntos permiten interpretar correctamente la interfaz.",
      items: [
        {
          title: "Cálculo de la puntuación",
          body:
            "La puntuación suma a la base el signo de cada evidencia activa por su impacto asignado y su peso de confianza, más el cambio de cada variable respecto a su base por el efecto unitario y la dirección configurados. El resultado se limita a 0–100; el caso automático parte de 50.",
        },
        {
          title: "Agrupación por relaciones",
          body:
            "Los mismos ID de grupo de fuente o afirmación y los enlaces de dependencia importados forman grupos conectados. La agrupación muestra información reutilizada, pero no cambia pesos automáticamente ni demuestra independencia.",
        },
        {
          title: "Búsquedas discretas",
          body:
            "Las búsquedas por elementos y grupos prueban conjuntos de hasta cuatro. Las búsquedas de una y dos variables usan el paso y los límites declarados. Si la cuadrícula completa de dos variables supera 100.000 estados, la interfaz la identifica como búsqueda por muestreo.",
        },
        {
          title: "Robustez dentro del modelo",
          body:
            "El diagnóstico 35/25/40 combina el margen de evidencia probado, el margen hasta el umbral univariable más cercano y la distancia de la puntuación al umbral. Sin evidencias activas, el componente de evidencia vale cero; no hallar un umbral en el rango probado no significa seguridad.",
        },
      ],
    },
    history: {
      nav: "Guardar y restaurar",
      title: "Instantáneas, importación y exportación",
      intro:
        "Guarda una instantánea antes de cambiar una variable importante del escenario, eliminar evidencias, restaurar un caso o cambiar de acción.",
      items: [
        "Las instantáneas se guardan solo en este navegador, con un máximo total de 30 entre todas las acciones.",
        "Borrar datos del sitio o cambiar de navegador o dispositivo no las traslada.",
        "Restaurar una instantánea sustituye los cambios no guardados del caso activo.",
        "La huella SHA-256 compara contenido idéntico; no es sello de tiempo fiable, firma ni prueba de autoría.",
        "La exportación JSON actual incluye solo el caso activo, no el historial de instantáneas.",
        "Cambiar de idioma actualiza la interfaz y el texto automático no editado. El texto escrito por el usuario se conserva.",
      ],
    },
    limits: {
      nav: "Límites y privacidad",
      title: "Conoce los límites del análisis",
      intro:
        "Usa Falsifi como lista de comprobación y herramienta de sensibilidad, no como servicio completo de análisis bursátil.",
      items: [
        "La integración con Yahoo Finance es experimental y puede sufrir retrasos, datos incompletos, límites o cambios.",
        "El caso predeterminado solo usa precio y volumen; no analiza automáticamente estados financieros, valoración, noticias, sector ni calidad directiva.",
        "Pesos, confianza, umbrales y rangos son ajustes heurísticos y pueden incorporar juicio subjetivo.",
        "El análisis univariable mantiene lo demás fijo. El bivariable no modela interacciones de tres variables ni infiere correlaciones reales.",
        "Durante la sesión, la última barra diaria y su volumen pueden ser provisionales hasta el cierre.",
        "Los casos y las instantáneas se guardan localmente, pero la búsqueda y los datos requieren conexión con el sitio y el proveedor.",
        "Verifica cifras relevantes con la bolsa, el regulador y las publicaciones originales del emisor.",
      ],
    },
    faq: {
      nav: "Preguntas frecuentes",
      title: "Preguntas frecuentes",
      items: [
        {
          title: "¿Por qué 7–8 indicadores forman un solo grupo?",
          body:
            "Todos proceden de la misma serie de precio y volumen; si falta volumen, se omite un indicador. Varios cálculos sobre un conjunto no crean nuevas fuentes originales.",
        },
        {
          title: "¿Una puntuación alta significa comprar?",
          body:
            "No. Solo refleja reglas y umbrales actuales; no es rentabilidad esperada, probabilidad, idoneidad ni recomendación.",
        },
        {
          title: "¿«No encontrado» significa que el caso es seguro?",
          body:
            "No. Solo indica que la búsqueda no encontró un cambio dentro de sus límites. Puede haber combinaciones no probadas, evidencia ausente y error de modelo.",
        },
        {
          title: "¿Por qué no se puede analizar una acción?",
          body:
            "Puede no ser una acción cotizada, tener menos de 200 observaciones, no coincidir con el mercado elegido o faltar temporalmente el servicio.",
        },
        {
          title: "¿Cómo respaldo mi análisis?",
          body:
            "Exporta el caso activo como JSON. Las instantáneas del navegador no son una copia entre dispositivos.",
        },
      ],
    },
    closing:
      "Falsifi funciona mejor con una pregunta falsable, fuentes verificables y un registro explícito de qué te haría cambiar de opinión.",
  },
};

const SECTION_ICONS = [
  Info,
  Search,
  BarChart3,
  SlidersHorizontal,
  FileText,
  Link2,
  Calculator,
  History,
  ShieldCheck,
  BookOpen,
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
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);
  const sections = [
    ["guide-overview", copy.overview.nav],
    ["guide-quick-start", copy.quickStart.nav],
    ["guide-results", copy.results.nav],
    ["guide-stress", copy.stress.nav],
    ["guide-evidence", copy.evidence.nav],
    ["guide-audit", copy.audit.nav],
    ["guide-method", copy.method.nav],
    ["guide-history", copy.history.nav],
    ["guide-limits", copy.limits.nav],
    ["guide-faq", copy.faq.nav],
  ] as const;

  return (
    <section className="guide-page" aria-labelledby="guide-title">
      <header className="guide-hero">
        <div>
          <span className="picker-eyebrow">
            <i />
            {copy.duration}
          </span>
          <h1 id="guide-title" ref={titleRef} tabIndex={-1}>
            {copy.title}
          </h1>
          <p>{copy.subtitle}</p>
        </div>
        <button className="button secondary" onClick={onClose}>
          <ArrowLeft size={15} />
          {hasCase ? copy.backToAnalysis : copy.backToPicker}
        </button>
      </header>

      <div className="guide-layout">
        <nav className="guide-toc" aria-label={copy.toc}>
          <strong>{copy.toc}</strong>
          {sections.map(([id, label], index) => {
            const Icon = SECTION_ICONS[index];
            return (
              <a href={`#${id}`} key={id}>
                <Icon size={15} />
                {label}
              </a>
            );
          })}
        </nav>

        <article className="guide-article">
          <section id="guide-overview" className="guide-section">
            <span className="guide-kicker">01</span>
            <h2>{copy.overview.title}</h2>
            <p>{copy.overview.body}</p>
            <div className="guide-callout">
              <ShieldCheck size={20} />
              <p>{copy.overview.callout}</p>
            </div>
          </section>

          <section id="guide-quick-start" className="guide-section">
            <span className="guide-kicker">02</span>
            <h2>{copy.quickStart.title}</h2>
            <p>{copy.quickStart.intro}</p>
            <div className="guide-step-grid">
              {copy.quickStart.steps.map((item) => (
                <div key={item.title}>
                  <CheckCircle2 size={17} />
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="guide-results" className="guide-section">
            <span className="guide-kicker">03</span>
            <h2>{copy.results.title}</h2>
            <p>{copy.results.intro}</p>
            <div className="guide-subheading">
              <Database size={17} />
              <span>{copy.results.nav}</span>
            </div>
            <div className="guide-definition-list">
              {[...copy.results.market, ...copy.results.metrics].map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
            <div className="guide-example">
              <Info size={17} />
              <p>{copy.results.example}</p>
            </div>
          </section>

          <section id="guide-stress" className="guide-section">
            <span className="guide-kicker">04</span>
            <h2>{copy.stress.title}</h2>
            <p>{copy.stress.intro}</p>
            <div className="guide-definition-list">
              {copy.stress.items.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
            <h3 className="guide-inline-title">{copy.stress.modesTitle}</h3>
            <div className="guide-mode-grid">
              {copy.stress.modes.map((item) => (
                <div key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
            <p className="guide-footnote">{copy.stress.boundary}</p>
          </section>

          <section id="guide-evidence" className="guide-section">
            <span className="guide-kicker">05</span>
            <h2>{copy.evidence.title}</h2>
            <p>{copy.evidence.intro}</p>
            <div className="guide-definition-list">
              {copy.evidence.fields.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
            <h3 className="guide-inline-title">
              {copy.evidence.groupingTitle}
            </h3>
            <ul className="guide-list">
              {copy.evidence.grouping.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="guide-callout muted">
              <Link2 size={20} />
              <p>{copy.evidence.warning}</p>
            </div>
          </section>

          <section id="guide-audit" className="guide-section">
            <span className="guide-kicker">06</span>
            <h2>{copy.audit.title}</h2>
            <p>{copy.audit.intro}</p>
            <div className="guide-definition-list">
              {copy.audit.items.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="guide-method" className="guide-section">
            <span className="guide-kicker">07</span>
            <h2>{copy.method.title}</h2>
            <p>{copy.method.intro}</p>
            <div className="guide-definition-list">
              {copy.method.items.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="guide-history" className="guide-section">
            <span className="guide-kicker">08</span>
            <h2>{copy.history.title}</h2>
            <p>{copy.history.intro}</p>
            <ul className="guide-list">
              {copy.history.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section id="guide-limits" className="guide-section">
            <span className="guide-kicker">09</span>
            <h2>{copy.limits.title}</h2>
            <p>{copy.limits.intro}</p>
            <ul className="guide-list">
              {copy.limits.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section id="guide-faq" className="guide-section">
            <span className="guide-kicker">10</span>
            <h2>{copy.faq.title}</h2>
            <div className="guide-faq">
              {copy.faq.items.map((item) => (
                <details key={item.title}>
                  <summary>{item.title}</summary>
                  <p>{item.body}</p>
                </details>
              ))}
            </div>
            <div className="guide-closing">
              <BookOpen size={22} />
              <p>{copy.closing}</p>
            </div>
          </section>
        </article>
      </div>
    </section>
  );
}
