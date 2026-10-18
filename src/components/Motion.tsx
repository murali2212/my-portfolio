import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export const EASE = [0.16, 1, 0.3, 1] as const

const REVEAL_EASE = [0.33, 1, 0.68, 1] as const
const REVEAL_VIEWPORT = { once: true, margin: '0px 0px 160px 0px' } as const

type RevealProps = {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}

export function Reveal({ children, delay = 0, y = 16, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.85, ease: REVEAL_EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export function LineReveal({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`h-px origin-left bg-line ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 1, ease: REVEAL_EASE }}
    />
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-medium tracking-[0.3em] text-faint uppercase">
      {children}
    </span>
  )
}
