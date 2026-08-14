import { useQuery } from '@tanstack/react-query'
import { fetchWallet } from '../api/client'

export function useWallet(walletId: string) {
  return useQuery({
    queryKey: ['wallet', walletId],
    queryFn: () => fetchWallet(walletId),
    enabled: walletId.length > 0,
  })
}