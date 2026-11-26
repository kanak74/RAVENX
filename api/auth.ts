import crypto from 'node:crypto'
import { neon } from '@neondatabase/serverless'
import { get as getBlob, put as putBlob } from '@vercel/blob'

const COOKIE_NAME = 'vitalora_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

interface StoredUser {
  id: string
  name: string
  email: string
  passwordHash: string
  age?: number | null
  gender?: string
  ageGroup: 'under-18' | 'adult' | 'older-adult'
  preferredLanguage: 'en' | 'hi'
  existingConditions?: string
  allergies?: string
  medicalNotes: string
  createdAt: string
}

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
  schemaInitialized = true
}

function emailKey(email: string): string {
  const digest = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex')
  return `users/${digest}.json`
}

async function blobReadUser(email: string): Promise<StoredUser | null> {
  try {
    const res = await getBlob(emailKey(email), { access: 'private' })
    if (!res || res.statusCode !== 200 || !res.stream) return null
    return (await new Response(res.stream).json()) as StoredUser
  } catch {
    return null
  }
}

async function blobWriteUser(user: StoredUser): Promise<void> {
  await putBlob(emailKey(user.email), JSON.stringify(user), {
    access: 'private',
    contentType: 'application/json',
    allowOverwrite: true,
    addRandomSuffix: false,
  })
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (secret) return secret
  if (process.env.VERCEL_ENV === 'production') {
    throw new Error('AUTH_SECRET_NOT_CONFIGURED')
  }
  return 'vitalora-local-dev-secret'
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

    if (hasPostgres()) {
      await ensureSchema()
      const sql = getSql()
      const rows = await sql`
        SELECT id, name, email, age_group, preferred_language, medical_notes, created_at
        FROM users WHERE id = ${session.userId} LIMIT 1
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
        },
      })
    }

    if (hasBlob()) {
      const user = await blobReadUser(session.email)
      if (!user) {
        return jsonResponse(
          { authenticated: false, user: null },
          200,
          { 'Set-Cookie': clearSessionCookie() },
        )
      }
      return jsonResponse({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          age: user.age ?? null,
          gender: user.gender ?? 'prefer-not-to-say',
          ageGroup: user.ageGroup,
          preferredLanguage: user.preferredLanguage,
          existingConditions: user.existingConditions ?? '',
          allergies: user.allergies ?? '',
          medicalNotes: user.medicalNotes ?? '',
        },
      })
    }

    return jsonResponse(
      { error: 'DATABASE_NOT_CONFIGURED', message: 'Storage is not configured.' },
      503,
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
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

    if (!hasPostgres() && !hasBlob()) {
      return jsonResponse(
        {
          error: 'DATABASE_NOT_CONFIGURED',
          message: 'Storage is not configured in Vercel Project Settings yet.',
        },
        503,
      )
    }

    if (action === 'register') {
      const name = String(body.name ?? '').trim()
      const email = String(body.email ?? '').trim().toLowerCase()
      const password = String(body.password ?? '')
      const rawAge = body.age !== undefined && body.age !== '' ? Number(body.age) : null
      const age = rawAge !== null && Number.isFinite(rawAge) && rawAge >= 1 && rawAge <= 120 ? Math.round(rawAge) : null
      const gender = String(body.gender ?? 'prefer-not-to-say').slice(0, 40)
      const ageGroup = (
        age !== null
          ? age < 18
            ? 'under-18'
            : age >= 65
              ? 'older-adult'
              : 'adult'
          : body.ageGroup === 'under-18' || body.ageGroup === 'older-adult'
            ? body.ageGroup
            : 'adult'
      ) as StoredUser['ageGroup']
      const preferredLanguage: 'en' | 'hi' =
        body.preferredLanguage === 'hi' ? 'hi' : 'en'
      const existingConditions = String(body.existingConditions ?? '').trim().slice(0, 400)
      const allergies = String(body.allergies ?? '').trim().slice(0, 400)
      const medicalNotes = String(body.medicalNotes ?? '').trim().slice(0, 1000)

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

      const id = crypto.randomUUID()
      const passwordHash = hashPassword(password)

      if (hasPostgres()) {
        await ensureSchema()
        const sql = getSql()
        const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
        if (existing.length > 0) {
          return jsonResponse(
            { error: 'An account with this email already exists.' },
            409,
          )
        }
        await sql`
          INSERT INTO users (id, name, email, password_hash, age_group, preferred_language)
          VALUES (${id}, ${name}, ${email}, ${passwordHash}, ${ageGroup}, ${preferredLanguage})
        `
      } else {
        const existing = await blobReadUser(email)
        if (existing) {
          return jsonResponse(
            { error: 'An account with this email already exists.' },
            409,
          )
        }
        await blobWriteUser({
          id,
          name,
          email,
          passwordHash,
          age,
          gender,
          ageGroup,
          preferredLanguage,
          existingConditions,
          allergies,
          medicalNotes,
          createdAt: new Date().toISOString(),
        })
      }

      const token = signSessionToken({ userId: id, email })
      return jsonResponse(
        {
          authenticated: true,
          user: {
            id,
            name,
            email,
            age,
            gender,
            ageGroup,
            preferredLanguage,
            existingConditions,
            allergies,
            medicalNotes,
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

      if (hasPostgres()) {
        await ensureSchema()
        const sql = getSql()
        const rows = await sql`
          SELECT id, name, email, password_hash, age_group, preferred_language, medical_notes
          FROM users WHERE email = ${email} LIMIT 1
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
      } else {
        const user = await blobReadUser(email)
        if (!user || !verifyPassword(password, user.passwordHash)) {
          return jsonResponse({ error: 'Invalid email or password.' }, 401)
        }
        const token = signSessionToken({ userId: user.id, email: user.email })
        return jsonResponse(
          {
            authenticated: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              age: user.age ?? null,
              gender: user.gender ?? 'prefer-not-to-say',
              ageGroup: user.ageGroup,
              preferredLanguage: user.preferredLanguage,
              existingConditions: user.existingConditions ?? '',
              allergies: user.allergies ?? '',
              medicalNotes: user.medicalNotes ?? '',
            },
          },
          200,
          { 'Set-Cookie': buildSessionCookie(token) },
        )
      }
    }

    if (action === 'update-profile') {
      const session = parseSessionFromCookie(request.headers.get('cookie'))
      if (!session) {
        return jsonResponse({ error: 'Authentication required.' }, 401)
      }

      const name = String(body.name ?? '').trim()
      const rawAge = body.age !== undefined && body.age !== '' ? Number(body.age) : null
      const age = rawAge !== null && Number.isFinite(rawAge) && rawAge >= 1 && rawAge <= 120 ? Math.round(rawAge) : null
      const gender = String(body.gender ?? 'prefer-not-to-say').slice(0, 40)
      const ageGroup = (
        age !== null
          ? age < 18
            ? 'under-18'
            : age >= 65
              ? 'older-adult'
              : 'adult'
          : body.ageGroup === 'under-18' || body.ageGroup === 'older-adult'
            ? body.ageGroup
            : 'adult'
      ) as StoredUser['ageGroup']
      const preferredLanguage: 'en' | 'hi' =
        body.preferredLanguage === 'hi' ? 'hi' : 'en'
      const existingConditions = String(body.existingConditions ?? '').trim().slice(0, 400)
      const allergies = String(body.allergies ?? '').trim().slice(0, 400)
      const medicalNotes = String(body.medicalNotes ?? '').slice(0, 1000)

      if (name.length < 2) {
        return jsonResponse({ error: 'Name must be at least 2 characters.' }, 400)
      }

      if (hasPostgres()) {
        await ensureSchema()
        const sql = getSql()
        await sql`
          UPDATE users
          SET name = ${name},
              age_group = ${ageGroup},
              preferred_language = ${preferredLanguage},
              medical_notes = ${medicalNotes}
          WHERE id = ${session.userId}
        `
      } else {
        const existing = await blobReadUser(session.email)
        if (!existing) {
          return jsonResponse({ error: 'User not found.' }, 404)
        }
        await blobWriteUser({
          ...existing,
          name,
          age,
          gender,
          ageGroup,
          preferredLanguage,
          existingConditions,
          allergies,
          medicalNotes,
        })
      }

      return jsonResponse({
        ok: true,
        user: {
          id: session.userId,
          name,
          email: session.email,
          age,
          gender,
          ageGroup,
          preferredLanguage,
          existingConditions,
          allergies,
          medicalNotes,
        },
      })
    }

    return jsonResponse({ error: 'Unsupported action.' }, 400)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return jsonResponse({ error: msg }, 500)
  }
}
