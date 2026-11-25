import { motion } from 'framer-motion'
import {
  ArrowRightIcon,
  HeartIcon,
  ShieldAlertIcon,
  SunIcon,
} from '../components/illustrations/Icons'
import {
  HeroCompanionIllustration,
  StepIllustration,
  type StepIllustrationVariant,
} from '../components/illustrations/WarmSpotShapes'
import { Container } from '../components/layout/Container'
import { PageLayout } from '../components/layout/PageLayout'
import { Section } from '../components/layout/Section'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { OrganicBlob } from '../components/ui/OrganicBlob'
import { ravenxMotion, ravenxPaletteShowcase } from '../styles/theme'

interface StepPlaceholder {
  number: string
  title: string
  description: string
  stageLabel: string
  illustration: StepIllustrationVariant
  accentBg: string
}

const STEP_PLACEHOLDERS: StepPlaceholder[] = [
  {
    number: '01',
    title: 'Share how you feel',
    description:
      'Placeholder for simple tap-friendly symptom choices and everyday words.',
    stageLabel: 'Coming in Stage 2',
    illustration: 'listen',
    accentBg: 'bg-coral-soft',
  },
  {
    number: '02',
    title: 'Answer gentle questions',
    description:
      'Placeholder for short, child-friendly follow-ups one question at a time.',
    stageLabel: 'Coming in Stage 3',
    illustration: 'ask',
    accentBg: 'bg-butter-soft',
  },
  {
    number: '03',
    title: 'Get clear next steps',
    description:
      'Placeholder for calming care basics and clear signals to visit a doctor.',
    stageLabel: 'Coming in Stage 4',
    illustration: 'guide',
    accentBg: 'bg-green-soft',
  },
]

/** Stage 1 homepage skeleton establishing RAVENX's warm, illustrated design identity. */
export function HomePage() {
  return (
    <PageLayout>
      {/* Hero section */}
      <Section id="top" tone="cream" className="relative overflow-hidden pb-16 pt-10 sm:pb-24 sm:pt-16">
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
              transition={{ duration: 0.45, ease: ravenxMotion.ease }}
              className="space-y-6 lg:col-span-6"
            >
              <Badge tone="pink" dotColor="#FF7B61">
                Human-Centered Health Companion
              </Badge>

              <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-[3.35rem]">
                When you feel unwell, get calm guidance — without the scary jargon.
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-cocoa sm:text-xl">
                RAVENX is a friendly health guidance prototype built to help people
                understand everyday symptoms, recognize warning signs, and know
                when to seek medical care.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Button
                  href="#how-it-works"
                  variant="coral"
                  size="lg"
                  rightIcon={<ArrowRightIcon className="h-5 w-5" />}
                >
                  See How It Works
                </Button>
                <Button href="#safety-promise" variant="outline" size="lg">
                  Safety Promise
                </Button>
              </div>

              <p className="inline-flex items-center gap-2 text-sm font-bold text-taupe">
                <SunIcon className="h-4 w-4 text-coral-deep" />
                <span>
                  Stage 1 layout foundation · Interactive health flow arrives next.
                </span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: ravenxMotion.ease, delay: 0.08 }}
              className="lg:col-span-6"
            >
              <HeroCompanionIllustration />
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Placeholder Section 1: Planned 3-step journey */}
      <Section id="how-it-works" tone="linen" topWave>
        <Container>
          <motion.div {...ravenxMotion.fadeUp} className="mx-auto max-w-2xl text-center">
            <Badge tone="butter" dotColor="#D4A22B">
              Homepage Skeleton · Upcoming Flow
            </Badge>
            <h2 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
              Three gentle steps, easy enough for anyone
            </h2>
            <p className="mt-3 text-base text-cocoa sm:text-lg">
              Below are placeholder sections for the guided symptom experience we
              will build stage by stage.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEP_PLACEHOLDERS.map((step, index) => (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.4,
                  ease: ravenxMotion.ease,
                  delay: index * 0.07,
                }}
                className="tactile-card flex flex-col justify-between rounded-[2rem] p-7"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <StepIllustration variant={step.illustration} />
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-extrabold text-ink ${step.accentBg}`}
                    >
                      Step {step.number}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-2xl font-bold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-base leading-relaxed text-cocoa">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 border-t-2 border-dashed border-border-warm pt-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-taupe">
                    {step.stageLabel}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Placeholder Section 2: Safety & Design System Showcase */}
      <Section id="safety-promise" tone="mint" topWave>
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <motion.div {...ravenxMotion.fadeUp} className="space-y-5 lg:col-span-6">
              <Badge tone="tomato" dotColor="#DE4436">
                Design System & Safety First
              </Badge>
              <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
                Warm colors that speak clearly at a glance
              </h2>
              <p className="text-base leading-relaxed text-cocoa sm:text-lg">
                Instead of cold dark dashboards, RAVENX uses soft cream surfaces
                and friendly colors so anyone can tell calm care apart from
                urgent alerts right away.
              </p>

              <div className="rounded-3xl border-2 border-tomato/35 bg-warm-white p-5 shadow-[0_4px_0_0_rgba(222,68,54,0.12)]">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-tomato-soft text-tomato">
                    <ShieldAlertIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink">
                      Safety Placeholder · Not a Medical Diagnosis
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-cocoa">
                      In later stages, urgent warning signs will stand out clearly in
                      tomato red so users know right away when to seek professional
                      medical help.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              {...ravenxMotion.fadeUp}
              className="rounded-[2rem] border-2 border-border-warm bg-warm-white p-6 shadow-[0_6px_0_0_rgba(38,33,29,0.06)] lg:col-span-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-ink">
                  RAVENX Color Palette
                </h3>
                <span className="text-xs font-extrabold uppercase tracking-wider text-taupe">
                  Foundation
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ravenxPaletteShowcase.map((swatch) => (
                  <div
                    key={swatch.name}
                    className="rounded-2xl border-2 border-border-warm bg-cream p-3"
                  >
                    <div
                      className="flex h-14 items-end rounded-xl border border-ink/10 p-2.5"
                      style={{ backgroundColor: swatch.hex, color: swatch.textHex }}
                    >
                      <span className="text-xs font-extrabold tracking-wide">
                        {swatch.hex}
                      </span>
                    </div>
                    <p className="mt-2.5 text-sm font-extrabold text-ink">
                      {swatch.name}
                    </p>
                    <p className="text-xs font-semibold text-cocoa">
                      {swatch.role}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Placeholder Section 3: Closing CTA & Button Showcase */}
      <Section tone="pink" topWave>
        <Container size="narrow">
          <motion.div
            {...ravenxMotion.fadeUp}
            className="rounded-[2.25rem] border-2 border-border-warm bg-warm-white px-6 py-10 text-center shadow-[0_8px_0_0_rgba(38,33,29,0.06)] sm:px-12 sm:py-14"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral-soft text-coral-deep">
              <HeartIcon className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-display text-3xl font-bold text-ink sm:text-4xl">
              Stage 1 foundation is ready
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-cocoa sm:text-lg">
              Layout shells, warm typography, organic shapes, and large accessible
              buttons are set up cleanly for the healthcare stages ahead.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <Button href="#top" variant="coral" size="lg">
                Back to Top
              </Button>
              <Button href="#how-it-works" variant="green" size="lg">
                Review Step Skeleton
              </Button>
            </div>
          </motion.div>
        </Container>
      </Section>
    </PageLayout>
  )
}
