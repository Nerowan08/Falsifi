# Product position and public landscape review

**Review date:** July 30, 2026
**Scope:** public product pages and open-source repositories related to stock
research, thesis tracking, charting, scenario analysis, counter-evidence, and
research provenance.

## Honest conclusion

Falsifi v0.5 is not a stock predictor, buy/sell signal, or substitute for
primary research. Its defensible value is narrower:

> Record why a stock is worth researching, prevent repeated versions of the
> same source from looking like independent support, and identify the smallest
> tested change that would require the user to review the case.

No individual feature is unique. Charts, alerts, screeners, thesis journals,
scenario analysis, counterfactual explanations, evidence records, and
content-addressed snapshots all have public prior art. What is comparatively
uncommon in mainstream personal-investing tools is this combination:

```text
falsifiable claim + observable invalidation condition
→ research-readiness gate
→ related-evidence-group deduplication
→ smallest tested assessment change
→ change since saved baseline
→ next research action
```

That is a product-positioning statement, not a claim of being first, globally
unique, or impossible to reproduce.

## What the practical audit found

The v0.4 workflow could produce a polished score and a high robustness reading
from price-derived indicators alone. Because moving averages, momentum,
volatility, drawdown, and RSI all came from the same market series, this
presentation created false precision. Repeating same-source items could also
increase the score even though no new source had been added.

In that form, the product was easy to replace:

- a charting platform could provide the same market indicators;
- a spreadsheet or notebook could calculate thresholds;
- a notes app could store an investment thesis; and
- a general-purpose AI assistant could summarize the result.

The audit therefore rejected “more analysis” as the product goal. v0.5 instead
uses market-derived indicators only as context and requires the user to define
and support a reviewable research case.

### Real-market regression check

On July 30, 2026, the same one-year Yahoo Finance adapter was run through the
old and new product logic for four listed equities. These values test product
behavior; they are not investment conclusions:

| Ticker | v0.4 displayed output | v0.5 internal diagnostic | v0.5 default user status |
|---|---|---|---|
| AAPL | 72.6, favorable, robustness 100 | 54.5, neutral, robustness 33 | Market context only · 0/6 checks |
| TSLA | 25.3, cautious, robustness 100 | 46.3, neutral, robustness 41 | Market context only · 0/6 checks |
| 603901.SS | 24.0, cautious, robustness 100 | 45.8, neutral, robustness 38 | Market context only · 0/6 checks |
| 0700.HK | 35.8, cautious, robustness 74 | 46.9, neutral, robustness 46 | Market context only · 0/6 checks |

Every automatic case had four trend or momentum observations, but only one
related evidence group and 100% contribution concentration because every
observation came from the same market series. v0.5 therefore withholds the
assessment, rule score, and robustness from the default summary until the
research-readiness checks pass.

A separate regression copied one AAPL source-and-claim argument eight times.
The score stayed at `54.543`, the related-group count stayed at `1`, and
robustness stayed at `33`. This is the expected anti-duplication behavior. The
test is included in the automated engine suite.

## The v0.5 decision workflow

### 1. Research definition

The user records:

- the actual claim being evaluated;
- the intended time horizon;
- an observable condition that would invalidate the claim;
- the purpose of the review; and
- the next review date.

This turns a vague opinion into a claim that can be checked later. It still
does not make the claim correct.

### 2. Research-readiness gate

Automatically generated market indicators do not satisfy the evidence
requirements. A reviewable case needs:

- a confirmed, falsifiable research claim;
- an explicit invalidation condition;
- primary material such as a regulatory filing or company disclosure;
- deliberately recorded counter-evidence;
- at least three related evidence groups and at least two user-added evidence
  items; and
- a scheduled review date.

The gate is a workflow check, not a quality score. A case can pass all checks
and still be wrong, incomplete, or biased.

### 3. Related evidence groups

Items that share an original source, underlying claim, or declared dependency
belong to one related evidence group. Enabled item contributions inside a group
are averaged before the groups are added to the model score. Duplicating a
declared source therefore cannot multiply that group’s contribution.

This does not prove that separate groups are statistically independent, detect
copied wording, or discover undeclared relationships. Users must still classify
the evidence honestly.

### 4. Smallest tested assessment change

Falsifi removes whole related evidence groups and searches for the smallest
tested group combination that crosses the user-defined assessment threshold.
It also supports bounded one- and two-variable sensitivity checks.

The result means “this tested change crossed the model threshold.” It does not
mean the scenario is probable, economically realistic, or sufficient grounds
for a trade.

### 5. Baseline change and next action

