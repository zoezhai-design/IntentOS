export type ArtifactKind =
  | 'metrics'
  | 'table'
  | 'chart'
  | 'workflow'
  | 'actions'
  | 'insight'

export interface DatasetRef {
  id: string
  name: string
  description: string
  category: string
}

export interface WorkflowRef {
  id: string
  name: string
  description: string
  slash: string
}

export interface MetricItem {
  label: string
  value: string
  delta?: string
  trend?: 'up' | 'down' | 'flat'
}

export interface TableArtifact {
  columns: string[]
  rows: string[][]
}

export interface ChartPoint {
  label: string
  value: number
}

export interface WorkflowStep {
  label: string
  status: 'done' | 'running' | 'pending'
}

export interface ActionItem {
  title: string
  owner: string
  priority: 'high' | 'medium' | 'low'
  due: string
}

export interface ArtifactPayload {
  metrics?: MetricItem[]
  table?: TableArtifact
  chart?: ChartPoint[]
  workflowSteps?: WorkflowStep[]
  actions?: ActionItem[]
  insight?: string
}

export interface Artifact {
  id: string
  title: string
  subtitle: string
  kind: ArtifactKind
  createdAt: string
  sourcePrompt: string
  datasets: string[]
  workflow?: string
  payload: ArtifactPayload
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  artifacts?: Artifact[]
}

export interface HomeSlot {
  id: string
  artifactId: string | null
}

export type ScenarioId =
  | 'healthcare'
  | 'fintech'
  | 'trading'
  | 'creator'
  | 'custom'

export interface AppState {
  messages: ChatMessage[]
  savedArtifacts: Artifact[]
  homeSlots: HomeSlot[]
  activeScenario: ScenarioId
}
