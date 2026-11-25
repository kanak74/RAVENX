import { ArrowRightIcon } from '../../components/illustrations/Icons'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import type {
  SymptomDetailsState,
  SymptomDuration,
  SymptomProgression,
  SymptomSeverity,
} from './types'

export interface Step2SymptomDetailsProps {
  details: SymptomDetailsState
  hasSelectedSymptoms: boolean
  onChangeDetails: (next: SymptomDetailsState) => void
  onBack: () => void
  onContinue: () => void
}

export const DURATION_OPTIONS: { value: SymptomDuration; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'two-to-three-days', label: '2–3 days ago' },
  { value: 'week-or-more', label: 'A week or more ago' },
]

export const SEVERITY_OPTIONS: {
  value: SymptomSeverity
  label: string
  hint: string
}[] = [
  { value: 'mild', label: 'Mild', hint: 'Noticeable, still easy to manage' },
  {
    value: 'moderate',
    label: 'Moderate',
    hint: 'Uncomfortable or slowing you down',
  },
  { value: 'severe', label: 'Severe', hint: 'Very strong or hard to cope with' },
]

export const PROGRESSION_OPTIONS: {
  value: SymptomProgression
  label: string
}[] = [
  { value: 'better', label: 'Getting better' },
  { value: 'same', label: 'Staying the same' },
  { value: 'worse', label: 'Getting worse' },
]

/** Step 2: Three clear, plain-language questions about timing, severity, and trend. */
export function Step2SymptomDetails({
  details,
  hasSelectedSymptoms,
  onChangeDetails,
  onBack,
  onContinue,
}: Step2SymptomDetailsProps) {
  const toggleDuration = (value: SymptomDuration) => {
    onChangeDetails({
      ...details,
      duration: details.duration === value ? undefined : value,
    })
  }

  const toggleSeverity = (value: SymptomSeverity) => {
    onChangeDetails({
      ...details,
      severity: details.severity === value ? undefined : value,
    })
  }

  const toggleProgression = (value: SymptomProgression) => {
    onChangeDetails({
      ...details,
      progression: details.progression === value ? undefined : value,
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge tone="butter" dotColor="#D4A22B">
          Step 2 of 4 · A few quick details
        </Badge>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Tell us a little more about how it feels
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-cocoa sm:text-lg">
          {hasSelectedSymptoms
            ? 'Tap the answers that fit best. You can leave anything blank if you are unsure.'
            : 'Since you are exploring without selecting symptoms, feel free to try these choices or skip ahead.'}
        </p>
      </div>

      {/* Question 1: Duration */}
      <fieldset className="space-y-3">
        <legend className="font-display text-xl font-bold text-ink sm:text-2xl">
          1. When did it start?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {DURATION_OPTIONS.map((option) => {
            const isSelected = details.duration === option.value
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleDuration(option.value)}
                className={`flex min-h-[54px] cursor-pointer items-center justify-between rounded-2xl border-2 px-5 py-3 text-left text-base font-extrabold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep ${
                  isSelected
                    ? 'border-[#D4A22B] bg-butter-soft text-ink shadow-[0_3px_0_0_#D4A22B]'
                    : 'border-border-warm bg-warm-white text-ink hover:bg-linen/70'
                }`}
              >
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Question 2: Severity */}
      <fieldset className="space-y-3">
        <legend className="font-display text-xl font-bold text-ink sm:text-2xl">
          2. How severe does it feel right now?
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {SEVERITY_OPTIONS.map((option) => {
            const isSelected = details.severity === option.value
            const selectedClasses =
              option.value === 'severe'
                ? 'border-tomato bg-tomato-soft text-ink shadow-[0_3px_0_0_#AC2C21]'
                : 'border-[#E3593F] bg-coral-soft text-ink shadow-[0_3px_0_0_#E3593F]'

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleSeverity(option.value)}
                className={`flex min-h-[72px] cursor-pointer flex-col justify-center rounded-2xl border-2 px-5 py-3 text-left transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep ${
                  isSelected
                    ? selectedClasses
                    : 'border-border-warm bg-warm-white text-ink hover:bg-linen/70'
                }`}
              >
                <span className="text-base font-extrabold text-ink">
                  {option.label}
                </span>
                <span className="mt-0.5 text-xs font-semibold text-cocoa">
                  {option.hint}
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Question 3: Progression */}
      <fieldset className="space-y-3">
        <legend className="font-display text-xl font-bold text-ink sm:text-2xl">
          3. Is it getting better, worse, or staying the same?
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {PROGRESSION_OPTIONS.map((option) => {
            const isSelected = details.progression === option.value
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleProgression(option.value)}
                className={`flex min-h-[54px] cursor-pointer items-center rounded-2xl border-2 px-5 py-3 text-left text-base font-extrabold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep ${
                  isSelected
                    ? 'border-green bg-green-soft text-ink shadow-[0_3px_0_0_#2C875C]'
                    : 'border-border-warm bg-warm-white text-ink hover:bg-linen/70'
                }`}
              >
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-border-warm pt-6">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="coral"
          size="lg"
          onClick={onContinue}
          rightIcon={<ArrowRightIcon className="h-5 w-5" />}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
