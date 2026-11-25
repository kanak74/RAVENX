import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon, MenuIcon, SparkleIcon } from '../illustrations/Icons'
import { VitaloraLogoMark } from '../illustrations/WarmSpotShapes'
import { Button } from '../ui/Button'
import { Container } from './Container'

interface NavLinkItem {
  label: string
  href: string
}

const NAV_LINKS: NavLinkItem[] = [
  { label: 'Home', href: '#top' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Health awareness', href: '#health-awareness' },
  { label: 'Safety', href: '#safety' },
]

export interface NavbarProps {
  onCheckSymptoms?: () => void
}

/** Responsive, kid-accessible top navigation header for VITALORA. */
export function Navbar({ onCheckSymptoms }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMenu = () => setMobileOpen(false)

  const handleCheckClick = () => {
    closeMenu()
    onCheckSymptoms?.()
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border-warm bg-cream/95">
      <Container>
        <nav
          aria-label="Primary navigation"
          className="flex min-h-[76px] items-center justify-between gap-4 py-3"
        >
          <a
            href="#top"
            className="group inline-flex items-center gap-3 rounded-full pr-2 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-coral-deep"
          >
            <VitaloraLogoMark className="h-11 w-11 transition-transform duration-200 group-hover:rotate-[-4deg]" />
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold tracking-tight text-ink">
                VITALORA
              </span>
              <span className="hidden rounded-full bg-butter-soft px-2.5 py-0.5 text-xs font-extrabold text-ink xl:inline-block">
                Health Guide
              </span>
            </div>
          </a>

          <div className="hidden items-center gap-1 lg:flex lg:gap-2">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-full px-3.5 py-2 text-base font-bold text-cocoa transition-colors hover:bg-linen hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:block">
            {onCheckSymptoms ? (
              <Button
                variant="coral"
                size="sm"
                onClick={handleCheckClick}
                leftIcon={<SparkleIcon className="h-4 w-4" />}
              >
                Check my symptoms
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-border-warm bg-warm-white text-ink transition-colors hover:bg-linen focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep lg:hidden"
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
              className="overflow-hidden border-t-2 border-border-warm pb-5 pt-3 lg:hidden"
            >
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="flex min-h-[46px] items-center rounded-2xl px-4 py-2.5 text-lg font-bold text-ink transition-colors hover:bg-linen"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-2">
                  {onCheckSymptoms ? (
                    <Button
                      variant="coral"
                      size="md"
                      fullWidth
                      onClick={handleCheckClick}
                      leftIcon={<SparkleIcon className="h-4 w-4" />}
                    >
                      Check my symptoms
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
    </header>
  )
}
