import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { isLinkable } from '../data/projects'
import { useProject } from '../data/projectsRepo'
import { useBackTarget } from '../lib/useBackTarget'
import { Reveal, SectionLabel } from '../components/Motion'
import ProjectImage from '../components/ProjectImage'
import HomeButton from '../components/HomeButton/HomeButton'

function Block({
  label,
  delay = 0,
  show = true,
  children,
}: {
  label: string
  delay?: number
  show?: boolean
  children: ReactNode
}) {
  if (!show || !children) return null

  return (
    <Reveal delay={delay} className="mt-12">
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-5">{children}</div>
    </Reveal>
  )
}

function TextList({ items }: { items: string[] }) {
  return (
    <ul className="border-t border-line">
      {items.map((item) => (
        <li
          key={item}
          className="border-b border-line py-3.5 text-[14px] leading-relaxed text-muted md:text-[15px]"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

function LinkOrNote({ label, value }: { label: string; value?: string }) {
  if (!value) return null

  if (isLinkable(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-center gap-3 text-[11px] tracking-[0.24em] text-ink uppercase"
      >
        {label}
        <span className="inline-block transition-transform duration-500 ease-out group-hover:translate-x-1 group-hover:-translate-y-1">
          ↗
        </span>
      </a>
    )
  }

  return (
    <span className="block text-[11px] tracking-[0.24em] text-faint uppercase">
      {label} · {value}
    </span>
  )
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const back = useBackTarget()
  const { project, index, loading } = useProject(slug)

  if (loading) return <section className="min-h-[60vh]" />

  if (!project) {
    return (
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1600px] px-5 pt-[clamp(120px,16vw,200px)] pb-[clamp(96px,14vw,180px)] md:px-10 lg:px-14">
          <SectionLabel>404</SectionLabel>
          <h1 className="mt-8 text-[clamp(44px,8vw,120px)] leading-[0.98] font-light tracking-[-0.03em]">
            NOT FOUND
          </h1>
          <p className="mt-8 max-w-[46ch] text-[15px] leading-relaxed text-muted">
            This project does not exist or has been moved.
          </p>
          <Link
            to="/projects"
            className="group mt-12 inline-flex items-center gap-3 text-[11px] tracking-[0.24em] text-ink uppercase"
          >
            <span className="inline-block transition-transform duration-500 ease-out group-hover:-translate-x-2">
              ←
            </span>
            Back to projects
          </Link>
        </div>
      </section>
    )
  }

  const number = index >= 0 ? String(index + 1).padStart(2, '0') : ''

  return (
    <article className="border-t border-line">
      <div className="mx-auto max-w-[1600px] px-5 pt-[clamp(110px,14vw,180px)] pb-[clamp(96px,14vw,180px)] md:px-10 lg:px-14">
        <Reveal>
          <Link
            to={back.to}
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
            className="group inline-flex items-center gap-3 text-[11px] tracking-[0.24em] text-muted uppercase transition-colors hover:text-ink"
          >
            <span className="inline-block transition-transform duration-500 ease-out group-hover:-translate-x-2">
              ←
            </span>
            {back.label}
          </Link>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-14 flex items-start justify-between gap-8 border-b border-line pb-5">
            <span className="text-[11px] tracking-[0.2em] text-faint tabular-nums">
              {number}
            </span>
            <span className="max-w-[60%] text-right text-[10px] tracking-[0.24em] text-muted uppercase">
              {project.status}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="mt-8 text-[clamp(40px,7vw,104px)] leading-[0.98] font-light tracking-[-0.03em]">
            {project.title.toUpperCase()}
          </h1>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-12 overflow-hidden border border-line bg-pure">
            <ProjectImage
              src={project.image}
              alt={project.title}
              className="aspect-[16/9] w-full"
            />
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <Block label="Stack" delay={0.05} show={!!project.stack?.length}>
              <ul className="border-t border-line">
                {project.stack?.map((item) => (
                  <li
                    key={item}
                    className="border-b border-line py-3 text-[10px] tracking-[0.24em] text-muted uppercase"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Block>

            <Block
              label="Links"
              delay={0.08}
              show={!!(project.links?.github || project.links?.live || project.folder)}
            >
              <div className="flex flex-col items-start gap-4 border-t border-line pt-5">
                <LinkOrNote label="GitHub" value={project.links?.github} />
                <LinkOrNote label="Live demo" value={project.links?.live} />
                {project.folder && (
                  <span className="block text-[11px] tracking-[0.16em] text-faint">
                    {project.links?.github ? 'repo path' : 'folder'}:{' '}
                    {project.folder}
                  </span>
                )}
              </div>
            </Block>

            <Block label="My role" delay={0.1} show={!!project.my_role}>
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-muted">
                {project.my_role}
              </p>
            </Block>

            <Block
              label="Security"
              delay={0.12}
              show={!!project.security?.length}
            >
              <TextList items={project.security ?? []} />
            </Block>

            <Block label="Credit" delay={0.14} show={!!project.credit}>
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-muted">
                {project.credit}
              </p>
            </Block>

            <Block label="Privacy" delay={0.16} show={!!project.privacy}>
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-muted">
                {project.privacy}
              </p>
            </Block>
          </div>

          <div className="lg:col-span-8 lg:col-start-5">
            <Block label="Overview" delay={0.06} show={!!project.overview}>
              <p className="whitespace-pre-line max-w-[60ch] text-[clamp(18px,2vw,24px)] leading-[1.5] font-light text-ink">
                {project.overview}
              </p>
            </Block>

            <Block label="Problem" delay={0.08} show={!!project.problem}>
              <p className="whitespace-pre-line max-w-[64ch] text-[15px] leading-relaxed text-muted md:text-base">
                {project.problem}
              </p>
            </Block>

            <Block
              label="Features"
              delay={0.1}
              show={!!project.features?.length}
            >
              <TextList items={project.features ?? []} />
            </Block>

            <Block label="Areas" delay={0.1} show={!!project.areas?.length}>
              <TextList items={project.areas ?? []} />
            </Block>

            <Block
              label="How it works"
              delay={0.12}
              show={!!project.how_it_works?.length}
            >
              <TextList items={project.how_it_works ?? []} />
            </Block>

            <Block
              label="Architecture"
              delay={0.12}
              show={!!project.architecture}
            >
              <p className="whitespace-pre-line max-w-[64ch] border-t border-line pt-5 text-[15px] leading-relaxed text-muted md:text-base">
                {project.architecture}
              </p>
            </Block>

            <Block
              label="Core workflow"
              delay={0.12}
              show={!!project.core_workflow}
            >
              <p className="whitespace-pre-line max-w-[64ch] border-t border-line pt-5 text-[15px] leading-relaxed text-muted md:text-base">
                {project.core_workflow}
              </p>
            </Block>

            <Block
              label="Highlights"
              delay={0.14}
              show={!!project.highlights?.length}
            >
              <ul className="flex flex-wrap gap-3">
                {project.highlights?.map((item) => (
                  <li
                    key={item}
                    className="border border-line px-4 py-2.5 text-[10px] tracking-[0.2em] text-muted uppercase"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Block>
          </div>
        </div>

        <Reveal delay={0.08}>
          <div className="mt-20 border-t border-line pt-10">
            <Link
              to={back.to}
              className="group inline-flex items-center gap-3 text-[11px] tracking-[0.24em] text-ink uppercase"
            >
              <span className="inline-block transition-transform duration-500 ease-out group-hover:-translate-x-2">
                ←
              </span>
              {back.label}
            </Link>
          </div>
        </Reveal>
        <HomeButton />
      </div>
    </article>
  )
}
