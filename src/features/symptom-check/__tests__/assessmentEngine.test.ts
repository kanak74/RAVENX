import assert from 'node:assert/strict'
import test from 'node:test'
import { generateAssessmentReport } from '../assessmentEngine'
import { INSUFFICIENT_INFORMATION_MESSAGE } from '../medicalContent'
import { validateAllMeasurements, validateTemperatureInput } from '../measurementValidation'
import { SYMPTOM_CATALOG } from '../symptomCatalog'
import { interpretNaturalSymptomText } from '../symptomInterpreter'
import type { SymptomCheckInData } from '../types'

function baseData(overrides: Partial<SymptomCheckInData> = {}): SymptomCheckInData {
  return {
    selectedIds: [],
    naturalDescription: {
      rawText: '',
      suggestions: [],
      suggestedFeverSensations: [],
    },
    details: {},
    feverCheck: { sensations: [] },
    measurements: {},
    contextualAnswers: {},
    ...overrides,
  }
}

test('1. Mild headache without warning signs -> monitor guidance, never labeled low-risk', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['headache'],
      details: { duration: 'today', severity: 'mild', progression: 'same' },
      contextualAnswers: { 'headache-onset': 'gradual', 'headache-redflags': 'neither' },
    }),
  )

  assert.equal(report.isEmergencyInterrupted, false)
  assert.equal(report.safety.level, 'none')
  assert.equal(report.careGuidance.level, 'monitor')
  assert.ok(!report.careGuidance.label.toLowerCase().includes('low-risk'))
  assert.ok(!report.careGuidance.label.toLowerCase().includes('low risk'))
  assert.equal(report.insufficientInformation, false)
  assert.deepEqual(report.reportedSymptoms.confirmedSymptomLabels, ['Headache'])
  assert.ok(report.whatInfoMaySuggest.some((b) => b.id === 'headache-mild-isolated'))
  assert.ok(report.disclaimer.includes('does not replace a qualified healthcare professional'))
})

test('2. Feverish sensation without measured temperature -> subjective-sensation-only pathway', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['fever'],
      feverCheck: {
        sensations: ['unusually-hot', 'hot-and-cold'],
        measurementStatus: 'feverish-unmeasured',
      },
      details: { duration: 'today', severity: 'mild' },
    }),
  )

  assert.equal(report.isEmergencyInterrupted, false)
  assert.equal(report.feverAssessment.mode, 'subjective-sensation-only')
  assert.ok(report.feverAssessment.explanation.toLowerCase().includes('cannot confirm'))
  assert.ok(report.feverAssessment.thermometerGuidance.toLowerCase().includes('thermometer'))
  assert.equal(report.healthMeasurements.hasAnyValidMeasurement, false)
  assert.ok(report.whatInfoMaySuggest.some((b) => b.id === 'fever-only-or-chills'))
})

test('3. Elevated measured temperature (39.5°C) -> measured-temperature pathway & medical attention', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['fever', 'fatigue'],
      feverCheck: {
        sensations: ['unusually-hot'],
        measurementStatus: 'measured',
        measuredTemperature: { value: '39.5', unit: 'C', site: 'oral' },
      },
      measurements: {
        temperature: { value: '39.5', unit: 'C', site: 'oral' },
        ageGroup: 'adult',
      },
    }),
  )

  assert.equal(report.isEmergencyInterrupted, false)
  assert.equal(report.careGuidance.level, 'medical-attention')
  assert.equal(report.feverAssessment.mode, 'measured-temperature')
  assert.ok(report.feverAssessment.measuredSummary?.includes('39.5°C'))
  assert.equal(report.healthMeasurements.hasAnyValidMeasurement, true)
  const tempItem = report.healthMeasurements.items.find((i) => i.label === 'Body temperature')
  assert.ok(tempItem)
  assert.equal(tempItem.isConcerning, true)
  assert.equal(tempItem.verificationTag, 'Unverified self-entered reading')
})

test('4. Chills with fatigue -> no emergency, fever/chills explanation noted', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['chills', 'fatigue'],
      details: { duration: 'yesterday', severity: 'moderate', progression: 'same' },
    }),
  )

  assert.equal(report.isEmergencyInterrupted, false)
  assert.equal(report.safety.level, 'none')
  assert.ok(report.whatInfoMaySuggest.some((b) => b.id === 'fever-only-or-chills'))
})

