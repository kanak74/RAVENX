import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircleIcon } from '../../components/illustrations/Icons'

export type CheckInStep = 1 | 2 | 3 | 4

export interface CheckInProgressProps {
  currentStep: CheckInStep
  highestStepReached: CheckInStep
  onSelectStep: (step: CheckInStep) => void
}

const STEPS: { step: CheckInStep; shortLabel: string }[] = [
  { step: 1, shortLabel: 'Symptoms' },
  { step: 2, shortLabel: 'Details' },
  { step: 3, shortLabel: 'Follow-up' },
  { step: 4, shortLabel: 'Review' },
]

/** Refined segmented progress bar with animated completion track. */
export function CheckInProgress({
  currentStep,
  highestStepReached,
  onSelectStep,
}: CheckInProgressProps) {
  const prefersReduced = useReducedMotion()
  const progressPercent = (currentStep / STEPS.length) * 100

  return (
    <nav aria-label="Check-in steps" className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone">
        <span>Step {currentStep} of 4</span>
        <span>{STEPS[currentStep - 1].shortLabel}</span>
      </div>

      {/* Smooth horizontal progress track */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-sand">
        <motion.div
          className="h-full rounded-full bg-coral"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={
            prefersReduced
              ? { duration: 0 }
              : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
          }
        />
      </div>

      <ol className="grid grid-cols-4 gap-2">
        {STEPS.map(({ step, shortLabel }) => {
          const isCurrent = step === currentStep
          const isDone = step < currentStep
          const canJump = step <= highestStepReached && step !== currentStep

          return (
            <li key={step}>
              <button
                type="button"
                disabled={!canJump}
                onClick={() => {
                  if (canJump) onSelectStep(step)
                }}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex w-full items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-semibold transition-colors sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${
                  isCurrent
                    ? 'border-coral bg-coral-soft text-charcoal'
                    : isDone
                      ? 'cursor-pointer border-forest/20 bg-sage-mist text-forest hover:border-forest/40'
                      : canJump
                        ? 'cursor-pointer border-hairline bg-paper text-slate hover:bg-sand/60'
                        : 'cursor-default border-hairline/70 bg-paper/50 text-stone/70'
                }`}
              >
                {isDone ? (
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-forest" />
                ) : (
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      isCurrent
                        ? 'bg-coral text-paper'
                        : 'bg-sand text-slate'
                    }`}
                  >
                    {step}
                  </span>
                )}
                <span className="hidden truncate sm:inline">{shortLabel}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
