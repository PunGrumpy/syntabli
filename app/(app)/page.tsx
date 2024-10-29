import * as React from 'react'

import { Client } from '@/app/(app)/client'
import { dataOptions } from '@/app/(app)/query-options'
import { searchParamsCache } from '@/app/(app)/search-params'
import { getQueryClient } from '@/components/query/get-query-client'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ searchParams }: PageProps) {
  const search = searchParamsCache.parse(searchParams)
  const queryClient = getQueryClient()
  await queryClient.prefetchInfiniteQuery(dataOptions(search))

  return <Client />
}
