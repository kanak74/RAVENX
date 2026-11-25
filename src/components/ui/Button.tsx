import type { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

export type ButtonVariant =
  | 'coral'
  | 'green'
  | 'butter'
  | 'tomato'
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
    'bg-coral text-ink border-2 border-[#E3593F] shadow-[0_4px_0_0_#E3593F] hover:bg-coral-hover active:translate-y-[2px] active:shadow-[0_2px_0_0_#E3593F]',
  green:
    'bg-green text-warm-white border-2 border-[#1F6644] shadow-[0_4px_0_0_#1F6644] hover:bg-green-hover active:translate-y-[2px] active:shadow-[0_2px_0_0_#1F6644]',
  butter:
    'bg-butter text-ink border-2 border-[#D4A22B] shadow-[0_4px_0_0_#D4A22B] hover:bg-butter-hover active:translate-y-[2px] active:shadow-[0_2px_0_0_#D4A22B]',
  tomato:
    'bg-tomato text-warm-white border-2 border-[#AC2C21] shadow-[0_4px_0_0_#AC2C21] hover:bg-tomato-hover active:translate-y-[2px] active:shadow-[0_2px_0_0_#AC2C21]',
  outline:
    'bg-warm-white text-ink border-2 border-border-warm shadow-[0_4px_0_0_#EADCCF] hover:bg-linen hover:border-[#D9C5B2] active:translate-y-[2px] active:shadow-[0_2px_0_0_#EADCCF]',
  ghost:
    'bg-transparent text-ink border-2 border-transparent hover:bg-linen/80 active:translate-y-[1px]',
}

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-4 py-2 text-sm gap-2',
  md: 'min-h-[48px] px-6 py-2.5 text-base gap-2.5',
  lg: 'min-h-[56px] px-7 py-3.5 text-lg gap-3',
}

const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-full font-extrabold leading-none transition-colors duration-150 cursor-pointer select-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-coral-deep disabled:opacity-55 disabled:cursor-not-allowed disabled:shadow-none'

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
 * Large, accessible, tactile pill button aligned with the VITALORA design system.
 * Pass `href` to render an identically styled anchor link.
 */
export function Button(props: ButtonProps | ButtonLinkProps) {
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
        whileHover={{ y: -1 }}
        transition={{ duration: 0.15 }}
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
      whileHover={buttonProps.disabled ? undefined : { y: -1 }}
      transition={{ duration: 0.15 }}
      className={classes}
      {...buttonProps}
    >
      {content}
    </motion.button>
  )
}
