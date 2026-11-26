import { useState } from 'react'
import { motion, useReducedMotion, type MotionValue } from 'framer-motion'

export interface VitalPatternWaveProps {
  accent?: 'forest' | 'coral' | 'urgent'
  drawProgress?: MotionValue<number>
  label?: string
  className?: string
}

const ACCENT_HEX = {
  forest: '#174B42',
  coral: '#C25941',
  urgent: '#B4372E',
} as const

/**
 * Calm abstract physiological pattern wave — visualizes symptom cadence and timing
 * cleanly without making fake diagnostic scores or numeric claims.
 */
export function VitalPatternWaveSvg({
  accent = 'forest',
  drawProgress,
  label = 'Symptom rhythm illustration',
  className = '',
}: VitalPatternWaveProps) {
  const prefersReduced = useReducedMotion()
  const strokeColor = ACCENT_HEX[accent]

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 360 74"
        fill="none"
        role="img"
        aria-label={label}
        className="h-auto w-full"
      >
        {/* Subtle calibration baseline */}
        <line
          x1="4"
          y1="40"
          x2="356"
          y2="40"
          stroke="#E2DED3"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        <line x1="90" y1="12" x2="90" y2="66" stroke="#E2DED3" strokeOpacity="0.6" strokeWidth="1" />
        <line x1="180" y1="12" x2="180" y2="66" stroke="#E2DED3" strokeOpacity="0.6" strokeWidth="1" />
        <line x1="270" y1="12" x2="270" y2="66" stroke="#E2DED3" strokeOpacity="0.6" strokeWidth="1" />

        {/* Secondary soothing harmonic curve */}
        <path
          d="M 8 42 C 56 38 78 24 126 36 C 174 48 214 52 262 34 C 304 19 328 32 352 38"
          stroke="#5B8577"
          strokeOpacity="0.35"
          strokeWidth="1.25"
          strokeLinecap="round"
        />

        {/* Primary self-drawing physiological pattern spline */}
        <motion.path
          d="M 8 40 C 48 40 72 40 94 24 C 106 16 116 58 130 56 C 144 54 152 14 166 16 C 180 18 188 46 204 42 C 228 36 254 27 288 33 C 316 38 332 40 352 40"
          stroke={strokeColor}
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={
            !prefersReduced && drawProgress
              ? { pathLength: drawProgress }
              : undefined
          }
          initial={!prefersReduced && !drawProgress ? { pathLength: 0 } : false}
          whileInView={!prefersReduced && !drawProgress ? { pathLength: 1 } : undefined}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        />

        <circle cx="166" cy="16" r="3.5" fill={strokeColor} />
        <circle cx="288" cy="33" r="3" fill="#D6735C" />
      </svg>
    </div>
  )
}

interface PatternMode {
  id: 'sudden' | 'gradual' | 'easing'
  label: string
  subtitle: string
  pathD: string
  dot: { x: number; y: number }
  stroke: string
}

const PATTERN_MODES: PatternMode[] = [
  {
    id: 'sudden',
    label: 'Sudden start',
    subtitle: 'Noticeable change within hours',
    pathD: 'M 20 128 C 68 128 84 126 106 54 C 122 20 156 32 206 44 C 248 54 276 58 318 62',
    dot: { x: 112, y: 38 },
    stroke: '#C25941',
  },
  {
    id: 'gradual',
    label: 'Gradual buildup',
    subtitle: 'Slowly growing over days',
    pathD: 'M 20 132 C 88 128 136 108 184 84 C 228 62 272 48 318 42',
    dot: { x: 228, y: 62 },
    stroke: '#174B42',
  },
  {
    id: 'easing',
    label: 'Settling down',
    subtitle: 'Peak discomfort now easing',
    pathD: 'M 20 56 C 68 38 118 44 168 74 C 218 104 268 118 318 124',
    dot: { x: 236, y: 110 },
    stroke: '#5B8577',
  },
]

/** Interactive qualitative chart helping users visualize why onset timing and trend clarify symptoms. */
export function SignalTimelineChart() {
  const prefersReduced = useReducedMotion()
  const [selectedMode, setSelectedMode] = useState<PatternMode['id']>('gradual')
  const active =
    PATTERN_MODES.find((item) => item.id === selectedMode) ?? PATTERN_MODES[1]

  return (
    <div className="rounded-3xl border border-hairline bg-paper p-6 shadow-[0_18px_46px_-22px_rgba(24,32,30,0.14)] sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone">
            Signal Pattern View
          </p>
          <p className="mt-0.5 font-display text-lg font-medium text-charcoal">
            Why timing matters
          </p>
        </div>

        <span className="rounded-full border border-hairline bg-ivory px-3 py-1 text-xs font-semibold text-slate">
          Qualitative guide
        </span>
      </div>

      {/* Mode switcher */}
      <div
        role="tablist"
        aria-label="Symptom timing patterns"
        className="mt-4 grid grid-cols-3 gap-1.5 rounded-xl bg-sand/70 p-1"
      >
        {PATTERN_MODES.map((mode) => {
          const isSelected = mode.id === selectedMode
          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedMode(mode.id)}
              className={`cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
                isSelected
                  ? 'bg-paper text-charcoal shadow-xs'
                  : 'text-slate hover:text-charcoal'
              }`}
            >
              {mode.label}
            </button>
          )
        })}
      </div>

      {/* Layered SVG Graph */}
      <div className="mt-5 rounded-2xl border border-hairline bg-ivory/65 p-4">
        <svg
          viewBox="0 0 340 156"
          fill="none"
          role="img"
          aria-label={`Illustrative symptom timing curve for ${active.label}`}
          className="h-auto w-full"
        >
          {/* Coordinate hairlines */}
          {[36, 72, 108, 138].map((y) => (
            <line
              key={y}
              x1="16"
              y1={y}
              x2="324"
              y2={y}
              stroke="#E2DED3"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          ))}

          {/* Ghosted comparison paths */}
          {PATTERN_MODES.map((mode) => {
            if (mode.id === active.id) return null
            return (
              <path
                key={mode.id}
                d={mode.pathD}
                stroke="#CAC4B6"
                strokeOpacity="0.65"
                strokeWidth="1.25"
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Highlighted curve */}
          <motion.path
            key={active.id}
            d={active.pathD}
            stroke={active.stroke}
            strokeWidth="2.8"
            strokeLinecap="round"
            initial={prefersReduced ? false : { pathLength: 0.25, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: prefersReduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.circle
            key={`${active.id}-dot`}
            cx={active.dot.x}
            cy={active.dot.y}
            r="5.5"
            fill={active.stroke}
            stroke="#FFFFFF"
            strokeWidth="2"
            initial={prefersReduced ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: prefersReduced ? 0 : 0.25 }}
          />

          <text
            x="20"
            y="151"
            fill="#6E756F"
            fontSize="10"
            fontWeight="600"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            Day 1
          </text>
          <text
            x="170"
            y="151"
            textAnchor="middle"
            fill="#6E756F"
            fontSize="10"
            fontWeight="600"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            Following days
          </text>
          <text
            x="320"
            y="151"
            textAnchor="end"
            fill="#6E756F"
            fontSize="10"
            fontWeight="600"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            Now
          </text>
        </svg>

        <p className="mt-2 border-t border-hairline pt-2.5 text-xs font-medium text-slate">
          <span className="font-semibold text-charcoal">{active.label}:</span>{' '}
          {active.subtitle} — sharing this trend helps doctors focus immediately.
        </p>
      </div>
    </div>
  )
}
