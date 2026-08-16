import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchWallet } from '../api/client'
import type { WalletDto } from '../api/types'
import { isNewer } from '../lib/time'

export function useWallet(walletId: string) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ['wallet', walletId],
    queryFn: async () => {
      const fresh = await fetchWallet(walletId)
      const cached = queryClient.getQueryData<WalletDto>(['wallet', walletId])
      if (cached && isNewer(cached.updatedAt, fresh.updatedAt)) {
        return cached
      }
      return fresh
    },
    enabled: walletId.length > 0,
  })
}