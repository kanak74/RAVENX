import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  PhoneUrgentIcon,
  SparkleIcon,
} from '../components/illustrations/Icons'
import { BodyRegionExplorer } from '../components/landing/BodyRegionExplorer'
import { Container } from '../components/layout/Container'
import { PageLayout } from '../components/layout/PageLayout'
import { Section } from '../components/layout/Section'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useAuth } from '../features/auth/AuthContext'
import { AuthPanel } from '../features/auth/AuthPanel'
import { AuthWelcomePage } from '../features/auth/AuthWelcomePage'
import { MedicalChatbot } from '../features/chatbot/MedicalChatbot'
import { NearbyFacilities } from '../features/facilities/NearbyFacilities'
import { HealthHistoryView } from '../features/history/HealthHistoryView'
import { SymptomCheckFlow } from '../features/symptom-check/SymptomCheckFlow'
import { VoiceHealthAssistant } from '../features/voice/VoiceHealthAssistant'

const SIX_STAGE_WORKFLOW = [
  {
    step: '01',
    title: 'Health Profile',
    description: 'Create your profile with age, allergies, and medical history.',
  },
  {
    step: '02',
    title: 'Symptom Check',
    description: 'Search, select, or describe symptoms with timing and severity.',
  },
  {
    step: '03',
    title: 'AI / ML Analysis',
    description: 'Python ML model validates inputs and checks emergency safety first.',
  },
  {
    step: '04',
    title: 'Pattern Results',
    description: 'View possible conditions, confidence scores, and key symptom factors.',
  },
  {
    step: '05',
    title: 'AI Guidance',
    description: 'Ask follow-up questions in English or Hindi and get safe precautions.',
  },
  {
    step: '06',
    title: 'Doctor & Care',
    description: 'Download PDF reports and locate verified nearby hospitals & clinics.',
  },
]

type ActiveView =
  | 'landing'
  | 'check-in'
  | 'assistant'
  | 'facilities'
  | 'auth'
  | 'history'
  | 'voice'

