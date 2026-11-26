import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

/**
 * Calm, architectural ambient background layer.
 * Uses fine botanical calibration curves, warm ivory/sage/terracotta washes,
 * and scroll-linked parallax — keeping motion purposeful and noise-free.
 */
export function AmbientBackground() {
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll()

  const driftTopY = useTransform(scrollYProgress, [0, 1], [0, 140])
  const driftBottomY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 22])
  const meridianShift = useTransform(scrollYProgress, [0, 1], [-24, 24])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Top-right sage atmosphere wash */}
      <motion.div
        style={prefersReduced ? undefined : { y: driftTopY }}
        animate={
          prefersReduced
            ? undefined
            : { scale: [1, 1.04, 1], opacity: [0.48, 0.65, 0.48] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-44 -top-44 h-[580px] w-[580px] rounded-full"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(228,237,232,0.85) 0%, rgba(228,237,232,0) 70%)',
          }}
        />
      </motion.div>

      {/* Bottom-left soft terracotta-coral atmosphere wash */}
      <motion.div
        style={prefersReduced ? undefined : { y: driftBottomY }}
        animate={
          prefersReduced
            ? undefined
            : { scale: [1, 1.05, 1], opacity: [0.42, 0.6, 0.42] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-52 -left-44 h-[580px] w-[580px] rounded-full"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(246,235,228,0.88) 0%, rgba(246,235,228,0) 70%)',
          }}
        />
      </motion.div>

      {/* Subtle architectural meridian & calibration contours */}
      <motion.svg
        style={prefersReduced ? undefined : { rotate: ringRotate, y: meridianShift }}
        viewBox="0 0 1200 900"
        fill="none"
        className="absolute left-1/2 top-1/2 h-[118vh] w-[118vw] -translate-x-1/2 -translate-y-1/2 opacity-40"
      >
        <circle
          cx="950"
          cy="190"
          r="270"
          stroke="#CAC4B6"
          strokeWidth="0.9"
          strokeDasharray="5 9"
        />
        <circle
          cx="220"
          cy="700"
          r="310"
          stroke="#5B8577"
          strokeOpacity="0.22"
          strokeWidth="0.9"
        />
        <path
          d="M-60 450C240 355 540 545 890 410C1060 345 1170 385 1280 455"
          stroke="#D6735C"
          strokeOpacity="0.14"
          strokeWidth="1.1"
        />
      </motion.svg>
    </div>
  )
}
