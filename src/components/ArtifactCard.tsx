import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  LoaderCircle,
  Pin,
  PinOff,
  Sparkles,
  Table2,
  Workflow,
} from 'lucide-react'
import type { Artifact } from '../types'

interface ArtifactCardProps {
  artifact: Artifact
  saved?: boolean
  compact?: boolean
  onSave?: (artifact: Artifact) => void
  onUnsave?: (artifactId: string) => void
  onRemoveFromHome?: () => void
}

function TrendIcon({ trend }: { trend?: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <ArrowUpRight size={14} />
  if (trend === 'down') return <ArrowDownRight size={14} />
  return <ArrowRight size={14} />
}

function KindBadge({ kind }: { kind: Artifact['kind'] }) {
  const labels: Record<Artifact['kind'], string> = {
    metrics: 'Metrics',
    table: 'Table',
    chart: 'Chart',
    workflow: 'Workflow',
    actions: 'Actions',
    insight: 'Insight',
  }
  return <span className="kind-badge">{labels[kind]}</span>
}

export function ArtifactCard({
  artifact,
  saved,
  compact,
  onSave,
  onUnsave,
  onRemoveFromHome,
}: ArtifactCardProps) {
  const maxChart = Math.max(
    ...(artifact.payload.chart?.map((p) => p.value) ?? [1]),
  )

  return (
    <article className={`artifact-card kind-${artifact.kind} ${compact ? 'compact' : ''}`}>
      <header className="artifact-header">
        <div>
          <div className="artifact-meta">
            <KindBadge kind={artifact.kind} />
            {artifact.workflow && (
              <span className="chip">
                <Workflow size={12} /> /{artifact.workflow}
              </span>
            )}
          </div>
          <h3>{artifact.title}</h3>
          <p>{artifact.subtitle}</p>
        </div>
        <div className="artifact-actions">
          {onRemoveFromHome && (
            <button
              className="btn btn-secondary"
              onClick={onRemoveFromHome}
              title="Remove from Home"
            >
              <PinOff size={14} />
            </button>
          )}
          {onSave && !saved && (
            <button className="btn btn-primary" onClick={() => onSave(artifact)}>
              <Pin size={14} /> Save
            </button>
          )}
          {saved && onUnsave && (
            <button
              className="btn btn-secondary"
              onClick={() => onUnsave(artifact.id)}
            >
              <Pin size={14} /> Saved
            </button>
          )}
          {saved && !onUnsave && !onRemoveFromHome && (
            <span className="chip tint-green">
              <Pin size={12} /> Saved
            </span>
          )}
        </div>
      </header>

      {artifact.kind === 'metrics' && artifact.payload.metrics && (
        <div className="metrics-grid">
          {artifact.payload.metrics.map((m) => (
            <div key={m.label} className="metric-tile">
              <span className="metric-label">{m.label}</span>
              <strong>{m.value}</strong>
              {m.delta && (
                <span className={`metric-delta trend-${m.trend ?? 'flat'}`}>
                  <TrendIcon trend={m.trend} />
                  {m.delta}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {artifact.kind === 'table' && artifact.payload.table && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {artifact.payload.table.columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {artifact.payload.table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {artifact.kind === 'chart' && artifact.payload.chart && (
        <div className="chart-wrap">
          <div className="bar-chart">
            {artifact.payload.chart.map((point) => (
              <div key={point.label} className="bar-col">
                <div
                  className="bar"
                  style={{ height: `${(point.value / maxChart) * 100}%` }}
                  title={`${point.label}: ${point.value}`}
                />
                <span>{point.label}</span>
              </div>
            ))}
          </div>
          {artifact.payload.insight && (
            <p className="chart-note">{artifact.payload.insight}</p>
          )}
        </div>
      )}

      {artifact.kind === 'workflow' && artifact.payload.workflowSteps && (
        <ol className="workflow-steps">
          {artifact.payload.workflowSteps.map((step) => (
            <li key={step.label} className={`step-${step.status}`}>
              {step.status === 'done' && <CheckCircle2 size={16} />}
              {step.status === 'running' && (
                <LoaderCircle size={16} className="spin" />
              )}
              {step.status === 'pending' && <Circle size={16} />}
              <span>{step.label}</span>
              <em>{step.status}</em>
            </li>
          ))}
        </ol>
      )}

      {artifact.kind === 'actions' && artifact.payload.actions && (
        <ul className="action-list">
          {artifact.payload.actions.map((action) => (
            <li key={action.title}>
              <div>
                <strong>{action.title}</strong>
                <span>
                  {action.owner} · due {action.due}
                </span>
              </div>
              <em className={`prio-${action.priority}`}>{action.priority}</em>
            </li>
          ))}
        </ul>
      )}

      {artifact.kind === 'insight' && artifact.payload.insight && (
        <div className="insight-body">
          <Sparkles size={18} />
          <p>{artifact.payload.insight}</p>
        </div>
      )}

      {!compact && (
        <footer className="artifact-footer">
          <span>
            <Table2 size={12} />{' '}
            {artifact.datasets.map((d) => `@${d}`).join(' · ') || 'synthetic'}
          </span>
          <span>
            <Activity size={12} /> generated artifact
          </span>
        </footer>
      )}
    </article>
  )
}
