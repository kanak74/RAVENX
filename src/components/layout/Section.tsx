import type { ReactNode } from 'react'

export type SectionTone = 'ivory' | 'sand' | 'sage' | 'peach' | 'paper'

export interface SectionProps {
  children: ReactNode
  id?: string
  tone?: SectionTone
  bordered?: boolean
  className?: string
}

const TONE_BG: Record<SectionTone, string> = {
  ivory: 'bg-ivory/75',
  sand: 'bg-sand/60',
  sage: 'bg-sage-mist/60',
  peach: 'bg-peach-mist/65',
  paper: 'bg-paper/85',
}

/** Semantic page band using light translucent washes over the ambient background layer. */
export function Section({
  children,
  id,
  tone = 'ivory',
  bordered = true,
  className = '',
}: SectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 transition-colors duration-300 ${
        bordered ? 'border-t border-hairline/80' : ''
      } ${TONE_BG[tone]} py-16 sm:py-24 ${className}`}
    >
      {children}
    </section>
  )
}
