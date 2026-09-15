import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { AtSign, CornerDownLeft, Database, Slash, X } from 'lucide-react'
import type { DatasetRef, WorkflowRef } from '../types'
import { AgentLogo } from './AgentLogo'

export interface SubmitOptions {
  /** Caps how many artifact cards the reply returns. */
  limit?: number
}

export interface DemoRun {
  text: string
  datasets: string[]
  workflow?: string
  /** Changing this replays the demo, even for the same command. */
  token: number
}

interface ConsoleInputProps {
  disabled?: boolean
  datasets: DatasetRef[]
  workflows: WorkflowRef[]
  placeholder?: string
  agentLabel: string
  demo?: DemoRun | null
  onDemoDone?: () => void
  onSubmit: (
    prompt: string,
    datasets: string[],
    workflow?: string,
    options?: SubmitOptions,
  ) => void
}

type MenuMode = 'dataset' | 'workflow' | null

interface MenuItem {
  id: string
  label: string
  hint: string
  insert: string
  category: string
}

const TRIGGER = /(?:^|\s)([@/])([\w-]*)$/

export function ConsoleInput({
  disabled,
  datasets: DATASETS,
  workflows: WORKFLOWS,
  placeholder,
  agentLabel,
  demo,
  onDemoDone,
  onSubmit,
}: ConsoleInputProps) {
  const [value, setValue] = useState('')
  const [menuMode, setMenuMode] = useState<MenuMode>(null)
  const [menuQuery, setMenuQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | undefined>()
  const [replaying, setReplaying] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const composerRef = useRef<HTMLDivElement>(null)
  const [menuBox, setMenuBox] = useState<{
    left: number
    width: number
    top?: number
    bottom?: number
  } | null>(null)

  const categories = useMemo(
    () => [...new Set(DATASETS.map((dataset) => dataset.category))],
    [DATASETS],
  )

  const items = useMemo<MenuItem[]>(() => {
    const query = menuQuery.toLowerCase()

    if (menuMode === 'dataset') {
      return DATASETS.filter(
        (d) =>
          (!categoryFilter || d.category === categoryFilter) &&
          (d.name.toLowerCase().includes(query) ||
            d.id.toLowerCase().includes(query) ||
            d.category.toLowerCase().includes(query)),
      ).map((d) => ({
        id: d.id,
        label: d.name,
        hint: d.description,
        insert: `@${d.name}`,
        category: d.category,
      }))
    }

    if (menuMode === 'workflow') {
      return WORKFLOWS.filter(
        (w) =>
          w.name.toLowerCase().includes(query) ||
          w.slash.toLowerCase().includes(query) ||
          w.category.toLowerCase().includes(query),
      ).map((w) => ({
        id: w.id,
        label: `/${w.slash}`,
        hint: w.description,
        insert: `/${w.slash}`,
        category: w.category,
      }))
    }

    return []
  }, [menuMode, menuQuery, categoryFilter, DATASETS, WORKFLOWS])

  /** Same items, bucketed by category for rendering section headers. */
  const groups = useMemo(() => {
    const order: string[] = []
    const byCategory = new Map<string, MenuItem[]>()
    items.forEach((item) => {
      if (!byCategory.has(item.category)) {
        byCategory.set(item.category, [])
        order.push(item.category)
      }
      byCategory.get(item.category)!.push(item)
    })
    return order.map((category) => ({
      category,
      items: byCategory.get(category)!,
    }))
  }, [items])

  useEffect(() => {
    setActiveIndex(0)
  }, [items.length, menuMode])

  const menuOpen = Boolean(menuMode) && groups.length > 0

  // The menu is portalled out of the agent card (which clips overflow), so it
  // anchors itself to the composer instead of inheriting its position.
  useLayoutEffect(() => {
    if (!menuOpen) {
      setMenuBox(null)
      return
    }

    function place() {
      const rect = composerRef.current?.getBoundingClientRect()
      if (!rect) return
      const openUp = rect.top > 260
      setMenuBox({
        left: rect.left,
        width: rect.width,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 8 }
          : { top: rect.bottom + 8 }),
      })
    }

    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [menuOpen, menuMode, groups.length])

  function detectTrigger(next: string) {
    const match = next.match(TRIGGER)
    if (!match) {
      setMenuMode(null)
      setMenuQuery('')
      setCategoryFilter(null)
      return
    }
    setMenuMode(match[1] === '@' ? 'dataset' : 'workflow')
    setMenuQuery(match[2] ?? '')
  }

  /** Re-derives chips from raw text so typed tokens count, not just picks. */
  function syncChips(text: string) {
    const lower = text.toLowerCase()
    WORKFLOWS.forEach((flow) => {
      if (lower.includes(`/${flow.slash}`)) setSelectedWorkflow(flow.id)
    })
    DATASETS.forEach((dataset) => {
      if (lower.includes(`@${dataset.name.toLowerCase()}`)) {
        setSelectedDatasets((prev) =>
          prev.includes(dataset.id) ? prev : [...prev, dataset.id],
        )
      }
    })
  }

  // Types the example command out, opening the @ and / menus as it goes so the
  // typeahead is visible, then runs it.
  useEffect(() => {
    if (!demo) return

    const { text, datasets: demoDatasets, workflow: demoWorkflow } = demo
    let cancelled = false
    let timer = 0
    let index = 0

    setReplaying(true)
    setValue('')
    setSelectedDatasets([])
    setSelectedWorkflow(undefined)
    setMenuMode(null)
    setCategoryFilter(null)
    textareaRef.current?.focus()

    function step() {
      if (cancelled) return
      index += 1
      const slice = text.slice(0, index)
      setValue(slice)
      detectTrigger(slice)
      syncChips(slice)

      if (index >= text.length) {
        timer = window.setTimeout(() => {
          if (cancelled) return
          setMenuMode(null)
          onSubmit(text.trim(), demoDatasets, demoWorkflow, { limit: 2 })
          setValue('')
          setSelectedDatasets([])
          setSelectedWorkflow(undefined)
          setReplaying(false)
          onDemoDone?.()
        }, 520)
        return
      }

      const justTyped = text[index - 1]
      const nextChar = text[index]
      const menuOpen = TRIGGER.test(slice)

      let delay = 26
      if (justTyped === '@' || justTyped === '/') {
        delay = 900 // hold on the full, unfiltered list
      } else if (menuOpen && nextChar === ' ') {
        delay = 700 // hold on the narrowed result before committing
      }

      timer = window.setTimeout(step, delay)
    }

    timer = window.setTimeout(step, 320)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      setReplaying(false)
    }
    // Replays only when a new demo is requested.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo?.token])

  function applyItem(item: MenuItem) {
    if (menuMode === 'dataset') {
      setSelectedDatasets((prev) =>
        prev.includes(item.id) ? prev : [...prev, item.id],
      )
    }
    if (menuMode === 'workflow') setSelectedWorkflow(item.id)

    setValue((prev) =>
      prev.replace(TRIGGER, (match) => {
        const lead = match.startsWith(' ') || match.startsWith('\n') ? match[0] : ''
        return `${lead}${item.insert} `
      }),
    )
    setMenuMode(null)
    setMenuQuery('')
    setCategoryFilter(null)
    textareaRef.current?.focus()
  }

  function openCategory(category: string) {
    if (disabled || replaying) return
    setValue((prev) => (prev.endsWith('@') ? prev : `${prev}${prev && !prev.endsWith(' ') ? ' ' : ''}@`))
    setMenuMode('dataset')
    setMenuQuery('')
    setCategoryFilter(category)
    textareaRef.current?.focus()
  }

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    const datasetIds = new Set(selectedDatasets)
    DATASETS.forEach((d) => {
      const lower = trimmed.toLowerCase()
      if (lower.includes(`@${d.name.toLowerCase()}`) || lower.includes(`@${d.id}`)) {
        datasetIds.add(d.id)
      }
    })

    let workflow = selectedWorkflow
    WORKFLOWS.forEach((w) => {
      const lower = trimmed.toLowerCase()
      if (lower.includes(`/${w.slash}`) || lower.includes(`/${w.id}`)) {
        workflow = w.id
      }
    })

    onSubmit(trimmed, [...datasetIds], workflow)
    setValue('')
    setSelectedDatasets([])
    setSelectedWorkflow(undefined)
    setMenuMode(null)
    setCategoryFilter(null)
  }

  const activeWorkflow = WORKFLOWS.find((w) => w.id === selectedWorkflow)
  const hasChips = selectedDatasets.length > 0 || Boolean(selectedWorkflow)

  return (
    <div className="composer" ref={composerRef}>
      {hasChips && (
        <div className="composer-chips">
          {activeWorkflow && (
            <span className="attach-chip is-workflow">
              <Slash size={11} />
              {activeWorkflow.slash}
              <button
                onClick={() => setSelectedWorkflow(undefined)}
                aria-label={`Remove ${activeWorkflow.name}`}
              >
                <X size={11} />
              </button>
            </span>
          )}
          {selectedDatasets.map((id) => {
            const dataset = DATASETS.find((d) => d.id === id)
            if (!dataset) return null
            return (
              <span key={id} className="attach-chip">
                <Database size={11} />
                {dataset.name}
                <button
                  onClick={() =>
                    setSelectedDatasets((prev) => prev.filter((x) => x !== id))
                  }
                  aria-label={`Remove ${dataset.name}`}
                >
                  <X size={11} />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {menuOpen &&
        menuBox &&
        createPortal(
          <div className="mention-menu" role="listbox" style={menuBox}>
          <div className={`mention-menu-head ${menuMode}`}>
            {menuMode === 'dataset' ? (
              <>
                <AtSign size={12} /> Data sources
              </>
            ) : (
              <>
                <Slash size={12} /> Actions
              </>
            )}
            {menuQuery && <em>“{menuQuery}”</em>}
          </div>

          <div className="mention-menu-scroll">
            {groups.map((group) => (
              <div key={group.category} className="mention-group">
                <div className="mention-group-label">{group.category}</div>
                {group.items.map((item) => {
                  const flatIndex = items.findIndex((i) => i.id === item.id)
                  return (
                    <button
                      key={item.id}
                      role="option"
                      aria-selected={flatIndex === activeIndex}
                      className={flatIndex === activeIndex ? 'active' : ''}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        applyItem(item)
                      }}
                    >
                      <div>
                        <strong>{item.label}</strong>
                        <span>{item.hint}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
            </div>
          </div>,
          document.body,
        )}

      <div className="composer-input">
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled || replaying}
          placeholder={placeholder ?? 'What do you want to do?'}
          rows={2}
          onChange={(event) => {
            setValue(event.target.value)
            detectTrigger(event.target.value)
          }}
          onKeyDown={(event) => {
            if (menuMode && items.length > 0) {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActiveIndex((i) => (i + 1) % items.length)
                return
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActiveIndex((i) => (i - 1 + items.length) % items.length)
                return
              }
              if (event.key === 'Enter' || event.key === 'Tab') {
                event.preventDefault()
                applyItem(items[activeIndex])
                return
              }
              if (event.key === 'Escape') {
                setMenuMode(null)
                setCategoryFilter(null)
                return
              }
            }

            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              handleSubmit()
            }
          }}
        />
      </div>

      <div className="composer-foot">
        <div className="composer-sources">
          {categories.map((category) => (
            <button
              key={category}
              className={categoryFilter === category ? 'active' : ''}
              onClick={() => openCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="composer-actions">
          <span className="model-pill">
            <AgentLogo size={12} /> {agentLabel}
          </span>
          <button
            className="btn btn-primary send-btn"
            disabled={disabled || replaying || !value.trim()}
            onClick={handleSubmit}
          >
            Run <CornerDownLeft size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
