/**
 * VITALORA Design System Tokens
 *
 * Luminous warm alabaster surfaces paired with Deep Botanical Teal,
 * Soft Seafoam, and Warm Terracotta Copper accents.
 */

export const vitaloraColors = {
  ivory: '#F8F7F3',
  sand: '#EFECE3',
  paper: '#FFFFFF',
  sageMist: '#E3F0ED',
  peachMist: '#F7ECE4',
  charcoal: '#172320',
  slate: '#43524D',
  stone: '#677670',
  hairline: '#E0DDD3',
  forest: '#0F5C53',
  sage: '#5C8A80',
  coral: '#BE4F36',
  coralAccent: '#D4694F',
  coralSoft: '#FAEAE5',
  urgent: '#B83830',
  urgentSoft: '#FCECEB',
} as const

export const vitaloraMotion = {
  ease: [0.22, 1, 0.36, 1] as const,
  duration: 0.5,
  viewport: { once: true, amount: 0.15 } as const,
} as const
