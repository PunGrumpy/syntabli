'use client'

import type { Table } from '@tanstack/react-table'
import { useMemo } from 'react'
import type { DateRange } from 'react-day-picker'

import { DatePickerWithRange } from '@/components/custom/date-picker-with-range'
import type { DataTableTimerangeFilterField } from '@/components/data-table/types'
import { isArrayOfDates } from '@/lib/is-array'

type DataTableFilterTimerangeProps<TData> =
  DataTableTimerangeFilterField<TData> & {
    table: Table<TData>
  }

// TBD: add debounce to reduce to number of filters
// TODO: extract onChange

export function DataTableFilterTimerange<TData>({
  table,
  value: _value,
  presets
}: DataTableFilterTimerangeProps<TData>) {
  const value = _value as string
  const column = table.getColumn(value)
  const filterValue = column?.getFilterValue()

  const date: DateRange | undefined = useMemo(
    () =>
      filterValue instanceof Date
        ? { from: filterValue, to: undefined }
        : Array.isArray(filterValue) && isArrayOfDates(filterValue)
          ? { from: filterValue?.[0], to: filterValue?.[1] }
          : undefined,
    [filterValue]
  )

  const setDate = (date: DateRange | undefined) => {
    if (!date) return // TODO: remove from search params if columnFilter is removed
    if (date.from && !date.to) {
      column?.setFilterValue([date.from])
    }
    if (date.to && date.from) {
      column?.setFilterValue([date.from, date.to])
    }
  }

  return <DatePickerWithRange {...{ date, setDate, presets }} />
}
