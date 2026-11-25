import { useEffect, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion'
import { CloseIcon, MenuIcon, SparkleIcon } from '../illustrations/Icons'
import { VitaloraLogoMark } from '../illustrations/WarmSpotShapes'
import { useAuth } from '../../features/auth/AuthContext'
import { Button } from '../ui/Button'
import { Container } from './Container'

interface NavLinkItem {
  label: string
  sectionId: string
  href: string
}

const NAV_LINKS: NavLinkItem[] = [
  { label: 'Body map', sectionId: 'body-atlas', href: '#body-atlas' },
  { label: 'How it works', sectionId: 'how-it-works', href: '#how-it-works' },
  { label: 'Why it matters', sectionId: 'health-awareness', href: '#health-awareness' },
  { label: 'Safety', sectionId: 'safety', href: '#safety' },
]

export interface NavbarProps {
  onCheckSymptoms?: () => void
  onNavigateSection?: (sectionId: string) => void
  onOpenView?: (view: 'assistant' | 'facilities' | 'history' | 'auth') => void
  isCheckInActive?: boolean
}

/** Sticky editorial header with active scroll-spy pill indicator and scroll progress hairline. */
export function Navbar({
  onCheckSymptoms,
  onNavigateSection,
  onOpenView,
  isCheckInActive = false,
}: NavbarProps) {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')
  const prefersReduced = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 12)
  })

  useEffect(() => {
    if (isCheckInActive) {
      setActiveSection('')
      return
    }

    const ids = NAV_LINKS.map((item) => item.sectionId)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-35% 0px -50% 0px' },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [isCheckInActive])

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
      className={`sticky top-0 z-40 border-b transition-all duration-200 ${
        scrolled
          ? 'border-hairline-strong bg-ivory/95 shadow-[0_8px_24px_-12px_rgba(23,35,32,0.1)]'
          : 'border-hairline bg-ivory/95'
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
            className="group inline-flex items-center gap-3 rounded-xl pr-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"
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
            {NAV_LINKS.map((item) => {
              const isActive = activeSection === item.sectionId
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.sectionId)}
                  className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
                    isActive
                      ? 'text-forest'
                      : 'text-slate hover:bg-sand/80 hover:text-charcoal'
                  }`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={{ duration: prefersReduced ? 0 : 0.25 }}
                      className="absolute inset-0 -z-10 rounded-full bg-sage-mist"
                    />
                  ) : null}
                  {item.label}
                </a>
              )
            })}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {onOpenView ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenView('assistant')}
                  className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold text-slate transition-colors hover:bg-sand hover:text-charcoal"
                >
                  AI Assistant
                </button>
                <button
                  type="button"
                  onClick={() => onOpenView('facilities')}
                  className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold text-slate transition-colors hover:bg-sand hover:text-charcoal"
                >
                  Nearby Care
                </button>
                <button
                  type="button"
                  onClick={() => onOpenView(user ? 'history' : 'auth')}
                  className="cursor-pointer rounded-full border border-hairline bg-paper px-3 py-1.5 text-xs font-semibold text-charcoal transition-colors hover:bg-sand"
                >
                  {user ? user.name.split(' ')[0] : 'Sign in'}
                </button>
              </>
            ) : null}
            {onCheckSymptoms ? (
              <Button
                variant={isCheckInActive ? 'coral' : 'forest'}
                size="sm"
                onClick={handleCheckClick}
                leftIcon={<SparkleIcon className="h-4 w-4" />}
              >
                {isCheckInActive ? 'Symptom check-in' : 'Check my symptoms'}
              </Button>
            ) : (
              <Button
                href="#get-started"
                variant="forest"
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-hairline-strong bg-paper text-charcoal transition-colors hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest lg:hidden"
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
                {onOpenView ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu()
                        onOpenView('assistant')
                      }}
                      className="flex min-h-[44px] w-full cursor-pointer items-center rounded-xl px-3.5 py-2 text-left text-base font-semibold text-charcoal transition-colors hover:bg-sand"
                    >
                      AI Assistant (EN / हिन्दी)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu()
                        onOpenView('facilities')
                      }}
                      className="flex min-h-[44px] w-full cursor-pointer items-center rounded-xl px-3.5 py-2 text-left text-base font-semibold text-charcoal transition-colors hover:bg-sand"
                    >
                      Nearby Hospitals &amp; Clinics
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu()
                        onOpenView('history')
                      }}
                      className="flex min-h-[44px] w-full cursor-pointer items-center rounded-xl px-3.5 py-2 text-left text-base font-semibold text-charcoal transition-colors hover:bg-sand"
                    >
                      Health History
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu()
                        onOpenView('auth')
                      }}
                      className="flex min-h-[44px] w-full cursor-pointer items-center rounded-xl px-3.5 py-2 text-left text-base font-semibold text-forest transition-colors hover:bg-sand"
                    >
                      {user ? `Account (${user.name})` : 'Sign in / Register'}
                    </button>
                  </>
                ) : null}
                <div className="pt-2.5">
                  {onCheckSymptoms ? (
                    <Button
                      variant={isCheckInActive ? 'coral' : 'forest'}
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
                      variant="forest"
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

      {!prefersReduced && !isCheckInActive ? (
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="h-[2px] origin-left bg-forest/75"
          aria-hidden="true"
        />
      ) : null}
    </header>
  )
}
