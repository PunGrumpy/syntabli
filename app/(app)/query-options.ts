import { infiniteQueryOptions, keepPreviousData } from '@tanstack/react-query'

import { ColumnSchema } from '@/app/(app)/schema'
import {
  searchParamsSerializer,
  SearchParamsType
} from '@/app/(app)/search-params'
import { Percentile } from '@/lib/request/percentile'
import type { MakeArray } from '@/types'

export type InfiniteQueryMeta = {
  totalRowCount: number
  filterRowCount: number
  totalFilters: MakeArray<ColumnSchema>
  currentPercentiles: Record<Percentile, number>
  chartData: { timestamp: number; [key: string]: number }[]
}

export const dataOptions = (search: SearchParamsType) => {
  return infiniteQueryOptions({
    queryKey: ['data-table', searchParamsSerializer({ ...search, uuid: null })], // remove uuid as it would otherwise retrigger a fetch
    queryFn: async ({ pageParam = 0 }) => {
      const start = (pageParam as number) * search.size
      const serialize = searchParamsSerializer({ ...search, start })
      const response = await fetch(`/api${serialize}`)
      return response.json() as Promise<{
        data: ColumnSchema[]
        meta: InfiniteQueryMeta
      }>
    },
    initialPageParam: 0,
    getNextPageParam: (_lastGroup, groups) => groups.length,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData
  })
}