test('5. Different symptom combinations produce distinct, relevant explanations & next steps', () => {
  const headacheDizziness = generateAssessmentReport(
    baseData({
      selectedIds: ['headache', 'dizziness'],
      details: { duration: 'today', severity: 'moderate' },
      contextualAnswers: { 'headache-onset': 'gradual', 'dizziness-type': 'lightheaded' },
    }),
  )
  const digestive = generateAssessmentReport(
    baseData({
      selectedIds: ['nausea', 'diarrhea'],
      details: { duration: 'today', severity: 'moderate' },
    }),
  )
  const soreThroatOnly = generateAssessmentReport(
    baseData({
      selectedIds: ['sore-throat'],
      details: { duration: 'today', severity: 'mild' },
    }),
  )

  assert.ok(headacheDizziness.whatInfoMaySuggest.some((b) => b.id === 'headache-dizziness-cluster'))
  assert.ok(digestive.whatInfoMaySuggest.some((b) => b.id === 'digestive-cluster'))
  assert.ok(soreThroatOnly.whatInfoMaySuggest.some((b) => b.id === 'cough-or-throat-isolated'))
  assert.notEqual(
    headacheDizziness.whatYouCanDoNext.join(' '),
    digestive.whatYouCanDoNext.join(' '),
  )
})

test('6. Severe or worsening symptoms are NEVER treated as mild -> medical attention recommended', () => {
  const worseningReport = generateAssessmentReport(
    baseData({
      selectedIds: ['cough', 'sore-throat'],
      details: { duration: 'two-to-three-days', severity: 'moderate', progression: 'worse' },
    }),
  )

  assert.equal(worseningReport.isEmergencyInterrupted, false)
  assert.equal(worseningReport.careGuidance.level, 'medical-attention')
  assert.ok(worseningReport.careGuidance.label.includes('Medical attention recommended'))
  assert.ok(worseningReport.whyThisIsRelevant.some((line) => line.toLowerCase().includes('getting worse')))

  const severeReport = generateAssessmentReport(
    baseData({
      selectedIds: ['stomach-pain'],
      details: { duration: 'today', severity: 'severe', progression: 'same' },
    }),
  )
  assert.equal(severeReport.careGuidance.level, 'medical-attention')
  assert.ok(severeReport.careGuidance.reasons.some((r) => r.toLowerCase().includes('severe')))
})

test('7. Chest pain with difficulty breathing -> emergency triggered immediately', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['severe-chest-pain', 'difficulty-breathing'],
      details: { severity: 'severe' },
    }),
  )

  assert.equal(report.isEmergencyInterrupted, true)
  assert.equal(report.careGuidance.level, 'emergency')
  assert.equal(report.safety.level, 'emergency')
  assert.equal(report.safety.emergencyNumber, '112')
  assert.ok(report.safety.triggers.length >= 2)
  assert.equal(report.whatInfoMaySuggest.length, 0)
})

test('8. Other emergency combos (light-sensitive headache, chest+SOB, rash, SpO2<90, BP crisis, hypothermia, palpitations+dizziness)', () => {
  // 8a: Headache + light sensitivity (contextual answer key 'light-sensitive')
  const lightSensitive = generateAssessmentReport(
    baseData({
      selectedIds: ['headache', 'fever'],
      contextualAnswers: { 'headache-redflags': 'light-sensitive' },
    }),
  )
  assert.equal(lightSensitive.isEmergencyInterrupted, true)

  // 8b: Chest discomfort + shortness of breath
  const chestAndSob = generateAssessmentReport(
    baseData({
      selectedIds: ['chest-discomfort', 'shortness-of-breath'],
    }),
  )
  assert.equal(chestAndSob.isEmergencyInterrupted, true)

  // 8c: Rash not fading under glass
  const rashEmergency = generateAssessmentReport(
    baseData({
      selectedIds: ['skin-rash'],
      contextualAnswers: { 'rash-spread': 'does-not-fade' },
    }),
  )
  assert.equal(rashEmergency.isEmergencyInterrupted, true)

  // 8d: SpO2 < 90%
  const spo2Emergency = generateAssessmentReport(
    baseData({
      selectedIds: ['fatigue'],
      measurements: { spo2: '87' },
    }),
  )
  assert.equal(spo2Emergency.isEmergencyInterrupted, true)

  // 8e: BP crisis >= 180/120
  const bpEmergency = generateAssessmentReport(
    baseData({
      selectedIds: ['headache'],
      measurements: { bloodPressure: { systolic: '190', diastolic: '122' } },
    }),
  )
  assert.equal(bpEmergency.isEmergencyInterrupted, true)

  // 8f: Hypothermia < 35.0°C
  const hypothermiaEmergency = generateAssessmentReport(
    baseData({
      selectedIds: ['chills'],
      measurements: { temperature: { value: '34.5', unit: 'C' } },
    }),
  )
  assert.equal(hypothermiaEmergency.isEmergencyInterrupted, true)

  // 8g: Palpitations + dizziness
  const palpEmergency = generateAssessmentReport(
    baseData({
      selectedIds: ['palpitations', 'dizziness'],
    }),
  )
  assert.equal(palpEmergency.isEmergencyInterrupted, true)
})

