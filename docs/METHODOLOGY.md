# Source-audit methodology

Falsifi's primary result is a provenance count, not a stock score:

```text
user-added materials → confirmed source groups → relationships to review
```

## Confirmed grouping

Two materials are in the same confirmed source group when at least one of these
conditions is true:

- their HTTP(S) URLs match after canonicalization;
- they share a stored source identifier;
- the user confirms a same-source relationship.

Canonicalization removes fragments and common tracking parameters, normalizes
the host, `www`, and trailing slash, and preserves meaningful query parameters.
The grouping graph is undirected and transitive.

A shared claim or publication date does not create a confirmed group.

## Relationship suggestions

Different URLs can create a review suggestion when their metadata contains a
strong, explainable overlap:

- one page links directly to the other as a source;
- both pages link to the same likely original material;
- compact fingerprints show substantial readable-text overlap;
- near-identical title tokens within fourteen days;
- a shared company-event class, adequate title overlap, and publication within
  two days;
- an official filing plus a nearby article on the same detected event.

Detected event classes currently include earnings, repurchases, dividends,
acquisitions, investigations, litigation, contracts, financing, and management
changes. The detector uses public metadata already in the user's record; it
also reads public HTML when the user submits links. It stores at most 160 hashed
text shingles and a bounded set of outbound links, not the full page text.

Readable-text overlap uses bottom-k hashed word trigrams and CJK character
four-grams. A score of 0.82 or above is shown as a high-confidence lead; 0.62
or above within fourteen days is shown as a possible lead. These thresholds
passed the repository's labeled fixture benchmark, but that benchmark is small
and synthetic. It is a regression guard, not a production-accuracy claim.

Suggestions are never auto-merged. The UI shows the reason and asks the user to
choose “group together” or “keep separate.” Rejected suggestions are stored in
the current browser.

## Next-step selection

Falsifi returns one next step, in this order:

1. add the first material;
2. review possible source relationships;
3. open and verify unchecked materials;
4. add an independent source when fewer than two confirmed sources remain;
5. when a claim exists, add credible material that could challenge it;
6. add another independent source.

This is workflow guidance, not an investment recommendation.

## Boundaries

- A source group records confirmed common provenance; it does not prove that
  two publishers lack editorial independence.
- A possible match is a lead, not a conclusion.
- Public-page fetching has an eight-second timeout, a 2 MB body limit, validates
  redirects, rejects private-network and non-HTTP addresses, sends no cookies,
  and does not bypass logins or paywalls.
- “Checked” means the user says they opened and reviewed the page. Falsifi does
  not certify the content.
- Source diversity does not prove a claim true or predict returns.

Legacy deterministic stress-model code remains in the repository for backward
compatibility with older saved case JSON. It is not shown in, and does not
affect, the focused source-audit result.
