import { drizzle } from 'drizzle-orm/mysql2'

export const db = drizzle({ connection: { uri: process.env.DATABASE_URL } })

export interface RequestData {
  method: string
  host: string
  pathname: string
  status: number
  latency: number
  regions: string[]
  timing: {
    dns: number
    connection: number
    tls: number
    ttfb: number
    transfer: number
  }
  headers: Record<string, string>
  message?: string
}
