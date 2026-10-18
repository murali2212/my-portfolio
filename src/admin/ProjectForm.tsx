import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { resetProjectsCache, type ProjectRow } from '../data/projectsRepo'
import { coverFor } from '../data/coverArt'
import CoverPicker from './CoverPicker'
import { btn, btnGhost, input, label } from './ui'

interface FormState {
  title: string
  slug: string
  description: string
  tags: string
  status: string
  github_url: string
  live_url: string
  folder: string
  overview: string
  problem: string
  my_role: string
  credit: string
  features: string
  how_it_works: string
  stack: string
  highlights: string
  security: string
  published: boolean
}

const join = (a?: string[]) => (a ?? []).join('\n')
const lines = (s: string) =>
  s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
const csv = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
const orNull = (s: string) => (s.trim() ? s.trim() : null)
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function toState(r: ProjectRow | null): FormState {
  return {
    title: r?.title ?? '',
    slug: r?.slug ?? '',
    description: r?.description ?? '',
    tags: (r?.tags ?? []).join(', '),
    status: r?.status ?? '',
    github_url: r?.github_url ?? '',
    live_url: r?.live_url ?? '',
    folder: r?.folder ?? '',
    overview: r?.overview ?? '',
    problem: r?.problem ?? '',
    my_role: r?.my_role ?? '',
    credit: r?.credit ?? '',
    features: join(r?.features),
    how_it_works: join(r?.how_it_works),
    stack: join(r?.stack),
    highlights: join(r?.highlights),
    security: join(r?.security),
    published: r?.published ?? false,
  }
}

