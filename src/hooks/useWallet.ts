import { useQuery } from '@tanstack/react-query'
import { fetchWallet } from '../api/client'
import type { PartialBalance, WalletDto } from '../api/types'
import { isNewer } from '../lib/time'

export function useWallet(walletId: string) {
  const wallet = useQuery({
    queryKey: ['wallet', walletId],
    queryFn: () => fetchWallet(walletId),
    enabled: walletId.length > 0,
  })

  const balance = useQuery<PartialBalance | undefined>({
    queryKey: ['balance', walletId],
    queryFn: () => undefined,
    enabled: false,
    staleTime: Infinity,
    retry: false,
  })

  let data: WalletDto | undefined = wallet.data
  if (data && balance.data && isNewer(balance.data.updatedAt, data.updatedAt)) {
    data = {
      ...data,
      balance: balance.data.balance,
      currency: balance.data.currency,
      updatedAt: balance.data.updatedAt,
    }
  }

  return { ...wallet, data }
}