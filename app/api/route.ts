// app/api/route.ts
import { addDays } from 'date-fns'
import { and, between, count, desc, eq, inArray, like, sql } from 'drizzle-orm'
import { MySqlRawQueryResult } from 'drizzle-orm/mysql2'
import { NextRequest } from 'next/server'

import { type ColumnSchema } from '@/app/(app)/schema'
import { searchParamsCache } from '@/app/(app)/search-params'
import {
  filterData,
  getPercentileFromData,
  groupChartData,
  percentileData
} from '@/app/api/helpers'
import { REGIONS } from '@/constants/region'
import { db } from '@/lib/db'
import { requests, type RequestSelect } from '@/lib/db/schema'

// Transform database row to application schema
function transformDbRowToColumnSchema(row: RequestSelect): ColumnSchema {
  return {
    uuid: row.uuid,
    method: row.method as ColumnSchema['method'],
    host: row.host,
    pathname: row.pathname,
    success: row.success,
    latency: row.latency,
    status: row.status,
    regions: row.regions,
    date: row.date,
    headers: row.headers,
    message: row.message ?? undefined,
    'timing.dns': row.timing_dns,
    'timing.connection': row.timing_connection,
    'timing.tls': row.timing_tls,
    'timing.ttfb': row.timing_ttfb,
    'timing.transfer': row.timing_transfer
  }
}

// Build filter conditions using Drizzle
function buildFilterConditions(
  search: Awaited<ReturnType<typeof searchParamsCache.parse>>
) {
  const conditions = []

  // Date range filter
  if (search.date?.length) {
    const [startDate, endDate] = search.date
    conditions.push(
      between(requests.date, startDate, endDate ?? addDays(startDate, 1))
    )
  }

  // Status filter
  if (search.status?.length) {
    conditions.push(inArray(requests.status, search.status))
  }

  // Method filter
  if (search.method?.length) {
    conditions.push(inArray(requests.method, search.method))
  }

  // Region filter - using JSON_CONTAINS
  if (search.regions?.length) {
    const regionConditions = search.regions.map(
      region =>
        sql`JSON_CONTAINS(${requests.regions}, ${JSON.stringify([region])})`
    )
    conditions.push(sql`(${sql.join(regionConditions, sql` OR `)})`)
  }

  // Text search filters
  if (search.host) {
    conditions.push(like(requests.host, `%${search.host}%`))
  }

  if (search.pathname) {
    conditions.push(like(requests.pathname, `%${search.pathname}%`))
  }

  // Timing range filters
  if (search['timing.dns']?.length === 2) {
    conditions.push(
      between(
        requests.timing_dns,
        search['timing.dns'][0],
        search['timing.dns'][1]
      )
    )
  }

  if (search['timing.connection']?.length === 2) {
    conditions.push(
      between(
        requests.timing_connection,
        search['timing.connection'][0],
        search['timing.connection'][1]
      )
    )
  }

  if (search['timing.tls']?.length === 2) {
    conditions.push(
      between(
        requests.timing_tls,
        search['timing.tls'][0],
        search['timing.tls'][1]
      )
    )
  }

  if (search['timing.ttfb']?.length === 2) {
    conditions.push(
      between(
        requests.timing_ttfb,
        search['timing.ttfb'][0],
        search['timing.ttfb'][1]
      )
    )
  }

  if (search['timing.transfer']?.length === 2) {
    conditions.push(
      between(
        requests.timing_transfer,
        search['timing.transfer'][0],
        search['timing.transfer'][1]
      )
    )
  }

  return conditions
}

