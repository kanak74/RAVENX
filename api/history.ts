import crypto from 'node:crypto'
import { neon } from '@neondatabase/serverless'
import { del as delBlob, get as getBlob, list as listBlobs, put as putBlob } from '@vercel/blob'

const COOKIE_NAME = 'vitalora_session'
let schemaInitialized = false

function hasPostgres() {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL)
}

function hasBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_NOT_CONFIGURED')
  return neon(url)
}

async function ensureSchema() {
  if (schemaInitialized) return
  const sql = getSql()
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

function getSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.VERCEL_PROJECT_ID ||
    'vitalora-session-secret'
  )
}

interface SessionPayload {
  userId: string
  email: string
  exp: number
}

function parseSessionFromCookie(cookieHeader: string | null): SessionPayload | null {
  if (!cookieHeader) return null
  const pairs = cookieHeader.split(';').map((p) => p.trim())
  const match = pairs.find((p) => p.startsWith(`${COOKIE_NAME}=`))
  if (!match) return null
  const token = decodeURIComponent(match.slice(COOKIE_NAME.length + 1))
  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return null
  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(encoded)
    .digest('base64url')
  if (sig.length !== expected.length) return null
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf-8'),
    ) as SessionPayload
    if (!parsed.userId || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export async function GET(request: Request): Promise<Response> {
  try {
    const session = parseSessionFromCookie(request.headers.get('cookie'))
    if (!session) {
      return jsonResponse({ error: 'Authentication required.' }, 401)
    }

    if (hasPostgres()) {
      await ensureSchema()
      const sql = getSql()
      const rows = await sql`
        SELECT id, symptoms, details, measurements, care_level, ml_predictions, summary_text, created_at
        FROM health_assessments
        WHERE user_id = ${session.userId}
        ORDER BY created_at DESC
        LIMIT 25
      `
      return jsonResponse({
        items: rows.map((r) => ({
          id: r.id,
          symptoms: r.symptoms,
          details: r.details,
          measurements: r.measurements,
          careLevel: r.care_level,
          mlPredictions: r.ml_predictions,
          summaryText: r.summary_text,
          createdAt: r.created_at,
        })),
      })
    }

    if (hasBlob()) {
      const listed = await listBlobs({ prefix: `history/${session.userId}/`, limit: 25 })
      const records = await Promise.all(
        listed.blobs.map(async (b) => {
          try {
            const res = await getBlob(b.pathname, { access: 'private' })
            if (!res || res.statusCode !== 200 || !res.stream) return null
            return await new Response(res.stream).json()
          } catch {
            return null
          }
        }),
      )
      const items = records
        .filter((r): r is Record<string, unknown> => Boolean(r))
        .sort((a, b) =>
          String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')),
        )
      return jsonResponse({ items })
    }

    return jsonResponse({ error: 'DATABASE_NOT_CONFIGURED' }, 503)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return jsonResponse({ error: msg }, 500)
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const session = parseSessionFromCookie(request.headers.get('cookie'))
    if (!session) {
      return jsonResponse({ error: 'Authentication required.' }, 401)
    }

    const body = (await request.json()) as Record<string, unknown>
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()

    if (hasPostgres()) {
      await ensureSchema()
      const sql = getSql()
      const symptoms = JSON.stringify(body.symptoms ?? [])
      const details = JSON.stringify(body.details ?? {})
      const measurements = JSON.stringify(body.measurements ?? {})
      const careLevel = String(body.careLevel ?? 'monitor')
      const mlPredictions = JSON.stringify(body.mlPredictions ?? [])
      const summaryText = String(body.summaryText ?? '').slice(0, 2000)

      await sql`
        INSERT INTO health_assessments (id, user_id, symptoms, details, measurements, care_level, ml_predictions, summary_text)
        VALUES (${id}, ${session.userId}, ${symptoms}::jsonb, ${details}::jsonb, ${measurements}::jsonb, ${careLevel}, ${mlPredictions}::jsonb, ${summaryText})
      `
      return jsonResponse({ ok: true, id }, 201)
    }

    if (hasBlob()) {
      const record = {
        id,
        symptoms: body.symptoms ?? [],
        details: body.details ?? {},
        measurements: body.measurements ?? {},
        careLevel: String(body.careLevel ?? 'monitor'),
        mlPredictions: body.mlPredictions ?? [],
        summaryText: String(body.summaryText ?? '').slice(0, 2000),
        createdAt,
      }
      await putBlob(
        `history/${session.userId}/${id}.json`,
        JSON.stringify(record),
        {
          access: 'private',
          contentType: 'application/json',
          allowOverwrite: true,
          addRandomSuffix: false,
        },
      )
      return jsonResponse({ ok: true, id }, 201)
    }

    return jsonResponse({ error: 'DATABASE_NOT_CONFIGURED' }, 503)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return jsonResponse({ error: msg }, 500)
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const session = parseSessionFromCookie(request.headers.get('cookie'))
    if (!session) {
      return jsonResponse({ error: 'Authentication required.' }, 401)
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return jsonResponse({ error: 'Missing assessment id.' }, 400)
    }

    if (hasPostgres()) {
      await ensureSchema()
      const sql = getSql()
      await sql`
        DELETE FROM health_assessments
        WHERE id = ${id} AND user_id = ${session.userId}
      `
      return jsonResponse({ ok: true })
    }

    if (hasBlob()) {
      await delBlob(`history/${session.userId}/${id}.json`)
      return jsonResponse({ ok: true })
    }

    return jsonResponse({ error: 'DATABASE_NOT_CONFIGURED' }, 503)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return jsonResponse({ error: msg }, 500)
  }
}
