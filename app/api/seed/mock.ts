import { subMinutes } from 'date-fns'

import { ColumnSchema } from '@/app/(app)/schema'
import { METHODS } from '@/constants/method'
import { REGIONS } from '@/constants/region'

function getRandomTiming(latency: number) {
  // Generate random percentages within specified ranges
  const dns = Math.random() * (0.15 - 0.05) + 0.05 // 5% to 15%
  const connection = Math.random() * (0.3 - 0.1) + 0.1 // 10% to 30%
  const tls = Math.random() * (0.1 - 0.05) + 0.05 // 5% to 10%
  const transfer = Math.random() * (0.004 - 0) + 0.004 // 0% to 0.4%

  // Ensure the sum is subtracted from 100% for ttfb
  const remaining = 1 - (dns + connection + tls + transfer)

  return {
    timing_dns: Math.round(latency * dns),
    timing_connection: Math.round(latency * connection),
    timing_tls: Math.round(latency * tls),
    timing_ttfb: Math.round(latency * remaining),
    timing_transfer: Math.round(latency * transfer)
  }
}

function getRandomStatusCode() {
  const rand = Math.random()
  if (rand < 0.9) return 200
  if (rand < 0.94) return 400
  if (rand < 0.98) return 404
  if (rand < 0.99) return 429
  return 500
}

function getMessage() {
  return 'ERR_INTERNAL_DISASTER: "The server spilled coffee on itself."'
}

const pathnames = ['/bikes/gravel', '/bikes/racing', '/bikes/mountain']

function getRandomRequestObject(): {
  method: (typeof METHODS)[number]
  host: string
  pathname: string
} {
  const rand = Math.random()
  if (rand < 0.5) {
    return {
      method: 'POST',
      host: 'api.acme-shop.com',
      pathname: '/v1/products'
    }
  } else {
    return {
      method: 'GET',
      host: 'acme-shop.com',
      pathname: pathnames[Math.floor(Math.random() * pathnames.length)]
    }
  }
}

function getHeaders() {
  return {
    Age: '0',
    'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
    Server: 'Cloudflare'
  }
}

const multiplier: Record<(typeof REGIONS)[number], number> = {
  ams: 1,
  iad: 0.6,
  gru: 1.6,
  syd: 1.3,
  fra: 0.8,
  hkg: 1.4
}

function createMockData({ minutes = 0 }: { minutes?: number }) {
  const date = subMinutes(new Date(), minutes)
  const random = Math.random()

  const statusCode = {
    ams: getRandomStatusCode(),
    iad: getRandomStatusCode(),
    gru: getRandomStatusCode(),
    syd: getRandomStatusCode(),
    fra: getRandomStatusCode(),
    hkg: getRandomStatusCode()
  }

  const latency = {
    ams: Math.round(1000 * (random * (1 - multiplier.ams) + multiplier.ams)),
    iad: Math.round(1000 * (random * (1 - multiplier.iad) + multiplier.iad)),
    gru: Math.round(1000 * (random * (1 - multiplier.gru) + multiplier.gru)),
    syd: Math.round(1000 * (random * (1 - multiplier.syd) + multiplier.syd)),
    fra: Math.round(1000 * (random * (1 - multiplier.fra) + multiplier.fra)),
    hkg: Math.round(1000 * (random * (1 - multiplier.hkg) + multiplier.hkg))
  }

  const requestObject = getRandomRequestObject()
  const headers = getHeaders()

  return REGIONS.map(region => ({
    uuid: crypto.randomUUID(),
    success: 200 === statusCode[region],
    latency: latency[region],
    regions: [region],
    status: statusCode[region],
    date,
    headers,
    message: 500 === statusCode[region] ? getMessage() : null,
    ...getRandomTiming(latency[region]),
    ...requestObject
  }))
}

export default createMockData
