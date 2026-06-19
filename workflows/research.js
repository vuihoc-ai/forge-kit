export const meta = {
  name: 'forge-research',
  description: 'Forge Step 1 deep research — 6-pillar fan-out, citation-per-fact, → structured writeback',
  phases: [
    { title: 'Pillars' },
    { title: 'Competitor deep-dive' },
    { title: 'Reduce' },
  ],
}

// Design note: a thorough sweep would fan out ~30 agents (market 3 / competitors 10 /
// existing 3 / trends 3 / regulatory 3 / tech 8). Here each pillar = ONE strong agent
// that covers its sub-tasks in a single schema'd pass (token-efficient, same output
// surface), EXCEPT competitors which genuinely fans out (discovery → per-competitor
// deep-dive). To widen parallelism, split a pillar prompt into its sub-tasks and add
// them to `pillarPrompts`.

// args may arrive as an object OR a stringified JSON (harness serialization) —
// normalize so args.idea is always reachable.
let a = args
if (typeof a === 'string') {
  try { a = JSON.parse(a) } catch (_) { a = { idea: a } }
}
const idea = (a && (a.idea || a.brief)) || (typeof a === 'string' ? a : '')
if (!idea || typeof idea !== 'string') {
  throw new Error('forge-research: pass a brief via args.idea (string or {idea} object)')
}
const maxCompetitors = (a && a.maxCompetitors) || 6

// citation-per-fact: every fact carries a source; abstain instead of inventing
const FACT = {
  type: 'object',
  required: ['claim', 'source', 'confidence'],
  properties: {
    claim: { type: 'string' },
    value: { type: ['string', 'number', 'null'] },
    source: { type: 'string', description: 'URL or named source. If none found, set "unverified" and confidence:low — NEVER invent a number.' },
    confidence: { type: 'string', enum: ['low', 'med', 'high'] },
  },
}
const PILLAR = {
  type: 'object',
  required: ['pillar', 'facts', 'summary'],
  properties: {
    pillar: { type: 'string' },
    facts: { type: 'array', items: FACT },
    summary: { type: 'string' },
    kill_signals: { type: 'array', items: { type: 'string' } },
  },
}
const cite =
  'EVERY fact must carry a source (URL or named source). If you cannot find one, set source:"unverified" and confidence:"low" — never invent a figure. Reconcile top-down vs bottom-up where relevant.'

phase('Pillars')
const pillarPrompts = [
  ['market', `Market sizing for this idea: "${idea}". TAM (top-down AND bottom-up, reconciled), SAM, SOM, CAGR, segmentation. ${cite}`],
  ['existing', `Existing solutions / current workflow for: "${idea}". DIY/manual workflow, adjacent tools, switching cost. ${cite}`],
  ['trends', `Macro trends for: "${idea}". Tailwinds/headwinds, why-now timing, what could kill it in 24–36 months. ${cite}`],
  ['regulatory-us', `US regulatory landscape for: "${idea}". Hard-block flags, certifications required, compliance-cost band. ${cite}`],
  ['regulatory-eu', `EU regulatory landscape for: "${idea}". Hard-block flags, certifications, compliance-cost band. ${cite}`],
  ['regulatory-vn', `Vietnam regulatory landscape for: "${idea}". Hard-block flags, certifications, compliance-cost band. ${cite}`],
  ['tech', `Tech landscape for: "${idea}". Build-vs-buy, 1–2 reference architectures, per-key-dependency notes, AI-feasibility (latency, $/call), talent scarcity. ${cite}`],
]
const pillarResults = await parallel(
  pillarPrompts.map(([key, p]) => () =>
    agent(p, { label: `pillar:${key}`, phase: 'Pillars', schema: PILLAR })),
)

phase('Competitor deep-dive')
const DISCOVERY = {
  type: 'object',
  required: ['competitors'],
  properties: {
    competitors: { type: 'array', items: { type: 'string' }, description: 'direct + adjacent competitor names, most relevant first' },
  },
}
const disc = await agent(
  `Discover direct + adjacent competitors for: "${idea}". Return names only (max 8, most relevant first).`,
  { label: 'competitor:discovery', phase: 'Competitor deep-dive', schema: DISCOVERY },
)
const names = ((disc && disc.competitors) || []).slice(0, maxCompetitors)
const COMPETITOR = {
  type: 'object',
  required: ['name', 'facts'],
  properties: {
    name: { type: 'string' },
    facts: { type: 'array', items: FACT },
    pricing: { type: 'string' },
    positioning: { type: 'string' },
    last_shipped: { type: 'string' },
  },
}
const competitors = (await parallel(
  names.map((n) => () =>
    agent(`Deep-dive competitor "${n}" for idea "${idea}": feature matrix, pricing, positioning, funding, team, last-shipped, reviews. ${cite}`,
      { label: `competitor:${n}`, phase: 'Competitor deep-dive', schema: COMPETITOR })),
)).filter(Boolean)

phase('Reduce')
const pillars = pillarResults.filter(Boolean)
const kill = pillars.flatMap((p) => p.kill_signals || [])
const reduced = {
  idea,
  agents_fanned: pillarPrompts.length + 1 + names.length,
  pillars,
  competitors,
  competitor_count: competitors.length,
  kill_signals_found: kill,
  // kill-signals are FLAGGED, never auto-acted — the orchestrator surfaces
  // them to the user at the research gate before any writeback.
}
log(`forge-research: ${reduced.agents_fanned} agents · ${competitors.length} competitors · ${kill.length} kill-signals`)
return reduced
