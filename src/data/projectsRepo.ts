import { useEffect, useState } from 'react'
import { IMAGE_BUCKET, supabase, supabaseReady } from '../lib/supabase'
import { projects as staticProjects, type Project } from './projects'
import { coverFor } from './coverArt'

export interface ProjectRow {
  id: string
  slug: string
  title: string
  description: string
  tags: string[]
  status: string
  image_path: string | null
  overview: string | null
  problem: string | null
  features: string[]
  how_it_works: string[]
  stack: string[]
  highlights: string[]
  security: string[]
  github_url: string | null
  live_url: string | null
  folder: string | null
  my_role: string | null
  credit: string | null
  sort_order: number
  published: boolean
  deleted_at: string | null
}

export const imageUrl = (path: string | null) => {
  if (!path) return null
  // Site files (like /projects/cognitive-engine.svg) and full links are used as they are.
  if (path.startsWith('/') || path.startsWith('http')) return path
  if (path.startsWith('covers/') && path.endsWith('.svg')) return `/${path}`
  // Everything else is a file uploaded through the admin (Supabase storage).
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl
}

const list = (a: string[]) => (a.length ? a : undefined)
const text = (s: string | null) => (s ? s : undefined)

export function rowToProject(r: ProjectRow): Project {
  return {
    title: r.title,
    slug: r.slug,
    description: r.description,
    tags: r.tags,
    status: r.status,
    image: imageUrl(r.image_path) ?? coverFor(r),
    overview: text(r.overview),
    problem: text(r.problem),
    features: list(r.features),
    how_it_works: list(r.how_it_works),
    stack: list(r.stack),
    highlights: list(r.highlights),
    security: list(r.security),
    links: { github: text(r.github_url), live: text(r.live_url) },
    folder: text(r.folder),
    my_role: text(r.my_role),
    credit: text(r.credit),
  }
}

// ---------- cache + fallback ----------
const fallbackProjects: Project[] = staticProjects.map((p) => ({
  ...p,
  image: p.image ?? coverFor(p),
}))
const CACHE_KEY = 'projects-cache-v1'
let inflight: Promise<Project[]> | null = null

function readCache(): Project[] | null {
  if (!supabaseReady) return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as Project[]) : null
  } catch {
    return null
  }
}

function writeCache(items: Project[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items))
  } catch {
    /* storage unavailable, ignore */
  }
}

async function fetchProjects(): Promise<Project[]> {
  if (!supabaseReady) return fallbackProjects
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .is('deleted_at', null)
      .order('sort_order')
    if (error || !data) return readCache() ?? fallbackProjects
    const items = (data as ProjectRow[]).map(rowToProject)
    writeCache(items)
    return items
  } catch {
    // database down or paused -> last good copy, then the built-in list
    return readCache() ?? fallbackProjects
  }
}

export function loadProjects() {
  if (!inflight) inflight = fetchProjects()
  return inflight
}

// Call after any admin change so the public site refetches.
export function resetProjectsCache() {
  inflight = null
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    /* ignore */
  }
}

// ---------- hooks ----------
export function useProjects() {
  const [items, setItems] = useState<Project[] | null>(() => readCache())

  useEffect(() => {
    let alive = true
    loadProjects().then((p) => {
      if (alive) setItems(p)
    })
    return () => {
      alive = false
    }
  }, [])

  return { projects: items ?? [], loading: items === null }
}

export function useProject(slug?: string) {
  const { projects, loading } = useProjects()
  const index = slug ? projects.findIndex((p) => p.slug === slug) : -1
  const project = index >= 0 ? projects[index] : undefined
  return { project, index, loading }
}
