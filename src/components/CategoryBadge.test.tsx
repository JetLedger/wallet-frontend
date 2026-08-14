import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryBadge } from './CategoryBadge'

describe('CategoryBadge', () => {
  it('renders the given category label', () => {
    render(<CategoryBadge category="FOOD" />)
    expect(screen.getByText('FOOD')).toBeInTheDocument()
  })

  it('falls back to UNCATEGORIZED for a null category', () => {
    render(<CategoryBadge category={null} />)
    expect(screen.getByText('UNCATEGORIZED')).toBeInTheDocument()
  })

  it('falls back to UNCATEGORIZED for an unknown category', () => {
    render(<CategoryBadge category="MYSTERY" />)
    expect(screen.getByText('MYSTERY')).toBeInTheDocument()
    expect(screen.getByText('MYSTERY')).toHaveStyle({ backgroundColor: '#6b7280' })
  })
})