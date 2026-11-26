import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  CheckCircleIcon,
  ShieldAlertIcon,
} from '../../components/illustrations/Icons'
import { VitaloraLogoMark } from '../../components/illustrations/WarmSpotShapes'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth } from './AuthContext'

export type AuthGateMode = 'welcome' | 'login' | 'register' | 'forgot'

export interface AuthWelcomePageProps {
  onLoginSuccess: () => void
  onRegisterSuccess: () => void
}

/**
 * First-screen healthcare authentication gateway for VITALORA.
 * Handles Welcome -> Sign In / Create Account -> Post-auth redirects.
 */
export function AuthWelcomePage({
  onLoginSuccess,
  onRegisterSuccess,
}: AuthWelcomePageProps) {
  const { login, register, dbConfigured } = useAuth()
  const prefersReduced = useReducedMotion()

  const [mode, setMode] = useState<AuthGateMode>('welcome')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const resetFormErrors = () => {
    setError('')
  }

  const switchMode = (next: AuthGateMode) => {
    setMode(next)
    setError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    resetFormErrors()

    const cleanEmail = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setSubmitting(true)
    try {
      const res = await login(cleanEmail, password)
      if (!res.ok) {
        setError(res.error ?? 'Invalid email or password.')
        return
      }
      onLoginSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    resetFormErrors()

    const cleanName = name.trim()
    const cleanEmail = email.trim()

    if (cleanName.length < 2) {
      setError('Please enter your full name (at least 2 characters).')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter carefully.')
      return
    }

    setSubmitting(true)
    try {
      const res = await register({
        name: cleanName,
        email: cleanEmail,
        password,
        ageGroup: 'adult',
        preferredLanguage: 'en',
      })
      if (!res.ok) {
        setError(res.error ?? 'Could not create your account.')
        return
      }
      onRegisterSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-ivory text-charcoal">
      {/* Top Minimal Header */}
      <header className="border-b border-hairline bg-paper/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <VitaloraLogoMark className="h-9 w-9" />
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-charcoal">
                VITALORA
              </span>
              <span className="ml-2.5 hidden border-l border-hairline-strong pl-2.5 text-xs font-medium text-stone sm:inline-block">
                Personal Health Assistant
              </span>
            </div>
          </div>
          <span className="rounded-full border border-urgent/25 bg-urgent-soft px-3 py-1 text-xs font-semibold text-urgent">
            Emergency (India): Call 112
          </span>
        </div>
      </header>

      {/* Main Split Auth Layout */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10 sm:px-6">
        <div className="grid w-full items-center gap-10 lg:grid-cols-12">
          {/* Left Healthcare Brand & Trust Column */}
          <div className="space-y-6 lg:col-span-6">
            <Badge tone="forest" dotColor="#0F52BA">
              Secure Patient Access
            </Badge>

            <h1 className="font-display text-3xl font-bold tracking-tight text-charcoal sm:text-5xl">
              Welcome to <span className="text-forest">VITALORA</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate sm:text-lg">
              Your AI-powered personal health assistant. Understand your
              symptoms, get health insights and take informed next steps.
            </p>

            {/* Subtle Medical SaaS Illustration Card */}
            <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand text-forest">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M3 12h4l3-7 4 14 3-7h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    6-Step Clinical Guidance Workflow
                  </p>
                  <p className="text-xs text-stone">
                    Health Profile · Symptom Check · ML Pattern Analysis · Care Guidance
                  </p>
                </div>
              </div>

              <ul className="grid gap-2 pt-1 text-xs text-slate sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-coral" />
                  <span>Encrypted session &amp; private health history</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-coral" />
                  <span>Python ML symptom-pattern insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-coral" />
                  <span>English &amp; Hindi AI health guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-coral" />
                  <span>Verified nearby hospitals &amp; PDF reports</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Interactive Welcome / Sign In / Sign Up Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-hairline bg-paper p-6 shadow-sm sm:p-8">
              {!dbConfigured ? (
                <div className="mb-5 rounded-xl border border-coral/35 bg-coral-soft/60 p-3.5 text-xs text-charcoal">
                  Cloud authentication storage is not configured in this environment.
                </div>
              ) : null}

              <AnimatePresence mode="wait">
                {mode === 'welcome' ? (
                  <motion.div
                    key="welcome"
                    initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h2 className="font-display text-2xl font-bold text-charcoal">
                        Get started with your health account
                      </h2>
                      <p className="text-sm text-slate">
                        Sign in to access your personal dashboard and history, or
                        create a new account to set up your health profile.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Button
                        variant="forest"
                        size="lg"
                        fullWidth
                        onClick={() => switchMode('login')}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        onClick={() => switchMode('register')}
                      >
                        Create Account
                      </Button>
                    </div>

                    <p className="flex items-start gap-2 rounded-xl border border-hairline bg-ivory p-3.5 text-xs text-slate">
                      <ShieldAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                      <span>
                        VITALORA provides informational health guidance and does
                        not replace a qualified doctor or emergency care.
                      </span>
                    </p>
                  </motion.div>
                ) : mode === 'login' ? (
                  <motion.div
                    key="login"
                    initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-2xl font-bold text-charcoal">
                          Sign In
                        </h2>
                        <p className="mt-1 text-xs text-stone">
                          Access your VITALORA dashboard and health history.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => switchMode('welcome')}
                        className="cursor-pointer text-xs font-semibold text-stone hover:text-charcoal"
                      >
                        ← Back
                      </button>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                      <div>
                        <label
                          htmlFor="login-email"
                          className="block text-xs font-semibold uppercase tracking-wider text-stone"
                        >
                          Email Address
                        </label>
                        <input
                          id="login-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="login-password"
                            className="block text-xs font-semibold uppercase tracking-wider text-stone"
                          >
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => switchMode('forgot')}
                            className="cursor-pointer text-xs font-semibold text-forest hover:underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative mt-1.5">
                          <input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 pr-16 text-sm text-charcoal focus:border-forest focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xs font-semibold text-forest hover:underline"
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      {error ? (
                        <p role="alert" className="text-sm font-medium text-urgent">
                          {error}
                        </p>
                      ) : null}

                      <Button
                        type="submit"
                        variant="forest"
                        size="lg"
                        fullWidth
                        disabled={submitting}
                      >
                        {submitting ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>

                    <p className="text-center text-sm text-slate">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="cursor-pointer font-semibold text-forest hover:underline"
                      >
                        Sign Up
                      </button>
                    </p>
                  </motion.div>
                ) : mode === 'register' ? (
                  <motion.div
                    key="register"
                    initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display text-2xl font-bold text-charcoal">
                          Create Account
                        </h2>
                        <p className="mt-1 text-xs text-stone">
                          Step 1 of onboarding — next you&apos;ll complete your health profile.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => switchMode('welcome')}
                        className="cursor-pointer text-xs font-semibold text-stone hover:text-charcoal"
                      >
                        ← Back
                      </button>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                      <div>
                        <label
                          htmlFor="signup-name"
                          className="block text-xs font-semibold uppercase tracking-wider text-stone"
                        >
                          Full Name
                        </label>
                        <input
                          id="signup-name"
                          type="text"
                          required
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Kanak Sharma"
                          className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="signup-email"
                          className="block text-xs font-semibold uppercase tracking-wider text-stone"
                        >
                          Email Address
                        </label>
                        <input
                          id="signup-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="mt-1.5 w-full rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 text-sm text-charcoal focus:border-forest focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="signup-password"
                          className="block text-xs font-semibold uppercase tracking-wider text-stone"
                        >
                          Password (min 8 characters)
                        </label>
                        <div className="relative mt-1.5">
                          <input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            className="w-full rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 pr-16 text-sm text-charcoal focus:border-forest focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xs font-semibold text-forest hover:underline"
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="signup-confirm-password"
                          className="block text-xs font-semibold uppercase tracking-wider text-stone"
                        >
                          Confirm Password
                        </label>
                        <div className="relative mt-1.5">
                          <input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            className="w-full rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 pr-16 text-sm text-charcoal focus:border-forest focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xs font-semibold text-forest hover:underline"
                          >
                            {showConfirmPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      {error ? (
                        <p role="alert" className="text-sm font-medium text-urgent">
                          {error}
                        </p>
                      ) : null}

                      <Button
                        type="submit"
                        variant="forest"
                        size="lg"
                        fullWidth
                        disabled={submitting}
                      >
                        {submitting ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>

                    <p className="text-center text-sm text-slate">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="cursor-pointer font-semibold text-forest hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="forgot"
                    initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4"
                  >
                    <h2 className="font-display text-xl font-bold text-charcoal">
                      Password Recovery
                    </h2>
                    <p className="text-sm leading-relaxed text-slate">
                      Automated email password reset is not enabled on this
                      deployment yet. If you cannot recall your password, you
                      can create a new VITALORA account with another email
                      address.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Button
                        variant="forest"
                        size="md"
                        onClick={() => switchMode('login')}
                      >
                        Back to Sign In
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => switchMode('register')}
                      >
                        Create Account
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-hairline bg-paper py-4 text-center text-xs text-stone">
        VITALORA — Understand your symptoms. Know your next step. · Informational health guidance only.
      </footer>
    </div>
  )
}
