import * as React from 'react'

import { Client } from '@/app/(app)/client'
import { dataOptions } from '@/app/(app)/query-options'
import { searchParamsCache } from '@/app/(app)/search-params'
import { SearchParams } from '@/components/data-table/types'
import { getQueryClient } from '@/components/query/get-query-client'

interface AppPageProps {
  searchParams: Promise<SearchParams>
}

export default async function AppPage({ searchParams }: AppPageProps) {
  const search = await searchParamsCache.parse(searchParams)
  const queryClient = getQueryClient()
  await queryClient.prefetchInfiniteQuery(dataOptions(search))

  return <Client />
}
