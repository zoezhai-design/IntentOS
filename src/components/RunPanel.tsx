import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

interface RunPanelProps {
  title: string
  steps: string[]
  /** Milliseconds each step stays in the running state. */
  cadence?: number
}

/** Live task checklist shown while the agent assembles artifacts. */
export function RunPanel({ title, steps, cadence = 460 }: RunPanelProps) {
  const [done, setDone] = useState(0)

  useEffect(() => {
    setDone(0)
    const timer = window.setInterval(() => {
      setDone((prev) => (prev >= steps.length ? prev : prev + 1))
    }, cadence)
    return () => window.clearInterval(timer)
  }, [steps, cadence])

  return (
    <div className="run-panel">
      <div className="run-panel-head">
        <strong>{title}</strong>
        <span>
          {Math.min(done, steps.length)} / {steps.length}
        </span>
      </div>

      <ul className="run-steps">
        {steps.map((step, index) => {
          const state =
            index < done ? 'done' : index === done ? 'running' : 'pending'
          return (
            <li key={step} className={`run-step ${state}`}>
              <span className="run-dot">
                {state === 'done' && <Check size={11} />}
              </span>
              {step}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
