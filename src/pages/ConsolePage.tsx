import { Sparkles, User } from 'lucide-react'
import type { Artifact, ChatMessage } from '../types'
import { ArtifactCard } from '../components/ArtifactCard'
import { ConsoleInput } from '../components/ConsoleInput'

interface ConsolePageProps {
  messages: ChatMessage[]
  isThinking: boolean
  savedIds: Set<string>
  onSend: (prompt: string, datasets: string[], workflow?: string) => void
  onSave: (artifact: Artifact) => void
  onUnsave: (artifactId: string) => void
  onClear: () => void
}

export function ConsolePage({
  messages,
  isThinking,
  savedIds,
  onSend,
  onSave,
  onUnsave,
  onClear,
}: ConsolePageProps) {
  return (
    <div className="page-width console-page">
      <section className="hero">
        <h1>
          Console. <span className="dim">Say it. Get the interface.</span>
        </h1>
        <p className="sub">
          Reference data with @, start a workflow with /, and get back
          structured cards instead of paragraphs.
        </p>
        <div className="hero-actions">
          <button className="btn btn-secondary" onClick={onClear}>
            New session
          </button>
        </div>
      </section>

      <section className="console-stage">
        <div className="message-stream">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="avatar">
                {message.role === 'assistant' ? (
                  <Sparkles size={14} />
                ) : (
                  <User size={14} />
                )}
              </div>
              <div className="message-body">
                <p>{message.content}</p>
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
          ))}

          {isThinking && (
            <div className="message assistant">
              <div className="avatar">
                <Sparkles size={14} />
              </div>
              <div className="message-body">
                <div className="thinking-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <p>Assembling artifacts…</p>
              </div>
            </div>
          )}
        </div>

        <ConsoleInput disabled={isThinking} onSubmit={onSend} />
      </section>
    </div>
  )
}
