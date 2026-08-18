import type { PageDto, TransactionDto } from '../api/types'
import { TransactionRow } from './TransactionRow'
import { EmptyState } from './EmptyState'

interface Props {
  page: PageDto<TransactionDto> | undefined
  loading: boolean
  error: boolean
  pageNumber: number
  onPrev: () => void
  onNext: () => void
}

export function TransactionList({
  page,
  loading,
  error,
  pageNumber,
  onPrev,
  onNext,
}: Props) {
  if (loading) {
    return (
      <section className="transaction-list transaction-list--loading">
        <p>Loading transactions…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="transaction-list transaction-list--error">
        <p>Failed to load transactions.</p>
      </section>
    )
  }

  if (!page || page.content.length === 0) {
    return <EmptyState />
  }

  const hasPrev = pageNumber > 0
  const hasNext = pageNumber < page.totalPages - 1
  const start = pageNumber * page.size + 1
  const end = Math.min(start + page.content.length - 1, page.totalElements)

  return (
    <section className="transaction-list" aria-label="Transactions">
      <ul className="transaction-list__items">
        {page.content.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </ul>
      <div className="transaction-list__pagination">
        <button
          type="button"
          className="transaction-list__prev"
          onClick={onPrev}
          disabled={!hasPrev}
        >
          Previous
        </button>
        <span className="transaction-list__summary">
          Showing {start}–{end} of {page.totalElements}
        </span>
        <button
          type="button"
          className="transaction-list__next"
          onClick={onNext}
          disabled={!hasNext}
        >
          Next
        </button>
      </div>
    </section>
  )
}