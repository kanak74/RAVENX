import assert from 'node:assert/strict'
import test from 'node:test'
import { generateAssessmentReport } from '../assessmentEngine'
import { validateAllMeasurements, validateTemperatureInput } from '../measurementValidation'
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

test('1. Mild headache without warning signs -> no emergency, cautious isolated headache guidance', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['headache'],
      details: { duration: 'today', severity: 'mild', progression: 'same' },
      contextualAnswers: { 'headache-onset': 'gradual', 'headache-redflags': 'none' },
    }),
  )

  assert.equal(report.isEmergencyInterrupted, false)
  assert.equal(report.safety.level, 'none')
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
})

test('3. Elevated measured temperature (39.5°C) -> measured-temperature pathway & high-fever classification', () => {
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
  assert.equal(report.feverAssessment.mode, 'measured-temperature')
  assert.ok(report.feverAssessment.measuredSummary?.includes('39.5°C'))
  assert.equal(report.healthMeasurements.hasAnyValidMeasurement, true)
  const tempItem = report.healthMeasurements.items.find((i) => i.label === 'Body Temperature')
  assert.ok(tempItem)
  assert.equal(tempItem.isConcerning, true)
  assert.equal(tempItem.verificationTag, 'Unverified self-entered reading')
})

test('4. Chills with fatigue -> no emergency, chills+fatigue pattern noted', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['chills', 'fatigue'],
      details: { duration: 'yesterday', severity: 'moderate', progression: 'same' },
    }),
  )

  assert.equal(report.isEmergencyInterrupted, false)
  assert.equal(report.safety.level, 'none')
  assert.ok(report.whatInfoMaySuggest.some((b) => b.id === 'fever-chills-fatigue'))
})

test('5. Headache with dizziness -> no emergency unless sudden severe onset, cluster noted', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['headache', 'dizziness'],
      details: { duration: 'today', severity: 'moderate' },
      contextualAnswers: { 'headache-onset': 'gradual' },
    }),
  )

  assert.equal(report.isEmergencyInterrupted, false)
  assert.ok(report.whatInfoMaySuggest.some((b) => b.id === 'headache-dizziness-cluster'))
})

test('6. Worsening symptoms -> progression weighted and medical review advised', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['cough', 'sore-throat'],
      details: { duration: 'two-to-three-days', severity: 'moderate', progression: 'worse' },
    }),
  )

  assert.equal(report.isEmergencyInterrupted, false)
  assert.equal(report.reportedSymptoms.progressionLabel, 'Getting worse')
  assert.ok(report.whyThisIsRelevant.some((line) => line.toLowerCase().includes('getting worse')))
  assert.ok(report.whenToSeekMedicalCare.some((line) => line.toLowerCase().includes('worsening')))
})

test('7. Chest pain with difficulty breathing -> emergency triggered immediately', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['severe-chest-pain', 'difficulty-breathing'],
      details: { severity: 'severe' },
    }),
  )

  assert.equal(report.isEmergencyInterrupted, true)
  assert.equal(report.safety.level, 'emergency')
  assert.equal(report.safety.emergencyNumber, '112')
  assert.ok(report.safety.triggers.length >= 2)
  assert.equal(report.whatInfoMaySuggest.length, 0)
})

test('8. Other emergency warning-sign combos (stiff neck, non-blanching rash, SpO2 < 90, BP crisis, palpitations + dizziness)', () => {
  // 8a: Headache + stiff neck
  const meningitisWarning = generateAssessmentReport(
    baseData({
      selectedIds: ['headache', 'fever'],
      contextualAnswers: { 'headache-redflags': 'both' },
    }),
  )
  assert.equal(meningitisWarning.isEmergencyInterrupted, true)
  assert.equal(meningitisWarning.safety.level, 'emergency')

  // 8b: Rash not fading under glass
  const rashEmergency = generateAssessmentReport(
    baseData({
      selectedIds: ['skin-rash'],
      contextualAnswers: { 'rash-spread': 'does-not-fade' },
    }),
  )
  assert.equal(rashEmergency.isEmergencyInterrupted, true)

  // 8c: SpO2 < 90%
  const spo2Emergency = generateAssessmentReport(
    baseData({
      selectedIds: ['fatigue'],
      measurements: { spo2: '87' },
    }),
  )
  assert.equal(spo2Emergency.isEmergencyInterrupted, true)

  // 8d: BP crisis ≥ 180/120
  const bpEmergency = generateAssessmentReport(
    baseData({
      selectedIds: ['headache'],
      measurements: { bloodPressure: { systolic: '190', diastolic: '122' } },
    }),
  )
  assert.equal(bpEmergency.isEmergencyInterrupted, true)

  // 8e: Palpitations + dizziness
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

test('10. Assessment with no optional health measurements still completes cleanly', () => {
  const report = generateAssessmentReport(
    baseData({
      selectedIds: ['sore-throat', 'runny-nose'],
      details: { duration: 'yesterday', severity: 'mild' },
    }),
  )

  assert.equal(report.isEmergencyInterrupted, false)
  assert.equal(report.healthMeasurements.hasAnyValidMeasurement, false)
  assert.equal(report.healthMeasurements.items.length, 0)
  assert.ok(report.whatInfoMaySuggest.length > 0)
})

test('11. Assessment with multiple valid optional measurements reflects all of them', () => {
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
  assert.ok(report.healthMeasurements.items.every((i) => i.verificationTag === 'Unverified self-entered reading'))
})

test('12. Natural-language symptoms require confirmation and are NEVER silently confirmed', () => {
  const parsed = interpretNaturalSymptomText(
    'My head feels hot and I feel weak and shaky',
  )
  assert.ok(parsed.suggestions.length >= 2)
  assert.ok(parsed.suggestions.every((s) => s.confirmed === false))

  // Passing unconfirmed suggestions into assessment engine must NOT include them
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

  // Confirming one suggestion includes only the confirmed one
  const confirmedOne = parsed.suggestions.map((s, idx) =>
    idx === 0 ? { ...s, confirmed: true } : s,
  )
  const reportConfirmed = generateAssessmentReport(
    baseData({
      naturalDescription: {
        rawText: 'My head feels hot and I feel weak and shaky',
        suggestions: confirmedOne,
        suggestedFeverSensations: parsed.suggestedFeverSensations,
      },
    }),
  )
  assert.equal(reportConfirmed.reportedSymptoms.confirmedSymptomLabels.length, 1)
})
