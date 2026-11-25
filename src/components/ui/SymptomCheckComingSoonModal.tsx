import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SymptomCheckPreviewIllustration } from '../illustrations/LandingIllustrations'
import { CloseIcon, ShieldAlertIcon } from '../illustrations/Icons'
import { Badge } from './Badge'
import { Button } from './Button'

export interface SymptomCheckComingSoonModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Honest, accessible Stage 2 placeholder dialog opened by every "Check my symptoms" CTA
 * until the interactive symptom assessment flow is built in Stage 3.
 */
export function SymptomCheckComingSoonModal({
  open,
  onClose,
}: SymptomCheckComingSoonModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coming-soon-title"
        >
          {/* Warm dimmed backdrop (solid color opacity, no glassmorphism) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/45"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border-2 border-border-warm bg-warm-white p-6 shadow-[0_14px_0_0_rgba(38,33,29,0.12)] sm:p-8"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close symptom check-in preview"
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-border-warm bg-cream text-ink transition-colors hover:bg-linen focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            <div className="text-center">
              <SymptomCheckPreviewIllustration />

              <div className="mt-3">
                <Badge tone="butter" dotColor="#D4A22B">
                  Guided Check-In · Coming in Stage 3
                </Badge>
              </div>

              <h2
                id="coming-soon-title"
                className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl"
              >
                Symptom check-in is on the way
              </h2>

              <p className="mt-3 text-base leading-relaxed text-cocoa">
                Right now you are exploring the VITALORA home guide. In our next
                stage, clicking <strong>Check my symptoms</strong> will open a
                gentle step-by-step check-in with simple questions and clear next
                steps.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border-2 border-tomato/35 bg-tomato-soft/75 p-4 text-left">
              <div className="flex items-start gap-3">
                <ShieldAlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-tomato" />
                <p className="text-sm font-bold leading-relaxed text-ink">
                  Need urgent help right now? If you have trouble breathing, chest
                  pain, or severe symptoms, please call your local emergency
                  number or see a doctor immediately.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                href="#how-it-works"
                variant="coral"
                size="md"
                onClick={onClose}
              >
                See how it works
              </Button>
              <Button
                href="#safety"
                variant="outline"
                size="md"
                onClick={onClose}
              >
                Read safety guide
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
