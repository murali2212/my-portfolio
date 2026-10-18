import { useRef, useState, type ChangeEvent } from 'react'
import { imageUrl } from '../data/projectsRepo'
import { addCoverToLibrary } from './coverTools'
import CoverLibrary from './CoverLibrary'
import { btnGhost, label } from './ui'

// The cover section of the project form.
// value = the chosen cover (null = the automatic drawn cover).
export default function CoverPicker({
  value,
  onChange,
  autoPreview,
}: {
  value: string | null
  onChange: (path: string | null) => void
  autoPreview?: string
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const item = await addCoverToLibrary(file) // saved in the library too
      onChange(item.path)
    } catch (err) {
      setError((err as { message?: string }).message ?? 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  const shown = imageUrl(value) ?? autoPreview ?? null

  return (
    <div>
      <div className="aspect-[2/1] w-full max-w-[460px] overflow-hidden border border-line bg-pure">
        {shown ? (
          <img src={shown} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <span className={label}>Automatic cover</span>
          </div>
        )}
      </div>

      <p className={`${label} mt-3`}>
        {value ? 'Using your chosen cover' : 'Using the automatic cover'}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
        <button type="button" className={btnGhost} onClick={() => setOpen(true)}>
          Choose from library
        </button>
        <button
          type="button"
          className={btnGhost}
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? 'Uploading' : 'Upload new cover'}
        </button>
        {value && (
          <button type="button" className={btnGhost} onClick={() => onChange(null)}>
            Use automatic cover
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      {error && <p className="mt-3 text-[13px] text-ink">{error}</p>}

      {open && (
        <CoverLibrary
          selected={value}
          onClose={() => setOpen(false)}
          onPick={(path) => {
            onChange(path)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}
