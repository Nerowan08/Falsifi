# Contributing

Contributions that improve transparency, test coverage, provenance, or
accessibility are welcome.

## Before opening a pull request

```bash
npm ci
npm run lint
npm test
```

## Design principles

- Never hide a calculation behind an unexplained “AI score.”
- Preserve source, as-of date, unit, and caveats for every observation.
- Treat missing data as missing—not zero.
- Keep user research local by default.
- Do not add brokerage execution or personalized recommendations.
- Do not add a data provider without documenting display, retention, and
  redistribution rights.
- Demo content must be clearly synthetic.

Open an issue before changing the v1 JSON schema or stability methodology.
