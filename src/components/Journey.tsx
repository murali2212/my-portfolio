import { journey } from '../data/site'
import { Reveal, SectionLabel } from './Motion'

export default function Journey() {
  return (
    <section id="journey" className="border-t border-line">
      <div className="mx-auto max-w-[1600px] px-5 py-[clamp(96px,14vw,180px)] md:px-10 lg:px-14">
        <Reveal>
          <SectionLabel>04 — Experience</SectionLabel>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mt-8 text-[clamp(40px,7vw,104px)] leading-[0.98] font-light tracking-[-0.03em]">
            THE JOURNEY
          </h2>
        </Reveal>

        <ol className="relative mt-16 max-w-[720px] pl-7 md:mt-24 md:pl-10">
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-0 w-px bg-line md:left-1"
          />
          {journey.map((entry, i) => (
            <li key={entry.year} className="relative pb-14 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute top-[0.55em] -left-7 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-ink md:-left-10"
              />
              <Reveal delay={0.08 * i} y={20}>
                <div className="flex flex-col gap-2 border-b border-line pb-8 md:flex-row md:items-baseline md:gap-10">
                  <span className="text-[clamp(30px,4vw,52px)] leading-none font-light tracking-tight tabular-nums">
                    {entry.year}
                  </span>
                  <span className="text-sm tracking-[0.12em] text-muted uppercase md:text-base">
                    {entry.title}
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
