import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
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
      initial={{ opacity: 0, y: 18 }}
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
