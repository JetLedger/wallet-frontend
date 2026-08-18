import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BalanceCard } from './BalanceCard'
import type { WalletDto } from '../api/types'

const wallet: WalletDto = {
  walletId: 'wallet-1',
  balance: 1234.56,
  currency: 'USD',
  createdAt: '2026-08-01T10:00:00Z',
  updatedAt: '2026-08-15T10:00:00Z',
}

describe('BalanceCard', () => {
  it('renders the formatted amount, currency and last-updated timestamp', () => {
    render(<BalanceCard wallet={wallet} loading={false} />)
    expect(screen.getByText('$1,234.56')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText(/Last updated/)).toBeInTheDocument()
  })

  it('shows a loading hint while loading', () => {
    render(<BalanceCard wallet={undefined} loading />)
    expect(screen.getByText('Loading balance…')).toBeInTheDocument()
  })

  it('shows a missing state when the wallet is absent', () => {
    render(<BalanceCard wallet={undefined} loading={false} />)
    expect(screen.getByText('Wallet not found.')).toBeInTheDocument()
  })
})