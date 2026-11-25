import type { AssessmentExplanationBlock } from './types'

/**
 * Curated, plain-language health information grounded in public-health guidance.
 * Separated from application logic so reviewers can audit and update content easily.
 *
 * Sources referenced: NHS (nhs.uk), MedlinePlus (medlineplus.gov), CDC (cdc.gov), WHO (who.int).
 */

export const MEDICAL_DISCLAIMER =
  'VITALORA provides informational health guidance and does not replace a qualified healthcare professional.'

export const INSUFFICIENT_INFORMATION_MESSAGE =
  "We don't have enough information to understand what may be causing these symptoms. If you're concerned or your symptoms persist or worsen, please contact a healthcare professional."

export const UNVERIFIED_MEASUREMENT_NOTICE =
  'These numbers were typed in by you and have not been checked by a medical device or healthcare professional.'

export const TRANSPARENCY_POINTS: string[] = [
  'This guide gives general health information only — it is not a medical diagnosis.',
  'It only looks at the symptoms, answers, and unverified numbers you entered.',
  'Because it cannot examine you or run tests, it can miss important conditions.',
  'It never replaces advice from a doctor, nurse, or pharmacist.',
  'Emergency warning signs always take priority over everything else here.',
]

export const GENERAL_WARNING_SIGNS: string[] = [
  'Chest pain, squeezing, tightness, or pain spreading to your arm, neck, jaw, or back.',
  'Trouble breathing, gasping, or not being able to speak in full sentences.',
  'Fainting, passing out, sudden confusion, or trouble waking up.',
  'Sudden weakness or numbness in your face, arm, or leg, or sudden trouble speaking.',
  'A severe headache with a stiff neck, bright light hurting your eyes, or a rash that stays visible when pressed with a clear glass.',
  'Throwing up blood, coughing up blood, or being unable to keep any fluids down for 24 hours.',
]

export const WHEN_TO_CALL_DOCTOR: string[] = [
  'Symptoms are getting worse, feel severe, or do not start improving after a few days.',
  'You have a long-term health condition (like heart, lung, or kidney trouble), a weak immune system, or you are pregnant.',
  'You are worried or unsure about what your symptoms mean.',
]

