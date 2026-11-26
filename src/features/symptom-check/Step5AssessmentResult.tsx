import { useEffect, useMemo, useState } from 'react'
import { ShieldAlertIcon } from '../../components/illustrations/Icons'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../auth/AuthContext'
import { MedicalChatbot } from '../chatbot/MedicalChatbot'
import { NearbyFacilities } from '../facilities/NearbyFacilities'
import { downloadAssessmentPdf, type MlPredictionItem } from '../../utils/pdfReport'
import { getConfirmedSymptomIds } from './emergencyRules'
import {
  buildFallbackAnalysis,
  URGENCY_CONFIG,
  type SimpleSymptomAnalysisResult,
} from './specialistMapper'
import type { AssessmentReport, SymptomCheckInData } from './types'

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
  predictions: MlPredictionItem[]
}

export function Step5AssessmentResult({
  report,
  rawData,
  onEditAnswers,
  onStartOver,
  onBackToHome,
  onOpenAuth,
}: Step5AssessmentResultProps) {
  const { user } = useAuth()
  const [mlPredictions, setMlPredictions] = useState<MlPredictionItem[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<SimpleSymptomAnalysisResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiNotice, setAiNotice] = useState('')
  const [locateTrigger, setLocateTrigger] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (report.isEmergencyInterrupted || report.insufficientInformation || !rawData) {
      return
    }

    let cancelled = false
    const controller = new AbortController()

    const fetchMl = async () => {
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
          signal: controller.signal,
        })
        if (!res.ok) return
        const data = (await res.json()) as PredictApiResponse
        if (!cancelled && Array.isArray(data.predictions)) {
          setMlPredictions(data.predictions)
        }
      } catch {
        // Optional ML enrichment; ignore if unavailable
      }
    }

    const fetchAiAnalysis = async () => {
      setAiLoading(true)
      setAiNotice('')
      try {
        const measurements: Record<string, string> = {}
        for (const item of report.healthMeasurements.items) {
          if (item.label === 'Body temperature') measurements.temperature = item.readingText
          if (item.label === 'Blood pressure') measurements.bloodPressure = item.readingText
          if (item.label === 'Heart rate') measurements.heartRate = item.readingText
          if (item.label === 'Blood oxygen (SpO2)') measurements.spo2 = item.readingText
        }

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symptoms: report.reportedSymptoms.confirmedSymptomLabels,
            notes: report.reportedSymptoms.userDescribedNotes,
            duration: report.reportedSymptoms.durationLabel,
            severity: report.reportedSymptoms.severityLabel,
            progression: report.reportedSymptoms.progressionLabel,
            measurements,
            isEmergency: report.isEmergencyInterrupted,
            emergencyTriggers: report.safety.triggers,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          if (!cancelled) {
            setAiNotice('Showing standard clinical guidance (AI summary unavailable).')
          }
          return
        }

        const data = (await res.json()) as Omit<SimpleSymptomAnalysisResult, 'source'>
        if (!cancelled && data.symptomSummary && data.recommendedSpecialist?.name) {
          setAiAnalysis({ ...data, source: 'ai' })
        }
      } catch {
        if (!cancelled) {
          setAiNotice('Showing standard clinical guidance (AI summary unavailable).')
        }
      } finally {
        if (!cancelled) setAiLoading(false)
      }
    }

    void fetchMl()
    void fetchAiAnalysis()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [report, rawData])

  const fallbackAnalysis = useMemo(
    () => buildFallbackAnalysis(report, rawData, mlPredictions),
    [report, rawData, mlPredictions],
  )

  const analysis = aiAnalysis ?? fallbackAnalysis
  const urgencyMeta = URGENCY_CONFIG[analysis.urgencyLevel]

  const handleFindNearbyDoctors = () => {
    setLocateTrigger((prev) => prev + 1)
    const el = document.getElementById('nearby-healthcare-providers')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
          mlPredictions,
          summaryText: analysis.symptomSummary,
        }),
      })
      setSaveState(res.ok ? 'saved' : 'error')
    } catch {
      setSaveState('error')
    }
  }

  // Emergency priority view: prioritize immediate emergency help over ordinary doctor recommendations
  if (report.isEmergencyInterrupted || analysis.urgencyLevel === 'emergency') {
    const triggers =
      report.safety.triggers.length > 0
        ? report.safety.triggers
        : [analysis.urgencyReason || 'Urgent warning signs detected.']

    return (
      <div className="space-y-6">
        <div
          role="alert"
          aria-live="assertive"
          className="space-y-5 rounded-3xl border-2 border-urgent bg-urgent-soft p-6 sm:p-8 shadow-sm"
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-urgent text-paper">
              <ShieldAlertIcon className="h-6 w-6" />
            </div>
            <div>
              <Badge tone="urgent">Emergency</Badge>
              <h1 className="mt-1 font-display text-2xl font-semibold text-charcoal sm:text-3xl">
                Seek emergency medical assistance immediately
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-charcoal">
            {report.isEmergencyInterrupted
              ? report.safety.message
              : analysis.urgencyReason ||
                'Your symptoms include warning signs that need immediate emergency medical care.'}
          </p>

          <div className="rounded-2xl border border-urgent/25 bg-paper p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-urgent">
              Reason for emergency alert
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm font-medium text-charcoal">
              {triggers.map((trigger) => (
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
            <Button variant="outline" size="md" onClick={onEditAnswers}>
              Edit answers
            </Button>
            <Button variant="ghost" size="md" onClick={onStartOver}>
              Start over
            </Button>
          </div>

          <p className="text-xs text-charcoal/80">{report.disclaimer}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Compact Header + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge tone="forest" dotColor="#174B42">
            Symptom Check Result
          </Badge>
          <h1 className="mt-1.5 font-display text-2xl font-semibold text-charcoal sm:text-3xl">
            Your Health Summary
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadAssessmentPdf(report, mlPredictions, user?.name)}
          >
            Download PDF
          </Button>
          <Button
            variant="forest"
            size="sm"
            onClick={() => void handleSaveToHistory()}
            disabled={saveState === 'saving' || saveState === 'saved'}
          >
            {saveState === 'saved'
              ? 'Saved'
              : saveState === 'saving'
                ? 'Saving...'
                : user
                  ? 'Save'
                  : 'Sign in to save'}
          </Button>
        </div>
      </div>

      {/* 1. SYMPTOM ANALYSIS */}
      <section
        aria-labelledby="symptom-analysis-heading"
        className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6 space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <h2
            id="symptom-analysis-heading"
            className="text-xs font-semibold uppercase tracking-wider text-forest"
          >
            Symptom Analysis
          </h2>
          {aiLoading ? (
            <span className="text-xs text-stone">Analyzing symptoms...</span>
          ) : null}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-stone">Your Symptoms</p>
          <p className="text-sm sm:text-base text-charcoal leading-relaxed">
            {analysis.symptomSummary}
          </p>
        </div>

        {aiNotice ? (
          <p className="text-xs text-stone">{aiNotice}</p>
        ) : null}

        {report.insufficientInformation ? (
          <div className="rounded-xl border border-hairline bg-ivory p-4 text-sm text-charcoal space-y-2">
            <p>{report.insufficientInfoMessage}</p>
            {analysis.followUpQuestion ? (
              <p className="font-medium text-forest">{analysis.followUpQuestion}</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-xs font-semibold text-stone">
                Possible Conditions
              </p>
              <span className="text-[11px] text-stone">
                Possibilities only — not a medical diagnosis
              </span>
            </div>

            {aiLoading && !aiAnalysis ? (
              <div className="space-y-2.5">
                <div className="h-16 animate-pulse rounded-xl bg-ivory border border-hairline" />
                <div className="h-16 animate-pulse rounded-xl bg-ivory border border-hairline" />
              </div>
            ) : analysis.possibleConditions.length > 0 ? (
              <ol className="space-y-2.5">
                {analysis.possibleConditions.slice(0, 3).map((cond, idx) => (
                  <li
                    key={cond.name}
                    className="rounded-xl border border-hairline bg-ivory p-3.5 sm:p-4"
                  >
                    <p className="text-sm font-semibold text-charcoal">
                      {idx + 1}. {cond.name}
                    </p>
                    <p className="mt-1 text-sm text-slate leading-relaxed">
                      {cond.explanation}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-xl border border-hairline bg-ivory p-3.5 text-sm text-slate">
                Your symptoms are quite general. A doctor can help narrow down the cause.
              </p>
            )}

            {analysis.followUpQuestion ? (
              <p className="rounded-xl border border-forest/20 bg-sage-mist/40 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal">
                <strong className="text-forest">Helpful detail to share with a doctor:</strong>{' '}
                {analysis.followUpQuestion}
              </p>
            ) : null}
          </div>
        )}
      </section>

      {/* 2. URGENCY LEVEL */}
      <section
        aria-labelledby="urgency-level-heading"
        className={`rounded-2xl border-2 p-5 sm:p-6 space-y-2 ${urgencyMeta.containerClass}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="urgency-level-heading"
            className="text-xs font-semibold uppercase tracking-wider text-charcoal/75"
          >
            Urgency Level
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${urgencyMeta.badgeClass}`}
          >
            {urgencyMeta.label}
          </span>
        </div>

        <p className="font-display text-lg sm:text-xl font-semibold text-charcoal">
          {urgencyMeta.description}
        </p>

        {analysis.urgencyReason ? (
          <p className="text-sm text-charcoal/85 leading-relaxed">
            {analysis.urgencyReason}
          </p>
        ) : null}
      </section>

      {/* 3. RECOMMENDED SPECIALIST */}
      <section
        aria-labelledby="recommended-specialist-heading"
        className="rounded-2xl border border-forest/25 bg-paper p-5 sm:p-6 space-y-4 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h2
              id="recommended-specialist-heading"
              className="text-xs font-semibold uppercase tracking-wider text-forest"
            >
              Recommended Specialist
            </h2>
            <p className="font-display text-xl sm:text-2xl font-semibold text-charcoal">
              {analysis.recommendedSpecialist.name}
            </p>
            <p className="text-sm text-slate leading-relaxed max-w-xl">
              {analysis.recommendedSpecialist.reason}
            </p>
          </div>

          <Button
            type="button"
            variant="forest"
            size="md"
            onClick={handleFindNearbyDoctors}
            className="shrink-0 w-full sm:w-auto"
          >
            Find Nearby Doctors
          </Button>
        </div>
      </section>

      {/* 4. NEARBY HEALTHCARE PROVIDERS */}
      <NearbyFacilities
        recommendedSpecialist={analysis.recommendedSpecialist.name}
        locateTrigger={locateTrigger}
      />

      {/* 5. NEXT STEP */}
      <section
        aria-labelledby="next-step-heading"
        className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6 space-y-2 shadow-sm"
      >
        <h2
          id="next-step-heading"
          className="text-xs font-semibold uppercase tracking-wider text-forest"
        >
          Next Step
        </h2>
        <p className="text-sm sm:text-base text-charcoal leading-relaxed">
          {analysis.nextStep}
        </p>
        <p className="pt-1 text-xs text-stone">
          {report.disclaimer}
        </p>
      </section>

      {/* Secondary: Optional AI Follow-up Chat */}
      <div className="rounded-2xl border border-hairline bg-paper p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-charcoal">
              Have a question about these symptoms?
            </p>
            <p className="text-xs text-stone">
              Chat with the VITALORA Health Guide in English or Hindi.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowChat((prev) => !prev)}
          >
            {showChat ? 'Hide chat' : 'Ask AI Assistant'}
          </Button>
        </div>

        {showChat ? (
          <div className="mt-4">
            <MedicalChatbot
              initialLanguage={user?.preferredLanguage ?? 'en'}
              context={{
                symptoms: report.reportedSymptoms.confirmedSymptomLabels,
                careLevel: urgencyMeta.label,
                predictions: mlPredictions.map((p) => ({
                  condition: p.condition,
                  confidencePercent: p.confidencePercent,
                })),
              }}
            />
          </div>
        ) : null}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5">
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" size="md" onClick={onEditAnswers}>
            Edit answers
          </Button>
          <Button variant="ghost" size="md" onClick={onStartOver}>
            Start new check-in
          </Button>
        </div>
        <Button variant="forest" size="md" onClick={onBackToHome}>
          Back to VITALORA home
        </Button>
      </div>
    </div>
  )
}
