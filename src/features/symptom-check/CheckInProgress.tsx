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
  { step: 3, shortLabel: 'Questions' },
  { step: 4, shortLabel: 'Review' },
]

/** Friendly 4-step progress indicator showing where the user is in the check-in. */
export function CheckInProgress({
  currentStep,
  highestStepReached,
  onSelectStep,
}: CheckInProgressProps) {
  return (
    <nav aria-label="Check-in steps" className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm font-extrabold text-cocoa sm:hidden">
        <span>Step {currentStep} of 4</span>
        <span>{STEPS[currentStep - 1].shortLabel}</span>
      </div>

      <ol className="grid grid-cols-4 gap-2 sm:gap-3">
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
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 px-2.5 py-2.5 text-sm font-extrabold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep ${
                  isCurrent
                    ? 'border-[#E3593F] bg-coral text-ink shadow-[0_3px_0_0_#E3593F]'
                    : isDone
                      ? 'cursor-pointer border-green/35 bg-green-soft text-[#194E35] hover:bg-green-soft/80'
                      : canJump
                        ? 'cursor-pointer border-border-warm bg-warm-white text-cocoa hover:bg-linen'
                        : 'cursor-default border-border-warm bg-warm-white/60 text-taupe'
                }`}
              >
                {isDone ? (
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-green" />
                ) : (
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                      isCurrent
                        ? 'bg-warm-white text-ink'
                        : 'bg-linen text-cocoa'
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