A saved local snapshot provides a baseline for the next review. The action
summary shows what market context changed, which readiness requirement or
tested condition is weakest, and the next concrete research task. This is the
part intended to reduce repeated manual review rather than create another
dashboard to monitor.

## Existing alternatives

Publicly described products cover substantial parts of this workflow:

| Category | Examples | What they can replace |
|---|---|---|
| Charting, alerts, and replay | [TradingView](https://www.tradingview.com/) | Price charts, indicators, alerts, and historical review |
| Market and fundamental workspaces | [Koyfin](https://www.koyfin.com/), [TIKR](https://www.tikr.com/), [FinChat](https://finchat.io/) | Market data, screening, company fundamentals, estimates, and research summaries |
| Narrative and thesis tracking | [Simply Wall St Narratives](https://support.simplywall.st/hc/en-us/articles/13416018054415-Getting-Started-with-Narratives), [Horyzon Thesis Tracker](https://horyzonapp.com/investment-thesis-tracker/), [ThesesWatch](https://theseswatch.com/), [subThesis](https://www.subthesis.app/) | Thesis notes, assumptions, monitoring, and review reminders |
| AI research assistants | [Vexton](https://www.vexton.ai/), [Cleriq](https://www.cleriq.app/), [AlphaBrief](https://www.alphabrief.io/) | Research aggregation, summaries, and source discovery |
| Local open-source research systems | [Mira](https://github.com/byteseek/Mira), [StockSense-AI](https://github.com/Spkap/StockSense-AI), [Thesis Investment OS](https://github.com/youngseongshin/thesis-investment-os), [MingCang](https://github.com/Zeeechenn/MingCang) | Evidence logs, counter-evidence, thesis history, and local workflows |

The table is a bounded description of public positioning, not a certification
that any product lacks an undocumented feature. Products change, private
systems cannot be inspected, and a global completeness claim cannot be made.

## Where Falsifi is harder to replace

Falsifi is most useful when all of the following matter:

1. several notes may repeat one source or underlying claim;
2. the user wants counter-evidence recorded before conviction is displayed;
3. the user wants a reproducible related-group removal test rather than an AI
   opinion;
4. the user wants to compare the current case with a saved baseline; and
5. the output must end with a research task or review trigger, not a trade
   recommendation.

If the user only needs a price chart, indicator summary, stock screener, target
price, or generated buy/sell opinion, Falsifi is not the right tool and is easy
to replace.

## Methodological prior art

Falsifi did not invent counterfactual explanation or removal-based analysis:

- [Microsoft’s counterfactual analysis overview](https://learn.microsoft.com/en-us/azure/machine-learning/concept-counterfactual-analysis)
  describes finding small feature changes that produce a different decision.
- Covert, Lundberg, and Lee’s
  [Explaining by Removing](https://arxiv.org/abs/2011.14878) unifies explanation
  methods that remove inputs and measure the effect.

Accordingly:

- related-group removal is a removal-based explanation;
- the smallest tested assessment change is a bounded counterfactual search;
- one- and two-variable threshold checks are sensitivity analysis; and
- a SHA-256 snapshot is content addressing, not a trusted timestamp.

The product distinction is the integrated workflow and its explicit limits,
not a new mathematical method.

## Claims we can and cannot make

Reasonable:

> Falsifi is an evidence-first stock-research review tool. It combines a
> research-readiness gate, related-evidence-group deduplication, bounded
> threshold-change tests, baseline comparison, and next-action guidance—a
> combination that is uncommon in mainstream personal-investing tools.

Not reasonable:

- “the world’s first” or “globally unique”;
- “no one has ever done this”;
- “an AI stock-picking system”;
- “a patented or new counterfactual algorithm”;
- “proof that a thesis is correct”;
- “an objective confidence or probability score”; or
- “tamper-proof research history.”

## 中文摘要

Falsifi v0.5 不是股票预测器，也不提供买卖信号。它最实际的用途，是帮助用户
记录“为什么值得研究这只股票”，防止把同一来源的重复信息当成多份支持，并
找出在已测试范围内，什么最小变化会要求用户重新检查当前判断。

行情自动指标只提供背景。要形成可以复核的研究案例，用户必须写明可证伪判断、
可观察的失效条件、原始资料、反向证据、来源多样性和下次复核日期。同一关联
证据组内的贡献先取平均，再与其他组相加，以避免同源重复计分。

图表、提醒、研究笔记、情景分析和 AI 摘要都有成熟替代方案。因此不能说
Falsifi “世界首创”或“独一无二”。较准确的表述是：研究完整度检查、关联
证据组去重、改变判断的最小已测试条件、基准变化和下一项研究行动，这一组合
在主流个人投资工具中并不常见。
