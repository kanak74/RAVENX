import { SubtleFloat } from '../motion/MotionPrimitives'
import { CheckCircleIcon, ShieldAlertIcon, SparkleIcon } from './Icons'

export interface LogoMarkProps {
  className?: string
}

/** Refined botanical-pulse brand mark for VITALORA in deep forest green and muted coral. */
export function VitaloraLogoMark({ className = 'h-9 w-9' }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="40" height="40" rx="12" fill="#1E4D3B" />
      <path
        d="M10 21h5l2.8-6.5L22 26.5l3.5-8.5 2.2 3h2.3"
        stroke="#FAF8F4"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30.5" cy="11.5" r="3" fill="#D96B52" />
    </svg>
  )
}

/**
 * Sophisticated editorial product composition for the Hero section.
 * Illustrates VITALORA's calm guided symptom flow without cartoon elements
 * or fake medical diagnostic claims.
 */
export function HeroEditorialVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[500px] py-4 sm:py-6">
      {/* Delicate architectural contour lines behind frame */}
      <svg
        viewBox="0 0 480 420"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <circle
          cx="250"
          cy="210"
          r="172"
          fill="#EDF2EE"
          fillOpacity="0.65"
        />
        <circle
          cx="250"
          cy="210"
          r="196"
          stroke="#CFC8BA"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M68 290C118 220 156 196 226 176"
          stroke="#6B8F7E"
          strokeOpacity="0.3"
          strokeWidth="1.5"
        />
      </svg>

      {/* Main layered product preview frame */}
      <div className="relative z-10 mx-auto max-w-[400px] rounded-3xl border border-hairline bg-paper p-6 shadow-[0_20px_50px_-16px_rgba(30,36,33,0.12)] sm:p-7">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage-mist text-forest">
              <SparkleIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone">
                Guided Check-In
              </p>
              <p className="text-sm font-semibold text-charcoal">
                Step 1 · How you feel
              </p>
            </div>
          </div>
          <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-slate">
            Plain English
          </span>
        </div>

        <div className="mt-5 space-y-4">
          <p className="font-display text-lg font-medium text-charcoal">
            Select anything bothering you today
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center justify-between rounded-xl border border-coral bg-coral-soft/75 px-3.5 py-2.5">
              <span className="text-sm font-semibold text-charcoal">Fever</span>
              <CheckCircleIcon className="h-4 w-4 text-coral" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-coral bg-coral-soft/75 px-3.5 py-2.5">
              <span className="text-sm font-semibold text-charcoal">Headache</span>
              <CheckCircleIcon className="h-4 w-4 text-coral" />
            </div>
            <div className="flex items-center rounded-xl border border-hairline bg-ivory/80 px-3.5 py-2.5">
              <span className="text-sm font-medium text-slate">Fatigue</span>
            </div>
            <div className="flex items-center rounded-xl border border-hairline bg-ivory/80 px-3.5 py-2.5">
              <span className="text-sm font-medium text-slate">Sore throat</span>
            </div>
          </div>

          <div className="rounded-2xl border border-hairline bg-ivory p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone">
              What happens next
            </p>
            <div className="mt-2.5 space-y-2 text-xs font-medium text-slate">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                <span>Quick questions on timing and severity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-coral-accent" />
                <span>Automatic urgent warning sign check (112)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                <span>Clear next steps before speaking with a doctor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle floating contextual indicators */}
      <SubtleFloat
        offset={4}
        duration={6.5}
        className="relative z-20 mt-4 flex flex-wrap items-center justify-center gap-3 sm:mt-0"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-paper px-3.5 py-2 text-xs font-semibold text-charcoal shadow-[0_8px_20px_-6px_rgba(30,36,33,0.12)] sm:absolute sm:-right-2 sm:-top-4">
          <span className="h-2 w-2 rounded-full bg-forest" aria-hidden="true" />
          <span>No medical jargon</span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-urgent/25 bg-paper px-3.5 py-2 text-xs font-semibold text-charcoal shadow-[0_8px_20px_-6px_rgba(30,36,33,0.12)] sm:absolute sm:-bottom-4 sm:-left-2">
          <ShieldAlertIcon className="h-3.5 w-3.5 text-urgent" />
          <span>Instant emergency check</span>
        </div>
      </SubtleFloat>
    </div>
  )
}
