import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  allPresets,
  allSlots,
  buildReply,
  emptySlots,
  scenarioPresets,
  scenarioSlots,
  starterMessages,
} from '../data/generate'
import { getScenario } from '../data/scenarios'
import type {
  AppState,
  Artifact,
  ChatMessage,
  CustomProfile,
  ScenarioId,
} from '../types'

const STORAGE_KEY = 'intent-os-state-v5'

const DEFAULT_SCENARIO: ScenarioId = 'fintech'

function initialState(): AppState {
  return {
    messages: starterMessages(getScenario(DEFAULT_SCENARIO)),
    savedArtifacts: allPresets(),
    homeSlotsByScenario: allSlots(),
    activeScenario: DEFAULT_SCENARIO,
    customProfile: { name: '', datasets: [], actions: [] },
  }
}

function loadState(): AppState {
  const base = initialState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      ...base,
      ...parsed,
      homeSlotsByScenario: {
        ...base.homeSlotsByScenario,
        ...(parsed.homeSlotsByScenario ?? {}),
      },
    }
  } catch {
    return base
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [isThinking, setIsThinking] = useState(false)

  // sendPrompt resolves artifacts after a delay, so it needs the latest scenario.
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const savedMap = useMemo(() => {
    const map = new Map<string, Artifact>()
    state.savedArtifacts.forEach((artifact) => map.set(artifact.id, artifact))
    return map
  }, [state.savedArtifacts])

  const homeSlots = useMemo(
    () => state.homeSlotsByScenario[state.activeScenario] ?? emptySlots(),
    [state.homeSlotsByScenario, state.activeScenario],
  )

  const sendPrompt = useCallback(
    (
      prompt: string,
      datasets: string[],
      workflow?: string,
      options?: { limit?: number },
    ) => {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: prompt,
        createdAt: new Date().toISOString(),
        datasets,
        workflow,
      }

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }))
      setIsThinking(true)

      window.setTimeout(() => {
        const { activeScenario, customProfile } = stateRef.current
        const scenario = getScenario(activeScenario, customProfile)
        const assistant = buildReply(
          scenario,
          prompt,
          datasets,
          workflow,
          options?.limit,
        )
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistant],
        }))
        setIsThinking(false)
      }, 2400)
    },
    [],
  )

  const saveArtifact = useCallback((artifact: Artifact) => {
    setState((prev) => {
      if (prev.savedArtifacts.some((a) => a.id === artifact.id)) return prev
      return { ...prev, savedArtifacts: [...prev.savedArtifacts, artifact] }
    })
  }, [])

  const unsaveArtifact = useCallback((artifactId: string) => {
    setState((prev) => {
      const slots = { ...prev.homeSlotsByScenario }
      ;(Object.keys(slots) as ScenarioId[]).forEach((key) => {
        slots[key] = slots[key].map((slot) =>
          slot.artifactId === artifactId ? { ...slot, artifactId: null } : slot,
        )
      })
      return {
        ...prev,
        savedArtifacts: prev.savedArtifacts.filter((a) => a.id !== artifactId),
        homeSlotsByScenario: slots,
      }
    })
  }, [])

  const assignArtifactToSlot = useCallback(
    (slotId: string, artifactId: string | null) => {
      setState((prev) => {
        const current =
          prev.homeSlotsByScenario[prev.activeScenario] ?? emptySlots()
        const next = current.map((slot) => {
          if (slot.id === slotId) return { ...slot, artifactId }
          // An artifact lives in one slot at a time, so moving it clears the old one.
          if (artifactId && slot.artifactId === artifactId) {
            return { ...slot, artifactId: null }
          }
          return slot
        })
        return {
          ...prev,
          homeSlotsByScenario: {
            ...prev.homeSlotsByScenario,
            [prev.activeScenario]: next,
          },
        }
      })
    },
    [],
  )

  const setActiveScenario = useCallback((activeScenario: ScenarioId) => {
    setState((prev) => ({
      ...prev,
      activeScenario,
      messages: starterMessages(getScenario(activeScenario, prev.customProfile)),
    }))
  }, [])

  const saveCustomProfile = useCallback((customProfile: CustomProfile) => {
    setState((prev) => {
      const scenario = getScenario('custom', customProfile)
      const presets = scenarioPresets(scenario)
      const presetIds = new Set(presets.map((preset) => preset.id))

      return {
        ...prev,
        activeScenario: 'custom',
        customProfile,
        messages: starterMessages(scenario),
        savedArtifacts: [
          ...prev.savedArtifacts.filter(
            (artifact) => !presetIds.has(artifact.id),
          ),
          ...presets,
        ],
        homeSlotsByScenario: {
          ...prev.homeSlotsByScenario,
          custom: scenarioSlots(scenario),
        },
      }
    })
  }, [])

  const placedIds = useMemo(
    () =>
      new Set(
        homeSlots
          .map((slot) => slot.artifactId)
          .filter((id): id is string => Boolean(id)),
      ),
    [homeSlots],
  )

  return {
    messages: state.messages,
    savedArtifacts: state.savedArtifacts,
    homeSlots,
    savedMap,
    placedIds,
    activeScenario: state.activeScenario,
    customProfile: state.customProfile,
    isThinking,
    sendPrompt,
    saveArtifact,
    unsaveArtifact,
    assignArtifactToSlot,
    setActiveScenario,
    saveCustomProfile,
  }
}
