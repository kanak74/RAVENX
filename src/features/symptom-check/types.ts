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
  /** Plain, non-medical everyday sentence shown beside or under the symptom name. */
  plainDescription: string
  category: SymptomCategoryId
  helperText?: string
  keywords: string[]
  /** Immediate emergency banner trigger independent of other answers. */
  isEmergencyRedFlag?: boolean
  /** Shows an early urgent-check caution and escalates to full emergency if severe/combined. */
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

export type FeverSensationOption =
  | 'unusually-hot'
  | 'unusually-cold'
  | 'chills-shivering'
  | 'hot-and-cold'
  | 'forehead-warm'

export type FeverMeasurementStatus =
  | 'feverish-unmeasured'
  | 'measured'
  | 'unsure'

export type TemperatureUnit = 'C' | 'F'

export type TemperatureSite = 'oral' | 'ear' | 'forehead' | 'underarm'

export type AgeGroupOption = 'under-18' | 'adult' | 'older-adult'

export interface MeasuredTemperatureInput {
  value: string
  unit: TemperatureUnit
  site?: TemperatureSite
}

export interface FeverCheckState {
  sensations: FeverSensationOption[]
  measurementStatus?: FeverMeasurementStatus
  measuredTemperature?: MeasuredTemperatureInput
}

export interface HealthMeasurementsState {
  temperature?: MeasuredTemperatureInput
  bloodPressure?: {
    systolic: string
    diastolic: string
  }
  heartRate?: string
  spo2?: string
  ageGroup?: AgeGroupOption
}

export interface NaturalDescriptionSuggestion {
  symptomId: string
  label: string
  matchedPhrase: string
  confirmed: boolean
}

export interface NaturalDescriptionState {
  rawText: string
  suggestions: NaturalDescriptionSuggestion[]
  suggestedFeverSensations: FeverSensationOption[]
}

export interface SymptomCheckInData {
  selectedIds: string[]
  naturalDescription: NaturalDescriptionState
  details: SymptomDetailsState
  feverCheck: FeverCheckState
  measurements: HealthMeasurementsState
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

export interface ValidatedTemperatureResult {
  provided: boolean
  valid: boolean
  celsius?: number
  fahrenheit?: number
  unit?: TemperatureUnit
  rawValue?: string
  site?: TemperatureSite
  isLikelyAmbientError?: boolean
  classification?:
    | 'hypothermia-risk'
    | 'below-normal'
    | 'normal'
    | 'mildly-elevated'
    | 'fever'
    | 'high-fever'
    | 'very-high-fever'
  error?: string
  note?: string
}

export interface ValidatedBloodPressureResult {
  provided: boolean
  valid: boolean
  systolic?: number
  diastolic?: number
  classification?:
    | 'low'
    | 'normal'
    | 'elevated-stage'
    | 'high'
    | 'crisis-range'
  error?: string
  note?: string
}

export interface ValidatedHeartRateResult {
  provided: boolean
  valid: boolean
  bpm?: number
  classification?: 'low' | 'normal' | 'elevated' | 'high-resting'
  error?: string
  note?: string
}

export interface ValidatedSpo2Result {
  provided: boolean
  valid: boolean
  percent?: number
  classification?: 'critical-low' | 'low-caution' | 'normal'
  error?: string
  note?: string
}

export interface ValidatedMeasurementsSummary {
  hasAnyEntered: boolean
  hasErrors: boolean
  temperature: ValidatedTemperatureResult
  bloodPressure: ValidatedBloodPressureResult
  heartRate: ValidatedHeartRateResult
  spo2: ValidatedSpo2Result
}

export type FeverAssessmentMode =
  | 'measured-temperature'
  | 'subjective-sensation-only'
  | 'unsure-no-reading'
  | 'none'

export interface FeverAssessmentOutcome {
  mode: FeverAssessmentMode
  headline: string
  explanation: string
  thermometerGuidance: string
  sensationsReported: string[]
  measuredSummary?: string
}

export interface AssessmentExplanationBlock {
  id: string
  title: string
  summary: string
  relevance: string
  sourceLabel: string
}

export type CareGuidanceLevel = 'emergency' | 'medical-attention' | 'monitor'

export interface CareGuidanceSummary {
  level: CareGuidanceLevel
  label: string
  summary: string
  reasons: string[]
}

export interface AssessmentReport {
  isEmergencyInterrupted: boolean
  insufficientInformation: boolean
  insufficientInfoMessage?: string
  safety: EmergencyAssessment
  careGuidance: CareGuidanceSummary
  reportedSymptoms: {
    confirmedSymptomLabels: string[]
    userDescribedNotes?: string
    durationLabel: string
    severityLabel: string
    progressionLabel: string
    ageGroupLabel?: string
    feverSensations: string[]
    contextualQA: { question: string; answer: string }[]
  }
  healthMeasurements: {
    hasAnyValidMeasurement: boolean
    verificationNotice: string
    items: {
      label: string
      readingText: string
      interpretationNote: string
      isConcerning: boolean
      verificationTag: 'Unverified self-entered reading'
    }[]
    invalidEntries: string[]
  }
  feverAssessment: FeverAssessmentOutcome
  whatInfoMaySuggest: AssessmentExplanationBlock[]
  whyThisIsRelevant: string[]
  whatYouCanDoNext: string[]
  whenToSeekMedicalCare: string[]
  warningSigns: string[]
  transparencyPoints: string[]
  disclaimer: string
  generatedBy: 'deterministic-clinical-rules-v1'
}
