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
    { value: 'mild', label: 'Mild', hint: 'Noticeable, easy to manage' },
    {
      value: 'moderate',
      label: 'Moderate',
      hint: 'Uncomfortable or slowing you down',
    },
    { value: 'severe', label: 'Severe', hint: 'Very strong or hard to manage' },
  ]

export const PROGRESSION_OPTIONS: {
  value: SymptomProgression
  label: string
}[] = [
    { value: 'better', label: 'Getting better' },
    { value: 'same', label: 'Staying the same' },
    { value: 'worse', label: 'Getting worse' },
  ]

/** Step 2: Clean, focused questions for timing, severity, and progression. */
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
      <div className="space-y-2.5">
        <Badge tone="coral" dotColor="#C25941">
          Step 2 of 4 · Symptom details
        </Badge>
        <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">
          A little context on how things feel
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate">
          {hasSelectedSymptoms
            ? 'Choose the answers that fit best. Tap a choice again to clear it, or leave anything blank if unsure.'
            : 'Exploring without symptoms selected — feel free to try these options or move ahead.'}
        </p>
      </div>

      <div className="divide-y divide-hairline rounded-2xl border border-hairline bg-paper px-5 sm:px-7">
        {/* Question 1: Duration */}
        <fieldset className="space-y-3.5 py-6">
          <legend className="font-display text-lg font-semibold text-charcoal sm:text-xl">
            1. When did it start?
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {DURATION_OPTIONS.map((option) => {
              const isSelected = details.duration === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleDuration(option.value)}
                  className={`flex min-h-[48px] cursor-pointer items-center rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors sm:text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${isSelected
                    ? 'border-coral bg-coral-soft/75 text-charcoal'
                    : 'border-hairline bg-ivory/70 text-charcoal hover:border-hairline-strong hover:bg-sand/60'
                    }`}
                >
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Question 2: Severity */}
        <fieldset className="space-y-3.5 py-6">
          <legend className="font-display text-lg font-semibold text-charcoal sm:text-xl">
            2. How severe does it feel?
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {SEVERITY_OPTIONS.map((option) => {
              const isSelected = details.severity === option.value
              const selectedClasses =
                option.value === 'severe'
                  ? 'border-urgent bg-urgent-soft text-charcoal'
                  : 'border-coral bg-coral-soft/75 text-charcoal'

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleSeverity(option.value)}
                  className={`flex min-h-[66px] cursor-pointer flex-col justify-center rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${isSelected
                    ? selectedClasses
                    : 'border-hairline bg-ivory/70 text-charcoal hover:border-hairline-strong hover:bg-sand/60'
                    }`}
                >
                  <span className="text-sm font-semibold text-charcoal sm:text-[15px]">
                    {option.label}
                  </span>
                  <span className="mt-0.5 text-xs text-stone">
                    {option.hint}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Question 3: Progression */}
        <fieldset className="space-y-3.5 py-6">
          <legend className="font-display text-lg font-semibold text-charcoal sm:text-xl">
            3. Is it getting better, worse, or staying the same?
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {PROGRESSION_OPTIONS.map((option) => {
              const isSelected = details.progression === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleProgression(option.value)}
                  className={`flex min-h-[48px] cursor-pointer items-center rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors sm:text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${isSelected
                    ? 'border-forest bg-sage-mist text-forest'
                    : 'border-hairline bg-ivory/70 text-charcoal hover:border-hairline-strong hover:bg-sand/60'
                    }`}
                >
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="forest"
          size="lg"
          onClick={onContinue}
          rightIcon={<ArrowRightIcon className="h-4 w-4" />}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
