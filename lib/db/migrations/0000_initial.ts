import { sql } from 'drizzle-orm'

export async function up(db: any) {
  await db.schema.createTable('requests').execute(sql`
      CREATE TABLE requests (
        uuid VARCHAR(36) PRIMARY KEY,
        method VARCHAR(10) NOT NULL,
        host VARCHAR(255) NOT NULL,
        pathname VARCHAR(255) NOT NULL,
        success BOOLEAN NOT NULL,
        latency INT NOT NULL,
        status INT NOT NULL,
        regions JSON NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        headers JSON NOT NULL,
        message VARCHAR(255),
        timing JSON NOT NULL,
        INDEX date_idx (date),
        INDEX status_idx (status),
        INDEX host_idx (host)
      )
    `)
}

export async function down(db: any) {
  await db.schema.dropTable('requests').execute()
}
