import { useEffect, useState, type FormEvent } from 'react'
import { Container } from '../../components/layout/Container'
import { Section } from '../../components/layout/Section'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth, type UserProfile } from './AuthContext'

export interface AuthPanelProps {
  onBack: () => void
  onOpenHistory: () => void
  onStartSymptomCheck?: () => void
}

export function AuthPanel({
  onBack,
  onOpenHistory,
  onStartSymptomCheck,
}: AuthPanelProps) {
  const { user, dbConfigured, login, register, updateProfile, logout } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState<string>(user?.age ? String(user.age) : '')
  const [gender, setGender] = useState(user?.gender ?? 'prefer-not-to-say')
  const [preferredLanguage, setPreferredLanguage] = useState<
    UserProfile['preferredLanguage']
  >(user?.preferredLanguage ?? 'en')
  const [existingConditions, setExistingConditions] = useState(
    user?.existingConditions ?? '',
  )
  const [allergies, setAllergies] = useState(user?.allergies ?? '')
  const [medicalNotes, setMedicalNotes] = useState(user?.medicalNotes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [savedNotice, setSavedNotice] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setAge(user.age ? String(user.age) : '')
      setGender(user.gender ?? 'prefer-not-to-say')
      setPreferredLanguage(user.preferredLanguage)
      setExistingConditions(user.existingConditions ?? '')
      setAllergies(user.allergies ?? '')
      setMedicalNotes(user.medicalNotes ?? '')
    }
  }, [user])

  const deriveAgeGroup = (ageStr: string): UserProfile['ageGroup'] => {
    const n = Number(ageStr)
    if (Number.isFinite(n) && n > 0) {
      if (n < 18) return 'under-18'
      if (n >= 65) return 'older-adult'
    }
    return 'adult'
  }

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const parsedAge = age.trim() ? Number(age.trim()) : null
      if (
        mode === 'register' &&
        parsedAge !== null &&
        (!Number.isFinite(parsedAge) || parsedAge < 1 || parsedAge > 120)
      ) {
        setError('Please enter a valid age between 1 and 120.')
        setSubmitting(false)
        return
      }

      const res =
        mode === 'login'
          ? await login(email, password)
          : await register({
              name,
              email,
              password,
              age: parsedAge,
              gender,
              ageGroup: deriveAgeGroup(age),
              preferredLanguage,
              existingConditions,
              allergies,
              medicalNotes,
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
      const parsedAge = age.trim() ? Number(age.trim()) : null
      if (
        parsedAge !== null &&
        (!Number.isFinite(parsedAge) || parsedAge < 1 || parsedAge > 120)
      ) {
        setError('Please enter a valid age between 1 and 120.')
        setSubmitting(false)
        return
      }
      const res = await updateProfile({
        name: name || user?.name || '',
        age: parsedAge,
        gender,
        ageGroup: deriveAgeGroup(age),
        preferredLanguage,
        existingConditions,
        allergies,
        medicalNotes,
      })
      if (!res.ok) {
        setError(res.error ?? 'Could not save profile.')
      } else {
        setSavedNotice('Health profile updated securely.')
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onOpenHistory}>
                  Health Dashboard
                </Button>
                {onStartSymptomCheck ? (
                  <Button variant="forest" size="sm" onClick={onStartSymptomCheck}>
                    Step 2: Check Symptoms →
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          {!dbConfigured ? (
            <div className="rounded-2xl border border-coral/35 bg-coral-soft/60 p-5 text-sm text-charcoal">
              <p className="font-semibold">Cloud storage connection needed</p>
              <p className="mt-1 text-slate">
                User accounts require cloud storage configured in Vercel. You can
                still run symptom checks, ML pattern analysis, PDF downloads, and
                nearby facility search without signing in.
              </p>
            </div>
          ) : null}

          {user ? (
            <div className="rounded-2xl border border-hairline bg-paper p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-5">
                <div>
                  <Badge tone="forest" dotColor="#0F52BA">
                    Step 1 · Health Profile
                  </Badge>
                  <h1 className="mt-2 font-display text-2xl font-bold text-charcoal sm:text-3xl">
                    {user.name}
                  </h1>
                  <p className="text-sm text-stone">{user.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void logout()}>
                  Sign out
                </Button>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="profile-name"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone"
                    >
                      Full name
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-age"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone"
                    >
                      Age (years)
                    </label>
                    <input
                      id="profile-age"
                      type="number"
                      min={1}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 28"
                      className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-gender"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone"
                    >
                      Gender
                    </label>
                    <select
                      id="profile-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                    >
                      <option value="prefer-not-to-say">Prefer not to say</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="profile-conditions"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone"
                    >
                      Existing medical conditions
                    </label>
                    <input
                      id="profile-conditions"
                      type="text"
                      value={existingConditions}
                      onChange={(e) => setExistingConditions(e.target.value)}
                      placeholder="e.g. Asthma, Hypertension, or None"
                      className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-allergies"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone"
                    >
                      Known allergies
                    </label>
                    <input
                      id="profile-allergies"
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, Dust, or None"
                      className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
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

                  <div>
                    <label
                      htmlFor="profile-notes"
                      className="block text-xs font-semibold uppercase tracking-wider text-stone"
                    >
                      Relevant medical history
                    </label>
                    <input
                      id="profile-notes"
                      type="text"
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      placeholder="Past surgeries, ongoing meds, etc."
                      className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                    />
                  </div>
                </div>

                {error ? (
                  <p role="alert" className="text-sm font-medium text-urgent">
                    {error}
                  </p>
                ) : null}
                {savedNotice ? (
                  <p className="text-sm font-medium text-coral">{savedNotice}</p>
                ) : null}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button type="submit" variant="forest" size="md" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save health profile'}
                  </Button>
                  <Button type="button" variant="outline" size="md" onClick={onOpenHistory}>
                    Open Health Dashboard
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-hairline bg-paper p-6 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-2">
                <Badge tone="forest" dotColor="#0F52BA">
                  Step 1 · Patient Onboarding
                </Badge>
                <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
                  {mode === 'login'
                    ? 'Sign in to VITALORA'
                    : 'Create your VITALORA health profile'}
                </h1>
                <p className="text-sm text-slate">
                  Save your health profile, track symptom checks, and keep
                  personalized guidance in one secure dashboard.
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
                  <div className="grid gap-4 sm:grid-cols-3">
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
                        className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="auth-age"
                        className="block text-xs font-semibold uppercase tracking-wider text-stone"
                      >
                        Age
                      </label>
                      <input
                        id="auth-age"
                        type="number"
                        min={1}
                        max={120}
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 26"
                        className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="auth-gender"
                        className="block text-xs font-semibold uppercase tracking-wider text-stone"
                      >
                        Gender
                      </label>
                      <select
                        id="auth-gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                      >
                        <option value="prefer-not-to-say">Prefer not to say</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
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
                      className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
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
                      className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                    />
                  </div>
                </div>

                {mode === 'register' ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="reg-conditions"
                          className="block text-xs font-semibold uppercase tracking-wider text-stone"
                        >
                          Existing conditions (optional)
                        </label>
                        <input
                          id="reg-conditions"
                          type="text"
                          value={existingConditions}
                          onChange={(e) => setExistingConditions(e.target.value)}
                          placeholder="e.g. Asthma, Thyroid, or None"
                          className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="reg-allergies"
                          className="block text-xs font-semibold uppercase tracking-wider text-stone"
                        >
                          Allergies (optional)
                        </label>
                        <input
                          id="reg-allergies"
                          type="text"
                          value={allergies}
                          onChange={(e) => setAllergies(e.target.value)}
                          placeholder="e.g. Penicillin, Dust, or None"
                          className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                        />
                      </div>
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
                  </>
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
                      : 'Create health profile'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
