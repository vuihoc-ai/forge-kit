export const meta = {
  name: 'forge-validate',
  description: 'Forge Step 2 validation — ICP/demand/WTP/risks/kill-criteria, citation-per-fact → writeback + advisory verdict',
  phases: [
    { title: 'ICP' },
    { title: 'Demand / WTP / Risk' },
    { title: 'Verdict' },
  ],
}

// args may arrive as an object OR a stringified JSON — normalize.
let a = args
if (typeof a === 'string') {
  try { a = JSON.parse(a) } catch (_) { a = { idea: a } }
}
const idea = (a && (a.idea || a.brief)) || (typeof a === 'string' ? a : '')
if (!idea || typeof idea !== 'string') {
  throw new Error('forge-validate: pass a brief via args.idea (string or {idea} object)')
}

const FACT = {
  type: 'object',
  required: ['claim', 'source', 'confidence'],
  properties: {
    claim: { type: 'string' },
    value: { type: ['string', 'number', 'null'] },
    source: { type: 'string', description: 'URL or named source; "unverified" + confidence:low if none — never invent.' },
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
    band: { type: 'string', enum: ['none', 'low', 'med', 'high'] },
  },
}
const cite = 'EVERY fact carries a source; if none, source:"unverified" + confidence:"low". Never invent a figure.'

phase('ICP')
const ICP = {
  type: 'object',
  required: ['primary', 'jtbd', 'confidence'],
  properties: {
    primary: { type: 'string' },
    secondary: { type: 'string' },
    jtbd: { type: 'string' },
    segment_size: FACT,
    confidence: { type: 'string', enum: ['low', 'med', 'high'] },
  },
}
// An ICP-approval gate (before demand/WTP) is auto here; the orchestrator gates later.
const icp = await agent(
  `Define the ICP for "${idea}": primary + secondary persona, JTBD, primary segment size. ${cite}`,
  { label: 'icp', phase: 'ICP', schema: ICP },
)
const icpCtx = icp ? `Primary ICP: ${icp.primary}. JTBD: ${icp.jtbd}.` : ''

phase('Demand / WTP / Risk')
const [demand, wtp, risk] = await parallel([
  () => agent(`Demand signals for "${idea}". ${icpCtx} search-trend (24mo), social-buzz (X/Reddit/HN/LinkedIn), forum pain-mentions ("I wish there was…", 90d), relevant job-posts, competitor funding velocity → signal-overall band. ${cite}`,
    { label: 'demand', phase: 'Demand / WTP / Risk', schema: PILLAR }),
  () => agent(`Willingness-to-pay for "${idea}". ${icpCtx} alternative-cost band, current DIY/manual spend band, proxy interview synthesis → willingness-signal band + evidence-quality (direct|proxy|absent). ${cite}`,
    { label: 'wtp', phase: 'Demand / WTP / Risk', schema: PILLAR }),
  () => agent(`Risks/assumptions for "${idea}". ${icpCtx} must-be-true list, the ONE leap-of-faith that kills it if wrong, dependency risk. ${cite}`,
    { label: 'risk', phase: 'Demand / WTP / Risk', schema: PILLAR }),
])

phase('Verdict')
const VERDICT = {
  type: 'object',
  required: ['verdict_recommendation', 'reasoning'],
  properties: {
    triggered: { type: 'array', items: { type: 'string' } },
    leap_of_faith: { type: 'string' },
    verdict_recommendation: { type: 'string', enum: ['continue', 'park', 'kill'] },
    reasoning: { type: 'string' },
  },
}
// Kill-thresholds (advisory only — the orchestrator surfaces them at the validation gate).
const verdict = await agent(
  `Apply Forge kill-thresholds and give an ADVISORY verdict for "${idea}":\n` +
  `- demand signal-overall LOW and wtp willingness LOW → "kill"\n` +
  `- leap-of-faith non-falsifiable in next 90d → "park"\n` +
  `- ICP confidence low → "park" (re-scope)\n` +
  `- else → "continue"\n\n` +
  `ICP: ${JSON.stringify(icp)}\nDemand: ${JSON.stringify(demand)}\nWTP: ${JSON.stringify(wtp)}\nRisk: ${JSON.stringify(risk)}`,
  { label: 'verdict', phase: 'Verdict', schema: VERDICT },
)

const reduced = { idea, agents_fanned: 5, icp, demand, wtp, risk, verdict }
log(`forge-validate: verdict=${verdict && verdict.verdict_recommendation}`)
return reduced
