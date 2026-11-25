import type { ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { AmbientBackground } from '../motion/AmbientBackground'
import { InteractiveCursor } from '../motion/InteractiveCursor'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

export interface PageLayoutProps {
  children: ReactNode
  onCheckSymptoms?: () => void
  onNavigateSection?: (sectionId: string) => void
  isCheckInActive?: boolean
}

/** Top-level shell providing ambient background motion, desktop cursor layer, header, and footer. */
export function PageLayout({
  children,
  onCheckSymptoms,
  onNavigateSection,
  isCheckInActive = false,
}: PageLayoutProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-screen flex-col bg-ivory text-charcoal">
        <AmbientBackground />
        <InteractiveCursor />

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-paper"
        >
          Skip to main content
        </a>

        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar
            onCheckSymptoms={onCheckSymptoms}
            onNavigateSection={onNavigateSection}
            isCheckInActive={isCheckInActive}
          />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer
            onCheckSymptoms={onCheckSymptoms}
            onNavigateSection={onNavigateSection}
          />
        </div>
      </div>
    </MotionConfig>
  )
}
