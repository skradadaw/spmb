# Execution ledger — Data Peserta

- Baseline: npm.cmd run test:run -> 164 passed, 2 failed (existing home mobile style assertion; registration form timeout).
- Ruling: execute in existing checkout to preserve the approved in-session workflow and local uncommitted work; no branch/commit/push operations. Cost: changes share the current checkout.
- Ruling: use npm.cmd/npx.cmd because PowerShell blocks npm.ps1; identical package scripts.
- Preflight: no schema changes; document paths use registrations/{submission UUID}/{documentId}.{extension}. Page/detail data and document service remain server-only. UI reuses current admin tokens and primitives.
