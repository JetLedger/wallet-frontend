import { expect, test } from '@playwright/test'

const API = 'http://localhost:8080/api/v1'

test('dashboard shows balance, transactions, and the spending donut', async ({
  page,
  request,
}) => {
  const created = await request.post(`${API}/wallets`, {
    data: { currency: 'USD' },
  })
  expect(created.ok()).toBeTruthy()
  const walletId = (await created.json()).walletId as string

  const deposit = await request.post(`${API}/wallets/${walletId}/deposit`, {
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    data: { amount: '100.00', merchant: 'Starbucks' },
  })
  expect(deposit.ok()).toBeTruthy()

  const withdraw = await request.post(`${API}/wallets/${walletId}/withdraw`, {
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    data: { amount: '30.00', merchant: 'Netflix' },
  })
  expect(withdraw.ok()).toBeTruthy()

  await page.goto(`/?walletId=${walletId}`)

  await expect(page.getByText('$70.00').first()).toBeVisible()
  await expect(page.getByText('Starbucks').first()).toBeVisible()
  await expect(page.getByText('Netflix').first()).toBeVisible()
  await expect(page.locator('.spending-donut__svg')).toBeVisible()
  await expect(page.getByText('$30.00 · 100.0%')).toBeVisible()
})

test('shows the empty state for a brand-new wallet', async ({
  page,
  request,
}) => {
  const created = await request.post(`${API}/wallets`, {
    data: { currency: 'USD' },
  })
  expect(created.ok()).toBeTruthy()
  const walletId = (await created.json()).walletId as string

  await page.goto(`/?walletId=${walletId}`)

  await expect(page.getByText('No transactions yet')).toBeVisible()
  await expect(page.getByText('No spending yet this month')).toBeVisible()
})