import { Link } from 'react-router-dom'
import { useProjects } from '../data/projectsRepo'
import { Reveal, SectionLabel } from './Motion'

export default function Projects() {
  const { projects } = useProjects()

  return (
    <section id="projects" className="border-t border-line">
      <div className="mx-auto max-w-[1600px] px-5 py-[clamp(96px,14vw,180px)] md:px-10 lg:px-14">
        <Reveal>
          <SectionLabel>02 — Work</SectionLabel>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mt-8 text-[clamp(44px,8vw,120px)] leading-[0.98] font-light tracking-[-0.03em]">
            PROJECTS
          </h2>
        </Reveal>

        <div className="mt-16 border-t border-line md:mt-24">
          {projects.slice(0, 4).map((project, i) => (
            <Reveal key={project.slug} delay={0.05 * i} y={20}>
              <article className="group relative border-b border-line">
                <Link
                  to={`/projects/${project.slug}`}
                  data-cursor="project"
                  className="block py-10 md:py-14"
                >
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-1">
                      <span className="text-[11px] tracking-[0.2em] text-faint tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="lg:col-span-8">
                      <h3 className="text-[clamp(30px,4.4vw,60px)] leading-[1.02] font-light tracking-[-0.02em] transition-transform duration-500 ease-out group-hover:translate-x-2">
                        {project.title.toUpperCase()}
                      </h3>
                      <p className="mt-5 max-w-[48ch] text-[14px] leading-relaxed text-muted md:text-[15px]">
                        {project.description}
                      </p>
                      <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
                        {project.tags.map((tag) => (
                          <li
                            key={tag}
                            className="text-[10px] tracking-[0.24em] text-faint uppercase"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-start justify-end lg:col-span-3">
                      <span className="inline-flex items-center gap-3 text-[11px] tracking-[0.22em] text-muted uppercase transition-colors duration-500 group-hover:text-ink">
                        View project
                        <span className="inline-block text-base transition-transform duration-500 ease-out group-hover:translate-x-2">
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>

                <span className="absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-out group-hover:scale-x-100" />
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.08} y={16}>
          <div className="mt-14 flex justify-start">
            <Link
              to="/projects"
              className="group inline-flex items-center gap-4 border border-ink px-8 py-4 text-[11px] tracking-[0.24em] text-ink uppercase transition-colors duration-500 hover:bg-ink hover:text-paper"
            >
              View all projects
              <span className="inline-block text-base transition-transform duration-500 ease-out group-hover:translate-x-2">
                →
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
