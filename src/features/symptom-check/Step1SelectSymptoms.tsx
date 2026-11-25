import { useMemo, useState } from 'react'
import { AnatomicalBodySvg } from '../../components/illustrations/AnatomicalBodySvg'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CloseIcon,
  SearchIcon,
} from '../../components/illustrations/Icons'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import {
  BODY_REGIONS,
  BODY_REGION_MAP,
  getRegionsForSymptomIds,
  type BodyRegionId,
} from './bodyRegions'
import {
  SYMPTOM_CATEGORIES,
  filterSymptoms,
  getSymptomById,
} from './symptomCatalog'
import type { SymptomCategoryId } from './types'

export interface Step1SelectSymptomsProps {
  selectedIds: string[]
  onToggleSymptom: (id: string) => void
  onContinue: () => void
}

const CATEGORY_DOT: Record<SymptomCategoryId, string> = {
  'head-breathing': 'bg-coral-accent',
  stomach: 'bg-[#C48B3B]',
  'body-skin': 'bg-forest',
  'sleep-mood': 'bg-sage',
  urgent: 'bg-urgent',
}

/** Step 1: Searchable symptom selector paired with a live anatomical body-region visualizer. */
export function Step1SelectSymptoms({
  selectedIds,
  onToggleSymptom,
  onContinue,
}: Step1SelectSymptomsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState<BodyRegionId | null>(null)

  const filteredSymptoms = useMemo(() => {
    const queryMatches = filterSymptoms(searchQuery)
    if (!regionFilter || searchQuery.trim()) return queryMatches

    const regionDef = BODY_REGION_MAP.get(regionFilter)
    if (!regionDef) return queryMatches
    return queryMatches.filter(
      (item) => regionDef.symptomIds.includes(item.id) || item.isEmergencyRedFlag,
    )
  }, [searchQuery, regionFilter])

  const selectedItems = useMemo(
    () =>
      selectedIds
        .map((id) => getSymptomById(id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [selectedIds],
  )

  const { activeRegions, urgentRegions } = useMemo(
    () => getRegionsForSymptomIds(selectedIds),
    [selectedIds],
  )

  const handleToggleRegionFilter = (regionId: BodyRegionId) => {
    setRegionFilter((prev) => (prev === regionId ? null : regionId))
  }

  return (
    <div className="space-y-7">
      <div className="space-y-2.5">
        <Badge tone="forest" dotColor="#174B42">
          Step 1 of 4 · Symptoms
        </Badge>
        <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">
          What symptoms are bothering you today?
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate">
          Select everything that feels relevant, filter by body area on the map,
          or press <strong>Continue</strong> at any time to explore.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-12">
        {/* Main Interactive Search & Symptom Catalog */}
        <div className="space-y-6 lg:col-span-8">
          {/* Search bar */}
          <div className="relative">
            <label htmlFor="symptom-search" className="sr-only">
              Search symptoms
            </label>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
            <input
              id="symptom-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms in plain words (e.g. fever, headache, tummy, cough)..."
              className="min-h-[50px] w-full rounded-2xl border border-hairline-strong bg-paper pl-11 pr-24 text-sm font-medium text-charcoal placeholder:text-stone focus:border-coral focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral sm:text-base"
            />
            {searchQuery.trim() ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 inline-flex min-h-[34px] -translate-y-1/2 cursor-pointer items-center gap-1 rounded-xl border border-hairline bg-sand px-3 text-xs font-semibold text-charcoal transition-colors hover:bg-hairline"
              >
                <CloseIcon className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            ) : null}
          </div>

          {/* Quick Anatomical Region Filter Strip (for fast body-first navigation) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRegionFilter(null)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                regionFilter === null
                  ? 'border-forest bg-forest text-paper'
                  : 'border-hairline bg-paper text-slate hover:border-hairline-strong hover:text-charcoal'
              }`}
            >
              All areas
            </button>
            {BODY_REGIONS.map((reg) => {
              const active = regionFilter === reg.id
              return (
                <button
                  key={reg.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleToggleRegionFilter(reg.id)}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-coral bg-coral-soft text-coral'
                      : 'border-hairline bg-paper text-slate hover:border-hairline-strong hover:text-charcoal'
                  }`}
                >
                  {reg.shortLabel}
                </button>
              )
            })}
          </div>

          {/* Selected symptoms bar */}
          {selectedItems.length > 0 ? (
            <div
              aria-label="Selected symptoms"
              className="rounded-2xl border border-forest/20 bg-sage-mist/70 p-4"
            >
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-forest">
                Selected ({selectedItems.length}) — tap to remove
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggleSymptom(item.id)}
                    aria-label={`Remove ${item.label}`}
                    className="inline-flex min-h-[36px] cursor-pointer items-center gap-2 rounded-full border border-forest/25 bg-paper px-3.5 py-1 text-sm font-semibold text-charcoal transition-colors hover:border-urgent/40 hover:bg-urgent-soft hover:text-urgent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
                  >
                    <span>{item.label}</span>
                    <CloseIcon className="h-3.5 w-3.5 text-stone" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Categorized symptoms */}
          {filteredSymptoms.length === 0 ? (
            <div className="rounded-2xl border border-hairline bg-paper p-8 text-center">
              <p className="font-display text-xl font-semibold text-charcoal">
                No symptoms matched &ldquo;{searchQuery.trim()}&rdquo;
              </p>
              <p className="mt-2 text-sm text-slate sm:text-base">
                Try everyday words like &ldquo;headache&rdquo;, &ldquo;fever&rdquo;,
                &ldquo;stomach&rdquo;, or clear the search box to browse all
                choices.
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

                const isUrgentCategory = category.id === 'urgent'

                return (
                  <section
                    key={category.id}
                    aria-labelledby={`cat-${category.id}`}
                    className={
                      isUrgentCategory
                        ? 'rounded-2xl border border-urgent/25 bg-urgent-soft/45 p-4 sm:p-5'
                        : undefined
                    }
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2.5">
                      <span
                        className={`h-2 w-2 rounded-full ${CATEGORY_DOT[category.id]}`}
                        aria-hidden="true"
                      />
                      <h2
                        id={`cat-${category.id}`}
                        className={`font-sans text-sm font-semibold tracking-wide ${
                          isUrgentCategory ? 'text-urgent' : 'text-charcoal'
                        }`}
                      >
                        {category.title}
                      </h2>
                      <span className="text-xs text-stone">
                        — {category.description}
                      </span>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {categoryItems.map((symptom) => {
                        const isSelected = selectedIds.includes(symptom.id)
                        const activeClasses = isUrgentCategory
                          ? 'border-urgent bg-urgent-soft text-charcoal shadow-[0_2px_8px_rgba(184,58,50,0.12)]'
                          : 'border-coral bg-coral-soft/75 text-charcoal shadow-[0_2px_8px_rgba(196,83,59,0.1)]'

                        return (
                          <button
                            key={symptom.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => onToggleSymptom(symptom.id)}
                            className={`flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${
                              isSelected
                                ? activeClasses
                                : 'border-hairline bg-paper text-charcoal hover:border-hairline-strong hover:bg-sand/40'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="block text-sm font-semibold leading-snug text-charcoal sm:text-[15px]">
                                {symptom.label}
                              </span>
                              {symptom.helperText ? (
                                <span className="mt-0.5 block text-xs text-stone">
                                  {symptom.helperText}
                                </span>
                              ) : null}
                            </div>

                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                isSelected
                                  ? isUrgentCategory
                                    ? 'border-urgent bg-urgent text-paper'
                                    : 'border-coral bg-coral text-paper'
                                  : 'border-hairline-strong bg-ivory text-transparent'
                              }`}
                              aria-hidden="true"
                            >
                              <CheckCircleIcon className="h-3.5 w-3.5" />
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
        </div>

        {/* Live Desktop Anatomical Region Indicator */}
        <aside className="hidden lg:sticky lg:top-24 lg:col-span-4 lg:block">
          <div className="rounded-3xl border border-hairline bg-paper p-5 shadow-[0_18px_42px_-24px_rgba(24,32,30,0.12)]">
            <div className="flex items-center justify-between border-b border-hairline pb-3 text-xs">
              <span className="font-semibold uppercase tracking-[0.14em] text-stone">
                Body Map View
              </span>
              <span className="font-semibold text-forest">
                {regionFilter
                  ? BODY_REGION_MAP.get(regionFilter)?.shortLabel
                  : `${activeRegions.length || 0} active`}
              </span>
            </div>

            <div className="py-3">
              <AnatomicalBodySvg
                activeRegions={
                  regionFilter
                    ? Array.from(new Set([...activeRegions, regionFilter]))
                    : activeRegions
                }
                focusedRegion={regionFilter}
                urgentRegions={urgentRegions}
                onSelectRegion={handleToggleRegionFilter}
                showHotspots={true}
                showCallouts={false}
                className="max-w-[260px]"
              />
            </div>

            <p className="border-t border-hairline pt-3 text-xs leading-relaxed text-slate">
              Selected symptoms light up automatically. Tap any point on the
              figure to filter symptoms by body area.
            </p>
          </div>
        </aside>
      </div>

      {/* Bottom action bar */}
      <div className="flex flex-col-reverse items-stretch justify-between gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center">
        <p className="text-sm font-medium text-stone">
          {selectedIds.length === 0
            ? 'No symptoms selected yet — you can still continue to explore.'
            : `${selectedIds.length} symptom${selectedIds.length === 1 ? '' : 's'} selected`}
        </p>
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
