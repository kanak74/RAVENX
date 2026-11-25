import { useEffect, useState } from 'react'
import {
  CheckCircleIcon,
  HeartIcon,
  ShieldAlertIcon,
} from '../../components/illustrations/Icons'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../auth/AuthContext'
import { MedicalChatbot } from '../chatbot/MedicalChatbot'
import { NearbyFacilities } from '../facilities/NearbyFacilities'
import { downloadAssessmentPdf, type MlPredictionItem } from '../../utils/pdfReport'
import type { AssessmentReport, SymptomCheckInData } from './types'
import { getConfirmedSymptomIds } from './emergencyRules'

export interface Step5AssessmentResultProps {
  report: AssessmentReport
  rawData?: SymptomCheckInData
  onEditAnswers: () => void
  onStartOver: () => void
  onBackToHome: () => void
  onOpenAuth?: () => void
}

interface PredictApiResponse {
  status: 'ok' | 'emergency' | 'insufficient_data'
  insufficientData?: boolean
  predictions: MlPredictionItem[]
  modelInfo?: {
    modelType: string
    cvAccuracy: number
    datasetRows: number
  }
  disclaimer?: string
}

/**
 * Connected Stage 4–6 Assessment Result Dashboard.
 * - Priority 1: Non-bypassable emergency interruption when safety rules trigger.
 * - Integrates real Python ML disease pattern predictions (/api/predict),
 *   downloadable PDF export, Neon Postgres history saving, Hindi/English AI Medical
 *   Assistant (/api/chat), and verified nearby healthcare facilities (/api/facilities).
 */
