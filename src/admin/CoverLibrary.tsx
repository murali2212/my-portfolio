import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { supabase } from '../lib/supabase'
import { imageUrl } from '../data/projectsRepo'
import {
  addCoverToLibrary,
  BUILT_IN_COVERS,
  type CoverItem,
} from './coverTools'
import { btn, btnGhost, label } from './ui'

function CoverThumbnail({ item }: { item: CoverItem }) {
  const [failed, setFailed] = useState(false)
  const src = imageUrl(item.path)

  return (
    <div className="aspect-[4/3] overflow-hidden bg-paper">
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-4 text-center">
          <span className={label}>Preview unavailable</span>
        </div>
      )}
    </div>
  )
}

// A pop-up with every cover you have saved.
// With onPick: clicking a cover chooses it. Without: it is just for managing.
export default function CoverLibrary({
  onClose,
  onPick,
  selected,
}: {
  onClose: () => void
  onPick?: (path: string) => void
  selected?: string | null
}) {
  const [items, setItems] = useState<CoverItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  })

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('covers')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
      setItems(BUILT_IN_COVERS)
    } else {
      const builtInPaths = new Set(BUILT_IN_COVERS.map((item) => item.path))
      const stored = (data as CoverItem[]).filter(
        (item) => !builtInPaths.has(item.path),
      )
      setItems([...BUILT_IN_COVERS, ...stored])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Esc closes it, and the page behind does not scroll while it is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [])

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    setBusy(true)
    setError('')
    try {
      const added: CoverItem[] = []
      for (const file of files) added.push(await addCoverToLibrary(file))
      setItems((current) => [
        ...added.reverse(),
        ...current.filter((item) => !added.some((newItem) => newItem.id === item.id)),
      ])
      setLoading(false)
      await load()
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(item: CoverItem) {
    if (item.id.startsWith('builtin-')) return
    if (
      !window.confirm(
        'Remove this cover from the library? Projects already using it keep it.',
      )
    )
      return
    const { error: err } = await supabase.from('covers').delete().eq('id', item.id)
    if (err) setError(err.message)
    else await load()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/40 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[980px] overflow-y-auto border border-line bg-paper p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cover library"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[clamp(24px,3vw,36px)] leading-[1.05] font-light tracking-[-0.02em]">
            Cover library
          </h2>
          <div className="flex gap-3">
            <button
              type="button"
              className={btn}
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {busy ? 'Uploading' : 'Add cover'}
            </button>
            <button type="button" className={btnGhost} onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <p className="mt-4 text-[13px] text-muted">
          {onPick
            ? 'Click a cover to use it for this project.'
            : 'Covers saved here can be used for any project.'}
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onFiles}
        />

        {error && <p className="mt-4 text-[13px] text-ink">{error}</p>}

        {loading ? null : items.length === 0 ? (
          <p className="mt-10 text-[14px] text-muted">
            No covers yet. Click "Add cover" to save your first one.
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id} className="border border-line bg-pure">
                <button
                  type="button"
                  disabled={!onPick}
                  onClick={() => onPick?.(item.path)}
                  className="block w-full text-left disabled:cursor-default"
                >
                  <CoverThumbnail item={item} />
                  <p className={`${label} truncate px-3 pt-3`}>
                    {item.label || 'Untitled'}
                  </p>
                </button>
                <div className="flex items-center justify-between px-3 pt-1 pb-3">
                  <span className={label}>
                    {selected === item.path ? 'In use here' : ''}
                  </span>
                  {!item.id.startsWith('builtin-') && (
                    <button
                      type="button"
                      className="py-2 text-[10px] tracking-[0.24em] text-faint uppercase hover:text-ink"
                      onClick={() => void remove(item)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
