import { getContextualQuestions } from './contextualQuestions'
import { evaluateEmergencySafety } from './emergencyRules'
import {
  DEFAULT_SELF_CARE_STEPS,
  EXPLANATION_LIBRARY,
  GENERAL_WARNING_SIGNS,
  MEDICAL_DISCLAIMER,
  UNVERIFIED_MEASUREMENT_NOTICE,
  WHEN_TO_SEEK_CARE_DEFAULT,
} from './medicalContent'
import { validateAllMeasurements } from './measurementValidation'
import { getSymptomById } from './symptomCatalog'
import type {
  AssessmentExplanationBlock,
  AssessmentReport,
  FeverAssessmentOutcome,
  SymptomCheckInData,
  ValidatedMeasurementsSummary,
} from './types'

const DURATION_LABELS: Record<string, string> = {
  today: 'Started today',
  yesterday: 'Started yesterday',
  'two-to-three-days': 'Started 2–3 days ago',
  'week-or-more': 'Started a week or more ago',
}

const SEVERITY_LABELS: Record<string, string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
}

const PROGRESSION_LABELS: Record<string, string> = {
  better: 'Getting better',
  same: 'Staying the same',
  worse: 'Getting worse',
}

const AGE_LABELS: Record<string, string> = {
  'under-18': 'Under 18',
  adult: 'Adult (18–64)',
  'older-adult': 'Older adult (65+)',
}

const FEVER_SENSATION_LABELS: Record<string, string> = {
  'unusually-hot': 'Feeling unusually hot',
  'unusually-cold': 'Feeling unusually cold',
  'chills-shivering': 'Chills or shivering',
  'hot-and-cold': 'Feeling hot and cold alternately',
  'forehead-warm': 'Forehead feels warm',
}

function buildFeverAssessment(
  data: SymptomCheckInData,
  validated: ValidatedMeasurementsSummary,
): FeverAssessmentOutcome {
  const sensationsReported = data.feverCheck.sensations.map(
    (s) => FEVER_SENSATION_LABELS[s] ?? s,
  )
  const hasFeverSymptom =
    data.selectedIds.includes('fever') || data.selectedIds.includes('chills')
  const temp = validated.temperature
  const ageGroup = data.measurements.ageGroup

  // Case B: Valid measured temperature provided
  if (
    (data.feverCheck.measurementStatus === 'measured' || temp.provided) &&
    temp.provided &&
    temp.valid &&
    temp.celsius !== undefined &&
    temp.fahrenheit !== undefined
  ) {
    const readingStr = `${temp.celsius.toFixed(1)}°C (${temp.fahrenheit.toFixed(1)}°F)${
      temp.site ? ` via ${temp.site}` : ''
    }`
    const ageCaveat =
      ageGroup === 'under-18'
        ? ' In children and under-18s, fever thresholds and overall alertness matter closely — consult a pediatrician or doctor if unsure.'
        : ageGroup === 'older-adult'
          ? ' Older adults can sometimes have serious infections with only a modest rise in temperature — monitor overall energy and alertness closely.'
          : ''

    return {
      mode: 'measured-temperature',
      headline: `Measured temperature recorded: ${readingStr}`,
      explanation: `${temp.note ?? ''}${ageCaveat} Remember that a thermometer reading alone does not diagnose what is causing a temperature change.`,
      thermometerGuidance:
        'Re-check with the same thermometer if symptoms change, and note the time of each reading if you speak to a clinician.',
      sensationsReported,
      measuredSummary: readingStr,
    }
  }

  // Case A: Subjective feverish sensation without valid measured temperature
  if (
    data.feverCheck.measurementStatus === 'feverish-unmeasured' ||
    sensationsReported.length > 0 ||
    hasFeverSymptom
  ) {
    return {
      mode: 'subjective-sensation-only',
      headline: 'Feverish sensations reported (no thermometer reading)',
      explanation:
        'Feeling unusually hot, cold, or shivery cannot confirm whether you actually have a fever. Your body temperature can feel off even when a thermometer reads normal, or rise quickly later.',
      thermometerGuidance:
        'If you have access to a thermometer, measure your temperature under the tongue, ear, or forehead to get an objective reading. Do not rely on touch alone.',
      sensationsReported,
    }
  }

  if (data.feverCheck.measurementStatus === 'unsure') {
    return {
      mode: 'unsure-no-reading',
      headline: 'Temperature status unsure',
      explanation:
        'You noted that you are unsure about your temperature. Measuring with a thermometer when available helps clarify whether a fever is present.',
      thermometerGuidance:
        'If you start feeling warm, chilled, or shivery, check your temperature with a thermometer.',
      sensationsReported: [],
    }
  }

  return {
    mode: 'none',
    headline: 'No fever or temperature concerns reported',
    explanation: 'No feverish sensations or elevated temperature readings were entered.',
    thermometerGuidance: '',
    sensationsReported: [],
  }
}

