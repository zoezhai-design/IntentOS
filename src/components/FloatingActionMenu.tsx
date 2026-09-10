import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Check,
  ChevronUp,
  CircleDollarSign,
  Database,
  HeartPulse,
  LineChart,
  Palette,
  Plus,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { SCENARIOS } from '../data/scenarios'
import type { ScenarioId } from '../types'

const ICONS = {
  healthcare: HeartPulse,
  fintech: CircleDollarSign,
  trading: LineChart,
  creator: Palette,
  custom: Building2,
}

interface FloatingActionMenuProps {
  activeScenario: ScenarioId
  onScenarioChange: (scenario: ScenarioId) => void
}

export function FloatingActionMenu({
  activeScenario,
  onScenarioChange,
}: FloatingActionMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const selected = SCENARIOS.find((item) => item.id === activeScenario)!
  const SelectedIcon = ICONS[activeScenario]

  function openBuilder() {
    onScenarioChange('custom')
    navigate('/console')
    setOpen(false)
  }

  return (
    <div className="floating-actions" ref={ref}>
      {open && (
        <div className="floating-menu">
          <div className="floating-menu-head">
            <span>Switch enterprise scenario</span>
            <small>Content and context update instantly</small>
          </div>
          <div className="scenario-list">
            {SCENARIOS.map((scenario) => {
              const Icon = ICONS[scenario.id]
              return (
                <button
                  key={scenario.id}
                  className={scenario.id === activeScenario ? 'selected' : ''}
                  onClick={() => {
                    onScenarioChange(scenario.id)
                    setOpen(false)
                  }}
                >
                  <span className="scenario-icon">
                    <Icon size={16} />
                  </span>
                  <span>
                    <strong>{scenario.shortName}</strong>
                    <small>{scenario.description}</small>
                  </span>
                  {scenario.id === activeScenario && <Check size={15} />}
                </button>
              )
            })}
          </div>
          <div className="floating-menu-custom">
            <button onClick={openBuilder}>
              <Plus size={15} />
              Add custom action
            </button>
            <button onClick={openBuilder}>
              <Database size={15} />
              Connect database
            </button>
            <button onClick={openBuilder}>
              <WandSparkles size={15} />
              Build new interface
            </button>
          </div>
        </div>
      )}

      <button
        className="floating-trigger"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="floating-trigger-icon">
          {open ? <Sparkles size={17} /> : <SelectedIcon size={17} />}
        </span>
        <span>
          <small>Scenario</small>
          <strong>{selected.shortName}</strong>
        </span>
        <ChevronUp className={open ? '' : 'closed'} size={16} />
      </button>
    </div>
  )
}
