import { numbers } from '../data/site'
import { Reveal } from './Motion'

export default function Numbers() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-5 py-[clamp(80px,10vw,140px)] md:grid-cols-3 md:gap-8 md:px-10 lg:px-14">
        {numbers.map((item, i) => (
          <Reveal key={item.label} delay={0.08 * i}>
            <div className="border-t border-line pt-6">
              <div className="text-[clamp(64px,9vw,140px)] leading-none font-extralight tracking-[-0.04em]">
                {item.value}
              </div>
              <div className="mt-4 text-[11px] tracking-[0.3em] text-muted uppercase">
                {item.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
