'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import type * as React from 'react'

import { getQueryClient } from '@/components/query/get-query-client'

interface ReactQueryProviderProps {
  children: React.ReactNode
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools /> */}
    </QueryClientProvider>
  )
}
