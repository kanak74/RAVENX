import { HeartIcon } from '../illustrations/Icons'
import { VitaloraLogoMark } from '../illustrations/WarmSpotShapes'
import { Badge } from '../ui/Badge'
import { Container } from './Container'

/** Warm, clear footer with hackathon prototype disclaimer and simple navigation. */
export function Footer() {
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
              <Badge tone="butter">Prototype · Stage 1</Badge>
            </div>
            <p className="text-sm font-bold text-ink">
              Understand your symptoms. Know your next step.
            </p>
            <p className="text-sm leading-relaxed text-cocoa">
              A warm, human-centered health guidance prototype made to feel calm
              and simple for everyone.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex flex-wrap gap-5 text-sm font-bold text-ink">
              <a href="#top" className="hover:text-coral-deep">
                Home
              </a>
              <a href="#how-it-works" className="hover:text-coral-deep">
                How It Works
              </a>
              <a href="#safety-promise" className="hover:text-coral-deep">
                Safety First
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border-2 border-border-warm bg-cream px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 font-semibold text-cocoa">
            <HeartIcon className="mt-0.5 h-4 w-4 shrink-0 text-tomato" />
            <span>
              Hackathon educational prototype — not a medical diagnostic tool.
              Always talk with a doctor or trusted adult when you need care.
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
