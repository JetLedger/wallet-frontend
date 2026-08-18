import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTransactions } from '../api/client'

const PAGE_SIZE = 20

export function useTransactions(walletId: string) {
  const [page, setPage] = useState(0)
  const query = useQuery({
    queryKey: ['transactions', walletId, page, PAGE_SIZE],
    queryFn: () => fetchTransactions(walletId, page, PAGE_SIZE),
    enabled: walletId.length > 0,
  })

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    setPage,
  }
}