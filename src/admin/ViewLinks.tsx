import { Link } from 'react-router-dom'
import { btnGhost } from './ui'

// "View site" button for the admin header.
export function ViewSiteButton() {
  return (
    <Link to="/" className={btnGhost}>
      View site
    </Link>
  )
}

// "View" link for a project row. Opens the public page in the SAME tab and
// tells that page the visit came from the admin (so it can show "Back to admin").
export function ViewProjectLink({ slug }: { slug: string }) {
  return (
    <Link
      to={`/projects/${slug}`}
      state={{ from: '/admin' }}
      className={btnGhost}
    >
      View
    </Link>
  )
}
