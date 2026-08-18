import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useWallet } from './useWallet'
import type { PartialBalance, WalletDto } from '../api/types'

const WALLET_ID = 'wallet-1'

function freshWallet(updatedAt: string, balance: number): WalletDto {
  return {
    walletId: WALLET_ID,
    balance,
    currency: 'USD',
    createdAt: '2026-08-15T08:00:00Z',
    updatedAt,
  }
}

function partialBalance(updatedAt: string, balance: number): PartialBalance {
  return { balance, currency: 'USD', updatedAt }
}

function wrapperFor(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useWallet', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => freshWallet('2026-08-15T11:00:00Z', 150),
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps the newer SSE balance when the REST response is older', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(
      ['balance', WALLET_ID],
      partialBalance('2026-08-15T12:00:00Z', 200),
    )

    const { result } = renderHook(() => useWallet(WALLET_ID), {
      wrapper: wrapperFor(queryClient),
    })

    await waitFor(() => expect(result.current.data?.balance).toBe(200))
    expect(result.current.data?.updatedAt).toBe('2026-08-15T12:00:00Z')
    expect(result.current.data?.createdAt).toBe('2026-08-15T08:00:00Z')
  })

  it('uses the REST response when it is newer than the partial balance', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(
      ['balance', WALLET_ID],
      partialBalance('2026-08-15T10:00:00Z', 100),
    )

    const { result } = renderHook(() => useWallet(WALLET_ID), {
      wrapper: wrapperFor(queryClient),
    })

    await waitFor(() => expect(result.current.data?.balance).toBe(150))
    expect(result.current.data?.updatedAt).toBe('2026-08-15T11:00:00Z')
  })

  it('copies the SSE currency when the partial balance is newer', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(
      ['balance', WALLET_ID],
      { balance: 200, currency: 'EUR', updatedAt: '2026-08-15T12:00:00Z' },
    )

    const { result } = renderHook(() => useWallet(WALLET_ID), {
      wrapper: wrapperFor(queryClient),
    })

    await waitFor(() => expect(result.current.data?.balance).toBe(200))
    expect(result.current.data?.currency).toBe('EUR')
    expect(result.current.data?.updatedAt).toBe('2026-08-15T12:00:00Z')
    expect(result.current.data?.createdAt).toBe('2026-08-15T08:00:00Z')
  })
})