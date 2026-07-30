# Data sources and rights

The MIT license covers Falsifi code only. It does not sublicense market data,
news, filings, estimates, or other third-party content.

## Default: synthetic demo

The public demo contains a fictional company and synthetic observations. It is
designed to exercise every product feature without implying that the figures
are live or accurate for a real security.

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

## Price and news feeds

The public repository deliberately avoids an embedded unofficial or
redistributed quote feed.

If a contributor adds Alpha Vantage, Massive, Twelve Data, or another vendor,
the adapter must:

1. require the user’s own key;
2. document the plan’s display and redistribution rights;
3. keep raw responses out of git and public build artifacts unless those rights
   explicitly permit redistribution;
4. expose delay, freshness, retention, and missing-data states;
5. never log secrets.

## Explicitly excluded defaults

- HKEX website scraping
- unofficial Yahoo Finance endpoints
- unofficial Eastmoney/Sina endpoints
- shared maintainer keys used to power a public product

Open-source wrapper code does not grant rights in an upstream provider’s data.
