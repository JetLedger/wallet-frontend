# SCRUM-5: Tests — wallet-frontend

## Commands
- Unit: `npm test` (Vitest + Testing Library, jsdom)
- E2E: `npm run test:e2e` (`scripts/run-e2e.sh` starts wallet-core `dev` profile when
  needed, then runs Playwright)

## Coverage
- `src/components/BalanceCard.test.tsx` — formatting (currency, timestamp), loading,
  not-found, error states.
- `src/components/CategoryBadge.test.tsx` — color mapping + fallback category.
- `src/components/TransactionList.test.tsx` — pagination controls, empty state.
- `src/components/SpendingDonut.test.tsx` — data → arcs, empty state.
- `src/components/EmptyState.test.tsx` — copy rendering.
- `src/hooks/useBalanceEvents.test.tsx` — event updates cached balance + invalidates
  feed/summary; cache entry created when none exists; stale (older) events ignored.
- `src/hooks/useWallet.test.tsx` — keeps the newer SSE balance over an older REST
  response, and vice versa (timestamp ordering regression tests).
- `e2e/dashboard.spec.ts` — E2E: (1) create + fund a wallet via API → load dashboard →
  balance visible → transactions visible → donut rendered; (2) brand-new wallet →
  both empty states (empty transaction feed + empty donut) rendered.