function buildHealthMeasurementsSection(
  validated: ValidatedMeasurementsSummary,
): AssessmentReport['healthMeasurements'] {
  const items: AssessmentReport['healthMeasurements']['items'] = []
  const invalidEntries: string[] = []

  if (validated.temperature.provided) {
    if (validated.temperature.valid && validated.temperature.celsius !== undefined) {
      const c = validated.temperature.celsius.toFixed(1)
      const f = validated.temperature.fahrenheit?.toFixed(1) ?? ''
      items.push({
        label: 'Body Temperature',
        readingText: `${c}°C (${f}°F)${validated.temperature.site ? ` · ${validated.temperature.site}` : ''}`,
        interpretationNote: validated.temperature.note ?? '',
        isConcerning:
          validated.temperature.classification === 'fever' ||
          validated.temperature.classification === 'high-fever' ||
          validated.temperature.classification === 'very-high-fever' ||
          validated.temperature.classification === 'hypothermia-risk',
        verificationTag: 'Unverified self-entered reading',
      })
    } else if (validated.temperature.error) {
      invalidEntries.push(`Body temperature: ${validated.temperature.error}`)
    }
  }

  if (validated.bloodPressure.provided) {
    if (validated.bloodPressure.valid) {
      items.push({
        label: 'Blood Pressure',
        readingText: `${validated.bloodPressure.systolic}/${validated.bloodPressure.diastolic} mmHg`,
        interpretationNote: validated.bloodPressure.note ?? '',
        isConcerning:
          validated.bloodPressure.classification === 'crisis-range' ||
          validated.bloodPressure.classification === 'high' ||
          validated.bloodPressure.classification === 'low',
        verificationTag: 'Unverified self-entered reading',
      })
    } else if (validated.bloodPressure.error) {
      invalidEntries.push(`Blood pressure: ${validated.bloodPressure.error}`)
    }
  }

  if (validated.heartRate.provided) {
    if (validated.heartRate.valid) {
      items.push({
        label: 'Resting Heart Rate',
        readingText: `${validated.heartRate.bpm} bpm`,
        interpretationNote: validated.heartRate.note ?? '',
        isConcerning:
          validated.heartRate.classification === 'high-resting' ||
          validated.heartRate.classification === 'low',
        verificationTag: 'Unverified self-entered reading',
      })
    } else if (validated.heartRate.error) {
      invalidEntries.push(`Heart rate: ${validated.heartRate.error}`)
    }
  }

  if (validated.spo2.provided) {
    if (validated.spo2.valid) {
      items.push({
        label: 'Oxygen Saturation (SpO2)',
        readingText: `${validated.spo2.percent}%`,
        interpretationNote: validated.spo2.note ?? '',
        isConcerning:
          validated.spo2.classification === 'critical-low' ||
          validated.spo2.classification === 'low-caution',
        verificationTag: 'Unverified self-entered reading',
      })
    } else if (validated.spo2.error) {
      invalidEntries.push(`Oxygen saturation: ${validated.spo2.error}`)
    }
  }

  return {
    hasAnyValidMeasurement: items.length > 0,
    verificationNotice: UNVERIFIED_MEASUREMENT_NOTICE,
    items,
    invalidEntries,
  }
}

/**
 * Deterministic, safety-first health assessment engine.
 *
 * Architecture note:
 * - Step 1: Run deterministic emergency safety evaluation (`evaluateEmergencySafety`).
 *   Emergency detection is strictly rule-based and never delegated to AI.
 * - Step 2: Validate all optional measurements (`validateAllMeasurements`).
 *   Invalid readings (including ambient/room temperatures < 34°C) are rejected and
 *   never used in clinical reasoning.
 * - Step 3: Evaluate confirmed symptoms, duration, severity, progression, fever status,
 *   and valid measurements together as a combined context.
 * - Future AI explanation layer hook: if a server-side LLM explanation layer is added later,
 *   it should only rephrase `whatInfoMaySuggest` and `whyThisIsRelevant` when
 *   `isEmergencyInterrupted === false`, grounded strictly in `EXPLANATION_LIBRARY`.
 */
