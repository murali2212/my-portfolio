import { useLocation } from 'react-router-dom'

// Where the "back" button on a project page should go.
// Visitors always get "Back to projects". It only changes to "Back to admin"
// when you arrived by clicking "View" inside the admin list.
export function useBackTarget() {
  const state = useLocation().state as { from?: string } | null
  return state?.from === '/admin'
    ? { to: '/admin', label: 'Back to admin' }
    : { to: '/projects', label: 'Back to projects' }
}