export function Step5AssessmentResult({
  report,
  rawData,
  onEditAnswers,
  onStartOver,
  onBackToHome,
  onOpenAuth,
}: Step5AssessmentResultProps) {
  const { user } = useAuth()
  const [mlResult, setMlResult] = useState<PredictApiResponse | null>(null)
  const [mlLoading, setMlLoading] = useState(false)
  const [mlError, setMlError] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (report.isEmergencyInterrupted || report.insufficientInformation || !rawData) {
      return
    }

    let cancelled = false
    const runMl = async () => {
      setMlLoading(true)
      setMlError('')
      try {
        const confirmedIds = getConfirmedSymptomIds(rawData)
        const res = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symptoms: confirmedIds,
            duration: rawData.details.duration,
            severity: rawData.details.severity,
            progression: rawData.details.progression,
          }),
        })
        if (!res.ok) {
          throw new Error(`ML service returned ${res.status}`)
        }
        const data = (await res.json()) as PredictApiResponse
        if (!cancelled) {
          setMlResult(data)
        }
      } catch {
        if (!cancelled) {
          setMlError('ML pattern service is unavailable in this environment.')
        }
      } finally {
        if (!cancelled) setMlLoading(false)
      }
    }

    void runMl()
    return () => {
      cancelled = true
    }
  }, [report.isEmergencyInterrupted, report.insufficientInformation, rawData])

  const handleSaveToHistory = async () => {
    if (!user) {
      onOpenAuth?.()
      return
    }
    setSaveState('saving')
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          symptoms: report.reportedSymptoms.confirmedSymptomLabels,
          details: rawData?.details ?? {},
          measurements: rawData?.measurements ?? {},
          careLevel: report.careGuidance.level,
          mlPredictions: mlResult?.predictions ?? [],
          summaryText: report.careGuidance.summary,
        }),
      })
      setSaveState(res.ok ? 'saved' : 'error')
    } catch {
      setSaveState('error')
    }
  }

  if (report.isEmergencyInterrupted) {
    return (
      <div className="space-y-6">
        <div
          role="alert"
          aria-live="assertive"
          className="space-y-6 rounded-3xl border-2 border-urgent bg-urgent-soft p-6 sm:p-10 shadow-[0_18px_42px_-16px_rgba(184,58,50,0.25)]"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-urgent text-paper">
              <ShieldAlertIcon className="h-6 w-6" />
            </div>
            <div>
              <Badge tone="urgent">Emergency — Get emergency help now</Badge>
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
              Why this emergency warning appeared
            </h2>
            <ul className="mt-2.5 space-y-2 text-sm font-semibold text-charcoal">
              {report.safety.triggers.map((trigger) => (
                <li key={trigger} className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-urgent">
                    •
                  </span>
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
              Change my answers
            </Button>
            <Button variant="ghost" size="lg" onClick={onStartOver}>
              Start over
            </Button>
          </div>

          <div className="space-y-1.5 border-t border-urgent/20 pt-4 text-xs text-charcoal/85">
            <p className="font-semibold">{report.disclaimer}</p>
            <p>
              Emergency rules cannot be skipped and always take priority over
              ML predictions and general information.
            </p>
          </div>
        </div>

        <NearbyFacilities />
      </div>
    )
  }

  const isPromptAttention = report.careGuidance.level === 'medical-attention'
  const mlPredictions = mlResult?.predictions ?? []

  return (
    <div className="space-y-7">
      {/* Header + Actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Badge tone="forest" dotColor="#174B42">
            Your Health Guide
          </Badge>
          <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">
            Here is what your answers suggest
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate">
            Plain-language guidance combined with statistical symptom pattern
            analysis. Never a medical diagnosis.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadAssessmentPdf(report, mlPredictions, user?.name)
            }
          >
            Download PDF report
          </Button>
          <Button
            variant="forest"
            size="sm"
            onClick={() => void handleSaveToHistory()}
            disabled={saveState === 'saving' || saveState === 'saved'}
          >
            {saveState === 'saved'
              ? 'Saved to history'
              : saveState === 'saving'
                ? 'Saving...'
                : user
                  ? 'Save to history'
                  : 'Sign in to save'}
          </Button>
        </div>
      </div>

      {/* B. HOW URGENT IS IT? */}
      <section
        aria-labelledby="care-guidance-heading"
        className={`rounded-2xl border-2 p-5 sm:p-6 ${
          isPromptAttention
            ? 'border-coral bg-coral-soft/65'
            : 'border-forest/30 bg-sage-mist/75'
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-stone">
          How urgent is it?
        </p>
        <h2
          id="care-guidance-heading"
          className="mt-1 font-display text-xl font-semibold text-charcoal sm:text-2xl"
        >
          {report.careGuidance.label}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-charcoal/90 sm:text-base">
          {report.careGuidance.summary}
        </p>
        {report.careGuidance.reasons.length > 0 ? (
          <ul className="mt-3 space-y-1.5 text-sm text-slate">
            {report.careGuidance.reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className={isPromptAttention ? 'text-coral' : 'text-forest'}
                >
                  •
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* STAGE 3 & 4: REAL PYTHON ML DISEASE PATTERN ANALYSIS */}
      {!report.insufficientInformation ? (
        <section
          aria-labelledby="ml-prediction-heading"
          className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Badge tone="sand">ML Pattern Analysis</Badge>
              <h2
                id="ml-prediction-heading"
                className="mt-1.5 font-display text-xl font-semibold text-charcoal sm:text-2xl"
              >
                Possible conditions matching these symptoms
              </h2>
            </div>
            {mlResult?.modelInfo ? (
              <span className="text-xs text-stone">
                {mlResult.modelInfo.modelType} · {mlResult.modelInfo.datasetRows}{' '}
                training cases
              </span>
            ) : null}
          </div>

          <p className="text-xs leading-relaxed text-stone">
            Confidence bars show how closely your symptom pattern matches
            historical cases in our dataset. They are{' '}
            <strong>not confirmed medical probabilities or diagnoses</strong>.
          </p>

          {mlLoading ? (
            <p className="text-sm text-stone">
              Running Python ML symptom analysis...
            </p>
          ) : mlError ? (
            <p className="text-xs text-stone">{mlError}</p>
          ) : mlPredictions.length > 0 ? (
            <div className="space-y-3">
              {mlPredictions.map((pred) => (
                <div
                  key={pred.condition}
                  className="rounded-xl border border-hairline bg-ivory p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-charcoal">
                      {pred.condition}
                    </h3>
                    <span className="rounded-full border border-forest/25 bg-sage-mist px-3 py-0.5 text-xs font-semibold text-forest">
                      {pred.confidencePercent}% pattern match
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-sand">
                    <div
                      className="h-full rounded-full bg-forest transition-all"
                      style={{ width: `${pred.confidencePercent}%` }}
                    />
                  </div>

                  <p className="text-sm text-slate">{pred.summary}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-stone">
                        Influenced by:
                      </span>
                      {pred.influencingSymptoms.map((s) => (
                        <span
                          key={s.id}
                          className="rounded-full border border-hairline bg-paper px-2.5 py-0.5 font-medium text-charcoal"
                        >
                          {s.label}
                        </span>
                      ))}
                    </div>
                    <span className="font-semibold text-coral">
                      Suggested doctor: {pred.recommendedSpecialist}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate">
              Not enough recognized symptoms for statistical pattern matching.
            </p>
          )}
        </section>
      ) : null}

      {/* A. WHAT MIGHT BE HAPPENING? */}
      <section
        aria-labelledby="what-happening-heading"
        className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6 space-y-4"
      >
        <div>
          <h2
            id="what-happening-heading"
            className="font-display text-xl font-semibold text-charcoal sm:text-2xl"
          >
            What might be happening?
          </h2>
          <p className="mt-1 text-xs text-stone">
            Only a doctor can tell you for sure. These are common, general
            possibilities based on your answers.
          </p>
        </div>

        {report.insufficientInformation && report.insufficientInfoMessage ? (
          <p className="rounded-xl border border-hairline bg-ivory p-4 text-sm leading-relaxed text-charcoal">
            {report.insufficientInfoMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {report.whatInfoMaySuggest.map((block) => (
              <div
                key={block.id}
                className="rounded-xl border border-hairline bg-ivory p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-charcoal">
                    {block.title}
                  </h3>
                  <span className="text-xs text-stone">
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
        )}

        {report.whyThisIsRelevant.length > 0 && !report.insufficientInformation ? (
          <div className="border-t border-hairline pt-3.5">
            <h3 className="text-sm font-semibold text-charcoal">
              How your details fit together
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate">
              {report.whyThisIsRelevant.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-forest">
                    •
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {report.feverAssessment.mode !== 'none' ? (
          <div className="rounded-xl border border-forest/20 bg-sage-mist/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-forest">
              {report.feverAssessment.mode === 'measured-temperature'
                ? 'About your thermometer reading'
                : 'About feeling feverish'}
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

      {/* C. WHAT SHOULD I DO NOW? */}
      <section
        aria-labelledby="what-to-do-heading"
        className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6"
      >
        <h2
          id="what-to-do-heading"
          className="font-display text-xl font-semibold text-charcoal sm:text-2xl"
        >
          What should I do now?
        </h2>
        <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate sm:text-base">
          {report.whatYouCanDoNext.map((step) => (
            <li key={step} className="flex items-start gap-2.5">
              <CheckCircleIcon className="mt-1 h-4 w-4 shrink-0 text-forest" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* D. WHEN SHOULD I SEEK MEDICAL HELP? */}
      <section
        aria-labelledby="when-seek-help-heading"
        className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6 space-y-5"
      >
        <h2
          id="when-seek-help-heading"
          className="font-display text-xl font-semibold text-charcoal sm:text-2xl"
        >
          When should I seek medical help?
        </h2>

        <div>
          <h3 className="text-sm font-semibold text-charcoal">
            Contact a doctor, clinic, or pharmacist if:
          </h3>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate">
            {report.whenToSeekMedicalCare.map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <HeartIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-urgent/25 bg-urgent-soft/40 p-4">
          <h3 className="text-sm font-semibold text-urgent">
            Get emergency help right away (call 112) if you notice:
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-charcoal">
            {report.warningSigns.map((sign) => (
              <li key={sign} className="flex items-start gap-2">
                <ShieldAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-urgent" />
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* STAGE 5: AI MEDICAL CHATBOT (ENGLISH & HINDI) */}
      <MedicalChatbot
        initialLanguage={user?.preferredLanguage ?? 'en'}
        context={{
          symptoms: report.reportedSymptoms.confirmedSymptomLabels,
          careLevel: report.careGuidance.label,
          predictions: mlPredictions.map((p) => ({
            condition: p.condition,
            confidencePercent: p.confidencePercent,
          })),
        }}
      />

      {/* STAGE 6: VERIFIED NEARBY HEALTHCARE FACILITIES */}
      <NearbyFacilities />

      {/* E. WHAT INFORMATION DID I PROVIDE? */}
      <section
        aria-labelledby="provided-info-heading"
        className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="provided-info-heading"
            className="font-display text-xl font-semibold text-charcoal"
          >
            What information did I provide?
          </h2>
          <Button variant="outline" size="sm" onClick={onEditAnswers}>
            Change answers
          </Button>
        </div>

        {report.reportedSymptoms.confirmedSymptomLabels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {report.reportedSymptoms.confirmedSymptomLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-sage-mist px-3 py-1 text-xs font-semibold text-forest sm:text-sm"
              >
                <span>{label}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate">No specific symptoms selected.</p>
        )}

        <dl className="grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-xl border border-hairline bg-ivory p-3">
            <dt className="text-xs font-medium text-stone">When it started</dt>
            <dd className="mt-0.5 text-sm font-semibold text-charcoal">
              {report.reportedSymptoms.durationLabel}
            </dd>
          </div>
          <div className="rounded-xl border border-hairline bg-ivory p-3">
            <dt className="text-xs font-medium text-stone">How strong</dt>
            <dd className="mt-0.5 text-sm font-semibold text-charcoal">
              {report.reportedSymptoms.severityLabel}
            </dd>
          </div>
          <div className="rounded-xl border border-hairline bg-ivory p-3">
            <dt className="text-xs font-medium text-stone">How it is changing</dt>
            <dd className="mt-0.5 text-sm font-semibold text-charcoal">
              {report.reportedSymptoms.progressionLabel}
            </dd>
          </div>
        </dl>

        {report.healthMeasurements.hasAnyValidMeasurement ? (
          <div className="space-y-2.5 border-t border-hairline pt-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-charcoal">
                Measurements you entered
              </h3>
              <span className="text-xs text-stone">
                Unverified — entered by you
              </span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {report.healthMeasurements.items.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl border p-3 ${
                    item.isConcerning
                      ? 'border-coral/40 bg-coral-soft/30'
                      : 'border-hairline bg-ivory'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-stone">
                      {item.label}
                    </span>
                    <span className="text-[11px] font-medium text-stone">
                      Unverified
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-charcoal sm:text-base">
                    {item.readingText}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate">
                    {item.interpretationNote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Transparency */}
      <section
        aria-labelledby="transparency-heading"
        className="rounded-2xl border border-forest/20 bg-sage-mist/60 p-5 text-xs leading-relaxed text-forest sm:text-sm"
      >
        <h2 id="transparency-heading" className="font-semibold">
          Important to keep in mind
        </h2>
        <ul className="mt-2 space-y-1">
          {report.transparencyPoints.map((point) => (
            <li key={point}>• {point}</li>
          ))}
        </ul>
      </section>

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
