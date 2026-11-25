import { neon } from '@neondatabase/serverless'

let schemaInitialized = false

export function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_NOT_CONFIGURED')
  }
  return neon(url)
}

export async function ensureSchema() {
  if (schemaInitialized) return
  const sql = getSql()

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      age_group TEXT DEFAULT 'adult',
      preferred_language TEXT DEFAULT 'en',
      medical_notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS health_assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      symptoms JSONB NOT NULL,
      details JSONB NOT NULL,
      measurements JSONB NOT NULL,
      care_level TEXT NOT NULL,
      ml_predictions JSONB NOT NULL,
      summary_text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  schemaInitialized = true
}
