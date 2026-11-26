import { motion, useReducedMotion } from 'framer-motion'
import {
  PhoneUrgentIcon,
  ShieldAlertIcon,
} from '../../components/illustrations/Icons'
import { Button } from '../../components/ui/Button'
import type { EmergencyAssessment } from './types'

export interface EmergencyAlertBannerProps {
  assessment: EmergencyAssessment
}

/**
 * Calm, authoritative clinical alert banner shown immediately whenever
 * rule-based emergency or caution triggers are active.
 */
export function EmergencyAlertBanner({
  assessment,
}: EmergencyAlertBannerProps) {
  const prefersReduced = useReducedMotion()

  if (assessment.level === 'none') return null

  const isEmergency = assessment.level === 'emergency'

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      role={isEmergency ? 'alert' : 'status'}
      aria-live={isEmergency ? 'assertive' : 'polite'}
      data-testid="emergency-alert-banner"
      data-level={assessment.level}
      className={`rounded-2xl border border-l-4 border-l-urgent p-5 sm:p-6 ${isEmergency
        ? 'border-urgent/45 bg-urgent-soft shadow-[0_10px_28px_-14px_rgba(184,58,50,0.28)]'
        : 'border-urgent/30 bg-paper shadow-[0_8px_22px_-12px_rgba(184,58,50,0.16)]'
        }`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isEmergency
              ? 'bg-urgent text-paper'
              : 'bg-urgent-soft text-urgent'
              }`}
          >
            <ShieldAlertIcon className="h-5 w-5" />
          </span>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-urgent">
              {isEmergency
                ? 'Immediate medical care advised'
                : 'Important safety check'}
            </p>
            <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">
              {assessment.headline}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-charcoal sm:text-base">
              {assessment.message}
            </p>

            {assessment.triggers.length > 0 ? (
              <p className="pt-0.5 text-xs font-semibold text-urgent sm:text-sm">
                Triggered by: {assessment.triggers.join(', ')}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 sm:items-end">
          <Button
            href={`tel:${assessment.emergencyNumber}`}
            variant="urgent"
            size="md"
            leftIcon={<PhoneUrgentIcon className="h-4 w-4" />}
          >
            Call {assessment.emergencyNumber} (India)
          </Button>
          <span className="text-xs font-medium text-urgent">
            Or go to the nearest emergency room
          </span>
        </div>
      </div>
    </motion.div>
  )
}
