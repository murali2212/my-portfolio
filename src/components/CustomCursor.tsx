import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'

type Variant = 'default' | 'link' | 'project'

const BASE =
  'pointer-events-none fixed top-0 left-0 z-[2147483647] hidden rounded-full transition-[width,height,background-color,border-color] duration-300 ease-out lg:block'

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'h-2 w-2 bg-ink border-transparent',
  link: 'h-4 w-4 bg-ink border-transparent',
  project: 'h-10 w-10 border border-ink/40 bg-transparent',
}

export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (pathname.startsWith('/admin') || !finePointer.matches) {
      document.body.classList.remove('cursor-custom')
      return
    }

    const el = ref.current
    if (!el) return

    document.body.classList.add('cursor-custom')
    let variant: Variant = 'default'

    const setVariant = (next: Variant) => {
      if (next === variant) return
      variant = next
      el.className = `${BASE} ${VARIANT_CLASS[next]}`
    }

    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      if (el.style.opacity !== '1') el.style.opacity = '1'
      const target = e.target as HTMLElement | null
      if (!target) return
      if (target.closest('[data-cursor="project"]')) {
        setVariant('project')
      } else if (target.closest('a, button')) {
        setVariant('link')
      } else {
        setVariant('default')
      }
    }

    const onLeave = () => {
      el.style.opacity = '0'
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.body.classList.remove('cursor-custom')
    }
  }, [pathname])

  return createPortal(
    <div
      ref={ref}
      aria-hidden="true"
      className={`${BASE} ${VARIANT_CLASS.default}`}
      style={{ opacity: 0 }}
    />,
    document.body,
  )
}
