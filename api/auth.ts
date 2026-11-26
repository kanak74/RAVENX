import crypto from 'node:crypto'
import { neon } from '@neondatabase/serverless'

const COOKIE_NAME = 'vitalora_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

let schemaInitialized = false

function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) {
    throw new Error('DATABASE_NOT_CONFIGURED')
  }
  return neon(url)
}

async function ensureSchema() {
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

function getSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.VERCEL_PROJECT_ID ||
    'vitalora-session-secret'
  )
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derived}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, keyHex] = stored.split(':')
  if (!salt || !keyHex) return false
  const derived = crypto.scryptSync(password, salt, 64)
  const storedBuf = Buffer.from(keyHex, 'hex')
  if (derived.length !== storedBuf.length) return false
  return crypto.timingSafeEqual(derived, storedBuf)
}

interface SessionPayload {
  userId: string
  email: string
  exp: number
}

function signSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  }
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url')
  const sig = crypto
    .createHmac('sha256', getSecret())
    .update(encoded)
    .digest('base64url')
  return `${encoded}.${sig}`
}

function verifySessionToken(token: string): SessionPayload | null {
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

function parseSessionFromCookie(cookieHeader: string | null): SessionPayload | null {
  if (!cookieHeader) return null
  const pairs = cookieHeader.split(';').map((p) => p.trim())
  const match = pairs.find((p) => p.startsWith(`${COOKIE_NAME}=`))
  if (!match) return null
  const token = decodeURIComponent(match.slice(COOKIE_NAME.length + 1))
  return verifySessionToken(token)
}

function buildSessionCookie(token: string): string {
  const isProd =
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production'
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${
    isProd ? '; Secure' : ''
  }`
}

function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

function jsonResponse(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })
}

export async function GET(request: Request): Promise<Response> {
  try {
    const session = parseSessionFromCookie(request.headers.get('cookie'))
    if (!session) {
      return jsonResponse({ authenticated: false, user: null }, 200)
    }

    await ensureSchema()
    const sql = getSql()
    const rows = await sql`
      SELECT id, name, email, age_group, preferred_language, medical_notes, created_at
      FROM users
      WHERE id = ${session.userId}
      LIMIT 1
    `

    if (!rows.length) {
      return jsonResponse(
        { authenticated: false, user: null },
        200,
        { 'Set-Cookie': clearSessionCookie() },
      )
    }

    const u = rows[0]
    return jsonResponse({
      authenticated: true,
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        ageGroup: u.age_group,
        preferredLanguage: u.preferred_language,
        medicalNotes: u.medical_notes,
        createdAt: u.created_at,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg === 'DATABASE_NOT_CONFIGURED') {
      return jsonResponse(
        {
          error: 'DATABASE_NOT_CONFIGURED',
          message:
            'Neon Postgres DATABASE_URL is not configured in Vercel Project Settings yet.',
        },
        503,
      )
    }
    return jsonResponse({ error: msg }, 500)
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const action = String(body.action ?? '')

    if (action === 'logout') {
      return jsonResponse(
        { ok: true },
        200,
        { 'Set-Cookie': clearSessionCookie() },
      )
    }

    await ensureSchema()
    const sql = getSql()

    if (action === 'register') {
      const name = String(body.name ?? '').trim()
      const email = String(body.email ?? '').trim().toLowerCase()
      const password = String(body.password ?? '')
      const ageGroup = String(body.ageGroup ?? 'adult')
      const preferredLanguage = body.preferredLanguage === 'hi' ? 'hi' : 'en'

      if (name.length < 2) {
        return jsonResponse({ error: 'Please enter your full name.' }, 400)
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return jsonResponse({ error: 'Please enter a valid email address.' }, 400)
      }
      if (password.length < 8) {
        return jsonResponse(
          { error: 'Password must be at least 8 characters long.' },
          400,
        )
      }

      const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
      if (existing.length > 0) {
        return jsonResponse(
          { error: 'An account with this email already exists.' },
          409,
        )
      }

      const id = crypto.randomUUID()
      const passwordHash = hashPassword(password)

      await sql`
        INSERT INTO users (id, name, email, password_hash, age_group, preferred_language)
        VALUES (${id}, ${name}, ${email}, ${passwordHash}, ${ageGroup}, ${preferredLanguage})
      `

      const token = signSessionToken({ userId: id, email })
      return jsonResponse(
        {
          authenticated: true,
          user: {
            id,
            name,
            email,
            ageGroup,
            preferredLanguage,
            medicalNotes: '',
          },
        },
        201,
        { 'Set-Cookie': buildSessionCookie(token) },
      )
    }

    if (action === 'login') {
      const email = String(body.email ?? '').trim().toLowerCase()
      const password = String(body.password ?? '')

      if (!email || !password) {
        return jsonResponse(
          { error: 'Email and password are required.' },
          400,
        )
      }

      const rows = await sql`
        SELECT id, name, email, password_hash, age_group, preferred_language, medical_notes
        FROM users
        WHERE email = ${email}
        LIMIT 1
      `
      if (
        !rows.length ||
        !verifyPassword(password, String(rows[0].password_hash))
      ) {
        return jsonResponse({ error: 'Invalid email or password.' }, 401)
      }

      const u = rows[0]
      const token = signSessionToken({
        userId: String(u.id),
        email: String(u.email),
      })
      return jsonResponse(
        {
          authenticated: true,
          user: {
            id: u.id,
            name: u.name,
            email: u.email,
            ageGroup: u.age_group,
            preferredLanguage: u.preferred_language,
            medicalNotes: u.medical_notes,
          },
        },
        200,
        { 'Set-Cookie': buildSessionCookie(token) },
      )
    }

    if (action === 'update-profile') {
      const session = parseSessionFromCookie(request.headers.get('cookie'))
      if (!session) {
        return jsonResponse({ error: 'Authentication required.' }, 401)
      }

      const name = String(body.name ?? '').trim()
      const ageGroup = String(body.ageGroup ?? 'adult')
      const preferredLanguage = body.preferredLanguage === 'hi' ? 'hi' : 'en'
      const medicalNotes = String(body.medicalNotes ?? '').slice(0, 1000)

      if (name.length < 2) {
        return jsonResponse({ error: 'Name must be at least 2 characters.' }, 400)
      }

      await sql`
        UPDATE users
        SET name = ${name},
            age_group = ${ageGroup},
            preferred_language = ${preferredLanguage},
            medical_notes = ${medicalNotes}
        WHERE id = ${session.userId}
      `

      return jsonResponse({
        ok: true,
        user: {
          id: session.userId,
          name,
          email: session.email,
          ageGroup,
          preferredLanguage,
          medicalNotes,
        },
      })
    }

    return jsonResponse({ error: 'Unsupported action.' }, 400)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg === 'DATABASE_NOT_CONFIGURED') {
      return jsonResponse(
        {
          error: 'DATABASE_NOT_CONFIGURED',
          message:
            'Neon Postgres DATABASE_URL is not configured in Vercel Project Settings yet.',
        },
        503,
      )
    }
    return jsonResponse({ error: msg }, 500)
  }
}
