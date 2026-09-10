import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
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
    isThinking,
    sendPrompt,
    saveArtifact,
    unsaveArtifact,
    assignArtifactToSlot,
    clearChat,
    setActiveScenario,
  } = useAppState()

  const savedIds = new Set(savedArtifacts.map((a) => a.id))

  return (
    <BrowserRouter>
      <Layout
        savedCount={savedArtifacts.length}
        activeScenario={activeScenario}
        onScenarioChange={setActiveScenario}
      >
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                slots={homeSlots}
                savedMap={savedMap}
                library={savedArtifacts}
                placedIds={placedIds}
                activeScenario={activeScenario}
                onAssign={assignArtifactToSlot}
              />
            }
          />
          <Route
            path="/saved"
            element={
              <SavedWorkPage
                artifacts={savedArtifacts}
                onUnsave={unsaveArtifact}
              />
            }
          />
          <Route
            path="/console"
            element={
              <ConsolePage
                messages={messages}
                isThinking={isThinking}
                savedIds={savedIds}
                onSend={sendPrompt}
                onSave={saveArtifact}
                onUnsave={unsaveArtifact}
                onClear={clearChat}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
