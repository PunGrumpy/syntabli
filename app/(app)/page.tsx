import * as React from 'react'

import { columns } from '@/app/(app)/columns'
import { data, filterFields } from '@/app/(app)/constants'
import { DataTable } from '@/app/(app)/data-table'
import { searchParamsCache } from '@/app/(app)/search-params'
import { Skeleton } from '@/app/(app)/skeleton'

export default function Page({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const search = searchParamsCache.parse(searchParams)

  return (
    <React.Suspense fallback={<Skeleton />}>
      <DataTable
        columns={columns}
        data={data}
        filterFields={filterFields}
        defaultColumnFilters={Object.entries(search)
          .map(([key, value]) => ({
            id: key,
            value
          }))
          .filter(({ value }) => value ?? undefined)}
      />
    </React.Suspense>
  )
}
