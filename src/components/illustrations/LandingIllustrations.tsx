import { CursorHighlightCard } from '../motion/MotionPrimitives'
import { CheckCircleIcon, SearchIcon, ShieldAlertIcon } from './Icons'

/** Cursor-responsive editorial UI vignette for the 3-step How It Works timeline. */
export function StoryStepIllustration({ step }: { step: 1 | 2 | 3 }) {
  if (step === 1) {
    return (
      <CursorHighlightCard className="rounded-2xl border border-hairline bg-paper p-5 shadow-[0_10px_28px_-14px_rgba(23,35,32,0.09)] sm:p-6">
        <div className="flex items-center gap-2.5 rounded-xl border border-hairline bg-ivory px-3.5 py-2.5 text-sm text-stone">
          <SearchIcon className="h-4 w-4 text-slate" />
          <span>Search symptoms in your own words...</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-forest/35 bg-sage-mist px-3 py-1.5 text-xs font-semibold text-forest">
            <CheckCircleIcon className="h-3.5 w-3.5 text-forest" />
            Headache
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-forest/35 bg-sage-mist px-3 py-1.5 text-xs font-semibold text-forest">
            <CheckCircleIcon className="h-3.5 w-3.5 text-forest" />
            Fever
          </span>
          <span className="rounded-lg border border-hairline bg-ivory px-3 py-1.5 text-xs font-medium text-slate">
            Stomach pain
          </span>
          <span className="rounded-lg border border-hairline bg-ivory px-3 py-1.5 text-xs font-medium text-slate">
            Cough
          </span>
        </div>
      </CursorHighlightCard>
    )
  }

  if (step === 2) {
    return (
      <CursorHighlightCard className="rounded-2xl border border-hairline bg-paper p-5 shadow-[0_10px_28px_-14px_rgba(23,35,32,0.09)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone">
          Simple follow-up
        </p>
        <p className="mt-1 font-display text-base font-medium text-charcoal">
          When did this start?
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-hairline bg-ivory px-3 py-2 text-xs font-medium text-slate">
            Today
          </div>
          <div className="rounded-xl border border-coral bg-coral-soft px-3 py-2 text-xs font-semibold text-coral">
            Yesterday ✓
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3 text-xs text-stone">
          <span>Optional questions can be skipped</span>
          <span className="font-semibold text-forest">Skip →</span>
        </div>
      </CursorHighlightCard>
    )
  }

  return (
    <CursorHighlightCard className="rounded-2xl border border-hairline bg-paper p-5 shadow-[0_10px_28px_-14px_rgba(23,35,32,0.09)] sm:p-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-sage-mist/75 px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-forest" />
          <div className="text-xs">
            <p className="font-semibold text-charcoal">Everyday precautions</p>
            <p className="text-slate">Plain rest and hydration steps</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-coral-soft/75 px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-coral" />
          <div className="text-xs">
            <p className="font-semibold text-charcoal">Doctor visit guidance</p>
            <p className="text-slate">Clear timing and signs to share</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-urgent-soft px-3.5 py-2.5">
          <ShieldAlertIcon className="h-4 w-4 shrink-0 text-urgent" />
          <div className="text-xs">
            <p className="font-semibold text-urgent">Urgent red-flag checks</p>
            <p className="text-slate">Immediate 112 guidance when needed</p>
          </div>
        </div>
      </div>
    </CursorHighlightCard>
  )
}

/** Calm botanical-geometry SVG composition for the Health Awareness section. */
export function BodyAwarenessIllustration() {
  return (
    <CursorHighlightCard className="relative mx-auto max-w-[400px] rounded-3xl border border-hairline bg-paper p-7 shadow-[0_16px_40px_-16px_rgba(23,35,32,0.09)]">
      <svg
        viewBox="0 0 320 220"
        fill="none"
        role="img"
        aria-label="Calm geometric pulse and botanical balance illustration representing paying attention to early health signals"
        className="h-auto w-full"
      >
        <circle cx="160" cy="110" r="88" fill="#E3F0ED" />
        <circle
          cx="160"
          cy="110"
          r="64"
          stroke="#5C8A80"
          strokeWidth="1.2"
          strokeDasharray="4 5"
        />
        <circle cx="160" cy="110" r="40" fill="#FFFFFF" stroke="#E0DDD3" strokeWidth="1.5" />
        <path
          d="M126 112h18l7-18 11 32 8-20 6 6h18"
          stroke="#0F5C53"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="236" cy="58" r="7" fill="#D4694F" />
        <circle cx="84" cy="156" r="5" fill="#5C8A80" />
      </svg>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-hairline pt-4 text-center">
        <div>
          <p className="text-xs font-semibold text-charcoal">Timing</p>
          <p className="text-[11px] text-stone">When it began</p>
        </div>
        <div className="border-x border-hairline">
          <p className="text-xs font-semibold text-charcoal">Severity</p>
          <p className="text-[11px] text-stone">How strong it feels</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-charcoal">Trend</p>
          <p className="text-[11px] text-stone">How it changes</p>
        </div>
      </div>
    </CursorHighlightCard>
  )
}
