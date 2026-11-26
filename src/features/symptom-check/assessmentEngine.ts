import { getContextualQuestions } from './contextualQuestions'
import { evaluateEmergencySafety, getConfirmedSymptomIds } from './emergencyRules'
import {
  EXPLANATION_LIBRARY,
  GENERAL_WARNING_SIGNS,
  INSUFFICIENT_INFORMATION_MESSAGE,
  MEDICAL_DISCLAIMER,
  TRANSPARENCY_POINTS,
  UNVERIFIED_MEASUREMENT_NOTICE,
  WHEN_TO_CALL_DOCTOR,
} from './medicalContent'
import { validateAllMeasurements } from './measurementValidation'
import { getSymptomById } from './symptomCatalog'
import type {
  AssessmentExplanationBlock,
  AssessmentReport,
  CareGuidanceSummary,
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
  'hot-and-cold': 'Feeling hot and cold on and off',
  'forehead-warm': 'Forehead feels warm',
}

function buildFeverAssessment(
  data: SymptomCheckInData,
  effectiveIds: string[],
  validated: ValidatedMeasurementsSummary,
): FeverAssessmentOutcome {
  const sensationsReported = data.feverCheck.sensations.map(
    (s) => FEVER_SENSATION_LABELS[s] ?? s,
  )
  const hasFeverSymptom =
    effectiveIds.includes('fever') || effectiveIds.includes('chills')
  const temp = validated.temperature
  const ageGroup = data.measurements.ageGroup

  // Case B: Valid thermometer reading provided
  if (
    (data.feverCheck.measurementStatus === 'measured' || temp.provided) &&
    temp.provided &&
    temp.valid &&
    temp.celsius !== undefined &&
    temp.fahrenheit !== undefined
  ) {
    const readingStr = `${temp.celsius.toFixed(1)}°C (${temp.fahrenheit.toFixed(1)}°F)${
      temp.site ? ` (${temp.site})` : ''
    }`
    const ageCaveat =
      ageGroup === 'under-18'
        ? ' Because this is for someone under 18, pay close attention to alertness, drinking fluids, and breathing, and check with a doctor if you are unsure.'
        : ageGroup === 'older-adult'
          ? ' Older adults can have a serious infection even with only a small rise in temperature, so watch energy and alertness closely.'
          : ''

    return {
      mode: 'measured-temperature',
      headline: `Your measured temperature: ${readingStr}`,
      explanation: `${temp.note ?? ''}${ageCaveat} A thermometer reading alone cannot show what is causing a temperature change.`,
      thermometerGuidance:
        'Check again if symptoms change, and keep a note of your readings if you call a doctor.',
      sensationsReported,
      measuredSummary: readingStr,
    }
  }

  // Contextual fallback if user answered Step 3 thermometer question instead of Step 2 input
  const step3TempAnswer = data.contextualAnswers['fever-temp']
  if (
    step3TempAnswer === 'low' ||
    step3TempAnswer === 'moderate' ||
    step3TempAnswer === 'high'
  ) {
    const step3Summary =
      step3TempAnswer === 'high'
        ? 'Above 39°C (102°F)'
        : step3TempAnswer === 'moderate'
          ? '38°C to 39°C (100.4°F to 102°F)'
          : 'Under 38°C (100.4°F)'

    return {
      mode: 'measured-temperature',
      headline: `Temperature range you selected: ${step3Summary}`,
      explanation:
        step3TempAnswer === 'high'
          ? 'A temperature above 39°C (102°F) is a high fever. You should speak with a healthcare professional promptly, especially if symptoms are worsening or you feel very unwell.'
          : step3TempAnswer === 'moderate'
            ? 'A temperature of 38°C (100.4°F) or higher counts as a fever. A temperature reading alone cannot tell what is causing it.'
            : 'A reading under 38°C (100.4°F) is below standard fever levels, though your temperature can still change over time.',
      thermometerGuidance:
        'Check again with a thermometer later if your symptoms shift.',
      sensationsReported,
      measuredSummary: step3Summary,
    }
  }

  // Case A: Subjective feverish sensation without measured temperature
  if (
    data.feverCheck.measurementStatus === 'feverish-unmeasured' ||
    sensationsReported.length > 0 ||
    hasFeverSymptom
  ) {
    return {
      mode: 'subjective-sensation-only',
      headline: 'You feel feverish, but temperature has not been measured',
      explanation:
        'Feeling unusually hot, cold, or shivery cannot confirm whether you actually have a fever. You can feel hot with a normal temperature, or have a fever without realizing it.',
      thermometerGuidance:
        'If you have a thermometer, take a reading in the mouth, ear, or forehead to know for sure.',
      sensationsReported,
    }
  }

  if (data.feverCheck.measurementStatus === 'unsure') {
    return {
      mode: 'unsure-no-reading',
      headline: 'Temperature has not been checked',
      explanation:
        'Because your temperature was not measured, it is not clear whether you have a fever.',
      thermometerGuidance:
        'If you start feeling unusually warm, cold, or shivery, check with a thermometer if one is available.',
      sensationsReported: [],
    }
  }

  return {
    mode: 'none',
    headline: 'No fever or temperature concerns reported',
    explanation: '',
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
        label: 'Body temperature',
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
        label: 'Blood pressure',
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
        label: 'Resting heart rate',
        readingText: `${validated.heartRate.bpm} beats per minute (bpm)`,
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
        label: 'Blood oxygen level (SpO2)',
        readingText: `${validated.spo2.percent}%`,
        interpretationNote: validated.spo2.note ?? '',
        isConcerning:
          validated.spo2.classification === 'critical-low' ||
          validated.spo2.classification === 'low-caution',
        verificationTag: 'Unverified self-entered reading',
      })
    } else if (validated.spo2.error) {
      invalidEntries.push(`Blood oxygen (SpO2): ${validated.spo2.error}`)
    }
  }

  return {
    hasAnyValidMeasurement: items.length > 0,
    verificationNotice: UNVERIFIED_MEASUREMENT_NOTICE,
    items,
    invalidEntries,
  }
}

