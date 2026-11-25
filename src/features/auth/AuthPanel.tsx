import { useState, type FormEvent } from 'react'
import { Container } from '../../components/layout/Container'
import { Section } from '../../components/layout/Section'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth, type UserProfile } from './AuthContext'

export interface AuthPanelProps {
  onBack: () => void
  onOpenHistory: () => void
}

export function AuthPanel({ onBack, onOpenHistory }: AuthPanelProps) {
  const { user, dbConfigured, login, register, updateProfile, logout } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ageGroup, setAgeGroup] = useState<UserProfile['ageGroup']>(
    user?.ageGroup ?? 'adult',
  )
  const [preferredLanguage, setPreferredLanguage] = useState<
    UserProfile['preferredLanguage']
  >(user?.preferredLanguage ?? 'en')
  const [medicalNotes, setMedicalNotes] = useState(user?.medicalNotes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [savedNotice, setSavedNotice] = useState('')

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res =
        mode === 'login'
          ? await login(email, password)
          : await register({
              name,
              email,
              password,
              ageGroup,
              preferredLanguage,
            })
      if (!res.ok) {
        setError(res.error ?? 'Authentication failed.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSavedNotice('')
    setSubmitting(true)
    try {
      const res = await updateProfile({
        name: name || user?.name || '',
        ageGroup,
        preferredLanguage,
        medicalNotes,
      })
      if (!res.ok) {
        setError(res.error ?? 'Could not save profile.')
      } else {
        setSavedNotice('Profile updated securely.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Section tone="ivory" bordered={false} className="min-h-[75vh] py-10">
      <Container size="narrow">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={onBack}>
              ← Back to VITALORA
            </Button>
            {user ? (
              <Button variant="ghost" size="sm" onClick={onOpenHistory}>
                View Health History
              </Button>
            ) : null}
          </div>

          {!dbConfigured ? (
            <div className="rounded-2xl border border-coral/35 bg-coral-soft/60 p-5 text-sm text-charcoal">
              <p className="font-semibold">Neon Postgres connection needed</p>
              <p className="mt-1 text-slate">
                User accounts and persistent health history require{' '}
                <code>DATABASE_URL</code> to be connected on Vercel. You can
                still run symptom checks, ML pattern analysis, PDF downloads, and
                nearby facility search without signing in.
              </p>
            </div>
          ) : null}

          {user ? (
            <div className="rounded-3xl border border-hairline bg-paper p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-5">
                <div>
                  <Badge tone="forest" dotColor="#174B42">
                    Signed in
                  </Badge>
                  <h1 className="mt-2 font-display text-2xl font-semibold text-charcoal sm:text-3xl">
                    {user.name}
                  </h1>
                  <p className="text-sm text-stone">{user.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void logout()}>
                  Sign out
                </Button>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone"
                  >
                    Full name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name || user.name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="profile-age"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone"
                    >
                      Age group
                    </label>
                    <select
                      id="profile-age"
                      value={ageGroup}
                      onChange={(e) =>
                        setAgeGroup(e.target.value as UserProfile['ageGroup'])
                      }
                      className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                    >
                      <option value="under-18">Under 18</option>
                      <option value="adult">Adult (18–64)</option>
                      <option value="older-adult">Older adult (65+)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="profile-lang"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone"
                    >
                      Preferred assistant language
                    </label>
                    <select
                      id="profile-lang"
                      value={preferredLanguage}
                      onChange={(e) =>
                        setPreferredLanguage(
                          e.target.value as UserProfile['preferredLanguage'],
                        )
                      }
                      className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="profile-notes"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone"
                  >
                    Personal health notes (allergies or ongoing conditions)
                  </label>
                  <textarea
                    id="profile-notes"
                    rows={3}
                    value={medicalNotes}
                    onChange={(e) => setMedicalNotes(e.target.value)}
                    placeholder="Optional notes stored privately in your account..."
                    className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                  />
                </div>

                {error ? (
                  <p role="alert" className="text-sm font-medium text-urgent">
                    {error}
                  </p>
                ) : null}
                {savedNotice ? (
                  <p className="text-sm font-medium text-forest">{savedNotice}</p>
                ) : null}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button type="submit" variant="forest" size="md" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save profile'}
                  </Button>
                  <Button type="button" variant="outline" size="md" onClick={onOpenHistory}>
                    My Health History
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-3xl border border-hairline bg-paper p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <Badge tone="forest" dotColor="#174B42">
                  Patient Account
                </Badge>
                <h1 className="font-display text-3xl font-semibold text-charcoal">
                  {mode === 'login'
                    ? 'Sign in to VITALORA'
                    : 'Create your VITALORA account'}
                </h1>
                <p className="text-sm text-slate">
                  Save your symptom assessments securely, keep personal context,
                  and download past reports anytime.
                </p>
              </div>

              <div className="inline-flex rounded-xl border border-hairline bg-ivory p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError('')
                  }}
                  className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                    mode === 'login'
                      ? 'bg-forest text-paper'
                      : 'text-slate hover:text-charcoal'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError('')
                  }}
                  className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                    mode === 'register'
                      ? 'bg-forest text-paper'
                      : 'text-slate hover:text-charcoal'
                  }`}
                >
                  Create account
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {mode === 'register' ? (
                  <div>
                    <label
                      htmlFor="auth-name"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone"
                    >
                      Full name
                    </label>
                    <input
                      id="auth-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                    />
                  </div>
                ) : null}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone"
                  >
                    Email address
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone"
                  >
                    Password (min 8 characters)
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                  />
                </div>

                {mode === 'register' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="reg-age"
                        className="block text-xs font-semibold uppercase tracking-wider text-stone"
                      >
                        Age group
                      </label>
                      <select
                        id="reg-age"
                        value={ageGroup}
                        onChange={(e) =>
                          setAgeGroup(e.target.value as UserProfile['ageGroup'])
                        }
                        className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                      >
                        <option value="under-18">Under 18</option>
                        <option value="adult">Adult (18–64)</option>
                        <option value="older-adult">Older adult (65+)</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="reg-lang"
                        className="block text-xs font-semibold uppercase tracking-wider text-stone"
                      >
                        Preferred language
                      </label>
                      <select
                        id="reg-lang"
                        value={preferredLanguage}
                        onChange={(e) =>
                          setPreferredLanguage(
                            e.target.value as UserProfile['preferredLanguage'],
                          )
                        }
                        className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                      >
                        <option value="en">English</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                      </select>
                    </div>
                  </div>
                ) : null}

                {error ? (
                  <p role="alert" className="text-sm font-medium text-urgent">
                    {error}
                  </p>
                ) : null}

                <Button type="submit" variant="forest" size="lg" disabled={submitting}>
                  {submitting
                    ? 'Please wait...'
                    : mode === 'login'
                      ? 'Sign in'
                      : 'Create account'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
