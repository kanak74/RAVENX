/**
 * RAVENX Design System Tokens
 *
 * Centralizes the warm, illustration-first palette, typography pairings,
 * spacing rhythm, and subtle motion curves shared across the app.
 */

export const ravenxColors = {
  cream: '#FFF9F2',
  linen: '#FFF2E2',
  warmWhite: '#FFFCF8',
  ink: '#26211D',
  cocoa: '#594F47',
  taupe: '#87796E',
  borderWarm: '#EADCCF',
  coral: '#FF7B61',
  coralSoft: '#FFE5DD',
  tomato: '#DE4436',
  tomatoSoft: '#FCE1DE',
  green: '#2C875C',
  greenSoft: '#DFF4E8',
  butter: '#F9CC59',
  butterSoft: '#FFF3CC',
  pink: '#F6B3C2',
  pinkSoft: '#FDE9EE',
} as const

export const ravenxPaletteShowcase = [
  {
    name: 'Cream',
    hex: '#FFF9F2',
    role: 'Calm paper canvas',
    textHex: '#26211D',
  },
  {
    name: 'Coral',
    hex: '#FF7B61',
    role: 'Warm primary actions',
    textHex: '#26211D',
  },
  {
    name: 'Tomato Red',
    hex: '#DE4436',
    role: 'Important warning signs',
    textHex: '#FFFCF8',
  },
  {
    name: 'Fresh Green',
    hex: '#2C875C',
    role: 'Safe care & reassurance',
    textHex: '#FFFCF8',
  },
  {
    name: 'Butter Yellow',
    hex: '#F9CC59',
    role: 'Gentle tips & warmth',
    textHex: '#26211D',
  },
  {
    name: 'Soft Pink',
    hex: '#F6B3C2',
    role: 'Friendly human touches',
    textHex: '#26211D',
  },
] as const

export const ravenxMotion = {
  ease: [0.22, 1, 0.36, 1] as const,
  fadeUp: {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
} as const
