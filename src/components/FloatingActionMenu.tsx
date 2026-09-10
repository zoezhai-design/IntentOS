import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  CircleDollarSign,
  Coins,
  HeartPulse,
  LineChart,
  Palette,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { SCENARIOS } from '../data/scenarios'
import type { CustomProfile, ScenarioId } from '../types'
import { CustomPanel } from './CustomPanel'

const ICONS = {
  fintech: CircleDollarSign,
  trading: LineChart,
  healthcare: HeartPulse,
  creator: Palette,
  crypto: Coins,
  custom: Building2,
}

const ORDER: ScenarioId[] = [
  'fintech',
  'trading',
  'healthcare',
  'creator',
  'crypto',
]

interface FloatingActionMenuProps {
  activeScenario: ScenarioId
  customProfile: CustomProfile
  onScenarioChange: (scenario: ScenarioId) => void
  onSaveCustomProfile: (profile: CustomProfile) => void
  onRunDemo: () => void
}

export function FloatingActionMenu({
  activeScenario,
  customProfile,
  onScenarioChange,
  onSaveCustomProfile,
  onRunDemo,
}: FloatingActionMenuProps) {
  const navigate = useNavigate()
  const [customizing, setCustomizing] = useState(false)

  function runDemo() {
    navigate('/')
    onRunDemo()
  }

  return (
    <>
      <div className="industry-dock">
        <div
          className="segmented"
          role="tablist"
          aria-label="Industry example interface"
        >
          {ORDER.map((id) => {
            const scenario = SCENARIOS.find((item) => item.id === id)!
            const Icon = ICONS[id]
            const selected = activeScenario === id
            return (
              <button
                key={id}
                role="tab"
                aria-selected={selected}
                className={selected ? 'selected' : ''}
                onClick={() => onScenarioChange(id)}
                title={scenario.name}
              >
                <Icon size={13} />
                <span>{scenario.shortName}</span>
              </button>
            )
          })}
          <button
            role="tab"
            aria-selected={activeScenario === 'custom'}
            className={activeScenario === 'custom' ? 'selected' : ''}
            onClick={() => setCustomizing(true)}
            title="Customize with your own data and actions"
          >
            <SlidersHorizontal size={13} />
            <span>{customProfile.name || 'Custom'}</span>
          </button>
        </div>

        <button className="ai-cta" onClick={runDemo}>
          <Sparkles size={15} />
          Run example
        </button>
      </div>

      <CustomPanel
        open={customizing}
        profile={customProfile}
        onClose={() => setCustomizing(false)}
        onSave={(profile) => {
          onSaveCustomProfile(profile)
          setCustomizing(false)
          navigate('/')
        }}
      />
    </>
  )
}
