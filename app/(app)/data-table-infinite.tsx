'use client'

import { type FetchNextPageOptions } from '@tanstack/react-query'
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  Table as TTable,
  VisibilityState
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { LoaderCircle } from 'lucide-react'
import { useQueryStates } from 'nuqs'
import * as React from 'react'

import { columnFilterSchema, ColumnSchema } from '@/app/(app)/schema'
import { searchParamsParser } from '@/app/(app)/search-params'
import { SheetDetailsContent } from '@/app/(app)/sheet-details-content'
import { TimelineChart } from '@/app/(app)/timeline-chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/custom/table'
import { DataTableFilterCommand } from '@/components/data-table/data-table-filter-command'
import { DataTableFilterControls } from '@/components/data-table/data-table-filter-controls'
import { DataTableSheetDetails } from '@/components/data-table/data-table-sheet-details'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar' // TODO: check where to put this
import type { DataTableFilterField } from '@/components/data-table/types'
import { SocialsFooter } from '@/components/layout/socials-footer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { formatCompactNumber } from '@/lib/format'
import { Percentile } from '@/lib/request/percentile'
import { arrSome, inDateRange } from '@/lib/table/filterfns'
import { cn } from '@/lib/utils'

// TODO: add a possible chartGroupBy
export interface DataTableInfiniteProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  defaultColumnFilters?: ColumnFiltersState
  defaultColumnSorting?: SortingState
  defaultRowSelection?: RowSelectionState
  filterFields?: DataTableFilterField<TData>[]
  totalRows?: number
  filterRows?: number
  totalRowsFetched?: number
  currentPercentiles?: Record<Percentile, number>
  chartData?: { timestamp: number; [key: string]: number }[]
  isFetching?: boolean
  isLoading?: boolean
  fetchNextPage: (options?: FetchNextPageOptions | undefined) => void
}

