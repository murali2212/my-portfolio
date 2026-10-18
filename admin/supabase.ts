import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// False when the env vars are missing -> the site falls back to src/data/projects.ts
export const supabaseReady = Boolean(url && key)

// Only the public anon key is ever used in the browser.
export const supabase = createClient(url ?? 'http://localhost', key ?? 'missing')

export const IMAGE_BUCKET = 'project-images'
