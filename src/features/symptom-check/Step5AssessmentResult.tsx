import { CheckCircleIcon, HeartIcon, ShieldAlertIcon } from '../../components/illustrations/Icons'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import type { AssessmentReport } from './types'

export interface Step5AssessmentResultProps {
  report: AssessmentReport
  onEditAnswers: () => void
  onStartOver: () => void
  onBackToHome: () => void
}

/**
 * Stage 4 Assessment Result Page.
 * - If `report.isEmergencyInterrupted` is true, renders a non-bypassable urgent emergency screen.
 * - Otherwise renders the 8 structured informational sections cleanly and calmly.
 */
export function Step5AssessmentResult({
  report,
  onEditAnswers,
  onStartOver,
  onBackToHome,
}: Step5AssessmentResultProps) {
  if (report.isEmergencyInterrupted) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="space-y-6 rounded-3xl border-2 border-urgent bg-urgent-soft p-6 sm:p-10 shadow-[0_18px_42px_-16px_rgba(184,58,50,0.25)]"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-urgent text-paper">
            <ShieldAlertIcon className="h-6 w-6" />
          </div>
          <div>
            <Badge tone="urgent">Urgent Safety Priority</Badge>
            <h1 className="mt-1 font-display text-2xl font-semibold text-charcoal sm:text-3xl">
              {report.safety.headline}
            </h1>
          </div>
        </div>

        <p className="text-base leading-relaxed text-charcoal">
          {report.safety.message}
        </p>

        <div className="rounded-2xl border border-urgent/30 bg-paper p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-urgent">
            What triggered this urgent warning
          </h2>
          <ul className="mt-2.5 space-y-1.5 text-sm font-semibold text-charcoal">
            {report.safety.triggers.map((trigger) => (
              <li key={trigger} className="flex items-start gap-2">
                <span aria-hidden="true" className="text-urgent">•</span>
                <span>{trigger}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`tel:${report.safety.emergencyNumber}`}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-urgent px-6 py-3 text-base font-semibold text-paper shadow-sm transition-opacity hover:opacity-95"
          >
            Call Emergency ({report.safety.emergencyNumber})
          </a>
          <Button variant="outline" size="lg" onClick={onEditAnswers}>
            Review my answers
          </Button>
          <Button variant="ghost" size="lg" onClick={onStartOver}>
            Start over
          </Button>
        </div>

        <p className="border-t border-urgent/20 pt-4 text-xs font-medium text-charcoal/80">
          {report.disclaimer}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="space-y-2.5">
        <Badge tone="forest" dotColor="#174B42">
          Health Assessment Summary
        </Badge>
        <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">
          Your VITALORA guidance report
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate">
          Structured from the symptoms, context, and optional readings you shared.
          This is informational health guidance — not a medical diagnosis.
        </p>
      </div>

      {report.safety.level === 'caution' ? (
        <div className="rounded-2xl border border-coral bg-coral-soft/65 p-5">
          <p className="text-sm font-semibold text-charcoal">
            {report.safety.headline}
          </p>
          <p className="mt-1 text-sm text-slate">{report.safety.message}</p>
        </div>
      ) : null}

      <div className="space-y-5">
        {/* A. YOUR REPORTED SYMPTOMS */}
        <section className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-charcoal">
            A. Your reported symptoms
          </h2>
          {report.reportedSymptoms.confirmedSymptomLabels.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {report.reportedSymptoms.confirmedSymptomLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-sage-mist px-3.5 py-1 text-sm font-semibold text-forest"
                >
                  <CheckCircleIcon className="h-3.5 w-3.5 text-forest" />
                  <span>{label}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate">
              No specific symptoms selected.
            </p>
          )}

          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-hairline bg-ivory p-3">
              <dt className="text-xs font-semibold uppercase tracking-wider text-stone">
                Duration
              </dt>
              <dd className="mt-1 text-sm font-semibold text-charcoal">
                {report.reportedSymptoms.durationLabel}
              </dd>
            </div>
            <div className="rounded-xl border border-hairline bg-ivory p-3">
              <dt className="text-xs font-semibold uppercase tracking-wider text-stone">
                Severity
              </dt>
              <dd className="mt-1 text-sm font-semibold text-charcoal">
                {report.reportedSymptoms.severityLabel}
              </dd>
            </div>
            <div className="rounded-xl border border-hairline bg-ivory p-3">
              <dt className="text-xs font-semibold uppercase tracking-wider text-stone">
                Progression
              </dt>
              <dd className="mt-1 text-sm font-semibold text-charcoal">
                {report.reportedSymptoms.progressionLabel}
              </dd>
            </div>
          </dl>

          {report.reportedSymptoms.feverSensations.length > 0 ? (
            <p className="mt-3 text-sm text-slate">
              <strong>Fever sensations noted:</strong>{' '}
              {report.reportedSymptoms.feverSensations.join(', ')}
            </p>
          ) : null}

          {report.reportedSymptoms.userDescribedNotes ? (
            <p className="mt-2 text-sm text-slate italic">
              <strong>Your note:</strong> &ldquo;{report.reportedSymptoms.userDescribedNotes}&rdquo;
            </p>
          ) : null}

          {report.reportedSymptoms.contextualQA.length > 0 ? (
            <dl className="mt-3 space-y-1.5 border-t border-hairline pt-3">
              {report.reportedSymptoms.contextualQA.map((qa) => (
                <div key={qa.question} className="flex flex-wrap justify-between gap-2 text-xs">
                  <dt className="text-slate">{qa.question}</dt>
                  <dd className="font-semibold text-charcoal">{qa.answer}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>

        {/* B. YOUR HEALTH MEASUREMENTS */}
        <section className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold text-charcoal">
              B. Your health measurements
            </h2>
            <span className="rounded-full border border-hairline bg-ivory px-3 py-0.5 text-xs font-medium text-stone">
              Distinguished from sensations
            </span>
          </div>

          {report.healthMeasurements.hasAnyValidMeasurement ? (
            <>
              <p className="mt-2 text-xs text-stone">
                {report.healthMeasurements.verificationNotice}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {report.healthMeasurements.items.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-xl border p-3.5 ${
                      item.isConcerning
                        ? 'border-coral/40 bg-coral-soft/30'
                        : 'border-hairline bg-ivory'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone">
                        {item.label}
                      </span>
                      <span className="text-[11px] font-medium text-stone">
                        {item.verificationTag}
                      </span>
                    </div>
                    <p className="mt-1 text-base font-semibold text-charcoal">
                      {item.readingText}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate">
                      {item.interpretationNote}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate">
              No optional health measurements were entered. Measurements are never
              required to complete a VITALORA check-in.
            </p>
          )}

          {report.healthMeasurements.invalidEntries.length > 0 ? (
            <div className="mt-3 rounded-xl border border-urgent/25 bg-urgent-soft/50 p-3 text-xs text-charcoal">
              <p className="font-semibold text-urgent">
                Excluded invalid entries (not used in assessment):
              </p>
              <ul className="mt-1 list-disc pl-4">
                {report.healthMeasurements.invalidEntries.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Dedicated Fever Assessment Box */}
          {report.feverAssessment.mode !== 'none' ? (
            <div className="mt-4 rounded-xl border border-forest/20 bg-sage-mist/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-forest">
                Fever &amp; Temperature Pathway ·{' '}
                {report.feverAssessment.mode === 'measured-temperature'
                  ? 'Measured Reading'
                  : 'Subjective Sensation Only'}
              </p>
              <p className="mt-1 text-sm font-semibold text-charcoal">
                {report.feverAssessment.headline}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate">
                {report.feverAssessment.explanation}
              </p>
              {report.feverAssessment.thermometerGuidance ? (
                <p className="mt-1.5 text-xs font-medium text-forest">
                  {report.feverAssessment.thermometerGuidance}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        {/* C. WHAT YOUR INFORMATION MAY SUGGEST */}
        <section className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-charcoal">
            C. What your information may suggest
          </h2>
          <div className="mt-3 space-y-3">
            {report.whatInfoMaySuggest.map((block) => (
              <div
                key={block.id}
                className="rounded-xl border border-hairline bg-ivory p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-charcoal sm:text-base">
                    {block.title}
                  </h3>
                  <span className="rounded-full border border-hairline bg-paper px-2.5 py-0.5 text-[11px] font-medium text-stone">
                    Source: {block.sourceLabel}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate">
                  {block.summary}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-stone">
                  {block.relevance}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* D. WHY THIS MAY BE RELEVANT */}
        <section className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-charcoal">
            D. Why this may be relevant
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate">
            {report.whyThisIsRelevant.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span aria-hidden="true" className="text-forest">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* E. WHAT YOU CAN DO NEXT */}
        <section className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-charcoal">
            E. What you can do next
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate">
            {report.whatYouCanDoNext.map((step) => (
              <li key={step} className="flex items-start gap-2">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* F. WHEN TO SEEK MEDICAL CARE */}
        <section className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-charcoal">
            F. When to seek medical care
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate">
            {report.whenToSeekMedicalCare.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <HeartIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* G. WARNING SIGNS */}
        <section className="rounded-2xl border border-urgent/25 bg-urgent-soft/35 p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-urgent">
            G. Warning signs — seek immediate help (call 112)
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-charcoal">
            {report.warningSigns.map((sign) => (
              <li key={sign} className="flex items-start gap-2">
                <ShieldAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-urgent" />
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* H. DISCLAIMER */}
        <section className="rounded-2xl border border-forest/25 bg-sage-mist p-5 text-sm font-medium text-forest">
          <strong>H. Disclaimer:</strong> {report.disclaimer}
        </section>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="lg" onClick={onEditAnswers}>
            Edit answers
          </Button>
          <Button variant="ghost" size="lg" onClick={onStartOver}>
            Start new check-in
          </Button>
        </div>
        <Button variant="forest" size="lg" onClick={onBackToHome}>
          Back to VITALORA home
        </Button>
      </div>
    </div>
  )
}
