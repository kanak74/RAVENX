import {
  ArrowRightIcon,
  CheckCircleIcon,
  HeartIcon,
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
  assessmentPreviewOpen: boolean
  onEditStep: (step: CheckInStep) => void
  onBack: () => void
  onContinueToAssessment: () => void
  onCloseAssessmentPreview: () => void
  onStartOver: () => void
  onBackToHome: () => void
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
  assessmentPreviewOpen,
  onEditStep,
  onBack,
  onContinueToAssessment,
  onCloseAssessmentPreview,
  onStartOver,
  onBackToHome,
}: Step4ReviewAnswersProps) {
  const selectedLabels = data.selectedIds
    .map((id) => getSymptomById(id)?.label)
    .filter((label): label is string => Boolean(label))

  const relevantQuestions = getContextualQuestions(data.selectedIds)

  if (assessmentPreviewOpen) {
    return (
      <div className="rounded-3xl border border-hairline bg-paper p-7 text-center shadow-[0_14px_38px_-14px_rgba(30,36,33,0.08)] sm:p-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-soft text-coral">
          <HeartIcon className="h-6 w-6" />
        </div>

        <div className="mt-4">
          <Badge tone="sand">Stage 4 · Coming Next</Badge>
        </div>

        <h1 className="mt-4 font-display text-3xl font-semibold text-charcoal sm:text-4xl">
          Assessment coming in Stage 4
        </h1>

        <p className="mx-auto mt-3.5 max-w-xl text-base leading-relaxed text-slate">
          Your check-in answers are neatly summarized, and{' '}
          <strong>no automated medical assessment has been run yet</strong>. In
          Stage 4, VITALORA will turn these details into clear health
          information, everyday precautions, and guidance on when to visit a
          doctor.
        </p>

        <div className="mx-auto mt-6 max-w-xl rounded-xl border border-forest/20 bg-sage-mist px-5 py-3.5 text-sm font-medium text-forest">
          VITALORA provides informational guidance only — never a medical
          diagnosis or replacement for professional care.
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Button variant="coral" size="lg" onClick={onCloseAssessmentPreview}>
            Review or edit answers
          </Button>
          <Button variant="outline" size="lg" onClick={onStartOver}>
            Start new check-in
          </Button>
          <Button variant="ghost" size="lg" onClick={onBackToHome}>
            Back to VITALORA home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div className="space-y-2.5">
        <Badge tone="forest" dotColor="#1E4D3B">
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
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="forest"
          size="lg"
          onClick={onContinueToAssessment}
          rightIcon={<ArrowRightIcon className="h-4 w-4" />}
        >
          Continue to assessment
        </Button>
      </div>
    </div>
  )
}
