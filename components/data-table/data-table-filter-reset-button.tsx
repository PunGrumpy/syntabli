'use client'

import type { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

import type { DataTableFilterField } from '@/components/data-table/types'
import { Button } from '@/components/ui/button'

type DataTableFilterResetButtonProps<TData> = DataTableFilterField<TData> & {
  table: Table<TData>
}

export function DataTableFilterResetButton<TData>({
  table,
  value: _value
}: DataTableFilterResetButtonProps<TData>) {
  const value = _value as string
  const column = table.getColumn(value)
  const filterValue = column?.getFilterValue()

  // TODO: check if we could useMemo
  const filters = filterValue
    ? Array.isArray(filterValue)
      ? filterValue
      : [filterValue]
    : []

  if (filters.length === 0) return null

  return (
    <Button
      variant="outline"
      className="h-5 rounded-full px-1.5 py-1 font-mono text-[10px]"
      onClick={e => {
        e.stopPropagation()
        column?.setFilterValue(undefined)
      }}
      onKeyDown={e => {
        e.stopPropagation()
        if (e.code === 'Enter') {
          column?.setFilterValue(undefined)
        }
      }}
      asChild
    >
      {/* REMINDER: `AccordionTrigger` is also a button(!) and we get Hydration error when rendering button within button */}
      <div role="button" tabIndex={0}>
        <span>{filters.length}</span>
        <X className="ml-1 size-2.5 text-muted-foreground" />
      </div>
    </Button>
  )
}
