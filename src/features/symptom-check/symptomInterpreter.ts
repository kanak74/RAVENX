import { getSymptomById } from './symptomCatalog'
import type {
  FeverSensationOption,
  NaturalDescriptionSuggestion,
} from './types'

interface InterpretationRule {
  symptomId: string
  patterns: RegExp[]
}

const INTERPRETATION_RULES: InterpretationRule[] = [
  {
    symptomId: 'fever',
    patterns: [
      /\b(fever|feverish|burning up|high temp|temperature|feel(s|ing)? hot|head feels hot|warm forehead|hot and cold)\b/i,
    ],
  },
  {
    symptomId: 'chills',
    patterns: [
      /\b(chill(s|y)?|shiver(ing|s)?|hands are cold|feel(s|ing)? cold|freezing|alternating between feeling hot and cold|hot and cold)\b/i,
    ],
  },
  {
    symptomId: 'headache',
    patterns: [/\b(headache|head ache|migraine|head hurt(s)?|throbbing head)\b/i],
  },
  {
    symptomId: 'fatigue',
    patterns: [
      /\b(tired|exhausted|fatigue|weak|weakness|shaky|drained|worn out|no energy|low energy)\b/i,
    ],
  },
  {
    symptomId: 'dizziness',
    patterns: [
      /\b(dizzy|dizziness|lightheaded|light-headed|room spinning|vertigo|off balance|lose my balance|when i stand)\b/i,
    ],
  },
  {
    symptomId: 'nausea',
    patterns: [/\b(nausea|nauseous|queasy|feel like vomiting|upset stomach)\b/i],
  },
  {
    symptomId: 'vomiting',
    patterns: [/\b(vomit(ing)?|throw(ing)? up|threw up|puking)\b/i],
  },
  {
    symptomId: 'stomach-pain',
    patterns: [/\b(stomach (pain|ache|cramp)|tummy|belly|abdomen|cramp(s|ing)?)\b/i],
  },
  {
    symptomId: 'diarrhea',
    patterns: [/\b(diarrhea|loose stool|loose motion|watery stool)\b/i],
  },
  {
    symptomId: 'cough',
    patterns: [/\b(cough(ing)?|phlegm|mucus)\b/i],
  },
  {
    symptomId: 'sore-throat',
    patterns: [/\b(sore throat|scratchy throat|hurts to swallow|pain swallowing)\b/i],
  },
  {
    symptomId: 'runny-nose',
    patterns: [/\b(runny nose|stuffy nose|blocked nose|congestion|sinus|sneez)\b/i],
  },
  {
    symptomId: 'palpitations',
    patterns: [
      /\b(palpitation(s)?|heart (is )?(racing|pounding|fluttering|fast)|irregular heartbeat|beating irregularly)\b/i,
    ],
  },
  {
    symptomId: 'shortness-of-breath',
    patterns: [/\b(short of breath|shortness of breath|winded|out of breath)\b/i],
  },
  {
    symptomId: 'difficulty-breathing',
    patterns: [/\b(can'?t breathe|cannot breathe|struggling to breathe|hard to breathe|gasping)\b/i],
  },
  {
    symptomId: 'chest-discomfort',
    patterns: [/\b(chest (discomfort|tightness|tight|pressure|heavy|ache))\b/i],
  },
  {
    symptomId: 'severe-chest-pain',
    patterns: [/\b(severe chest pain|crushing chest|sharp chest pain|chest pain)\b/i],
  },
  {
    symptomId: 'body-aches',
    patterns: [/\b(body ache(s)?|muscle ache(s)?|sore muscles|everything hurts)\b/i],
  },
  {
    symptomId: 'skin-rash',
    patterns: [/\b(rash|hives|red spots|skin bumps)\b/i],
  },
]

const FEVER_SENSATION_MATCHERS: {
  sensation: FeverSensationOption
  pattern: RegExp
}[] = [
  {
    sensation: 'hot-and-cold',
    pattern: /\b(hot and cold|alternating.*hot.*cold|cold and hot)\b/i,
  },
  {
    sensation: 'unusually-hot',
    pattern: /\b(feel(s|ing)? (unusually )?hot|burning up|feel warm)\b/i,
  },
  {
    sensation: 'unusually-cold',
    pattern: /\b(feel(s|ing)? cold|hands are cold|feet are cold)\b/i,
  },
  {
    sensation: 'chills-shivering',
    pattern: /\b(chills|shiver(ing)?)\b/i,
  },
  {
    sensation: 'forehead-warm',
    pattern: /\b(forehead (feels )?warm|head feels hot)\b/i,
  },
]

/**
 * Rule-based, transparent natural-language matcher (not an AI diagnostic model).
 * Produces **unconfirmed** suggestions strictly requiring user confirmation
 * before any symptom is added to the check-in or assessment.
 */
export function interpretNaturalSymptomText(
  rawText: string,
  previousSuggestions: NaturalDescriptionSuggestion[] = [],
): {
  suggestions: NaturalDescriptionSuggestion[]
  suggestedFeverSensations: FeverSensationOption[]
} {
  const cleaned = rawText.trim()
  if (!cleaned) {
    return { suggestions: [], suggestedFeverSensations: [] }
  }

  const prevConfirmedMap = new Map(
    previousSuggestions.map((item) => [item.symptomId, item.confirmed]),
  )

  const suggestions: NaturalDescriptionSuggestion[] = []
  for (const rule of INTERPRETATION_RULES) {
    let matchedPhrase: string | null = null
    for (const pattern of rule.patterns) {
      const m = cleaned.match(pattern)
      if (m?.[0]) {
        matchedPhrase = m[0]
        break
      }
    }

    if (matchedPhrase) {
      const symptom = getSymptomById(rule.symptomId)
      if (!symptom) continue

      suggestions.push({
        symptomId: symptom.id,
        label: symptom.label,
        matchedPhrase,
        // Critical invariant: new suggestions always begin unconfirmed!
        confirmed: prevConfirmedMap.get(symptom.id) ?? false,
      })
    }
  }

  const suggestedFeverSensations: FeverSensationOption[] = []
  for (const matcher of FEVER_SENSATION_MATCHERS) {
    if (matcher.pattern.test(cleaned)) {
      suggestedFeverSensations.push(matcher.sensation)
    }
  }

  return {
    suggestions: suggestions.slice(0, 6),
    suggestedFeverSensations,
  }
}
