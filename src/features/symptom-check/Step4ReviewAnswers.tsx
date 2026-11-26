import {
  ArrowRightIcon,
  CheckCircleIcon,
} from '../../components/illustrations/Icons'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import type { CheckInStep } from './CheckInProgress'
import { getContextualQuestions } from './contextualQuestions'
import {
  DURATION_OPTIONS,
  PROGRESSION_OPTIONS,
  SEVERITY_OPTIONS,
} from './Step2SymptomDetails'
import { getSymptomById } from './symptomCatalog'
import type { SymptomCheckInData } from './types'

export interface Step4ReviewAnswersProps {
  data: SymptomCheckInData
  onEditStep: (step: CheckInStep) => void
  onBack: () => void
  onContinueToAssessment: () => void
  onStartOver: () => void
}

function getOptionLabel(
  options: { value: string; label: string }[],
  value: string | undefined,
): string {
  if (!value) return 'Not specified'
  return options.find((opt) => opt.value === value)?.label ?? value
}

/** Step 4: Clean summary sheet with quick edit controls and honest Stage 4 handoff. */
export function Step4ReviewAnswers({
  data,
  onEditStep,
  onBack,
  onContinueToAssessment,
  onStartOver,
}: Step4ReviewAnswersProps) {
  const selectedLabels = data.selectedIds
    .map((id) => getSymptomById(id)?.label)
    .filter((label): label is string => Boolean(label))

  const relevantQuestions = getContextualQuestions(data.selectedIds)

  const confirmedNaturalSuggestions = data.naturalDescription.suggestions.filter(
    (s) => s.confirmed,
  )

  return (
    <div className="space-y-7">
      <div className="space-y-2.5">
        <Badge tone="forest" dotColor="#174B42">
          Step 4 of 4 · Review answers
        </Badge>
        <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">
          Review your summary before continuing
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate">
          Check that everything reflects how you feel. Use <strong>Edit</strong>{' '}
          next to any section to make changes.
        </p>
      </div>

      <div className="divide-y divide-hairline rounded-2xl border border-hairline bg-paper">
        {/* Selected symptoms */}
        <section className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-charcoal sm:text-xl">
              Selected symptoms
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep(1)}
            >
              Edit symptoms
            </Button>
          </div>

          {selectedLabels.length > 0 ? (
            <div className="mt-3.5 flex flex-wrap gap-2">
              {selectedLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-sage-mist px-3.5 py-1 text-sm font-semibold text-forest"
                >
                  <CheckCircleIcon className="h-3.5 w-3.5 text-forest" />
                  <span>{label}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm font-medium text-slate">
              No specific symptoms selected (exploring mode).
            </p>
          )}

          {confirmedNaturalSuggestions.length > 0 ? (
            <div className="mt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone">
                Confirmed from your description
              </p>
              <div className="flex flex-wrap gap-2">
                {confirmedNaturalSuggestions.map((s) => (
                  <span
                    key={s.symptomId}
                    className="inline-flex items-center gap-1.5 rounded-full border border-sage/40 bg-sage-mist/60 px-3 py-1 text-xs font-semibold text-forest"
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {data.naturalDescription.rawText.trim() ? (
            <div className="mt-3 rounded-xl border border-hairline bg-ivory px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone">
                Your description
              </p>
              <p className="mt-1 text-sm text-slate italic">
                &ldquo;{data.naturalDescription.rawText.trim()}&rdquo;
              </p>
            </div>
          ) : null}
        </section>

        {/* Symptom details */}
        <section className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-charcoal sm:text-xl">
              Symptom details
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep(2)}
            >
              Edit details
            </Button>
          </div>

          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-hairline bg-ivory p-3.5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-stone">
                When it started
              </dt>
              <dd className="mt-1 text-sm font-semibold text-charcoal sm:text-base">
                {getOptionLabel(DURATION_OPTIONS, data.details.duration)}
              </dd>
            </div>
            <div className="rounded-xl border border-hairline bg-ivory p-3.5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-stone">
                Severity
              </dt>
              <dd className="mt-1 text-sm font-semibold text-charcoal sm:text-base">
                {getOptionLabel(SEVERITY_OPTIONS, data.details.severity)}
              </dd>
            </div>
            <div className="rounded-xl border border-hairline bg-ivory p-3.5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-stone">
                How it is changing
              </dt>
              <dd className="mt-1 text-sm font-semibold text-charcoal sm:text-base">
                {getOptionLabel(PROGRESSION_OPTIONS, data.details.progression)}
              </dd>
            </div>
          </dl>

          {/* Fever / temperature summary */}
          {data.feverCheck.sensations.length > 0 || data.feverCheck.measurementStatus ? (
            <div className="mt-3 rounded-xl border border-coral/15 bg-coral-soft/30 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-coral">
                Fever / Temperature
              </p>
              {data.feverCheck.sensations.length > 0 ? (
                <p className="mt-1 text-sm text-charcoal">
                  Sensations: {data.feverCheck.sensations.map((s) => s.replace(/-/g, ' ')).join(', ')}
                </p>
              ) : null}
              {data.feverCheck.measuredTemperature?.value ? (
                <p className="mt-0.5 text-sm text-charcoal">
                  Measured: {data.feverCheck.measuredTemperature.value}°{data.feverCheck.measuredTemperature.unit}
                  {data.feverCheck.measuredTemperature.site ? ` (${data.feverCheck.measuredTemperature.site})` : ''}
                  {' '}— <span className="text-xs text-stone italic">Unverified self-entered reading</span>
                </p>
              ) : null}
            </div>
          ) : null}

          {/* Health measurements summary */}
          {(data.measurements.bloodPressure || data.measurements.heartRate || data.measurements.spo2) ? (
            <div className="mt-3 rounded-xl border border-hairline bg-ivory px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone">
                Health readings <span className="font-normal text-stone/70">(unverified)</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {data.measurements.bloodPressure?.systolic ? (
                  <span className="text-charcoal">BP: {data.measurements.bloodPressure.systolic}/{data.measurements.bloodPressure.diastolic} mmHg</span>
                ) : null}
                {data.measurements.heartRate ? (
                  <span className="text-charcoal">HR: {data.measurements.heartRate} bpm</span>
                ) : null}
                {data.measurements.spo2 ? (
                  <span className="text-charcoal">SpO2: {data.measurements.spo2}%</span>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        {/* Follow-up answers */}
        <section className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-charcoal sm:text-xl">
              Additional answers
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep(3)}
            >
              Edit questions
            </Button>
          </div>

          {relevantQuestions.length === 0 ? (
            <p className="mt-3 text-sm font-medium text-slate">No follow-up questions for your selected symptoms.</p>
          ) : (
            <dl className="mt-4 space-y-2.5">
              {relevantQuestions.map((question) => {
                const rawAnswer = data.contextualAnswers[question.id]
                const displayAnswer =
                  rawAnswer === 'skipped'
                    ? 'Skipped'
                    : rawAnswer
                      ? getOptionLabel(question.options, rawAnswer)
                      : 'Not answered'

                return (
                  <div
                    key={question.id}
                    className="flex flex-col justify-between gap-1 rounded-xl border border-hairline bg-ivory px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <dt className="text-sm font-medium text-slate">
                      {question.question}
                    </dt>
                    <dd className="shrink-0 text-sm font-semibold text-charcoal">
                      {displayAnswer}
                    </dd>
                  </div>
                )
              })}
            </dl>
          )}
        </section>
      </div>

      {/* Disclaimer notice */}
      <div className="rounded-xl border border-forest/20 bg-sage-mist px-5 py-3.5 text-sm font-medium text-forest">
        VITALORA provides informational guidance only — never a medical diagnosis or replacement for professional care.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button variant="ghost" size="sm" onClick={onStartOver}>
            Start over
          </Button>
        </div>
        <Button
          variant="forest"
          size="lg"
          onClick={onContinueToAssessment}
          rightIcon={<ArrowRightIcon className="h-4 w-4" />}
        >
          Get my assessment
        </Button>
      </div>
    </div>
  )
}
