export { CURRENT_SCHEMA_VERSION, CHAT_DB_SCHEMA, FTS_TABLE_SCHEMA } from './tables'
export { getSchemaVersion, setSchemaVersion, needsMigration, runMigrations } from './migrations'
export type { Migration } from './migrations'
