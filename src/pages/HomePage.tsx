import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockNoticeIcon,
  HeartIcon,
  PhoneUrgentIcon,
  SparkleIcon,
  SunIcon,
} from '../components/illustrations/Icons'
import {
  BodyAwarenessIllustration,
  StoryStepIllustration,
} from '../components/illustrations/LandingIllustrations'
import { HeroCompanionIllustration } from '../components/illustrations/WarmSpotShapes'
import { Container } from '../components/layout/Container'
import { PageLayout } from '../components/layout/PageLayout'
import { Section } from '../components/layout/Section'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { OrganicBlob } from '../components/ui/OrganicBlob'
import { SymptomCheckFlow } from '../features/symptom-check/SymptomCheckFlow'
import { vitaloraMotion } from '../styles/theme'

interface StoryStep {
  step: 1 | 2 | 3
  title: string
  description: string
  badgeBg: string
  badgeText: string
  examples?: string[]
}

const STORY_STEPS: StoryStep[] = [
  {
    step: 1,
    title: "Tell us how you're feeling.",
    description:
      'Pick what feels off using friendly choices or type it in your own everyday words — no tricky medical terms needed.',
    badgeBg: 'bg-coral text-ink border-[#E3593F]',
    badgeText: 'Step 1',
    examples: ['Headache', 'Fever', 'Sore throat', 'Tummy ache'],
  },
  {
    step: 2,
    title: 'Answer a few simple questions.',
    description:
      'VITALORA asks one short, gentle question at a time — like when it started or what helps it feel calmer — so nothing feels rushed.',
    badgeBg: 'bg-butter text-ink border-[#D4A22B]',
    badgeText: 'Step 2',
  },
  {
    step: 3,
    title: 'Understand your next steps.',
    description:
      'Get clear everyday precautions, signs to watch out for, and plain advice on whether home rest makes sense or when to see a doctor.',
    badgeBg: 'bg-green text-warm-white border-[#1F6644]',
    badgeText: 'Step 3',
  },
]

const AWARENESS_POINTS = [
  {
    icon: ClockNoticeIcon,
    iconBg: 'bg-butter-soft text-ink',
    title: 'Notice small changes early',
    description:
      'Feeling unusually tired, warm, thirsty, or achy are gentle clues your body sends before things build up.',
  },
  {
    icon: SunIcon,
    iconBg: 'bg-coral-soft text-coral-deep',
    title: 'Pay attention to simple details',
    description:
      'Noting when a symptom started and whether water, rest, or sleep helps makes it easier to spot patterns.',
  },
  {
    icon: CheckCircleIcon,
    iconBg: 'bg-green-soft text-green',
    title: 'Share clearly with someone you trust',
    description:
      'Turning worried thoughts into plain words helps parents, caregivers, and doctors support you faster.',
  },
]

const SAFETY_BOUNDARIES = [
  {
    title: 'VITALORA provides informational guidance.',
    detail:
      'Explanations and comfort tips are here to help you learn and prepare — in calm, everyday words.',
  },
  {
    title: 'It is not a diagnostic tool.',
    detail:
      'VITALORA cannot diagnose an illness, rule out serious conditions, or prescribe medicine.',
  },
  {
    title: 'It does not replace professional medical advice.',
    detail:
      'Always talk with a qualified doctor, nurse, or trusted adult when deciding on medical care.',
  },
]

const EMERGENCY_SIGNS = [
  'Trouble breathing or catching your breath',
  'Chest pain, tightness, or heavy pressure',
  'Sudden confusion, fainting, or trouble waking up',
  'Severe bleeding, sudden weakness, or fast swelling',
]

type ActiveView = 'landing' | 'check-in'

