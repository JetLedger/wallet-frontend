# SCRUM-5: Implementation — wallet-frontend

## Stack
- Vite + React 18 + TypeScript; TanStack Query for server state; D3 for the donut;
  Vitest + Testing Library; Playwright. Vite proxies `/api` → `http://localhost:8080`.

## Data layer
- `src/api/types.ts` — `WalletDto`, `TransactionDto`, `PageDto`, `SpendingSummaryDto`,
  `BalanceEvent`.
- `src/api/client.ts` — typed fetch wrappers throwing `ApiError` (carries HTTP
  `status`) so the UI can distinguish 404 from generic failures.

## Hooks
- `useWallet` — `useQuery(['wallet', id])`. QueryFn merges with the cache: if a
  (possibly SSE-fed) cached snapshot is newer than the REST response it is kept, so an
  in-flight fetch never overwrites a newer live balance.
- `useTransactions` — page state, page size 20.
- `useSpendingSummary` — current month.
- `useBalanceEvents` — `EventSource` on `GET /api/v1/wallets/{id}/events`; a `balance`
  event updates the wallet cache only when strictly newer than the cached snapshot,
  and creates a cache entry when none exists yet; invalidates feed + summary queries.

## Components
- `BalanceCard` — amount/currency/last-updated; distinct loading, not-found, and error
  states.
- `CategoryBadge`, `TransactionRow`, `TransactionList` (pagination), `SpendingDonut`
  (D3 arcs + hover tooltip with amount + %), `EmptyState`.
- `App` — resolves wallet id from `?walletId=` or a form input; shows the form again
  after a load failure; renders 404 vs generic error messages.

## E2E
- `scripts/run-e2e.sh` — probes `:8080`; if wallet-core is not running it starts the
  sibling repo with the `dev` profile (kafka/redis disabled) and waits for readiness
  (kill on exit). `playwright.config.ts` starts Vite (`webServer`).