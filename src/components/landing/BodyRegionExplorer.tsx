import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  BODY_REGIONS,
  BODY_REGION_MAP,
  type BodyRegionId,
} from '../../features/symptom-check/bodyRegions'
import { getSymptomById } from '../../features/symptom-check/symptomCatalog'
import { AnatomicalBodySvg } from '../illustrations/AnatomicalBodySvg'
import { ArrowRightIcon } from '../illustrations/Icons'
import { Reveal } from '../motion/MotionPrimitives'
import { Button } from '../ui/Button'

export interface BodyRegionExplorerProps {
  onStartCheckWithSymptom: (symptomId?: string) => void
}

/**
 * Interactive human-body explorer section letting users explore anatomical
 * systems cleanly and launch directly into symptom check-in from any discomfort area.
 */
export function BodyRegionExplorer({
  onStartCheckWithSymptom,
}: BodyRegionExplorerProps) {
  const prefersReduced = useReducedMotion()
  const [selectedRegion, setSelectedRegion] =
    useState<BodyRegionId>('chest-breathing')

  const region =
    BODY_REGION_MAP.get(selectedRegion) ?? BODY_REGIONS[0]

  const regionSymptoms = region.symptomIds
    .map((id) => getSymptomById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  return (
    <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
      {/* Interactive Human Body Plate */}
      <Reveal direction="right" className="lg:col-span-6">
        <div className="rounded-[2rem] border border-hairline bg-paper p-5 shadow-[0_24px_60px_-28px_rgba(24,32,30,0.12)] sm:p-8">
          <div className="flex items-center justify-between border-b border-hairline pb-3.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone">
              Interactive Body Map
            </span>
            <span className="text-xs font-semibold text-forest">
              {region.systemLabel}
            </span>
          </div>

          <div className="py-4">
            <AnatomicalBodySvg
              activeRegions={[selectedRegion]}
              focusedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              showHotspots={true}
              showCallouts={true}
              className="max-w-[330px] sm:max-w-[365px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-hairline pt-4 sm:grid-cols-4">
            {BODY_REGIONS.map((item) => {
              const isSelected = item.id === selectedRegion
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedRegion(item.id)}
                  className={`cursor-pointer rounded-xl border px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
                    isSelected
                      ? 'border-forest bg-sage-mist text-forest'
                      : 'border-hairline bg-ivory/75 text-slate hover:border-hairline-strong hover:text-charcoal'
                  }`}
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone">
                    {item.code}
                  </span>
                  <span className="block text-[11px] font-semibold leading-tight sm:text-xs">
                    {item.shortLabel}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </Reveal>

      {/* Focused Editorial Detail & Symptom Triggers */}
      <Reveal direction="left" className="space-y-6 lg:col-span-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-coral">
            Body-region clarity
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-charcoal sm:text-4xl">
            Start where discomfort feels clearest
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate sm:text-lg">
            Instead of sifting through medical terminology, select any part of
            the body to review common everyday signals and step directly into
            your check-in.
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={region.id}
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: prefersReduced ? 0 : 0.24 }}
            className="space-y-5 rounded-3xl border border-hairline bg-paper p-6 sm:p-7"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone">
                  Region {region.code} · {region.systemLabel}
                </span>
                <h3 className="mt-1 font-display text-2xl font-semibold text-charcoal">
                  {region.title}
                </h3>
              </div>
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: region.accentHex }}
                aria-hidden="true"
              />
            </div>

            <p className="text-sm leading-relaxed text-slate sm:text-base">
              {region.summary}
            </p>

            <div className="rounded-xl border border-hairline bg-ivory/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-forest">
                Helpful detail to notice
              </p>
              <p className="mt-1 text-sm text-charcoal">{region.whatToNotice}</p>
            </div>

            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-stone">
                Quick-start with a symptom from this region
              </p>
              <div className="flex flex-wrap gap-2">
                {regionSymptoms.map((symptom) => (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => onStartCheckWithSymptom(symptom.id)}
                    className="cursor-pointer rounded-full border border-hairline-strong bg-ivory px-3.5 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:border-coral hover:bg-coral-soft hover:text-coral focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral sm:text-sm"
                  >
                    + {symptom.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <Button
                variant="forest"
                size="md"
                onClick={() => onStartCheckWithSymptom()}
                rightIcon={<ArrowRightIcon className="h-4 w-4" />}
              >
                Check {region.shortLabel.toLowerCase()} symptoms
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </Reveal>
    </div>
  )
}
