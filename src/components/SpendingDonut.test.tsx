import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SpendingDonut } from './SpendingDonut'
import type { CategorySpendingDto } from '../api/types'

describe('SpendingDonut', () => {
  it('renders a legend entry with amount and percentage per category', () => {
    const data: CategorySpendingDto[] = [
      { category: 'FOOD', amount: 60, count: 2 },
      { category: 'TRANSPORT', amount: 40, count: 1 },
    ]
    render(<SpendingDonut data={data} currency="USD" />)
    expect(screen.getByText('FOOD')).toBeInTheDocument()
    expect(screen.getByText('TRANSPORT')).toBeInTheDocument()
    expect(screen.getByText('$60.00 · 60.0%')).toBeInTheDocument()
    expect(screen.getByText('$40.00 · 40.0%')).toBeInTheDocument()
  })

  it('renders the SVG donut when there is spending', () => {
    const data: CategorySpendingDto[] = [{ category: 'FOOD', amount: 50, count: 1 }]
    const { container } = render(<SpendingDonut data={data} currency="USD" />)
    expect(container.querySelector('.spending-donut__slice')).not.toBeNull()
  })

  it('renders a zero state when there is no spending', () => {
    render(<SpendingDonut data={[]} currency="USD" />)
    expect(screen.getByText('No spending yet this month')).toBeInTheDocument()
  })
})