export function generateAssessmentReport(
  data: SymptomCheckInData,
): AssessmentReport {
  // 1. Safety-first deterministic emergency check (cannot be bypassed)
  const safety = evaluateEmergencySafety(data)
  const validatedMeasurements = validateAllMeasurements(data.measurements)
  const healthMeasurements = buildHealthMeasurementsSection(validatedMeasurements)
  const feverAssessment = buildFeverAssessment(data, validatedMeasurements)

  // Effective confirmed symptoms: ONLY explicitly selectedIds + user-confirmed natural suggestions
  // Unconfirmed suggestions from natural text are NEVER silently included!
  const confirmedNaturalIds = data.naturalDescription.suggestions
    .filter((s) => s.confirmed)
    .map((s) => s.symptomId)
  const effectiveIds = Array.from(new Set([...data.selectedIds, ...confirmedNaturalIds]))

  const confirmedSymptomLabels = effectiveIds
    .map((id) => getSymptomById(id)?.label)
    .filter((label): label is string => Boolean(label))

  const contextualQA = getContextualQuestions(effectiveIds)
    .map((q) => {
      const raw = data.contextualAnswers[q.id]
      if (!raw || raw === 'skipped') return null
      const optLabel = q.options.find((o) => o.value === raw)?.label ?? raw
      return { question: q.question, answer: optLabel }
    })
    .filter((item): item is { question: string; answer: string } => Boolean(item))

  const reportedSymptoms: AssessmentReport['reportedSymptoms'] = {
    confirmedSymptomLabels,
    userDescribedNotes: data.naturalDescription.rawText.trim() || undefined,
    durationLabel: data.details.duration
      ? DURATION_LABELS[data.details.duration] ?? data.details.duration
      : 'Not specified',
    severityLabel: data.details.severity
      ? SEVERITY_LABELS[data.details.severity] ?? data.details.severity
      : 'Not specified',
    progressionLabel: data.details.progression
      ? PROGRESSION_LABELS[data.details.progression] ?? data.details.progression
      : 'Not specified',
    ageGroupLabel: data.measurements.ageGroup
      ? AGE_LABELS[data.measurements.ageGroup]
      : undefined,
    feverSensations: feverAssessment.sensationsReported,
    contextualQA,
  }

  // If emergency detected, interrupt normal assessment immediately
  if (safety.level === 'emergency') {
    return {
      isEmergencyInterrupted: true,
      insufficientInformation: false,
      safety,
      reportedSymptoms,
      healthMeasurements,
      feverAssessment,
      whatInfoMaySuggest: [],
      whyThisIsRelevant: [
        'One or more of your reported symptoms or readings match urgent warning criteria that require immediate in-person medical evaluation.',
      ],
      whatYouCanDoNext: [
        'Stop using this self-check and call 112 (or your local emergency number) or go to the nearest emergency room right away.',
        'If possible, have someone stay with you and share the symptoms and any readings you entered with the medical team.',
      ],
      whenToSeekMedicalCare: [
        'Immediate emergency care is recommended now.',
      ],
      warningSigns: GENERAL_WARNING_SIGNS,
      disclaimer: MEDICAL_DISCLAIMER,
      generatedBy: 'deterministic-clinical-rules-v1',
    }
  }

  // 2. Context-aware non-emergency pattern matching
  const has = (id: string) => effectiveIds.includes(id)
  const hasAnyFeverSensation =
    has('fever') ||
    has('chills') ||
    feverAssessment.sensationsReported.length > 0 ||
    (validatedMeasurements.temperature.valid &&
      (validatedMeasurements.temperature.classification === 'fever' ||
        validatedMeasurements.temperature.classification === 'high-fever' ||
        validatedMeasurements.temperature.classification === 'mildly-elevated'))

  const insufficientInformation =
    effectiveIds.length === 0 &&
    !healthMeasurements.hasAnyValidMeasurement &&
    feverAssessment.sensationsReported.length === 0

  const whatInfoMaySuggest: AssessmentExplanationBlock[] = []
  const whyThisIsRelevant: string[] = []
  const whatYouCanDoNext: string[] = [...DEFAULT_SELF_CARE_STEPS]
  const whenToSeekMedicalCare: string[] = [...WHEN_TO_SEEK_CARE_DEFAULT]

  if (insufficientInformation) {
    whatInfoMaySuggest.push(EXPLANATION_LIBRARY['insufficient-info'])
    whyThisIsRelevant.push(
      'No confirmed symptoms, feverish sensations, or valid health readings were provided.',
    )
  } else {
    // Cluster 1: Viral / respiratory cluster
    if (
      (hasAnyFeverSensation || has('fatigue') || has('body-aches')) &&
      (has('cough') || has('sore-throat') || has('runny-nose') || has('headache'))
    ) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['viral-respiratory-cluster'])
    }

    // Cluster 2: Feverish sensations / chills + fatigue
    if (
      (has('chills') || feverAssessment.sensationsReported.length > 0 || has('fever')) &&
      (has('fatigue') || !whatInfoMaySuggest.length)
    ) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['fever-chills-fatigue'])
    }

    // Cluster 3: Headache + dizziness
    if (has('headache') && has('dizziness')) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['headache-dizziness-cluster'])
    } else if (has('headache') && !hasAnyFeverSensation && !has('cough') && !has('sore-throat')) {
      // Isolated mild/moderate headache without red flags
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['headache-mild-isolated'])
    }

    // Cluster 4: Digestive
    if (has('nausea') || has('vomiting') || has('stomach-pain') || has('diarrhea')) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['digestive-cluster'])
      whatYouCanDoNext.unshift(
        'Take small, frequent sips of water or oral rehydration solution rather than large amounts at once.',
      )
    }

    // Cluster 5: Palpitations (non-emergency)
    if (has('palpitations')) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['palpitations-isolated'])
    }

    // Cluster 6: Skin rash
    if (has('skin-rash')) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['skin-rash-general'])
    }

    // Fallback if symptoms selected don't match a specific vetted cluster
    if (whatInfoMaySuggest.length === 0) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['insufficient-info'])
    }

    // Build context-aware relevance notes
    if (confirmedSymptomLabels.length > 0) {
      whyThisIsRelevant.push(
        `Your reported symptoms (${confirmedSymptomLabels.join(', ')}) were evaluated together rather than in isolation.`,
      )
    }

    if (data.details.progression === 'worse') {
      whyThisIsRelevant.push(
        'You noted that your symptoms are getting worse. Worsening symptoms carry more weight than stable or improving ones and are a clear reason to arrange a medical review.',
      )
      whenToSeekMedicalCare.unshift(
        'Because your symptoms are worsening, contact a doctor or clinic promptly rather than waiting to see if they settle.',
      )
    } else if (data.details.progression === 'better') {
      whyThisIsRelevant.push(
        'You noted that your symptoms are getting better, which is generally a reassuring trend when no warning signs are present.',
      )
    }

    if (data.details.duration === 'week-or-more') {
      whyThisIsRelevant.push(
        'Symptoms lasting a week or longer benefit from a routine check-up with a doctor to rule out persistent causes.',
      )
    }

    if (validatedMeasurements.spo2.valid && validatedMeasurements.spo2.classification === 'low-caution') {
      whyThisIsRelevant.push(
        `Your entered oxygen saturation (${validatedMeasurements.spo2.percent}%) is below the typical 95%–100% range. Re-check on a warm finger and seek prompt medical advice.`,
      )
      whenToSeekMedicalCare.unshift(
        'Seek prompt medical evaluation today for an SpO2 reading below 95%, especially if you feel short of breath.',
      )
    }

    if (
      validatedMeasurements.temperature.valid &&
      (validatedMeasurements.temperature.classification === 'high-fever' ||
        validatedMeasurements.temperature.classification === 'fever')
    ) {
      whyThisIsRelevant.push(
        `Your entered temperature of ${validatedMeasurements.temperature.celsius?.toFixed(1)}°C meets standard fever thresholds and supports monitoring hydration and symptom progression closely.`,
      )
    }

    if (healthMeasurements.invalidEntries.length > 0) {
      whyThisIsRelevant.push(
        'One or more entered readings were outside realistic human ranges and were excluded from this assessment so they do not skew your guidance.',
      )
    }
  }

  return {
    isEmergencyInterrupted: false,
    insufficientInformation,
    safety,
    reportedSymptoms,
    healthMeasurements,
    feverAssessment,
    whatInfoMaySuggest,
    whyThisIsRelevant,
    whatYouCanDoNext,
    whenToSeekMedicalCare,
    warningSigns: GENERAL_WARNING_SIGNS,
    disclaimer: MEDICAL_DISCLAIMER,
    generatedBy: 'deterministic-clinical-rules-v1',
  }
}
