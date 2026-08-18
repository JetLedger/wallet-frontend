import type { TransactionDto } from '../api/types'
import { formatMoney } from './BalanceCard'
import { CategoryBadge } from './CategoryBadge'

interface Props {
  tx: TransactionDto
}

export function TransactionRow({ tx }: Props) {
  const positive = tx.type === 'DEPOSIT'
  const sign = positive ? '+' : ''

  return (
    <li className="transaction-row">
      <div className="transaction-row__merchant">{tx.merchant ?? tx.type}</div>
      <div className="transaction-row__meta">
        <CategoryBadge category={tx.category} />
        <span className="transaction-row__time">
          {new Date(tx.timestamp).toLocaleString()}
        </span>
      </div>
      <div
        className={`transaction-row__amount ${
          positive
            ? 'transaction-row__amount--positive'
            : 'transaction-row__amount--negative'
        }`}
      >
        {sign}
        {formatMoney(tx.amount, tx.currency)}
      </div>
    </li>
  )
}