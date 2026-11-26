import assert from 'node:assert/strict'
import test from 'node:test'
import { generateAssessmentReport } from '../assessmentEngine'
import {
  buildFallbackAnalysis,
  recommendSpecialistFromInputs,
} from '../specialistMapper'
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

test('1. Specialist mapping matches symptom categories accurately', () => {
  assert.equal(recommendSpecialistFromInputs(['skin-rash', 'itching']).name, 'Dermatologist')
  assert.equal(recommendSpecialistFromInputs(['palpitations']).name, 'Cardiologist')
  assert.equal(recommendSpecialistFromInputs(['stomach-pain', 'nausea']).name, 'Gastroenterologist')
  assert.equal(recommendSpecialistFromInputs(['sore-throat', 'runny-nose']).name, 'ENT Specialist')
  assert.equal(recommendSpecialistFromInputs(['dizziness']).name, 'Neurologist')
  assert.equal(recommendSpecialistFromInputs([], 'I have blurry vision and eye pain').name, 'Ophthalmologist')
  assert.equal(recommendSpecialistFromInputs(['fever', 'fatigue']).name, 'General Physician')
})

test('2. Fallback analysis produces concise summary, 1-3 conditions, urgency, and specialist', () => {
  const data = baseData({
    selectedIds: ['stomach-pain', 'nausea'],
    details: { duration: 'yesterday', severity: 'moderate', progression: 'same' },
  })
  const report = generateAssessmentReport(data)
  const analysis = buildFallbackAnalysis(report, data, [])

  assert.ok(analysis.symptomSummary.includes('Stomach pain'))
  assert.ok(analysis.possibleConditions.length >= 1 && analysis.possibleConditions.length <= 3)
  assert.equal(analysis.urgencyLevel, 'moderate')
  assert.equal(analysis.recommendedSpecialist.name, 'Gastroenterologist')
  assert.ok(analysis.nextStep.length > 10)
})

test('3. Emergency symptoms map to emergency urgency level', () => {
  const data = baseData({
    selectedIds: ['severe-chest-pain', 'shortness-of-breath'],
    details: { duration: 'today', severity: 'severe' },
  })
  const report = generateAssessmentReport(data)
  const analysis = buildFallbackAnalysis(report, data, [])

  assert.equal(analysis.urgencyLevel, 'emergency')
  assert.ok(analysis.nextStep.includes('112'))
})