// Get aggregated timing stats using Drizzle
async function getTimingRanges() {
  const result = await db
    .select({
      dns_min: sql<number>`MIN(${requests.timing_dns})`.as('dns_min'),
      dns_max: sql<number>`MAX(${requests.timing_dns})`.as('dns_max'),
      connection_min: sql<number>`MIN(${requests.timing_connection})`.as(
        'connection_min'
      ),
      connection_max: sql<number>`MAX(${requests.timing_connection})`.as(
        'connection_max'
      ),
      tls_min: sql<number>`MIN(${requests.timing_tls})`.as('tls_min'),
      tls_max: sql<number>`MAX(${requests.timing_tls})`.as('tls_max'),
      ttfb_min: sql<number>`MIN(${requests.timing_ttfb})`.as('ttfb_min'),
      ttfb_max: sql<number>`MAX(${requests.timing_ttfb})`.as('ttfb_max'),
      transfer_min: sql<number>`MIN(${requests.timing_transfer})`.as(
        'transfer_min'
      ),
      transfer_max: sql<number>`MAX(${requests.timing_transfer})`.as(
        'transfer_max'
      )
    })
    .from(requests)
    .execute()

  return result[0]
}

// Get filter options using Drizzle
async function getTotalFilters() {
  try {
    const [methods, statuses, hosts] = await Promise.all([
      // Get unique methods
      db
        .selectDistinct({
          value: requests.method
        })
        .from(requests)
        .execute(),

      // Get unique statuses
      db
        .selectDistinct({
          value: requests.status
        })
        .from(requests)
        .execute(),

      // Get unique hosts
      db
        .selectDistinct({
          value: requests.host
        })
        .from(requests)
        .execute()
    ])

    // Get unique regions
    const regionsResult = await db
      .select({
        region:
          sql<string>`DISTINCT JSON_UNQUOTE(JSON_EXTRACT(${requests.regions}, '$[*]'))`.as(
            'region'
          )
      })
      .from(requests)
      .where(sql`JSON_VALID(${requests.regions})`)
      .execute()

    const regions = regionsResult
      .map(row => row.region)
      .filter((region): region is (typeof REGIONS)[number] =>
        REGIONS.includes(region as (typeof REGIONS)[number])
      )

    // Get timing ranges
    const timingRanges = await getTimingRanges()

    return {
      method: methods.map(m => m.value),
      status: statuses.map(s => s.value),
      regions,
      host: hosts.map(h => h.value),
      'timing.dns': [timingRanges.dns_min, timingRanges.dns_max],
      'timing.connection': [
        timingRanges.connection_min,
        timingRanges.connection_max
      ],
      'timing.tls': [timingRanges.tls_min, timingRanges.tls_max],
      'timing.ttfb': [timingRanges.ttfb_min, timingRanges.ttfb_max],
      'timing.transfer': [timingRanges.transfer_min, timingRanges.transfer_max]
    }
  } catch (error) {
    console.error('Error getting filter options:', error)
    throw error
  }
}

export async function GET(req: NextRequest) {
  try {
    // Parse search params
    const _search = new Map<string, string>()
    req.nextUrl.searchParams.forEach((value, key) => _search.set(key, value))
    const search = await searchParamsCache.parse(Object.fromEntries(_search))

    // Build filter conditions
    const conditions = buildFilterConditions(search)

    // Get total and filtered counts using Drizzle
    const [totalResult, filteredResult] = await Promise.all([
      db
        .select({
          value: count().as('count')
        })
        .from(requests)
        .execute(),

      db
        .select({
          value: count().as('count')
        })
        .from(requests)
        .where(and(...conditions))
        .execute()
    ])

    const totalCount = totalResult[0]?.value ?? 0
    const filteredCount = filteredResult[0]?.value ?? 0

    // Get paginated data
    const data = await db
      .select()
      .from(requests)
      .where(and(...conditions))
      .orderBy(desc(requests.date))
      .limit(search.size)
      .offset(search.start)
      .execute()

    // Transform and calculate metrics
    const transformedData = data.map(transformDbRowToColumnSchema)
    const withPercentileData = percentileData(transformedData)
    const chartData = groupChartData(transformedData, search.date || null)
    const currentPercentiles = getPercentileFromData(transformedData)

    // Get filter options
    const totalFilters = await getTotalFilters()

    return Response.json({
      data: withPercentileData,
      meta: {
        totalRowCount: totalCount,
        filterRowCount: filteredCount,
        totalFilters,
        currentPercentiles,
        chartData
      }
    })
  } catch (error) {
    console.error('API Error:', error)

    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function HEAD(req: NextRequest) {
  return GET(req)
}
