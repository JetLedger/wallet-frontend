import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders the empty state message', () => {
    render(<EmptyState />)
    expect(screen.getByText('No transactions yet')).toBeInTheDocument()
  })
})