function buildCareGuidance(
  data: SymptomCheckInData,
  effectiveIds: string[],
  safety: ReturnType<typeof evaluateEmergencySafety>,
  validated: ValidatedMeasurementsSummary,
  insufficientInformation: boolean,
): CareGuidanceSummary {
  if (safety.level === 'emergency') {
    return {
      level: 'emergency',
      label: 'Emergency — Get emergency help now.',
      summary:
        'You reported signs that can sometimes be life-threatening and need immediate in-person medical care.',
      reasons: safety.triggers,
    }
  }

  const promptAttentionReasons: string[] = []

  if (safety.level === 'caution') {
    promptAttentionReasons.push(
      'You reported chest, breathing, or ongoing heartbeat symptoms that a doctor should check promptly.',
    )
  }

  if (data.details.severity === 'severe') {
    promptAttentionReasons.push('You rated your symptoms as severe.')
  }

  if (data.details.progression === 'worse') {
    promptAttentionReasons.push('You noted that your symptoms are getting worse.')
  }

  if (data.details.duration === 'week-or-more') {
    promptAttentionReasons.push('Your symptoms have lasted a week or longer.')
  }

  if (
    effectiveIds.includes('headache') &&
    data.contextualAnswers['headache-onset'] === 'sudden'
  ) {
    promptAttentionReasons.push(
      'Your headache started very suddenly, which should be checked by a doctor quickly.',
    )
  }

  if (data.contextualAnswers['fluids-hydration'] === 'trouble') {
    promptAttentionReasons.push(
      'You are having trouble keeping fluids down, which raises the risk of dehydration (losing too much fluid).',
    )
  }

  if (data.contextualAnswers['fever-temp'] === 'high') {
    promptAttentionReasons.push('You reported a high fever above 39°C (102°F).')
  }

  if (
    validated.temperature.valid &&
    validated.temperature.classification === 'high-fever'
  ) {
    promptAttentionReasons.push(
      `Your entered temperature (${validated.temperature.celsius?.toFixed(1)}°C / ${validated.temperature.fahrenheit?.toFixed(1)}°F) is in the high-fever range.`,
    )
  } else if (
    validated.temperature.valid &&
    validated.temperature.classification === 'fever' &&
    (data.measurements.ageGroup === 'under-18' ||
      data.measurements.ageGroup === 'older-adult' ||
      data.details.duration === 'two-to-three-days' ||
      data.details.duration === 'week-or-more')
  ) {
    promptAttentionReasons.push(
      `Your entered temperature (${validated.temperature.celsius?.toFixed(1)}°C) meets fever levels with age or duration factors that warrant a doctor check.`,
    )
  }

  if (
    validated.spo2.valid &&
    validated.spo2.classification === 'low-caution'
  ) {
    promptAttentionReasons.push(
      `Your entered blood oxygen reading (${validated.spo2.percent}%) is below the usual 95%–100% range.`,
    )
  }

  if (
    validated.bloodPressure.valid &&
    (validated.bloodPressure.classification === 'high' ||
      validated.bloodPressure.classification === 'low')
  ) {
    promptAttentionReasons.push(
      `Your entered blood pressure (${validated.bloodPressure.systolic}/${validated.bloodPressure.diastolic} mmHg) is outside typical resting levels.`,
    )
  }

  if (
    validated.heartRate.valid &&
    (validated.heartRate.classification === 'high-resting' ||
      validated.heartRate.classification === 'low')
  ) {
    promptAttentionReasons.push(
      `Your entered resting heart rate (${validated.heartRate.bpm} bpm) is outside the usual 60–100 bpm range.`,
    )
  }

  if (
    effectiveIds.includes('palpitations') &&
    (data.contextualAnswers['palpitations-pattern'] === 'comes-and-goes' ||
      data.contextualAnswers['palpitations-pattern'] === 'ongoing-now')
  ) {
    promptAttentionReasons.push(
      'New, repeated, or ongoing heart palpitations should be checked by a doctor.',
    )
  }

  if (promptAttentionReasons.length > 0) {
    return {
      level: 'medical-attention',
      label:
        'Medical attention recommended — Get checked by a healthcare professional promptly.',
      summary:
        'Based on what you entered, it is safest to contact a doctor, clinic, or urgent-care service soon rather than waiting it out.',
      reasons: Array.from(new Set(promptAttentionReasons)),
    }
  }

  if (insufficientInformation) {
    return {
      level: 'monitor',
      label:
        'Monitor your symptoms — Contact a healthcare professional if you feel unwell or unsure.',
      summary:
        'Not enough details were entered to understand what is causing how you feel, so do not assume everything is fine if you feel unwell.',
      reasons: ['Very few specific symptoms or answers were provided.'],
    }
  }

  const monitorReasons: string[] = [
    'No urgent warning signs were identified from the information you provided. This does not rule out a serious medical condition.',
  ]
  if (data.details.progression === 'better') {
    monitorReasons.push('You noted that your symptoms are starting to improve.')
  }

  return {
    level: 'monitor',
    label:
      'Monitor your symptoms — Monitor how you feel and seek care if symptoms persist or worsen.',
    summary:
      'No urgent warning signs were identified from the information you provided. This does not rule out a serious medical condition. Watch how you feel over the next 24 to 48 hours and contact a doctor if symptoms worsen or do not improve.',
    reasons: monitorReasons,
  }
}

