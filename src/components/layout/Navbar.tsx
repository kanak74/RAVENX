import { useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion'
import { CloseIcon, MenuIcon, SparkleIcon } from '../illustrations/Icons'
import { VitaloraLogoMark } from '../illustrations/WarmSpotShapes'
import { Button } from '../ui/Button'
import { Container } from './Container'

interface NavLinkItem {
  label: string
  sectionId: string
  href: string
}

const NAV_LINKS: NavLinkItem[] = [
  { label: 'How it works', sectionId: 'how-it-works', href: '#how-it-works' },
  { label: 'Why it matters', sectionId: 'health-awareness', href: '#health-awareness' },
  { label: 'Safety', sectionId: 'safety', href: '#safety' },
]

export interface NavbarProps {
  onCheckSymptoms?: () => void
  onNavigateSection?: (sectionId: string) => void
  isCheckInActive?: boolean
}

/** Refined sticky editorial header for VITALORA with subtle scroll-depth feedback. */
export function Navbar({
  onCheckSymptoms,
  onNavigateSection,
  isCheckInActive = false,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const prefersReduced = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 12)
  })

  const closeMenu = () => setMobileOpen(false)

  const handleCheckClick = () => {
    closeMenu()
    onCheckSymptoms?.()
  }

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    closeMenu()
    if (onNavigateSection) {
      event.preventDefault()
      onNavigateSection(sectionId)
    }
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-200 ${scrolled
        ? 'border-hairline-strong bg-ivory shadow-[0_6px_20px_-10px_rgba(30,36,33,0.08)]'
        : 'border-hairline bg-ivory'
        }`}
    >
      <Container>
        <nav
          aria-label="Primary navigation"
          className="flex min-h-[72px] items-center justify-between gap-6 py-2.5"
        >
          <a
            href="#top"
            onClick={(e) => handleLinkClick(e, 'top')}
            className="group inline-flex items-center gap-3 rounded-xl pr-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral"
          >
            <VitaloraLogoMark className="h-9 w-9 transition-transform duration-200 group-hover:scale-[1.03]" />
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-xl font-semibold tracking-tight text-charcoal sm:text-2xl">
                VITALORA
              </span>
              <span className="hidden border-l border-hairline-strong pl-2.5 text-xs font-medium text-stone sm:inline-block">
                Symptom Guidance
              </span>
            </div>
          </a>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.sectionId)}
                className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-slate transition-colors hover:bg-sand hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:block">
            {onCheckSymptoms ? (
              <Button
                variant={isCheckInActive ? 'forest' : 'coral'}
                size="sm"
                onClick={handleCheckClick}
                leftIcon={<SparkleIcon className="h-4 w-4" />}
              >
                {isCheckInActive ? 'Symptom check-in' : 'Check my symptoms'}
              </Button>
            ) : (
              <Button
                href="#get-started"
                variant="coral"
                size="sm"
                leftIcon={<SparkleIcon className="h-4 w-4" />}
              >
                Check my symptoms
              </Button>
            )}
          </div>

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-hairline-strong bg-paper text-charcoal transition-colors hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral lg:hidden"
          >
            {mobileOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </nav>

        <AnimatePresence initial={false}>
          {mobileOpen ? (
            <motion.div
              id="mobile-nav-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-hairline pb-5 pt-3 lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.sectionId)}
                    className="flex min-h-[44px] items-center rounded-xl px-3.5 py-2 text-base font-semibold text-charcoal transition-colors hover:bg-sand"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-2.5">
                  {onCheckSymptoms ? (
                    <Button
                      variant={isCheckInActive ? 'forest' : 'coral'}
                      size="md"
                      fullWidth
                      onClick={handleCheckClick}
                      leftIcon={<SparkleIcon className="h-4 w-4" />}
                    >
                      {isCheckInActive ? 'Symptom check-in' : 'Check my symptoms'}
                    </Button>
                  ) : (
                    <Button
                      href="#get-started"
                      variant="coral"
                      size="md"
                      fullWidth
                      onClick={closeMenu}
                      leftIcon={<SparkleIcon className="h-4 w-4" />}
                    >
                      Check my symptoms
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Container>

      {/* Subtle reading progress hairline */}
      {!prefersReduced && !isCheckInActive ? (
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="h-[2px] origin-left bg-coral-accent/70"
          aria-hidden="true"
        />
      ) : null}
    </header>
  )
}
