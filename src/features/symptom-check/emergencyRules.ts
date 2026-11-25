import { getSymptomById } from './symptomCatalog'
import { validateAllMeasurements } from './measurementValidation'
import type { EmergencyAssessment, SymptomCheckInData } from './types'

/**
 * Deterministic, rule-based safety evaluator (completely independent of AI).
 * Escalates immediately when urgent red-flag symptoms or severe high-risk
 * combinations are selected, without diagnosing or alarming the user.
 */
export function evaluateEmergencySafety(
  data: SymptomCheckInData,
): EmergencyAssessment {
  const { selectedIds, details, contextualAnswers, measurements } = data
  const selectedItems = selectedIds
    .map((id) => getSymptomById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const redFlagTriggers = selectedItems
    .filter((item) => item.isEmergencyRedFlag)
    .map((item) => item.label)

  const extraEmergencyTriggers: string[] = []

  const hasChestDiscomfort = selectedIds.includes('chest-discomfort')
  const hasShortnessOfBreath = selectedIds.includes('shortness-of-breath')
  const hasHeadache = selectedIds.includes('headache')
  const hasPalpitations = selectedIds.includes('palpitations')
  const hasDizziness = selectedIds.includes('dizziness')

  if (
    hasChestDiscomfort &&
    (details.severity === 'severe' ||
      contextualAnswers['chest-feel'] === 'squeezing')
  ) {
    extraEmergencyTriggers.push('Chest discomfort with severe or squeezing feeling')
  }

  if (
    hasShortnessOfBreath &&
    (details.severity === 'severe' || details.progression === 'worse')
  ) {
    extraEmergencyTriggers.push('Shortness of breath that is severe or worsening')
  }

  if (
    hasHeadache &&
    details.severity === 'severe' &&
    contextualAnswers['headache-onset'] === 'sudden'
  ) {
    extraEmergencyTriggers.push('Sudden, severe headache')
  }

  // Meningitis warning: headache + stiff neck/photophobia
  const headacheRedFlags = contextualAnswers['headache-redflags']
  if (hasHeadache && (headacheRedFlags === 'stiff-neck' || headacheRedFlags === 'photophobia' || headacheRedFlags === 'both')) {
    extraEmergencyTriggers.push('Headache with stiff neck or sensitivity to light — seek urgent medical care')
  }

  // Rash not fading under glass (non-blanching rash — NHS meningitis guidance)
  if (contextualAnswers['rash-spread'] === 'does-not-fade') {
    extraEmergencyTriggers.push('Rash that does not fade when pressed — this requires immediate emergency care (call 112)')
  }

  // Palpitations + chest pain/shortness of breath/fainting (NHS emergency combination)
  if (
    hasPalpitations &&
    (hasChestDiscomfort || hasShortnessOfBreath || hasDizziness)
  ) {
    extraEmergencyTriggers.push('Heart palpitations combined with chest discomfort, shortness of breath, or dizziness')
  }

  // Measurement-based emergencies
  if (measurements) {
    const measured = validateAllMeasurements(measurements)

    // SpO2 < 90% — critically low oxygen, emergency
    if (measured.spo2.valid && measured.spo2.classification === 'critical-low') {
      extraEmergencyTriggers.push(`Blood oxygen reading critically low (${measured.spo2.percent}%) — seek emergency care immediately`)
    }

    // BP crisis range ≥ 180/120 mmHg
    if (measured.bloodPressure.valid && measured.bloodPressure.classification === 'crisis-range') {
      extraEmergencyTriggers.push(`Blood pressure reading in crisis range (${measured.bloodPressure.systolic}/${measured.bloodPressure.diastolic} mmHg) — seek emergency care`)
    }

    // Very high fever ≥ 40°C / 104°F
    if (measured.temperature.valid && measured.temperature.classification === 'very-high-fever') {
      extraEmergencyTriggers.push(`Temperature reading very high (${measured.temperature.celsius?.toFixed(1)}°C) — seek urgent medical attention`)
    }
  }

  const allEmergencyTriggers = [...redFlagTriggers, ...extraEmergencyTriggers]

  if (allEmergencyTriggers.length > 0) {
    return {
      level: 'emergency',
      headline: 'Please get emergency medical help right away',
      message:
        'Because of what you selected, it is safest to have a doctor or emergency team check you in person immediately. Please do not wait for this website to finish.',
      triggers: allEmergencyTriggers,
      emergencyNumber: '112',
    }
  }

  const cautionTriggers = selectedItems
    .filter((item) => item.isCardioRespiratoryCaution)
    .map((item) => item.label)

  // Palpitations with ongoing pattern — escalate to caution
  if (hasPalpitations && contextualAnswers['palpitations-pattern'] === 'ongoing-now') {
    cautionTriggers.push('Palpitations that are happening right now')
  }

  if (cautionTriggers.length > 0) {
    return {
      level: 'caution',
      headline: 'Check whether urgent care is needed right now',
      message:
        'Some of your selected symptoms should always be taken seriously. If anything feels sudden, severe, or makes it hard to breathe, speak, or stay conscious — stop and call 112 or go to emergency care right away.',
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
