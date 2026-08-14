export function EmptyState() {
  return (
    <section className="empty-state" aria-label="No transactions">
      <div className="empty-state__icon" aria-hidden="true" />
      <h2 className="empty-state__title">No transactions yet</h2>
      <p className="empty-state__copy">
        Deposits and withdrawals will appear here.
      </p>
    </section>
  )
}