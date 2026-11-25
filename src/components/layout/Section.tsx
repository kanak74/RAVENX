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
  ivory: 'bg-ivory',
  sand: 'bg-sand/75',
  sage: 'bg-sage-mist/80',
  peach: 'bg-peach-mist/85',
  paper: 'bg-paper',
}

/** Semantic page section with subtle warm tonal shifts and generous editorial spacing. */
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
      className={`scroll-mt-20 transition-colors duration-300 ${bordered ? 'border-t border-hairline/80' : ''
        } ${TONE_BG[tone]} py-16 sm:py-24 ${className}`}
    >
      {children}
    </section>
  )
}
