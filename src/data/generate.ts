import type { Scenario } from './scenarios'
import { SCENARIOS } from './scenarios'
import type {
  Artifact,
  ChatMessage,
  HomeSlot,
  ScenarioId,
  WorkflowStep,
} from '../types'

const SLOT_COUNT = 6

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

interface BuildContext {
  scenario: Scenario
  prompt: string
  datasetIds: string[]
  workflowId?: string
  /** Stable ids produce reusable presets; random ids produce fresh console output. */
  idFor: (kind: string) => string
}

function datasetNames(scenario: Scenario, datasetIds: string[]) {
  return datasetIds.map(
    (id) =>
      scenario.consoleDatasets.find((dataset) => dataset.id === id)?.name ?? id,
  )
}

function workflowName(scenario: Scenario, workflowId?: string) {
  if (!workflowId) return undefined
  return scenario.consoleWorkflows.find((flow) => flow.id === workflowId)?.name
}

function stepsFor(scenario: Scenario, workflowId?: string): WorkflowStep[] {
  const flow =
    scenario.consoleWorkflows.find((item) => item.id === workflowId) ??
    scenario.consoleWorkflows[0]

  const sources = scenario.consoleDatasets
    .slice(0, 2)
    .map((dataset) => dataset.name)
    .join(' + ')

  return [
    { label: `Resolve intent to ${flow?.name ?? 'workspace review'}`, status: 'done' },
    { label: `Load ${sources || 'connected sources'}`, status: 'done' },
    { label: 'Segment and rank the population', status: 'done' },
    { label: 'Draft owner assignments', status: 'running' },
    { label: 'Publish to workspace', status: 'pending' },
  ]
}

function subtitleFor(scenario: Scenario, ctx: BuildContext) {
  const names = datasetNames(scenario, ctx.datasetIds)
  if (names.length) return `From ${names.join(', ')}`
  return `${scenario.shortName} · ${scenario.consoleDatasets.length} sources connected`
}

function metricsArtifact(ctx: BuildContext): Artifact {
  const { scenario } = ctx
  return {
    id: ctx.idFor('metrics'),
    title: `${scenario.shortName} health`,
    subtitle: subtitleFor(scenario, ctx),
    kind: 'metrics',
    createdAt: new Date().toISOString(),
    sourcePrompt: ctx.prompt,
    datasets: ctx.datasetIds,
    workflow: workflowName(scenario, ctx.workflowId),
    payload: { metrics: scenario.metrics },
  }
}

function chartArtifact(ctx: BuildContext): Artifact {
  const { scenario } = ctx
  return {
    id: ctx.idFor('chart'),
    title: scenario.seriesLabel,
    subtitle: subtitleFor(scenario, ctx),
    kind: 'chart',
    createdAt: new Date().toISOString(),
    sourcePrompt: ctx.prompt,
    datasets: ctx.datasetIds,
    workflow: workflowName(scenario, ctx.workflowId),
    payload: { chart: scenario.series },
  }
}

function tableArtifact(ctx: BuildContext): Artifact {
  const { scenario } = ctx
  return {
    id: ctx.idFor('table'),
    title: scenario.tableLabel,
    subtitle: subtitleFor(scenario, ctx),
    kind: 'table',
    createdAt: new Date().toISOString(),
    sourcePrompt: ctx.prompt,
    datasets: ctx.datasetIds,
    workflow: workflowName(scenario, ctx.workflowId),
    payload: { table: scenario.table },
  }
}

function workflowArtifact(ctx: BuildContext): Artifact {
  const { scenario } = ctx
  const name = workflowName(scenario, ctx.workflowId)
  return {
    id: ctx.idFor('workflow'),
    title: name ? `${name} run` : 'Workflow run',
    subtitle: 'Live execution trace',
    kind: 'workflow',
    createdAt: new Date().toISOString(),
    sourcePrompt: ctx.prompt,
    datasets: ctx.datasetIds,
    workflow: name,
    payload: { workflowSteps: stepsFor(scenario, ctx.workflowId) },
  }
}

function actionsArtifact(ctx: BuildContext): Artifact {
  const { scenario } = ctx
  return {
    id: ctx.idFor('actions'),
    title: 'Recommended actions',
    subtitle: `${scenario.actions.length} owners assigned`,
    kind: 'actions',
    createdAt: new Date().toISOString(),
    sourcePrompt: ctx.prompt,
    datasets: ctx.datasetIds,
    workflow: workflowName(scenario, ctx.workflowId),
    payload: { actions: scenario.actions },
  }
}

function insightArtifact(ctx: BuildContext): Artifact {
  const { scenario } = ctx
  return {
    id: ctx.idFor('insight'),
    title: 'What this means',
    subtitle: 'Narrative summary',
    kind: 'insight',
    createdAt: new Date().toISOString(),
    sourcePrompt: ctx.prompt,
    datasets: ctx.datasetIds,
    workflow: workflowName(scenario, ctx.workflowId),
    payload: { insight: scenario.insight },
  }
}

export function runStepLabels(scenario: Scenario, workflowId?: string): string[] {
  return stepsFor(scenario, workflowId).map((step) => step.label)
}

