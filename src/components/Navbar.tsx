import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { navLinks, site } from '../data/site'
import { EASE } from './Motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  const toSection = (hash: string) => {
    if (hash === '#projects' && pathname.startsWith('/projects')) {
      return '/projects'
    }
    return isHome ? hash : ({ pathname: '/', hash } as const)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open
          ? 'border-b border-line bg-paper/80 backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between px-5 md:px-10 lg:px-14">
        <Link
          to="/"
          aria-label={`${site.name} — home`}
          className="flex items-center gap-3"
        >
          <span className="flex h-9 w-9 items-center justify-center border border-ink text-[12px] font-medium tracking-[0.14em]">
            {site.monogram}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={toSection(link.href)}
                  className="group relative text-[13px] tracking-[0.06em] text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          to="/chat"
          className="group hidden text-[13px] tracking-[0.06em] text-ink lg:inline-flex"
        >
          <span className="border-b border-ink pb-0.5">Let&apos;s Talk</span>
          <span className="ml-1.5 inline-block transition-transform duration-500 ease-out group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </span>
        </Link>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={`h-px w-5 bg-ink transition-transform duration-300 ${
              open ? 'translate-y-[3px] rotate-45' : ''
            }`}
          />
          <span
            className={`h-px w-5 bg-ink transition-transform duration-300 ${
              open ? '-translate-y-[3px] -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="border-t border-line bg-paper lg:hidden"
          >
            <nav aria-label="Mobile" className="px-5 pt-6 pb-10">
              <ul className="flex flex-col">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      ease: EASE,
                      delay: 0.08 * i,
                    }}
                    className="border-b border-line"
                  >
                    <Link
                      to={toSection(link.href)}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between py-4 text-2xl font-light tracking-tight"
                    >
                      {link.label}
                      <span className="text-[11px] tracking-[0.2em] text-faint">
                        0{i + 1}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <Link
                to="/chat"
                onClick={() => setOpen(false)}
                className="mt-6 inline-flex text-sm tracking-[0.08em]"
              >
                <span className="border-b border-ink pb-0.5">Let&apos;s Talk</span>
                <span className="ml-1.5">↗</span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
