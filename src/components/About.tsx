import { aboutInterests } from '../data/site'
import { LineReveal, Reveal } from './Motion'

export default function About() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-12 px-5 py-[clamp(96px,14vw,180px)] md:px-10 lg:grid-cols-12 lg:gap-8 lg:px-14">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <h2 className="text-[clamp(30px,3.4vw,52px)] leading-none font-light tracking-[-0.02em]">
                ABOUT ME
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <Reveal>
            <p className="max-w-[54ch] text-[17px] leading-relaxed text-ink md:text-xl">
              I&apos;m an AI-focused developer and builder working at the
              intersection of artificial intelligence, software and automation.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-6 max-w-[54ch] text-[15px] leading-relaxed text-muted md:text-base">
              I enjoy taking an idea from concept → architecture → prototype →
              working product.
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-14 text-[11px] tracking-[0.26em] text-faint uppercase">
              My interests include
            </p>
          </Reveal>

          <ul className="mt-6">
            {aboutInterests.map((item, i) => (
              <li key={item}>
                <Reveal delay={0.05 * i} y={16}>
                  <div className="group flex items-baseline gap-6 border-b border-line py-5 transition-transform duration-500 ease-out group-hover:translate-x-1.5">
                    <span className="text-[11px] tracking-[0.2em] text-faint tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-lg font-light tracking-tight md:text-2xl">
                      {item}
                    </span>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <LineReveal className="mt-0" />
        </div>
      </div>
    </section>
  )
}
