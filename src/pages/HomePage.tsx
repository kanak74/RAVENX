import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockNoticeIcon,
  PhoneUrgentIcon,
  SunIcon,
} from '../components/illustrations/Icons'
import { BodyAwarenessIllustration } from '../components/illustrations/LandingIllustrations'
import { HeroAnatomicalVisual } from '../components/illustrations/WarmSpotShapes'
import { BodyRegionExplorer } from '../components/landing/BodyRegionExplorer'
import { StickyAnatomyStory } from '../components/landing/StickyAnatomyStory'
import { Container } from '../components/layout/Container'
import { PageLayout } from '../components/layout/PageLayout'
import { Section } from '../components/layout/Section'
import {
  CursorHighlightCard,
  Reveal,
  ScrollColorCanvas,
  StaggerGroup,
  StaggerItem,
} from '../components/motion/MotionPrimitives'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { SymptomCheckFlow } from '../features/symptom-check/SymptomCheckFlow'
import { vitaloraMotion } from '../styles/theme'

const VALUE_PILLARS = [
  {
    number: '01',
    title: 'Understand symptoms clearly',
    body: 'Designed for people feeling unwell who want straightforward explanations instead of confusing medical jargon.',
  },
  {
    number: '02',
    title: 'Spot warning signs early',
    body: 'Rule-based urgent symptom checks highlight when immediate medical help is safest, before waiting.',
  },
  {
    number: '03',
    title: 'Know your practical next step',
    body: 'Organize timing, severity, and context so you know whether rest makes sense or what to share with a doctor.',
  },
]

const AWARENESS_POINTS = [
  {
    icon: ClockNoticeIcon,
    title: 'Notice subtle changes early',
    description:
      'Shifts in energy, warmth, discomfort, or sleep are early signals worth noticing before symptoms feel overwhelming.',
  },
  {
    icon: SunIcon,
    title: 'Capture simple context while it is fresh',
    description:
      'Remembering when a symptom began and whether it is easing or worsening helps turn worry into useful clarity.',
  },
  {
    icon: CheckCircleIcon,
    title: 'Share clearly with a doctor or family member',
    description:
      'Having your symptoms and timeline organized in plain English makes every healthcare conversation easier.',
  },
]

const SAFETY_BOUNDARIES = [
  {
    code: '01',
    title: 'VITALORA provides informational guidance.',
    detail:
      'Everything here is designed to help you organize symptoms and understand general health guidance in plain language.',
  },
  {
    code: '02',
    title: 'It is not a diagnostic tool.',
    detail:
      'VITALORA cannot diagnose illnesses, rule out medical conditions, or recommend prescription treatments.',
  },
  {
    code: '03',
    title: 'It does not replace professional medical advice.',
    detail:
      'Always consult a licensed physician, nurse, or qualified healthcare provider for personal medical care.',
  },
]

const EMERGENCY_SIGNS = [
  'Trouble breathing or shortness of breath at rest',
  'Severe chest pain, tightness, or pressure',
  'Fainting, sudden weakness, or new confusion',
  'Severe allergic swelling of the face, lips, or throat',
]

type ActiveView = 'landing' | 'check-in'