test('9. Invalid measurement values (room temp 22C, non-numeric, out-of-range BP/SpO2/HR) rejected & not used', () => {
  const ambientTemp = validateTemperatureInput({ value: '22', unit: 'C' })
  assert.equal(ambientTemp.valid, false)
  assert.equal(ambientTemp.isLikelyAmbientError, true)

  const nonNumericTemp = validateTemperatureInput({ value: 'abc', unit: 'C' })
  assert.equal(nonNumericTemp.valid, false)

  const summary = validateAllMeasurements({
    temperature: { value: '22', unit: 'C' },
    bloodPressure: { systolic: '300', diastolic: '50' },
    heartRate: '10',
    spo2: '105',
  })
  assert.equal(summary.hasErrors, true)
  assert.equal(summary.temperature.valid, false)
  assert.equal(summary.bloodPressure.valid, false)
  assert.equal(summary.heartRate.valid, false)
  assert.equal(summary.spo2.valid, false)

  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['headache'],
      measurements: {
        temperature: { value: '22', unit: 'C' },
        bloodPressure: { systolic: '300', diastolic: '50' },
      },
    }),
  )
  assert.equal(report.healthMeasurements.hasAnyValidMeasurement, false)
  assert.equal(report.healthMeasurements.invalidEntries.length, 2)
})

test('10. Insufficient info / missing measurements -> explicit insufficient message, never invented', () => {
  const emptyReport = generateAssessmentReport(baseData())
  assert.equal(emptyReport.insufficientInformation, true)
  assert.equal(emptyReport.insufficientInfoMessage, INSUFFICIENT_INFORMATION_MESSAGE)
  assert.equal(emptyReport.healthMeasurements.hasAnyValidMeasurement, false)
  assert.equal(emptyReport.healthMeasurements.items.length, 0)
  assert.equal(emptyReport.reportedSymptoms.durationLabel, 'Not specified')
  assert.equal(emptyReport.reportedSymptoms.severityLabel, 'Not specified')
})

test('11. Multiple valid optional measurements reflected accurately & marked unverified', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['fatigue'],
      measurements: {
        temperature: { value: '98.6', unit: 'F', site: 'oral' },
        bloodPressure: { systolic: '118', diastolic: '76' },
        heartRate: '74',
        spo2: '98',
        ageGroup: 'adult',
      },
    }),
  )

  assert.equal(report.isEmergencyInterrupted, false)
  assert.equal(report.healthMeasurements.hasAnyValidMeasurement, true)
  assert.equal(report.healthMeasurements.items.length, 4)
  assert.ok(
    report.healthMeasurements.items.every(
      (i) => i.verificationTag === 'Unverified self-entered reading',
    ),
  )
})

test('12. Natural-language symptoms require confirmation; confirmed emergency natural symptom still triggers emergency', () => {
  const parsed = interpretNaturalSymptomText(
    'My head feels hot and I feel weak and shaky',
  )
  assert.ok(parsed.suggestions.length >= 2)
  assert.ok(parsed.suggestions.every((s) => s.confirmed === false))

  const reportUnconfirmed = generateAssessmentReport(
    baseData({
      naturalDescription: {
        rawText: 'My head feels hot and I feel weak and shaky',
        suggestions: parsed.suggestions,
        suggestedFeverSensations: parsed.suggestedFeverSensations,
      },
    }),
  )
  assert.deepEqual(reportUnconfirmed.reportedSymptoms.confirmedSymptomLabels, [])
  assert.equal(reportUnconfirmed.insufficientInformation, true)

  // Confirmed urgent natural suggestion must still interrupt via emergency safety check
  const confirmedUrgent = generateAssessmentReport(
    baseData({
      naturalDescription: {
        rawText: 'I feel like I cannot breathe',
        suggestions: [
          {
            symptomId: 'difficulty-breathing',
            label: 'Difficulty breathing',
            matchedPhrase: 'cannot breathe',
            confirmed: true,
          },
        ],
        suggestedFeverSensations: [],
      },
    }),
  )
  assert.equal(confirmedUrgent.isEmergencyInterrupted, true)
  assert.equal(confirmedUrgent.safety.level, 'emergency')
})

test('13. Scope check: no diabetes, blood sugar, or glucose screening features exist', () => {
  const allText = SYMPTOM_CATALOG.map(
    (s) => `${s.id} ${s.label} ${s.plainDescription} ${s.keywords.join(' ')}`,
  )
    .join(' ')
    .toLowerCase()

  assert.equal(/diabetes|blood sugar|glucose|insulin|a1c/.test(allText), false)
})

test('14. Stale contextual answers do not trigger emergency if parent symptom was removed', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['headache'],
      contextualAnswers: { 'rash-spread': 'does-not-fade' },
    }),
  )
  assert.equal(report.isEmergencyInterrupted, false)
  assert.equal(report.safety.level, 'none')
})
