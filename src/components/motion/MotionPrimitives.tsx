import { useRef, type ReactNode } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'
import { vitaloraMotion } from '../../styles/theme'

export interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

/** Smooth viewport-triggered reveal for sections and editorial blocks. */
export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={vitaloraMotion.viewport}
      transition={{
        duration: vitaloraMotion.duration,
        delay,
        ease: vitaloraMotion.ease,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export interface StaggerProps {
  children: ReactNode
  className?: string
}

/** Container that coordinates subtle staggered entrances for child list items. */
export function StaggerGroup({ children, className = '' }: StaggerProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={vitaloraMotion.viewport}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Child item paired with StaggerGroup for ordered upward fade-ins. */
export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.42,
            ease: vitaloraMotion.ease,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Ultra-subtle breathing motion for hero composition accents; disabled under reduced motion. */
export function SubtleFloat({
  children,
  offset = 5,
  duration = 6,
  className = '',
}: {
  children: ReactNode
  offset?: number
  duration?: number
  className?: string
}) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      animate={{ y: [0, -offset, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Interactive surface wrapper that responds softly to cursor movement
 * with a clean botanical sheen and micro-elevation.
 */
export function CursorHighlightCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const prefersReduced = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)
  const active = useSpring(0, { stiffness: 240, damping: 24 })
  const sheen = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, rgba(15, 92, 83, 0.065), transparent 75%)`

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set(event.clientX - rect.left)
    mouseY.set(event.clientY - rect.top)
    active.set(1)
  }

  const handleLeave = () => {
    active.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={prefersReduced ? undefined : { y: -2 }}
      transition={{ duration: 0.2, ease: vitaloraMotion.ease }}
      className={`relative overflow-hidden ${className}`}
    >
      {!prefersReduced ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: sheen, opacity: active }}
        />
      ) : null}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

/** Vertical scroll-linked progress spine for the How It Works narrative. */
export function ScrollProgressSpine({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 75%', 'end 65%'],
  })
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 26,
    restDelta: 0.001,
  })

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-10 left-1/2 top-10 hidden w-px -translate-x-1/2 bg-hairline lg:block"
    >
      <motion.div
        style={prefersReduced ? { scaleY: 1 } : { scaleY }}
        className="h-full w-full origin-top bg-forest"
      />
    </div>
  )
}
