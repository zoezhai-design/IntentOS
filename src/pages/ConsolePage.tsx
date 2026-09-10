import { Link } from 'react-router-dom'
import { Database, Slash } from 'lucide-react'
import { getScenario } from '../data/scenarios'
import { runStepLabels } from '../data/generate'
import type { Artifact, ChatMessage, CustomProfile, ScenarioId } from '../types'
import { AgentLogo } from '../components/AgentLogo'
import { ArtifactCard } from '../components/ArtifactCard'
import type { DemoRun, SubmitOptions } from '../components/ConsoleInput'
import { ConsoleInput } from '../components/ConsoleInput'
import { RunPanel } from '../components/RunPanel'

interface ConsolePageProps {
  messages: ChatMessage[]
  isThinking: boolean
  savedIds: Set<string>
  activeScenario: ScenarioId
  customProfile: CustomProfile
  demo?: DemoRun | null
  onDemoDone?: () => void
  onSend: (
    prompt: string,
    datasets: string[],
    workflow?: string,
    options?: SubmitOptions,
  ) => void
  onSave: (artifact: Artifact) => void
  onUnsave: (artifactId: string) => void
}

export function ConsolePage({
  messages,
  isThinking,
  savedIds,
  activeScenario,
  customProfile,
  demo,
  onDemoDone,
  onSend,
  onSave,
  onUnsave,
}: ConsolePageProps) {
  const scenario = getScenario(activeScenario, customProfile)

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const runWorkflow = scenario.consoleWorkflows.find(
    (flow) => flow.id === lastUser?.workflow,
  )

  return (
    <div className="page-width console-page">
      <section className="hero">
        <h1>
          Console. <span className="dim">Say it. Get the interface.</span>
        </h1>
        <p className="sub">
          Reference data with <code className="token-data">@</code>, run an
          action with <code className="token-action">/</code>, and get back
          structured cards instead of paragraphs.
        </p>
      </section>

      <section className="agent-shell">
        <header className="agent-head">
          <div className="agent-id">
            <AgentLogo size={20} active={isThinking} />
            <strong>{scenario.shortName} Agent</strong>
          </div>
          {isThinking && (
            <span className="agent-status">
              {runWorkflow ? `Running ${runWorkflow.name}` : 'Generating'}
            </span>
          )}
        </header>

        <div className="agent-body">
          {messages.map((message) => {
            const chips = (message.datasets ?? [])
              .map((id) =>
                scenario.consoleDatasets.find((dataset) => dataset.id === id),
              )
              .filter(Boolean)
            const flow = scenario.consoleWorkflows.find(
              (item) => item.id === message.workflow,
            )

            return (
              <div key={message.id} className={`turn ${message.role}`}>
                {message.role === 'assistant' && (
                  <div className="turn-avatar">
                    <AgentLogo size={20} />
                  </div>
                )}

                <div className="turn-body">
                  {(flow || chips.length > 0) && (
                    <div className="turn-chips">
                      {flow && (
                        <span className="attach-chip is-workflow">
                          <Slash size={11} /> {flow.slash}
                        </span>
                      )}
                      {chips.map((dataset) => (
                        <span key={dataset!.id} className="attach-chip">
                          <Database size={11} /> {dataset!.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="turn-text">{message.content}</p>

                  {message.artifacts && message.artifacts.length > 0 && (
                    <div className="artifact-stack">
                      {message.artifacts.map((artifact) => (
                        <ArtifactCard
                          key={artifact.id}
                          artifact={artifact}
                          saved={savedIds.has(artifact.id)}
                          onSave={onSave}
                          onUnsave={
                            savedIds.has(artifact.id) ? onUnsave : undefined
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {isThinking && (
            <div className="turn assistant">
              <div className="turn-avatar">
                <AgentLogo size={20} active />
              </div>
              <div className="turn-body">
                <RunPanel
                  title={runWorkflow?.name ?? 'Interpreting intent'}
                  steps={runStepLabels(scenario, lastUser?.workflow)}
                />
              </div>
            </div>
          )}
        </div>

        <ConsoleInput
          disabled={isThinking}
          datasets={scenario.consoleDatasets}
          workflows={scenario.consoleWorkflows}
          placeholder={`Try ${scenario.prompt}`}
          agentLabel="Intent 1.0"
          demo={demo}
          onDemoDone={onDemoDone}
          onSubmit={onSend}
        />
      </section>

      <p className="console-foot">
        Saved cards live in your <Link to="/library">Library</Link> and can be
        pinned to the <Link to="/workspace">Workspace</Link>.
      </p>
    </div>
  )
}
