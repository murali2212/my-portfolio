import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminGuard from './AdminGuard'
import AdminLogin from './AdminLogin'
import AdminProjects from './AdminProjects'

export default function AdminApp() {
  // Keep the admin out of search engines.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex,nofollow'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        path="*"
        element={
          <AdminGuard>
            <AdminProjects />
          </AdminGuard>
        }
      />
    </Routes>
  )
}
