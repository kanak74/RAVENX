import type { ContextualQuestion } from './types'

const CONTEXTUAL_QUESTION_BANK: ContextualQuestion[] = [
  {
    id: 'fever-temp',
    symptomIds: ['fever', 'chills'],
    question: 'Have you measured your temperature with a thermometer?',
    helper:
      'If you entered a reading in Step 2 or Optional Measurements, select what fits or skip this.',
    options: [
      { value: 'low', label: 'Yes — mild elevation (under 100.4°F / 38°C)' },
      { value: 'moderate', label: 'Yes — 100.4°F to 102°F (38°C to 39°C)' },
      { value: 'high', label: 'Yes — above 102°F (39°C)' },
      { value: 'not-checked', label: 'No, I have not checked yet' },
    ],
  },
  {
    id: 'headache-onset',
    symptomIds: ['headache'],
    question: 'Did the headache start suddenly or gradually?',
    options: [
      { value: 'gradual', label: 'Built up gradually' },
      { value: 'sudden', label: 'Started very suddenly' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
  {
    id: 'headache-redflags',
    symptomIds: ['headache'],
    question: 'Do you also notice neck stiffness or eyes hurting in bright light?',
    helper: 'Helping check warning signs that need fast medical attention.',
    options: [
      { value: 'neither', label: 'No, neither of those' },
      { value: 'light-sensitive', label: 'Yes, bright light hurts my eyes' },
      { value: 'stiff-neck', label: 'Yes, neck feels stiff when bending forward' },
      { value: 'both', label: 'Yes, both stiff neck and light sensitivity' },
    ],
  },
  {
    id: 'palpitations-pattern',
    symptomIds: ['palpitations'],
    question: 'What is the racing or pounding heartbeat doing right now?',
    options: [
      { value: 'brief-stopped', label: 'It happened briefly and already settled' },
      { value: 'comes-and-goes', label: 'It keeps coming and going' },
      { value: 'ongoing-now', label: 'My heart is still racing right now' },
    ],
  },
  {
    id: 'stomach-location',
    symptomIds: ['stomach-pain'],
    question: 'Where does your stomach hurt the most?',
    options: [
      { value: 'upper', label: 'Upper tummy (above belly button)' },
      { value: 'lower', label: 'Lower tummy' },
      { value: 'center', label: 'Around the belly button' },
      { value: 'all-over', label: 'All over or hard to point to one spot' },
    ],
  },
  {
    id: 'cough-type',
    symptomIds: ['cough'],
    question: 'Is your cough dry or bringing up mucus?',
    options: [
      { value: 'dry', label: 'Dry or tickly cough' },
      { value: 'mucus', label: 'Bringing up mucus or phlegm' },
      { value: 'mixed', label: 'A mix of both' },
    ],
  },
  {
    id: 'dizziness-type',
    symptomIds: ['dizziness'],
    question: 'What does the dizziness feel like?',
    options: [
      { value: 'spinning', label: 'The room feels like it is spinning' },
      { value: 'lightheaded', label: 'Lightheaded or weak when standing' },
      { value: 'unsteady', label: 'Unsteady or off-balance' },
    ],
  },
  {
    id: 'rash-spread',
    symptomIds: ['skin-rash'],
    question: 'Does the rash stay red when a clear glass is pressed against it?',
    helper: 'NHS checks advise watching rashes that do not fade under glass pressure.',
    options: [
      { value: 'fades', label: 'Yes, spots fade briefly when pressed' },
      { value: 'slowly-spreading', label: 'Unsure / spreading slowly' },
      { value: 'does-not-fade', label: 'No, spots do not fade under glass' },
    ],
  },
  {
    id: 'chest-feel',
    symptomIds: ['chest-discomfort'],
    question: 'What does the chest discomfort feel like?',
    options: [
      { value: 'mild-ache', label: 'Mild soreness or heartburn feeling' },
      { value: 'deep-breath', label: 'Noticeable mainly when taking a deep breath' },
      { value: 'squeezing', label: 'Heavy, tight, or squeezing pressure' },
    ],
  },
  {
    id: 'fluids-hydration',
    symptomIds: ['vomiting', 'diarrhea', 'nausea'],
    question: 'Are you able to keep water or fluids down?',
    options: [
      { value: 'yes', label: 'Yes, sipping water okay' },
      { value: 'small-sips', label: 'Only tiny sips at a time' },
      { value: 'trouble', label: 'Having trouble keeping fluids down' },
    ],
  },
  {
    id: 'throat-swallow',
    symptomIds: ['sore-throat'],
    question: 'Does it hurt when you swallow food or drinks?',
    options: [
      { value: 'no', label: 'Not really' },
      { value: 'little', label: 'A little uncomfortable' },
      { value: 'painful', label: 'Yes, noticeably painful' },
    ],
  },
]

const FALLBACK_GENERAL_QUESTIONS: ContextualQuestion[] = [
  {
    id: 'general-rest-fluids',
    symptomIds: [],
    question: 'Are you able to rest and drink water comfortably right now?',
    helper: 'Optional — skip if you are just exploring.',
    options: [
      { value: 'yes', label: 'Yes, resting and drinking fine' },
      { value: 'somewhat', label: 'Somewhat, feeling a bit uncomfortable' },
      { value: 'no', label: 'Finding it hard to rest or drink' },
    ],
  },
]

const MAX_CONTEXTUAL_QUESTIONS = 4

/**
 * Selects up to 4 plain-English follow-up questions tailored to the user's
 * selected symptoms, falling back to a single optional comfort question when
 * none of the chosen symptoms require specifics.
 */
export function getContextualQuestions(
  selectedIds: string[],
): ContextualQuestion[] {
  const matched = CONTEXTUAL_QUESTION_BANK.filter((q) =>
    q.symptomIds.some((id) => selectedIds.includes(id)),
  ).slice(0, MAX_CONTEXTUAL_QUESTIONS)

  return matched.length > 0 ? matched : FALLBACK_GENERAL_QUESTIONS
}

export function getContextualQuestionById(
  id: string,
): ContextualQuestion | undefined {
  return (
    CONTEXTUAL_QUESTION_BANK.find((q) => q.id === id) ??
    FALLBACK_GENERAL_QUESTIONS.find((q) => q.id === id)
  )
}
