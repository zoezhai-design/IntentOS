import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Sparkles } from 'lucide-react'
import { ArtifactCard } from '../components/ArtifactCard'
import type { Artifact } from '../types'

interface SavedWorkPageProps {
  artifacts: Artifact[]
  onUnsave: (artifactId: string) => void
}

export function SavedWorkPage({
  artifacts,
  onUnsave,
}: SavedWorkPageProps) {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')

  const visible = useMemo(
    () =>
      artifacts.filter((artifact) => {
        const matchesKind = kind === 'all' || artifact.kind === kind
        const haystack =
          `${artifact.title} ${artifact.subtitle} ${artifact.workflow ?? ''}`.toLowerCase()
        return matchesKind && haystack.includes(query.toLowerCase())
      }),
    [artifacts, kind, query],
  )

  return (
    <div className="saved-page page-width">
      <header className="saved-hero">
        <div>
          <p className="workspace-kicker">Saved work</p>
          <h1>Library</h1>
          <p>Every reusable artifact generated across your enterprise workspace.</p>
        </div>
        <Link to="/" className="btn btn-primary">
          <Sparkles size={14} /> Generate new
        </Link>
      </header>

      <div className="library-toolbar">
        <label className="library-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search saved work"
          />
        </label>
        <select value={kind} onChange={(event) => setKind(event.target.value)}>
          <option value="all">All types</option>
          <option value="metrics">Metrics</option>
          <option value="chart">Charts</option>
          <option value="table">Tables</option>
          <option value="workflow">Workflows</option>
          <option value="actions">Actions</option>
          <option value="insight">Insights</option>
        </select>
        <span>{visible.length} items</span>
      </div>

      {visible.length > 0 ? (
        <section className="saved-grid">
          {visible.map((artifact) => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              saved
              onUnsave={onUnsave}
            />
          ))}
        </section>
      ) : (
        <section className="library-empty">
          <h2>No saved work found</h2>
          <p>Change your filters or generate a new artifact in Console.</p>
        </section>
      )}
    </div>
  )
}
