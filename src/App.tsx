import { useCallback, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { DemoRun } from './components/ConsoleInput'
import { Layout } from './components/Layout'
import { scenarioDemo } from './data/generate'
import { getScenario } from './data/scenarios'
import { useAppState } from './hooks/useAppState'
import { ConsolePage } from './pages/ConsolePage'
import { HomePage } from './pages/HomePage'
import { SavedWorkPage } from './pages/SavedWorkPage'
import './index.css'

export default function App() {
  const {
    messages,
    savedArtifacts,
    homeSlots,
    savedMap,
    placedIds,
    activeScenario,
    customProfile,
    isThinking,
    sendPrompt,
    saveArtifact,
    unsaveArtifact,
    assignArtifactToSlot,
    setActiveScenario,
    saveCustomProfile,
  } = useAppState()

  const savedIds = new Set(savedArtifacts.map((artifact) => artifact.id))

  // Typing simulation for the "Run example" button in the dock.
  const [demo, setDemo] = useState<DemoRun | null>(null)
  const runDemo = useCallback(() => {
    const { text, datasetIds, workflowId } = scenarioDemo(
      getScenario(activeScenario, customProfile),
    )
    setDemo({ text, datasets: datasetIds, workflow: workflowId, token: Date.now() })
  }, [activeScenario, customProfile])

  return (
    <BrowserRouter>
      <Layout
        activeScenario={activeScenario}
        customProfile={customProfile}
        onScenarioChange={setActiveScenario}
        onSaveCustomProfile={saveCustomProfile}
        onRunDemo={runDemo}
      >
        <Routes>
          <Route
            path="/"
            element={
              <ConsolePage
                messages={messages}
                isThinking={isThinking}
                savedIds={savedIds}
                activeScenario={activeScenario}
                customProfile={customProfile}
                demo={demo}
                onDemoDone={() => setDemo(null)}
                onSend={sendPrompt}
                onSave={saveArtifact}
                onUnsave={unsaveArtifact}
              />
            }
          />
          <Route
            path="/workspace"
            element={
              <HomePage
                slots={homeSlots}
                savedMap={savedMap}
                library={savedArtifacts}
                placedIds={placedIds}
                activeScenario={activeScenario}
                customProfile={customProfile}
                onAssign={assignArtifactToSlot}
              />
            }
          />
          <Route
            path="/library"
            element={
              <SavedWorkPage
                artifacts={savedArtifacts}
                onUnsave={unsaveArtifact}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
