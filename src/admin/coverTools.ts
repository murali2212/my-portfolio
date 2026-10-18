import { IMAGE_BUCKET, supabase } from '../lib/supabase'

export interface CoverItem {
  id: string
  path: string
  label: string
  created_at: string
}

export const BUILT_IN_COVERS: CoverItem[] = [
  {
    id: 'builtin-cognitive-engine',
    path: '/covers/cognitive-engine.svg',
    label: 'Cognitive Engine',
    created_at: '',
  },
  {
    id: 'builtin-cura',
    path: '/covers/cura.svg',
    label: 'Cura',
    created_at: '',
  },
  {
    id: 'builtin-ai-automation',
    path: '/covers/ai-automation.svg',
    label: 'AI Automation Systems',
    created_at: '',
  },
  {
    id: 'builtin-experimental-ai',
    path: '/covers/experimental-ai.svg',
    label: 'Experimental AI',
    created_at: '',
  },
]

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image.'))
    }
    img.src = url
  })
}

// Resize to max 1600px wide and compress to WebP before upload.
export async function resizeToWebp(file: File, maxWidth = 1600): Promise<Blob> {
  const img = await loadImage(file)
  const srcW = img.naturalWidth || 1600
  const srcH = img.naturalHeight || 800
  const scale = Math.min(1, maxWidth / srcW)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(srcW * scale)
  canvas.height = Math.round(srcH * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process the image.')
  ctx.fillStyle = '#fafaf7' // fills see-through areas of PNG/SVG
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Image resize failed.'))),
      'image/webp',
      0.85,
    )
  })
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Resizes the picture, uploads it, and saves it in the cover library.
// The file is never deleted later, so old versions of a project keep working.
export async function addCoverToLibrary(file: File): Promise<CoverItem> {
  const label = file.name.replace(/\.[^.]+$/, '')
  const blob = await resizeToWebp(file)
  const path = `covers/${slugify(label) || 'cover'}-${Date.now()}.webp`

  const up = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, blob, { contentType: 'image/webp' })
  if (up.error) throw up.error

  const ins = await supabase.from('covers').insert({ path, label }).select().single()
  if (ins.error) throw ins.error
  return ins.data as CoverItem
}
