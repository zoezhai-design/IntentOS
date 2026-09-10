import type { ScenarioId } from '../types'

export interface Scenario {
  id: ScenarioId
  name: string
  shortName: string
  description: string
  status: string
  metrics: Array<{ label: string; value: string; delta: string }>
  workflows: Array<{ name: string; detail: string; status: string }>
  databases: Array<{ name: string; type: string; freshness: string }>
  prompt: string
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'healthcare',
    name: 'Healthcare Operations',
    shortName: 'Healthcare',
    description: 'Revenue cycle, clinical operations, staffing, and patient access.',
    status: '12 systems connected',
    metrics: [
      { label: 'Net collections', value: '$18.4M', delta: '+8.2%' },
      { label: 'Denial rate', value: '6.8%', delta: '-1.4 pts' },
      { label: 'Daily encounters', value: '1,284', delta: '+4.7%' },
      { label: 'Open actions', value: '38', delta: '9 urgent' },
    ],
    workflows: [
      { name: 'Denial recovery', detail: 'Claims Q3 → work queues', status: 'Running' },
      { name: 'Capacity planning', detail: 'Encounters + staffing', status: 'Ready' },
      { name: 'Morning ops brief', detail: 'Daily at 6:00 AM', status: 'Scheduled' },
    ],
    databases: [
      { name: 'Claims warehouse', type: 'Snowflake', freshness: '4m ago' },
      { name: 'Encounter feed', type: 'FHIR', freshness: 'Live' },
      { name: 'Staffing roster', type: 'Postgres', freshness: '12m ago' },
    ],
    prompt: '/ops-brief summarize today using @Encounters and @Claims Q3',
  },
  {
    id: 'fintech',
    name: 'Fintech Operations',
    shortName: 'Fintech',
    description: 'Payments, risk, compliance, treasury, and customer operations.',
    status: '9 systems connected',
    metrics: [
      { label: 'Payment volume', value: '$42.8M', delta: '+12.6%' },
      { label: 'Approval rate', value: '97.4%', delta: '+0.8 pts' },
      { label: 'Risk exposure', value: '$386K', delta: '-6.1%' },
      { label: 'Open reviews', value: '124', delta: '18 urgent' },
    ],
    workflows: [
      { name: 'Payment exception review', detail: 'Ledger → resolution queue', status: 'Running' },
      { name: 'AML investigation', detail: 'Risk signals + KYC', status: 'Ready' },
      { name: 'Treasury forecast', detail: 'Daily at 7:00 AM', status: 'Scheduled' },
    ],
    databases: [
      { name: 'Transaction ledger', type: 'BigQuery', freshness: 'Live' },
      { name: 'Risk events', type: 'Kafka', freshness: 'Live' },
      { name: 'Customer profiles', type: 'Postgres', freshness: '8m ago' },
    ],
    prompt: 'Review payment exceptions and prioritize high-risk accounts',
  },
  {
    id: 'trading',
    name: 'Trading Platform',
    shortName: 'Trading',
    description: 'Market intelligence, positions, risk limits, and trade operations.',
    status: '16 feeds connected',
    metrics: [
      { label: 'Portfolio value', value: '$284.6M', delta: '+2.1%' },
      { label: 'Day P&L', value: '+$1.84M', delta: '+0.65%' },
      { label: 'Value at risk', value: '$3.2M', delta: '-4.3%' },
      { label: 'Limit alerts', value: '7', delta: '2 critical' },
    ],
    workflows: [
      { name: 'Pre-trade risk', detail: 'Orders → exposure checks', status: 'Running' },
      { name: 'Position reconciliation', detail: 'Broker + internal books', status: 'Ready' },
      { name: 'Market open brief', detail: 'Weekdays at 8:30 AM', status: 'Scheduled' },
    ],
    databases: [
      { name: 'Market data', type: 'Streaming', freshness: 'Live' },
      { name: 'Position book', type: 'ClickHouse', freshness: '2s ago' },
      { name: 'Order history', type: 'Postgres', freshness: 'Live' },
    ],
    prompt: 'Show limit breaches and explain the largest P&L movements',
  },
  {
    id: 'creator',
    name: 'Creator Studio',
    shortName: 'Creator',
    description: 'Content generation, publishing, audience growth, and monetization.',
    status: '7 channels connected',
    metrics: [
      { label: 'Total reach', value: '8.4M', delta: '+18.2%' },
      { label: 'Engagement', value: '6.7%', delta: '+1.1 pts' },
      { label: 'Revenue', value: '$128K', delta: '+9.4%' },
      { label: 'Drafts ready', value: '14', delta: '6 approved' },
    ],
    workflows: [
      { name: 'Campaign generator', detail: 'Brief → channel assets', status: 'Running' },
      { name: 'Content repurposing', detail: 'Video → social clips', status: 'Ready' },
      { name: 'Audience report', detail: 'Mondays at 9:00 AM', status: 'Scheduled' },
    ],
    databases: [
      { name: 'Content library', type: 'S3', freshness: 'Live' },
      { name: 'Audience analytics', type: 'BigQuery', freshness: '16m ago' },
      { name: 'Brand assets', type: 'DAM', freshness: 'Live' },
    ],
    prompt: 'Create a campaign from the latest product brief for every channel',
  },
  {
    id: 'custom',
    name: 'Custom Enterprise',
    shortName: 'Custom',
    description: 'Build your own operating system from actions, data, and workflows.',
    status: 'Ready to configure',
    metrics: [
      { label: 'Connected data', value: '0', delta: 'Add source' },
      { label: 'Active workflows', value: '0', delta: 'Create one' },
      { label: 'Saved views', value: '0', delta: 'Build view' },
      { label: 'Team members', value: '1', delta: 'Invite team' },
    ],
    workflows: [
      { name: 'Create your first action', detail: 'Define an outcome and owner', status: 'Setup' },
      { name: 'Connect a database', detail: 'Bring your enterprise context', status: 'Setup' },
      { name: 'Build a recurring brief', detail: 'Choose schedule and audience', status: 'Setup' },
    ],
    databases: [
      { name: 'Add database', type: 'SQL / API', freshness: 'Not connected' },
      { name: 'Upload files', type: 'CSV / PDF', freshness: 'Not connected' },
      { name: 'Connect application', type: 'OAuth', freshness: 'Not connected' },
    ],
    prompt: 'Help me define a workflow for my team',
  },
]

export function getScenario(id: ScenarioId) {
  return SCENARIOS.find((scenario) => scenario.id === id) ?? SCENARIOS[0]
}
