import type { DatasetRef, WorkflowRef, Artifact, ChatMessage } from '../types'

export const DATASETS: DatasetRef[] = [
  {
    id: 'claims-q3',
    name: 'Claims Q3',
    description: 'Denial rates, payer mix, and recovery opportunity',
    category: 'Revenue',
  },
  {
    id: 'encounters',
    name: 'Encounters',
    description: 'Visit volume by site, specialty, and provider',
    category: 'Operations',
  },
  {
    id: 'ar-aging',
    name: 'AR Aging',
    description: 'Outstanding balances by aging bucket',
    category: 'Finance',
  },
  {
    id: 'staffing',
    name: 'Staffing Roster',
    description: 'FTEs, overtime, and coverage gaps',
    category: 'Workforce',
  },
  {
    id: 'patient-nps',
    name: 'Patient NPS',
    description: 'Satisfaction scores and comment themes',
    category: 'Experience',
  },
]

export const WORKFLOWS: WorkflowRef[] = [
  {
    id: 'denial-recovery',
    name: 'Denial Recovery',
    description: 'Surface recoverable denials and draft work queues',
    slash: 'denial-recovery',
  },
  {
    id: 'capacity-plan',
    name: 'Capacity Plan',
    description: 'Balance encounter demand against staffing supply',
    slash: 'capacity-plan',
  },
  {
    id: 'cash-forecast',
    name: 'Cash Forecast',
    description: 'Project collections from AR and payer trends',
    slash: 'cash-forecast',
  },
  {
    id: 'ops-brief',
    name: 'Ops Brief',
    description: 'Generate an executive morning brief',
    slash: 'ops-brief',
  },
]

export const STARTER_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Intent OS is ready. Describe what you want done — use @ to reference datasets and / to start workflows. I will return interactive artifacts you can pin to Home.',
    createdAt: new Date().toISOString(),
  },
]

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

const PRESET_TIME = '2026-01-01T00:00:00.000Z'

