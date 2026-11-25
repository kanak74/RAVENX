import type { SymptomCategory, SymptomItem } from './types'

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: 'head-breathing',
    title: 'Head, Throat & Breathing',
    description: 'Common cold, fever, throat, and breathing feelings',
    badgeBg: 'bg-coral-soft text-ink',
    selectedStyle: 'border-[#E3593F] bg-coral-soft text-ink',
  },
  {
    id: 'stomach',
    title: 'Stomach & Digestion',
    description: 'Tummy discomfort, nausea, or bathroom changes',
    badgeBg: 'bg-butter-soft text-ink',
    selectedStyle: 'border-[#D4A22B] bg-butter-soft text-ink',
  },
  {
    id: 'body-skin',
    title: 'Body, Energy & Skin',
    description: 'Aches, tiredness, joint soreness, or skin changes',
    badgeBg: 'bg-green-soft text-[#194E35]',
    selectedStyle: 'border-green bg-green-soft text-ink',
  },
  {
    id: 'sleep-mood',
    title: 'Sleep, Chest & Mood',
    description: 'Rest, mild chest feelings, or emotional stress',
    badgeBg: 'bg-pink-soft text-ink',
    selectedStyle: 'border-[#D97890] bg-pink-soft text-ink',
  },
  {
    id: 'urgent',
    title: 'Urgent Signs — Get Help Fast',
    description: 'Tap any of these if they are happening right now',
    badgeBg: 'bg-tomato-soft text-[#8F2118]',
    selectedStyle: 'border-tomato bg-tomato-soft text-ink',
  },
]

