import { skillGroups } from '../data/site'
import { Reveal, SectionLabel } from './Motion'

export default function Skills() {
  return (
    <section id="skills" className="border-t border-line">
      <div className="mx-auto max-w-[1600px] px-5 py-[clamp(96px,14vw,180px)] md:px-10 lg:px-14">
        <Reveal>
          <SectionLabel>03 — Skills</SectionLabel>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mt-8 max-w-[12ch] text-[clamp(40px,7vw,104px)] leading-[0.98] font-light tracking-[-0.03em]">
            WHAT I WORK WITH
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:mt-24 lg:gap-14">
          {skillGroups.map((group, gi) => (
            <div key={group.label}>
              <Reveal delay={0.06 * gi}>
                <p className="border-t border-ink pt-4 text-[11px] tracking-[0.3em] text-ink uppercase">
                  {group.label}
                </p>
              </Reveal>
              <ul className="mt-2">
                {group.items.map((item, ii) => (
                  <li key={item}>
                    <Reveal delay={0.04 * ii + 0.06 * gi} y={14}>
                      <span className="block border-b border-line py-4 text-[clamp(18px,1.8vw,26px)] font-light tracking-tight text-ink">
                        {item}
                      </span>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
