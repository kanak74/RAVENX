import type { ReactNode } from 'react'
import { WaveDivider } from '../ui/OrganicBlob'

export type SectionTone = 'cream' | 'linen' | 'mint' | 'butter' | 'pink'

export interface SectionProps {
  children: ReactNode
  id?: string
  tone?: SectionTone
  topWave?: boolean
  className?: string
}

const TONE_BG: Record<SectionTone, string> = {
  cream: 'bg-cream',
  linen: 'bg-linen',
  mint: 'bg-green-soft',
  butter: 'bg-butter-soft',
  pink: 'bg-pink-soft',
}

const TONE_HEX: Record<SectionTone, string> = {
  cream: '#FFF9F2',
  linen: '#FFF2E2',
  mint: '#DFF4E8',
  butter: '#FFF3CC',
  pink: '#FDE9EE',
}

/** Semantic page band with warm background tone and optional organic top wave. */
export function Section({
  children,
  id,
  tone = 'cream',
  topWave = false,
  className = '',
}: SectionProps) {
  return (
    <div className="relative">
      {topWave ? <WaveDivider fill={TONE_HEX[tone]} /> : null}
      <section
        id={id}
        className={`scroll-mt-20 ${TONE_BG[tone]} py-14 sm:py-20 ${className}`}
      >
        {children}
      </section>
    </div>
  )
}
