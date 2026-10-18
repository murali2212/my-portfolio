import { Link, useNavigate } from 'react-router-dom'
import { useProjects } from '../data/projectsRepo'
// @ts-expect-error The JSX module is bundled by Vite and has no TypeScript declaration.
import InfiniteProjectCardBelt from '../components/InfiniteProjectCardBelt/InfiniteProjectCardBelt.jsx'
import { Reveal, SectionLabel } from '../components/Motion'

const visibleText = (value?: string | null) => {
  if (!value) return ''
  const trimmed = value.trim()
  return trimmed.startsWith('[') || trimmed.endsWith(']') || trimmed.includes('[YOU')
    ? ''
    : trimmed
}

export default function ProjectsPage() {
  const { projects } = useProjects()
  const navigate = useNavigate()
  const beltProjects = projects.map((project, index) => ({
    title: visibleText(project.title),
    slug: project.slug,
    image: project.image,
    description: visibleText(project.description),
    index: String(index + 1).padStart(2, '0'),
    status: visibleText(project.status),
    tags: project.tags.map(visibleText).filter(Boolean),
  }))

  return (
    <section id="projects" className="border-t border-line overflow-x-clip">
      <div className="mx-auto max-w-[1600px] px-5 pt-[clamp(120px,16vw,200px)] pb-[clamp(96px,14vw,180px)] md:px-10 lg:px-14">
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
          className="group inline-flex items-center gap-2 text-[10px] tracking-[0.24em] text-muted uppercase transition-colors hover:text-ink"
        >
          <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">
            ←
          </span>
          Home
        </Link>

        <Reveal>
          <SectionLabel>All Projects</SectionLabel>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="mt-8 text-[clamp(44px,8vw,120px)] leading-[0.98] font-light tracking-[-0.03em]">
            PROJECTS
          </h1>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mt-8 max-w-[52ch] text-[14px] leading-relaxed text-muted md:text-[15px]">
            Selected work across AI systems, automation and experimental
            tooling.
          </p>
        </Reveal>

        <Reveal delay={0.18} y={24}>
          <div className="mt-12 md:mt-16">
            <InfiniteProjectCardBelt
              projects={beltProjects}
              dwell={0}
              onProjectClick={(project: { slug: string }) =>
                navigate(`/projects/${project.slug}`)
              }
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
