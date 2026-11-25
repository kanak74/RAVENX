import type { ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export interface PageLayoutProps {
  children: ReactNode
  onCheckSymptoms?: () => void
}

/** Top-level layout shell supplying motion preferences, skip link, header, and footer. */
export function PageLayout({ children, onCheckSymptoms }: PageLayoutProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-cream text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-butter focus:px-5 focus:py-3 focus:text-sm focus:font-extrabold focus:text-ink"
        >
          Skip to main content
        </a>
        <Navbar onCheckSymptoms={onCheckSymptoms} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer onCheckSymptoms={onCheckSymptoms} />
      </div>
    </MotionConfig>
  )
}
