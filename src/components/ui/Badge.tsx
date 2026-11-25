import type { ReactNode } from 'react'

export type BadgeTone = 'coral' | 'green' | 'butter' | 'pink' | 'tomato' | 'cream'

export interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  dotColor?: string
  className?: string
}

const TONE_STYLES: Record<BadgeTone, string> = {
  coral: 'bg-coral-soft text-ink border-coral/40',
  green: 'bg-green-soft text-[#194E35] border-green/30',
  butter: 'bg-butter-soft text-ink border-butter/70',
  pink: 'bg-pink-soft text-ink border-pink/60',
  tomato: 'bg-tomato-soft text-[#8F2118] border-tomato/35',
  cream: 'bg-warm-white text-cocoa border-border-warm',
}

/** Pill-shaped eyebrow badge for friendly section labels and short tags. */
export function Badge({
  children,
  tone = 'cream',
  dotColor,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-sm font-extrabold tracking-wide ${TONE_STYLES[tone]} ${className}`}
    >
      {dotColor ? (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>
    </span>
  )
}
