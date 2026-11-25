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

/** Step 3: Up to 4 focused follow-up questions with clean skip controls. */
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
    <div className="space-y-7">
      <div className="space-y-2.5">
        <Badge tone="forest" dotColor="#1E4D3B">
          Step 3 of 4 · Follow-up questions
        </Badge>
        <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">
          Just {questions.length === 1 ? 'one quick question' : `${questions.length} quick questions`}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate">
          These add helpful context based on what you selected. Every question
          is optional — feel free to skip any you prefer not to answer.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => {
          const currentValue = answers[q.id]
          const isSkipped = currentValue === 'skipped'

          return (
            <fieldset
              key={q.id}
              className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone">
                    Question {index + 1} of {questions.length}
                  </span>
                  <legend className="font-display text-lg font-semibold text-charcoal sm:text-xl">
                    {q.question}
                  </legend>
                  {q.helper ? (
                    <p className="text-sm text-slate">{q.helper}</p>
                  ) : null}
                </div>

                <button
                  type="button"
                  aria-pressed={isSkipped}
                  onClick={() =>
                    onSelectAnswer(q.id, isSkipped ? undefined : 'skipped')
                  }
                  className={`min-h-[34px] shrink-0 cursor-pointer rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${
                    isSkipped
                      ? 'border-amber-ink/30 bg-amber-soft text-amber-ink'
                      : 'border-hairline bg-ivory text-slate hover:bg-sand hover:text-charcoal'
                  }`}
                >
                  {isSkipped ? 'Skipped ✓' : 'Skip this question'}
                </button>
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
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
                      className={`flex min-h-[48px] cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors sm:text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${
                        isSelected
                          ? 'border-forest bg-sage-mist text-forest'
                          : 'border-hairline bg-ivory/70 text-charcoal hover:border-hairline-strong hover:bg-sand/60'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected ? (
                        <CheckCircleIcon className="h-4 w-4 shrink-0 text-forest" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
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
            rightIcon={<ArrowRightIcon className="h-4 w-4" />}
          >
            Continue to review
          </Button>
        </div>
      </div>
    </div>
  )
}
