import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  MoreHorizontal,
  Plus,
  Sparkles,
} from 'lucide-react'
import { getScenario } from '../data/scenarios'
import type { Artifact, CustomProfile, HomeSlot, ScenarioId } from '../types'
import { ArtifactCard } from '../components/ArtifactCard'
import { LibraryPicker } from '../components/LibraryPicker'

interface HomePageProps {
  slots: HomeSlot[]
  savedMap: Map<string, Artifact>
  library: Artifact[]
  placedIds: Set<string>
  activeScenario: ScenarioId
  customProfile: CustomProfile
  onAssign: (slotId: string, artifactId: string | null) => void
}

export function HomePage({
  slots,
  savedMap,
  library,
  placedIds,
  activeScenario,
  customProfile,
  onAssign,
}: HomePageProps) {
  const scenario = getScenario(activeScenario, customProfile)
  const liveCount = slots.filter((s) => s.artifactId).length
  const firstEmptySlot = slots.find((slot) => !slot.artifactId)

  return (
    <div className="enterprise-page page-width">
      <header className="enterprise-hero">
        <div>
          <p className="workspace-kicker">Intent OS / {scenario.shortName}</p>
          <h1>{scenario.name}</h1>
          <p>{scenario.description}</p>
        </div>
        <div className="enterprise-hero-actions">
          <span className="system-status">
            <span /> {scenario.status}
          </span>
          <Link to="/" className="btn btn-primary">
            <Sparkles size={14} /> Ask Intent
          </Link>
        </div>
      </header>

      <div className="enterprise-layout">
        <section className="enterprise-main">
          <div className="panel-head">
            <div>
              <h2>Workspace</h2>
              <p>{liveCount} active views configured for this operating surface</p>
            </div>
            <div className="panel-head-actions">
              <LibraryPicker
                library={library}
                placedIds={placedIds}
                disabled={library.length === 0 || !firstEmptySlot}
                label="Add card"
                onPick={(artifactId) => {
                  if (firstEmptySlot) onAssign(firstEmptySlot.id, artifactId)
                }}
              />
            </div>
          </div>

          <div className="workspace-grid">
            {slots.map((slot) => {
              const artifact = slot.artifactId
                ? savedMap.get(slot.artifactId)
                : undefined

              if (artifact) {
                return (
                  <div key={slot.id} className="workspace-slot filled">
                    <ArtifactCard
                      artifact={artifact}
                      compact
                      saved
                      onRemoveFromHome={() => onAssign(slot.id, null)}
                    />
                  </div>
                )
              }

              return (
                <div key={slot.id} className="workspace-slot empty">
                  <div className="empty-slot-inner">
                    <h3>Empty slot</h3>
                    {library.length > 0 ? (
                      <p>Use Add card above to place a saved artifact here.</p>
                    ) : (
                      <>
                        <p>Nothing saved yet.</p>
                        <Link to="/" className="link-arrow sm">
                          Generate one in Console <ChevronRight size={15} />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <aside className="enterprise-sidebar">
          <section className="enterprise-panel">
            <div className="panel-head compact">
              <div>
                <h2>Workflows</h2>
                <p>Automation status</p>
              </div>
              <button><MoreHorizontal size={17} /></button>
            </div>
            <div className="enterprise-list">
              {scenario.workflows.map((workflow) => (
                <div key={workflow.name} className="enterprise-list-row">
                  <span className="row-icon"><CheckCircle2 size={15} /></span>
                  <div>
                    <strong>{workflow.name}</strong>
                    <small>{workflow.detail}</small>
                  </div>
                  <em>{workflow.status}</em>
                </div>
              ))}
            </div>
            <Link className="panel-link" to="/">
              Create workflow <Plus size={14} />
            </Link>
          </section>

          <section className="enterprise-panel">
            <div className="panel-head compact">
              <div>
                <h2>Connected data</h2>
                <p>Context available to Intent</p>
              </div>
              <Database size={17} />
            </div>
            <div className="enterprise-list">
              {scenario.databases.map((database) => (
                <div key={database.name} className="enterprise-list-row">
                  <span className="row-icon neutral"><Database size={14} /></span>
                  <div>
                    <strong>{database.name}</strong>
                    <small>{database.type}</small>
                  </div>
                  <em><Clock3 size={11} /> {database.freshness}</em>
                </div>
              ))}
            </div>
            <Link className="panel-link" to="/">
              Connect source <Plus size={14} />
            </Link>
          </section>
        </aside>
      </div>

      <footer className="enterprise-footer">
        <span>Content adapts to the selected enterprise scenario.</span>
        <Link to="/library">{library.length} items in Library</Link>
      </footer>
    </div>
  )
}
