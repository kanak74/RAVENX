import type { MlPredictionItem } from '../../utils/pdfReport'
import type { AssessmentReport, SymptomCheckInData } from './types'

export type SimpleUrgencyLevel = 'low' | 'moderate' | 'high' | 'emergency'

export interface SimplePossibleCondition {
  name: string
  explanation: string
}

export interface SimpleSpecialistRecommendation {
  name: string
  reason: string
}

export interface SimpleSymptomAnalysisResult {
  symptomSummary: string
  possibleConditions: SimplePossibleCondition[]
  urgencyLevel: SimpleUrgencyLevel
  urgencyReason: string
  recommendedSpecialist: SimpleSpecialistRecommendation
  nextStep: string
  followUpQuestion?: string
  source: 'ai' | 'rules'
}

export const URGENCY_CONFIG: Record<
  SimpleUrgencyLevel,
  {
    label: string
    description: string
    containerClass: string
    badgeClass: string
    dotColor: string
  }
> = {
  low: {
    label: 'Low',
    description: 'Routine medical consultation may be appropriate.',
    containerClass: 'border-forest/25 bg-sage-mist/60',
    badgeClass: 'bg-forest text-paper',
    dotColor: '#174B42',
  },
  moderate: {
    label: 'Moderate',
    description: 'Consult a healthcare professional soon.',
    containerClass: 'border-[#C48B3B]/45 bg-amber-soft/65',
    badgeClass: 'bg-[#A66E1E] text-paper',
    dotColor: '#A66E1E',
  },
  high: {
    label: 'High',
    description: 'Seek prompt medical attention.',
    containerClass: 'border-coral bg-coral-soft/75',
    badgeClass: 'bg-coral text-paper',
    dotColor: '#D95D39',
  },
  emergency: {
    label: 'Emergency',
    description: 'Seek emergency medical assistance immediately.',
    containerClass: 'border-urgent bg-urgent-soft',
    badgeClass: 'bg-urgent text-paper',
    dotColor: '#B83A32',
  },
}

interface SpecialistRule {
  name: string
  reason: string
  symptomIds: string[]
  keywords: RegExp
}

const SPECIALIST_RULES: SpecialistRule[] = [
  {
    name: 'Cardiologist',
    reason:
      'Heart-related symptoms like chest discomfort or palpitations should be checked by a heart specialist.',
    symptomIds: ['palpitations', 'chest-discomfort', 'severe-chest-pain'],
    keywords: /\b(heart|chest|palpitation|pulse|blood pressure)\b/i,
  },
  {
    name: 'Ophthalmologist',
    reason:
      'Eye or vision symptoms are best evaluated by an eye specialist to protect your sight.',
    symptomIds: [],
    keywords: /\b(eye|eyes|vision|blurry|blurred|red eye|eye pain)\b/i,
  },
  {
    name: 'Dermatologist',
    reason:
      'Skin rashes, itching, or irritation are best checked by a skin specialist.',
    symptomIds: ['skin-rash', 'itching'],
    keywords: /\b(skin|rash|itch|itching|hives|eczema|acne|spots|blister)\b/i,
  },
  {
    name: 'Gastroenterologist',
    reason:
      'Stomach pain, nausea, or digestive issues are best evaluated by a digestive health specialist.',
    symptomIds: ['stomach-pain', 'nausea', 'vomiting', 'diarrhea', 'constipation'],
    keywords: /\b(stomach|belly|tummy|abdomen|acid|reflux|gastritis|nausea|vomit|diarrhea|constipat|digestion)\b/i,
  },
  {
    name: 'ENT Specialist',
    reason:
      'Ear, nose, sinus, or throat symptoms are commonly treated by an Ear, Nose, and Throat (ENT) specialist.',
    symptomIds: ['sore-throat', 'runny-nose'],
    keywords: /\b(ear|nose|throat|sinus|tonsil|hearing|hoarse|earache)\b/i,
  },
  {
    name: 'Neurologist',
    reason:
      'Persistent headaches, dizziness, or nerve-related symptoms may need evaluation by a brain and nerve specialist.',
    symptomIds: ['dizziness', 'sudden-weakness', 'confusion', 'fainting'],
    keywords: /\b(migraine|vertigo|numbness|tingling|nerve|seizure|tremor|memory)\b/i,
  },
  {
    name: 'Pulmonologist',
    reason:
      'Ongoing cough or breathing discomfort is best assessed by a lung and breathing specialist.',
    symptomIds: ['shortness-of-breath'],
    keywords: /\b(asthma|wheez|bronchitis|lung|breathing)\b/i,
  },
  {
    name: 'Orthopedist',
    reason:
      'Joint, bone, or persistent back pain is best evaluated by a bone and joint specialist.',
    symptomIds: ['joint-pain', 'back-pain'],
    keywords: /\b(joint|knee|shoulder|back pain|spine|bone|sprain|swollen joint)\b/i,
  },
]

