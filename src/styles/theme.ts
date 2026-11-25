/**
 * VITALORA Design System Tokens
 *
 * Warm ivory & stone surfaces paired with Sage Green, Deep Botanical Pine,
 * Muted Coral, Soft Terracotta, Charcoal, and Warm Grey.
 */

export const vitaloraColors = {
  ivory: '#F9F7F2',
  sand: '#F0ECE3',
  paper: '#FFFFFF',
  sageMist: '#E4EDE8',
  peachMist: '#F6EBE4',
  charcoal: '#18201E',
  slate: '#444E4A',
  stone: '#6E756F',
  hairline: '#E2DED3',
  forest: '#174B42',
  sage: '#5B8577',
  coral: '#C25941',
  coralAccent: '#D6735C',
  coralSoft: '#F7EAE4',
  urgent: '#B4372E',
  urgentSoft: '#FCECEB',
} as const

export const vitaloraMotion = {
  ease: [0.22, 1, 0.36, 1] as const,
  duration: 0.56,
  viewport: { once: true, amount: 0.14 } as const,
} as const
