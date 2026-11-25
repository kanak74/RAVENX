import type { ReactNode } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'

export type ButtonVariant =
  | 'coral'
  | 'forest'
  | 'urgent'
  | 'outline'
  | 'ghost'

export type ButtonSize = 'sm' | 'md' | 'lg'

interface SharedButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  className?: string
}

export type ButtonProps = SharedButtonProps &
  Omit<HTMLMotionProps<'button'>, keyof SharedButtonProps> & {
    href?: undefined
  }

export type ButtonLinkProps = SharedButtonProps &
  Omit<HTMLMotionProps<'a'>, keyof SharedButtonProps> & {
    href: string
  }

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  coral:
    'bg-coral text-paper border border-coral shadow-[0_2px_8px_rgba(196,83,59,0.22)] hover:bg-coral-hover hover:border-coral-hover hover:shadow-[0_6px_16px_rgba(196,83,59,0.25)]',
  forest:
    'bg-forest text-paper border border-forest shadow-[0_2px_8px_rgba(30,77,59,0.18)] hover:bg-forest-hover hover:border-forest-hover hover:shadow-[0_6px_16px_rgba(30,77,59,0.22)]',
  urgent:
    'bg-urgent text-paper border border-urgent shadow-[0_2px_8px_rgba(184,58,50,0.22)] hover:bg-urgent-hover hover:border-urgent-hover',
  outline:
    'bg-paper text-charcoal border border-hairline-strong shadow-[0_1px_2px_rgba(30,36,33,0.04)] hover:bg-sand/70 hover:border-stone/50',
  ghost:
    'bg-transparent text-slate border border-transparent hover:bg-sand/80 hover:text-charcoal',
}

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-4 py-2 text-sm gap-2',
  md: 'min-h-[46px] px-5 py-2.5 text-sm sm:text-base gap-2',
  lg: 'min-h-[52px] px-7 py-3.5 text-base gap-2.5',
}

const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-full font-semibold leading-none transition-all duration-200 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-coral disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'

function buildButtonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className: string,
): string {
  return [
    BASE_CLASSES,
    VARIANT_STYLES[variant],
    SIZE_STYLES[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Refined, accessible pill button aligned with the VITALORA health-tech design system.
 * Pass `href` to render an identically styled anchor link.
 */
export function Button(props: ButtonProps | ButtonLinkProps) {
  const prefersReduced = useReducedMotion()
  const {
    children,
    variant = 'coral',
    size = 'md',
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
  } = props

  const classes = buildButtonClasses(variant, size, fullWidth, className)
  const content = (
    <>
      {leftIcon ? <span className="inline-flex shrink-0">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="inline-flex shrink-0">{rightIcon}</span> : null}
    </>
  )

  const motionHover = prefersReduced ? undefined : { y: -1 }
  const motionTap = prefersReduced ? undefined : { scale: 0.99 }

  if (typeof props.href === 'string') {
    const {
      children: _c,
      variant: _v,
      size: _s,
      leftIcon: _l,
      rightIcon: _r,
      fullWidth: _f,
      className: _cl,
      ...anchorProps
    } = props

    return (
      <motion.a
        whileHover={motionHover}
        whileTap={motionTap}
        transition={{ duration: 0.16 }}
        className={classes}
        {...anchorProps}
      >
        {content}
      </motion.a>
    )
  }

  const {
    children: _c,
    variant: _v,
    size: _s,
    leftIcon: _l,
    rightIcon: _r,
    fullWidth: _f,
    className: _cl,
    type = 'button',
    ...buttonProps
  } = props

  return (
    <motion.button
      type={type}
      whileHover={buttonProps.disabled ? undefined : motionHover}
      whileTap={buttonProps.disabled ? undefined : motionTap}
      transition={{ duration: 0.16 }}
      className={classes}
      {...buttonProps}
    >
      {content}
    </motion.button>
  )
}
