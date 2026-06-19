---
name: {{PREFIX}}-1pager
description: |
  Generate a 1-pager for a scored+passed idea. Trigger "{{PREFIX}}-1pager <slug>".
  Pre stage: scored + verdict=pass. Post: 1-pager.
---

**FIRST: read args** = idea-slug. If missing → ask.

## Config (read FIRST, every run)
Read the JSON at `{{CONFIG}}`. Resolve `scored_dir`, `onepager_dir`,
`onepager_template_path`. Use them for every path below. Missing file → tell the user
to run the forge-kit `setup.sh`, then stop.

# {{PREFIX}}-1pager

1. Read the note (research / validation / score frontmatter + findings) + the template
   at `onepager_template_path`.
2. **Require `verdict: pass`** — if park/kill, tell the user and don't generate.
3. Fill each section, keeping every number's source:
   - **Problem** (cite demand signals) · **Solution** (the wedge) · **ICP** ·
     **Market** (TAM/SAM/SOM + sources, why-now) · **Competition/diff** (leader + the gap) ·
     **Risk** (leap-of-faith + kill-criteria) · **Score** (composite + per-axis + route) ·
     **Ask** (build V0? gauge interest? park?).
4. Write `<onepager_dir>/<slug>.md`, set `stage: 1-pager`.
5. Next: gauge interest (`{{PREFIX}}-deck`) or `{{PREFIX}}-v0 <slug>` to scope the build.
