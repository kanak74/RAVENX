import { useMemo, useState } from 'react'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CloseIcon,
} from '../../components/illustrations/Icons'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import {
  SYMPTOM_CATEGORIES,
  filterSymptoms,
  getSymptomById,
} from './symptomCatalog'

export interface Step1SelectSymptomsProps {
  selectedIds: string[]
  onToggleSymptom: (id: string) => void
  onContinue: () => void
}

/** Step 1: Searchable, categorized, touch-friendly symptom selector. */
export function Step1SelectSymptoms({
  selectedIds,
  onToggleSymptom,
  onContinue,
}: Step1SelectSymptomsProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSymptoms = useMemo(
    () => filterSymptoms(searchQuery),
    [searchQuery],
  )

  const selectedItems = useMemo(
    () =>
      selectedIds
        .map((id) => getSymptomById(id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [selectedIds],
  )

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge tone="coral" dotColor="#FF7B61">
          Step 1 of 4 · Tell us how you feel
        </Badge>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          What symptoms are bothering you today?
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-cocoa sm:text-lg">
          Tap as many as apply — or tap again to remove one. If you are just
          looking around, you can press <strong>Continue</strong> right away.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <label htmlFor="symptom-search" className="sr-only">
          Search symptoms
        </label>
        <input
          id="symptom-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search symptoms (e.g. fever, headache, tummy, cough)..."
          className="min-h-[54px] w-full rounded-full border-2 border-border-warm bg-warm-white pl-6 pr-24 text-base font-bold text-ink placeholder:font-semibold placeholder:text-taupe focus:border-[#E3593F] focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep"
        />
        {searchQuery.trim() ? (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 inline-flex min-h-[38px] -translate-y-1/2 cursor-pointer items-center gap-1 rounded-full border border-border-warm bg-linen px-3.5 text-sm font-extrabold text-ink hover:bg-butter-soft"
          >
            <CloseIcon className="h-4 w-4" />
            <span>Clear</span>
          </button>
        ) : null}
      </div>

      {/* Selected symptoms quick-edit bar */}
      {selectedItems.length > 0 ? (
        <div
          aria-label="Selected symptoms"
          className="rounded-3xl border-2 border-green/30 bg-green-soft/65 p-4 sm:p-5"
        >
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <span className="text-sm font-extrabold text-[#194E35]">
              Selected ({selectedItems.length}) — tap any tag to remove
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleSymptom(item.id)}
                aria-label={`Remove ${item.label}`}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border-2 border-green/40 bg-warm-white px-4 py-1.5 text-sm font-extrabold text-ink transition-colors hover:bg-tomato-soft hover:border-tomato/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep"
              >
                <span>{item.label}</span>
                <CloseIcon className="h-3.5 w-3.5 text-cocoa" />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Categorized symptoms list */}
      {filteredSymptoms.length === 0 ? (
        <div className="rounded-3xl border-2 border-border-warm bg-warm-white p-8 text-center">
          <p className="font-display text-xl font-bold text-ink">
            No symptoms matched &ldquo;{searchQuery.trim()}&rdquo;
          </p>
          <p className="mt-2 text-base text-cocoa">
            Try everyday words like &ldquo;headache&rdquo;, &ldquo;fever&rdquo;,
            &ldquo;stomach&rdquo;, or clear the search box to browse all options.
          </p>
          <div className="mt-5">
            <Button
              variant="outline"
              size="md"
              onClick={() => setSearchQuery('')}
            >
              Show all symptoms
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {SYMPTOM_CATEGORIES.map((category) => {
            const categoryItems = filteredSymptoms.filter(
              (item) => item.category === category.id,
            )
            if (categoryItems.length === 0) return null

            return (
              <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                <div className="mb-3 flex flex-wrap items-baseline gap-2.5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${category.badgeBg}`}
                  >
                    {category.title}
                  </span>
                  <h2
                    id={`cat-${category.id}`}
                    className="sr-only"
                  >
                    {category.title}
                  </h2>
                  <span className="text-sm font-semibold text-cocoa">
                    {category.description}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryItems.map((symptom) => {
                    const isSelected = selectedIds.includes(symptom.id)
                    return (
                      <button
                        key={symptom.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onToggleSymptom(symptom.id)}
                        className={`flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep ${
                          isSelected
                            ? `${category.selectedStyle} shadow-[0_4px_0_0_rgba(38,33,29,0.08)]`
                            : 'border-border-warm bg-warm-white text-ink hover:border-[#D9C5B2] hover:bg-linen/70'
                        }`}
                      >
                        <div>
                          <span className="block text-base font-extrabold leading-snug text-ink">
                            {symptom.label}
                          </span>
                          {symptom.helperText ? (
                            <span className="mt-0.5 block text-xs font-semibold text-cocoa">
                              {symptom.helperText}
                            </span>
                          ) : null}
                        </div>

                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? 'border-ink bg-warm-white text-green'
                              : 'border-border-warm bg-cream text-transparent'
                          }`}
                          aria-hidden="true"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* Bottom action bar */}
      <div className="flex flex-col-reverse items-stretch justify-between gap-4 border-t-2 border-border-warm pt-6 sm:flex-row sm:items-center">
        <p className="text-sm font-bold text-taupe">
          {selectedIds.length === 0
            ? 'No symptoms selected yet — you can still continue to explore.'
            : `${selectedIds.length} symptom${selectedIds.length === 1 ? '' : 's'} selected`}
        </p>
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
