import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const frame = requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ block: 'start' })
        else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      })
      return () => cancelAnimationFrame(frame)
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