/** Four reusable cards per industry, pinned to the workspace by default. */
export function scenarioPresets(scenario: Scenario): Artifact[] {
  const ctx: BuildContext = {
    scenario,
    prompt: scenario.prompt,
    datasetIds: [],
    workflowId: scenario.consoleWorkflows[0]?.id,
    idFor: (kind) => `${scenario.id}-preset-${kind}`,
  }

  return [
    metricsArtifact(ctx),
    chartArtifact(ctx),
    tableArtifact(ctx),
    insightArtifact(ctx),
  ]
}

export function scenarioSlots(scenario: Scenario): HomeSlot[] {
  const presets = scenarioPresets(scenario)
  return Array.from({ length: SLOT_COUNT }, (_, index) => ({
    id: `slot-${index + 1}`,
    artifactId: presets[index]?.id ?? null,
  }))
}

export function emptySlots(): HomeSlot[] {
  return Array.from({ length: SLOT_COUNT }, (_, index) => ({
    id: `slot-${index + 1}`,
    artifactId: null,
  }))
}

export function allPresets(): Artifact[] {
  return SCENARIOS.flatMap((scenario) => scenarioPresets(scenario))
}

export function allSlots(): Record<ScenarioId, HomeSlot[]> {
  const map = {} as Record<ScenarioId, HomeSlot[]>
  SCENARIOS.forEach((scenario) => {
    map[scenario.id] = scenarioSlots(scenario)
  })
  map.custom = emptySlots()
  return map
}

/**
 * Picks the cards that answer the prompt. Intent keywords win; otherwise we
 * fall back to a full brief so the console always returns something useful.
 */
function selectArtifacts(ctx: BuildContext): Artifact[] {
  const lower = ctx.prompt.toLowerCase()
  const has = (...words: string[]) => words.some((word) => lower.includes(word))

  const wantsTrend = has('trend', 'over time', 'chart', 'forecast', 'growth', 'daily')
  const wantsBreakdown = has('breakdown', 'cohort', 'segment', 'list', 'by ', 'top')
  const wantsActions = has('action', 'next step', 'assign', 'who', 'owner', 'triage')
  const wantsSummary = has('summary', 'brief', 'explain', 'why', 'overview')

  const artifacts: Artifact[] = []

  if (wantsTrend) artifacts.push(chartArtifact(ctx))
  if (wantsSummary) artifacts.push(metricsArtifact(ctx))
  // A summary still needs the underlying rows to stand on.
  if (wantsBreakdown || wantsSummary) artifacts.push(tableArtifact(ctx))

  if (artifacts.length === 0) {
    artifacts.push(metricsArtifact(ctx), tableArtifact(ctx))
  }

  if (ctx.workflowId) artifacts.push(workflowArtifact(ctx))
  if (wantsActions || ctx.workflowId) artifacts.push(actionsArtifact(ctx))

  artifacts.push(insightArtifact(ctx))
  return artifacts
}

export interface DemoCommand {
  text: string
  datasetIds: string[]
  workflowId?: string
}

/** The example command the dock types into the console for this industry. */
export function scenarioDemo(scenario: Scenario): DemoCommand {
  const flow = scenario.consoleWorkflows[0]
  const dataset = scenario.consoleDatasets[0]
  return {
    text: scenario.prompt,
    datasetIds: dataset ? [dataset.id] : [],
    workflowId: flow?.id,
  }
}

export function starterMessages(scenario: Scenario): ChatMessage[] {
  return [
    {
      id: 'starter-1',
      role: 'assistant',
      content: `You're in the ${scenario.name} workspace. Describe what you want to do — reference data with @, run a workflow with /. I'll return interactive cards you can pin to your workspace. Try: ${scenario.prompt}`,
      createdAt: new Date().toISOString(),
    },
  ]
}

export function buildReply(
  scenario: Scenario,
  prompt: string,
  datasetIds: string[],
  workflowId?: string,
  limit?: number,
): ChatMessage {
  const ctx: BuildContext = {
    scenario,
    prompt,
    datasetIds,
    workflowId,
    idFor: (kind) => uid(`${scenario.id}-${kind}`),
  }

  const selected = selectArtifacts(ctx)
  const artifacts =
    limit && limit > 0 ? selected.slice(0, limit) : selected
  const names = datasetNames(scenario, datasetIds)
  const flow = workflowName(scenario, workflowId)

  const parts: string[] = []
  parts.push(
    flow
      ? `Running ${flow} across your ${scenario.shortName} workspace.`
      : `Reading your intent against the ${scenario.shortName} workspace.`,
  )
  if (names.length) parts.push(`Referenced ${names.join(', ')}.`)
  parts.push(
    `I built ${artifacts.length} cards below — ${artifacts
      .map((artifact) => artifact.title.toLowerCase())
      .join(', ')}. Pin any of them to keep it as a permanent view.`,
  )

  return {
    id: uid('msg'),
    role: 'assistant',
    content: parts.join(' '),
    createdAt: new Date().toISOString(),
    artifacts,
  }
}
