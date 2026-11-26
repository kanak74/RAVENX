import type { ReactNode } from 'react'

export type SectionTone =
  | 'ivory'
  | 'sand'
  | 'sage'
  | 'peach'
  | 'paper'
  | 'transparent'

export interface SectionProps {
  children: ReactNode
  id?: string
  tone?: SectionTone
  bordered?: boolean
  className?: string
}

const TONE_BG: Record<SectionTone, string> = {
  ivory: 'bg-ivory/70',
  sand: 'bg-sand/55',
  sage: 'bg-sage-mist/55',
  peach: 'bg-peach-mist/55',
  paper: 'bg-paper/80',
  transparent: 'bg-transparent',
}

/** Semantic page band supporting both distinct tonal washes and continuous scroll-morphed surfaces. */
export function Section({
  children,
  id,
  tone = 'transparent',
  bordered = true,
  className = '',
}: SectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 transition-colors duration-300 ${
        bordered ? 'border-t border-hairline/75' : ''
      } ${TONE_BG[tone]} py-16 sm:py-24 ${className}`}
    >
      {children}
    </section>
  )
}