function buildActionSteps(
  effectiveIds: string[],
  feverAssessment: FeverAssessmentOutcome,
  validated: ValidatedMeasurementsSummary,
): string[] {
  const steps: string[] = []
  const has = (id: string) => effectiveIds.includes(id)

  const hasDigestive =
    has('nausea') || has('vomiting') || has('stomach-pain') || has('diarrhea')
  const hasRespiratory = has('cough') || has('sore-throat') || has('runny-nose')
  const hasFeverOrChills =
    has('fever') ||
    has('chills') ||
    feverAssessment.mode !== 'none'

  if (hasDigestive) {
    steps.push(
      'Take small, frequent sips of water or oral rehydration solution (water with balanced salts and sugar) rather than drinking a lot at once.',
    )
    steps.push(
      'Eat small, plain foods (like toast, rice, or bananas) only when you feel ready, and avoid greasy or spicy meals for now.',
    )
  } else {
    steps.push('Rest and drink water or clear fluids regularly while you recover.')
  }

  if (has('constipation')) {
    steps.push(
      'Drink extra water during the day, eat high-fiber foods if your tummy tolerates them, and take gentle walks if comfortable.',
    )
  }

  if (hasFeverOrChills) {
    if (feverAssessment.mode === 'subjective-sensation-only') {
      steps.push(
        'Check your temperature with a thermometer if you have one — feeling hot or cold alone cannot confirm a fever.',
      )
    } else {
      steps.push(
        'Re-check your temperature occasionally and write down the time and reading in case you speak to a doctor.',
      )
    }
  }

  if (hasRespiratory) {
    steps.push(
      'Soothe a sore throat or cough with warm drinks (such as warm water, broth, or tea), and rest your voice if needed.',
    )
  }

  if (has('dizziness')) {
    steps.push(
      'Sit or lie down right away if you feel unsteady, and get up slowly from sitting or lying positions.',
    )
  }

  if (has('headache') && !has('dizziness')) {
    steps.push(
      'Rest in a quiet, comfortable room, reduce bright screen glare, and drink water if you may be dehydrated.',
    )
  }

  if (has('skin-rash') || has('itching')) {
    steps.push(
      'Avoid scratching or putting heavily scented lotions on the skin, and check any new spots with a clear glass to make sure they fade when pressed.',
    )
  }

  if (has('palpitations') || has('anxiety')) {
    steps.push(
      'Sit down in a calm spot, take slow, steady breaths, and skip caffeine, energy drinks, or nicotine until a doctor checks how you are doing.',
    )
  }

  if (validated.spo2.valid && validated.spo2.classification === 'low-caution') {
    steps.push(
      'Warm your hands and re-check your pulse oximeter (finger oxygen sensor) while resting quietly — if it stays under 95%, contact a healthcare professional today.',
    )
  }

  steps.push(
    'Watch how your symptoms change over the next 24 to 48 hours, and ask a doctor or pharmacist before taking medicines or starting leftover prescriptions.',
  )

  return steps.slice(0, 6)
}

