import { ArrowRightIcon, CheckCircleIcon } from '../../components/illustrations/Icons'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { getContextualQuestions } from './contextualQuestions'
import type { ContextualAnswersMap } from './types'

export interface Step3ContextualQuestionsProps {
  selectedIds: string[]
  answers: ContextualAnswersMap
  onSelectAnswer: (questionId: string, value: string | undefined) => void
  onSkipAll: () => void
  onBack: () => void
  onContinue: () => void
}

/** Step 3: Up to 4 symptom-specific follow-up questions, all optionally skippable. */
export function Step3ContextualQuestions({
  selectedIds,
  answers,
  onSelectAnswer,
  onSkipAll,
  onBack,
  onContinue,
}: Step3ContextualQuestionsProps) {
  const questions = getContextualQuestions(selectedIds)

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge tone="pink" dotColor="#FF7B61">
          Step 3 of 4 · Quick follow-ups
        </Badge>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Just {questions.length === 1 ? 'one quick question' : `${questions.length} quick questions`} to understand better
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-cocoa sm:text-lg">
          These help add helpful context. Every question here is optional — tap{' '}
          <strong>Skip</strong> on any question you prefer not to answer.
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const currentValue = answers[q.id]
          const isSkipped = currentValue === 'skipped'

          return (
            <fieldset
              key={q.id}
              className="rounded-[2rem] border-2 border-border-warm bg-warm-white p-5 sm:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-taupe">
                    Question {index + 1} of {questions.length}
                  </span>
                  <legend className="font-display text-xl font-bold text-ink sm:text-2xl">
                    {q.question}
                  </legend>
                  {q.helper ? (
                    <p className="text-sm font-semibold text-cocoa">
                      {q.helper}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  aria-pressed={isSkipped}
                  onClick={() =>
                    onSelectAnswer(q.id, isSkipped ? undefined : 'skipped')
                  }
                  className={`min-h-[38px] shrink-0 cursor-pointer rounded-full border-2 px-4 py-1.5 text-sm font-extrabold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep ${
                    isSkipped
                      ? 'border-[#D4A22B] bg-butter-soft text-ink'
                      : 'border-border-warm bg-cream text-cocoa hover:bg-linen'
                  }`}
                >
                  {isSkipped ? 'Skipped ✓' : 'Skip this question'}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {q.options.map((opt) => {
                  const isSelected = currentValue === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        onSelectAnswer(q.id, isSelected ? undefined : opt.value)
                      }
                      className={`flex min-h-[52px] cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base font-extrabold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep ${
                        isSelected
                          ? 'border-green bg-green-soft text-ink shadow-[0_3px_0_0_#2C875C]'
                          : 'border-border-warm bg-cream text-ink hover:bg-linen/80'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected ? (
                        <CheckCircleIcon className="h-5 w-5 shrink-0 text-green" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-border-warm pt-6">
        <Button variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="lg" onClick={onSkipAll}>
            Skip all
          </Button>
          <Button
            variant="coral"
            size="lg"
            onClick={onContinue}
            rightIcon={<ArrowRightIcon className="h-5 w-5" />}
          >
            Continue to review
          </Button>
        </div>
      </div>
    </div>
  )
}
