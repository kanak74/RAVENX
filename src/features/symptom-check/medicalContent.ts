import type { AssessmentExplanationBlock } from './types'

/**
 * Curated, public-health-grounded medical reference content.
 * Separated from application logic so clinical reviewers can audit and update
 * explanations, warning signs, and disclaimers independently.
 *
 * Sources referenced: NHS (nhs.uk), MedlinePlus (medlineplus.gov), CDC (cdc.gov).
 */

export const MEDICAL_DISCLAIMER =
  'VITALORA provides informational health guidance and does not replace a qualified healthcare professional.'

export const UNVERIFIED_MEASUREMENT_NOTICE =
  'Readings shown here were entered manually by you and have not been verified by a clinical device or healthcare provider.'

export const GENERAL_WARNING_SIGNS: string[] = [
  'Sudden or severe chest pain, pressure, tightness, or pain spreading to the arm, jaw, or back.',
  'Difficulty breathing, gasping, or struggling to speak in full sentences.',
  'Fainting, collapse, new confusion, or difficulty waking up.',
  'Sudden weakness or numbness on one side of the face, arm, or leg, or sudden trouble speaking.',
  'Severe headache with a stiff neck, sensitivity to light, or a rash that does not fade when pressed with a glass.',
  'Coughing or vomiting blood, or signs of severe dehydration (unable to keep fluids down, very little urine).',
]

export const DEFAULT_SELF_CARE_STEPS: string[] = [
  'Rest and avoid strenuous activity while your body recovers.',
  'Drink fluids regularly (water, clear broths, or oral rehydration fluids if needed).',
  'If you feel feverish or chilled, check your temperature with a reliable thermometer if one is available.',
  'Keep track of whether symptoms improve, stay steady, or worsen over the next 24–48 hours.',
  'Do not self-diagnose or start leftover prescription medicines without speaking to a doctor or pharmacist.',
]

export const WHEN_TO_SEEK_CARE_DEFAULT: string[] = [
  'If symptoms are getting steadily worse, feel severe, or do not start improving after a few days.',
  'If you have an underlying health condition (such as heart, lung, kidney, or immune conditions) or are pregnant.',
  'If you are unsure what your symptoms mean — a doctor, clinic, or pharmacist can give personal advice.',
  'Call 112 (or go to the nearest emergency department) immediately if any emergency warning signs appear.',
]

export const EXPLANATION_LIBRARY: Record<string, AssessmentExplanationBlock> = {
  'viral-respiratory-cluster': {
    id: 'viral-respiratory-cluster',
    title: 'Upper respiratory or viral-style symptom pattern',
    summary:
      'Combinations such as fever or feverish sensations, chills, fatigue, body aches, sore throat, cough, or a runny nose commonly occur together during everyday viral infections (such as a common cold or flu-like illness).',
    relevance:
      'Because several viral and non-viral conditions share these overlapping symptoms, symptoms alone cannot identify a specific germ or confirm a diagnosis.',
    sourceLabel: 'NHS / MedlinePlus',
  },
  'fever-chills-fatigue': {
    id: 'fever-chills-fatigue',
    title: 'Feverish sensations, chills, and fatigue together',
    summary:
      'Chills and shivering often happen when the body is raising its internal temperature or responding to an infection, and fatigue commonly accompanies this response.',
    relevance:
      'A subjective feeling of heat or cold cannot confirm a fever by itself; measuring with a thermometer helps clarify whether your core temperature is elevated.',
    sourceLabel: 'MedlinePlus',
  },
  'headache-mild-isolated': {
    id: 'headache-mild-isolated',
    title: 'Isolated headache without red-flag features',
    summary:
      'Everyday headaches are frequently linked to tension, dehydration, poor sleep, eye strain, or mild viral illness, and often settle with rest and hydration.',
    relevance:
      'The absence of sudden "thunderclap" onset, stiff neck, light sensitivity, or neurological changes is reassuring, though worsening or persistent headaches still warrant medical advice.',
    sourceLabel: 'NHS',
  },
  'headache-dizziness-cluster': {
    id: 'headache-dizziness-cluster',
    title: 'Headache paired with dizziness or lightheadedness',
    summary:
      'Headache and dizziness can appear together with dehydration, inner-ear balance changes, migraine, blood pressure shifts, or viral illness.',
    relevance:
      'Pay close attention to whether dizziness worsens when standing, or if any sudden severe headache, vision change, or weakness appears.',
    sourceLabel: 'NHS / MedlinePlus',
  },
  'digestive-cluster': {
    id: 'digestive-cluster',
    title: 'Stomach upset, nausea, vomiting, or diarrhea',
    summary:
      'Gastrointestinal symptoms together are often related to mild stomach infections (gastroenteritis) or dietary irritation, where staying hydrated is the main priority.',
    relevance:
      'Seek medical care if you cannot keep fluids down for 24 hours, notice blood in vomit or stool, or feel increasingly dizzy when standing.',
    sourceLabel: 'NHS / CDC',
  },
  'palpitations-isolated': {
    id: 'palpitations-isolated',
    title: 'Brief heart palpitations without chest pain or breathlessness',
    summary:
      'Noticing a fast or fluttering heartbeat can sometimes be triggered by caffeine, stress, poor sleep, dehydration, or fever, though heart rhythm causes also exist.',
    relevance:
      'Even when brief and without red flags, new or recurring palpitations are worth discussing with a GP or clinician.',
    sourceLabel: 'NHS',
  },
  'skin-rash-general': {
    id: 'skin-rash-general',
    title: 'Skin rash or spots',
    summary:
      'Rashes have many possible causes, from mild allergic irritation to viral infections. Pressing a clear drinking glass against the rash helps check whether spots fade.',
    relevance:
      'A rash that does not fade under a glass, especially alongside fever, drowsiness, or stiff neck, requires immediate emergency attention.',
    sourceLabel: 'NHS',
  },
  'insufficient-info': {
    id: 'insufficient-info',
    title: 'Limited information available for a specific pattern',
    summary:
      'Based on the details provided, there is not enough specific symptom or measurement information to associate this safely with a known clinical pattern.',
    relevance:
      'Rather than guessing, VITALORA recommends sharing your full symptoms and history with a healthcare professional if you feel unwell.',
    sourceLabel: 'VITALORA Safety Policy',
  },
}
