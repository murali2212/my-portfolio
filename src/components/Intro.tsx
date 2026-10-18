import { Reveal, SectionLabel } from './Motion'

export default function Intro() {
  return (
    <section
      id="about"
      className="mx-auto max-w-[1600px] px-5 py-[clamp(96px,15vw,200px)] md:px-10 lg:px-14"
    >
      <Reveal>
        <SectionLabel>01 — About</SectionLabel>
      </Reveal>

      <Reveal delay={0.1}>
        <h2 className="mt-8 max-w-[16ch] text-[clamp(34px,5.2vw,76px)] leading-[1.06] font-light tracking-[-0.02em]">
          I build technology that makes complex things feel simple.
        </h2>
      </Reveal>

      <Reveal delay={0.2}>
        <p className="mt-10 max-w-[54ch] text-[15px] leading-relaxed text-muted md:text-[17px]">
          I&apos;m an AI-focused developer interested in intelligent systems,
          agentic AI, automation, developer tools and experimental
          human-computer experiences.
        </p>
      </Reveal>
    </section>
  )
}
