import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import {
  BODY_REGIONS,
  BODY_REGION_MAP,
  type BodyRegionId,
} from '../../features/symptom-check/bodyRegions'
import { AnatomicalBodySvg } from './AnatomicalBodySvg'
import { VitalPatternWaveSvg } from './ClinicalVisuals'

export interface LogoMarkProps {
  className?: string
}

/** Refined botanical-pulse brand mark for VITALORA in Deep Botanical Pine and Terracotta. */
export function VitaloraLogoMark({ className = 'h-9 w-9' }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="40" height="40" rx="12" fill="#174B42" />
      <path
        d="M10 21h5l2.8-6.5L22 26.5l3.5-8.5 2.2 3h2.3"
        stroke="#F9F7F2"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30.5" cy="11.5" r="3" fill="#D6735C" />
    </svg>
  )
}

/**
 * Architectural hero visual uniting our custom anatomical silhouette,
 * subtle scroll-linked calibration geometry, and calm physiological wave cadence.
 */
export function HeroAnatomicalVisual() {
  const prefersReduced = useReducedMotion()
  const { scrollY } = useScroll()
  const ringRotate = useTransform(scrollY, [0, 600], [0, 18])
  const plateShift = useTransform(scrollY, [0, 600], [0, -24])

  const [hoveredRegion, setHoveredRegion] = useState<BodyRegionId | null>(null)
  const [cycleIndex, setCycleIndex] = useState(0)

  useEffect(() => {
    if (prefersReduced || hoveredRegion) return
    const timer = window.setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % BODY_REGIONS.length)
    }, 3600)
    return () => window.clearInterval(timer)
  }, [prefersReduced, hoveredRegion])

  const activeRegionId = hoveredRegion ?? BODY_REGIONS[cycleIndex].id
  const activeRegion = BODY_REGION_MAP.get(activeRegionId) ?? BODY_REGIONS[0]

  return (
    <div className="relative mx-auto w-full max-w-[540px] py-2">
      {/* Scroll-rotating geometric architectural calibration ring */}
      <motion.svg
        style={prefersReduced ? undefined : { rotate: ringRotate }}
        viewBox="0 0 520 520"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[102%] w-[102%] -translate-x-1/2 -translate-y-1/2 opacity-70"
      >
        <circle
          cx="260"
          cy="260"
          r="238"
          stroke="#CAC4B6"
          strokeOpacity="0.65"
          strokeWidth="1"
          strokeDasharray="4 7"
        />
        <circle
          cx="260"
          cy="260"
          r="204"
          stroke="#5B8577"
          strokeOpacity="0.22"
          strokeWidth="1"
        />
      </motion.svg>

      {/* Main sculptural anatomy specimen surface */}
      <motion.div
        style={prefersReduced ? undefined : { y: plateShift }}
        className="relative z-10 overflow-hidden rounded-[2rem] border border-hairline bg-paper/92 p-4 shadow-[0_28px_70px_-28px_rgba(24,32,30,0.16)] sm:p-6"
      >
        {/* Minimal plate header */}
        <div className="flex items-center justify-between border-b border-hairline pb-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: activeRegion.accentHex }}
              aria-hidden="true"
            />
            <span className="font-semibold uppercase tracking-[0.14em] text-stone">
              Anatomical Guide
            </span>
          </div>
          <span className="font-semibold text-charcoal">
            {activeRegion.code} · {activeRegion.shortLabel}
          </span>
        </div>

        {/* Anatomical Silhouette Plate */}
        <div className="relative py-1">
          <AnatomicalBodySvg
            activeRegions={[activeRegionId]}
            focusedRegion={activeRegionId}
            onSelectRegion={(regionId) => {
              setHoveredRegion(regionId)
            }}
            onHoverRegion={setHoveredRegion}
            showHotspots={true}
            showCallouts={true}
            className="max-w-[270px] sm:max-w-[300px]"
          />
        </div>

        {/* Calm qualitative wave strip + active region insight */}
        <div className="mt-1 border-t border-hairline pt-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest">
              {activeRegion.systemLabel}
            </p>
            <p className="text-xs text-stone">Tap a body point to preview</p>
          </div>
          <p className="mt-1 text-sm font-medium text-charcoal">
            {activeRegion.summary}
          </p>
          <VitalPatternWaveSvg
            accent={
              activeRegionId === 'chest-breathing' ? 'forest' : 'coral'
            }
            className="mt-2 max-h-[58px]"
          />
        </div>
      </motion.div>
    </div>
  )
}
