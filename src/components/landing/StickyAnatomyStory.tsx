import { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import type { BodyRegionId } from '../../features/symptom-check/bodyRegions'
import { AnatomicalBodySvg } from '../illustrations/AnatomicalBodySvg'
import { VitalPatternWaveSvg } from '../illustrations/ClinicalVisuals'
import { ArrowRightIcon } from '../illustrations/Icons'
import { Button } from '../ui/Button'

interface StoryChapter {
  index: string
  kicker: string
  title: string
  description: string
  detailNote: string
  activeRegions: BodyRegionId[]
  urgentRegions?: BodyRegionId[]
  focusedRegion: BodyRegionId
  statusTitle: string
  statusCaption: string
  waveAccent: 'forest' | 'coral' | 'urgent'
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    index: '01',
    kicker: 'Plain-language intake',
    title: 'Locate how you feel without medical jargon.',
    description:
      'Start with everyday words or point straight to where discomfort lives — headaches, warm fever, stomach tightness, or joint soreness.',
    detailNote:
      'Every symptom maps directly to plain questions you can answer even when fatigued.',
    activeRegions: ['head-throat', 'body-spine-skin'],
    focusedRegion: 'head-throat',
    statusTitle: 'Body Systems Mapped',
    statusCaption: 'Head, upper airway & systemic layers illuminated',
    waveAccent: 'coral',
  },
  {
    index: '02',
    kicker: 'Timing & progression',
    title: 'Connect onset, intensity, and daily trend.',
    description:
      'Clarify whether symptoms began suddenly today or built up over several days, how strong they feel right now, and whether things are easing.',
    detailNote:
      'Optional follow-up prompts can always be skipped without slowing you down.',
    activeRegions: ['stomach-digestion', 'head-throat'],
    focusedRegion: 'stomach-digestion',
    statusTitle: 'Context & Pattern Layer',
    statusCaption: 'Onset timing, mild-to-severe scale & progression aligned',
    waveAccent: 'forest',
  },
  {
    index: '03',
    kicker: 'Continuous safety net',
    title: 'Spot emergency red flags immediately.',
    description:
      'Rule-based checks monitor chest pain, breathing distress, fainting, or sudden weakness continuously — raising urgent 112 care guidance right away.',
    detailNote:
      'Critical safety alerts never wait until the end of a long questionnaire.',
    activeRegions: ['chest-breathing'],
    urgentRegions: ['chest-breathing'],
    focusedRegion: 'chest-breathing',
    statusTitle: 'Priority Safety Shield Active',
    statusCaption: 'Thoracic & neuro-respiratory red-flag screening highlighted',
    waveAccent: 'urgent',
  },
  {
    index: '04',
    kicker: 'Prepared conversation',
    title: 'Walk away with calm, structured next steps.',
    description:
      'Review everything you shared on one clear summary screen — easy to save for yourself, share with family, or bring into a doctor consultation.',
    detailNote:
      'Clear informational guidance without fake diagnoses or alarming guesswork.',
    activeRegions: [
      'head-throat',
      'chest-breathing',
      'stomach-digestion',
      'body-spine-skin',
    ],
    focusedRegion: 'body-spine-skin',
    statusTitle: 'Full Check-In Summary Ready',
    statusCaption: 'All body systems synchronized for your Stage 4 next-step guide',
    waveAccent: 'forest',
  },
]

export interface StickyAnatomyStoryProps {
  onStartCheckIn: () => void
}

/**
 * Scroll-driven sticky storytelling centerpiece:
 * As the reader scrolls through the four chapters, the pinned human-body
 * visualization draws in progressively, transitions active body systems,
 * updates its rhythm waveform, and synchronizes with narrative text.
 */