/** VITALORA main experience connecting the Stage 2 landing page and Stage 3 check-in flow. */
export function HomePage() {
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const exitSymptomCheck = () => {
    setActiveView('landing')
    if (window.location.hash === '#check-in') {
      window.history.pushState(null, '', '#top')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateToSection = (sectionId: string) => {
    const scrollTarget = () => {
      if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
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
            tone="cream"
            className="relative overflow-hidden pb-16 pt-10 sm:pb-24 sm:pt-16"
          >
            <OrganicBlob
              variant="butter"
              className="pointer-events-none absolute -left-28 -top-16 h-72 w-72 opacity-70"
            />
            <OrganicBlob
              variant="pink"
              className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 opacity-60"
            />

            <Container className="relative z-10">
              <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: vitaloraMotion.ease }}
                  className="space-y-5 lg:col-span-6"
                >
                  <Badge tone="pink" dotColor="#FF7B61">
                    VITALORA · Friendly Health Companion
                  </Badge>

                  <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-[3.35rem]">
                    Care that feels calm when you don&apos;t feel your best.
                  </h1>

                  <p className="font-display text-xl font-bold text-coral-deep sm:text-2xl">
                    Understand your symptoms. Know your next step.
                  </p>

                  <p className="max-w-xl text-lg leading-relaxed text-cocoa">
                    VITALORA helps kids, families, and adults make sense of
                    everyday symptoms in plain, reassuring words — with gentle
                    precautions and clear guidance on when to see a doctor.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Button
                      variant="coral"
                      size="lg"
                      onClick={startSymptomCheck}
                      rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                    >
                      Check my symptoms
                    </Button>
                    <Button href="#how-it-works" variant="outline" size="lg">
                      How it works
                    </Button>
                  </div>

                  <p className="inline-flex items-center gap-2 pt-1 text-sm font-bold text-taupe">
                    <SunIcon className="h-4 w-4 text-coral-deep" />
                    <span>
                      Simple everyday words · No scary charts · Informational guidance only
                    </span>
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    ease: vitaloraMotion.ease,
                    delay: 0.08,
                  }}
                  className="lg:col-span-6"
                >
                  <HeroCompanionIllustration />
                </motion.div>
              </div>
            </Container>
          </Section>

          {/* 2. HOW IT WORKS */}
          <Section id="how-it-works" tone="linen" topWave>
            <Container>
              <motion.div
                {...vitaloraMotion.fadeUp}
                className="mx-auto max-w-2xl text-center"
              >
                <Badge tone="butter" dotColor="#D4A22B">
                  How it works
                </Badge>
                <h2 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
                  Three gentle steps — no medical guesswork
                </h2>
                <p className="mt-3 text-base text-cocoa sm:text-lg">
                  Follow an easy, unhurried path built to help you feel heard
                  and know what to do next.
                </p>
              </motion.div>

              <div className="mt-14 space-y-14 sm:space-y-20">
                {STORY_STEPS.map((item, idx) => {
                  const isReversed = idx % 2 === 1
                  return (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, ease: vitaloraMotion.ease }}
                      className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12"
                    >
                      <div
                        className={`lg:col-span-6 ${
                          isReversed ? 'lg:order-2' : 'lg:order-1'
                        }`}
                      >
                        <StoryStepIllustration step={item.step} />
                      </div>

                      <div
                        className={`space-y-4 lg:col-span-6 ${
                          isReversed ? 'lg:order-1' : 'lg:order-2'
                        }`}
                      >
                        <div className="inline-flex items-center gap-3">
                          <span
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg font-extrabold ${item.badgeBg}`}
                          >
                            {item.step}
                          </span>
                          <span className="text-sm font-extrabold uppercase tracking-wider text-taupe">
                            {item.badgeText}
                          </span>
                        </div>

                        <h3 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                          {item.title}
                        </h3>

                        <p className="max-w-lg text-lg leading-relaxed text-cocoa">
                          {item.description}
                        </p>

                        {item.examples ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.examples.map((example) => (
                              <span
                                key={example}
                                className="rounded-full border-2 border-border-warm bg-warm-white px-3.5 py-1.5 text-sm font-bold text-cocoa"
                              >
                                {example}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </Container>
          </Section>

          {/* 3. HEALTH AWARENESS */}
          <Section id="health-awareness" tone="cream" topWave>
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-5">
                  <BodyAwarenessIllustration />
                </div>

                <motion.div
                  {...vitaloraMotion.fadeUp}
                  className="space-y-6 lg:col-span-7"
                >
                  <Badge tone="green" dotColor="#2C875C">
                    Health awareness
                  </Badge>

                  <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
                    Listening to your body doesn&apos;t have to feel scary
                  </h2>

                  <p className="text-base leading-relaxed text-cocoa sm:text-lg">
                    Your body gives quiet signals every day. Paying calm
                    attention to how you feel helps you take simple steps early
                    and talk more clearly with someone who can help.
                  </p>

                  <ul className="space-y-5 pt-1">
                    {AWARENESS_POINTS.map((point) => {
                      const Icon = point.icon
                      return (
                        <li key={point.title} className="flex items-start gap-4">
                          <span
                            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-border-warm ${point.iconBg}`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <h3 className="font-display text-xl font-bold text-ink">
                              {point.title}
                            </h3>
                            <p className="mt-1 text-base leading-relaxed text-cocoa">
                              {point.description}
                            </p>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </motion.div>
              </div>
            </Container>
          </Section>

          {/* 4. SAFETY */}
          <Section id="safety" tone="mint" topWave>
            <Container>
              <motion.div {...vitaloraMotion.fadeUp} className="max-w-2xl">
                <Badge tone="tomato" dotColor="#DE4436">
                  Safety first
                </Badge>
                <h2 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
                  Helpful guidance with clear, honest boundaries
                </h2>
              </motion.div>

              <div className="mt-10 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
                <motion.div
                  {...vitaloraMotion.fadeUp}
                  className="space-y-5 lg:col-span-6"
                >
                  {SAFETY_BOUNDARIES.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-3.5 rounded-3xl border-2 border-green/25 bg-warm-white p-5"
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-soft text-green">
                        <CheckCircleIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-base leading-relaxed text-cocoa">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  {...vitaloraMotion.fadeUp}
                  className="rounded-[2rem] border-2 border-tomato/55 bg-warm-white p-6 shadow-[0_8px_0_0_rgba(222,68,54,0.12)] sm:p-8 lg:col-span-6"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tomato text-warm-white">
                      <PhoneUrgentIcon className="h-6 w-6" />
                    </span>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-tomato">
                        Urgent care warning
                      </span>
                      <h3 className="font-display text-2xl font-bold text-ink">
                        Emergency symptoms require immediate medical attention
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 text-base leading-relaxed text-cocoa">
                    Do not wait for an online check-in if you or someone near
                    you notices sudden or severe signs like:
                  </p>

                  <ul className="mt-4 space-y-2.5">
                    {EMERGENCY_SIGNS.map((sign) => (
                      <li
                        key={sign}
                        className="flex items-start gap-2.5 text-base font-bold text-ink"
                      >
                        <span
                          className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-tomato"
                          aria-hidden="true"
                        />
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 rounded-2xl bg-tomato-soft px-4 py-3.5 text-sm font-extrabold text-[#8F2118]">
                    Call 112 (India emergency) or your local emergency number, or
                    go to the nearest emergency room right away.
                  </div>
                </motion.div>
              </div>
            </Container>
          </Section>

          {/* 5. FINAL CTA */}
          <Section id="get-started" tone="pink" topWave>
            <Container size="narrow">
              <motion.div
                {...vitaloraMotion.fadeUp}
                className="rounded-[2.5rem] border-2 border-border-warm bg-warm-white px-6 py-12 text-center shadow-[0_10px_0_0_rgba(38,33,29,0.06)] sm:px-14 sm:py-16"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral-soft text-coral-deep">
                  <HeartIcon className="h-7 w-7" />
                </div>

                <div className="mt-4">
                  <Badge tone="butter" dotColor="#D4A22B">
                    Understand your symptoms. Know your next step.
                  </Badge>
                </div>

                <h2 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
                  Ready to feel a little clearer about what&apos;s going on?
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-cocoa sm:text-lg">
                  Begin the guided symptom check-in now, or review how our
                  simple step-by-step guidance works for you and your family.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Button
                    variant="coral"
                    size="lg"
                    onClick={startSymptomCheck}
                    leftIcon={<SparkleIcon className="h-5 w-5" />}
                  >
                    Check my symptoms
                  </Button>
                  <Button href="#how-it-works" variant="green" size="lg">
                    How it works
                  </Button>
                </div>
              </motion.div>
            </Container>
          </Section>
        </>
      )}
    </PageLayout>
  )
}
