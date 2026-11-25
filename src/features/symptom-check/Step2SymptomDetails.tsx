import { ArrowRightIcon, CheckCircleIcon } from '../../components/illustrations/Icons'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { validateAllMeasurements, validateTemperatureInput } from './measurementValidation'
import type {
  AgeGroupOption,
  FeverCheckState,
  FeverMeasurementStatus,
  FeverSensationOption,
  HealthMeasurementsState,
  SymptomDetailsState,
  SymptomDuration,
  SymptomProgression,
  SymptomSeverity,
  TemperatureSite,
  TemperatureUnit,
} from './types'

export interface Step2SymptomDetailsProps {
  details: SymptomDetailsState
  hasSelectedSymptoms: boolean
  feverCheck: FeverCheckState
  measurements: HealthMeasurementsState
  onChangeDetails: (next: SymptomDetailsState) => void
  onChangeFeverCheck: (next: FeverCheckState) => void
  onChangeMeasurements: (next: HealthMeasurementsState) => void
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

export const FEVER_SENSATION_OPTIONS: {
  value: FeverSensationOption
  label: string
}[] = [
  { value: 'unusually-hot', label: 'I feel unusually hot.' },
  { value: 'unusually-cold', label: 'I feel unusually cold.' },
  { value: 'chills-shivering', label: 'I have chills or shivering.' },
  { value: 'hot-and-cold', label: 'I feel hot and cold alternately.' },
  { value: 'forehead-warm', label: 'My forehead feels warm.' },
]

export const FEVER_STATUS_OPTIONS: {
  value: FeverMeasurementStatus
  label: string
}[] = [
  {
    value: 'feverish-unmeasured',
    label: "I feel feverish but haven't measured my temperature.",
  },
  { value: 'measured', label: 'I have measured my temperature.' },
  { value: 'unsure', label: 'I am unsure.' },
]

const TEMPERATURE_SITES: { value: TemperatureSite; label: string }[] = [
  { value: 'oral', label: 'Mouth (oral)' },
  { value: 'ear', label: 'Ear' },
  { value: 'forehead', label: 'Forehead' },
  { value: 'underarm', label: 'Underarm' },
]

export const AGE_GROUP_OPTIONS: { value: AgeGroupOption; label: string }[] = [
  { value: 'under-18', label: 'Under 18' },
  { value: 'adult', label: 'Adult (18–64)' },
  { value: 'older-adult', label: 'Older adult (65+)' },
]

/** Step 2: Timing, severity, progression, fever/temperature check, and optional health readings. */
export function Step2SymptomDetails({
  details,
  hasSelectedSymptoms,
  feverCheck,
  measurements,
  onChangeDetails,
  onChangeFeverCheck,
  onChangeMeasurements,
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

  const toggleFeverSensation = (sensation: FeverSensationOption) => {
    const exists = feverCheck.sensations.includes(sensation)
    const nextSensations = exists
      ? feverCheck.sensations.filter((s) => s !== sensation)
      : [...feverCheck.sensations, sensation]
    onChangeFeverCheck({ ...feverCheck, sensations: nextSensations })
  }

  const setFeverStatus = (status: FeverMeasurementStatus) => {
    const nextStatus = feverCheck.measurementStatus === status ? undefined : status
    onChangeFeverCheck({
      ...feverCheck,
      measurementStatus: nextStatus,
      measuredTemperature:
        nextStatus === 'measured'
          ? feverCheck.measuredTemperature ?? { value: '', unit: 'C' }
          : undefined,
    })
    if (nextStatus !== 'measured' && measurements.temperature) {
      onChangeMeasurements({ ...measurements, temperature: undefined })
    }
  }

  const updateTemperatureReading = (
    patch: Partial<{ value: string; unit: TemperatureUnit; site: TemperatureSite }>,
  ) => {
    const current = feverCheck.measuredTemperature ?? { value: '', unit: 'C' as TemperatureUnit }
    const updated = { ...current, ...patch }
    onChangeFeverCheck({
      ...feverCheck,
      measurementStatus: 'measured',
      measuredTemperature: updated,
    })
    onChangeMeasurements({
      ...measurements,
      temperature: updated,
    })
  }

  const tempValidation = validateTemperatureInput(
    feverCheck.measurementStatus === 'measured'
      ? feverCheck.measuredTemperature
      : measurements.temperature,
  )
  const allMeasurementsValidation = validateAllMeasurements(measurements)

  return (
    <div className="space-y-8">
      <div className="space-y-2.5">
        <Badge tone="coral" dotColor="#C25941">
          Step 2 of 4 · Symptom details &amp; readings
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
                  className={`flex min-h-[48px] cursor-pointer items-center rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors sm:text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${
                    isSelected
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
                  className={`flex min-h-[66px] cursor-pointer flex-col justify-center rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${
                    isSelected
                      ? selectedClasses
                      : 'border-hairline bg-ivory/70 text-charcoal hover:border-hairline-strong hover:bg-sand/60'
                  }`}
                >
                  <span className="text-sm font-semibold text-charcoal sm:text-[15px]">
                    {option.label}
                  </span>
                  <span className="mt-0.5 text-xs text-stone">{option.hint}</span>
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
                  className={`flex min-h-[48px] cursor-pointer items-center rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors sm:text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${
                    isSelected
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

        {/* Section 4: Fever & Temperature Check (optional) */}
        <fieldset className="space-y-4 py-6">
          <legend className="font-display text-lg font-semibold text-charcoal sm:text-xl">
            4. Fever or temperature sensations{' '}
            <span className="font-sans text-xs font-normal text-stone">(optional)</span>
          </legend>
          <p className="text-xs leading-relaxed text-slate">
            Feeling hot, cold, or shivery does not confirm a fever on its own — a
            thermometer reading is needed to know for sure. VITALORA cannot measure
            temperature through your device.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            {FEVER_SENSATION_OPTIONS.map((opt) => {
              const checked = feverCheck.sensations.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => toggleFeverSensation(opt.value)}
                  className={`flex min-h-[44px] cursor-pointer items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${
                    checked
                      ? 'border-coral bg-coral-soft/75 text-charcoal'
                      : 'border-hairline bg-ivory/70 text-charcoal hover:border-hairline-strong'
                  }`}
                >
                  <span>{opt.label}</span>
                  <CheckCircleIcon
                    className={`h-4 w-4 shrink-0 ${
                      checked ? 'text-coral' : 'text-transparent'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          <div className="space-y-2.5 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone">
              Have you checked your temperature with a thermometer?
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {FEVER_STATUS_OPTIONS.map((opt) => {
                const active = feverCheck.measurementStatus === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFeverStatus(opt.value)}
                    className={`flex min-h-[48px] cursor-pointer items-center rounded-xl border px-3.5 py-2 text-left text-xs font-semibold transition-colors sm:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
                      active
                        ? 'border-forest bg-sage-mist text-forest'
                        : 'border-hairline bg-ivory/70 text-charcoal hover:border-hairline-strong'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Conditional Thermometer Input */}
          {feverCheck.measurementStatus === 'measured' ? (
            <div className="rounded-xl border border-forest/25 bg-sage-mist/35 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="temp-input"
                  className="text-sm font-semibold text-charcoal"
                >
                  Enter your thermometer reading
                </label>
                <span className="rounded-full border border-hairline bg-paper px-2.5 py-0.5 text-[11px] font-medium text-stone">
                  Unverified self-entered reading
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  id="temp-input"
                  type="text"
                  inputMode="decimal"
                  value={feverCheck.measuredTemperature?.value ?? ''}
                  onChange={(e) =>
                    updateTemperatureReading({ value: e.target.value })
                  }
                  placeholder={
                    (feverCheck.measuredTemperature?.unit ?? 'C') === 'C'
                      ? 'e.g. 37.8'
                      : 'e.g. 100.0'
                  }
                  className="w-32 rounded-xl border border-hairline-strong bg-paper px-3.5 py-2 text-sm font-semibold text-charcoal placeholder:text-stone focus:border-forest focus:outline-none"
                />

                <div
                  role="group"
                  aria-label="Temperature unit"
                  className="inline-flex rounded-xl border border-hairline bg-paper p-0.5"
                >
                  {(['C', 'F'] as const).map((unit) => {
                    const active =
                      (feverCheck.measuredTemperature?.unit ?? 'C') === unit
                    return (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => updateTemperatureReading({ unit })}
                        className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-forest text-paper'
                            : 'text-slate hover:text-charcoal'
                        }`}
                      >
                        °{unit}
                      </button>
                    )
                  })}
                </div>

                <select
                  aria-label="Measurement location (optional)"
                  value={feverCheck.measuredTemperature?.site ?? ''}
                  onChange={(e) =>
                    updateTemperatureReading({
                      site: (e.target.value || undefined) as TemperatureSite | undefined,
                    })
                  }
                  className="rounded-xl border border-hairline bg-paper px-3 py-2 text-xs font-medium text-charcoal focus:border-forest focus:outline-none"
                >
                  <option value="">Where measured (optional)</option>
                  {TEMPERATURE_SITES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {tempValidation.provided && !tempValidation.valid ? (
                <p role="alert" className="text-xs font-semibold text-urgent">
                  {tempValidation.error}
                </p>
              ) : tempValidation.provided && tempValidation.valid ? (
                <p className="text-xs text-forest">
                  {tempValidation.note}
                </p>
              ) : null}
            </div>
          ) : null}
        </fieldset>

        {/* Section 5: Optional Health Measurements */}
        <fieldset className="space-y-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <legend className="font-display text-lg font-semibold text-charcoal sm:text-xl">
              5. Other health measurements{' '}
              <span className="font-sans text-xs font-normal text-stone">(completely optional)</span>
            </legend>
            <span className="rounded-full border border-hairline bg-ivory px-2.5 py-0.5 text-[11px] font-medium text-stone">
              No devices needed
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate">
            Only fill these in if you happen to have a home monitor handy. Leave
            everything blank if not — all readings are marked as unverified
            self-entered values.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Blood pressure */}
            <div className="rounded-xl border border-hairline bg-ivory/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal">
                  Blood pressure (mmHg)
                </span>
                <span className="text-[11px] text-stone">Unverified</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  aria-label="Systolic blood pressure"
                  type="text"
                  inputMode="numeric"
                  placeholder="Top (e.g. 120)"
                  value={measurements.bloodPressure?.systolic ?? ''}
                  onChange={(e) =>
                    onChangeMeasurements({
                      ...measurements,
                      bloodPressure: {
                        systolic: e.target.value,
                        diastolic: measurements.bloodPressure?.diastolic ?? '',
                      },
                    })
                  }
                  className="w-full rounded-lg border border-hairline bg-paper px-3 py-1.5 text-sm text-charcoal placeholder:text-stone focus:border-forest focus:outline-none"
                />
                <span className="text-stone">/</span>
                <input
                  aria-label="Diastolic blood pressure"
                  type="text"
                  inputMode="numeric"
                  placeholder="Bottom (e.g. 80)"
                  value={measurements.bloodPressure?.diastolic ?? ''}
                  onChange={(e) =>
                    onChangeMeasurements({
                      ...measurements,
                      bloodPressure: {
                        systolic: measurements.bloodPressure?.systolic ?? '',
                        diastolic: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-hairline bg-paper px-3 py-1.5 text-sm text-charcoal placeholder:text-stone focus:border-forest focus:outline-none"
                />
              </div>
              {allMeasurementsValidation.bloodPressure.provided &&
              !allMeasurementsValidation.bloodPressure.valid ? (
                <p role="alert" className="text-xs font-medium text-urgent">
                  {allMeasurementsValidation.bloodPressure.error}
                </p>
              ) : allMeasurementsValidation.bloodPressure.provided &&
                allMeasurementsValidation.bloodPressure.valid ? (
                <p className="text-xs text-slate">
                  {allMeasurementsValidation.bloodPressure.note}
                </p>
              ) : null}
            </div>

            {/* Heart rate */}
            <div className="rounded-xl border border-hairline bg-ivory/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="hr-input"
                  className="text-xs font-semibold text-charcoal"
                >
                  Resting heart rate (bpm)
                </label>
                <span className="text-[11px] text-stone">Unverified</span>
              </div>
              <input
                id="hr-input"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 72"
                value={measurements.heartRate ?? ''}
                onChange={(e) =>
                  onChangeMeasurements({ ...measurements, heartRate: e.target.value })
                }
                className="w-full rounded-lg border border-hairline bg-paper px-3 py-1.5 text-sm text-charcoal placeholder:text-stone focus:border-forest focus:outline-none"
              />
              {allMeasurementsValidation.heartRate.provided &&
              !allMeasurementsValidation.heartRate.valid ? (
                <p role="alert" className="text-xs font-medium text-urgent">
                  {allMeasurementsValidation.heartRate.error}
                </p>
              ) : allMeasurementsValidation.heartRate.provided &&
                allMeasurementsValidation.heartRate.valid ? (
                <p className="text-xs text-slate">
                  {allMeasurementsValidation.heartRate.note}
                </p>
              ) : null}
            </div>

            {/* SpO2 */}
            <div className="rounded-xl border border-hairline bg-ivory/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="spo2-input"
                  className="text-xs font-semibold text-charcoal"
                >
                  Oxygen saturation — SpO2 (%)
                </label>
                <span className="text-[11px] text-stone">Unverified</span>
              </div>
              <input
                id="spo2-input"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 98"
                value={measurements.spo2 ?? ''}
                onChange={(e) =>
                  onChangeMeasurements({ ...measurements, spo2: e.target.value })
                }
                className="w-full rounded-lg border border-hairline bg-paper px-3 py-1.5 text-sm text-charcoal placeholder:text-stone focus:border-forest focus:outline-none"
              />
              {allMeasurementsValidation.spo2.provided &&
              !allMeasurementsValidation.spo2.valid ? (
                <p role="alert" className="text-xs font-medium text-urgent">
                  {allMeasurementsValidation.spo2.error}
                </p>
              ) : allMeasurementsValidation.spo2.provided &&
                allMeasurementsValidation.spo2.valid ? (
                <p className="text-xs text-slate">
                  {allMeasurementsValidation.spo2.note}
                </p>
              ) : null}
            </div>

            {/* Age group for context */}
            <div className="rounded-xl border border-hairline bg-ivory/60 p-3.5 space-y-2">
              <span className="block text-xs font-semibold text-charcoal">
                Age group (helps interpret fever thresholds)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AGE_GROUP_OPTIONS.map((opt) => {
                  const active = measurements.ageGroup === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        onChangeMeasurements({
                          ...measurements,
                          ageGroup: active ? undefined : opt.value,
                        })
                      }
                      className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-forest bg-sage-mist text-forest'
                          : 'border-hairline bg-paper text-charcoal hover:border-hairline-strong'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
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
