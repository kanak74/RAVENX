import { useRef, type ReactNode } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { vitaloraMotion } from '../../styles/theme'

export type RevealDirection = 'up' | 'left' | 'right' | 'none'

export interface RevealProps {
  children: ReactNode
  delay?: number
  direction?: RevealDirection
  className?: string
}

const DIRECTION_OFFSET: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 20 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
  none: { x: 0, y: 0 },
}

/** Smooth viewport-triggered editorial reveal supporting intentional directional entry. */
export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: RevealProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  const offset = DIRECTION_OFFSET[direction]

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
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
            duration: 0.44,
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

/** Ultra-subtle breathing motion for hero composition elements; disabled under reduced motion. */
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
 * with a clean botanical sheen and restrained hover lift.
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
  const sheen = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, rgba(23, 75, 66, 0.055), transparent 75%)`

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

/** Smooth full-page scroll-driven background transition wrapper for the landing narrative. */
export function ScrollColorCanvas({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const prefersReduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.18, 0.42, 0.68, 0.86, 1],
    [
      '#F9F7F2', // Warm Ivory (Hero)
      '#F2EEE5', // Soft Linen Stone (Body Explorer)
      '#E6EEE9', // Calm Botanical Sage (Sticky Anatomy Journey)
      '#F9F7F2', // Warm Ivory (Signal Awareness)
      '#ECE8DE', // Editorial Warm Grey-Sand (Safety)
      '#F6EAE2', // Soft Terracotta Blush (Final CTA)
    ],
  )

  return (
    <motion.div
      ref={containerRef}
      style={prefersReduced ? { backgroundColor: '#F9F7F2' } : { backgroundColor }}
      className={`relative transition-colors ${className}`}
    >
      {children}
    </motion.div>
  )
}

/** Vertical scroll-linked progress spine for timeline sections. */
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
