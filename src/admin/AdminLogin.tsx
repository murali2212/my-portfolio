import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSkipLoginIfAdmin } from './useSkipLoginIfAdmin'
import { supabase } from '../lib/supabase'
import { btn, input, label, wrap } from './ui'

export default function AdminLogin() {
  useSkipLoginIfAdmin()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (signInError) {
      setBusy(false)
      setError('Login failed.')
      return
    }

    // A valid account that is not in the admins table is turned away.
    const { data: ok } = await supabase.rpc('is_admin')
    if (ok !== true) {
      await supabase.auth.signOut()
      setBusy(false)
      setError('Login failed.')
      return
    }

    navigate('/admin', { replace: true })
  }

  return (
    <section className="border-t border-line">
      <div className={wrap}>
        <h1 className="text-[clamp(32px,5vw,64px)] leading-[1] font-light tracking-[-0.02em]">
          ADMIN
        </h1>

        <form onSubmit={onSubmit} className="mt-12 w-full max-w-[420px] space-y-6">
          <label className="block">
            <span className={label}>Email</span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${input} mt-2`}
            />
          </label>

          <label className="block">
            <span className={label}>Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${input} mt-2`}
            />
          </label>

          {error && <p className="text-[13px] text-ink">{error}</p>}

          <button type="submit" disabled={busy} className={`${btn} w-full sm:w-auto`}>
            {busy ? 'Signing in' : 'Sign in'}
          </button>
        </form>
      </div>
    </section>
  )
}
