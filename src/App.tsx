import { useState } from 'react'
import { useWallet } from './hooks/useWallet'
import { useTransactions } from './hooks/useTransactions'
import { useSpendingSummary } from './hooks/useSpendingSummary'
import { useBalanceEvents } from './hooks/useBalanceEvents'
import { BalanceCard } from './components/BalanceCard'
import { TransactionList } from './components/TransactionList'
import { SpendingDonut } from './components/SpendingDonut'
import './app.css'

export function App() {
  const queryParam = new URLSearchParams(window.location.search).get('walletId')
  const [walletId, setWalletId] = useState(queryParam ?? '')
  const [input, setInput] = useState('')

  const wallet = useWallet(walletId)
  const transactions = useTransactions(walletId)
  const summary = useSpendingSummary(walletId)
  useBalanceEvents(walletId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = input.trim()
    if (id.length > 0) {
      setWalletId(id)
    }
  }

  const walletMissing = walletId.length > 0 && wallet.isError

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">Wallet Dashboard</h1>
        {walletId.length === 0 && (
          <form className="app__wallet-form" onSubmit={handleSubmit}>
            <label htmlFor="wallet-id">Wallet ID</label>
            <input
              id="wallet-id"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
            />
            <button type="submit">Open</button>
          </form>
        )}
      </header>

      <BalanceCard wallet={wallet.data} loading={wallet.isPending} />

      {walletMissing && (
        <p className="app__error">Wallet not found. Check the wallet id.</p>
      )}

      {wallet.data && (
        <div className="app__grid">
          <div className="app__feed">
            <h2 className="app__section-title">Transactions</h2>
            <TransactionList
              page={transactions.data}
              loading={transactions.isPending}
              error={transactions.isError}
              pageNumber={transactions.page}
              onPrev={() => transactions.setPage((p) => Math.max(0, p - 1))}
              onNext={() => transactions.setPage((p) => p + 1)}
            />
          </div>
          <SpendingDonut
            data={summary.data?.categories ?? []}
            currency={wallet.data.currency}
          />
        </div>
      )}
    </main>
  )
}