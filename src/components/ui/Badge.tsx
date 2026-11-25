import type { ReactNode } from 'react'

export type BadgeTone =
  | 'coral'
  | 'forest'
  | 'sage'
  | 'sand'
  | 'urgent'
  | 'neutral'

export interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  dotColor?: string
  className?: string
}

const TONE_STYLES: Record<BadgeTone, string> = {
  coral: 'bg-coral-soft text-coral border-coral-accent/25',
  forest: 'bg-sage-mist text-forest border-forest/15',
  sage: 'bg-sage-mist text-forest border-sage/30',
  sand: 'bg-sand text-charcoal border-hairline',
  urgent: 'bg-urgent-soft text-urgent border-urgent/25',
  neutral: 'bg-paper text-slate border-hairline',
}

/** Subtle pill label for editorial eyebrows and concise status tags. */
export function Badge({
  children,
  tone = 'neutral',
  dotColor,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wide ${TONE_STYLES[tone]} ${className}`}
    >
      {dotColor ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>
    </span>
  )
}