/** VITALORA editorial health-tech landing page, anatomical scroll narrative, and check-in router. */
export function HomePage() {
  const prefersReduced = useReducedMotion()
  const [activeView, setActiveView] = useState<ActiveView>(() =>
    window.location.hash === '#check-in' ? 'check-in' : 'landing',
  )
  const [preselectedSymptoms, setPreselectedSymptoms] = useState<string[]>([])

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === '#check-in') {
        setActiveView('check-in')
      } else {
        setActiveView('landing')
      }
    }

    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  const startSymptomCheck = (symptomId?: string) => {
    setPreselectedSymptoms(symptomId ? [symptomId] : [])
    setActiveView('check-in')
    if (window.location.hash !== '#check-in') {
      window.history.pushState(null, '', '#check-in')
    }
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
  }

  const exitSymptomCheck = () => {
    setPreselectedSymptoms([])
    setActiveView('landing')
    if (window.location.hash === '#check-in') {
      window.history.pushState(null, '', '#top')
    }
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
      isCheckInActive={activeView === 'check-in'}
    >
      {activeView === 'check-in' ? (
        <SymptomCheckFlow
          key={preselectedSymptoms.join(',') || 'blank'}
          initialSymptomIds={preselectedSymptoms}
          onExitCheckIn={exitSymptomCheck}
        />
      ) : (
        <ScrollColorCanvas>
          {/* 1. ARCHITECTURAL EDITORIAL HERO */}
          <Section
            id="top"
            tone="transparent"
            bordered={false}
            className="pb-10 pt-6 sm:pb-14 sm:pt-10"
          >
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: vitaloraMotion.duration,
                    ease: vitaloraMotion.ease,
                  }}
                  className="space-y-6 lg:col-span-6"
                >
                  <div className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-forest">
                    <span
                      className="h-2 w-2 rounded-full bg-coral"
                      aria-hidden="true"
                    />
                    <span>Guided Symptom Intelligence · Human-First Care</span>
                  </div>

                  <h1 className="font-display text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
                    Understand your symptoms.{' '}
                    <span className="font-normal italic text-forest">
                      Know your next step.
                    </span>
                  </h1>

                  <p className="max-w-xl text-base leading-relaxed text-slate sm:text-lg">
                    A calm, guided health companion built for uncertain moments.
                    Locate what feels off across the body, organize timing and
                    severity in everyday words, and catch urgent warning signs
                    early.
                  </p>

                  <div className="flex flex-wrap items-center gap-3.5 pt-1">
                    <Button
                      variant="forest"
                      size="lg"
                      onClick={() => startSymptomCheck()}
                      rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                    >
                      Check my symptoms
                    </Button>
                    <Button href="#body-atlas" variant="outline" size="lg">
                      Explore body map
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline pt-5 text-xs font-semibold text-stone sm:text-sm">
                    <span>Anatomical guidance</span>
                    <span className="hidden h-1 w-1 rounded-full bg-hairline-strong sm:inline-block" />
                    <span>Rule-based 112 red-flag alerts</span>
                    <span className="hidden h-1 w-1 rounded-full bg-hairline-strong sm:inline-block" />
                    <span>No sign-up required</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.65,
                    delay: 0.08,
                    ease: vitaloraMotion.ease,
                  }}
                  className="lg:col-span-6"
                >
                  <HeroAnatomicalVisual />
                </motion.div>
              </div>

              {/* Architectural Scroll-Down Cue */}
              <div className="mt-10 flex justify-center sm:mt-14">
                <a
                  href="#body-atlas"
                  className="group inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"
                >
                  <span>Scroll to explore the body map</span>
                  <motion.span
                    animate={prefersReduced ? undefined : { y: [0, 4, 0] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-hairline-strong bg-paper text-charcoal group-hover:border-forest group-hover:text-forest"
                    aria-hidden="true"
                  >
                    ↓
                  </motion.span>
                </a>
              </div>
            </Container>
          </Section>

          {/* VALUE PILLARS EDITORIAL STRIP */}
          <div className="border-y border-hairline bg-paper/75 py-10 sm:py-12">
            <Container>
              <StaggerGroup className="grid gap-8 md:grid-cols-3 md:gap-10">
                {VALUE_PILLARS.map((pillar) => (
                  <StaggerItem
                    key={pillar.number}
                    className="space-y-2 border-l-2 border-forest/25 pl-5"
                  >
                    <span className="text-xs font-semibold tracking-wider text-coral">
                      {pillar.number}
                    </span>
                    <h2 className="font-display text-xl font-semibold text-charcoal">
                      {pillar.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-slate">
                      {pillar.body}
                    </p>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </Container>
          </div>

          {/* 2. INTERACTIVE HUMAN BODY EXPLORER */}
          <Section id="body-atlas" tone="transparent" bordered={false}>
            <Container>
              <BodyRegionExplorer
                onStartCheckWithSymptom={(symptomId) =>
                  startSymptomCheck(symptomId)
                }
              />
            </Container>
          </Section>

          {/* 3. STICKY SCROLL-STORYTELLING SECTION (HOW IT WORKS) */}
          <Section id="how-it-works" tone="transparent">
            <Container>
              <Reveal className="max-w-2xl">
                <Badge tone="coral" dotColor="#C25941">
                  How it works
                </Badge>
                <h2 className="mt-4 font-display text-3xl font-semibold text-charcoal sm:text-4xl">
                  Watch your check-in unfold across the body as you scroll
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate sm:text-lg">
                  Four unhurried stages guide you from pointing out discomfort
                  to organizing clear context for care.
                </p>
              </Reveal>

              <StickyAnatomyStory onStartCheckIn={() => startSymptomCheck()} />
            </Container>
          </Section>

          {/* 4. HEALTH AWARENESS & PATTERN VISUALIZATION */}
          <Section id="health-awareness" tone="transparent">
            <Container>
              <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
                <Reveal direction="right" className="lg:col-span-5">
                  <BodyAwarenessIllustration />
                </Reveal>

                <div className="space-y-6 lg:col-span-7">
                  <Reveal direction="left">
                    <Badge tone="forest" dotColor="#174B42">
                      Why it matters
                    </Badge>
                    <h2 className="mt-4 font-display text-3xl font-semibold text-charcoal sm:text-4xl">
                      Understanding early signals helps replace guesswork with calm
                    </h2>
                    <p className="mt-3 text-base leading-relaxed text-slate sm:text-lg">
                      When something feels off, clear context makes all the
                      difference — both for your own peace of mind and for
                      anyone caring for you.
                    </p>
                  </Reveal>

                  <StaggerGroup className="divide-y divide-hairline border-y border-hairline">
                    {AWARENESS_POINTS.map((point) => {
                      const Icon = point.icon
                      return (
                        <StaggerItem
                          key={point.title}
                          className="flex items-start gap-4 py-5"
                        >
                          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hairline bg-paper text-forest">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <h3 className="font-display text-lg font-semibold text-charcoal">
                              {point.title}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-slate sm:text-base">
                              {point.description}
                            </p>
                          </div>
                        </StaggerItem>
                      )
                    })}
                  </StaggerGroup>
                </div>
              </div>
            </Container>
          </Section>

          {/* 5. SAFETY & CLINICAL BOUNDARIES */}
          <Section id="safety" tone="transparent">
            <Container>
              <Reveal className="max-w-2xl">
                <Badge tone="urgent" dotColor="#B4372E">
                  Safety & responsibility
                </Badge>
                <h2 className="mt-4 font-display text-3xl font-semibold text-charcoal sm:text-4xl">
                  Responsible health information with clear boundaries
                </h2>
              </Reveal>

              <div className="mt-10 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
                <StaggerGroup className="space-y-4 lg:col-span-6">
                  {SAFETY_BOUNDARIES.map((item) => (
                    <StaggerItem key={item.title}>
                      <CursorHighlightCard className="rounded-2xl border border-hairline bg-paper p-5">
                        <div className="flex items-start gap-4">
                          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sage-mist text-xs font-semibold text-forest">
                            {item.code}
                          </span>
                          <div>
                            <h3 className="font-display text-lg font-semibold text-charcoal">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-slate sm:text-base">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      </CursorHighlightCard>
                    </StaggerItem>
                  ))}
                </StaggerGroup>

                <Reveal direction="left" delay={0.08} className="lg:col-span-6">
                  <div className="rounded-2xl border border-urgent/35 border-l-4 border-l-urgent bg-paper p-6 shadow-[0_14px_36px_-18px_rgba(180,55,46,0.2)] sm:p-8">
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-urgent-soft text-urgent">
                        <PhoneUrgentIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-urgent">
                          Immediate care warning
                        </span>
                        <h3 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">
                          Emergency symptoms need immediate medical help
                        </h3>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-slate sm:text-base">
                      Do not wait to complete an online check-in if you or
                      someone nearby experiences serious warning signs:
                    </p>

                    <ul className="mt-4 space-y-2.5">
                      {EMERGENCY_SIGNS.map((sign) => (
                        <li
                          key={sign}
                          className="flex items-start gap-2.5 text-sm font-semibold text-charcoal sm:text-base"
                        >
                          <span
                            className="mt-2 h-2 w-2 shrink-0 rounded-full bg-urgent"
                            aria-hidden="true"
                          />
                          <span>{sign}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 rounded-xl bg-urgent-soft px-4 py-3 text-sm font-semibold text-urgent">
                      In India, call <strong>112</strong> or go to the nearest
                      hospital emergency department immediately.
                    </div>
                  </div>
                </Reveal>
              </div>
            </Container>
          </Section>

          {/* 6. ARCHITECTURAL FINAL CTA */}
          <Section id="get-started" tone="transparent">
            <Container size="narrow">
              <Reveal>
                <div className="relative overflow-hidden rounded-[2rem] border border-hairline bg-charcoal px-6 py-12 text-center text-ivory shadow-[0_28px_68px_-28px_rgba(24,32,30,0.4)] sm:px-14 sm:py-16">
                  {/* Subtle botanical calibration rings on charcoal surface */}
                  <svg
                    viewBox="0 0 600 320"
                    fill="none"
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
                  >
                    <circle
                      cx="300"
                      cy="160"
                      r="138"
                      stroke="#5B8577"
                      strokeDasharray="4 7"
                    />
                    <circle cx="300" cy="160" r="210" stroke="#D6735C" strokeOpacity="0.45" />
                  </svg>

                  <div className="relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral-accent">
                      Understand your symptoms. Know your next step.
                    </p>

                    <h2 className="mt-4 font-display text-3xl font-semibold text-ivory sm:text-4xl">
                      Start a calm symptom check-in whenever you&apos;re ready
                    </h2>

                    <p className="mx-auto mt-3.5 max-w-lg text-base leading-relaxed text-sand/85">
                      Answer a few plain-language questions at your own pace,
                      review everything clearly, and keep emergency guidance right
                      at hand.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                      <Button
                        variant="coral"
                        size="lg"
                        onClick={() => startSymptomCheck()}
                        rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                      >
                        Check my symptoms
                      </Button>
                      <a
                        href="#body-atlas"
                        className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-ivory/25 px-7 py-3.5 text-base font-semibold text-ivory transition-colors hover:border-ivory/50 hover:bg-ivory/10 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-coral"
                      >
                        Explore body map
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            </Container>
          </Section>
        </ScrollColorCanvas>
      )}
    </PageLayout>
  )
}
