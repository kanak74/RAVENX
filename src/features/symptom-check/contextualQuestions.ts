import type { ContextualQuestion } from './types'

const CONTEXTUAL_QUESTION_BANK: ContextualQuestion[] = [
  {
    id: 'fever-temp',
    symptomIds: ['fever'],
    question: 'Have you measured your temperature?',
    helper: 'If you do not have a thermometer nearby, that is completely okay.',
    options: [
      { value: 'low', label: 'Yes — mild fever (under 100.4°F / 38°C)' },
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
    question: 'Is the skin rash spreading or staying in one place?',
    options: [
      { value: 'one-spot', label: 'Staying in one spot' },
      { value: 'slowly-spreading', label: 'Spreading slowly' },
      { value: 'quickly-spreading', label: 'Spreading quickly' },
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
    symptomIds: ['vomiting', 'diarrhea'],
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
 * none of the chosen symptoms require specifics (or when exploring).
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