export const SYMPTOM_CATALOG: SymptomItem[] = [
  // Head, Throat & Breathing
  {
    id: 'headache',
    label: 'Headache',
    category: 'head-breathing',
    keywords: ['head', 'migraine', 'throbbing', 'ache'],
  },
  {
    id: 'fever',
    label: 'Fever',
    category: 'head-breathing',
    helperText: 'Feeling hot, warm, or chills',
    keywords: ['temperature', 'hot', 'chills', 'warm'],
  },
  {
    id: 'cough',
    label: 'Cough',
    category: 'head-breathing',
    keywords: ['coughing', 'mucus', 'phlegm', 'cold'],
  },
  {
    id: 'sore-throat',
    label: 'Sore throat',
    category: 'head-breathing',
    keywords: ['throat', 'scratchy', 'swallow', 'pain'],
  },
  {
    id: 'runny-nose',
    label: 'Runny or blocked nose',
    category: 'head-breathing',
    keywords: ['stuffy', 'congestion', 'cold', 'sneeze', 'sinus'],
  },
  {
    id: 'dizziness',
    label: 'Dizziness',
    category: 'head-breathing',
    helperText: 'Lightheaded or feeling like spinning',
    keywords: ['dizzy', 'spinning', 'vertigo', 'lightheaded'],
  },
  {
    id: 'shortness-of-breath',
    label: 'Shortness of breath',
    category: 'head-breathing',
    helperText: 'Feeling winded or out of breath',
    keywords: ['breath', 'breathing', 'winded', 'air'],
    isCardioRespiratoryCaution: true,
  },

  // Stomach & Digestion
  {
    id: 'stomach-pain',
    label: 'Stomach pain',
    category: 'stomach',
    helperText: 'Tummy ache or cramps',
    keywords: ['tummy', 'belly', 'abdomen', 'cramp', 'stomach'],
  },
  {
    id: 'nausea',
    label: 'Nausea',
    category: 'stomach',
    helperText: 'Feeling queasy or sick',
    keywords: ['queasy', 'sick', 'upset stomach'],
  },
  {
    id: 'vomiting',
    label: 'Vomiting',
    category: 'stomach',
    keywords: ['throw up', 'puke', 'throwing up', 'sick'],
  },
  {
    id: 'diarrhea',
    label: 'Diarrhea',
    category: 'stomach',
    helperText: 'Loose or watery stools',
    keywords: ['loose motion', 'watery', 'bathroom', 'poop'],
  },
  {
    id: 'constipation',
    label: 'Constipation',
    category: 'stomach',
    helperText: 'Hard to pass stools',
    keywords: ['blocked', 'stool', 'bathroom', 'bloated'],
  },

  // Body, Energy & Skin
  {
    id: 'fatigue',
    label: 'Fatigue',
    category: 'body-skin',
    helperText: 'Feeling very tired or worn out',
    keywords: ['tired', 'exhausted', 'sleepy', 'weak', 'energy'],
  },
  {
    id: 'body-aches',
    label: 'Body aches',
    category: 'body-skin',
    keywords: ['sore', 'muscles', 'flu', 'ache'],
  },
  {
    id: 'back-pain',
    label: 'Back pain',
    category: 'body-skin',
    keywords: ['lower back', 'spine', 'sore back'],
  },
  {
    id: 'joint-pain',
    label: 'Joint pain',
    category: 'body-skin',
    helperText: 'Sore knees, wrists, or joints',
    keywords: ['knee', 'wrist', 'ankle', 'shoulder', 'stiff'],
  },
  {
    id: 'skin-rash',
    label: 'Skin rash',
    category: 'body-skin',
    helperText: 'Red spots, bumps, or patches',
    keywords: ['spots', 'bumps', 'hives', 'red skin'],
  },
  {
    id: 'itching',
    label: 'Itching',
    category: 'body-skin',
    keywords: ['itchy', 'scratch', 'skin'],
  },

  // Sleep, Chest & Mood
  {
    id: 'chest-discomfort',
    label: 'Chest discomfort',
    category: 'sleep-mood',
    keywords: ['chest', 'tightness', 'heartburn', 'pressure'],
    isCardioRespiratoryCaution: true,
  },
  {
    id: 'difficulty-sleeping',
    label: 'Difficulty sleeping',
    category: 'sleep-mood',
    keywords: ['insomnia', 'awake', 'restless', 'sleep'],
  },
  {
    id: 'anxiety',
    label: 'Anxiety or feeling unusually worried',
    category: 'sleep-mood',
    keywords: ['worried', 'nervous', 'panic', 'stress', 'scared'],
  },

  // Urgent Signs
  {
    id: 'severe-chest-pain',
    label: 'Severe chest pain',
    category: 'urgent',
    helperText: 'Heavy, sharp, or crushing chest pain',
    keywords: ['chest pain', 'heart', 'crushing', 'tight chest'],
    isEmergencyRedFlag: true,
  },
  {
    id: 'difficulty-breathing',
    label: 'Difficulty breathing',
    category: 'urgent',
    helperText: 'Struggling to breathe or speak comfortably',
    keywords: ['cant breathe', 'struggling to breathe', 'choking', 'gasping'],
    isEmergencyRedFlag: true,
  },
  {
    id: 'fainting',
    label: 'Fainting',
    category: 'urgent',
    helperText: 'Passing out or nearly blacking out',
    keywords: ['passed out', 'blackout', 'fainted', 'collapse'],
    isEmergencyRedFlag: true,
  },
  {
    id: 'sudden-weakness',
    label: 'Sudden weakness',
    category: 'urgent',
    helperText: 'Sudden weakness or numbness in face, arm, or leg',
    keywords: ['numb', 'numbness', 'drooping', 'weak arm', 'stroke'],
    isEmergencyRedFlag: true,
  },
  {
    id: 'confusion',
    label: 'Confusion',
    category: 'urgent',
    helperText: 'Sudden trouble thinking or speaking clearly',
    keywords: ['confused', 'disoriented', 'slurred', 'memory'],
    isEmergencyRedFlag: true,
  },
  {
    id: 'severe-allergic-reaction',
    label: 'Severe allergic reaction symptoms',
    category: 'urgent',
    helperText: 'Swelling of lips, tongue, face, or throat',
    keywords: ['allergy', 'allergic', 'swollen lips', 'swelling', 'anaphylaxis'],
    isEmergencyRedFlag: true,
  },
]

const SYMPTOM_MAP = new Map(SYMPTOM_CATALOG.map((item) => [item.id, item]))

export function getSymptomById(id: string): SymptomItem | undefined {
  return SYMPTOM_MAP.get(id)
}

export function filterSymptoms(query: string): SymptomItem[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return SYMPTOM_CATALOG

  return SYMPTOM_CATALOG.filter((item) => {
    if (item.label.toLowerCase().includes(normalized)) return true
    if (item.helperText?.toLowerCase().includes(normalized)) return true
    return item.keywords.some((kw) => kw.toLowerCase().includes(normalized))
  })
}
