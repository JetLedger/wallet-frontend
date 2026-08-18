import type { WalletDto } from '../api/types'

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString()
}

interface Props {
  wallet: WalletDto | undefined
  loading: boolean
  error?: boolean
  notFound?: boolean
}

export function BalanceCard({ wallet, loading, error, notFound }: Props) {
  if (loading) {
    return (
      <section className="balance-card balance-card--loading" aria-label="Balance">
        <p className="balance-card__hint">Loading balance…</p>
      </section>
    )
  }

  if (notFound) {
    return (
      <section className="balance-card balance-card--missing" aria-label="Balance">
        <p className="balance-card__hint">Wallet not found.</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="balance-card balance-card--error" aria-label="Balance">
        <p className="balance-card__hint">Unable to load balance.</p>
      </section>
    )
  }

  if (!wallet) {
    return (
      <section className="balance-card balance-card--missing" aria-label="Balance">
        <p className="balance-card__hint">Wallet not found.</p>
      </section>
    )
  }

  return (
    <section className="balance-card" aria-label="Balance">
      <div className="balance-card__amount">
        {formatMoney(wallet.balance, wallet.currency)}
      </div>
      <div className="balance-card__currency">{wallet.currency}</div>
      <div className="balance-card__updated">
        Last updated {formatTimestamp(wallet.updatedAt)}
      </div>
    </section>
  )
}