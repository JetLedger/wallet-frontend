import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { BalanceEvent, WalletDto } from '../api/types'
import { isNewer } from '../lib/time'

export function useBalanceEvents(walletId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (walletId.length === 0) return

    const source = new EventSource(`/api/v1/wallets/${walletId}/events`)

    const onBalance = (raw: Event) => {
      const event = JSON.parse((raw as MessageEvent).data) as BalanceEvent
      queryClient.setQueryData<WalletDto>(['wallet', walletId], (prev) => {
        if (prev && !isNewer(event.updatedAt, prev.updatedAt)) return prev
        return prev
          ? { ...prev, balance: event.balance, updatedAt: event.updatedAt }
          : {
              walletId: event.walletId,
              balance: event.balance,
              currency: event.currency,
              createdAt: event.updatedAt,
              updatedAt: event.updatedAt,
            }
      })
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