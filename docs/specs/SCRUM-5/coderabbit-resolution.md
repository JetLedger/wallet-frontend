# SCRUM-5: CodeRabbit Resolution — wallet-frontend

Review: https://github.com/JetLedger/wallet-frontend/pull/1 (CodeRabbit `coderabbitai[bot]`)

## Findings

| # | Finding | Verdict | Resolution |
|---|---------|---------|------------|
| 3787513602 | PreToolUse bash hook: `echo $CLAUDE_TOOL_INPUT` unquoted + parse error aborts silently | VALID | Quoted `${CLAUDE_TOOL_INPUT:-}`; fail-closed when parsing or reading input fails. |
| 3787513606 | Write/Edit hook same parsing issues | VALID | Same fail-closed quoting applied to both Write/Edit hooks. |
| 3787513612 | Branch guard treats detached HEAD / git failure as safe, and secret regex too narrow | VALID | Detached HEAD or git failure now blocks with remediation message; secret scan is case-insensitive and covers `aws_secret_access_key`, `github_token`, `api_key`, `secret_key`, `private_key`, `access_token`, `client_secret`, `jwt_secret` for `=`/`:` assignments. |
| 3787513616 | `.gitignore` does not ignore `.env` | VALID | Added `.env`, `.env.*`, kept `!.env.example`. |
| 3787513630 | jira-context uses `{{GET …}}` ADF-ism in markdown | VALID | Replaced with inline code `` `GET /api/v1/wallets/{id}/events` ``. |
| 3787513639 | plan.md references undefined `make` targets | VALID | plan.md cites canonical Makefile targets and documents the exception (no root Makefile yet) with direct npm equivalents. |
| 3787513642 | tasks.md missing constitution-mandated spec artifacts | VALID | Added task 8 and created tests.md, implementation.md, pr.md, coderabbit-resolution.md. |
| 3787513644 | E2E requires a manually started backend | VALID | `scripts/run-e2e.sh` starts wallet-core (`dev` profile) when `:8080` is not responding, waits for readiness, kills on exit; `test:e2e` uses it. |
| 3787513650 | Wallet form overflows a 320px viewport | VALID | Form wraps (`flex-wrap`) and input shrinks (`min-width: 0; flex: 1 1 280px`). |
| 3787513652 | Every load failure rendered as "Wallet not found" | VALID | `ApiError` with status; `App` renders a distinct 404 vs generic error, `BalanceCard` gets a distinct `error` state. |
| 3787513655 | Wallet form hidden after a failed load, so the user cannot recover | VALID | Form is shown again when the wallet query is in an error state. |
| 3787513657 | SSE event can be overwritten by an in-flight REST fetch (stale overwrite) | VALID | `useWallet` keeps the cached snapshot when it is newer than the REST response; `useBalanceEvents` only applies strictly-newer events and creates a cache entry when none exists; regression tests for both sequences added. |