export const PRESET_ARTIFACTS: Artifact[] = [
  {
    id: 'preset-denial-board',
    title: 'Denial Recovery Board',
    subtitle: 'Recoverable opportunity across active payers',
    kind: 'metrics',
    createdAt: PRESET_TIME,
    sourcePrompt: 'Show recoverable denials from @Claims Q3',
    datasets: ['claims-q3'],
    workflow: 'denial-recovery',
    payload: {
      metrics: [
        { label: 'Recoverable', value: '$2.4M', delta: '+12%', trend: 'up' },
        { label: 'Open Denials', value: '1,842', delta: '-4%', trend: 'down' },
        { label: 'Win Rate', value: '68%', delta: '+3pts', trend: 'up' },
        { label: 'Avg Cycle', value: '11d', delta: '-2d', trend: 'down' },
      ],
    },
  },
  {
    id: 'preset-capacity-heatmap',
    title: 'Capacity Heatmap',
    subtitle: 'Encounter demand vs available staffing',
    kind: 'chart',
    createdAt: PRESET_TIME,
    sourcePrompt: 'Compare @Encounters against @Staffing Roster this week',
    datasets: ['encounters', 'staffing'],
    workflow: 'capacity-plan',
    payload: {
      chart: [
        { label: 'Mon', value: 78 },
        { label: 'Tue', value: 92 },
        { label: 'Wed', value: 86 },
        { label: 'Thu', value: 97 },
        { label: 'Fri', value: 88 },
        { label: 'Sat', value: 54 },
      ],
      insight: 'Thursday runs at 97% of capacity — the only day without slack.',
    },
  },
  {
    id: 'preset-denial-cohorts',
    title: 'Top Denial Cohorts',
    subtitle: 'Prioritized by dollars and appealability',
    kind: 'table',
    createdAt: PRESET_TIME,
    sourcePrompt: 'Rank denial cohorts in @Claims Q3',
    datasets: ['claims-q3'],
    workflow: 'denial-recovery',
    payload: {
      table: {
        columns: ['Cohort', 'Claims', 'Dollars', 'Appealability'],
        rows: [
          ['Auth missing — Ortho', '214', '$612k', 'High'],
          ['Coding mismatch — ED', '186', '$448k', 'Medium'],
          ['Timely filing — Payer X', '97', '$291k', 'High'],
          ['Medical necessity — Imaging', '142', '$267k', 'Medium'],
        ],
      },
    },
  },
  {
    id: 'preset-cash-forecast',
    title: 'Cash Forecast',
    subtitle: 'Projected collections over the next six weeks',
    kind: 'chart',
    createdAt: PRESET_TIME,
    sourcePrompt: 'Forecast collections from @AR Aging',
    datasets: ['ar-aging'],
    workflow: 'cash-forecast',
    payload: {
      chart: [
        { label: 'W1', value: 1.2 },
        { label: 'W2', value: 1.5 },
        { label: 'W3', value: 1.35 },
        { label: 'W4', value: 1.8 },
        { label: 'W5', value: 1.65 },
        { label: 'W6', value: 2.1 },
      ],
      insight:
        'Collections accelerate in W4–W6 if 90+ AR work queues stay fully staffed.',
    },
  },
  {
    id: 'preset-recovery-workflow',
    title: 'Recovery Workflow',
    subtitle: 'Standing automation across the denial pipeline',
    kind: 'workflow',
    createdAt: PRESET_TIME,
    sourcePrompt: 'Run the denial recovery pipeline',
    datasets: ['claims-q3'],
    workflow: 'denial-recovery',
    payload: {
      workflowSteps: [
        { label: 'Ingest @Claims Q3 denials', status: 'done' },
        { label: 'Score appeal probability', status: 'done' },
        { label: 'Build work queues by team', status: 'running' },
        { label: 'Draft appeal letters', status: 'pending' },
        { label: 'Push to RCM workspace', status: 'pending' },
      ],
    },
  },
  {
    id: 'preset-coverage-actions',
    title: 'Coverage Actions',
    subtitle: 'Recommended staffing moves for the week',
    kind: 'actions',
    createdAt: PRESET_TIME,
    sourcePrompt: 'What staffing moves should we make?',
    datasets: ['encounters', 'staffing'],
    workflow: 'capacity-plan',
    payload: {
      actions: [
        {
          title: 'Float 2 RNs to North Clinic Thu AM',
          owner: 'Ops Lead',
          priority: 'high',
          due: 'Thu 07:00',
        },
        {
          title: 'Open 1 overflow slot Wed PM',
          owner: 'Scheduler',
          priority: 'medium',
          due: 'Wed 12:00',
        },
        {
          title: 'Approve OT for imaging techs',
          owner: 'Director',
          priority: 'high',
          due: 'Today',
        },
      ],
    },
  },
  {
    id: 'preset-ar-aging',
    title: 'AR Aging Snapshot',
    subtitle: 'Outstanding balances by aging bucket',
    kind: 'metrics',
    createdAt: PRESET_TIME,
    sourcePrompt: 'Break down @AR Aging by bucket',
    datasets: ['ar-aging'],
    workflow: 'cash-forecast',
    payload: {
      metrics: [
        { label: '0–30', value: '$4.1M', trend: 'flat' },
        { label: '31–60', value: '$2.7M', delta: '-6%', trend: 'down' },
        { label: '61–90', value: '$1.9M', delta: '+2%', trend: 'up' },
        { label: '90+', value: '$3.3M', delta: '-9%', trend: 'down' },
      ],
    },
  },
  {
    id: 'preset-ops-brief',
    title: 'Morning Ops Brief',
    subtitle: 'Executive summary assembled overnight',
    kind: 'insight',
    createdAt: PRESET_TIME,
    sourcePrompt: 'Give me the morning brief',
    datasets: ['encounters', 'claims-q3'],
    workflow: 'ops-brief',
    payload: {
      insight:
        'Encounter volume is up 8% week over week while denial recoveries lag behind. Thursday is the tightest staffing day, and $612k of Ortho auth-missing denials remain unworked.',
    },
  },
]

const PRESET_SLOT_ORDER = [
  'preset-denial-board',
  'preset-capacity-heatmap',
  'preset-denial-cohorts',
  'preset-ops-brief',
]