/**
 * Deterministic, safety-first health assessment engine.
 *
 * 1. Runs rule-based emergency detection (`evaluateEmergencySafety`) before everything else.
 * 2. Strictly validates optional self-entered measurements; invalid/ambient entries are rejected.
 * 3. Evaluates confirmed symptoms, duration, severity, progression, contextual answers,
 *    fever status, and valid measurements together.
 * 4. Keeps an explicit boundary for a future server-side AI explanation layer (never frontend keys,
 *    never replacing safety rules).
 */
export function generateAssessmentReport(
  data: SymptomCheckInData,
): AssessmentReport {
  const safety = evaluateEmergencySafety(data)
  const effectiveIds = getConfirmedSymptomIds(data)
  const validatedMeasurements = validateAllMeasurements(data.measurements)
  const healthMeasurements = buildHealthMeasurementsSection(validatedMeasurements)
  const feverAssessment = buildFeverAssessment(
    data,
    effectiveIds,
    validatedMeasurements,
  )

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
    userDescribedNotes: data.naturalDescription?.rawText?.trim() || undefined,
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

  const insufficientInformation =
    effectiveIds.length === 0 &&
    !healthMeasurements.hasAnyValidMeasurement &&
    feverAssessment.sensationsReported.length === 0 &&
    feverAssessment.mode !== 'measured-temperature'

  const careGuidance = buildCareGuidance(
    data,
    effectiveIds,
    safety,
    validatedMeasurements,
    insufficientInformation,
  )

  // Interrupt immediately when an emergency rule fires
  if (safety.level === 'emergency') {
    return {
      isEmergencyInterrupted: true,
      insufficientInformation: false,
      safety,
      careGuidance,
      reportedSymptoms,
      healthMeasurements,
      feverAssessment,
      whatInfoMaySuggest: [],
      whyThisIsRelevant: [
        'One or more symptoms or readings you entered match emergency warning signs that need an in-person medical check right away.',
      ],
      whatYouCanDoNext: [
        'Stop using this website and call 112 (or your local emergency number) or go to the nearest emergency hospital immediately.',
        'If someone is with you, let them know how you feel and share what you entered here with the medical team.',
      ],
      whenToSeekMedicalCare: ['Get emergency medical help now.'],
      warningSigns: GENERAL_WARNING_SIGNS,
      transparencyPoints: TRANSPARENCY_POINTS,
      disclaimer: MEDICAL_DISCLAIMER,
      generatedBy: 'deterministic-clinical-rules-v1',
    }
  }

  // Context-aware non-emergency assessment
  const has = (id: string) => effectiveIds.includes(id)
  const hasAnyFeverOrTempCue =
    has('fever') ||
    has('chills') ||
    feverAssessment.sensationsReported.length > 0 ||
    feverAssessment.mode === 'measured-temperature' ||
    (validatedMeasurements.temperature.valid &&
      (validatedMeasurements.temperature.classification === 'fever' ||
        validatedMeasurements.temperature.classification === 'high-fever' ||
        validatedMeasurements.temperature.classification === 'mildly-elevated'))

  const whatInfoMaySuggest: AssessmentExplanationBlock[] = []
  const whyThisIsRelevant: string[] = []
  const whenToSeekMedicalCare: string[] = [...WHEN_TO_CALL_DOCTOR]

  if (insufficientInformation) {
    whatInfoMaySuggest.push(EXPLANATION_LIBRARY['insufficient-info'])
    whyThisIsRelevant.push(
      'You have not selected confirmed symptoms, fever sensations, or valid readings yet.',
    )
  } else {
    // 1. Viral / flu-like cluster (requires fever/fatigue/aches + respiratory/headache)
    if (
      (hasAnyFeverOrTempCue || has('fatigue') || has('body-aches')) &&
      (has('cough') || has('sore-throat') || has('runny-nose') || has('headache'))
    ) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['viral-respiratory-cluster'])
    } else if (has('cough') || has('sore-throat') || has('runny-nose')) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['cough-or-throat-isolated'])
    }

    // 2. Fever or chills not already explained by viral cluster
    if (
      hasAnyFeverOrTempCue &&
      !whatInfoMaySuggest.some((b) => b.id === 'viral-respiratory-cluster')
    ) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['fever-only-or-chills'])
    }

    // 3. Headache / dizziness
    if (has('headache') && has('dizziness')) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['headache-dizziness-cluster'])
    } else if (
      has('headache') &&
      !whatInfoMaySuggest.some((b) => b.id === 'viral-respiratory-cluster')
    ) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['headache-mild-isolated'])
    } else if (has('dizziness') && !has('headache')) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['dizziness-isolated'])
    }

    // 4. Digestive symptoms
    if (has('nausea') || has('vomiting') || has('stomach-pain') || has('diarrhea')) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['digestive-cluster'])
    }
    if (has('constipation')) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['constipation-mild'])
    }

    // 5. Muscle/joint aches (when not already covered by viral cluster)
    if (
      (has('back-pain') || has('joint-pain') || has('body-aches')) &&
      !whatInfoMaySuggest.some((b) => b.id === 'viral-respiratory-cluster')
    ) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['musculoskeletal-aches'])
    }

    // 6. Isolated fatigue (when not already paired with respiratory/fever/digestive/dizziness)
    if (has('fatigue') && whatInfoMaySuggest.length === 0) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['fatigue-isolated'])
    }

    // 7. Palpitations
    if (has('palpitations')) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['palpitations-isolated'])
    }

    // 8. Skin rash or itching
    if (has('skin-rash') || has('itching')) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['skin-rash-or-itching'])
    }

    // 9. Sleep or worry
    if (has('difficulty-sleeping') || has('anxiety')) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['sleep-or-worry'])
    }

    // Safety fallback if nothing matched (for instance, measurement-only check without fever/symptoms)
    if (whatInfoMaySuggest.length === 0) {
      whatInfoMaySuggest.push(EXPLANATION_LIBRARY['insufficient-info'])
    }

    // Build tailored plain-language relevance points from all answers together
    if (confirmedSymptomLabels.length > 1) {
      whyThisIsRelevant.push(
        `We looked at your symptoms together (${confirmedSymptomLabels.join(', ')}) rather than one by one.`,
      )
    } else if (confirmedSymptomLabels.length === 1) {
      whyThisIsRelevant.push(
        `Your main reported symptom is ${confirmedSymptomLabels[0].toLowerCase()}.`,
      )
    }

    if (data.details.severity === 'severe') {
      whyThisIsRelevant.push(
        'You rated how you feel as severe, which means a doctor should check you promptly even without emergency signs.',
      )
      whenToSeekMedicalCare.unshift(
        'Contact a doctor or clinic today because your symptoms feel severe.',
      )
    }

    if (data.details.progression === 'worse') {
      whyThisIsRelevant.push(
        'You noted that your symptoms are getting worse, so getting checked promptly is safer than waiting.',
      )
      whenToSeekMedicalCare.unshift(
        'Contact a doctor or clinic promptly because your symptoms are getting worse.',
      )
    } else if (data.details.progression === 'better') {
      whyThisIsRelevant.push(
        'You noted that your symptoms are getting better, which is encouraging as long as no warning signs show up.',
      )
    }

    if (data.details.duration === 'week-or-more') {
      whyThisIsRelevant.push(
        'Because this has lasted a week or longer, it is a good idea to arrange a check-up with a doctor.',
      )
      whenToSeekMedicalCare.unshift(
        'Arrange a doctor visit soon because your symptoms have lasted a week or more.',
      )
    }

    // Contextual answer nuances
    if (data.contextualAnswers['fluids-hydration'] === 'trouble') {
      whyThisIsRelevant.push(
        'Having trouble keeping fluids down can quickly lead to dehydration (losing too much body water).',
      )
      whenToSeekMedicalCare.unshift(
        'Get medical help promptly if you cannot keep fluids down or notice dark, very little urine.',
      )
    }

    if (
      has('headache') &&
      data.contextualAnswers['headache-onset'] === 'sudden'
    ) {
      whyThisIsRelevant.push(
        'A headache that comes on very suddenly should always be checked promptly by a doctor.',
      )
      whenToSeekMedicalCare.unshift(
        'Get checked by a doctor today because the headache started suddenly.',
      )
    }

    if (
      has('cough') &&
      data.contextualAnswers['cough-type'] === 'mucus'
    ) {
      whyThisIsRelevant.push(
        'You noted your cough brings up mucus, which can happen with chest colds or airway irritation.',
      )
    }

    if (
      has('dizziness') &&
      data.contextualAnswers['dizziness-type'] === 'spinning'
    ) {
      whyThisIsRelevant.push(
        'A room-spinning feeling (often called vertigo) is frequently linked to the balance system inside the inner ear.',
      )
    } else if (
      has('dizziness') &&
      data.contextualAnswers['dizziness-type'] === 'lightheaded'
    ) {
      whyThisIsRelevant.push(
        'Feeling lightheaded when standing up can be tied to low fluids, blood pressure shifts, or fatigue.',
      )
    }

    // Validated measurement nuances
    if (
      validatedMeasurements.temperature.valid &&
      (validatedMeasurements.temperature.classification === 'fever' ||
        validatedMeasurements.temperature.classification === 'high-fever')
    ) {
      whyThisIsRelevant.push(
        `Your entered temperature (${validatedMeasurements.temperature.celsius?.toFixed(1)}°C / ${validatedMeasurements.temperature.fahrenheit?.toFixed(1)}°F) confirms a fever range.`,
      )
    }

    if (
      validatedMeasurements.spo2.valid &&
      validatedMeasurements.spo2.classification === 'low-caution'
    ) {
      whyThisIsRelevant.push(
        `Your entered blood oxygen level (${validatedMeasurements.spo2.percent}%) is lower than the usual 95%–100% range.`,
      )
      whenToSeekMedicalCare.unshift(
        'Speak with a doctor today about a blood oxygen reading below 95%, especially if breathing feels harder.',
      )
    }

    if (
      validatedMeasurements.bloodPressure.valid &&
      (validatedMeasurements.bloodPressure.classification === 'high' ||
        validatedMeasurements.bloodPressure.classification === 'low')
    ) {
      whyThisIsRelevant.push(
        `Your entered blood pressure (${validatedMeasurements.bloodPressure.systolic}/${validatedMeasurements.bloodPressure.diastolic} mmHg) is outside typical resting levels.`,
      )
    }

    if (
      validatedMeasurements.heartRate.valid &&
      (validatedMeasurements.heartRate.classification === 'high-resting' ||
        validatedMeasurements.heartRate.classification === 'low')
    ) {
      whyThisIsRelevant.push(
        `Your entered resting heart rate (${validatedMeasurements.heartRate.bpm} bpm) is outside the usual 60–100 bpm range.`,
      )
    }

    if (healthMeasurements.invalidEntries.length > 0) {
      whyThisIsRelevant.push(
        'We left out readings that looked unrealistic (such as room temperature or out-of-range numbers) so they do not mislead your result.',
      )
    }
  }

  const whatYouCanDoNext = buildActionSteps(
    effectiveIds,
    feverAssessment,
    validatedMeasurements,
  )

  return {
    isEmergencyInterrupted: false,
    insufficientInformation,
    insufficientInfoMessage: insufficientInformation
      ? INSUFFICIENT_INFORMATION_MESSAGE
      : undefined,
    safety,
    careGuidance,
    reportedSymptoms,
    healthMeasurements,
    feverAssessment,
    whatInfoMaySuggest,
    whyThisIsRelevant: Array.from(new Set(whyThisIsRelevant)),
    whatYouCanDoNext,
    whenToSeekMedicalCare: Array.from(new Set(whenToSeekMedicalCare)),
    warningSigns: GENERAL_WARNING_SIGNS,
    transparencyPoints: TRANSPARENCY_POINTS,
    disclaimer: MEDICAL_DISCLAIMER,
    generatedBy: 'deterministic-clinical-rules-v1',
  }
}
