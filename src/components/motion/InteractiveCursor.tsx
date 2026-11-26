import { useEffect, useState } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'

/**
 * Refined desktop cursor layer:
 * 1. A subtle daylight spotlight wash that follows pointer movement across surfaces.
 * 2. A lightweight precision ring that gently expands over clickable buttons/links.
 * Automatically disabled on touch devices and when prefers-reduced-motion is set.
 */
export function InteractiveCursor() {
  const prefersReduced = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [visible, setVisible] = useState(false)
  const [interactiveHover, setInteractiveHover] = useState(false)

  const rawX = useMotionValue(-300)
  const rawY = useMotionValue(-300)

  const spotlightX = useSpring(rawX, { stiffness: 180, damping: 28, mass: 0.4 })
  const spotlightY = useSpring(rawY, { stiffness: 180, damping: 28, mass: 0.4 })

  const ringX = useSpring(rawX, { stiffness: 480, damping: 34, mass: 0.28 })
  const ringY = useSpring(rawY, { stiffness: 480, damping: 34, mass: 0.28 })

  const spotlightBg = useMotionTemplate`radial-gradient(540px circle at ${spotlightX}px ${spotlightY}px, rgba(15, 92, 83, 0.06), rgba(190, 79, 54, 0.03) 42%, transparent 72%)`

  const [liveReducedMotion, setLiveReducedMotion] = useState(false)
  const isReduced = Boolean(prefersReduced || liveReducedMotion)

  useEffect(() => {
    const pointerMedia = window.matchMedia('(pointer: fine)')
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')

    const sync = () => {
      setLiveReducedMotion(motionMedia.matches)
      setEnabled(pointerMedia.matches && !motionMedia.matches)
    }

    sync()
    pointerMedia.addEventListener('change', sync)
    motionMedia.addEventListener('change', sync)

    return () => {
      pointerMedia.removeEventListener('change', sync)
      motionMedia.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    if (!enabled || isReduced) return

    const handleMove = (event: MouseEvent) => {
      rawX.set(event.clientX)
      rawY.set(event.clientY)
      setVisible(true)

      const target = event.target as HTMLElement | null
      const isInteractive = Boolean(
        target?.closest('a, button, input, select, textarea, [role="button"]'),
      )
      setInteractiveHover(isInteractive)
    }

    const handleLeave = () => setVisible(false)

    window.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('mouseleave', handleLeave)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [enabled, isReduced, rawX, rawY])

  if (!enabled || isReduced) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {/* Subtle ambient daylight cursor wash */}
      <motion.div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: spotlightBg,
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Precision subtle outer cursor ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: interactiveHover ? 1.65 : 1,
          borderColor: interactiveHover
            ? 'rgba(190, 79, 54, 0.55)'
            : 'rgba(15, 92, 83, 0.35)',
          backgroundColor: interactiveHover
            ? 'rgba(190, 79, 54, 0.08)'
            : 'rgba(15, 92, 83, 0)',
        }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="fixed left-0 top-0 h-6 w-6 rounded-full border"
      />

      {/* Tiny crisp center marker */}
      <motion.div
        style={{
          x: rawX,
          y: rawY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: visible ? (interactiveHover ? 0.9 : 0.7) : 0,
          scale: interactiveHover ? 0.65 : 1,
        }}
        transition={{ duration: 0.12 }}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-coral"
      />
    </div>
  )
}
