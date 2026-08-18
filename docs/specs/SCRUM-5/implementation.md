# SCRUM-5: Implementation — wallet-frontend

## Stack
- Vite + React 18 + TypeScript; TanStack Query for server state; D3 for the donut;
  Vitest + Testing Library; Playwright. Vite proxies `/api` → `http://localhost:8080`.

## Data layer
- `src/api/types.ts` — `WalletDto`, `TransactionDto`, `PageDto`, `SpendingSummaryDto`,
  `BalanceEvent`, `PartialBalance` (balance/currency/updatedAt only — the SSE payload
  has no `createdAt`).
- `src/api/client.ts` — typed fetch wrappers throwing `ApiError` (carries HTTP
  `status`) so the UI can distinguish 404 from generic failures.

## Hooks
- `useWallet` — `useQuery(['wallet', id])` plus a disabled observer of the
  `['balance', id]` partial-balance cache. The returned `WalletDto` merges the newest
  balance by timestamp in render: when the SSE-fed partial balance is newer than the
  REST snapshot, its balance, currency, and `updatedAt` win; `createdAt` always comes
  from the REST response (never fabricated). An in-flight fetch cannot overwrite a
  newer live balance.
- `useTransactions` — page state, page size 20.
- `useSpendingSummary` — current month.
- `useBalanceEvents` — `EventSource` on `GET /api/v1/wallets/{id}/events`; a `balance`
  event writes a `PartialBalance` under `['balance', id]` only when strictly newer than
  the cached partial (no `WalletDto` entry is fabricated), then invalidates feed +
  summary queries.

## Components
- `BalanceCard` — amount/currency/last-updated; distinct loading, not-found, and error
  states.
- `CategoryBadge`, `TransactionRow`, `TransactionList` (pagination), `SpendingDonut`
  (D3 arcs + hover tooltip with amount + %), `EmptyState`.
- `App` — resolves wallet id from `?walletId=` or a form input; shows the form again
  after a load failure; renders 404 vs generic error messages.

## E2E
- `scripts/run-e2e.sh` — probes `:8080` for the expected HTTP status (200/404) via
  `%{http_code}`; if wallet-core is not running it starts the sibling repo with the
  `dev` profile (kafka/redis disabled) writing to a `mktemp`-generated log, waits for
  readiness, and kills the process tree on exit. `playwright.config.ts` starts Vite
  (`webServer`).