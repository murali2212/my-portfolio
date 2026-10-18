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

// "View" link for a project row. Opens the public page in a new tab.
export function ViewProjectLink({ slug }: { slug: string }) {
  return (
    <a
      href={`/projects/${slug}`}
      target="_blank"
      rel="noreferrer"
      className={btnGhost}
    >
      View
    </a>
  )
}
