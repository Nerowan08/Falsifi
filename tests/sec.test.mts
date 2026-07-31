import assert from "node:assert/strict";
import test from "node:test";

import { parseSecMaterialCandidates, resolveSecCompany } from "../lib/sec.ts";

test("resolves an exact SEC ticker without fuzzy company matching", () => {
  assert.deepEqual(
    resolveSecCompany(
      {
        "0": { cik_str: 320193, ticker: "AAPL", title: "Apple Inc." },
        "1": { cik_str: 789019, ticker: "MSFT", title: "Microsoft Corp" },
      },
      "aapl",
    ),
    { cik: 320193, name: "Apple Inc." },
  );
  assert.equal(resolveSecCompany({}, "AAPL"), null);
});

test("builds bounded official SEC filing candidates", () => {
  const candidates = parseSecMaterialCandidates(
    {
      filings: {
        recent: {
          accessionNumber: ["0000320193-26-000001", "0000320193-26-000002", "bad"],
          filingDate: ["2026-07-30", "2026-07-20", "2026-07-19"],
          form: ["10-Q", "4", "8-K"],
          primaryDocument: ["aapl-20260730.htm", "ownership.xml", "bad/route.htm"],
        },
      },
    },
    { cik: 320193, companyName: "Apple Inc." },
  );
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].provider, "SEC EDGAR");
  assert.equal(candidates[0].kind, "filing");
  assert.match(candidates[0].sourceUrl, /^https:\/\/www\.sec\.gov\/Archives\/edgar\/data\/320193\//u);
});
