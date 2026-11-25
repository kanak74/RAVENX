import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockNoticeIcon,
  HeartIcon,
  PhoneUrgentIcon,
  SunIcon,
} from '../components/illustrations/Icons'
import {
  BodyAwarenessIllustration,
  StoryStepIllustration,
} from '../components/illustrations/LandingIllustrations'
import { HeroEditorialVisual } from '../components/illustrations/WarmSpotShapes'
import { Container } from '../components/layout/Container'
import { PageLayout } from '../components/layout/PageLayout'
import { Section } from '../components/layout/Section'
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from '../components/motion/MotionPrimitives'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { SymptomCheckFlow } from '../features/symptom-check/SymptomCheckFlow'
import { vitaloraMotion } from '../styles/theme'

interface StoryStep {
  step: 1 | 2 | 3
  title: string
  description: string
  badgeLabel: string
}

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

const STORY_STEPS: StoryStep[] = [
  {
    step: 1,
    badgeLabel: 'Step 01 · Select',
    title: "Tell us how you're feeling.",
    description:
      'Search in everyday words or tap common symptoms across clear categories — from headaches and fever to stomach discomfort or fatigue.',
  },
  {
    step: 2,
    badgeLabel: 'Step 02 · Clarify',
    title: 'Answer a few simple questions.',
    description:
      'Share when symptoms started, how strong they feel, and a short set of tailored follow-up questions — skipping anything optional.',
  },
  {
    step: 3,
    badgeLabel: 'Step 03 · Prepare',
    title: 'Understand your next steps.',
    description:
      'Review a calm, structured summary of what you shared alongside urgent safety checks and clear guidance on reaching professional care.',
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
    title: 'VITALORA provides informational guidance.',
    detail:
      'Everything here is designed to help you organize symptoms and understand general health guidance in plain language.',
  },
  {
    title: 'It is not a diagnostic tool.',
    detail:
      'VITALORA cannot diagnose illnesses, rule out medical conditions, or recommend prescription treatments.',
  },
  {
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

/** VITALORA redesigned editorial health-tech landing page and check-in router. */
export function HomePage() {
  const prefersReduced = useReducedMotion()
  const [activeView, setActiveView] = useState<ActiveView>(() =>
    window.location.hash === '#check-in' ? 'check-in' : 'landing',
  )

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

  const startSymptomCheck = () => {
    setActiveView('check-in')
    if (window.location.hash !== '#check-in') {
      window.history.pushState(null, '', '#check-in')
    }
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
  }

  const exitSymptomCheck = () => {
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
      onCheckSymptoms={startSymptomCheck}
      onNavigateSection={navigateToSection}
      isCheckInActive={activeView === 'check-in'}
    >
      {activeView === 'check-in' ? (
        <SymptomCheckFlow onExitCheckIn={exitSymptomCheck} />
      ) : (
        <>
          {/* 1. HERO SECTION */}
          <Section
            id="top"
            tone="ivory"
            bordered={false}
            className="pb-16 pt-10 sm:pb-24 sm:pt-16"
          >
            <Container>
              <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: vitaloraMotion.duration,
                    ease: vitaloraMotion.ease,
                  }}
                  className="space-y-6 lg:col-span-6"
                >
                  <Badge tone="forest" dotColor="#1E4D3B">
                    Guided Symptom Information · Responsible Health Care
                  </Badge>

                  <h1 className="font-display text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl lg:text-[3.2rem] lg:leading-[1.1]">
                    Understand your symptoms. Know your next step.
                  </h1>

                  <p className="max-w-xl text-base leading-relaxed text-slate sm:text-lg">
                    Built for people experiencing symptoms who are unsure what to
                    do next. VITALORA guides you through simple, everyday
                    questions to organize how you feel, flag urgent warning
                    signs early, and clarify your next step — without medical
                    jargon.
                  </p>

                  <div className="flex flex-wrap items-center gap-3.5 pt-1">
                    <Button
                      variant="coral"
                      size="lg"
                      onClick={startSymptomCheck}
                      rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                    >
                      Check my symptoms
                    </Button>
                    <Button href="#how-it-works" variant="outline" size="lg">
                      How it works
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-hairline pt-5 text-xs font-semibold text-stone sm:text-sm">
                    <span>Plain everyday language</span>
                    <span className="hidden h-1 w-1 rounded-full bg-hairline-strong sm:inline-block" />
                    <span>Rule-based 112 urgent alerts</span>
                    <span className="hidden h-1 w-1 rounded-full bg-hairline-strong sm:inline-block" />
                    <span>No sign-up required</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.1,
                    ease: vitaloraMotion.ease,
                  }}
                  className="lg:col-span-6"
                >
                  <HeroEditorialVisual />
                </motion.div>
              </div>
            </Container>
          </Section>

          {/* VALUE PILLARS STRIP */}
          <div className="border-y border-hairline bg-paper py-10 sm:py-12">
            <Container>
              <StaggerGroup className="grid gap-8 md:grid-cols-3 md:gap-10">
                {VALUE_PILLARS.map((pillar) => (
                  <StaggerItem
                    key={pillar.number}
                    className="space-y-2 border-l-2 border-hairline pl-5"
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

          {/* 2. HOW IT WORKS */}
          <Section id="how-it-works" tone="sand" bordered={false}>
            <Container>
              <Reveal className="max-w-2xl">
                <Badge tone="coral" dotColor="#C4533B">
                  How it works
                </Badge>
                <h2 className="mt-4 font-display text-3xl font-semibold text-charcoal sm:text-4xl">
                  A calm, guided flow from uncertainty to clarity
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate sm:text-lg">
                  Three unhurried steps built so anyone feeling tired, worried,
                  or unwell can move forward easily.
                </p>
              </Reveal>

              <div className="mt-14 space-y-14 sm:space-y-20">
                {STORY_STEPS.map((item, idx) => {
                  const isReversed = idx % 2 === 1
                  return (
                    <Reveal key={item.step} delay={0.05}>
                      <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
                        <div
                          className={`lg:col-span-6 ${
                            isReversed ? 'lg:order-2' : 'lg:order-1'
                          }`}
                        >
                          <StoryStepIllustration step={item.step} />
                        </div>

                        <div
                          className={`space-y-3.5 lg:col-span-6 ${
                            isReversed ? 'lg:order-1' : 'lg:order-2'
                          }`}
                        >
                          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-forest">
                            {item.badgeLabel}
                          </span>
                          <h3 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">
                            {item.title}
                          </h3>
                          <p className="max-w-lg text-base leading-relaxed text-slate sm:text-lg">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  )
                })}
              </div>
            </Container>
          </Section>

          {/* 3. HEALTH AWARENESS */}
          <Section id="health-awareness" tone="ivory">
            <Container>
              <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
                <Reveal className="lg:col-span-5">
                  <BodyAwarenessIllustration />
                </Reveal>

                <div className="space-y-6 lg:col-span-7">
                  <Reveal>
                    <Badge tone="forest" dotColor="#1E4D3B">
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

          {/* 4. SAFETY & CLINICAL BOUNDARIES */}
          <Section id="safety" tone="sage">
            <Container>
              <Reveal className="max-w-2xl">
                <Badge tone="urgent" dotColor="#B83A32">
                  Safety & responsibility
                </Badge>
                <h2 className="mt-4 font-display text-3xl font-semibold text-charcoal sm:text-4xl">
                  Responsible health information with clear boundaries
                </h2>
              </Reveal>

              <div className="mt-10 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
                <StaggerGroup className="space-y-4 lg:col-span-6">
                  {SAFETY_BOUNDARIES.map((item) => (
                    <StaggerItem
                      key={item.title}
                      className="flex items-start gap-3.5 rounded-2xl border border-hairline bg-paper p-5"
                    >
                      <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                      <div>
                        <h3 className="font-display text-lg font-semibold text-charcoal">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate sm:text-base">
                          {item.detail}
                        </p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>

                <Reveal delay={0.08} className="lg:col-span-6">
                  <div className="rounded-2xl border border-urgent/35 border-l-4 border-l-urgent bg-paper p-6 shadow-[0_12px_32px_-14px_rgba(184,58,50,0.16)] sm:p-8">
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

          {/* 5. FINAL CTA */}
          <Section id="get-started" tone="peach">
            <Container size="narrow">
              <Reveal>
                <div className="rounded-3xl border border-hairline bg-paper px-6 py-12 text-center shadow-[0_18px_48px_-16px_rgba(30,36,33,0.08)] sm:px-14 sm:py-16">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-soft text-coral">
                    <HeartIcon className="h-6 w-6" />
                  </div>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-forest">
                    Understand your symptoms. Know your next step.
                  </p>

                  <h2 className="mt-3 font-display text-3xl font-semibold text-charcoal sm:text-4xl">
                    Start a calm symptom check-in whenever you&apos;re ready
                  </h2>

                  <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-slate">
                    Answer a few plain-language questions at your own pace,
                    review everything clearly, and keep emergency guidance right
                    at hand.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                    <Button
                      variant="coral"
                      size="lg"
                      onClick={startSymptomCheck}
                      rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                    >
                      Check my symptoms
                    </Button>
                    <Button href="#how-it-works" variant="outline" size="lg">
                      How it works
                    </Button>
                  </div>
                </div>
              </Reveal>
            </Container>
          </Section>
        </>
      )}
    </PageLayout>
  )
}
