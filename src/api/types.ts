export interface WalletDto {
  walletId: string
  balance: number
  currency: string
  createdAt: string
  updatedAt: string
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL'

export interface TransactionDto {
  id: string
  type: TransactionType
  amount: number
  currency: string
  merchant: string | null
  category: string | null
  confidence: number | null
  timestamp: string
}

export interface PageDto<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CategorySpendingDto {
  category: string
  amount: number
  count: number
}

export interface SpendingSummaryDto {
  totalSpent: number
  categories: CategorySpendingDto[]
}

export interface BalanceEvent {
  walletId: string
  balance: number
  currency: string
  updatedAt: string
}