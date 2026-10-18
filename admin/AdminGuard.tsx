import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type State = 'loading' | 'in' | 'out'

// This guard only improves the experience.
// The real protection is Row Level Security in the database.
export default function AdminGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    let alive = true

    async function check() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        if (alive) setState('out')
        return
      }
      const { data: ok } = await supabase.rpc('is_admin')
      if (alive) setState(ok === true ? 'in' : 'out')
    }

    void check()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void check()
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (state === 'loading') return null
  if (state === 'out') return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
