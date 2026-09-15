import type {
  ActionItem,
  ChartPoint,
  CustomProfile,
  DatasetRef,
  MetricItem,
  ScenarioId,
  TableArtifact,
  WorkflowRef,
} from '../types'

export interface Scenario {
  id: ScenarioId
  name: string
  shortName: string
  description: string
  status: string
  metrics: MetricItem[]
  workflows: Array<{ name: string; detail: string; status: string }>
  databases: Array<{ name: string; type: string; freshness: string }>
  prompt: string
  /** Datasets offered by the @ menu in Console. */
  consoleDatasets: DatasetRef[]
  /** Workflows offered by the / menu in Console. */
  consoleWorkflows: WorkflowRef[]
  series: ChartPoint[]
  seriesLabel: string
  table: TableArtifact
  tableLabel: string
  actions: ActionItem[]
  insight: string
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'fintech',
    name: 'Fintech Operations',
    shortName: 'Fintech',
    description: 'Payments, risk, compliance, treasury, and customer operations.',
    status: '9 systems connected',
    metrics: [
      { label: 'Payment volume', value: '$42.8M', delta: '+12.6%', trend: 'up' },
      { label: 'Approval rate', value: '97.4%', delta: '+0.8 pts', trend: 'up' },
      { label: 'Risk exposure', value: '$386K', delta: '-6.1%', trend: 'down' },
      { label: 'Open reviews', value: '124', delta: '18 urgent', trend: 'flat' },
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
    prompt: '/exception-review triage failed payments in @Transaction Ledger',
    consoleDatasets: [
      { id: 'transaction-ledger', name: 'Transaction Ledger', description: 'Authorizations, settlements, and failures', category: 'Money movement' },
      { id: 'risk-events', name: 'Risk Events', description: 'Fraud signals and rule triggers', category: 'Risk & compliance' },
      { id: 'customer-profiles', name: 'Customer Profiles', description: 'KYC status, tenure, and segments', category: 'Customers' },
      { id: 'chargebacks', name: 'Chargebacks', description: 'Disputes by reason code and issuer', category: 'Risk & compliance' },
      { id: 'treasury-balances', name: 'Treasury Balances', description: 'Cash positions across partner banks', category: 'Money movement' },
    ],
    consoleWorkflows: [
      { id: 'exception-review', name: 'Exception Review', description: 'Triage failed payments into resolution queues', slash: 'exception-review', category: 'Operations' },
      { id: 'aml-investigation', name: 'AML Investigation', description: 'Build case files from risk signals and KYC', slash: 'aml-investigation', category: 'Risk & compliance' },
      { id: 'treasury-forecast', name: 'Treasury Forecast', description: 'Project balances and funding needs', slash: 'treasury-forecast', category: 'Finance' },
      { id: 'dispute-recovery', name: 'Dispute Recovery', description: 'Prioritize winnable chargebacks', slash: 'dispute-recovery', category: 'Operations' },
    ],
    series: [
      { label: 'Mon', value: 6.4 },
      { label: 'Tue', value: 7.1 },
      { label: 'Wed', value: 6.8 },
      { label: 'Thu', value: 8.2 },
      { label: 'Fri', value: 9.4 },
      { label: 'Sat', value: 4.9 },
    ],
    seriesLabel: 'Daily payment volume ($M)',
    tableLabel: 'Failed payment cohorts',
    table: {
      columns: ['Failure reason', 'Count', 'Value', 'Recoverable'],
      rows: [
        ['Insufficient funds', '412', '$1.24M', 'Retry'],
        ['Issuer decline', '286', '$862K', 'High'],
        ['Expired card', '174', '$418K', 'High'],
        ['Suspected fraud', '92', '$276K', 'Review'],
      ],
    },
    actions: [
      { title: 'Retry 412 insufficient-funds payments at payday', owner: 'Payments Ops', priority: 'high', due: 'Today 18:00' },
      { title: 'Escalate 92 fraud holds to risk analyst', owner: 'Risk Team', priority: 'high', due: 'Today' },
      { title: 'Request updated cards from 174 customers', owner: 'Lifecycle', priority: 'medium', due: 'Fri' },
    ],
    insight:
      'Failed payments concentrate in insufficient funds and issuer declines, which together hold $2.1M of recoverable volume. Scheduling retries around payday and refreshing expired cards addresses 78% of the value without touching fraud holds.',
  },
  {
    id: 'trading',
    name: 'Trading Platform',
    shortName: 'Trading',
    description: 'Market intelligence, positions, risk limits, and trade operations.',
    status: '16 feeds connected',
    metrics: [
      { label: 'Portfolio value', value: '$284.6M', delta: '+2.1%', trend: 'up' },
      { label: 'Day P&L', value: '+$1.84M', delta: '+0.65%', trend: 'up' },
      { label: 'Value at risk', value: '$3.2M', delta: '-4.3%', trend: 'down' },
      { label: 'Limit alerts', value: '7', delta: '2 critical', trend: 'flat' },
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
    prompt: '/risk-review explain limit breaches in @Position Book',
    consoleDatasets: [
      { id: 'position-book', name: 'Position Book', description: 'Live positions by desk and instrument', category: 'Positions' },
      { id: 'market-data', name: 'Market Data', description: 'Prices, spreads, and volatility surfaces', category: 'Market' },
      { id: 'order-flow', name: 'Order Flow', description: 'Fills, cancels, and execution quality', category: 'Positions' },
      { id: 'risk-limits', name: 'Risk Limits', description: 'Desk limits, utilization, and breaches', category: 'Risk & credit' },
      { id: 'counterparties', name: 'Counterparties', description: 'Exposure and settlement status', category: 'Risk & credit' },
    ],
    consoleWorkflows: [
      { id: 'risk-review', name: 'Risk Review', description: 'Surface limit breaches and exposure drivers', slash: 'risk-review', category: 'Risk' },
      { id: 'pnl-attribution', name: 'P&L Attribution', description: 'Explain gains and losses by driver', slash: 'pnl-attribution', category: 'Performance' },
      { id: 'position-recon', name: 'Position Recon', description: 'Reconcile broker and internal books', slash: 'position-recon', category: 'Operations' },
      { id: 'market-brief', name: 'Market Brief', description: 'Generate a pre-open desk briefing', slash: 'market-brief', category: 'Research' },
    ],
    series: [
      { label: '09:30', value: 0.4 },
      { label: '10:30', value: 0.9 },
      { label: '11:30', value: 0.7 },
      { label: '13:00', value: 1.3 },
      { label: '14:30', value: 1.6 },
      { label: '16:00', value: 1.84 },
    ],
    seriesLabel: 'Intraday P&L ($M)',
    tableLabel: 'Limit utilization by desk',
    table: {
      columns: ['Desk', 'Exposure', 'Limit used', 'Status'],
      rows: [
        ['Equities — US', '$92.4M', '87%', 'Warning'],
        ['Rates', '$68.1M', '64%', 'Normal'],
        ['FX', '$54.7M', '103%', 'Breach'],
        ['Commodities', '$31.2M', '41%', 'Normal'],
      ],
    },
    actions: [
      { title: 'Reduce FX exposure to clear 103% limit breach', owner: 'FX Desk Head', priority: 'high', due: 'Before close' },
      { title: 'Pre-clear US equities headroom for tomorrow', owner: 'Risk Manager', priority: 'medium', due: 'Today 17:00' },
      { title: 'Investigate 14:30 volatility spike attribution', owner: 'Quant Research', priority: 'low', due: 'Thu' },
    ],
    insight:
      'FX is the only desk over its limit at 103% utilization, and US equities is approaching the threshold at 87%. Day P&L is up $1.84M but most of the gain arrived after 13:00, so the risk was concentrated in the final three hours of trading.',
  },
  {
    id: 'healthcare',
    name: 'Healthcare Operations',
    shortName: 'Healthcare',
    description: 'Revenue cycle, clinical operations, staffing, and patient access.',
    status: '12 systems connected',
    metrics: [
      { label: 'Net collections', value: '$18.4M', delta: '+8.2%', trend: 'up' },
      { label: 'Denial rate', value: '6.8%', delta: '-1.4 pts', trend: 'down' },
      { label: 'Daily encounters', value: '1,284', delta: '+4.7%', trend: 'up' },
      { label: 'Open actions', value: '38', delta: '9 urgent', trend: 'flat' },
    ],
    workflows: [
      { name: 'Denial recovery', detail: 'Claims → work queues', status: 'Running' },
      { name: 'Capacity planning', detail: 'Encounters + staffing', status: 'Ready' },
      { name: 'Morning ops brief', detail: 'Daily at 6:00 AM', status: 'Scheduled' },
    ],
    databases: [
      { name: 'Claims warehouse', type: 'Snowflake', freshness: '4m ago' },
      { name: 'Encounter feed', type: 'FHIR', freshness: 'Live' },
      { name: 'Staffing roster', type: 'Postgres', freshness: '12m ago' },
    ],
    prompt: '/denial-recovery find recoverable claims in @Claims Q3',
    consoleDatasets: [
      { id: 'claims-q3', name: 'Claims Q3', description: 'Denial rates, payer mix, and recovery opportunity', category: 'Revenue cycle' },
      { id: 'encounters', name: 'Encounters', description: 'Visit volume by site, specialty, and provider', category: 'Operations' },
      { id: 'ar-aging', name: 'AR Aging', description: 'Outstanding balances by aging bucket', category: 'Revenue cycle' },
      { id: 'staffing', name: 'Staffing Roster', description: 'FTEs, overtime, and coverage gaps', category: 'Operations' },
      { id: 'patient-nps', name: 'Patient NPS', description: 'Satisfaction scores and comment themes', category: 'Experience' },
    ],
    consoleWorkflows: [
      { id: 'denial-recovery', name: 'Denial Recovery', description: 'Surface recoverable denials and draft work queues', slash: 'denial-recovery', category: 'Revenue cycle' },
      { id: 'capacity-plan', name: 'Capacity Plan', description: 'Balance encounter demand against staffing supply', slash: 'capacity-plan', category: 'Operations' },
      { id: 'cash-forecast', name: 'Cash Forecast', description: 'Project collections from AR and payer trends', slash: 'cash-forecast', category: 'Finance' },
      { id: 'ops-brief', name: 'Ops Brief', description: 'Generate an executive morning brief', slash: 'ops-brief', category: 'Operations' },
    ],
    series: [
      { label: 'Mon', value: 78 },
      { label: 'Tue', value: 92 },
      { label: 'Wed', value: 86 },
      { label: 'Thu', value: 97 },
      { label: 'Fri', value: 88 },
      { label: 'Sat', value: 54 },
    ],
    seriesLabel: 'Capacity utilization (%)',
    tableLabel: 'Top denial cohorts',
    table: {
      columns: ['Cohort', 'Claims', 'Dollars', 'Appealability'],
      rows: [
        ['Auth missing — Ortho', '214', '$612K', 'High'],
        ['Coding mismatch — ED', '186', '$448K', 'Medium'],
        ['Timely filing — Payer X', '97', '$291K', 'High'],
        ['Medical necessity — Imaging', '142', '$267K', 'Medium'],
      ],
    },
    actions: [
      { title: 'Appeal 214 Ortho auth-missing denials', owner: 'RCM Lead', priority: 'high', due: 'Fri' },
      { title: 'Float 2 RNs to North Clinic Thursday AM', owner: 'Ops Lead', priority: 'high', due: 'Thu 07:00' },
      { title: 'Retrain ED coders on mismatch patterns', owner: 'Coding Manager', priority: 'medium', due: 'Next week' },
    ],
    insight:
      'Ortho auth-missing denials are the single largest recoverable pool at $612K and carry high appealability. Thursday is the tightest staffing day at 97% utilization, so appeals work should be scheduled around it rather than on top of it.',
  },
  {
    id: 'creator',
    name: 'Creator Design Studio',
    shortName: 'Creator',
    description: 'Design generation, content production, publishing, and brand systems.',
    status: '7 channels connected',
    metrics: [
      { label: 'Total reach', value: '8.4M', delta: '+18.2%', trend: 'up' },
      { label: 'Engagement', value: '6.7%', delta: '+1.1 pts', trend: 'up' },
      { label: 'Revenue', value: '$128K', delta: '+9.4%', trend: 'up' },
      { label: 'Drafts ready', value: '14', delta: '6 approved', trend: 'flat' },
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
    prompt: '/campaign-build create launch assets from @Brand Assets',
    consoleDatasets: [
      { id: 'brand-assets', name: 'Brand Assets', description: 'Logos, type, color, and layout systems', category: 'Brand & content' },
      { id: 'content-library', name: 'Content Library', description: 'Published video, image, and copy archive', category: 'Brand & content' },
      { id: 'audience-analytics', name: 'Audience Analytics', description: 'Reach, retention, and demographics', category: 'Growth' },
      { id: 'campaign-briefs', name: 'Campaign Briefs', description: 'Active briefs, goals, and deadlines', category: 'Planning' },
      { id: 'monetization', name: 'Monetization', description: 'Sponsorships, RPM, and product revenue', category: 'Growth' },
    ],
    consoleWorkflows: [
      { id: 'campaign-build', name: 'Campaign Build', description: 'Turn a brief into per-channel assets', slash: 'campaign-build', category: 'Production' },
      { id: 'repurpose-content', name: 'Repurpose Content', description: 'Cut long-form into social variants', slash: 'repurpose-content', category: 'Production' },
      { id: 'audience-report', name: 'Audience Report', description: 'Summarize growth and engagement shifts', slash: 'audience-report', category: 'Growth' },
      { id: 'brand-audit', name: 'Brand Audit', description: 'Check assets against brand system rules', slash: 'brand-audit', category: 'Brand' },
    ],
    series: [
      { label: 'W1', value: 1.1 },
      { label: 'W2', value: 1.4 },
      { label: 'W3', value: 1.2 },
      { label: 'W4', value: 1.8 },
      { label: 'W5', value: 2.1 },
      { label: 'W6', value: 2.6 },
    ],
    seriesLabel: 'Weekly reach (millions)',
    tableLabel: 'Channel performance',
    table: {
      columns: ['Channel', 'Reach', 'Engagement', 'Revenue'],
      rows: [
        ['Short video', '3.8M', '8.2%', '$54K'],
        ['Long video', '2.1M', '6.1%', '$41K'],
        ['Newsletter', '1.4M', '5.4%', '$22K'],
        ['Social posts', '1.1M', '4.8%', '$11K'],
      ],
    },
    actions: [
      { title: 'Cut 6 short-form clips from the latest long video', owner: 'Editor', priority: 'high', due: 'Tomorrow' },
      { title: 'Approve 6 pending campaign drafts', owner: 'Creative Director', priority: 'high', due: 'Today' },
      { title: 'Refresh newsletter template to brand v3', owner: 'Designer', priority: 'medium', due: 'Next week' },
    ],
    insight:
      'Short video drives 45% of reach and the highest engagement at 8.2%, making it the best channel to expand first. Reach has grown every week except W3, and the W4–W6 acceleration tracks the shift toward short-form production.',
  },
  {
    id: 'crypto',
    name: 'Crypto Operations',
    shortName: 'Crypto',
    description: 'Digital assets, wallets, on-chain activity, treasury, and compliance.',
    status: '11 chains connected',
    metrics: [
      { label: 'Assets monitored', value: '$96.2M', delta: '+5.8%', trend: 'up' },
      { label: '24h volume', value: '$14.7M', delta: '+21.4%', trend: 'up' },
      { label: 'Wallet health', value: '99.98%', delta: 'All operational', trend: 'flat' },
      { label: 'Risk alerts', value: '12', delta: '3 high priority', trend: 'flat' },
    ],
    workflows: [
      { name: 'Wallet risk review', detail: 'On-chain signals → cases', status: 'Running' },
      { name: 'Treasury rebalance', detail: 'Holdings + target policy', status: 'Ready' },
      { name: 'Protocol watch', detail: 'Continuous monitoring', status: 'Scheduled' },
    ],
    databases: [
      { name: 'On-chain index', type: 'Blockchain', freshness: 'Live' },
      { name: 'Wallet registry', type: 'Postgres', freshness: '1m ago' },
      { name: 'Exchange positions', type: 'API', freshness: 'Live' },
    ],
    prompt: '/wallet-risk review flagged addresses in @On-chain Activity',
    consoleDatasets: [
      { id: 'onchain-activity', name: 'On-chain Activity', description: 'Transfers, contracts, and address clusters', category: 'On-chain' },
      { id: 'wallet-registry', name: 'Wallet Registry', description: 'Custody wallets, keys, and signers', category: 'On-chain' },
      { id: 'exchange-positions', name: 'Exchange Positions', description: 'Balances and open orders per venue', category: 'Markets' },
      { id: 'token-treasury', name: 'Token Treasury', description: 'Holdings, vesting, and target policy', category: 'Treasury' },
      { id: 'compliance-flags', name: 'Compliance Flags', description: 'Sanctions and mixer proximity signals', category: 'Risk & compliance' },
    ],
    consoleWorkflows: [
      { id: 'wallet-risk', name: 'Wallet Risk', description: 'Review flagged addresses and open cases', slash: 'wallet-risk', category: 'Risk & compliance' },
      { id: 'treasury-rebalance', name: 'Treasury Rebalance', description: 'Compare holdings against target policy', slash: 'treasury-rebalance', category: 'Treasury' },
      { id: 'protocol-watch', name: 'Protocol Watch', description: 'Monitor protocol and bridge exposure', slash: 'protocol-watch', category: 'Research' },
      { id: 'onchain-trace', name: 'On-chain Trace', description: 'Trace fund flows across addresses', slash: 'onchain-trace', category: 'Risk & compliance' },
    ],
    series: [
      { label: 'Mon', value: 9.8 },
      { label: 'Tue', value: 11.2 },
      { label: 'Wed', value: 10.4 },
      { label: 'Thu', value: 12.9 },
      { label: 'Fri', value: 14.7 },
      { label: 'Sat', value: 8.6 },
    ],
    seriesLabel: 'Daily on-chain volume ($M)',
    tableLabel: 'Flagged address review',
    table: {
      columns: ['Address', 'Exposure', 'Signal', 'Severity'],
      rows: [
        ['0x7f…a21c', '$4.2M', 'Mixer proximity', 'High'],
        ['0x3b…9de4', '$1.8M', 'Sanctions hop 2', 'High'],
        ['0xc1…4f70', '$960K', 'Rapid fan-out', 'Medium'],
        ['0x9a…22b8', '$418K', 'New counterparty', 'Low'],
      ],
    },
    actions: [
      { title: 'Freeze transfers to 0x7f…a21c pending review', owner: 'Compliance', priority: 'high', due: 'Immediate' },
      { title: 'File case for sanctions-adjacent address', owner: 'Compliance', priority: 'high', due: 'Today' },
      { title: 'Rebalance treasury to 60/30/10 target', owner: 'Treasury', priority: 'medium', due: 'Fri' },
    ],
    insight:
      'Two addresses account for $6M of flagged exposure, both from mixer proximity and a two-hop sanctions link, and warrant immediate freezes. Volume is up 21% week over week with Friday the peak, so monitoring thresholds tuned to Monday levels will under-alert.',
  },
  {
    id: 'custom',
    name: 'Custom Enterprise',
    shortName: 'Custom',
    description: 'Build your own operating system from actions, data, and workflows.',
    status: 'Ready to configure',
    metrics: [
      { label: 'Connected data', value: '0', delta: 'Add source', trend: 'flat' },
      { label: 'Active workflows', value: '0', delta: 'Create one', trend: 'flat' },
      { label: 'Saved views', value: '0', delta: 'Build view', trend: 'flat' },
      { label: 'Team members', value: '1', delta: 'Invite team', trend: 'flat' },
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
    consoleDatasets: [],
    consoleWorkflows: [],
    series: [
      { label: 'W1', value: 1 },
      { label: 'W2', value: 1 },
      { label: 'W3', value: 1 },
      { label: 'W4', value: 1 },
      { label: 'W5', value: 1 },
      { label: 'W6', value: 1 },
    ],
    seriesLabel: 'Configure a data source to see trends',
    tableLabel: 'Configured sources',
    table: {
      columns: ['Source', 'Type', 'Status'],
      rows: [['No sources yet', 'Add one to begin', 'Pending']],
    },
    actions: [
      { title: 'Describe the datasets your team works with', owner: 'You', priority: 'high', due: 'Now' },
      { title: 'List the actions you repeat most often', owner: 'You', priority: 'high', due: 'Now' },
    ],
    insight:
      'Tell Intent OS which datasets you work with and which actions you repeat, and it will generate an operating interface shaped around them.',
  },
]

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'item'
  )
}

export function getScenario(id: ScenarioId, custom?: CustomProfile): Scenario {
  const base = SCENARIOS.find((scenario) => scenario.id === id) ?? SCENARIOS[0]

  if (id !== 'custom' || !custom?.name) return base

  const datasetCount = custom.datasets.length
  const actionCount = custom.actions.length

  return {
    ...base,
    name: custom.name,
    description:
      'A generated operating interface based on your data and actions.',
    status: `${datasetCount} data ${datasetCount === 1 ? 'source' : 'sources'} configured`,
    metrics: [
      { label: 'Data sources', value: String(datasetCount), delta: 'Configured', trend: 'flat' },
      { label: 'Core actions', value: String(actionCount), delta: 'Mapped', trend: 'flat' },
      { label: 'Generated pages', value: String(Math.max(2, actionCount)), delta: 'Ready', trend: 'flat' },
      { label: 'Workspace', value: 'Live', delta: 'Customized', trend: 'flat' },
    ],
    workflows: custom.actions.slice(0, 3).map((action, index) => ({
      name: action,
      detail: `Uses ${custom.datasets[index % Math.max(datasetCount, 1)] ?? 'workspace data'}`,
      status: index === 0 ? 'Running' : 'Ready',
    })),
    databases: custom.datasets.slice(0, 4).map((dataset) => ({
      name: dataset,
      type: 'Custom source',
      freshness: 'Configured',
    })),
    prompt: custom.actions.length
      ? `/${slugify(custom.actions[0])} using @${custom.datasets[0] ?? 'your data'}`
      : 'Help me define a workflow for my team',
    consoleDatasets: custom.datasets.map((dataset) => ({
      id: slugify(dataset),
      name: dataset,
      description: 'Custom data source you configured',
      category: 'Your data',
    })),
    consoleWorkflows: custom.actions.map((action) => ({
      id: slugify(action),
      name: action,
      description: 'Action you perform regularly',
      slash: slugify(action),
      category: 'Your actions',
    })),
    tableLabel: 'Configured sources',
    table: {
      columns: ['Source', 'Type', 'Status'],
      rows: custom.datasets.length
        ? custom.datasets.map((dataset) => [dataset, 'Custom source', 'Connected'])
        : [['No sources yet', 'Add one to begin', 'Pending']],
    },
    actions: custom.actions.slice(0, 3).map((action, index) => ({
      title: action,
      owner: 'Your team',
      priority: index === 0 ? 'high' : 'medium',
      due: index === 0 ? 'Today' : 'This week',
    })),
    insight: `Intent OS built this workspace from ${datasetCount} data ${
      datasetCount === 1 ? 'source' : 'sources'
    } and ${actionCount} recurring ${
      actionCount === 1 ? 'action' : 'actions'
    }. Reference them in Console with @ and / to generate new pages.`,
  }
}
