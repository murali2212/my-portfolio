import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONTACT } from '../config/contact'
import ContactComposeModal from './ContactComposeModal/ContactComposeModal'
import { EASE, Reveal, SectionLabel } from './Motion'

const lines = ['LET’S', 'BUILD', 'SOMETHING.']

const socials = [
  { label: 'Email', value: CONTACT.email },
  { label: 'LinkedIn', value: CONTACT.linkedin.label, href: CONTACT.linkedin.href },
  { label: 'GitHub', value: CONTACT.github.label, href: CONTACT.github.href },
  { label: 'Instagram', value: CONTACT.instagram.label, href: CONTACT.instagram.href },
]

function ContactRowContent({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-[11px] tracking-[0.26em] text-faint uppercase">
        {label}
      </span>
      <span className="flex items-baseline gap-3 text-base font-light tracking-tight md:text-lg">
        <span className="border-b border-transparent pb-0.5 transition-colors duration-500 group-hover:border-ink">
          {value}
        </span>
        <span className="text-sm transition-transform duration-500 ease-out group-hover:translate-x-1 group-hover:-translate-y-1">
          ↗
        </span>
      </span>
    </>
  )
}

export default function Contact() {
  const [composeOpen, setComposeOpen] = useState(false)

  return (
    <section id="contact" className="border-t border-line">
      <div className="mx-auto max-w-[1600px] px-5 py-[clamp(96px,16vw,220px)] md:px-10 lg:px-14">
        <Reveal>
          <SectionLabel>05 — Contact</SectionLabel>
        </Reveal>

        <h2 className="mt-10">
          {lines.map((line, i) => (
            <motion.span
              key={line}
              className="block overflow-hidden pb-[0.06em]"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '0px 0px 160px 0px' }}
              variants={{ hidden: {}, show: {} }}
            >
              <motion.span
                variants={{
                  hidden: { y: '110%' },
                  show: {
                    y: '0%',
                    transition: { duration: 1, ease: EASE, delay: 0.1 * i },
                  },
                }}
                className="block text-[clamp(56px,11vw,156px)] leading-[0.96] font-light tracking-[-0.03em]"
              >
                {line}
              </motion.span>
            </motion.span>
          ))}
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="max-w-[42ch] text-[15px] leading-relaxed text-muted md:text-base">
                Have a project in mind, an idea to explore, or just want to
                talk about AI and building things? My inbox is open.
              </p>
            </Reveal>

            <ul className="mt-10 border-t border-line">
              {socials.map((item, i) => (
                <li key={item.label}>
                  <Reveal delay={0.05 * i} y={14}>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-baseline justify-between gap-6 border-b border-line py-5"
                      >
                        <ContactRowContent label={item.label} value={item.value} />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setComposeOpen(true)}
                        className="group flex w-full items-baseline justify-between gap-6 border-b border-line py-5 text-left"
                        style={{
                          appearance: 'none',
                          background: 'transparent',
                          borderTop: 0,
                          borderRight: 0,
                          borderLeft: 0,
                          borderBottom: '1px solid var(--color-line)',
                          color: 'inherit',
                          font: 'inherit',
                          textAlign: 'left',
                        }}
                      >
                        <ContactRowContent label={item.label} value={item.value} />
                      </button>
                    )}
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-end lg:col-span-4 lg:col-start-9 lg:justify-end">
            <Reveal delay={0.15}>
              <Link
                to="/chat"
                className="group inline-flex items-center gap-3 text-[clamp(18px,2.4vw,30px)] font-light tracking-[-0.01em]"
              >
                <span className="relative pb-2">
                  START A CONVERSATION
                  <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-out group-hover:scale-x-100" />
                </span>
                <span className="transition-transform duration-500 ease-out group-hover:translate-x-1.5 group-hover:-translate-y-1.5">
                  ↗
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
      <ContactComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        to={CONTACT.email}
        accessKey={import.meta.env.VITE_WEB3FORMS_KEY}
      />
    </section>
  )
}
