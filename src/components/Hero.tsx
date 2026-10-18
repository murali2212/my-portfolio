import { motion } from 'framer-motion'
import { site } from '../data/site'
import { EASE } from './Motion'

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: EASE, delay },
})

const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-paper">
      <div className="relative flex min-h-[100svh] w-full flex-col px-5 md:px-10 lg:flex-row lg:px-0">
        <div className="relative z-10 flex w-full flex-col justify-center gap-8 pt-28 pb-12 lg:w-1/2 lg:gap-12 lg:pt-32 lg:pr-10 lg:pb-20 lg:pl-[max(56px,calc((100vw_-_1600px)/2_+_56px))]">
          <motion.div
            {...rise(0.35)}
            className="flex items-center gap-4 text-[10px] tracking-[0.28em] text-faint uppercase"
          >
            <span>Portfolio</span>
            <span className="h-px flex-1 bg-line" />
            <span>{site.location}</span>
          </motion.div>

          <div>
            <div className="overflow-hidden pb-[0.06em]">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.55 }}
                className="text-[clamp(64px,13vw,184px)] leading-[0.92] font-light tracking-[-0.04em]"
              >
                HELLO
              </motion.h1>
            </div>

            <motion.p
              {...rise(0.85)}
              className="mt-7 text-xl font-light tracking-[0.01em] text-ink md:text-3xl"
            >
              I&apos;m B. Murali Dharan
            </motion.p>

            <motion.p
              {...rise(0.95)}
              className="mt-3 text-[11px] tracking-[0.3em] text-muted uppercase md:text-xs"
            >
              {site.role}
            </motion.p>
          </div>

          <motion.div {...rise(1.05)} className="h-px w-full bg-line" />

          <motion.p
            {...rise(1.1)}
            className="max-w-[46ch] text-[15px] leading-relaxed text-muted md:text-base"
          >
            I build intelligent systems, AI-powered products, automation
            workflows and experimental digital experiences.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
          className="relative flex w-full justify-center pb-14 lg:w-1/2 lg:pb-0"
        >
          <figure className="relative aspect-[873/1029] w-full max-w-[520px] lg:absolute lg:inset-0 lg:aspect-auto lg:max-w-none">
            <img
              src="/profile.png"
              alt={`Portrait of ${site.name}`}
              width={873}
              height={1029}
              className="absolute inset-0 block h-full w-full object-cover object-[50%_15%] grayscale contrast-[1.06] brightness-[1.02]"
              {...({ fetchpriority: 'high' } as Record<string, string>)}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
              style={{ backgroundImage: grain }}
            />
          </figure>
        </motion.div>
      </div>
    </section>
  )
}
