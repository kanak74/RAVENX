import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  PhoneUrgentIcon,
  ShieldAlertIcon,
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

const SAFETY_BOUNDARIES = [
  {
    code: '01',
    title: 'Informational guidance, not a diagnosis',
    detail:
      'VITALORA highlights symptom patterns and general precautions. It never diagnoses diseases or prescribes medication.',
  },
  {
    code: '02',
    title: 'Deterministic emergency detection',
    detail:
      'Urgent symptoms like severe chest pain, breathing trouble, or stroke signs immediately interrupt the flow with 112 guidance.',
  },
  {
    code: '03',
    title: 'Transparent confidence & real data',
    detail:
      'ML confidence bars show statistical pattern similarity only, and nearby facilities come live from OpenStreetMap.',
  },
]

type ActiveView =
  | 'landing'
  | 'check-in'
  | 'assistant'
  | 'facilities'
  | 'auth'
  | 'history'

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

  // Protected Auth Gate: unauthenticated visitors always land on Welcome -> Sign In / Sign Up
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
    view: 'assistant' | 'facilities' | 'auth' | 'history',
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
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: scrollBehavior })
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
                <Button
                  variant="forest"
                  size="sm"
                  onClick={() => startSymptomCheck()}
                >
                  Start full symptom check
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
                <Button
                  variant="forest"
                  size="sm"
                  onClick={() => startSymptomCheck()}
                >
                  Start full symptom check
                </Button>
              </div>
              <NearbyFacilities />
            </div>
          </Container>
        </Section>
      ) : (
        <>
          {/* 1. CLEAN MEDICAL SAAS HERO */}
          <Section id="top" tone="paper" className="py-12 sm:py-16">
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-7">
                  <Badge tone="forest" dotColor="#0F52BA">
                    AI-Powered Personal Health Assistant
                  </Badge>

                  <h1 className="font-display text-3xl font-bold tracking-tight text-charcoal sm:text-5xl">
                    Understand your symptoms.{' '}
                    <span className="text-forest">Know your next step.</span>
                  </h1>

                  <p className="max-w-xl text-base leading-relaxed text-slate sm:text-lg">
                    A structured 6-step health platform combining deterministic
                    emergency screening, Python ML symptom-pattern analysis,
                    bilingual AI guidance (English &amp; हिन्दी), and verified
                    nearby care.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Button
                      variant="forest"
                      size="lg"
                      onClick={() => startSymptomCheck()}
                      rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                    >
                      Check my symptoms
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => openStandaloneView(user ? 'history' : 'auth')}
                    >
                      {user ? 'Open Health Dashboard' : 'Create Health Profile'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => openStandaloneView('assistant')}
                      leftIcon={<SparkleIcon className="h-4 w-4" />}
                    >
                      AI Assistant
                    </Button>
                  </div>
                </div>

                {/* Right: Clinical Platform Quick-Access Card */}
                <div className="rounded-2xl border border-hairline bg-ivory p-6 shadow-xs lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-hairline pb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                      Clinical Safety First
                    </span>
                    <span className="rounded-full bg-sage-mist px-2.5 py-0.5 text-xs font-semibold text-coral">
                      EN / हिन्दी
                    </span>
                  </div>

                  <ul className="space-y-3 text-sm text-slate">
                    <li className="flex items-start gap-2.5">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                      <span>
                        <strong>Real Python ML model</strong> trained on 20
                        primary-care conditions with symptom influence weights.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                      <span>
                        <strong>Instant red-flag checks</strong> interrupt
                        normal results when 112 emergency signs appear.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                      <span>
                        <strong>PDF health reports</strong> &amp; live
                        OpenStreetMap nearby hospitals and clinics.
                      </span>
                    </li>
                  </ul>

                  <div className="flex items-center justify-between rounded-xl border border-urgent/25 bg-urgent-soft px-4 py-3 text-xs text-charcoal">
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
                </div>
              </div>
            </Container>
          </Section>

          {/* 2. SIX-STEP CONTINUOUS WORKFLOW */}
          <Section id="how-it-works" tone="ivory" className="py-12 sm:py-16">
            <Container>
              <div className="max-w-2xl space-y-2 mb-8">
                <Badge tone="coral" dotColor="#0D9488">
                  How VITALORA Works
                </Badge>
                <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
                  One connected 6-step health journey
                </h2>
                <p className="text-sm text-slate sm:text-base">
                  Move between onboarding, symptom check-in, ML analysis, AI
                  precautions, and nearby care without losing your information.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SIX_STAGE_WORKFLOW.map((item) => (
                  <div
                    key={item.step}
                    className="rounded-2xl border border-hairline bg-paper p-5 shadow-xs space-y-2"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-sand text-xs font-bold text-forest">
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

          {/* 3. INTERACTIVE BODY MAP QUICK-START */}
          <Section id="body-atlas" tone="paper" className="py-12 sm:py-16">
            <Container>
              <BodyRegionExplorer onStartCheckWithSymptom={startSymptomCheck} />
            </Container>
          </Section>

          {/* 4. MEDICAL SAFETY & TRANSPARENCY BOUNDARIES */}
          <Section id="safety" tone="ivory" className="py-12 sm:py-16">
            <Container>
              <div className="max-w-2xl space-y-2 mb-8">
                <Badge tone="urgent">Medical Safety</Badge>
                <h2 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
                  Built with strict clinical boundaries
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {SAFETY_BOUNDARIES.map((b) => (
                  <div
                    key={b.code}
                    className="rounded-2xl border border-hairline bg-paper p-5 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-forest">
                      <ShieldAlertIcon className="h-4 w-4 text-coral" />
                      <span>{b.code}</span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-charcoal">
                      {b.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate">
                      {b.detail}
                    </p>
                  </div>
                ))}
              </div>
            </Container>
          </Section>
        </>
      )}
    </PageLayout>
  )
}
