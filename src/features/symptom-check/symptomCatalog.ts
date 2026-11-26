import type { SymptomCategory, SymptomItem } from './types'

export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: 'head-breathing',
    title: 'Head, Throat & Breathing',
    description: 'Feverish warmth, chills, headache, throat, and breathing feelings',
    badgeBg: 'bg-coral-soft text-charcoal',
    selectedStyle: 'border-coral bg-coral-soft text-charcoal',
  },
  {
    id: 'stomach',
    title: 'Stomach & Digestion',
    description: 'Tummy discomfort, nausea, or bathroom changes',
    badgeBg: 'bg-amber-soft text-charcoal',
    selectedStyle: 'border-[#C48B3B] bg-amber-soft text-charcoal',
  },
  {
    id: 'body-skin',
    title: 'Body, Energy & Skin',
    description: 'Weakness, shivering, muscle aches, joint soreness, or skin changes',
    badgeBg: 'bg-sage-mist text-forest',
    selectedStyle: 'border-forest bg-sage-mist text-charcoal',
  },
  {
    id: 'sleep-mood',
    title: 'Chest, Heartbeat, Sleep & Mood',
    description: 'Heart fluttering, mild chest feelings, sleep, or worry',
    badgeBg: 'bg-coral-soft text-charcoal',
    selectedStyle: 'border-coral-accent bg-coral-soft text-charcoal',
  },
  {
    id: 'urgent',
    title: 'Urgent Signs — Get Help Fast',
    description: 'Tap any of these if they are happening right now',
    badgeBg: 'bg-urgent-soft text-urgent',
    selectedStyle: 'border-urgent bg-urgent-soft text-charcoal',
  },
]

