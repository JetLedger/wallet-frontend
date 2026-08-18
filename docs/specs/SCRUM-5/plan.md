# SCRUM-5: Implementation Plan — wallet-frontend

## Scope
Scaffold the React app and build the four dashboard pieces (balance card, transaction
feed, D3 donut, empty state) wired to wallet-core over REST + SSE.

## Design summary
- Vite + React 18 + TypeScript, TanStack Query for server state, D3 for the donut,
  Playwright for E2E, Vitest + Testing Library for unit tests.
- Vite proxies `/api` → `http://localhost:8080`.
- `useBalanceEvents` opens an `EventSource`; a `balance` event updates the card
  optimistically and invalidates feed + summary queries (no reload).
- Wallet id comes from `?walletId=` query param, else a small input. E2E seeds via the
  create-wallet + deposit endpoints.

## Sequence
1. Scaffold (package.json, tsconfig, vite config, index.html, main/App).
2. API types + client.
3. Hooks: useWallet, useTransactions (page state), useSpendingSummary, useBalanceEvents.
4. Components: BalanceCard, CategoryBadge, TransactionRow, TransactionList, SpendingDonut,
   EmptyState.
5. Vitest unit tests (components + hooks).
6. Playwright E2E (`e2e/dashboard.spec.ts`) + config.
7. Build + unit tests via Makefile; run E2E against seeded local stack.

## Validation
Canonical commands are the root Makefile targets (`make build-all`, `make test-regression`,
`make test-e2e`); the root Makefile does not yet define targets for this module, so the
direct equivalents are used until then:

- Build/typecheck: `npm run build`
- Unit tests: `npm test`
- E2E: `npm run test:e2e` — `scripts/run-e2e.sh` starts wallet-core with the `dev`
  profile (kafka/redis disabled) when it is not already running, waits for readiness,
  then runs Playwright. Override the backend location with `WALLET_CORE_DIR` (default
  `../wallet-core`).