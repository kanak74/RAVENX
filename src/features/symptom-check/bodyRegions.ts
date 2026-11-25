export type BodyRegionId =
  | 'head-throat'
  | 'chest-breathing'
  | 'stomach-digestion'
  | 'body-spine-skin'

export interface BodyRegionDefinition {
  id: BodyRegionId
  code: string
  title: string
  shortLabel: string
  systemLabel: string
  summary: string
  whatToNotice: string
  hotspotPercent: { x: number; y: number }
  anchorSvg: { x: number; y: number }
  calloutTargetSvg: { x: number; y: number; align: 'left' | 'right' }
  symptomIds: string[]
  accentHex: string
}

export const BODY_REGIONS: BodyRegionDefinition[] = [
  {
    id: 'head-throat',
    code: '01',
    title: 'Head, Sinus & Throat',
    shortLabel: 'Head & Throat',
    systemLabel: 'Cranial · Upper Airway',
    summary:
      'Throbbing headaches, fever warmth, sinus congestion, dizziness, or a scratchy throat.',
    whatToNotice:
      'Track whether discomfort feels steady or pulses, and note sudden balance shifts or neck stiffness.',
    hotspotPercent: { x: 50, y: 12.2 },
    anchorSvg: { x: 210, y: 68 },
    calloutTargetSvg: { x: 356, y: 68, align: 'right' },
    symptomIds: [
      'headache',
      'fever',
      'sore-throat',
      'runny-nose',
      'dizziness',
    ],
    accentHex: '#C25941',
  },
  {
    id: 'chest-breathing',
    code: '02',
    title: 'Chest & Breathing',
    shortLabel: 'Chest & Lungs',
    systemLabel: 'Thoracic · Respiratory',
    summary:
      'Persistent cough, feeling winded at rest, chest tightness, or uncomfortable pressure.',
    whatToNotice:
      'New chest pressure or shortness of breath triggers immediate urgent guidance instead of waiting.',
    hotspotPercent: { x: 52.4, y: 31.8 },
    anchorSvg: { x: 220, y: 178 },
    calloutTargetSvg: { x: 364, y: 172, align: 'right' },
    symptomIds: [
      'cough',
      'shortness-of-breath',
      'chest-discomfort',
    ],
    accentHex: '#174B42',
  },
  {
    id: 'stomach-digestion',
    code: '03',
    title: 'Stomach & Digestion',
    shortLabel: 'Abdomen',
    systemLabel: 'Gastric · Visceral Core',
    summary:
      'Tummy cramps, queasiness, nausea, vomiting, diarrhea, or uncomfortable bloating.',
    whatToNotice:
      'Noting whether soreness started suddenly or followed meals helps clarify everyday next steps.',
    hotspotPercent: { x: 50, y: 45.2 },
    anchorSvg: { x: 210, y: 253 },
    calloutTargetSvg: { x: 58, y: 253, align: 'left' },
    symptomIds: [
      'stomach-pain',
      'nausea',
      'vomiting',
      'diarrhea',
      'constipation',
    ],
    accentHex: '#D6735C',
  },
  {
    id: 'body-spine-skin',
    code: '04',
    title: 'Spine, Joints & Skin',
    shortLabel: 'Body & Joints',
    systemLabel: 'Musculoskeletal · Systemic',
    summary:
      'Deep fatigue, muscle aches, lower-back tension, sore joints, rashes, or restless sleep.',
    whatToNotice:
      'Pay attention to widespread tiredness, joint swelling, or skin changes spreading over hours.',
    hotspotPercent: { x: 42.86, y: 75 },
    anchorSvg: { x: 180, y: 420 },
    calloutTargetSvg: { x: 64, y: 420, align: 'left' },
    symptomIds: [
      'fatigue',
      'body-aches',
      'back-pain',
      'joint-pain',
      'skin-rash',
      'itching',
      'difficulty-sleeping',
    ],
    accentHex: '#5B8577',
  },
]

export const BODY_REGION_MAP = new Map<BodyRegionId, BodyRegionDefinition>(
  BODY_REGIONS.map((region) => [region.id, region]),
)

/** Infers highlighted anatomical regions from currently selected Stage 3 symptom IDs. */
export function getRegionsForSymptomIds(selectedIds: string[]): {
  activeRegions: BodyRegionId[]
  urgentRegions: BodyRegionId[]
} {
  const activeSet = new Set<BodyRegionId>()
  const urgentSet = new Set<BodyRegionId>()

  for (const region of BODY_REGIONS) {
    if (selectedIds.some((id) => region.symptomIds.includes(id))) {
      activeSet.add(region.id)
    }
  }

  if (
    selectedIds.includes('severe-chest-pain') ||
    selectedIds.includes('difficulty-breathing') ||
    selectedIds.includes('chest-discomfort') ||
    selectedIds.includes('shortness-of-breath')
  ) {
    activeSet.add('chest-breathing')
    if (
      selectedIds.includes('severe-chest-pain') ||
      selectedIds.includes('difficulty-breathing')
    ) {
      urgentSet.add('chest-breathing')
    }
  }

  if (
    selectedIds.includes('fainting') ||
    selectedIds.includes('confusion') ||
    selectedIds.includes('severe-allergic-reaction')
  ) {
    activeSet.add('head-throat')
    urgentSet.add('head-throat')
  }

  if (selectedIds.includes('sudden-weakness')) {
    activeSet.add('head-throat')
    activeSet.add('body-spine-skin')
    urgentSet.add('head-throat')
    urgentSet.add('body-spine-skin')
  }

  if (selectedIds.includes('anxiety')) {
    activeSet.add('head-throat')
    activeSet.add('chest-breathing')
  }

  return {
    activeRegions: Array.from(activeSet),
    urgentRegions: Array.from(urgentSet),
  }
}