export const SYMPTOM_CATALOG: SymptomItem[] = [
  // Head, Throat & Breathing
  {
    id: 'headache',
    label: 'Headache',
    plainDescription: 'Pain, tightness, or throbbing in the head or temples.',
    category: 'head-breathing',
    helperText: 'Pain, tightness, or throbbing in the head',
    keywords: ['head', 'migraine', 'throbbing', 'ache', 'head hurt'],
  },
  {
    id: 'fever',
    label: 'Fever',
    plainDescription: 'My body feels unusually hot.',
    category: 'head-breathing',
    helperText: 'My body feels unusually hot.',
    keywords: ['temperature', 'hot', 'feverish', 'warm', 'burning up', 'high temp'],
  },
  {
    id: 'chills',
    label: 'Chills',
    plainDescription:
      "I feel cold or shiver even when my surroundings aren't cold.",
    category: 'head-breathing',
    helperText: "I feel cold or shiver even when my surroundings aren't cold.",
    keywords: ['shiver', 'shivering', 'chilly', 'freezing', 'shaking cold'],
  },
  {
    id: 'cough',
    label: 'Cough',
    plainDescription: 'Repeated coughing, either dry or bringing up mucus.',
    category: 'head-breathing',
    helperText: 'Dry cough or bringing up mucus',
    keywords: ['coughing', 'mucus', 'phlegm', 'cold', 'dry cough'],
  },
  {
    id: 'sore-throat',
    label: 'Sore throat',
    plainDescription: 'Scratchiness, rawness, or pain when swallowing.',
    category: 'head-breathing',
    helperText: 'Scratchy or painful when swallowing',
    keywords: ['throat', 'scratchy', 'swallow', 'pain', 'raw throat'],
  },
  {
    id: 'runny-nose',
    label: 'Runny or blocked nose',
    plainDescription: 'Stuffy sinus pressure, sneezing, or dripping nose.',
    category: 'head-breathing',
    helperText: 'Stuffy sinuses, sneezing, or dripping nose',
    keywords: ['stuffy', 'congestion', 'cold', 'sneeze', 'sinus', 'blocked nose'],
  },
  {
    id: 'dizziness',
    label: 'Dizziness',
    plainDescription:
      'I feel lightheaded, unsteady, or like I might lose my balance.',
    category: 'head-breathing',
    helperText:
      'I feel lightheaded, unsteady, or like I might lose my balance.',
    keywords: ['dizzy', 'spinning', 'vertigo', 'lightheaded', 'unsteady', 'balance'],
  },
  {
    id: 'shortness-of-breath',
    label: 'Shortness of breath',
    plainDescription: 'Feeling winded or needing extra effort to catch your breath.',
    category: 'head-breathing',
    helperText: 'Feeling winded or out of breath',
    keywords: ['breath', 'breathing', 'winded', 'air', 'breathless'],
    isCardioRespiratoryCaution: true,
  },

  // Stomach & Digestion
  {
    id: 'stomach-pain',
    label: 'Stomach pain',
    plainDescription: 'Cramps, aching, or soreness anywhere in the belly.',
    category: 'stomach',
    helperText: 'Tummy ache, soreness, or cramps',
    keywords: ['tummy', 'belly', 'abdomen', 'cramp', 'stomach', 'abdominal'],
  },
  {
    id: 'nausea',
    label: 'Nausea',
    plainDescription: 'I feel like vomiting.',
    category: 'stomach',
    helperText: 'I feel like vomiting.',
    keywords: ['queasy', 'sick', 'upset stomach', 'throw up feeling'],
  },
  {
    id: 'vomiting',
    label: 'Vomiting',
    plainDescription: 'Actually throwing up food or liquids.',
    category: 'stomach',
    helperText: 'Throwing up food or fluids',
    keywords: ['throw up', 'puke', 'throwing up', 'sick'],
  },
  {
    id: 'diarrhea',
    label: 'Diarrhea',
    plainDescription: 'Frequent loose or watery bowel movements.',
    category: 'stomach',
    helperText: 'Loose or watery stools',
    keywords: ['loose motion', 'watery', 'bathroom', 'stool'],
  },
  {
    id: 'constipation',
    label: 'Constipation',
    plainDescription: 'Finding it hard or infrequent to pass stools comfortably.',
    category: 'stomach',
    helperText: 'Hard or infrequent stools',
    keywords: ['blocked', 'stool', 'bathroom', 'bloated'],
  },

  // Body, Energy & Skin
  {
    id: 'fatigue',
    label: 'Fatigue',
    plainDescription: 'I feel unusually tired or weak.',
    category: 'body-skin',
    helperText: 'I feel unusually tired or weak.',
    keywords: ['tired', 'exhausted', 'sleepy', 'weak', 'energy', 'shaky', 'drained'],
  },
  {
    id: 'body-aches',
    label: 'Body aches',
    plainDescription: 'Widespread sore or heavy feeling across arms, legs, or muscles.',
    category: 'body-skin',
    helperText: 'General muscle soreness across the body',
    keywords: ['sore', 'muscles', 'flu', 'ache', 'whole body'],
  },
  {
    id: 'back-pain',
    label: 'Back pain',
    plainDescription: 'Aching or stiffness along the upper or lower back.',
    category: 'body-skin',
    helperText: 'Upper or lower back soreness',
    keywords: ['lower back', 'spine', 'sore back'],
  },
  {
    id: 'joint-pain',
    label: 'Joint pain',
    plainDescription: 'Tender or stiff knees, wrists, shoulders, or ankles.',
    category: 'body-skin',
    helperText: 'Sore knees, wrists, or joints',
    keywords: ['knee', 'wrist', 'ankle', 'shoulder', 'stiff', 'joints'],
  },
  {
    id: 'skin-rash',
    label: 'Skin rash',
    plainDescription: 'New spots, red patches, raised bumps, or hives on the skin.',
    category: 'body-skin',
    helperText: 'Red spots, bumps, or patches on skin',
    keywords: ['spots', 'bumps', 'hives', 'red skin', 'rash'],
  },
  {
    id: 'itching',
    label: 'Itching',
    plainDescription: 'Irritated skin that keeps feeling itchy.',
    category: 'body-skin',
    helperText: 'Persistent itchy skin',
    keywords: ['itchy', 'scratch', 'skin'],
  },

  // Chest, Heartbeat, Sleep & Mood
  {
    id: 'palpitations',
    label: 'Palpitations',
    plainDescription:
      "My heart feels like it's racing, pounding, or beating irregularly.",
    category: 'sleep-mood',
    helperText:
      "My heart feels like it's racing, pounding, or beating irregularly.",
    keywords: [
      'heart racing',
      'pounding heart',
      'fluttering',
      'fast heartbeat',
      'irregular heartbeat',
      'heart beat',
    ],
    isCardioRespiratoryCaution: true,
  },
  {
    id: 'chest-discomfort',
    label: 'Chest discomfort',
    plainDescription: 'Mild tightness, soreness, or heavy feeling in the chest.',
    category: 'sleep-mood',
    helperText: 'Chest soreness, heartburn, or tightness',
    keywords: ['chest', 'tightness', 'heartburn', 'pressure'],
    isCardioRespiratoryCaution: true,
  },
  {
    id: 'difficulty-sleeping',
    label: 'Difficulty sleeping',
    plainDescription: 'Trouble falling asleep, waking up often, or unrefreshing rest.',
    category: 'sleep-mood',
    helperText: 'Trouble falling or staying asleep',
    keywords: ['insomnia', 'awake', 'restless', 'sleep'],
  },
  {
    id: 'anxiety',
    label: 'Anxiety or feeling unusually worried',
    plainDescription: 'Feeling tense, uneasy, restless, or unusually overwhelmed.',
    category: 'sleep-mood',
    helperText: 'Unusual worry, restlessness, or tension',
    keywords: ['worried', 'nervous', 'panic', 'stress', 'scared'],
  },

  // Urgent Signs
  {
    id: 'severe-chest-pain',
    label: 'Severe chest pain',
    plainDescription: 'Heavy, crushing, squeezing, or spreading chest pain.',
    category: 'urgent',
    helperText: 'Heavy, sharp, or crushing chest pain',
    keywords: ['chest pain', 'heart', 'crushing', 'tight chest'],
    isEmergencyRedFlag: true,
  },
  {
    id: 'difficulty-breathing',
    label: 'Difficulty breathing',
    plainDescription: 'Struggling to breathe, gasping, or unable to speak full sentences.',
    category: 'urgent',
    helperText: 'Struggling to breathe or speak comfortably',
    keywords: ['cant breathe', 'struggling to breathe', 'choking', 'gasping'],
    isEmergencyRedFlag: true,
  },
  {
    id: 'fainting',
    label: 'Fainting',
    plainDescription: 'Passing out briefly or feeling on the verge of blacking out.',
    category: 'urgent',
    helperText: 'Passing out or nearly blacking out',
    keywords: ['passed out', 'blackout', 'fainted', 'collapse'],
    isEmergencyRedFlag: true,
  },
  {
    id: 'sudden-weakness',
    label: 'Sudden weakness',
    plainDescription: 'Sudden weakness or numbness in your face, arm, or leg.',
    category: 'urgent',
    helperText: 'Sudden weakness or numbness in face, arm, or leg',
    keywords: ['numb', 'numbness', 'drooping', 'weak arm', 'stroke'],
    isEmergencyRedFlag: true,
  },
  {
    id: 'confusion',
    label: 'Confusion',
    plainDescription: 'Sudden difficulty thinking, recognizing surroundings, or speaking clearly.',
    category: 'urgent',
    helperText: 'Sudden trouble thinking or speaking clearly',
    keywords: ['confused', 'disoriented', 'slurred', 'memory'],
    isEmergencyRedFlag: true,
  },
  {
    id: 'severe-allergic-reaction',
    label: 'Severe allergic reaction symptoms',
    plainDescription: 'Sudden swelling of lips, tongue, face, or throat.',
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
    if (item.plainDescription.toLowerCase().includes(normalized)) return true
    if (item.helperText?.toLowerCase().includes(normalized)) return true
    return item.keywords.some((kw) => kw.toLowerCase().includes(normalized))
  })
}
