# Jira Context: SCRUM-5

## Summary
Build wallet dashboard with balance display, transaction history, and category breakdown

## Description
`wallet-frontend` shows current balance, a paginated transaction feed with category badges, and a D3.js donut chart of spending by category. Data fetched from `wallet-core` REST API. Real-time balance update via SSE on deposit/withdraw events.

## Acceptance Criteria
- Balance card: amount, currency, last updated timestamp
- Transaction list: amount, merchant, category badge (color-coded), timestamp — paginated (20/page)
- D3.js donut chart: spending by category for current month, hover shows amount + %
- SSE endpoint `GET /api/v1/wallets/{id}/events` streams balance updates to frontend
- Balance updates without page reload on deposit/withdraw
- Playwright E2E: load dashboard → see balance → see transactions → chart renders
- Empty state shown when no transactions exist