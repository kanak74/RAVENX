import { ShieldAlertIcon } from '../illustrations/Icons'
import { VitaloraLogoMark } from '../illustrations/WarmSpotShapes'
import { Container } from './Container'

export interface FooterProps {
  onCheckSymptoms?: () => void
  onNavigateSection?: (sectionId: string) => void
}

/** Calm, editorial footer — Safety nav link removed; tagline updated. */
export function Footer({ onCheckSymptoms, onNavigateSection }: FooterProps) {
  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    if (onNavigateSection) {
      event.preventDefault()
      onNavigateSection(sectionId)
    }
  }

  return (
    <footer className="border-t border-hairline bg-sand/60 py-12 text-slate">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <VitaloraLogoMark className="h-8 w-8" />
              <span className="font-display text-lg font-bold text-charcoal">
                VITALORA
              </span>
            </div>
            <p className="text-sm font-semibold text-charcoal">
              Your Health. Your Signs. Your Next Step.
            </p>
            <p className="text-sm leading-relaxed text-slate">
              A calm, guided health-information companion that helps you make
              sense of everyday symptoms and find clarity with confidence.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-slate">
            <a
              href="#top"
              onClick={(e) => handleLinkClick(e, 'top')}
              className="transition-colors hover:text-charcoal"
            >
              Home
            </a>
            <a
              href="#body-atlas"
              onClick={(e) => handleLinkClick(e, 'body-atlas')}
              className="transition-colors hover:text-charcoal"
            >
              Body map
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleLinkClick(e, 'how-it-works')}
              className="transition-colors hover:text-charcoal"
            >
              How it works
            </a>
            {onCheckSymptoms ? (
              <button
                type="button"
                onClick={onCheckSymptoms}
                className="cursor-pointer rounded-full border border-forest/30 bg-sage-mist px-4 py-1.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                Start Your Check-In
              </button>
            ) : (
              <a href="#get-started" className="text-forest hover:underline">
                Start Your Check-In
              </a>
            )}
          </div>
        </div>

        {/* Disclaimer bar */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-hairline bg-paper px-5 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p className="flex items-start gap-2.5 text-slate">
            <ShieldAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-urgent" />
            <span>
              Informational health guidance only — not a medical diagnostic tool
              or substitute for professional care. For emergencies in India,
              call <strong>112</strong> immediately.
            </span>
          </p>
          <span className="shrink-0 text-xs font-medium text-stone">
            © {new Date().getFullYear()} VITALORA
          </span>
        </div>
      </Container>
    </footer>
  )
}
