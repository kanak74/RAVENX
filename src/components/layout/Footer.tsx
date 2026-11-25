import { HeartIcon } from '../illustrations/Icons'
import { VitaloraLogoMark } from '../illustrations/WarmSpotShapes'
import { Badge } from '../ui/Badge'
import { Container } from './Container'

export interface FooterProps {
  onCheckSymptoms?: () => void
}

/** Warm, clear footer with hackathon prototype disclaimer and consistent navigation. */
export function Footer({ onCheckSymptoms }: FooterProps) {
  return (
    <footer className="border-t-2 border-border-warm bg-warm-white py-12 text-cocoa">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-3">
            <div className="flex items-center gap-3">
              <VitaloraLogoMark className="h-9 w-9" />
              <span className="font-display text-xl font-bold text-ink">
                VITALORA
              </span>
              <Badge tone="butter">Health Guide</Badge>
            </div>
            <p className="text-sm font-extrabold text-ink">
              Understand your symptoms. Know your next step.
            </p>
            <p className="text-sm leading-relaxed text-cocoa">
              A warm, human-centered health guidance platform made to feel calm,
              friendly, and effortless for everyone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-bold text-ink">
            <a href="#top" className="hover:text-coral-deep">
              Home
            </a>
            <a href="#how-it-works" className="hover:text-coral-deep">
              How it works
            </a>
            <a href="#health-awareness" className="hover:text-coral-deep">
              Health awareness
            </a>
            <a href="#safety" className="hover:text-coral-deep">
              Safety
            </a>
            {onCheckSymptoms ? (
              <button
                type="button"
                onClick={onCheckSymptoms}
                className="cursor-pointer rounded-full bg-coral-soft px-3.5 py-1.5 text-sm font-extrabold text-ink transition-colors hover:bg-coral/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-coral-deep"
              >
                Check my symptoms
              </button>
            ) : (
              <a href="#get-started" className="text-coral-deep hover:underline">
                Check my symptoms
              </a>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border-2 border-border-warm bg-cream px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 font-semibold text-cocoa">
            <HeartIcon className="mt-0.5 h-4 w-4 shrink-0 text-tomato" />
            <span>
              Informational health guidance prototype — not a medical diagnostic
              tool. Always consult a doctor or seek emergency care when needed.
            </span>
          </p>
          <span className="shrink-0 text-xs font-bold text-taupe">
            Built with care · VITALORA
          </span>
        </div>
      </Container>
    </footer>
  )
}
