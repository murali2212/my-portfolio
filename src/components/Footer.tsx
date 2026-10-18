import { site } from '../data/site'

export default function Footer() {
  const toTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-4 px-5 py-8 text-[11px] tracking-[0.16em] text-muted uppercase md:flex-row md:items-center md:px-10 lg:px-14">
        <p>© {site.location} {site.name}</p>
        <p className="hidden text-faint md:block">
          AI • Software • Experimentation
        </p>
        <button
          type="button"
          onClick={toTop}
          className="group inline-flex items-center gap-2 transition-colors hover:text-ink"
        >
          Back to top
          <span className="inline-block transition-transform duration-500 ease-out group-hover:-translate-y-1">
            ↑
          </span>
        </button>
      </div>
    </footer>
  )
}
