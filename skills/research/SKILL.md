---
name: {{PREFIX}}-research
description: |
  Orchestrator — runs deep research + validation + scoring for a categorized idea,
  pausing at human gates. Trigger:
    "{{PREFIX}}-research <idea-slug>"
  Native Claude Workflow fan-out (research.js / validate.js) with citation-per-fact;
  gates G2 (approve research writeback) + G4 (approve validation writeback) are
  human pauses. Stage: categorized → researched → validated → scored.
---

**FIRST: read args** = idea-slug (or path to the categorized note). If missing → ask.
NEVER infer from memory.

## Config (read FIRST, every run)
Read the JSON at `{{CONFIG}}`. Resolve `ideas_dir`, `research_dir`, `runs_dir`,
`archive_dir`, `workflows_dir`. Use them for every path below. Missing file → tell the
user to run the forge-kit `setup.sh`, then stop.

# {{PREFIX}}-research (orchestrator)

Run the validation pipeline for ONE idea. Heavy fan-out lives in Workflow scripts;
**you** own the human gates (pause + ask the user) and the vault writeback.

## Pre
Resolve the idea note under `<ideas_dir>/<domain>/<slug>.md`. Require
`stage: categorized` (if `raw` → run `{{PREFIX}}-categorize` first; if already
`researched`/`validated`, continue from there).

## Step 1 — RESEARCH (→ stage: researched)
1. Run the research fan-out via the **Workflow tool**:
   `Workflow({ scriptPath: "<workflows_dir>/research.js", args: { idea: "<full brief incl. note body>" } })`
2. **Gate G2 (human):** surface a tight summary — TAM/SAM/SOM (with sources),
   competitor count + leader, regulatory hard-blocks, and **kill-signals-found**.
   Ask the user: approve writeback? Kill-signals are flagged, never auto-acted. If the
   user parks/kills → move the note to `<archive_dir>/{parked,killed}/`.
3. On approve → write `<research_dir>/<slug>/findings.md` (prose body) + the run JSON
   to `<runs_dir>/`, and update the note frontmatter (Step-1 schema below):
   `research.*`, `market.*` (with `*-source`), `competition.*`, `regulatory.*`,
   `tech.*`, `research-confidence`, `kill-signals-found`. Set `stage: researched`.
   **Every number needs its `-source` sibling — omit the number if no source.**

## Step 2 — VALIDATION (→ stage: validated)
1. Run validation via the Workflow tool:
   `Workflow({ scriptPath: "<workflows_dir>/validate.js", args: { idea: "<brief>" } })`
   (ICP · demand · WTP · risks · kill-criteria) — same pattern.
2. **Gate G4 (human):** surface ICP, demand/WTP bands, leap-of-faith, and the
   advisory `verdict-recommendation` (continue/park/kill). Ask the user to approve.
3. On approve → writeback Step-2 frontmatter + `stage: validated`.

## Step 3 — SCORING (→ stage: scored)
Run `{{PREFIX}}-score <slug>`: score the axes on the rubric, classify route
(bootstrap | venture | unclear), composite + verdict vs the route's pass-threshold.
Pass → `{{PREFIX}}-1pager`.

## Frontmatter schema (Step-1 + Step-2 writeback)
Numbers carry a `-source` sibling; omit any number you can't source.
```yaml
# Step 1 — research
research-confidence: low|med|high
market-tam: <n>;  market-tam-source: <url|named>
market-sam: <n>;  market-sam-source: <url|named>
market-som: <n>;  market-som-source: <url|named>
market-cagr: <pct>; market-cagr-source: <url|named>
competition-count: <n>
competition-leader: <name>
regulatory-hardblock: true|false   # + note
tech-feasibility: low|med|high
kill-signals-found: [<signal>, ...]
# Step 2 — validation
icp-primary: <persona>;  icp-jtbd: <job>
demand-band: none|low|med|high
wtp-band: none|low|med|high
leap-of-faith: <the one assumption that kills it if wrong>
verdict-recommendation: continue|park|kill   # advisory
```

## Gates model
G1 (competitor-list approve) is auto inside the workflow by default; G2 + G4 are the
real human pauses — never write to the vault without the user's approval at G2/G4
(surface, then proceed on approval).

## Cross-ref
- Workflows: `<workflows_dir>/{research,validate}.js`
- Citation discipline: every fact carries a source; abstain over invent.
