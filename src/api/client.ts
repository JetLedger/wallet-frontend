import type { PageDto, SpendingSummaryDto, TransactionDto, WalletDto } from './types'

const BASE = '/api/v1'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} failed with status ${res.status}`)
  }
  return (await res.json()) as T
}

export function fetchWallet(walletId: string): Promise<WalletDto> {
  return get<WalletDto>(`${BASE}/wallets/${walletId}`)
}

export function fetchTransactions(
  walletId: string,
  page: number,
  size = 20,
): Promise<PageDto<TransactionDto>> {
  return get<PageDto<TransactionDto>>(
    `${BASE}/wallets/${walletId}/transactions?page=${page}&size=${size}`,
  )
}

export function fetchSpendingSummary(
  walletId: string,
  month: string,
): Promise<SpendingSummaryDto> {
  return get<SpendingSummaryDto>(
    `${BASE}/wallets/${walletId}/transactions/summary?month=${month}`,
  )
}