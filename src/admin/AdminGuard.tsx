import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type State = 'loading' | 'in' | 'out'

// Asks the database "am I an admin?". Retries once on a temporary error.
// Returns true / false, or null if it could not be checked.
async function checkAdmin(): Promise<boolean | null> {
  for (let i = 0; i < 2; i++) {
    const { data, error } = await supabase.rpc('is_admin')
    if (!error) return data === true
    await new Promise((r) => setTimeout(r, 800))
  }
  return null
}

// This guard only improves the experience.
// The real protection is Row Level Security in the database.
export default function AdminGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>('loading')
  const known = useRef<State>('loading')

  useEffect(() => {
    let alive = true

    function apply(next: State) {
      known.current = next
      if (alive) setState(next)
    }

    async function check() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        apply('out')
        return
      }
      const result = await checkAdmin()
      if (result === null) {
        // Temporary problem: never kick out someone who is already in.
        if (known.current !== 'in') apply('out')
        return
      }
      apply(result ? 'in' : 'out')
    }

    void check()

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') apply('out')
      else if (known.current !== 'in') void check()
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