export function DataTableInfinite<TData, TValue>({
  columns,
  data,
  defaultColumnFilters = [],
  defaultColumnSorting = [],
  defaultRowSelection = {},
  filterFields = [],
  isFetching,
  isLoading,
  fetchNextPage,
  totalRows = 0,
  filterRows = 0,
  totalRowsFetched = 0,
  currentPercentiles,
  chartData = []
}: DataTableInfiniteProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(defaultColumnFilters)
  const [sorting, setSorting] =
    React.useState<SortingState>(defaultColumnSorting)
  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>(defaultRowSelection)
  const [columnOrder, setColumnOrder] = useLocalStorage<string[]>(
    'data-table-column-order',
    []
  )
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<VisibilityState>('data-table-visibility', {
      uuid: false,
      'timing.dns': false,
      'timing.connection': false,
      'timing.tls': false,
      'timing.ttfb': false,
      'timing.transfer': false
    })
  const [controlsOpen, setControlsOpen] = useLocalStorage(
    'data-table-controls',
    true
  )
  const topBarRef = React.useRef<HTMLDivElement>(null)
  const [topBarHeight, setTopBarHeight] = React.useState(0)
  const [_, setSearch] = useQueryStates(searchParamsParser)

  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      const rect = topBarRef.current?.getBoundingClientRect()
      if (rect) {
        setTopBarHeight(rect.height)
      }
    })

    const topBar = topBarRef.current
    if (!topBar) return

    observer.observe(topBar)
    return () => observer.unobserve(topBar)
  }, [topBarRef])

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    function onScroll() {
      // TODO: add a threshold for the "Load More" button
      const onPageBottom =
        window.innerHeight + Math.round(window.scrollY) >=
        document.body.offsetHeight
      if (onPageBottom && !isFetching && totalRowsFetched < filterRows) {
        fetchNextPage()
      }
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [fetchNextPage, isFetching, filterRows, totalRowsFetched])

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility,
      rowSelection,
      columnOrder
    },
    enableMultiRowSelection: false,
    getRowId: (row: any) => `${row?.uuid}`,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: (table: TTable<TData>, columnId: string) => () => {
      const map = getFacetedUniqueValues<TData>()(table, columnId)()
      // TODO: it would be great to do it dynamically, if we recognize the row to be Array.isArray
      if (['regions'].includes(columnId)) {
        const rowValues = table
          .getGlobalFacetedRowModel()
          .flatRows.map(row => row.getValue(columnId) as string[])
        for (const values of rowValues) {
          for (const value of values) {
            const prevValue = map.get(value) || 0
            map.set(value, prevValue + 1)
          }
        }
      }
      return map
    },
    filterFns: { inDateRange, arrSome }
  })

  React.useEffect(() => {
    const columnFiltersWithNullable = filterFields.map(field => {
      const filterValue = columnFilters.find(
        filter => filter.id === field.value
      )
      if (!filterValue) return { id: field.value, value: null }
      return { id: field.value, value: filterValue.value }
    })

    const search = columnFiltersWithNullable.reduce(
      (prev, curr) => {
        prev[curr.id as string] = curr.value
        return prev
      },
      {} as Record<string, unknown>
    )

    setSearch(search)
  }, [columnFilters, filterFields, setSearch])

  React.useEffect(() => {
    setSearch({ sort: sorting?.[0] || null })
  }, [sorting, setSearch])

  const selectedRow = React.useMemo(() => {
    const selectedRowKey = Object.keys(rowSelection)?.[0]
    return table
      .getCoreRowModel()
      .flatRows.find(row => row.id === selectedRowKey)
  }, [rowSelection, table])

  // FIXME: cannot share a uuid with the sheet details
  React.useEffect(() => {
    if (Object.keys(rowSelection)?.length && !selectedRow) {
      setSearch({ uuid: null })
      setRowSelection({})
    } else {
      setSearch({ uuid: Object.keys(rowSelection)?.[0] || null })
    }
  }, [rowSelection, selectedRow, setSearch])

  return (
    <>
      <div className="flex min-h-screen">
        <div
          className={cn(
            'sticky top-0 h-screen w-52 shrink-0 overflow-auto border-r border-border md:w-72',
            !controlsOpen && 'hidden'
          )}
        >
          <div className="flex h-full flex-col">
            <div className="grow p-2">
              <DataTableFilterControls
                table={table}
                columns={columns}
                filterFields={filterFields}
              />
            </div>
            <div className="border-t p-2">
              <SocialsFooter />
            </div>
          </div>
        </div>
        <div
          className={cn(
            'flex w-full flex-1 flex-col text-clip',
            controlsOpen &&
              'sm:max-w-[calc(100vw-13rem)] md:max-w-[calc(100vw-18rem)]'
          )}
        >
          <div
            ref={topBarRef}
            className="sticky top-0 z-10 flex flex-col gap-4 bg-background p-2 pb-4"
          >
            <DataTableFilterCommand
              table={table}
              schema={columnFilterSchema}
              filterFields={filterFields}
              isLoading={isFetching || isLoading}
            />
            <DataTableToolbar
              table={table}
              controlsOpen={controlsOpen}
              setControlsOpen={setControlsOpen}
              isLoading={isFetching || isLoading}
              enableColumnOrdering={true}
            />
            <TimelineChart
              data={chartData}
              className="-mb-2"
              handleFilter={table.getColumn('date')?.setFilterValue}
            />
          </div>
          <div className="z-0">
            <Table containerClassName="overflow-clip">
              <TableHeader
                className="sticky z-20 bg-muted/50 backdrop-blur-lg"
                style={{ top: `${topBarHeight}px` }}
              >
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map(header => (
                      <TableHead
                        key={header.id}
                        className={
                          header.column.columnDef.meta?.headerClassName
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {/* FIXME: should be getRowModel() as filtering */}
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={() => row.toggleSelected()}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          className={
                            cell.column.columnDef.meta?.headerClassName
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="hover:bg-transparent data-[state=selected]:bg-transparent">
                  <TableCell colSpan={columns.length} className="text-center">
                    {totalRowsFetched < filterRows ||
                    !table.getCoreRowModel().rows?.length ? (
                      <Button
                        disabled={isFetching || isLoading}
                        onClick={() => fetchNextPage()}
                        size="sm"
                        variant="outline"
                      >
                        {isFetching ? (
                          <LoaderCircle className="mr-2 size-4 animate-spin" />
                        ) : null}
                        Load More
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No more data to load (total:{' '}
                        <span className="font-mono font-medium">
                          {formatCompactNumber(totalRows)}
                        </span>{' '}
                        rows)
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <DataTableSheetDetails
        // TODO: make it dynamic via renderSheetDetailsContent
        title={(selectedRow?.original as ColumnSchema | undefined)?.pathname}
        titleClassName="font-mono"
        table={table}
      >
        <SheetDetailsContent
          data={selectedRow?.original as ColumnSchema}
          percentiles={currentPercentiles}
          filterRows={filterRows}
        />
      </DataTableSheetDetails>
    </>
  )
}