function Field({
  name,
  hint,
  children,
}: {
  name: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className={label}>
        {name}
        {hint ? ` (${hint})` : ''}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

export default function ProjectForm({
  initial,
  nextOrder,
  onDone,
  onSaved,
}: {
  initial: ProjectRow | null
  nextOrder: number
  onDone: () => void
  onSaved: () => void
}) {
  const [f, setF] = useState<FormState>(() => toState(initial))
  const [savedId, setSavedId] = useState<string | null>(initial?.id ?? null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [coverPath, setCoverPath] = useState<string | null>(initial?.image_path ?? null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setSaved(false)
    setF((prev) => ({ ...prev, [key]: value }))
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!f.title.trim() || !f.slug.trim()) {
      setError('Title and slug are required.')
      return
    }

    setBusy(true)
    try {
      const image_path = coverPath

      const row = {
        slug: f.slug.trim(),
        title: f.title.trim(),
        description: f.description.trim(),
        tags: csv(f.tags),
        status: f.status.trim(),
        github_url: orNull(f.github_url),
        live_url: orNull(f.live_url),
        folder: orNull(f.folder),
        overview: orNull(f.overview),
        problem: orNull(f.problem),
        my_role: orNull(f.my_role),
        credit: orNull(f.credit),
        features: lines(f.features),
        how_it_works: lines(f.how_it_works),
        stack: lines(f.stack),
        highlights: lines(f.highlights),
        security: lines(f.security),
        published: f.published,
        image_path,
      }

      if (savedId) {
        const res = await supabase.from('projects').update(row).eq('id', savedId)
        if (res.error) throw res.error
      } else {
        const res = await supabase
          .from('projects')
          .insert({ ...row, sort_order: nextOrder })
          .select('id')
          .single()
        if (res.error) throw res.error
        setSavedId(res.data.id)
      }

      resetProjectsCache()
      onSaved()
      setSaved(true)
      setBusy(false)
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Save failed.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="w-full max-w-[820px] space-y-6 md:space-y-8">
      <Link
        to="/admin"
        className="group inline-flex items-center gap-2 text-[10px] tracking-[0.24em] text-muted uppercase transition-colors hover:text-ink"
      >
        <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">
          ←
        </span>
        Back to admin
      </Link>

      <h2 className="text-[clamp(28px,3.4vw,44px)] leading-[1.02] font-light tracking-[-0.02em]">
        {initial ? 'Edit project' : 'New project'}
      </h2>

      <Field name="Title">
        <input
          className={input}
          value={f.title}
          onChange={(e) => {
            set('title', e.target.value)
            if (!initial && !slugTouched) set('slug', slugify(e.target.value))
          }}
        />
      </Field>

      <Field name="Slug" hint="the page address, /projects/slug">
        <input
          className={input}
          value={f.slug}
          onChange={(e) => {
            setSlugTouched(true)
            set('slug', slugify(e.target.value))
          }}
        />
        {initial && f.slug !== initial.slug && (
          <p className="mt-2 text-[13px] text-muted">
            Changing the slug breaks old links to this project.
          </p>
        )}
      </Field>

      <Field name="Short description" hint={`${f.description.length}/80`}>
        <input
          className={input}
          maxLength={80}
          value={f.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <Field name="Tags" hint="comma separated, 3 works best">
          <input
            className={input}
            value={f.tags}
            onChange={(e) => set('tags', e.target.value)}
          />
        </Field>

        <Field name="Status">
          <input
            className={input}
            list="status-options"
            value={f.status}
            onChange={(e) => set('status', e.target.value)}
          />
          <datalist id="status-options">
            <option value="Live" />
            <option value="In progress" />
            <option value="Hackathon prototype" />
            <option value="Concept" />
          </datalist>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <Field name="GitHub link">
          <input
            className={input}
            value={f.github_url}
            onChange={(e) => set('github_url', e.target.value)}
          />
        </Field>
        <Field name="Live link">
          <input
            className={input}
            value={f.live_url}
            onChange={(e) => set('live_url', e.target.value)}
          />
        </Field>
      </div>

      <div>
        <span className={label}>
          Cover image (pick from your library or upload a new one)
        </span>
        <div className="mt-2">
          <CoverPicker
            value={coverPath}
            onChange={(path) => {
              setSaved(false)
              setCoverPath(path)
            }}
            autoPreview={coverFor({
              slug: f.slug,
              title: f.title,
              tags: csv(f.tags),
              description: f.description,
            })}
          />
        </div>
      </div>

      <Field name="Overview">
        <textarea
          className={input}
          rows={5}
          value={f.overview}
          onChange={(e) => set('overview', e.target.value)}
        />
      </Field>

      <Field name="Problem">
        <textarea
          className={input}
          rows={3}
          value={f.problem}
          onChange={(e) => set('problem', e.target.value)}
        />
      </Field>

      <Field name="Features" hint="one per line">
        <textarea
          className={input}
          rows={6}
          value={f.features}
          onChange={(e) => set('features', e.target.value)}
        />
      </Field>

      <Field name="How it works" hint="one per line">
        <textarea
          className={input}
          rows={6}
          value={f.how_it_works}
          onChange={(e) => set('how_it_works', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <Field name="Stack" hint="one per line">
          <textarea
            className={input}
            rows={5}
            value={f.stack}
            onChange={(e) => set('stack', e.target.value)}
          />
        </Field>
        <Field name="Highlights" hint="one per line">
          <textarea
            className={input}
            rows={5}
            value={f.highlights}
            onChange={(e) => set('highlights', e.target.value)}
          />
        </Field>
      </div>

      <Field name="Security notes" hint="one per line, optional">
        <textarea
          className={input}
          rows={4}
          value={f.security}
          onChange={(e) => set('security', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <Field name="My role">
          <textarea
            className={input}
            rows={3}
            value={f.my_role}
            onChange={(e) => set('my_role', e.target.value)}
          />
        </Field>
        <Field name="Credit">
          <textarea
            className={input}
            rows={3}
            value={f.credit}
            onChange={(e) => set('credit', e.target.value)}
          />
        </Field>
      </div>

      <Field name="Folder in repo" hint="optional">
        <input
          className={input}
          value={f.folder}
          onChange={(e) => set('folder', e.target.value)}
        />
      </Field>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={f.published}
          onChange={(e) => set('published', e.target.checked)}
        />
        <span className={label}>Published (visible on the site)</span>
      </label>

      {error && <p className="text-[13px] text-ink">{error}</p>}
      {saved && <p className="text-[13px] text-muted">Saved</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <button type="submit" disabled={busy} className={`${btn} w-full sm:w-auto`}>
          {busy ? 'Saving' : 'Save changes'}
        </button>
        <button type="button" disabled={busy} onClick={onDone} className={`${btnGhost} w-full sm:w-auto`}>
          Cancel
        </button>
      </div>
    </form>
  )
}
