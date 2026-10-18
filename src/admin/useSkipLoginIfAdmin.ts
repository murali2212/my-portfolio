import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Used on the login page: if you are already logged in as admin,
// skip the form and go straight to /admin.
export function useSkipLoginIfAdmin() {
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true
    void (async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) return
      const { data: ok } = await supabase.rpc('is_admin')
      if (alive && ok === true) navigate('/admin', { replace: true })
    })()
    return () => {
      alive = false
    }
  }, [navigate])
}
