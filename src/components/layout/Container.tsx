import type { ReactNode } from 'react'

export interface ContainerProps {
  children: ReactNode
  size?: 'narrow' | 'default' | 'wide'
  className?: string
}

const MAX_WIDTHS: Record<NonNullable<ContainerProps['size']>, string> = {
  narrow: 'max-w-4xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
}

/** Responsive centered container with comfortable breathing room on all viewports. */
export function Container({
  children,
  size = 'default',
  className = '',
}: ContainerProps) {
  return (
    <div className={`mx-auto w-full px-5 sm:px-8 ${MAX_WIDTHS[size]} ${className}`}>
      {children}
    </div>
  )
}