export function StickyAnatomyStory({
  onStartCheckIn,
}: StickyAnatomyStoryProps) {
  const prefersReduced = useReducedMotion()
  const storyContainerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const { scrollYProgress } = useScroll({
    target: storyContainerRef,
    offset: ['start 25%', 'end 80%'],
  })

  const drawProgress = useTransform(scrollYProgress, [0, 0.22], [0.45, 1])

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (progress < 0.24) {
      setActiveIndex(0)
    } else if (progress < 0.52) {
      setActiveIndex(1)
    } else if (progress < 0.78) {
      setActiveIndex(2)
    } else {
      setActiveIndex(3)
    }
  })

  const activeChapter = STORY_CHAPTERS[activeIndex] ?? STORY_CHAPTERS[0]

  return (
    <div ref={storyContainerRef} className="relative mt-12">
      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
        {/* PINNED STICKY ANATOMICAL VISUALIZATION (Desktop Sticky, Mobile Top) */}
        <div className="lg:sticky lg:top-24 lg:col-span-6">
          <div className="rounded-[2rem] border border-hairline bg-paper p-4 shadow-[0_28px_72px_-30px_rgba(24,32,30,0.16)] sm:p-6">
            {/* Synchronized Scroll Story Telemetry Header */}
            <div className="space-y-2.5 border-b border-hairline pb-3.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="uppercase tracking-[0.14em] text-forest">
                  Scroll Narrative · Chapter {activeChapter.index} / 04
                </span>
                <span className="text-stone">Live anatomy sync</span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand">
                <motion.div
                  style={
                    prefersReduced
                      ? { scaleX: (activeIndex + 1) / STORY_CHAPTERS.length }
                      : { scaleX: scrollYProgress }
                  }
                  className="h-full w-full origin-left rounded-full bg-forest"
                />
              </div>
            </div>

            {/* Pinned Human Body SVG Reacting to Scroll Stage */}
            <div className="py-2">
              <AnatomicalBodySvg
                activeRegions={activeChapter.activeRegions}
                focusedRegion={activeChapter.focusedRegion}
                urgentRegions={activeChapter.urgentRegions}
                showHotspots={false}
                showCallouts={true}
                revealPathLength={prefersReduced ? undefined : drawProgress}
                className="max-w-[265px] sm:max-w-[295px]"
              />
            </div>

            {/* Dynamic Stage Status & Qualitative Wave */}
            <div className="border-t border-hairline pt-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChapter.index}
                  initial={prefersReduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReduced ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: prefersReduced ? 0 : 0.22 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        activeChapter.waveAccent === 'urgent'
                          ? 'text-urgent'
                          : 'text-charcoal'
                      }`}
                    >
                      {activeChapter.statusTitle}
                    </p>
                    <span className="rounded-full bg-ivory px-2.5 py-0.5 text-[11px] font-semibold text-stone">
                      {activeChapter.kicker}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate">
                    {activeChapter.statusCaption}
                  </p>
                </motion.div>
              </AnimatePresence>

              <VitalPatternWaveSvg
                accent={activeChapter.waveAccent}
                drawProgress={prefersReduced ? undefined : scrollYProgress}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* SCROLLING NARRATIVE CHAPTERS */}
        <div className="space-y-6 lg:col-span-6 lg:space-y-24 lg:py-8">
          {STORY_CHAPTERS.map((chapter, idx) => {
            const isCurrent = idx === activeIndex
            const isUrgentStage = Boolean(chapter.urgentRegions?.length)

            return (
              <motion.article
                key={chapter.index}
                onViewportEnter={() => setActiveIndex(idx)}
                viewport={{ amount: 0.45 }}
                onClick={() => setActiveIndex(idx)}
                className={`cursor-pointer rounded-3xl border p-6 transition-all duration-300 sm:p-8 ${
                  isCurrent
                    ? isUrgentStage
                      ? 'border-urgent/40 bg-paper shadow-[0_22px_50px_-24px_rgba(180,55,46,0.2)]'
                      : 'border-forest/35 bg-paper shadow-[0_22px_50px_-24px_rgba(23,75,66,0.16)]'
                    : 'border-hairline bg-paper/75 lg:opacity-65 hover:lg:opacity-95'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] ${
                      isUrgentStage ? 'text-urgent' : 'text-coral'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isUrgentStage ? 'bg-urgent' : 'bg-coral'
                      }`}
                      aria-hidden="true"
                    />
                    {chapter.index} · {chapter.kicker}
                  </span>

                  <span className="text-xs font-medium text-stone">
                    {isCurrent ? 'Viewing on diagram' : 'Scroll or click'}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-2xl font-semibold text-charcoal sm:text-3xl">
                  {chapter.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
                  {chapter.description}
                </p>

                <div className="mt-5 border-t border-hairline pt-4 text-xs font-medium text-stone sm:text-sm">
                  {chapter.detailNote}
                </div>

                {idx === STORY_CHAPTERS.length - 1 ? (
                  <div className="mt-5">
                    <Button
                      variant="forest"
                      size="md"
                      onClick={(e) => {
                        e.stopPropagation()
                        onStartCheckIn()
                      }}
                      rightIcon={<ArrowRightIcon className="h-4 w-4" />}
                    >
                      Begin guided check-in
                    </Button>
                  </div>
                ) : null}
              </motion.article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
