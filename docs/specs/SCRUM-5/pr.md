# SCRUM-5: Pull Request — wallet-frontend

## PR
https://github.com/JetLedger/wallet-frontend/pull/1 (branch `feature/SCRUM-5-wallet-dashboard` → `main`)

## What changed
- Scaffolded Vite + React + TS app (package.json, tsconfig, vite config, vitest config,
  playwright config, index.html).
- API types + typed client with `ApiError` (HTTP status).
- Hooks: `useWallet` (REST+SSE merge by timestamp), `useTransactions`,
  `useSpendingSummary`, `useBalanceEvents` (SSE, newest-wins cache).
- Components: `BalanceCard`, `CategoryBadge`, `TransactionRow`, `TransactionList`,
  `SpendingDonut` (D3), `EmptyState`; `App` handles 404 vs generic errors and shows the
  wallet form after failure.
- Unit tests (16) + Playwright E2E (`e2e/dashboard.spec.ts`) + `scripts/run-e2e.sh`
  composite command.
- Spec artifacts: jira-context.md, plan.md, tasks.md, tests.md, implementation.md,
  pr.md, coderabbit-resolution.md.
- Hardened `.claude/settings.json` (fail-closed hooks, detached-HEAD guard, broader
  secret scan) and `.gitignore` (`.env`/`.env.*`, keep `.env.example`).

## Validation
`npm run build` green; `npm test` green; `npm run test:e2e` green (wallet-core started
automatically on the `dev` profile).