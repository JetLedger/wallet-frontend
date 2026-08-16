# SCRUM-5: Wallet dashboard UI — wallet-frontend

## Summary

wallet-frontend is scaffolded as a React + TypeScript + Vite app and renders the wallet
dashboard: a balance card, a paginated transaction feed with color-coded category
badges, and a D3.js donut chart of current-month spending by category. Balance updates
arrive over SSE from wallet-core and update the card without a page reload. An empty
state is shown when the wallet has no transactions. A Playwright E2E covers the happy
path.

This spec covers ONLY wallet-frontend. The API it consumes is specified in
`wallet-core/docs/specs/SCRUM-5/spec.md`:
- `GET /api/v1/wallets/{id}` (balance card)
- `GET /api/v1/wallets/{id}/transactions?page&size` (feed, default 20/page)
- `GET /api/v1/wallets/{id}/transactions/summary?month=YYYY-MM` (donut data)
- `GET /api/v1/wallets/{id}/events` (SSE balance stream)
- `POST /api/v1/wallets` (create wallet; used by E2E seeding)

## Acceptance Criteria

1. Balance card shows amount, currency, and last-updated timestamp.
2. Transaction list shows amount (signed), merchant, color-coded category badge, and
   timestamp, paginated 20/page with prev/next controls.
3. D3.js donut chart renders current-month spending by category; hovering a slice shows
   amount + percentage.
4. Dashboard subscribes to the SSE balance stream and updates the balance card without
   a reload; deposit/withdraw events also refresh the feed + chart.
5. Empty state is rendered when the wallet has no transactions.
6. Playwright E2E: load dashboard → see balance → see transactions → chart renders.

## Architecture

### Scaffold

Vite + React 18 + TypeScript. Dependencies: `@tanstack/react-query` (server state),
`d3` (donut), `@playwright/test` (E2E), `vitest` + `@testing-library/react` (unit).
Vite dev server proxies `/api` → `http://localhost:8080` (wallet-core).

```
src/
├── main.tsx                    # React root + QueryClientProvider
├── App.tsx                     # walletId resolution (query param or input) + layout
├── api/
│   ├── types.ts                # WalletDto, TransactionDto, PageDto, SummaryDto, BalanceEvent
│   └── client.ts               # fetch wrappers for the wallet-core endpoints
├── hooks/
│   ├── useWallet.ts            # balance card data
│   ├── useTransactions.ts      # paginated feed (page state)
│   ├── useSpendingSummary.ts   # donut data for current month
│   └── useBalanceEvents.ts     # EventSource subscription → newest-wins partial-balance cache + invalidation
└── components/
    ├── BalanceCard.tsx
    ├── TransactionList.tsx
    ├── TransactionRow.tsx
    ├── CategoryBadge.tsx       # fixed per-category color palette
    ├── SpendingDonut.tsx       # D3 pie/arc donut with hover tooltip
    └── EmptyState.tsx
```

### Data flow

- `useWallet` / `useTransactions` / `useSpendingSummary` use TanStack Query against the
  wallet-core REST API (page size 20).
- `useBalanceEvents` opens `EventSource(/api/v1/wallets/{id}/events)`. On a `balance`
  event it records the new balance under a separate partial-balance cache key
  (newest-wins by timestamp, no fabricated wallet fields) and invalidates the
  transactions + summary queries so feed/chart refresh without reload; `useWallet`
  merges the newest balance into the card data.
- Category → color mapping is a fixed palette in `CategoryBadge` (e.g. FOOD=orange,
  TRANSPORT=blue, ... UNCATEGORIZED=gray).

### Wallet selection

No wallet list/auth exists yet (SCRUM-7). The dashboard reads `?walletId=<uuid>` from the
URL; when absent it shows a small input to enter a wallet id. E2E seeds data by calling
`POST /api/v1/wallets` + deposits directly and drives the dashboard with the created id.

### Empty state

When `useTransactions` returns an empty page, the feed area renders `EmptyState`
("No transactions yet") and the donut renders a zero state; the balance card still shows
the current balance.

## Conventions

- TypeScript strict mode, no implicit any.
- Components use the existing React 18 patterns; hooks isolated from components.
- No CSS framework — plain CSS per component (scoped by class name).
- Tests: Vitest + Testing Library for components/hooks, Playwright for the E2E flow.

## Open Questions

- None blocking. Category colors are a fixed palette until user customization exists.