import { useQuery } from '@tanstack/react-query'
import { fetchSpendingSummary } from '../api/client'

export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function useSpendingSummary(walletId: string) {
  const month = currentMonth()
  return useQuery({
    queryKey: ['summary', walletId, month],
    queryFn: () => fetchSpendingSummary(walletId, month),
    enabled: walletId.length > 0,
  })
}