/** VITALORA modern medical-tech SaaS platform shell & 6-stage clinical workflow. */
export function HomePage() {
  const { user, loading } = useAuth()
  const prefersReduced = useReducedMotion()
  const [activeView, setActiveView] = useState<ActiveView>(() =>
    window.location.hash === '#check-in' ? 'check-in' : 'history',
  )
  const [preselectedSymptoms, setPreselectedSymptoms] = useState<string[]>([])

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === '#check-in') {
        setActiveView('check-in')
      } else if (window.location.hash === '#home') {
        setActiveView('landing')
      }
    }
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory text-slate">
        <p className="text-sm font-medium">Loading VITALORA...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <AuthWelcomePage
        onLoginSuccess={() => {
          setActiveView('history')
          window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
        }}
        onRegisterSuccess={() => {
          setActiveView('auth')
          window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
        }}
      />
    )
  }

  const startSymptomCheck = (symptomId?: string) => {
    setPreselectedSymptoms(symptomId ? [symptomId] : [])
    setActiveView('check-in')
    if (window.location.hash !== '#check-in') {
      window.history.pushState(null, '', '#check-in')
    }
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
  }

  const exitToLanding = () => {
    setPreselectedSymptoms([])
    setActiveView('landing')
    if (window.location.hash === '#check-in') {
      window.history.pushState(null, '', '#top')
    }
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
  }

  const openStandaloneView = (
    view: 'assistant' | 'facilities' | 'auth' | 'history' | 'voice',
  ) => {
    setActiveView(view)
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
  }

  const navigateToSection = (sectionId: string) => {
    const scrollBehavior = prefersReduced ? 'auto' : 'smooth'
    const scrollTarget = () => {
      if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: scrollBehavior })
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: scrollBehavior })
      }
    }
    if (activeView !== 'landing') {
      setActiveView('landing')
      window.history.pushState(null, '', `#${sectionId}`)
      window.setTimeout(scrollTarget, 60)
    } else {
      window.history.replaceState(null, '', `#${sectionId}`)
      scrollTarget()
    }
  }

  return (
    <PageLayout
      onCheckSymptoms={() => startSymptomCheck()}
      onNavigateSection={navigateToSection}
      onOpenView={openStandaloneView}
      isCheckInActive={activeView !== 'landing'}
    >
      {activeView === 'check-in' ? (
        <SymptomCheckFlow
          key={preselectedSymptoms.join(',') || 'blank'}
          initialSymptomIds={preselectedSymptoms}
          onExitCheckIn={exitToLanding}
          onOpenAuth={() => openStandaloneView('auth')}
        />
      ) : activeView === 'auth' ? (
        <AuthPanel
          onBack={exitToLanding}
          onOpenHistory={() => openStandaloneView('history')}
          onStartSymptomCheck={() => startSymptomCheck()}
        />
      ) : activeView === 'history' ? (
        <HealthHistoryView
          onBack={exitToLanding}
          onStartCheck={() => startSymptomCheck()}
          onOpenAuth={() => openStandaloneView('auth')}
          onOpenAssistant={() => openStandaloneView('assistant')}
          onOpenFacilities={() => openStandaloneView('facilities')}
        />
      ) : activeView === 'assistant' ? (
        <Section tone="ivory" bordered={false} className="min-h-[75vh] py-10">
          <Container size="narrow">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" size="sm" onClick={exitToLanding}>
                  ← Back to VITALORA
                </Button>
                <Button variant="forest" size="sm" onClick={() => startSymptomCheck()}>
                  Start Your Check-In
                </Button>
              </div>
              <MedicalChatbot initialLanguage={user?.preferredLanguage ?? 'en'} />
            </div>
          </Container>
        </Section>
      ) : activeView === 'facilities' ? (
        <Section tone="ivory" bordered={false} className="min-h-[75vh] py-10">
          <Container size="narrow">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" size="sm" onClick={exitToLanding}>
                  ← Back to VITALORA
                </Button>
                <Button variant="forest" size="sm" onClick={() => startSymptomCheck()}>
                  Start Your Check-In
                </Button>
              </div>
              <NearbyFacilities />
            </div>
          </Container>
        </Section>
      ) : activeView === 'voice' ? (
        <Section tone="ivory" bordered={false} className="min-h-[75vh] py-10">
          <Container size="narrow">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" size="sm" onClick={exitToLanding}>
                  ← Back to VITALORA
                </Button>
                <Button variant="forest" size="sm" onClick={() => startSymptomCheck()}>
                  Start Your Check-In
                </Button>
              </div>
              <VoiceHealthAssistant
                initialLanguage={user?.preferredLanguage ?? 'en'}
                onStartSymptomCheck={() => startSymptomCheck()}
              />
            </div>
          </Container>
        </Section>
      ) : (
        <>
          {/* ── HERO ──────────────────────────────────────────────────────── */}
          <Section id="top" tone="paper" className="relative overflow-hidden py-20 sm:py-28">
            {/* Ambient gradient */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-40 right-0 h-[560px] w-[560px] rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 65% 35%, rgba(15,82,186,0.08) 0%, rgba(13,148,136,0.06) 55%, transparent 80%)',
                filter: 'blur(80px)',
              }}
            />

            <Container>
              <div className="grid items-center gap-14 lg:grid-cols-12">
                {/* Left: Headline + CTAs */}
                <div className="space-y-8 lg:col-span-7">
                  <Badge tone="forest" dotColor="#0d9488">
                    AI-Powered Personal Health Assistant
                  </Badge>

                  <div className="space-y-5">
                    <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-charcoal sm:text-5xl lg:text-6xl">
                      Your Health.{' '}
                      <span className="text-forest">Your Signs.</span>
                      <br className="hidden sm:block" />
                      {' '}Your Next Step.
                    </h1>
                    <p className="max-w-lg text-base leading-relaxed text-slate sm:text-lg">
                      Understand what your body is telling you. Track how you feel,
                      find clarity in your symptoms, and take the next step with
                      confidence.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="forest"
                      size="lg"
                      onClick={() => startSymptomCheck()}
                      rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                    >
                      Start Your Check-In
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigateToSection('body-atlas')}
                    >
                      Explore Symptom Guide
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => openStandaloneView('assistant')}
                      leftIcon={<SparkleIcon className="h-4 w-4" />}
                    >
                      AI Assistant
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => openStandaloneView('voice')}
                    >
                      🎙️ Voice AI
                    </Button>
                  </div>

                  {/* Trust signals row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    {[
                      'Real ML model — 85% accuracy',
                      'EN / हिन्दी bilingual',
                      'Emergency 112 detection',
                    ].map((item) => (
                      <span
                        key={item}
                        className="flex items-center gap-1.5 text-xs font-medium text-stone"
                      >
                        <CheckCircleIcon className="h-3.5 w-3.5 text-coral" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Platform quick-access card */}
                <div className="lg:col-span-5">
                  <div className="rounded-3xl border border-hairline bg-ivory p-7 shadow-[0_24px_64px_-16px_rgba(15,82,186,0.12)] space-y-5">
                    <div className="flex items-center justify-between border-b border-hairline pb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-forest">
                        Clinical Safety First
                      </span>
                      <span className="rounded-full bg-sage-mist px-3 py-1 text-xs font-semibold text-coral">
                        EN / हिन्दी
                      </span>
                    </div>

                    <ul className="space-y-4 text-sm text-slate">
                      <li className="flex items-start gap-3">
                        <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                        <span>
                          <strong className="font-semibold text-charcoal">Real Python ML model</strong>{' '}
                          trained on 20 primary-care conditions with symptom influence weights.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                        <span>
                          <strong className="font-semibold text-charcoal">Instant red-flag checks</strong>{' '}
                          interrupt normal results when 112 emergency signs appear.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                        <span>
                          <strong className="font-semibold text-charcoal">PDF health reports</strong>{' '}
                          &amp; live OpenStreetMap nearby hospitals and clinics.
                        </span>
                      </li>
                    </ul>

                    <div className="flex items-center justify-between rounded-2xl border border-urgent/20 bg-urgent-soft px-4 py-3 text-xs">
                      <span className="flex items-center gap-2 font-semibold text-urgent">
                        <PhoneUrgentIcon className="h-4 w-4" />
                        Emergency in India: Call 112
                      </span>
                      <button
                        type="button"
                        onClick={() => openStandaloneView('facilities')}
                        className="cursor-pointer font-semibold text-forest hover:underline"
                      >
                        Nearby Care →
                      </button>
                    </div>

                    <Button
                      variant="forest"
                      size="md"
                      fullWidth
                      onClick={() => startSymptomCheck()}
                      rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                    >
                      Start Your Check-In
                    </Button>
                  </div>
                </div>
              </div>
            </Container>
          </Section>

          {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
          <Section id="how-it-works" tone="ivory" className="py-16 sm:py-20">
            <Container>
              <div className="max-w-2xl space-y-3 mb-10">
                <Badge tone="coral" dotColor="#0D9488">
                  How VITALORA Works
                </Badge>
                <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
                  One connected 6-step health journey
                </h2>
                <p className="text-sm leading-relaxed text-slate sm:text-base">
                  Move between onboarding, symptom check-in, ML analysis, AI
                  precautions, and nearby care without losing your information.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SIX_STAGE_WORKFLOW.map((item) => (
                  <div
                    key={item.step}
                    className="group rounded-2xl border border-hairline bg-paper p-6 shadow-xs transition-shadow hover:shadow-md space-y-3"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-sand text-xs font-bold text-forest">
                      {item.step}
                    </span>
                    <h3 className="font-display text-base font-semibold text-charcoal">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </Container>
          </Section>

          {/* ── BODY MAP ──────────────────────────────────────────────────── */}
          <Section id="body-atlas" tone="paper" className="py-16 sm:py-20">
            <Container>
              <BodyRegionExplorer onStartCheckWithSymptom={startSymptomCheck} />
            </Container>
          </Section>
        </>
      )}
    </PageLayout>
  )
}
