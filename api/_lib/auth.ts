import crypto from 'node:crypto'

const COOKIE_NAME = 'vitalora_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function getSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.VERCEL_PROJECT_ID ||
    'vitalora-local-dev-secret-change-in-prod'
  )
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derived}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, keyHex] = stored.split(':')
  if (!salt || !keyHex) return false
  const derived = crypto.scryptSync(password, salt, 64)
  const storedBuf = Buffer.from(keyHex, 'hex')
  if (derived.length !== storedBuf.length) return false
  return crypto.timingSafeEqual(derived, storedBuf)
}

export interface SessionPayload {
  userId: string
  email: string
  exp: number
}

export function signSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
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

export function verifySessionToken(token: string): SessionPayload | null {
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

export function parseSessionFromCookie(cookieHeader: string | null): SessionPayload | null {
  if (!cookieHeader) return null
  const pairs = cookieHeader.split(';').map((p) => p.trim())
  const match = pairs.find((p) => p.startsWith(`${COOKIE_NAME}=`))
  if (!match) return null
  const token = decodeURIComponent(match.slice(COOKIE_NAME.length + 1))
  return verifySessionToken(token)
}

export function buildSessionCookie(token: string): string {
  const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${
    isProd ? '; Secure' : ''
  }`
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}
