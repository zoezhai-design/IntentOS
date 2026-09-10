import { useEffect, useMemo, useRef, useState } from 'react'
import { AtSign, Command, CornerDownLeft, Slash } from 'lucide-react'
import { DATASETS, WORKFLOWS } from '../data/mockData'

interface ConsoleInputProps {
  disabled?: boolean
  onSubmit: (prompt: string, datasets: string[], workflow?: string) => void
}

type MenuMode = 'dataset' | 'workflow' | null

export function ConsoleInput({ disabled, onSubmit }: ConsoleInputProps) {
  const [value, setValue] = useState('')
  const [menuMode, setMenuMode] = useState<MenuMode>(null)
  const [menuQuery, setMenuQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | undefined>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const items = useMemo(() => {
    if (menuMode === 'dataset') {
      return DATASETS.filter(
        (d) =>
          d.name.toLowerCase().includes(menuQuery.toLowerCase()) ||
          d.id.toLowerCase().includes(menuQuery.toLowerCase()),
      ).map((d) => ({
        id: d.id,
        label: d.name,
        hint: d.description,
        tag: d.category,
        insert: `@${d.name}`,
      }))
    }
    if (menuMode === 'workflow') {
      return WORKFLOWS.filter(
        (w) =>
          w.name.toLowerCase().includes(menuQuery.toLowerCase()) ||
          w.slash.toLowerCase().includes(menuQuery.toLowerCase()),
      ).map((w) => ({
        id: w.id,
        label: `/${w.slash}`,
        hint: w.description,
        tag: 'Workflow',
        insert: `/${w.slash}`,
      }))
    }
    return []
  }, [menuMode, menuQuery])

  useEffect(() => {
    setActiveIndex(0)
  }, [items.length, menuMode])

  function detectTrigger(next: string) {
    const caretMatch = next.match(/(?:^|\s)([@/])([\w-]*)$/)
    if (!caretMatch) {
      setMenuMode(null)
      setMenuQuery('')
      return
    }
    const trigger = caretMatch[1]
    const query = caretMatch[2] ?? ''
    setMenuMode(trigger === '@' ? 'dataset' : 'workflow')
    setMenuQuery(query)
  }

  function applyItem(item: (typeof items)[number]) {
    if (menuMode === 'dataset') {
      setSelectedDatasets((prev) =>
        prev.includes(item.id) ? prev : [...prev, item.id],
      )
    }
    if (menuMode === 'workflow') {
      setSelectedWorkflow(item.id)
    }

    setValue((prev) => prev.replace(/(?:^|\s)([@/])([\w-]*)$/, (match) => {
      const leadingSpace = match.startsWith(' ') || match.startsWith('\n') ? match[0] : ''
      return `${leadingSpace}${item.insert} `
    }))
    setMenuMode(null)
    setMenuQuery('')
    textareaRef.current?.focus()
  }

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    const datasetIds = new Set(selectedDatasets)
    DATASETS.forEach((d) => {
      if (
        trimmed.toLowerCase().includes(`@${d.name.toLowerCase()}`) ||
        trimmed.toLowerCase().includes(`@${d.id.toLowerCase()}`)
      ) {
        datasetIds.add(d.id)
      }
    })

    let workflow = selectedWorkflow
    WORKFLOWS.forEach((w) => {
      if (
        trimmed.toLowerCase().includes(`/${w.slash}`) ||
        trimmed.toLowerCase().includes(`/${w.id}`)
      ) {
        workflow = w.id
      }
    })

    onSubmit(trimmed, [...datasetIds], workflow)
    setValue('')
    setSelectedDatasets([])
    setSelectedWorkflow(undefined)
    setMenuMode(null)
  }

  return (
    <div className="console-input-shell">
      {(selectedDatasets.length > 0 || selectedWorkflow) && (
        <div className="context-chips">
          {selectedWorkflow && (
            <span className="chip accent">
              <Slash size={12} />{' '}
              {WORKFLOWS.find((w) => w.id === selectedWorkflow)?.slash}
            </span>
          )}
          {selectedDatasets.map((id) => (
            <span key={id} className="chip">
              <AtSign size={12} /> {DATASETS.find((d) => d.id === id)?.name}
            </span>
          ))}
        </div>
      )}

      {menuMode && items.length > 0 && (
        <div className="mention-menu" role="listbox">
          <div className="mention-menu-title">
            {menuMode === 'dataset' ? 'Reference a dataset' : 'Start a workflow'}
          </div>
          {items.map((item, index) => (
            <button
              key={item.id}
              className={index === activeIndex ? 'active' : ''}
              onMouseDown={(e) => {
                e.preventDefault()
                applyItem(item)
              }}
            >
              <div>
                <strong>{item.label}</strong>
                <span>{item.hint}</span>
              </div>
              <em>{item.tag}</em>
            </button>
          ))}
        </div>
      )}

      <div className="console-input">
        <div className="input-hints">
          <span>
            <AtSign size={13} /> data
          </span>
          <span>
            <Slash size={13} /> workflow
          </span>
          <span>
            <Command size={13} /> intent
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled}
          placeholder="What do you want to do? Try /denial-recovery with @Claims Q3"
          rows={3}
          onChange={(e) => {
            setValue(e.target.value)
            detectTrigger(e.target.value)
          }}
          onKeyDown={(e) => {
            if (menuMode && items.length > 0) {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActiveIndex((i) => (i + 1) % items.length)
                return
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveIndex((i) => (i - 1 + items.length) % items.length)
                return
              }
              if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault()
                applyItem(items[activeIndex])
                return
              }
              if (e.key === 'Escape') {
                setMenuMode(null)
                return
              }
            }

            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <button
          className="btn btn-primary send-btn"
          disabled={disabled || !value.trim()}
          onClick={handleSubmit}
        >
          Run
          <CornerDownLeft size={14} />
        </button>
      </div>
    </div>
  )
}
