import { ShieldAlertIcon } from '../illustrations/Icons'
import { VitaloraLogoMark } from '../illustrations/WarmSpotShapes'
import { Container } from './Container'

export interface FooterProps {
  onCheckSymptoms?: () => void
  onNavigateSection?: (sectionId: string) => void
}

/** Calm, editorial footer with navigation and clear informational health boundaries. */
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
    <footer className="border-t border-hairline bg-sand/70 py-12 text-slate">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-2.5">
            <div className="flex items-center gap-2.5">
              <VitaloraLogoMark className="h-8 w-8" />
              <span className="font-display text-lg font-semibold text-charcoal">
                VITALORA
              </span>
            </div>
            <p className="text-sm font-semibold text-charcoal">
              Understand your symptoms. Know your next step.
            </p>
            <p className="text-sm leading-relaxed text-slate">
              A calm, guided health-information companion designed to help
              people make sense of everyday symptoms in plain language.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-slate">
            <a
              href="#top"
              onClick={(e) => handleLinkClick(e, 'top')}
              className="transition-colors hover:text-charcoal"
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleLinkClick(e, 'how-it-works')}
              className="transition-colors hover:text-charcoal"
            >
              How it works
            </a>
            <a
              href="#health-awareness"
              onClick={(e) => handleLinkClick(e, 'health-awareness')}
              className="transition-colors hover:text-charcoal"
            >
              Why it matters
            </a>
            <a
              href="#safety"
              onClick={(e) => handleLinkClick(e, 'safety')}
              className="transition-colors hover:text-charcoal"
            >
              Safety
            </a>
            {onCheckSymptoms ? (
              <button
                type="button"
                onClick={onCheckSymptoms}
                className="cursor-pointer rounded-full border border-coral/35 bg-coral-soft px-4 py-1.5 text-sm font-semibold text-coral transition-colors hover:bg-coral hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
              >
                Check my symptoms
              </button>
            ) : (
              <a href="#get-started" className="text-coral hover:underline">
                Check my symptoms
              </a>
            )}
          </div>
        </div>

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
            VITALORA Health Guide
          </span>
        </div>
      </Container>
    </footer>
  )
}
