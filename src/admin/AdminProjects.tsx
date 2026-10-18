import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { resetProjectsCache, type ProjectRow } from '../data/projectsRepo'
import { projects as starter } from '../data/projects'
import ProjectForm from './ProjectForm'
import CoverLibrary from './CoverLibrary'
import { ViewProjectLink, ViewSiteButton } from './ViewLinks'
import { btn, btnGhost, label, wrap } from './ui'

type Tab = 'active' | 'trash'
type Job = PromiseLike<{ error: { message: string } | null }>

export default function AdminProjects() {
  const location = useLocation()
  const navigate = useNavigate()
  const [rows, setRows] = useState<ProjectRow[]>([])
  const [tab, setTab] = useState<Tab>('active')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const addRoute = location.pathname.replace(/\/+$/, '') === '/admin/add'
  const editId = /^\/admin\/edit\/([^/]+)\/?$/.exec(location.pathname)?.[1]
  const editing: ProjectRow | 'new' | null = addRoute
    ? 'new'
    : editId
      ? rows.find((row) => row.id === editId) ?? null
      : null
  const formRoute = addRoute || editId !== undefined

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order')
    if (error) setMsg(error.message)
    else setRows(data as ProjectRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const active = rows.filter((r) => !r.deleted_at)
  const trash = rows.filter((r) => r.deleted_at)
  const nextOrder = rows.reduce((m, r) => Math.max(m, r.sort_order), 0) + 1

  async function run(job: Job) {
    const { error } = await job
    if (error) {
      setMsg(error.message)
      return
    }
    setMsg('')
    resetProjectsCache()
    await reload()
  }

  const table = () => supabase.from('projects')

  const togglePublish = (r: ProjectRow) =>
    run(table().update({ published: !r.published }).eq('id', r.id))

  const moveToTrash = (r: ProjectRow) =>
    run(table().update({ deleted_at: new Date().toISOString() }).eq('id', r.id))

  const restore = (r: ProjectRow) =>
    run(table().update({ deleted_at: null }).eq('id', r.id))

  function deleteForever(r: ProjectRow) {
    if (!window.confirm(`Delete "${r.title}" forever? This cannot be undone.`))
      return
    void run(table().delete().eq('id', r.id))
  }

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir
    if (j < 0 || j >= active.length) return
    const next = [...active]
    ;[next[index], next[j]] = [next[j], next[index]]
    const changed = next
      .map((r, i) => ({ r, order: i + 1 }))
      .filter(({ r, order }) => r.sort_order !== order)
    await Promise.all(
      changed.map(({ r, order }) =>
        table().update({ sort_order: order }).eq('id', r.id),
      ),
    )
    resetProjectsCache()
    await reload()
  }

  // One-time: copy the built-in projects (src/data/projects.ts) into the database.
  function importStarter() {
    const payload = starter.map((p, i) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      tags: p.tags,
      status: p.status,
      overview: p.overview ?? null,
      problem: p.problem ?? null,
      features: p.features ?? [],
      how_it_works: p.how_it_works ?? [],
      stack: p.stack ?? [],
      highlights: p.highlights ?? [],
      security: p.security ?? [],
      github_url: p.links?.github ?? null,
      live_url: p.links?.live ?? null,
      folder: p.folder ?? null,
      my_role: p.my_role ?? null,
      credit: p.credit ?? null,
      sort_order: i + 1,
      published: true,
    }))
    void run(table().insert(payload))
  }

  // Backup: version history is not a backup, so download everything.
  function exportJson() {
    const blob = new Blob([JSON.stringify(rows, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `projects-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function leaveForm() {
    navigate('/admin')
  }

  if (formRoute && loading) return null

  if (editId && !editing) {
    return (
      <section className="border-t border-line">
        <div className={wrap}>
          <button
            type="button"
            className={`${label} inline-flex items-center gap-2 transition-colors hover:text-ink`}
            onClick={leaveForm}
          >
            <span aria-hidden="true">←</span> Back to admin
          </button>
          <p className="mt-8 text-[14px] text-muted">
            {msg || 'Project not found.'}
          </p>
        </div>
      </section>
    )
  }

  if (editing) {
    return (
      <section className="border-t border-line">
        <div className={wrap}>
          <ProjectForm
            initial={editing === 'new' ? null : editing}
            nextOrder={nextOrder}
            onDone={leaveForm}
            onSaved={() => void reload()}
          />
        </div>
      </section>
    )
  }

  const shown = tab === 'active' ? active : trash

  return (
    <section className="border-t border-line">
      {libraryOpen && <CoverLibrary onClose={() => setLibraryOpen(false)} />}
      <div className={wrap}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className="text-[clamp(32px,5vw,64px)] leading-[1] font-light tracking-[-0.02em]">
            ADMIN
          </h1>
          <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:flex-wrap">
            <button className={`${btn} w-full sm:w-auto`} onClick={() => navigate('/admin/add')}>
              Add project
            </button>
            <button className={`${btnGhost} w-full sm:w-auto`} onClick={exportJson}>
              Export backup
            </button>
            <ViewSiteButton />
            <button className={btnGhost} onClick={() => setLibraryOpen(true)}>
              Cover library
            </button>
            <button
              className={`${btnGhost} w-full sm:w-auto`}
              onClick={() => void supabase.auth.signOut()}
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-12 flex gap-6 border-b border-line pb-4">
          <button
            onClick={() => setTab('active')}
            className={`${label} ${tab === 'active' ? '!text-ink' : ''}`}
          >
            Projects ({active.length})
          </button>
          <button
            onClick={() => setTab('trash')}
            className={`${label} ${tab === 'trash' ? '!text-ink' : ''}`}
          >
            Trash ({trash.length})
          </button>
        </div>

        {msg && <p className="mt-6 text-[13px] text-ink">{msg}</p>}

        {loading ? null : shown.length === 0 ? (
          <div className="mt-10">
            <p className="text-[14px] text-muted">
              {tab === 'trash' ? 'Trash is empty.' : 'No projects yet.'}
            </p>
            {tab === 'active' && rows.length === 0 && (
              <button className={`${btnGhost} mt-6`} onClick={importStarter}>
                Import my {starter.length} starter projects
              </button>
            )}
          </div>
        ) : (
          <ul>
            {shown.map((r, i) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-5"
              >
                <div>
                  <p className="text-[18px] font-light">{r.title}</p>
                  <p className={`${label} mt-2`}>
                    /{r.slug} · {r.published ? 'Published' : 'Draft'}
                    {r.status ? ` · ${r.status}` : ''}
                  </p>
                </div>

                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:gap-3">
                  {tab === 'active' ? (
                    <>
                      <button
                        className={btnGhost}
                        disabled={i === 0}
                        onClick={() => void move(i, -1)}
                      >
                        Up
                      </button>
                      <button
                        className={btnGhost}
                        disabled={i === active.length - 1}
                        onClick={() => void move(i, 1)}
                      >
                        Down
                      </button>
                      <button
                        className={btnGhost}
                        onClick={() => void togglePublish(r)}
                      >
                        {r.published ? 'Unpublish' : 'Publish'}
                      </button>
                      {r.published && <ViewProjectLink slug={r.slug} />}
                      <button className={btnGhost} onClick={() => navigate(`/admin/edit/${r.id}`)}>
                        Edit
                      </button>
                      <button
                        className={btnGhost}
                        onClick={() => void moveToTrash(r)}
                      >
                        Move to trash
                      </button>
                    </>
                  ) : (
                    <>
                      <button className={btnGhost} onClick={() => void restore(r)}>
                        Restore
                      </button>
                      <button
                        className={btnGhost}
                        onClick={() => deleteForever(r)}
                      >
                        Delete forever
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
