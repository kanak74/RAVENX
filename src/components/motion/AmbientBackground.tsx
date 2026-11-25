import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

/**
 * Calm, architectural ambient background layer.
 * Uses subtle organic botanical contours, slow tonal breathing, and gentle
 * scroll-linked parallax depth — completely free of neon glows or clutter.
 */
export function AmbientBackground() {
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll()

  const driftTopY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const driftBottomY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const ringRotate = useTransform(scrollYProgress, [0, 1], [0, 18])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Subtle top-right seafoam tonal wash */}
      <motion.div
        style={prefersReduced ? undefined : { y: driftTopY }}
        animate={
          prefersReduced
            ? undefined
            : { scale: [1, 1.05, 1], opacity: [0.55, 0.72, 0.55] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-40 -top-40 h-[540px] w-[540px] rounded-full"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(227,240,237,0.85) 0%, rgba(227,240,237,0) 70%)',
          }}
        />
      </motion.div>

      {/* Subtle bottom-left warm terracotta-apricot wash */}
      <motion.div
        style={prefersReduced ? undefined : { y: driftBottomY }}
        animate={
          prefersReduced
            ? undefined
            : { scale: [1, 1.06, 1], opacity: [0.45, 0.65, 0.45] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-48 -left-40 h-[560px] w-[560px] rounded-full"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(247,236,228,0.85) 0%, rgba(247,236,228,0) 70%)',
          }}
        />
      </motion.div>

      {/* Architectural contour lines gently rotating on scroll */}
      <motion.svg
        style={prefersReduced ? undefined : { rotate: ringRotate }}
        viewBox="0 0 1200 900"
        fill="none"
        className="absolute left-1/2 top-1/2 h-[115vh] w-[115vw] -translate-x-1/2 -translate-y-1/2 opacity-40"
      >
        <circle
          cx="960"
          cy="180"
          r="260"
          stroke="#C9C4B7"
          strokeWidth="1"
          strokeDasharray="6 10"
        />
        <circle
          cx="220"
          cy="720"
          r="300"
          stroke="#5C8A80"
          strokeOpacity="0.28"
          strokeWidth="1"
        />
        <path
          d="M-60 440C220 340 520 560 880 420C1060 350 1160 390 1280 460"
          stroke="#D4694F"
          strokeOpacity="0.16"
          strokeWidth="1.2"
        />
      </motion.svg>
    </div>
  )
}
