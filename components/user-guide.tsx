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
    title: "Falsifi 0.5 user guide",
    subtitle:
      "A practical workflow for turning a stock idea into a reviewable, falsifiable research case.",
    duration: "About 10 minutes",
    backToAnalysis: "Back to analysis",
    backToPicker: "Back to stock search",
    toc: "On this page",
    overview: {
      nav: "What Falsifi does",
      title: "What Falsifi does—and does not do",
      body:
        "Falsifi helps you state a falsifiable research claim, record what would invalidate it, organize related evidence without double-counting one source, and test which evidence or scenario change would alter the current model assessment.",
      callout:
        "Automatic price and volume data is market context only. Falsifi does not forecast returns, calculate a target price, recommend a trade, or connect to a brokerage. Its 0–100 rule score is not a probability.",
    },
    quickStart: {
      nav: "Quick start",
      title: "Recommended research workflow",
      intro:
        "Use this order. The research-readiness check deliberately keeps an automatic market snapshot from looking like a completed analysis.",
      steps: [
        {
          title: "1. Choose the stock and verify the quote",
          body:
            "Choose a market, search by company name or ticker, and confirm the company, exchange, currency, market-data time, provider, and price basis. Quotes can be delayed or incomplete.",
        },
        {
          title: "2. Define the research case",
          body:
            "Write a specific, falsifiable research claim, choose its time horizon and purpose, state an observable invalidation condition, and set a review date.",
        },
        {
          title: "3. Add primary-source evidence",
          body:
            "Add and link the issuer’s original disclosure or a relevant exchange or regulatory filing. Record its date, direction, source group, claim group, reliability, and limitations.",
        },
        {
          title: "4. Seek counter-evidence and different sources",
          body:
            "Actively add evidence that could weaken the claim. Prefer sources that do not merely repeat the same document or underlying claim, and declare relationships when they do.",
        },
        {
          title: "5. Complete the research-readiness check",
          body:
            "Follow the displayed next research action until the case has a defined claim, invalidation condition, primary evidence, counter-evidence, source diversity, and a review date.",
        },
        {
          title: "6. Then use the advanced stress tests",
          body:
            "Only after the case is reviewable, inspect the rule score, group-level flip test, scenario sensitivity, contribution concentration, and model robustness. These remain model diagnostics, not investment signals.",
        },
        {
          title: "7. Save a baseline, refresh, and compare",
          body:
            "Save the case as a baseline. At the review date, refresh market data and inspect what changed since that baseline before editing the claim or evidence. Export JSON for a portable backup.",
        },
      ],
    },
    results: {
      nav: "Read the results",
      title: "How to read context, readiness, and results",
      intro:
        "The automatic case uses roughly one year of daily prices and, when available, volume. It requires at least 200 valid daily observations, but it is only background for starting research—not a completed stock analysis.",
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
            "The automatic case creates four directional observations: price versus SMA200, SMA50 versus SMA200, 3-month return, and the available return over roughly one year. Being at or above the stated comparator in the first two, and nonnegative momentum in the last two, supports the model score; the opposite results weaken it. Volatility, drawdown, RSI, and volume remain market metrics or scenario inputs without an assumed positive or negative direction. All are context, not validated trading rules, fundamental evidence, or a conclusion about the company.",
        },
      ],
      metrics: [
        {
          title: "Research readiness",
          body:
            "The readiness check asks whether the case has a defined claim, an observable invalidation condition, primary-source evidence, manually added counter-evidence, enough source and claim diversity, and a review date. It checks process completeness, not investment quality.",
        },
        {
          title: "Next research action",
          body:
            "The action panel points to the first missing requirement—for example defining the case, adding a filing, seeking counter-evidence, adding a different evidence group, or saving a baseline. Complete that task before adding more model complexity.",
        },
        {
          title: "Current assessment",
          body:
            "Advanced diagnostics are meaningful only after the readiness check. With the default thresholds, favorable means 58 or higher, neutral means 42 or higher but below 58, and cautious means below 42. These labels describe the configured rule model only.",
        },
        {
          title: "Rule score",
          body:
            "Each enabled item contributes its signed assigned impact multiplied by its reliability. Related items are averaged within their related evidence group; the group contributions are then added to the base score together with configured scenario changes. Repeating the same source or claim therefore does not multiply its weight. The score is not a probability.",
        },
        {
          title: "Model robustness",
          body:
            "This internal diagnostic combines the group-level flip buffer, concentration of contribution across groups, the nearest scenario-input buffer, and distance to an assessment threshold. No enabled evidence produces 0 robustness; if one related evidence group alone determines the assessment, robustness is capped at 33. It is not price stability or investment safety.",
        },
        {
          title: "Related evidence groups",
          body:
            "Evidence linked by a shared original source, shared claim, or declared dependency is grouped together. Separate groups have not been proven statistically independent.",
        },
      ],
      example:
        "An automatic case shows 4 trend and momentum observations in 1 related evidence group because all four come from the same price history. It remains marked as market context until you define the case and add verifiable, diverse research evidence.",
    },
    stress: {
      nav: "Run stress tests",
      title: "Use the stress-test workspace",
      intro:
        "Use these advanced diagnostics after the case passes the research-readiness check. They answer counterfactual questions inside the configured rule model; they do not estimate what will happen in the market.",
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
        "The automatic case is market context only. Build the research case with original company or regulatory material, explicit counter-evidence, and sources that do not simply repeat one document or claim.",
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
        "Scoring averages the signed contributions of enabled items within each related evidence group, then adds the group contributions. Grouping therefore prevents repeated material from multiplying its weight, but you must still verify whether group IDs and declared dependencies are accurate.",
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
            "An internal index based on squared shares of each related evidence group’s absolute contribution after within-group averaging. A higher value means fewer groups account for more of the model impact.",
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
            "For each enabled item, calculate direction × assigned impact × reliability. Average those contributions inside each related evidence group, add the resulting group contributions, then add configured scenario-input changes to the base score. The result is limited to 0–100.",
        },
        {
          title: "Relationship grouping",
          body:
            "Shared source-group IDs, claim-group IDs, and imported dependency links form connected related evidence groups. Items inside a group are averaged for scoring; grouping reduces repeated-source weight but does not prove that different groups are independent.",
        },
        {
          title: "Discrete searches",
          body:
            "Item and group searches test sets up to four. One- and two-variable searches use each input’s declared step and bounds; the two-variable search is limited to 100,000 states and is labeled sampled when the full step grid exceeds that budget.",
        },
        {
          title: "Model-robustness score",
          body:
            "The diagnostic considers how many whole related evidence groups must change the assessment, how concentrated group contributions are, the nearest tested scenario-input threshold, and the current score’s threshold distance. With no enabled evidence it is 0; when one group alone determines the assessment it cannot exceed 33. A threshold not found within the tested range is not proof of safety.",
        },
      ],
    },
    history: {
      nav: "Save and restore",
      title: "Snapshots, import, and export",
      intro:
        "Save a baseline once the research case is reviewable, and save again before changing an important input, removing evidence, restoring an older case, or switching stocks.",
      items: [
        "“Refresh market data” updates the current quote-derived context while preserving the confirmed research claim, horizon, invalidation condition, review date, manual evidence, and custom scenario inputs.",
        "The action panel compares refreshed price, 3-month momentum, volatility, and drawdown with the latest saved baseline. Treat the comparison as a review prompt, not an automatic thesis update.",
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
        "The default case uses price and volume indicators only as market context. It does not automatically analyze financial statements, valuation, news, industry structure, or management quality.",
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
          title: "Why do the 4 automatic observations form one related group?",
          body:
            "They all come from the same price history. Several calculations from one dataset do not create separate original sources.",
        },
        {
          title: "Does a high score mean I should buy?",
          body:
            "No. A score is hidden or secondary until the research case is ready, and even then it only reflects the configured groups, inputs, and thresholds. It is not expected return, win probability, suitability, or a recommendation.",
        },
        {
          title: "Why does the automatic case say “market context”?",
          body:
            "Price and volume can show what the stock has done, but not why the business is attractive or what would invalidate that view. Define a falsifiable claim and add primary, counter, and genuinely different evidence before using advanced diagnostics.",
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
    title: "Falsifi 0.5 使用指南",
    subtitle: "从选择股票到定期复核，一步步建立可核查、可证伪的研究案例。",
    duration: "约 10 分钟",
    backToAnalysis: "返回分析",
    backToPicker: "返回选股",
    toc: "本页目录",
    overview: {
      nav: "工具用途",
      title: "Falsifi 能做什么，不能做什么",
      body:
        "Falsifi 用来明确一项可证伪的研究判断，记录判断失效条件，避免把同源信息重复计分，并测试哪些证据或情景变化足以改变当前的模型判断。",
      callout:
        "自动获取的价格和成交量只能作为行情背景。Falsifi 不预测收益，不计算目标价，不推荐买卖，也不连接券商。0–100 分是内部规则评分，不是概率。",
    },
    quickStart: {
      nav: "快速开始",
      title: "建议的研究流程",
      intro:
        "建议始终按这个顺序操作。研究就绪检查会把自动行情与完整研究明确分开。",
      steps: [
        {
          title: "1. 选择股票并核查行情",
          body:
            "选择市场，按公司名称或股票代码搜索；核对公司、交易所、币种、行情时间、数据提供方和价格口径。行情可能延迟或不完整。",
        },
        {
          title: "2. 定义可证伪的研究判断",
          body:
            "写下具体的研究判断，选择研究用途和期限，说明一个可以观察、能够使判断失效的条件，并设置复核日期。",
        },
        {
          title: "3. 添加公司或监管原始资料",
          body:
            "添加并链接公司原始披露、交易所公告或监管文件；记录资料日期、证据方向、来源组、论点组、可靠性和使用限制。",
        },
        {
          title: "4. 主动寻找反向证据和不同来源",
          body:
            "主动加入可能削弱研究判断的证据。优先寻找没有重复同一份材料或同一个底层主张的来源；存在关联时应如实归组。",
        },
        {
          title: "5. 完成研究就绪检查",
          body:
            "按照页面给出的“下一步研究行动”，补齐研究判断、失效条件、原始资料、反向证据、来源多样性和复核日期。",
        },
        {
          title: "6. 通过检查后再看高级压力测试",
          body:
            "案例达到研究就绪状态后，再查看规则评分、关联证据组翻转测试、情景敏感性、贡献集中度和模型内稳健度。它们仍是模型诊断，不是投资信号。",
        },
        {
          title: "7. 保存基准，刷新后比较变化",
          body:
            "保存当前案例作为比较基准。到复核日期后刷新行情，先看相对基准发生了什么变化，再修改研究判断或证据；需要跨设备备份时导出 JSON。",
        },
      ],
    },
    results: {
      nav: "理解结果",
      title: "如何阅读行情背景、研究就绪状态与结果",
      intro:
        "自动案例使用约一年的日线价格，以及可用时的成交量，至少需要 200 个有效日度数据点。它只是开始研究时的行情背景，不是完整的股票分析。",
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
            "自动案例只生成 4 条带方向的观察：价格相对 200 日均线、50 日均线相对 200 日均线、3 个月涨跌幅，以及当前可用的约一年涨跌幅。前两项不低于对应比较基准、后两项动量不为负时支持模型评分，反之削弱。波动率、最大回撤、RSI 和成交量仍会作为行情指标或情景参数显示，但系统不会预设它们是利好还是利空。所有这些都只是行情背景，不是经过验证的交易规则、基本面证据或公司分析结论。",
        },
      ],
      metrics: [
        {
          title: "研究就绪检查",
          body:
            "检查案例是否具备明确判断、可观察的失效条件、公司或监管原始资料、手动添加的反向证据、足够的来源与论点多样性，以及复核日期。它检查研究流程是否完整，不评价投资是否优质。",
        },
        {
          title: "下一步研究行动",
          body:
            "行动面板会指出当前最先要补的事项，例如定义研究案例、添加监管文件、寻找反向证据、补充不同的关联证据组或保存基准。应先完成该任务，再增加模型复杂度。",
        },
        {
          title: "当前判断",
          body:
            "高级诊断只有在通过研究就绪检查后才具有可解释性。按默认阈值，58 分及以上为偏积极，42 分及以上但低于 58 分为中性，低于 42 分为偏谨慎。这些标签只描述当前配置的规则模型。",
        },
        {
          title: "规则评分",
          body:
            "每条已启用证据先按“方向×设定影响分×可靠性”计算贡献；同一关联证据组内取平均，再把各组贡献与设定的情景参数变化加到基础分上。同源或同一论点的重复材料因此不会成倍增加权重。它不是概率。",
        },
        {
          title: "模型内稳健度",
          body:
            "这项内部诊断综合关联证据组级翻转缓冲、各组贡献集中度、最近情景参数临界缓冲，以及当前评分到判断阈值的距离。没有已启用证据时为 0；如果一个关联证据组就能决定判断，最高为 33。它不代表股价稳定或投资安全。",
        },
        {
          title: "关联证据组",
          body:
            "共享原始来源、共享研究主张或存在已声明依赖关系的证据会被归为一组。不同组并不等于已经过统计独立性检验。",
        },
      ],
      example:
        "自动案例显示“4 条趋势与动量观察 · 1 个关联证据组”。4 条观察都来自同一份价格历史；在定义研究案例并补充可核验且来源不同的研究证据前，页面会一直把它标为“行情背景”。",
    },
    stress: {
      nav: "压力测试",
      title: "如何使用压力测试工作台",
      intro:
        "案例通过研究就绪检查后，再使用这些高级诊断。压力测试回答的是当前规则模型里的反事实问题，并不估计市场接下来会发生什么。",
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
        "自动案例只是行情背景。研究案例应加入公司或监管原始资料、明确的反向证据，以及没有简单重复同一份材料或同一论点的其他来源。",
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
        "评分会先对每个关联证据组内已启用证据的有方向贡献取平均，再把各组贡献相加。归组可以防止重复材料成倍增加权重，但仍需核对来源组、论点组和依赖关系是否填写准确。",
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
            "共享来源、共享研究主张或导入依赖关系的证据会归入同一关联证据组。“已归并项”=已启用证据数−关联证据组数，不是内容重复检测结果。",
        },
        {
          title: "影响集中度（0–100）",
          body:
            "这是内部指数，按组内平均后各关联证据组的绝对贡献占比平方和计算。数值越高，说明模型影响越集中在少数关联证据组。",
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
            "先计算每条已启用证据的“方向×设定影响分×可靠性”，在每个关联证据组内取平均，再把各组贡献和设定的情景参数变化加到基础分上，最后限制在 0–100。自动案例基础分为 50。",
        },
        {
          title: "证据关系归组",
          body:
            "相同来源组 ID、相同论点组 ID 或导入的依赖链接会形成关联证据组。组内证据会在评分时取平均，以减少重复来源的权重；但这不能证明不同关联证据组彼此独立。",
        },
        {
          title: "离散搜索",
          body:
            "逐条证据和关联证据组最多测试四项组合；单因素和双因素搜索按每个参数声明的步长与边界进行。双因素完整步长网格最多计算 100,000 个状态，超过后会明确标为抽样搜索。",
        },
        {
          title: "模型内稳健度",
          body:
            "这项诊断考虑：改变判断至少需要影响多少个完整关联证据组、各组贡献是否过度集中、最近的情景参数临界值，以及当前评分到判断阈值的距离。没有已启用证据时为 0；一个关联证据组就能决定判断时最高为 33。测试范围内未找到临界值，也不等于安全。",
        },
      ],
    },
    history: {
      nav: "保存与恢复",
      title: "快照、导入与导出",
      intro:
        "案例达到研究就绪状态后，先保存一个比较基准；修改重要情景参数、删除证据、恢复旧版本或更换股票前也应保存。",
      items: [
        "“刷新行情”会更新由价格和成交量生成的行情背景，同时保留已确认的研究判断、期限、失效条件、复核日期、手动证据和自定义情景参数。",
        "行动面板会比较刷新后与最近保存基准之间的价格、3 个月动量、波动率和最大回撤变化。它用于提示复核，不会自动修改研究判断。",
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
        "默认案例只把价格和成交量指标作为行情背景，不会自动分析财务报表、估值、新闻、行业结构或管理层质量。",
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
          title: "为什么 4 条自动观察只有 1 个关联证据组？",
          body:
            "因为它们都由同一份价格历史计算而来。同一数据集的多种计算方式，不会变成多个原始信息来源。",
        },
        {
          title: "分数高是不是就应该买入？",
          body:
            "不是。研究案例未就绪时，评分只应处于次要位置；即使案例已就绪，评分也只反映当前配置的关联证据组、参数和阈值，不是预期收益、上涨概率、适当性判断或投资建议。",
        },
        {
          title: "为什么自动案例显示“行情背景”？",
          body:
            "价格和成交量只能说明股票过去如何变化，不能说明企业为什么值得研究，也不能替你定义什么事实会推翻判断。先写出可证伪判断，再补充原始资料、反向证据和真正不同的来源。",
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
    title: "Falsifi 0.5 利用ガイド",
    subtitle:
      "銘柄の選択から定期レビューまで、検証可能で反証可能なリサーチケースの作り方を説明します。",
    duration: "約10分",
    backToAnalysis: "分析に戻る",
    backToPicker: "銘柄検索に戻る",
    toc: "目次",
    overview: {
      nav: "できること",
      title: "Falsifi ができること・できないこと",
      body:
        "Falsifi は、反証可能なリサーチ仮説とその無効化条件を記録し、同じ情報源の二重計上を抑え、どのエビデンスやシナリオ変化で現在のモデル評価が変わるかを検証するためのツールです。",
      callout:
        "自動取得した価格・出来高は市場コンテキストにすぎません。将来リターンや目標株価を予測せず、売買を推奨せず、証券会社にも接続しません。0～100のルールスコアは確率ではありません。",
    },
    quickStart: {
      nav: "クイックスタート",
      title: "推奨リサーチ手順",
      intro:
        "この順序で進めてください。リサーチ準備チェックにより、自動の市場スナップショットと完成した分析を明確に区別します。",
      steps: [
        {
          title: "1. 銘柄を選び、市場データを確認する",
          body:
            "市場を選び、企業名またはティッカーで検索します。企業、取引所、通貨、市場データ時刻、提供元、価格基準を確認してください。データは遅延・欠損する場合があります。",
        },
        {
          title: "2. 反証可能なリサーチ仮説を定義する",
          body:
            "具体的な仮説、目的、対象期間を記入し、観測可能な無効化条件と次の見直し日を設定します。",
        },
        {
          title: "3. 企業・規制当局の一次資料を追加する",
          body:
            "企業の原資料、取引所開示、規制当局への提出書類を追加してリンクします。日付、方向、情報源グループ、主張グループ、信頼性、制約を記録します。",
        },
        {
          title: "4. 反対材料と異なる情報源を探す",
          body:
            "仮説を弱め得るエビデンスを意識的に追加します。同じ文書や主張の繰り返しではない情報源を優先し、関係がある場合は正しくグループ化します。",
        },
        {
          title: "5. リサーチ準備チェックを完了する",
          body:
            "画面に表示される「次のリサーチ作業」に従い、仮説、無効化条件、一次資料、反対材料、情報源の多様性、見直し日をそろえます。",
        },
        {
          title: "6. 準備完了後に高度なストレステストを使う",
          body:
            "レビュー可能になってから、ルールスコア、関連エビデンス群の反転テスト、シナリオ感応度、寄与の集中度、モデル内の頑健性を確認します。いずれも投資シグナルではありません。",
        },
        {
          title: "7. 基準を保存し、更新後の変化を確認する",
          body:
            "現在のケースを比較基準として保存します。見直し日に市場データを更新し、仮説やエビデンスを編集する前に基準からの変化を確認します。持ち運べるバックアップにはJSONを使います。",
        },
      ],
    },
    results: {
      nav: "結果の読み方",
      title: "市場コンテキスト、準備状況、結果の読み方",
      intro:
        "自動ケースは約1年分の日次価格と、利用可能な場合は出来高を使い、200件以上の有効な日次データを必要とします。ただし、これはリサーチ開始時の市場コンテキストであり、完成した銘柄分析ではありません。",
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
            "自動ケースが方向を付けるのは4項目です。価格とSMA200の関係、SMA50とSMA200の関係、3か月リターン、利用可能な約1年リターンです。前の2項目が比較対象以上、後の2項目が0以上ならモデルスコアを支持し、逆なら弱めます。ボラティリティ、最大ドローダウン、RSI、出来高は市場指標またはシナリオ入力として残りますが、正負の方向は仮定しません。すべて市場コンテキストであり、検証済みの売買ルール、ファンダメンタルズのエビデンス、企業に対する分析結論ではありません。",
        },
      ],
      metrics: [
        {
          title: "リサーチ準備チェック",
          body:
            "仮説、観測可能な無効化条件、企業または規制当局の一次資料、手動で追加した反対材料、十分な情報源・主張の多様性、見直し日があるかを確認します。手順の充足度を確認するもので、投資対象の質を評価するものではありません。",
        },
        {
          title: "次のリサーチ作業",
          body:
            "アクション欄は、ケースの定義、提出書類の追加、反対材料の探索、別の関連エビデンス群の追加、基準の保存など、最初に不足している作業を示します。モデルを複雑にする前に、その作業を終えてください。",
        },
        {
          title: "現在の評価",
          body:
            "高度な診断は、リサーチ準備チェックを通過してから解釈してください。既定値では58以上が前向き、42以上58未満が中立、42未満が慎重です。ラベルは設定されたルールモデルだけを表します。",
        },
        {
          title: "ルールスコア",
          body:
            "各有効項目は、方向×設定した影響度×信頼性で寄与を計算します。関連エビデンス群の中で平均し、その群ごとの寄与と設定済みのシナリオ変化を基準スコアに加えます。同じ情報源や主張を繰り返してもウェイトは倍増しません。確率ではありません。",
        },
        {
          title: "モデル内の頑健性",
          body:
            "関連エビデンス群単位の反転余力、群ごとの寄与集中度、最も近いシナリオ入力の余力、評価しきい値までの距離を組み合わせた内部診断です。有効なエビデンスがなければ0、1つの関連エビデンス群だけで評価が決まる場合は最大33です。株価の安定性や投資の安全性ではありません。",
        },
        {
          title: "関連エビデンス群",
          body:
            "同じ原資料、同じ主張、または指定された依存関係で結ばれた項目をまとめます。別の群でも統計的独立性が証明されたわけではありません。",
        },
      ],
      example:
        "自動ケースは「トレンド・モメンタム観測4件・関連エビデンス群1件」です。4件とも同じ価格履歴から計算されます。ケースを定義し、検証可能で異なる情報源のリサーチエビデンスを追加するまで、「市場コンテキスト」として表示されます。",
    },
    stress: {
      nav: "ストレステスト",
      title: "ストレステスト画面の使い方",
      intro:
        "リサーチ準備チェックを通過してから使う高度な診断です。現在のルールモデル内の反実仮想を調べるもので、市場の将来を推定するものではありません。",
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
        "自動ケースは市場コンテキストにすぎません。企業または規制当局の一次資料、明確な反対材料、同じ文書や主張を単に繰り返さない別の情報源でリサーチケースを作ります。",
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
        "スコアは、各関連エビデンス群内の有効項目について方向付き寄与を平均し、その後に群ごとの寄与を加算します。これにより同じ材料の繰り返しによるウェイト増加を抑えますが、情報源グループ、主張グループ、依存関係が正しいかは確認が必要です。",
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
            "群内平均後の各関連エビデンス群の絶対寄与の比率を二乗して計算する内部指数です。高いほど、少数の群に影響が集中しています。",
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
            "各有効項目について方向×設定した影響度×信頼性を計算し、関連エビデンス群の中で平均します。その群ごとの寄与と設定済みのシナリオ入力変化を基準スコアに加え、0～100に収めます。自動ケースの基準は50です。",
        },
        {
          title: "関係によるグループ化",
          body:
            "同じ情報源グループID、主張グループID、またはインポートした依存リンクで接続された項目が関連エビデンス群になります。群内平均により同じ情報源の反復ウェイトを抑えますが、異なる群の独立性を証明するものではありません。",
        },
        {
          title: "離散的な検索",
          body:
            "項目・関連グループの検索は最大4件の組み合わせまでです。1変数・2変数検索は各入力に設定された刻み幅と上下限を使います。2変数の完全な刻み幅グリッドが100,000状態を超える場合はサンプリング検索と明示します。",
        },
        {
          title: "モデル内の頑健性",
          body:
            "評価を変えるために必要な関連エビデンス群の数、群ごとの寄与集中度、最も近いシナリオ入力しきい値、現在スコアから評価しきい値までの距離を考慮します。有効なエビデンスがなければ0、1群だけで評価が決まる場合は最大33です。範囲内でしきい値が見つからなくても安全を意味しません。",
        },
      ],
    },
    history: {
      nav: "保存と復元",
      title: "スナップショット・インポート・エクスポート",
      intro:
        "リサーチケースがレビュー可能になったら比較基準を保存します。重要な入力変更、エビデンス削除、復元、銘柄変更の前にも保存してください。",
      items: [
        "「市場データを更新」は、確認済みの仮説、対象期間、無効化条件、見直し日、手動エビデンス、独自のシナリオ入力を維持したまま、価格・出来高由来の市場コンテキストを更新します。",
        "アクション欄は、更新後の価格、3か月モメンタム、ボラティリティ、最大ドローダウンを直近の保存基準と比較します。これは見直しのきっかけであり、仮説を自動変更するものではありません。",
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
        "既定ケースは価格と出来高を市場コンテキストとして使うだけで、財務諸表、バリュエーション、ニュース、業界構造、経営品質を自動分析しません。",
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
          title: "4つの自動観測が1つの関連エビデンス群になるのはなぜですか？",
          body:
            "すべて同じ価格履歴から計算されるためです。1つのデータセットから複数の計算をしても、原情報源は増えません。",
        },
        {
          title: "高スコアなら買うべきですか？",
          body:
            "いいえ。リサーチ準備前はスコアを補助的にしか扱えず、準備完了後も設定された関連エビデンス群、入力、しきい値を反映するだけです。期待収益、上昇確率、適合性、推奨ではありません。",
        },
        {
          title: "自動ケースが「市場コンテキスト」と表示されるのはなぜですか？",
          body:
            "価格と出来高は過去の動きを示しますが、企業を調べる理由や、どの事実で仮説が無効になるかは示しません。反証可能な仮説を定義し、一次資料、反対材料、実質的に異なる情報源を追加してから高度な診断を使ってください。",
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
    title: "Guía de uso de Falsifi 0.5",
    subtitle:
      "Un flujo práctico para convertir una idea sobre una acción en un caso de investigación verificable y refutable.",
    duration: "Unos 10 minutos",
    backToAnalysis: "Volver al análisis",
    backToPicker: "Volver a buscar acciones",
    toc: "En esta página",
    overview: {
      nav: "Qué hace",
      title: "Qué hace Falsifi y qué no hace",
      body:
        "Falsifi ayuda a formular una tesis de investigación refutable, registrar qué la invalidaría, organizar evidencias relacionadas sin contar dos veces una misma fuente y comprobar qué cambio de evidencia o escenario modificaría la evaluación del modelo.",
      callout:
        "Los datos automáticos de precio y volumen son solo contexto de mercado. Falsifi no pronostica rentabilidades, no calcula precios objetivo, no recomienda operaciones y no se conecta a un bróker. La puntuación de 0 a 100 no es una probabilidad.",
    },
    quickStart: {
      nav: "Inicio rápido",
      title: "Flujo de investigación recomendado",
      intro:
        "Sigue este orden. La comprobación de preparación evita que una instantánea automática de mercado parezca un análisis terminado.",
      steps: [
        {
          title: "1. Elige la acción y verifica la cotización",
          body:
            "Elige un mercado, busca por empresa o ticker y confirma empresa, bolsa, moneda, hora del dato, proveedor y base de precios. Los datos pueden estar retrasados o incompletos.",
        },
        {
          title: "2. Define una tesis de investigación refutable",
          body:
            "Escribe una tesis concreta, elige su finalidad y horizonte temporal, define un criterio observable que la invalidaría y fija una fecha de revisión.",
        },
        {
          title: "3. Añade fuentes primarias de la empresa o del regulador",
          body:
            "Añade y enlaza la publicación original del emisor o un documento relevante de la bolsa o del regulador. Registra fecha, dirección, grupo de fuente, grupo de afirmación, fiabilidad y limitaciones.",
        },
        {
          title: "4. Busca activamente contraevidencia y fuentes distintas",
          body:
            "Añade evidencias que puedan debilitar la tesis. Da prioridad a fuentes que no repitan el mismo documento o la misma afirmación subyacente, y declara las relaciones cuando existan.",
        },
        {
          title: "5. Completa la comprobación de preparación",
          body:
            "Sigue la «próxima tarea de investigación» hasta tener una tesis definida, criterio de invalidación, fuente primaria, contraevidencia, diversidad de fuentes y fecha de revisión.",
        },
        {
          title: "6. Usa después las pruebas de estrés avanzadas",
          body:
            "Solo cuando el caso sea revisable, examina la puntuación, el cambio por grupos, la sensibilidad del escenario, la concentración de contribuciones y la robustez del modelo. Siguen siendo diagnósticos, no señales de inversión.",
        },
        {
          title: "7. Guarda una referencia, actualiza y compara",
          body:
            "Guarda el caso como referencia. En la fecha de revisión, actualiza los datos de mercado y comprueba qué cambió respecto a esa referencia antes de editar la tesis o sus evidencias. Exporta JSON para una copia portátil.",
        },
      ],
    },
    results: {
      nav: "Leer resultados",
      title: "Cómo leer el contexto, la preparación y los resultados",
      intro:
        "El caso automático usa aproximadamente un año de precios diarios y, si existe, volumen. Requiere al menos 200 observaciones válidas, pero solo aporta contexto para iniciar la investigación; no es un análisis bursátil completo.",
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
            "El caso automático solo asigna dirección a cuatro observaciones: precio frente a SMA200, SMA50 frente a SMA200, rentabilidad a 3 meses y rentabilidad disponible de aproximadamente un año. Estar en o por encima del comparador en las dos primeras y tener impulso no negativo en las dos últimas apoya la puntuación; lo contrario la debilita. Volatilidad, drawdown máximo, RSI y volumen siguen como métricas de mercado o variables de escenario, sin presuponer que sean favorables o desfavorables. Todo ello es contexto, no reglas de negociación validadas, evidencias fundamentales ni una conclusión sobre la empresa.",
        },
      ],
      metrics: [
        {
          title: "Preparación de la investigación",
          body:
            "La comprobación verifica que haya una tesis definida, un criterio de invalidación observable, una fuente primaria, contraevidencia añadida manualmente, suficiente diversidad de fuentes y afirmaciones, y una fecha de revisión. Mide si el proceso está completo, no la calidad de la inversión.",
        },
        {
          title: "Próxima tarea de investigación",
          body:
            "El panel de acciones señala el primer requisito que falta: por ejemplo, definir el caso, añadir una presentación regulatoria, buscar contraevidencia, incorporar otro grupo de evidencias relacionadas o guardar una referencia. Haz esa tarea antes de complicar el modelo.",
        },
        {
          title: "Evaluación actual",
          body:
            "Los diagnósticos avanzados solo son interpretables tras completar la comprobación de preparación. Con los umbrales predeterminados, favorable es 58 o más; neutral, desde 42 hasta menos de 58; y prudente, menos de 42. Son etiquetas del modelo configurado.",
        },
        {
          title: "Puntuación basada en reglas",
          body:
            "Cada evidencia activa aporta dirección × impacto asignado × fiabilidad. Las aportaciones se promedian dentro de cada grupo de evidencias relacionadas y después se suman los grupos y los cambios de escenario configurados a la puntuación base. Repetir una misma fuente o afirmación no multiplica su peso. No es una probabilidad.",
        },
        {
          title: "Robustez dentro del modelo",
          body:
            "Diagnóstico interno que combina el margen de cambio por grupos, la concentración de aportaciones entre grupos, el margen hasta la variable de escenario más cercana y la distancia hasta un umbral de evaluación. Sin evidencias activas vale 0; si un solo grupo determina la evaluación, no puede superar 33. No mide estabilidad del precio ni seguridad de la inversión.",
        },
        {
          title: "Grupos de evidencias relacionadas",
          body:
            "Agrupa elementos con una fuente original, afirmación o dependencia declarada común. Los grupos separados no han demostrado independencia estadística.",
        },
      ],
      example:
        "El caso automático muestra «4 observaciones de tendencia e impulso · 1 grupo de evidencias relacionadas», porque las cuatro proceden del mismo historial de precios. Sigue marcado como contexto de mercado hasta que definas el caso y añadas evidencias verificables y diversas.",
    },
    stress: {
      nav: "Pruebas de estrés",
      title: "Cómo usar las pruebas de estrés",
      intro:
        "Usa estos diagnósticos avanzados después de completar la comprobación de preparación. Responden preguntas contrafactuales dentro del modelo actual; no estiman lo que ocurrirá en el mercado.",
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
        "El caso automático solo aporta contexto de mercado. Construye el caso con material original de la empresa o del regulador, contraevidencia explícita y fuentes que no repitan simplemente el mismo documento o argumento.",
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
        "La puntuación promedia la aportación con signo de las evidencias activas dentro de cada grupo de evidencias relacionadas y después suma los grupos. Así se evita que el material repetido multiplique su peso, pero todavía debes comprobar que los grupos de fuente y afirmación y las dependencias sean correctos.",
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
            "Índice interno basado en la suma de los cuadrados de la cuota de aportación absoluta de cada grupo después del promedio interno. Un valor alto indica que pocos grupos concentran más impacto.",
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
            "Calcula dirección × impacto asignado × fiabilidad para cada evidencia activa, promedia esas aportaciones dentro de cada grupo de evidencias relacionadas y suma las aportaciones de los grupos y los cambios de escenario configurados a la base. El resultado se limita a 0–100; el caso automático parte de 50.",
        },
        {
          title: "Agrupación por relaciones",
          body:
            "Los mismos ID de grupo de fuente o afirmación y los enlaces de dependencia importados forman grupos conectados. Los elementos se promedian dentro del grupo para reducir el peso de fuentes repetidas, pero los grupos distintos no quedan demostrados como independientes.",
        },
        {
          title: "Búsquedas discretas",
          body:
            "Las búsquedas por elementos y grupos prueban conjuntos de hasta cuatro. Las búsquedas de una y dos variables usan el paso y los límites declarados. Si la cuadrícula completa de dos variables supera 100.000 estados, la interfaz la identifica como búsqueda por muestreo.",
        },
        {
          title: "Robustez dentro del modelo",
          body:
            "El diagnóstico considera cuántos grupos completos deben cambiar para modificar la evaluación, la concentración de sus aportaciones, el umbral de escenario probado más cercano y la distancia de la puntuación al umbral de evaluación. Sin evidencias activas vale 0; si un grupo basta para decidir la evaluación, el máximo es 33. No hallar un umbral en el rango probado no significa seguridad.",
        },
      ],
    },
    history: {
      nav: "Guardar y restaurar",
      title: "Instantáneas, importación y exportación",
      intro:
        "Guarda una referencia cuando el caso sea revisable y vuelve a guardar antes de cambiar una variable importante, eliminar evidencias, restaurar un caso o cambiar de acción.",
      items: [
        "«Actualizar datos de mercado» renueva el contexto derivado de precio y volumen, pero conserva la tesis confirmada, horizonte, criterio de invalidación, fecha de revisión, evidencias manuales y variables de escenario personalizadas.",
        "El panel compara precio, impulso a 3 meses, volatilidad y drawdown tras la actualización con la última referencia guardada. La comparación invita a revisar; no modifica automáticamente la tesis.",
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
        "El caso predeterminado solo usa precio y volumen como contexto de mercado; no analiza automáticamente estados financieros, valoración, noticias, sector ni calidad directiva.",
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
          title: "¿Por qué las 4 observaciones automáticas forman un solo grupo?",
          body:
            "Las cuatro proceden del mismo historial de precios. Varios cálculos sobre un conjunto de datos no crean nuevas fuentes originales.",
        },
        {
          title: "¿Una puntuación alta significa comprar?",
          body:
            "No. Antes de que el caso esté preparado, la puntuación solo es secundaria; incluso después refleja únicamente los grupos, variables y umbrales configurados. No es rentabilidad esperada, probabilidad, idoneidad ni recomendación.",
        },
        {
          title: "¿Por qué el caso automático dice «contexto de mercado»?",
          body:
            "El precio y el volumen muestran lo ocurrido, pero no explican por qué merece investigar la empresa ni qué hecho invalidaría la tesis. Define una tesis refutable y añade fuentes primarias, contraevidencia y fuentes realmente distintas antes de usar diagnósticos avanzados.",
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
