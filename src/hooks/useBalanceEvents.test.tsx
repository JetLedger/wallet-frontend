import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useBalanceEvents } from './useBalanceEvents'
import type { WalletDto } from '../api/types'

const WALLET_ID = 'wallet-1'

class MockEventSource {
  static instances: MockEventSource[] = []
  listeners: Record<string, ((e: MessageEvent<string>) => void)[]> = {}
  url: string
  closed = false

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }

  addEventListener(type: string, cb: (e: MessageEvent<string>) => void) {
    const list = this.listeners[type] ?? []
    list.push(cb)
    this.listeners[type] = list
  }

  removeEventListener(type: string, cb: (e: MessageEvent<string>) => void) {
    this.listeners[type] = (this.listeners[type] ?? []).filter((f) => f !== cb)
  }

  close() {
    this.closed = true
  }

  emit(type: string, payload: unknown) {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload)
    ;(this.listeners[type] ?? []).forEach((cb) =>
      cb({ data } as MessageEvent<string>),
    )
  }
}

function makeClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wallet: WalletDto = {
    walletId: WALLET_ID,
    balance: 100,
    currency: 'USD',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
  }
  queryClient.setQueryData(['wallet', WALLET_ID], wallet)
  return queryClient
}

function makeEmptyClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

describe('useBalanceEvents', () => {
  beforeEach(() => {
    MockEventSource.instances = []
    vi.stubGlobal('EventSource', MockEventSource)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('updates the cached balance and invalidates feed queries on a balance event', async () => {
    const queryClient = makeClient()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { unmount } = renderHook(() => useBalanceEvents(WALLET_ID), { wrapper })

    expect(MockEventSource.instances).toHaveLength(1)
    expect(MockEventSource.instances[0].url).toBe(
      `/api/v1/wallets/${WALLET_ID}/events`,
    )

    act(() => {
      MockEventSource.instances[0].emit('balance', {
        walletId: WALLET_ID,
        balance: 150,
        currency: 'USD',
        updatedAt: '2026-08-15T11:00:00Z',
      })
    })

    const cached = queryClient.getQueryData<WalletDto>(['wallet', WALLET_ID])
    expect(cached?.balance).toBe(150)
    expect(cached?.updatedAt).toBe('2026-08-15T11:00:00Z')
    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['transactions', WALLET_ID] }),
    )
    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['summary', WALLET_ID] }),
    )

    unmount()
    expect(MockEventSource.instances[0].closed).toBe(true)
  })

  it('does not open a stream when no wallet id is provided', () => {
    const queryClient = makeClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    renderHook(() => useBalanceEvents(''), { wrapper })
    expect(MockEventSource.instances).toHaveLength(0)
  })

  it('creates a cache entry from the event when no wallet is cached yet', () => {
    const queryClient = makeEmptyClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { unmount } = renderHook(() => useBalanceEvents(WALLET_ID), { wrapper })

    act(() => {
      MockEventSource.instances[0].emit('balance', {
        walletId: WALLET_ID,
        balance: 150,
        currency: 'USD',
        updatedAt: '2026-08-15T11:00:00Z',
      })
    })

    const cached = queryClient.getQueryData<WalletDto>(['wallet', WALLET_ID])
    expect(cached?.walletId).toBe(WALLET_ID)
    expect(cached?.balance).toBe(150)
    expect(cached?.currency).toBe('USD')
    expect(cached?.updatedAt).toBe('2026-08-15T11:00:00Z')

    unmount()
  })

  it('ignores a stale balance event older than the cached balance', () => {
    const queryClient = makeClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { unmount } = renderHook(() => useBalanceEvents(WALLET_ID), { wrapper })

    act(() => {
      MockEventSource.instances[0].emit('balance', {
        walletId: WALLET_ID,
        balance: 90,
        currency: 'USD',
        updatedAt: '2026-08-15T09:00:00Z',
      })
    })

    const cached = queryClient.getQueryData<WalletDto>(['wallet', WALLET_ID])
    expect(cached?.balance).toBe(100)
    expect(cached?.updatedAt).toBe('2026-08-15T10:00:00Z')

    unmount()
  })
})