import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  PRESET_ARTIFACTS,
  STARTER_MESSAGES,
  buildAssistantReply,
  createDefaultHomeSlots,
} from '../data/mockData'
import type { AppState, Artifact, ChatMessage, ScenarioId } from '../types'

const STORAGE_KEY = 'intent-os-state-v3'

function initialState(): AppState {
  return {
    messages: STARTER_MESSAGES,
    savedArtifacts: [...PRESET_ARTIFACTS],
    homeSlots: createDefaultHomeSlots(),
    activeScenario: 'healthcare',
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    return { ...initialState(), ...parsed }
  } catch {
    return initialState()
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [isThinking, setIsThinking] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const savedMap = useMemo(() => {
    const map = new Map<string, Artifact>()
    state.savedArtifacts.forEach((a) => map.set(a.id, a))
    return map
  }, [state.savedArtifacts])

  const sendPrompt = useCallback(
    (prompt: string, datasets: string[], workflow?: string) => {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: prompt,
        createdAt: new Date().toISOString(),
      }

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }))
      setIsThinking(true)

      window.setTimeout(() => {
        const assistant = buildAssistantReply(prompt, datasets, workflow)
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistant],
        }))
        setIsThinking(false)
      }, 900)
    },
    [],
  )

  const saveArtifact = useCallback((artifact: Artifact) => {
    setState((prev) => {
      if (prev.savedArtifacts.some((a) => a.id === artifact.id)) return prev
      return {
        ...prev,
        savedArtifacts: [...prev.savedArtifacts, artifact],
      }
    })
  }, [])

  const unsaveArtifact = useCallback((artifactId: string) => {
    setState((prev) => ({
      ...prev,
      savedArtifacts: prev.savedArtifacts.filter((a) => a.id !== artifactId),
      homeSlots: prev.homeSlots.map((slot) =>
        slot.artifactId === artifactId ? { ...slot, artifactId: null } : slot,
      ),
    }))
  }, [])

  const assignArtifactToSlot = useCallback(
    (slotId: string, artifactId: string | null) => {
      setState((prev) => ({
        ...prev,
        homeSlots: prev.homeSlots.map((slot) => {
          if (slot.id === slotId) return { ...slot, artifactId }
          // An artifact lives in one slot at a time, so moving it clears the old one.
          if (artifactId && slot.artifactId === artifactId) {
            return { ...slot, artifactId: null }
          }
          return slot
        }),
      }))
    },
    [],
  )

  const clearChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: STARTER_MESSAGES,
    }))
  }, [])

  const setActiveScenario = useCallback((activeScenario: ScenarioId) => {
    setState((prev) => ({ ...prev, activeScenario }))
  }, [])

  const placedIds = useMemo(
    () =>
      new Set(
        state.homeSlots
          .map((s) => s.artifactId)
          .filter((id): id is string => Boolean(id)),
      ),
    [state.homeSlots],
  )

  return {
    messages: state.messages,
    savedArtifacts: state.savedArtifacts,
    homeSlots: state.homeSlots,
    savedMap,
    placedIds,
    activeScenario: state.activeScenario,
    isThinking,
    sendPrompt,
    saveArtifact,
    unsaveArtifact,
    assignArtifactToSlot,
    clearChat,
    setActiveScenario,
  }
}
