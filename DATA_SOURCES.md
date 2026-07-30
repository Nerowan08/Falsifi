# Data sources and rights

The MIT license covers Falsifi code only. It does not sublicense market data,
news, filings, estimates, or other third-party content.

## Default deployed adapters

### Yahoo Finance chart/search

The current owner-only deployment uses Yahoo Finance’s undocumented chart and
search endpoints to retrieve delayed daily market history for personal
evaluation. The UI labels the source and retrieval time. The adapter has no
service-level agreement and can be throttled, changed, or disabled upstream.
The application accepts listed equities only and requires at least 200 valid
daily observations before it labels or scores 200-day indicators. Short or
unavailable history removes optional market context but never blocks the
source-group workflow. Missing volume remains unknown; it is never replaced
with a neutral synthetic value.
When every valid ordinary-close date also has an adjusted close, the adapter
uses the adjusted series. Otherwise it uses the ordinary-close series for the
entire window; it never mixes the two bases within one calculation. The UI
labels that basis. The 20-session volume ratio is omitted unless all latest 20
sessions have valid volume.

This keyless adapter does **not** establish display or redistribution rights for
a public commercial service. Before widening a deployment beyond personal use,
replace it with a licensed provider and document that provider’s delay,
display, retention, and redistribution terms. Falsifi does not call this feed
real-time data.

The user-invoked material finder also uses the Yahoo Finance search endpoint.
It stores no article body and returns only candidate title, publisher, link,
and publication time. Results start unselected and unverified. The company
name, ticker, and search terms shown in the dialog are sent to Yahoo Finance;
the user's saved claim is not appended. The user must open a page and decide
whether to add it.

This search is experimental, can return irrelevant or paywalled pages, and is
not a complete filing or news archive. Coverage can be limited for mainland
China and Hong Kong stocks. Falsifi never labels these candidates as reliable,
independent, or verified.

### CNINFO A-share announcements

For an A-share ticker, the material finder also requests recent company
announcements from CNINFO (巨潮资讯), the disclosure platform designated by the
China Securities Regulatory Commission. The adapter resolves the exact
six-digit security code, requests the latest two pages of announcements, and
accepts a result only when its `secCode` exactly matches the selected stock.
Only title, issuer, filing time, and the fixed
`static.cninfo.com.cn/finalpage/...PDF` link are returned.

CNINFO candidates are labeled as company filings, but still start unselected,
unclassified, and unverified. “Official filing” describes the document type;
it does not mean Falsifi has checked the document’s relevance or the truth of
every statement. The ticker is sent to CNINFO. The saved claim is not sent.
The public lookup can change or become unavailable, so Yahoo results and manual
link entry remain fallbacks.

The four directional trend and momentum observations generated from one
returned price series are marked `provenance: system-market` and share one
`originId`. They remain optional market context and never satisfy the
user-evidence readiness checks. Volatility, drawdown, RSI, and volume are also
descriptive market context or scenario inputs; Falsifi does not assign them a
universal supporting or weakening direction. The legacy model engine bounds
each related group to at most one strongest supporting and one strongest
challenging contribution, so repeated rows cannot multiply one group’s
influence. This does not prove statistical independence or discover an
undeclared relationship.

## SEC EDGAR (supported)

The optional adapter uses the SEC’s official submissions and XBRL CompanyFacts
APIs:

- [EDGAR API documentation](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)
- [Accessing EDGAR data](https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data)

The APIs do not require a key, but automated clients must follow SEC fair-access
rules and identify themselves with a descriptive `User-Agent` including contact
information. Falsifi throttles requests well below the published ceiling.

The adapter extracts structured facts and links back to SEC sources. It does not
mirror entire filings or assume that every filer-authored exhibit is
public-domain content.

## US Treasury and BLS (planned)

Official macro adapters can be built on:

- [US Treasury daily interest-rate feed](https://home.treasury.gov/treasury-daily-interest-rate-xml-feed)
- [BLS Public Data API](https://www.bls.gov/developers/)

These are not required by the current MVP.

## Licensed price feeds for public deployment

If a contributor adds EODHD, Twelve Data, Alpha Vantage, Massive, or another
licensed vendor,
the adapter must:

1. require the user’s own key;
2. document the plan’s display and redistribution rights;
3. keep raw responses out of git and public build artifacts unless those rights
   explicitly permit redistribution;
4. expose delay, freshness, retention, and missing-data states;
5. never log secrets.

## Explicitly excluded fallbacks

- HKEX website scraping
- unofficial Eastmoney/Sina endpoints
- shared maintainer keys used to power a public product

Open-source wrapper code does not grant rights in an upstream provider’s data.
