import crypto from 'node:crypto'
import { ensureSchema, getSql } from './_lib/db'
import { parseSessionFromCookie } from './_lib/auth'

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
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg === 'DATABASE_NOT_CONFIGURED') {
      return jsonResponse({ error: 'DATABASE_NOT_CONFIGURED' }, 503)
    }
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
    await ensureSchema()
    const sql = getSql()

    const id = crypto.randomUUID()
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg === 'DATABASE_NOT_CONFIGURED') {
      return jsonResponse({ error: 'DATABASE_NOT_CONFIGURED' }, 503)
    }
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

    await ensureSchema()
    const sql = getSql()
    await sql`
      DELETE FROM health_assessments
      WHERE id = ${id} AND user_id = ${session.userId}
    `

    return jsonResponse({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return jsonResponse({ error: msg }, 500)
  }
}