export const EXPLANATION_LIBRARY: Record<string, AssessmentExplanationBlock> = {
  'viral-respiratory-cluster': {
    id: 'viral-respiratory-cluster',
    title: 'Common cold or flu-like viral infection',
    summary:
      'Symptoms like fever or feeling hot and cold, tiredness, body aches, cough, sore throat, and a stuffy or runny nose often happen together with an everyday viral bug (such as a cold or flu).',
    relevance:
      'Many everyday infections cause overlapping symptoms, so symptoms alone cannot tell one germ from another or rule out something that needs treatment.',
    sourceLabel: 'NHS / MedlinePlus',
  },
  'fever-only-or-chills': {
    id: 'fever-only-or-chills',
    title: 'Your body may be fighting off a mild infection',
    summary:
      'Feeling unusually hot, chilled, or shivery often happens when your body temperature shifts to fight off an infection or inflammation.',
    relevance:
      'Feeling hot or cold by itself does not prove you have a fever. A thermometer reading helps show what your temperature actually is, though the number alone still does not show the cause.',
    sourceLabel: 'MedlinePlus / NHS',
  },
  'cough-or-throat-isolated': {
    id: 'cough-or-throat-isolated',
    title: 'Mild throat, nose, or airway irritation',
    summary:
      'A cough, sore throat, or runny nose often comes from a common cold virus, dry air, or allergies.',
    relevance:
      'Most mild upper-airway symptoms improve with rest and fluids over several days, but you should have a doctor listen to your chest if breathing feels hard or a cough lingers.',
    sourceLabel: 'NHS / CDC',
  },
  'headache-mild-isolated': {
    id: 'headache-mild-isolated',
    title: 'Everyday tension, dehydration, or mild illness headache',
    summary:
      'A mild or moderate headache that builds gradually is often linked to muscle tension, not drinking enough water, poor sleep, eye strain, or coming down with a cold.',
    relevance:
      'It is helpful that you have not reported sudden severe pain, stiff neck, or light sensitivity, though any headache that gets worse or keeps coming back should be checked by a doctor.',
    sourceLabel: 'NHS / MedlinePlus',
  },
  'headache-dizziness-cluster': {
    id: 'headache-dizziness-cluster',
    title: 'Headache along with feeling dizzy or lightheaded',
    summary:
      'Headache and dizziness can show up together when you are dehydrated (low on fluids), overtired, having a migraine, experiencing a change in blood pressure, or recovering from a viral illness.',
    relevance:
      'Notice whether dizziness worsens when you stand up, and get urgent help if a sudden severe headache, blurred vision, or weakness appears.',
    sourceLabel: 'NHS / MedlinePlus',
  },
  'dizziness-isolated': {
    id: 'dizziness-isolated',
    title: 'Lightheadedness or inner-ear balance changes',
    summary:
      'Feeling dizzy or unsteady can happen when you stand up too quickly, have not had enough water or food, feel anxious, or have mild inner-ear irritation.',
    relevance:
      'Sit or lie down right away if you feel faint so you do not fall. A doctor should check dizziness that keeps returning or comes with chest, breathing, or weakness signs.',
    sourceLabel: 'NHS / MedlinePlus',
  },
  'digestive-cluster': {
    id: 'digestive-cluster',
    title: 'Stomach upset or mild stomach bug',
    summary:
      'Tummy pain, feeling sick (nausea), throwing up, or loose stools often happen together when your stomach is irritated or fighting off a mild stomach bug.',
    relevance:
      'Losing too much fluid and salt (dehydration) is the main thing to watch out for. Seek medical care if you cannot keep small sips of water down.',
    sourceLabel: 'NHS / CDC',
  },
  'constipation-mild': {
    id: 'constipation-mild',
    title: 'Slow digestion or constipation',
    summary:
      'Hard or infrequent stools are commonly related to not drinking enough water, eating less fiber, moving less, or stress.',
    relevance:
      'See a doctor promptly if constipation comes with severe tummy pain, throwing up, or lasts more than a week.',
    sourceLabel: 'NHS / MedlinePlus',
  },
  'musculoskeletal-aches': {
    id: 'musculoskeletal-aches',
    title: 'Muscle or joint strain or viral body aches',
    summary:
      'Sore muscles, back ache, or stiff joints can come from physical strain, sleeping in an awkward position, or the early stages of a viral illness.',
    relevance:
      'Gentle rest helps everyday strain, while sudden swelling, numbness, or pain after a fall needs a doctor to check it.',
    sourceLabel: 'NHS / MedlinePlus',
  },
  'fatigue-isolated': {
    id: 'fatigue-isolated',
    title: 'General tiredness or low energy',
    summary:
      'Feeling unusually tired or weak can happen with poor sleep, stress, not drinking enough fluids, or the start or tail end of a mild viral bug.',
    relevance:
      'Tiredness by itself has many possible causes. If low energy lasts more than a couple of weeks or gets worse, a doctor can check simple causes like low iron or thyroid changes.',
    sourceLabel: 'NHS / MedlinePlus',
  },
  'palpitations-isolated': {
    id: 'palpitations-isolated',
    title: 'Heart palpitations (noticeable fast or fluttering heartbeat)',
    summary:
      'Feeling your heart race, pound, or skip a beat can sometimes be triggered by stress, worry, caffeine, poor sleep, dehydration, or fever — though heart rhythm issues can also cause it.',
    relevance:
      'Even without chest pain or dizziness, new or repeated heart palpitations should be checked by a doctor so they can listen to your heart rhythm.',
    sourceLabel: 'NHS',
  },
  'skin-rash-or-itching': {
    id: 'skin-rash-or-itching',
    title: 'Skin irritation, allergy, or viral rash',
    summary:
      'New spots, bumps, or itchy skin often come from contact with something irritating, a mild allergy, or a viral infection.',
    relevance:
      'Use the clear-glass press test on new spots: if spots stay bright red and do not fade when you press a glass against them, get emergency medical help right away.',
    sourceLabel: 'NHS',
  },
  'sleep-or-worry': {
    id: 'sleep-or-worry',
    title: 'Stress, worry, or disrupted sleep',
    summary:
      'Feeling unusually worried, tense, or struggling to sleep often affect each other and can also make physical symptoms feel stronger.',
    relevance:
      'If worry or poor sleep makes daily life hard, talking with a doctor or trusted healthcare professional can help you find safe support.',
    sourceLabel: 'NHS / WHO',
  },
  'insufficient-info': {
    id: 'insufficient-info',
    title: 'Not enough information for a specific pattern',
    summary: INSUFFICIENT_INFORMATION_MESSAGE,
    relevance:
      'Because key details were not provided, VITALORA will not guess what is causing how you feel.',
    sourceLabel: 'VITALORA Safety Policy',
  },
}
