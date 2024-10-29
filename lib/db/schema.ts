import {
  boolean,
  int,
  json,
  mysqlTable,
  timestamp,
  varchar
} from 'drizzle-orm/mysql-core'

import { REGIONS } from '@/constants/region'

export const requests = mysqlTable('requests', {
  uuid: varchar('uuid', { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  method: varchar('method', { length: 10 }).notNull(),
  host: varchar('host', { length: 255 }).notNull(),
  pathname: varchar('pathname', { length: 255 }).notNull(),
  success: boolean('success').notNull(),
  latency: int('latency').notNull(),
  status: int('status').notNull(),
  regions: json('regions').$type<(typeof REGIONS)[number][]>().notNull(),
  date: timestamp('date').notNull().defaultNow(),
  headers: json('headers').$type<Record<string, string>>().notNull(),
  message: varchar('message', { length: 255 }),
  // Store timing as separate columns for better querying
  timing_dns: int('timing_dns').notNull(),
  timing_connection: int('timing_connection').notNull(),
  timing_tls: int('timing_tls').notNull(),
  timing_ttfb: int('timing_ttfb').notNull(),
  timing_transfer: int('timing_transfer').notNull()
})

// Types
export type RequestTable = typeof requests
export type RequestInsert = typeof requests.$inferInsert
export type RequestSelect = typeof requests.$inferSelect

export interface TimingData {
  dns: number
  connection: number
  tls: number
  ttfb: number
  transfer: number
}