export function recommendSpecialistFromInputs(
  symptomIds: string[],
  rawText = '',
  mlPredictions: MlPredictionItem[] = [],
): SimpleSpecialistRecommendation {
  const idSet = new Set(symptomIds)

  // Check explicit symptom IDs first (prioritizing specific organ systems)
  for (const rule of SPECIALIST_RULES) {
    if (rule.symptomIds.some((id) => idSet.has(id))) {
      return { name: rule.name, reason: rule.reason }
    }
  }

  // Check natural language keywords
  if (rawText.trim()) {
    for (const rule of SPECIALIST_RULES) {
      if (rule.keywords.test(rawText)) {
        return { name: rule.name, reason: rule.reason }
      }
    }
  }

  // Check top ML prediction specialist if specific
  const mlSpec = mlPredictions[0]?.recommendedSpecialist?.trim()
  if (mlSpec && mlSpec.toLowerCase() !== 'general physician') {
    return {
      name: mlSpec,
      reason: `Based on your symptom pattern, a ${mlSpec} can provide targeted evaluation.`,
    }
  }

  // Default: General Physician
  return {
    name: 'General Physician',
    reason:
      'A General Physician is the best starting point to examine your symptoms, run basic checks, and guide next steps.',
  }
}

export function deriveUrgencyLevel(
  report: AssessmentReport,
  rawData?: SymptomCheckInData,
): { level: SimpleUrgencyLevel; reason: string } {
  if (report.isEmergencyInterrupted || report.safety.level === 'emergency') {
    return {
      level: 'emergency',
      reason:
        report.safety.triggers[0] ||
        'Your symptoms include warning signs that need immediate emergency care.',
    }
  }

  if (report.safety.level === 'caution') {
    return {
      level: 'high',
      reason:
        report.careGuidance.reasons[0] ||
        'Some of your symptoms or readings should be checked promptly by a doctor today.',
    }
  }

  if (report.careGuidance.level === 'medical-attention') {
    const isSevereOrWorse =
      rawData?.details.severity === 'severe' ||
      rawData?.details.progression === 'worse'
    return {
      level: isSevereOrWorse ? 'high' : 'moderate',
      reason:
        report.careGuidance.reasons[0] ||
        report.careGuidance.summary,
    }
  }

  if (rawData?.details.severity === 'moderate') {
    return {
      level: 'moderate',
      reason: 'Your symptoms feel moderate, so checking in with a doctor soon is sensible.',
    }
  }

  return {
    level: 'low',
    reason:
      'No urgent warning signs were reported. A routine check-up is appropriate if symptoms continue.',
  }
}

function buildFallbackConditions(
  report: AssessmentReport,
  mlPredictions: MlPredictionItem[],
): SimplePossibleCondition[] {
  if (mlPredictions.length > 0) {
    return mlPredictions.slice(0, 3).map((pred) => ({
      name: pred.condition,
      explanation:
        pred.summary ||
        'This is a possible match based on the symptoms you shared, though only a doctor can confirm.',
    }))
  }

  return report.whatInfoMaySuggest.slice(0, 3).map((block) => ({
    name: block.title,
    explanation: block.summary,
  }))
}

export function buildFallbackAnalysis(
  report: AssessmentReport,
  rawData?: SymptomCheckInData,
  mlPredictions: MlPredictionItem[] = [],
): SimpleSymptomAnalysisResult {
  const labels = report.reportedSymptoms.confirmedSymptomLabels
  const notes = report.reportedSymptoms.userDescribedNotes?.trim()

  let symptomSummary = 'No specific symptoms were provided.'
  if (labels.length > 0) {
    const timing =
      report.reportedSymptoms.durationLabel &&
      report.reportedSymptoms.durationLabel !== 'Not specified'
        ? ` (${report.reportedSymptoms.durationLabel.toLowerCase()})`
        : ''
    symptomSummary = `You reported ${labels.join(', ')}${timing}.`
  } else if (notes) {
    symptomSummary = `You described: "${notes.slice(0, 140)}${notes.length > 140 ? '…' : ''}"`
  }

  const urgency = deriveUrgencyLevel(report, rawData)
  const specialist = recommendSpecialistFromInputs(
    rawData?.selectedIds ?? [],
    notes ?? '',
    mlPredictions,
  )

  const possibleConditions = report.insufficientInformation
    ? []
    : buildFallbackConditions(report, mlPredictions)

  const nextStep =
    urgency.level === 'emergency'
      ? 'Call 112 or go to the nearest emergency hospital immediately. Do not wait for an online result.'
      : urgency.level === 'high'
        ? `Book an urgent visit with a ${specialist.name} or visit a nearby clinic today. Seek emergency care if symptoms worsen.`
        : `Consider consulting a ${specialist.name} for a proper check-up, especially if your symptoms last more than a few days or get worse.`

  return {
    symptomSummary,
    possibleConditions,
    urgencyLevel: urgency.level,
    urgencyReason: urgency.reason,
    recommendedSpecialist: specialist,
    nextStep,
    followUpQuestion: report.insufficientInformation
      ? 'Could you share a bit more about what you are feeling and how long it has lasted?'
      : undefined,
    source: 'rules',
  }
}
