# SCRUM-5: Tasks — wallet-frontend

1. **Scaffold** Vite + React + TS: package.json, tsconfig.json, vite.config.ts (proxy
   `/api` → 8080), index.html, `src/main.tsx` (QueryClientProvider), `src/App.tsx`
   (walletId resolution + layout).
2. **API layer**: `src/api/types.ts` (WalletDto, TransactionDto, PageDto, SummaryDto,
   BalanceEvent), `src/api/client.ts` (typed fetch wrappers).
3. **Hooks**: `useWallet`, `useTransactions` (page state, size 20),
   `useSpendingSummary` (current month), `useBalanceEvents` (EventSource + query
   invalidation + server-event balance update, newest-wins by timestamp).
4. **Components**: `BalanceCard`, `CategoryBadge` (fixed color palette),
   `TransactionRow`, `TransactionList` (pagination controls), `SpendingDonut` (D3
   pie/arc, hover tooltip with amount + %), `EmptyState`.
5. **Unit tests** (Vitest + Testing Library): BalanceCard, CategoryBadge, TransactionList
   (pagination), SpendingDonut (data→arcs), EmptyState, useBalanceEvents (event →
   invalidation).
6. **E2E**: `playwright.config.ts`, `scripts/run-e2e.sh` (starts wallet-core `dev`
   profile when needed), `e2e/dashboard.spec.ts` (seed wallet via API → load dashboard
   → balance visible → transactions visible → donut rendered).
7. **Validation**: `npm run build` (build + typecheck), `npm test` (unit),
   `npm run test:e2e` (E2E — starts wallet-core `dev` profile when needed). The root
   Makefile does not yet define `make build-all`/`make test-regression`/`make test-e2e`
   for this module — documented exception in plan.md (future Makefile integration).
8. **Spec artifacts** (constitution): `tests.md`, `implementation.md`, `pr.md`.