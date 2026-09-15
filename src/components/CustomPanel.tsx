import { useEffect, useState } from 'react'
import { Database, Plus, Slash, Sparkles, X } from 'lucide-react'
import type { CustomProfile } from '../types'

const DATASET_IDEAS = [
  'Customer accounts',
  'Transaction ledger',
  'Support tickets',
  'Inventory levels',
  'Vendor contracts',
]

const ACTION_IDEAS = [
  'Review exceptions',
  'Approve payouts',
  'Reconcile invoices',
  'Build weekly report',
  'Flag at-risk accounts',
]

interface CustomPanelProps {
  open: boolean
  profile: CustomProfile
  onClose: () => void
  onSave: (profile: CustomProfile) => void
}

/** Right-side control panel for defining a custom workspace. */
export function CustomPanel({
  open,
  profile,
  onClose,
  onSave,
}: CustomPanelProps) {
  const [name, setName] = useState(profile.name)
  const [datasets, setDatasets] = useState<string[]>(profile.datasets)
  const [actions, setActions] = useState<string[]>(profile.actions)

  // Reload the saved profile each time the panel opens.
  useEffect(() => {
    if (!open) return
    setName(profile.name)
    setDatasets(profile.datasets)
    setActions(profile.actions)
  }, [open, profile])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const ready = datasets.length > 0 && actions.length > 0

  return (
    <>
      <div className="panel-scrim" onMouseDown={onClose} />

      <aside
        className="control-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="control-panel-title"
      >
        <header className="control-panel-head">
          <div>
            <p className="workspace-kicker">Custom workspace</p>
            <h2 id="control-panel-title">Controls</h2>
          </div>
          <button className="panel-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className="control-panel-body">
          <label className="control-field">
            <span>Workspace name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Acme Operations"
            />
          </label>

          <ControlSection
            title="Datasets"
            hint="Available with @ in the console"
            icon={<Database size={13} />}
            items={datasets}
            ideas={DATASET_IDEAS}
            placeholder="Add a data source"
            onChange={setDatasets}
          />

          <ControlSection
            title="Actions"
            hint="Available with / in the console"
            icon={<Slash size={13} />}
            items={actions}
            ideas={ACTION_IDEAS}
            placeholder="Add an action"
            onChange={setActions}
          />
        </div>

        <footer className="control-panel-foot">
          <p>
            Generates {Math.max(datasets.length, 1)} data connections and{' '}
            {actions.length || 0} workflows.
          </p>
          <button
            className="btn btn-primary"
            disabled={!ready}
            onClick={() =>
              onSave({
                name: name.trim() || 'My Workspace',
                datasets,
                actions,
              })
            }
          >
            <Sparkles size={14} /> Generate interface
          </button>
        </footer>
      </aside>
    </>
  )
}

interface ControlSectionProps {
  title: string
  hint: string
  icon: React.ReactNode
  items: string[]
  ideas: string[]
  placeholder: string
  onChange: (items: string[]) => void
}

function ControlSection({
  title,
  hint,
  icon,
  items,
  ideas,
  placeholder,
  onChange,
}: ControlSectionProps) {
  const [draft, setDraft] = useState('')

  function add(value: string) {
    const clean = value.trim()
    if (!clean || items.includes(clean)) return
    onChange([...items, clean])
    setDraft('')
  }

  const unused = ideas.filter((idea) => !items.includes(idea))

  return (
    <section className="control-section">
      <div className="control-section-head">
        <span className="control-section-title">
          {icon}
          {title}
        </span>
        <em>{items.length}</em>
      </div>
      <p className="control-section-hint">{hint}</p>

      {items.length > 0 ? (
        <ul className="control-list">
          {items.map((item) => (
            <li key={item}>
              <span>{item}</span>
              <button
                onClick={() => onChange(items.filter((x) => x !== item))}
                aria-label={`Remove ${item}`}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="control-empty">Nothing added yet.</p>
      )}

      <div className="control-add">
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add(draft)
            }
          }}
        />
        <button
          onClick={() => add(draft)}
          disabled={!draft.trim()}
          aria-label={`Add to ${title}`}
        >
          <Plus size={14} />
        </button>
      </div>

      {unused.length > 0 && (
        <div className="control-ideas">
          {unused.slice(0, 4).map((idea) => (
            <button key={idea} onClick={() => add(idea)}>
              <Plus size={11} /> {idea}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
