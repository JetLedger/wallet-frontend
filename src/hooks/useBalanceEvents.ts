import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { BalanceEvent, WalletDto } from '../api/types'

export function useBalanceEvents(walletId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (walletId.length === 0) return

    const source = new EventSource(`/api/v1/wallets/${walletId}/events`)

    const onBalance = (raw: Event) => {
      const event = JSON.parse((raw as MessageEvent).data) as BalanceEvent
      queryClient.setQueryData<WalletDto>(['wallet', walletId], (prev) =>
        prev
          ? { ...prev, balance: event.balance, updatedAt: event.updatedAt }
          : prev,
      )
      void queryClient.invalidateQueries({ queryKey: ['transactions', walletId] })
      void queryClient.invalidateQueries({ queryKey: ['summary', walletId] })
    }

    source.addEventListener('balance', onBalance)
    return () => {
      source.removeEventListener('balance', onBalance)
      source.close()
    }
  }, [walletId, queryClient])
}