import { motion } from 'framer-motion'
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
 * Prominent, calm, accessible safety banner shown immediately whenever
 * rule-based emergency or caution triggers are detected.
 */
export function EmergencyAlertBanner({
  assessment,
}: EmergencyAlertBannerProps) {
  if (assessment.level === 'none') return null

  const isEmergency = assessment.level === 'emergency'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      role={isEmergency ? 'alert' : 'status'}
      aria-live={isEmergency ? 'assertive' : 'polite'}
      data-testid="emergency-alert-banner"
      data-level={assessment.level}
      className={`rounded-[2rem] border-2 p-5 sm:p-7 ${
        isEmergency
          ? 'border-tomato bg-tomato-soft shadow-[0_8px_0_0_rgba(222,68,54,0.16)]'
          : 'border-tomato/55 bg-warm-white shadow-[0_6px_0_0_rgba(222,68,54,0.1)]'
      }`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isEmergency
                ? 'bg-tomato text-warm-white'
                : 'bg-tomato-soft text-tomato'
            }`}
          >
            <ShieldAlertIcon className="h-6 w-6" />
          </span>

          <div className="space-y-2">
            <span className="inline-block rounded-full bg-warm-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#8F2118]">
              {isEmergency ? 'Immediate medical care advised' : 'Important safety check'}
            </span>
            <h2 className="font-display text-2xl font-bold text-ink">
              {assessment.headline}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-ink">
              {assessment.message}
            </p>

            {assessment.triggers.length > 0 ? (
              <p className="text-sm font-bold text-[#8F2118]">
                Triggered by: {assessment.triggers.join(', ')}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Button
            href={`tel:${assessment.emergencyNumber}`}
            variant="tomato"
            size="md"
            leftIcon={<PhoneUrgentIcon className="h-5 w-5" />}
          >
            Call {assessment.emergencyNumber} (India)
          </Button>
          <span className="text-xs font-bold text-[#8F2118]">
            Or visit the nearest emergency hospital
          </span>
        </div>
      </div>
    </motion.div>
  )
}
