import { getSymptomById } from './symptomCatalog'
import type { EmergencyAssessment, SymptomCheckInData } from './types'

/**
 * Deterministic, rule-based safety evaluator (completely independent of AI).
 * Escalates immediately when urgent red-flag symptoms or severe high-risk
 * combinations are selected, without diagnosing or alarming the user.
 */
export function evaluateEmergencySafety(
  data: SymptomCheckInData,
): EmergencyAssessment {
  const { selectedIds, details, contextualAnswers } = data
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

  if (cautionTriggers.length > 0) {
    return {
      level: 'caution',
      headline: 'Check whether urgent care is needed right now',
      message:
        'Chest discomfort or shortness of breath should always be taken seriously. If it feels sudden, heavy, or makes it hard to breathe or talk comfortably, stop and call 112 or go to emergency care right away.',
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
