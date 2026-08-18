# SCRUM-5: CodeRabbit Resolution — wallet-frontend

Review: https://github.com/JetLedger/wallet-frontend/pull/1 (CodeRabbit `coderabbitai[bot]`)

## Findings

| # | Finding | Verdict | Resolution |
|---|---------|---------|------------|
| 3787513602 | PreToolUse bash hook: `echo $CLAUDE_TOOL_INPUT` unquoted + parse error aborts silently | VALID | Quoted `${CLAUDE_TOOL_INPUT:-}`; fail-closed when parsing or reading input fails. |
| 3787513606 | Branch guard treats detached HEAD / git failure as safe | VALID | Hook validates `git rev-parse --is-inside-work-tree` before reading the branch name, blocks detached HEAD / git failure, and blocks `main`/`master`. |
| 3787513612 | Hardcoded-secret detector too narrow | VALID | Case-insensitive scan covers `password`/`passwd`/`pwd`/`token` plus the prior credential names, accepts both `'` and `"` quoted values, for `=`/`:` assignments. |
| 3787513616 | `.gitignore` does not ignore `.env` | VALID | Added `.env`, `.env.*`, kept `!.env.example`. |
| 3787513630 | jira-context uses `{{GET …}}` ADF-ism in markdown | VALID | Replaced with inline code `` `GET /api/v1/wallets/{id}/events` ``. |
| 3787513639 | plan.md references undefined `make` targets | VALID | plan.md cites canonical Makefile targets and documents the exception (no root Makefile yet) with direct npm equivalents. |
| 3787513642 | tasks.md missing constitution-mandated spec artifacts | VALID | Added task 8 and created tests.md, implementation.md, pr.md, coderabbit-resolution.md. |
| 3787513644 | E2E requires a manually started backend | VALID | `scripts/run-e2e.sh` starts wallet-core (`dev` profile) when `:8080` is not responding, waits for readiness, kills on exit; `test:e2e` uses it. |
| 3787513650 | Wallet form overflows a 320px viewport | VALID | Form wraps (`flex-wrap`) and input shrinks (`min-width: 0; flex: 1 1 280px`). |
| 3787513652 | Every load failure rendered as "Wallet not found" | VALID | `ApiError` with status; `App` renders a distinct 404 vs generic error, `BalanceCard` gets a distinct `error` state. |
| 3787513655 | Wallet form hidden after a failed load, so the user cannot recover | VALID | Form is shown again when the wallet query is in an error state. |
| 3787513657 | SSE event can be overwritten by an in-flight REST fetch (stale overwrite) | VALID | `useWallet` keeps the cached snapshot when it is newer than the REST response; `useBalanceEvents` only applies strictly-newer events and creates a cache entry when none exists; regression tests for both sequences added. |

## Review Iteration 2 (2026-08-16, after fix commit `884ab97`)

| # | Finding | Verdict | Resolution |
|---|---------|---------|------------|
| 3792782339 | tasks.md validation lists unavailable `make` targets | VALID | Item 7 now lists runnable npm commands; make targets labelled future Makefile integration. |
| 3792782341 | tests.md missing empty-wallet E2E case | VALID | Empty-wallet scenario documented. |
| 3792782344 | run-e2e.sh probe trusts curl exit code (succeeds on HTTP 500) | VALID | `probe_healthy` compares `%{http_code}` and requires 200/404. |
| 3792782345 | run-e2e.sh writes to a predictable `/tmp` log | VALID | Log path created with `mktemp`. |
| 3792782346 | fabricated `WalletDto` `createdAt` in SSE cache entry | VALID | `PartialBalance` stored under a separate `['balance', walletId]` query key; `useWallet` merges the newest timestamp in render; tests updated to assert no fabrication. |
| outside-diff (tasks.md:8-10) | "optimistic balance" wording for SSE handling | VALID | Replaced with "server-event balance update, newest-wins by timestamp". |

## Review Iteration 3 (2026-08-18, after fix commit `7aaf02c`)

| # | Finding | Verdict | Resolution |
|---|---------|---------|------------|
| 3808076644 | markdownlint MD058: missing blank line between the iteration-1 table and the `Review Iteration 2` heading | VALID | Blank line added before the heading. |
| 3808076654 | resolution doc records the cache key as `['balance']` instead of the full `['balance', walletId]` | VALID | Iteration-2 entry above now records the complete wallet-scoped key. |
| 3808076660 | `useWallet` newer-balance merge drops `currency` from the SSE `PartialBalance` | VALID | Merge now copies `balance.data.currency` alongside `balance` and `updatedAt`; test added for differing REST/SSE currencies. |

## Review Iteration 4 (2026-08-19, follow-up closure on `.claude/settings.json`)

| # | Finding | Verdict | Resolution |
|---|---------|---------|------------|
| 3787513606 (follow-up) | CodeRabbit requested an explicit `git rev-parse --is-inside-work-tree` check before reading the branch name | VALID | Check added as the first step of the branch guard; verified locally (feature branch allowed, non-work-tree and `main`/`master` blocked). |
| 3787513612 (follow-up) | Secret detector misses `password`/`token` names and single-quoted values | VALID | Regex broadened with `password`/`passwd`/`pwd`/`token`; accepts both `'` and `"` quoted values; verified locally (credentials caught, clean files ignored). |
