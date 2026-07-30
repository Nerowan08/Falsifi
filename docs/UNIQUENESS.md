# Product focus and public landscape review

**Review date:** July 30, 2026
**Scope:** public product pages for stock-thesis tracking, investment journals,
AI research assistants, provenance systems, and evidence review tools.

## Conclusion

Falsifi cannot honestly claim to be the first stock-thesis tracker, the first
falsification tool, the first source-linked research product, or the first
system to ask what would change an investor’s mind. Those categories already
contain capable products.

The product has therefore been narrowed to one job:

> Given one stock and several pieces of research material, show how many
> source groups the current record identifies. A written thesis is optional.

The memorable problem is:

> Eight articles can still trace to one source.

## Why the previous product was not good enough

The previous interface presented market charts, indicators, a rule score,
model robustness, a readiness checklist, evidence pages, dependency pages,
history, methodology, and scenario sliders at the same level. A new user could
not tell whether Falsifi was:

- a stock screener;
- a technical-analysis dashboard;
- an investment journal;
- a scenario model; or
- an evidence manager.

The data model also asked ordinary users for arbitrary 0–100 impact and
confidence numbers. Even deterministic mathematics can create false precision
when its inputs are ungrounded subjective numbers.

The v0.6 redesign therefore removes scores and model sensitivity from the
primary path. The main output is simple and directly observable:

```text
user-added material count
→ source groups identified in the current record
→ material grouped with another item
```

The tool does not require a fixed research sequence. Users choose when to add
material, edit a claim, review a relationship, or add optional review notes.

## Existing alternatives

Publicly described products already cover most broad positioning:

| Product | Public positioning that overlaps |
|---|---|
| [Horyzon](https://horyzonapp.com/) | Thesis records, “what would change your mind,” timelines, and AI insights |
| [Vexton](https://www.vexton.ai/) | Structured thesis generation, challenges, bias prompts, review cadence, and decision trail |
| [Bonsai Compass](https://www.bonsai.finance/) | Bull/bear cases, hidden assumptions, thesis breakers, missing evidence, and thesis stress tests |
| [ThesesWatch](https://theseswatch.com/) | Thesis metrics, thresholds, monitoring, and divergence alerts |
| [subThesis](https://www.subthesis.app/) | Living theses, supporting evidence, decisions, outcomes, filings, branches, and version history |
| [Fulcrius](https://fulcrius.com/) | Investment assumptions, dependencies, and assumption tracking |
| [Burin](https://burin.app/) | Primary-source-linked models, contradiction detection, readiness gates, and thesis-change tracking |
| [Vouch](https://vouchapi.com/) | Claim provenance, SEC/XBRL verification, and audit trails |
| [InvestorOS](https://www.investoros.app/) / [InvestJournal](https://www.investjournal.co/) | Decision journals, review dates, and outcome reviews |

Accordingly, the following claims are not distinctive:

- “track an investment thesis”;
- “write what would change your mind”;
- “challenge confirmation bias”;
- “link research to primary sources”;
- “monitor thesis invalidation”;
- “keep an auditable decision history”; or
- “stress-test a stock idea.”

## A narrow focus, not a uniqueness claim

The public product review shows that Falsifi has a narrower focus than many
general investment-research tools:

1. canonical-URL identity that a user cannot split with labels;
2. user-confirmed grouping of shared underlying sources;
3. a first-class “materials → identified source groups” result.

This list describes the product focus. It does not prove that Falsifi is unique,
and it does not rule out similar public, private, internal, or undocumented
tools.

## Why this pain is real

Repeated information can feel more credible even when repetition adds no new
underlying evidence. Relevant prior research includes:

- Hassan and Barber (2021), [The effects of repetition frequency on the
  illusory truth effect](https://pubmed.ncbi.nlm.nih.gov/33983553/).
- Navarrete et al. (2026), [Warnings and repetition-based credibility
  gains](https://pubmed.ncbi.nlm.nih.gov/42001848/).

Falsifi does not diagnose psychology. It addresses one operational consequence:
several documents should not automatically look like several different source
groups.

## Exact product claims

Reasonable:

> Falsifi shows how material for one stock thesis groups by source. It groups
> identical canonical URLs and explicit same-source relationships.

Also reasonable:

> Falsifi focuses on matching-link and same-source grouping, with a clear
> “materials-to-source-groups” result.

Not reasonable:

- “world first” or “globally unique”;
- “automatically finds every copied article”;
- “proves sources are independent”;
- “proves a thesis correct”;
- “objective confidence score”;
- “AI stock picker”; or
- “guaranteed protection from confirmation bias.”

## Current defensibility and next moat

The current deterministic grouping can still be reproduced in a spreadsheet or
notes workflow. The most valuable future extension is not another chart. It is:

```text
paste URL or upload document
→ extract factual claims
→ detect cross-site repetitions
→ trace a report back to a filing or transcript
→ let the user confirm or reject each proposed relationship
```

Until that extraction and provenance layer exists, the interface describes its
current capability conservatively: exact URL identity plus explicit
relationships, not universal automatic source tracing.

## 中文摘要

Falsifi 不能再定位成泛化的“投资论点跟踪、压力测试、反方论证、证据溯源、
提醒”大合集，因为这些能力都有公开竞品。

v0.6 只解决一个问题：把一只股票的研究材料按来源归组。股票判断可以选填。相同规范化网址无法
通过修改标签被拆开；用户也可以明确标记两条材料来自同一底层来源。行情数据
不计入用户材料，主结果也不依赖用户随意填写的 0–100 分。

产品不再规定用户下一步必须做什么。添加材料、修改判断、检查归组和填写可选
复核信息都由用户自己决定。

公开产品审查只能说明 Falsifi 选择了“相同链接不拆分 + 用户确认同源关系 +
材料数到来源组数”这个较窄的方向，不能证明产品独一无二，也不能宣传
“全球首创”或“从未有人做过”。
