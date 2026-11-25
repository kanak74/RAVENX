import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Container } from '../../components/layout/Container'
import { Section } from '../../components/layout/Section'
import { Button } from '../../components/ui/Button'
import { CheckInProgress, type CheckInStep } from './CheckInProgress'
import { getContextualQuestions } from './contextualQuestions'
import { EmergencyAlertBanner } from './EmergencyAlertBanner'
import { evaluateEmergencySafety } from './emergencyRules'
import { Step1SelectSymptoms } from './Step1SelectSymptoms'
import { Step2SymptomDetails } from './Step2SymptomDetails'
import { Step3ContextualQuestions } from './Step3ContextualQuestions'
import { Step4ReviewAnswers } from './Step4ReviewAnswers'
import type { SymptomCheckInData, SymptomDetailsState } from './types'

export interface SymptomCheckFlowProps {
  onExitCheckIn: () => void
}

const INITIAL_DATA: SymptomCheckInData = {
  selectedIds: [],
  details: {},
  contextualAnswers: {},
}

/**
 * Calm, clinical-grade guided symptom check-in workspace inside VITALORA.
 * Keeps rule-based emergency safety evaluation active on every step.
 */
export function SymptomCheckFlow({ onExitCheckIn }: SymptomCheckFlowProps) {
  const prefersReduced = useReducedMotion()
  const [step, setStep] = useState<CheckInStep>(1)
  const [highestStepReached, setHighestStepReached] = useState<CheckInStep>(1)
  const [data, setData] = useState<SymptomCheckInData>(INITIAL_DATA)
  const [assessmentPreviewOpen, setAssessmentPreviewOpen] = useState(false)

  const emergencyAssessment = useMemo(
    () => evaluateEmergencySafety(data),
    [data],
  )

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
  }

  const goToStep = (nextStep: CheckInStep) => {
    setAssessmentPreviewOpen(false)
    setStep(nextStep)
    setHighestStepReached((prev) => (nextStep > prev ? nextStep : prev))
    scrollTop()
  }

  const handleToggleSymptom = (id: string) => {
    setData((prev) => {
      const exists = prev.selectedIds.includes(id)
      const selectedIds = exists
        ? prev.selectedIds.filter((item) => item !== id)
        : [...prev.selectedIds, id]

      return { ...prev, selectedIds }
    })
  }

  const handleChangeDetails = (details: SymptomDetailsState) => {
    setData((prev) => ({ ...prev, details }))
  }

  const handleSelectContextual = (
    questionId: string,
    value: string | undefined,
  ) => {
    setData((prev) => {
      const nextAnswers = { ...prev.contextualAnswers }
      if (value === undefined) {
        delete nextAnswers[questionId]
      } else {
        nextAnswers[questionId] = value
      }
      return { ...prev, contextualAnswers: nextAnswers }
    })
  }

  const handleSkipAllContextual = () => {
    const questions = getContextualQuestions(data.selectedIds)
    setData((prev) => {
      const nextAnswers = { ...prev.contextualAnswers }
      for (const q of questions) {
        if (!nextAnswers[q.id]) {
          nextAnswers[q.id] = 'skipped'
        }
      }
      return { ...prev, contextualAnswers: nextAnswers }
    })
    goToStep(4)
  }

  const handleStartOver = () => {
    setData(INITIAL_DATA)
    setAssessmentPreviewOpen(false)
    setStep(1)
    setHighestStepReached(1)
    scrollTop()
  }

  const hasAnyInput =
    data.selectedIds.length > 0 ||
    Object.keys(data.details).length > 0 ||
    Object.keys(data.contextualAnswers).length > 0

  return (
    <Section
      id="symptom-check-in"
      tone="ivory"
      bordered={false}
      className="min-h-[75vh] py-8 sm:py-12"
    >
      <Container size="narrow">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={onExitCheckIn}>
              ← Back to home guide
            </Button>

            {hasAnyInput ? (
              <Button variant="ghost" size="sm" onClick={handleStartOver}>
                Start over
              </Button>
            ) : null}
          </div>

          <CheckInProgress
            currentStep={step}
            highestStepReached={highestStepReached}
            onSelectStep={goToStep}
          />

          <EmergencyAlertBanner assessment={emergencyAssessment} />

          <AnimatePresence mode="wait">
            <motion.div
              key={`${step}-${assessmentPreviewOpen ? 'stage4' : 'active'}`}
              initial={prefersReduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: prefersReduced ? 0 : 0.2 }}
            >
              {step === 1 ? (
                <Step1SelectSymptoms
                  selectedIds={data.selectedIds}
                  onToggleSymptom={handleToggleSymptom}
                  onContinue={() => goToStep(2)}
                />
              ) : null}

              {step === 2 ? (
                <Step2SymptomDetails
                  details={data.details}
                  hasSelectedSymptoms={data.selectedIds.length > 0}
                  onChangeDetails={handleChangeDetails}
                  onBack={() => goToStep(1)}
                  onContinue={() => goToStep(3)}
                />
              ) : null}

              {step === 3 ? (
                <Step3ContextualQuestions
                  selectedIds={data.selectedIds}
                  answers={data.contextualAnswers}
                  onSelectAnswer={handleSelectContextual}
                  onSkipAll={handleSkipAllContextual}
                  onBack={() => goToStep(2)}
                  onContinue={() => goToStep(4)}
                />
              ) : null}

              {step === 4 ? (
                <Step4ReviewAnswers
                  data={data}
                  assessmentPreviewOpen={assessmentPreviewOpen}
                  onEditStep={goToStep}
                  onBack={() => goToStep(3)}
                  onContinueToAssessment={() => {
                    setAssessmentPreviewOpen(true)
                    scrollTop()
                  }}
                  onCloseAssessmentPreview={() => setAssessmentPreviewOpen(false)}
                  onStartOver={handleStartOver}
                  onBackToHome={onExitCheckIn}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </Section>
  )
}
