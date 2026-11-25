/**
 * VITALORA Design System Tokens
 *
 * Refined warm ivory, muted coral, deep forest green, and soft sage palette
 * paired with editorial Fraunces headings and Plus Jakarta Sans UI typography.
 */

export const vitaloraColors = {
  ivory: '#FAF8F4',
  sand: '#F3EFE7',
  paper: '#FFFFFF',
  sageMist: '#EDF2EE',
  peachMist: '#FBF1EB',
  charcoal: '#1E2421',
  slate: '#4D5651',
  stone: '#6F7872',
  hairline: '#E4DFD5',
  coral: '#C4533B',
  coralAccent: '#D96B52',
  coralSoft: '#F9EAE5',
  forest: '#1E4D3B',
  sage: '#6B8F7E',
  urgent: '#B83A32',
  urgentSoft: '#FCECEB',
} as const

export const vitaloraMotion = {
  ease: [0.22, 1, 0.36, 1] as const,
  duration: 0.48,
  viewport: { once: true, amount: 0.15 } as const,
} as const
