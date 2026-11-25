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

/** Step 4: Editable answer summary and honest Stage 4 assessment handoff. */
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
      <div className="rounded-[2.25rem] border-2 border-border-warm bg-warm-white p-7 text-center shadow-[0_8px_0_0_rgba(38,33,29,0.06)] sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-butter-soft text-coral-deep">
          <HeartIcon className="h-7 w-7" />
        </div>

        <div className="mt-4">
          <Badge tone="butter" dotColor="#D4A22B">
            Stage 4 · Coming Next
          </Badge>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
          Assessment coming in Stage 4
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-cocoa sm:text-lg">
          Your check-in answers are neatly gathered, and{' '}
          <strong>no automated medical assessment has been run yet</strong>. In
          Stage 4, VITALORA will use these details to share calm possible
          causes, everyday precautions, and clear advice on when to visit a
          doctor.
        </p>

        <div className="mx-auto mt-6 max-w-xl rounded-2xl border-2 border-green/25 bg-green-soft/60 px-5 py-4 text-sm font-bold text-[#194E35]">
          Remember: VITALORA provides informational health guidance only — never
          a medical diagnosis or replacement for a doctor.
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge tone="green" dotColor="#2C875C">
          Step 4 of 4 · Review your answers
        </Badge>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Take a quick look before continuing
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-cocoa sm:text-lg">
          Make sure everything looks right. Tap <strong>Edit</strong> next to
          any part if you want to change something.
        </p>
      </div>

      <div className="space-y-5">
        {/* Selected symptoms */}
        <section className="rounded-3xl border-2 border-border-warm bg-warm-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-ink">
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
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-green/30 bg-green-soft px-3.5 py-1.5 text-sm font-extrabold text-ink"
                >
                  <CheckCircleIcon className="h-4 w-4 text-green" />
                  <span>{label}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-base font-semibold text-cocoa">
              No specific symptoms selected (exploring mode).
            </p>
          )}
        </section>

        {/* Symptom details */}
        <section className="rounded-3xl border-2 border-border-warm bg-warm-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-ink">
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

          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-cream p-4">
              <dt className="text-xs font-extrabold uppercase tracking-wider text-taupe">
                When it started
              </dt>
              <dd className="mt-1 text-base font-extrabold text-ink">
                {getOptionLabel(DURATION_OPTIONS, data.details.duration)}
              </dd>
            </div>
            <div className="rounded-2xl bg-cream p-4">
              <dt className="text-xs font-extrabold uppercase tracking-wider text-taupe">
                Severity
              </dt>
              <dd className="mt-1 text-base font-extrabold text-ink">
                {getOptionLabel(SEVERITY_OPTIONS, data.details.severity)}
              </dd>
            </div>
            <div className="rounded-2xl bg-cream p-4">
              <dt className="text-xs font-extrabold uppercase tracking-wider text-taupe">
                How it is changing
              </dt>
              <dd className="mt-1 text-base font-extrabold text-ink">
                {getOptionLabel(PROGRESSION_OPTIONS, data.details.progression)}
              </dd>
            </div>
          </dl>
        </section>

        {/* Follow-up answers */}
        <section className="rounded-3xl border-2 border-border-warm bg-warm-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-ink">
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

          <dl className="mt-4 space-y-3">
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
                  className="flex flex-col justify-between gap-1 rounded-2xl bg-cream px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <dt className="text-sm font-bold text-cocoa">
                    {question.question}
                  </dt>
                  <dd className="shrink-0 text-sm font-extrabold text-ink">
                    {displayAnswer}
                  </dd>
                </div>
              )
            })}
          </dl>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-border-warm pt-6">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="coral"
          size="lg"
          onClick={onContinueToAssessment}
          rightIcon={<ArrowRightIcon className="h-5 w-5" />}
        >
          Continue to assessment
        </Button>
      </div>
    </div>
  )
}
