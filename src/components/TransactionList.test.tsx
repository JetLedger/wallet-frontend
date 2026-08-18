import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionList } from './TransactionList'
import type { PageDto, TransactionDto } from '../api/types'

function tx(id: string, merchant: string, amount: number): TransactionDto {
  return {
    id,
    type: 'WITHDRAWAL',
    amount,
    currency: 'USD',
    merchant,
    category: 'FOOD',
    confidence: 0.9,
    timestamp: '2026-08-15T10:00:00Z',
  }
}

function page(content: TransactionDto[], pageNumber: number, totalPages: number): PageDto<TransactionDto> {
  return {
    content,
    page: pageNumber,
    size: 20,
    totalElements: totalPages * 20,
    totalPages,
  }
}

describe('TransactionList', () => {
  it('renders transaction rows', () => {
    render(
      <TransactionList
        page={page([tx('1', 'Starbucks', -6.5), tx('2', 'Netflix', -15.99)], 0, 1)}
        loading={false}
        error={false}
        pageNumber={0}
        onPrev={() => {}}
        onNext={() => {}}
      />,
    )
    expect(screen.getByText('Starbucks')).toBeInTheDocument()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })

  it('disables Previous on the first page and Next on the last page', () => {
    render(
      <TransactionList
        page={page([tx('1', 'Netflix', -15.99)], 0, 1)}
        loading={false}
        error={false}
        pageNumber={0}
        onPrev={() => {}}
        onNext={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('calls onNext / onPrev when pagination controls are used', async () => {
    const user = userEvent.setup()
    const onPrev = vi.fn()
    const onNext = vi.fn()
    render(
      <TransactionList
        page={page([tx('1', 'Netflix', -15.99)], 1, 3)}
        loading={false}
        error={false}
        pageNumber={1}
        onPrev={onPrev}
        onNext={onNext}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Previous' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPrev).toHaveBeenCalledOnce()
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('shows the empty state when there are no transactions', () => {
    render(
      <TransactionList
        page={{ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }}
        loading={false}
        error={false}
        pageNumber={0}
        onPrev={() => {}}
        onNext={() => {}}
      />,
    )
    expect(screen.getByText('No transactions yet')).toBeInTheDocument()
  })
})