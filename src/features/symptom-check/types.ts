export type SymptomCategoryId =
  | 'head-breathing'
  | 'stomach'
  | 'body-skin'
  | 'sleep-mood'
  | 'urgent'

export interface SymptomCategory {
  id: SymptomCategoryId
  title: string
  description: string
  badgeBg: string
  selectedStyle: string
}

export interface SymptomItem {
  id: string
  label: string
  category: SymptomCategoryId
  helperText?: string
  keywords: string[]
  /** Immediate emergency banner trigger independent of other answers. */
  isEmergencyRedFlag?: boolean
  /** Shows an early urgent-check caution and escalates to full emergency if severe. */
  isCardioRespiratoryCaution?: boolean
}

export type SymptomDuration =
  | 'today'
  | 'yesterday'
  | 'two-to-three-days'
  | 'week-or-more'

export type SymptomSeverity = 'mild' | 'moderate' | 'severe'

export type SymptomProgression = 'better' | 'same' | 'worse'

export interface SymptomDetailsState {
  duration?: SymptomDuration
  severity?: SymptomSeverity
  progression?: SymptomProgression
}

export interface QuestionOption {
  value: string
  label: string
}

export interface ContextualQuestion {
  id: string
  symptomIds: string[]
  question: string
  helper?: string
  options: QuestionOption[]
}

export type ContextualAnswersMap = Record<string, string>

export interface SymptomCheckInData {
  selectedIds: string[]
  details: SymptomDetailsState
  contextualAnswers: ContextualAnswersMap
}

export type EmergencyLevel = 'none' | 'caution' | 'emergency'

export interface EmergencyAssessment {
  level: EmergencyLevel
  headline: string
  message: string
  triggers: string[]
  emergencyNumber: '112'
}
