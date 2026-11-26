import { getSymptomById } from './symptomCatalog'
import { validateAllMeasurements } from './measurementValidation'
import type { EmergencyAssessment, SymptomCheckInData } from './types'

/**
 * Resolves confirmed symptom IDs from explicit selections and user-confirmed
 * natural-language suggestions. Unconfirmed suggestions are never included.
 */
export function getConfirmedSymptomIds(data: SymptomCheckInData): string[] {
  const confirmedNaturalIds = (data.naturalDescription?.suggestions ?? [])
    .filter((s) => s.confirmed)
    .map((s) => s.symptomId)
  return Array.from(new Set([...data.selectedIds, ...confirmedNaturalIds]))
}

/**
 * Deterministic, rule-based safety evaluator (completely independent of AI).
 * Escalates immediately when urgent red-flag symptoms, high-risk symptom
 * combinations, or critical self-entered readings are detected.
 */
export function evaluateEmergencySafety(
  data: SymptomCheckInData,
): EmergencyAssessment {
  const { details, contextualAnswers, measurements } = data
  const effectiveIds = getConfirmedSymptomIds(data)
  const selectedItems = effectiveIds
    .map((id) => getSymptomById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const redFlagTriggers = selectedItems
    .filter((item) => item.isEmergencyRedFlag)
    .map((item) => item.label)

  const extraEmergencyTriggers: string[] = []

  const hasChestDiscomfort = effectiveIds.includes('chest-discomfort')
  const hasShortnessOfBreath = effectiveIds.includes('shortness-of-breath')
  const hasHeadache = effectiveIds.includes('headache')
  const hasPalpitations = effectiveIds.includes('palpitations')
  const hasDizziness = effectiveIds.includes('dizziness')
  const hasFainting = effectiveIds.includes('fainting')

  if (
    hasChestDiscomfort &&
    (details.severity === 'severe' ||
      contextualAnswers['chest-feel'] === 'squeezing')
  ) {
    extraEmergencyTriggers.push('Chest discomfort that feels severe or squeezing')
  }

  if (hasChestDiscomfort && hasShortnessOfBreath) {
    extraEmergencyTriggers.push(
      'Chest discomfort paired with shortness of breath',
    )
  }

  if (
    hasShortnessOfBreath &&
    (details.severity === 'severe' || details.progression === 'worse')
  ) {
    extraEmergencyTriggers.push(
      'Shortness of breath that is severe or getting worse',
    )
  }

  if (
    hasHeadache &&
    details.severity === 'severe' &&
    contextualAnswers['headache-onset'] === 'sudden'
  ) {
    extraEmergencyTriggers.push('Sudden, severe headache')
  }

  // Meningitis warning signs: headache + stiff neck and/or bright light hurting eyes
  const headacheRedFlags = contextualAnswers['headache-redflags']
  if (
    hasHeadache &&
    (headacheRedFlags === 'stiff-neck' ||
      headacheRedFlags === 'light-sensitive' ||
      headacheRedFlags === 'both')
  ) {
    extraEmergencyTriggers.push(
      'Headache with a stiff neck or eyes hurting in bright light',
    )
  }

  // Non-blanching rash (does not fade under clear glass — NHS meningitis warning)
  if (
    effectiveIds.includes('skin-rash') &&
    contextualAnswers['rash-spread'] === 'does-not-fade'
  ) {
    extraEmergencyTriggers.push(
      'Skin rash that does not fade when a clear glass is pressed against it',
    )
  }

  // Palpitations + chest discomfort, shortness of breath, or dizziness (NHS urgent heart warning)
  if (
    hasPalpitations &&
    (hasChestDiscomfort || hasShortnessOfBreath || hasDizziness)
  ) {
    extraEmergencyTriggers.push(
      'Racing or pounding heartbeat along with chest discomfort, breathlessness, or dizziness',
    )
  }

  // Measurement-based emergencies (only valid readings are evaluated)
  if (measurements) {
    const measured = validateAllMeasurements(measurements)

    if (measured.spo2.valid && measured.spo2.classification === 'critical-low') {
      extraEmergencyTriggers.push(
        `Very low blood oxygen reading (${measured.spo2.percent}%)`,
      )
    }

    if (
      measured.bloodPressure.valid &&
      measured.bloodPressure.classification === 'crisis-range'
    ) {
      extraEmergencyTriggers.push(
        `Very high blood pressure reading (${measured.bloodPressure.systolic}/${measured.bloodPressure.diastolic} mmHg)`,
      )
    }

    if (
      measured.bloodPressure.valid &&
      measured.bloodPressure.classification === 'low' &&
      (hasDizziness || hasFainting)
    ) {
      extraEmergencyTriggers.push(
        `Low blood pressure (${measured.bloodPressure.systolic}/${measured.bloodPressure.diastolic} mmHg) with dizziness or fainting`,
      )
    }

    if (
      measured.heartRate.valid &&
      measured.heartRate.classification === 'high-resting' &&
      (hasChestDiscomfort ||
        hasShortnessOfBreath ||
        hasDizziness ||
        hasPalpitations)
    ) {
      extraEmergencyTriggers.push(
        `Very fast resting heart rate (${measured.heartRate.bpm} bpm) with heart or breathing symptoms`,
      )
    }

    if (
      measured.temperature.valid &&
      measured.temperature.classification === 'very-high-fever'
    ) {
      extraEmergencyTriggers.push(
        `Very high body temperature (${measured.temperature.celsius?.toFixed(1)}°C / ${measured.temperature.fahrenheit?.toFixed(1)}°F)`,
      )
    }

    if (
      measured.temperature.valid &&
      measured.temperature.classification === 'hypothermia-risk'
    ) {
      extraEmergencyTriggers.push(
        `Dangerously low body temperature (${measured.temperature.celsius?.toFixed(1)}°C / ${measured.temperature.fahrenheit?.toFixed(1)}°F)`,
      )
    }
  }

  const allEmergencyTriggers = [...redFlagTriggers, ...extraEmergencyTriggers]

  if (allEmergencyTriggers.length > 0) {
    return {
      level: 'emergency',
      headline: 'Get emergency medical help right away',
      message:
        'Based on what you entered, it is safest to have a doctor or emergency team check you in person immediately. Please do not wait or rely on this website.',
      triggers: allEmergencyTriggers,
      emergencyNumber: '112',
    }
  }

  const cautionTriggers = selectedItems
    .filter((item) => item.isCardioRespiratoryCaution)
    .map((item) => item.label)

  if (
    hasPalpitations &&
    contextualAnswers['palpitations-pattern'] === 'ongoing-now'
  ) {
    cautionTriggers.push('Racing or pounding heartbeat happening right now')
  }

  if (cautionTriggers.length > 0) {
    return {
      level: 'caution',
      headline: 'Pay close attention to breathing and heart symptoms',
      message:
        'Chest, breathing, or heartbeat symptoms should always be taken seriously. If anything feels sudden, heavy, worsening, or makes it hard to breathe or speak, call 112 or go to emergency care right away.',
      triggers: cautionTriggers,
      emergencyNumber: '112',
    }
  }

  return {
    level: 'none',
    headline: '',
    message: '',
    triggers: [],
    emergencyNumber: '112',
  }
}