export function createDefaultHomeSlots() {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `slot-${i + 1}`,
    artifactId: PRESET_SLOT_ORDER[i] ?? null,
  }))
}

export function generateArtifacts(prompt: string, datasets: string[], workflow?: string): Artifact[] {
  const lower = prompt.toLowerCase()
  const now = new Date().toISOString()
  const artifacts: Artifact[] = []

  const wantsDenial =
    lower.includes('denial') ||
    workflow === 'denial-recovery' ||
    datasets.includes('claims-q3')
  const wantsCapacity =
    lower.includes('capacity') ||
    lower.includes('staff') ||
    workflow === 'capacity-plan' ||
    datasets.includes('staffing') ||
    datasets.includes('encounters')
  const wantsCash =
    lower.includes('cash') ||
    lower.includes('forecast') ||
    lower.includes('aging') ||
    workflow === 'cash-forecast' ||
    datasets.includes('ar-aging')
  const wantsBrief =
    lower.includes('brief') ||
    lower.includes('overview') ||
    workflow === 'ops-brief'

  if (wantsDenial || (!wantsCapacity && !wantsCash && !wantsBrief)) {
    artifacts.push({
      id: uid('art'),
      title: 'Denial Recovery Board',
      subtitle: 'Recoverable opportunity from referenced claims data',
      kind: 'metrics',
      createdAt: now,
      sourcePrompt: prompt,
      datasets: datasets.length ? datasets : ['claims-q3'],
      workflow: workflow ?? 'denial-recovery',
      payload: {
        metrics: [
          { label: 'Recoverable', value: '$2.4M', delta: '+12%', trend: 'up' },
          { label: 'Open Denials', value: '1,842', delta: '-4%', trend: 'down' },
          { label: 'Win Rate', value: '68%', delta: '+3pts', trend: 'up' },
          { label: 'Avg Cycle', value: '11d', delta: '-2d', trend: 'down' },
        ],
      },
    })

    artifacts.push({
      id: uid('art'),
      title: 'Top Denial Cohorts',
      subtitle: 'Prioritized by dollars and appealability',
      kind: 'table',
      createdAt: now,
      sourcePrompt: prompt,
      datasets: datasets.length ? datasets : ['claims-q3'],
      workflow: workflow ?? 'denial-recovery',
      payload: {
        table: {
          columns: ['Cohort', 'Claims', 'Dollars', 'Appealability'],
          rows: [
            ['Auth missing — Ortho', '214', '$612k', 'High'],
            ['Coding mismatch — ED', '186', '$448k', 'Medium'],
            ['Timely filing — Payer X', '97', '$291k', 'High'],
            ['Medical necessity — Imaging', '142', '$267k', 'Medium'],
          ],
        },
      },
    })

    artifacts.push({
      id: uid('art'),
      title: 'Recovery Workflow',
      subtitle: 'Automated steps initiated from your intent',
      kind: 'workflow',
      createdAt: now,
      sourcePrompt: prompt,
      datasets: datasets.length ? datasets : ['claims-q3'],
      workflow: workflow ?? 'denial-recovery',
      payload: {
        workflowSteps: [
          { label: 'Ingest @Claims Q3 denials', status: 'done' },
          { label: 'Score appeal probability', status: 'done' },
          { label: 'Build work queues by team', status: 'running' },
          { label: 'Draft appeal letters', status: 'pending' },
          { label: 'Push to RCM workspace', status: 'pending' },
        ],
      },
    })
  }

  if (wantsCapacity) {
    artifacts.push({
      id: uid('art'),
      title: 'Capacity Heatmap',
      subtitle: 'Encounter demand vs available staffing',
      kind: 'chart',
      createdAt: now,
      sourcePrompt: prompt,
      datasets: datasets.filter(Boolean).length
        ? datasets
        : ['encounters', 'staffing'],
      workflow: workflow ?? 'capacity-plan',
      payload: {
        chart: [
          { label: 'Mon', value: 78 },
          { label: 'Tue', value: 92 },
          { label: 'Wed', value: 86 },
          { label: 'Thu', value: 97 },
          { label: 'Fri', value: 88 },
          { label: 'Sat', value: 54 },
        ],
      },
    })

    artifacts.push({
      id: uid('art'),
      title: 'Coverage Actions',
      subtitle: 'Recommended staffing moves for the week',
      kind: 'actions',
      createdAt: now,
      sourcePrompt: prompt,
      datasets: datasets.filter(Boolean).length
        ? datasets
        : ['encounters', 'staffing'],
      workflow: workflow ?? 'capacity-plan',
      payload: {
        actions: [
          {
            title: 'Float 2 RNs to North Clinic Thu AM',
            owner: 'Ops Lead',
            priority: 'high',
            due: 'Thu 07:00',
          },
          {
            title: 'Open 1 overflow slot Wed PM',
            owner: 'Scheduler',
            priority: 'medium',
            due: 'Wed 12:00',
          },
          {
            title: 'Approve OT for imaging techs',
            owner: 'Director',
            priority: 'high',
            due: 'Today',
          },
        ],
      },
    })
  }

  if (wantsCash) {
    artifacts.push({
      id: uid('art'),
      title: 'Cash Forecast',
      subtitle: 'Projected collections next 6 weeks',
      kind: 'chart',
      createdAt: now,
      sourcePrompt: prompt,
      datasets: datasets.length ? datasets : ['ar-aging'],
      workflow: workflow ?? 'cash-forecast',
      payload: {
        chart: [
          { label: 'W1', value: 1.2 },
          { label: 'W2', value: 1.5 },
          { label: 'W3', value: 1.35 },
          { label: 'W4', value: 1.8 },
          { label: 'W5', value: 1.65 },
          { label: 'W6', value: 2.1 },
        ],
        insight:
          'Collections accelerate in W4–W6 if 90+ AR work queues stay fully staffed.',
      },
    })

    artifacts.push({
      id: uid('art'),
      title: 'AR Aging Snapshot',
      subtitle: 'Outstanding balances by bucket',
      kind: 'metrics',
      createdAt: now,
      sourcePrompt: prompt,
      datasets: datasets.length ? datasets : ['ar-aging'],
      workflow: workflow ?? 'cash-forecast',
      payload: {
        metrics: [
          { label: '0–30', value: '$4.1M', trend: 'flat' },
          { label: '31–60', value: '$2.7M', delta: '-6%', trend: 'down' },
          { label: '61–90', value: '$1.9M', delta: '+2%', trend: 'up' },
          { label: '90+', value: '$3.3M', delta: '-9%', trend: 'down' },
        ],
      },
    })
  }

  if (wantsBrief || artifacts.length === 0) {
    artifacts.push({
      id: uid('art'),
      title: 'Morning Ops Insight',
      subtitle: 'Synthesized from your intent and referenced data',
      kind: 'insight',
      createdAt: now,
      sourcePrompt: prompt,
      datasets: datasets.length ? datasets : ['encounters', 'claims-q3'],
      workflow: workflow ?? 'ops-brief',
      payload: {
        insight:
          'Encounter volume is up 8% WoW while denial recoveries lag behind. Pin a Denial Recovery Board and Capacity Heatmap to Home so teams act from the same live surface.',
      },
    })
  }

  return artifacts
}

export function buildAssistantReply(
  prompt: string,
  datasets: string[],
  workflow?: string,
): ChatMessage {
  const artifacts = generateArtifacts(prompt, datasets, workflow)
  const datasetNames = datasets
    .map((id) => DATASETS.find((d) => d.id === id)?.name ?? id)
    .join(', ')
  const workflowName = workflow
    ? WORKFLOWS.find((w) => w.id === workflow)?.name
    : undefined

  const parts = [
    'I interpreted your intent and assembled interactive artifacts to complete the workflow.',
  ]
  if (datasetNames) parts.push(`Referenced data: ${datasetNames}.`)
  if (workflowName) parts.push(`Started workflow: ${workflowName}.`)
  parts.push('Save any card to Home to turn it into a reusable app surface.')

  return {
    id: uid('msg'),
    role: 'assistant',
    content: parts.join(' '),
    createdAt: new Date().toISOString(),
    artifacts,
  }
}
