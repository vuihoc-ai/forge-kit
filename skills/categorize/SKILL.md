---
name: {{PREFIX}}-categorize
description: |
  Categorize a raw idea note → write taxonomy frontmatter. Trigger:
    "{{PREFIX}}-categorize <path-to-inbox-note>"
  Reads the note + the taxonomy, asks up to 5 clarifying Qs (one at a time),
  writes domain/stage/business-model/scale-thesis/source-type. Prefers existing
  taxonomy values; flags new as proposed:true. Stage raw → categorized.
---

**FIRST: read args** = path to the inbox note. If missing → ask which note.
NEVER infer the target from memory.

## Config (read FIRST, every run)
Read the JSON at `{{CONFIG}}`. It maps logical names → absolute paths on this machine.
Resolve `ideas_dir` and `taxonomy_path`, and use them for every path below.
If the file is missing → tell the user to run the forge-kit `setup.sh`, then stop.

# {{PREFIX}}-categorize

Turn a raw idea dump into a categorized note with taxonomy frontmatter.

## Steps
1. **Read** the note + `taxonomy_path` (the 5 axes + seed values).
2. **Dup-check**: search `ideas_dir` for a near-duplicate (same core idea from a
   different source). If found → tell the user, offer to merge into the existing note
   rather than create a new one.
3. **Clarify touchpoint** (max 5 Qs, **ONE at a time** — never bulk-dump the list):
   only ask what's needed to categorize — who's the user, the trigger situation, the
   core job, the current alternative, the bootstrap-vs-venture lean. Skip any the note
   already answers.
4. **Categorize** — assign each axis a value, **preferring existing taxonomy values**:
   - `domain`, `business-model`, `scale-thesis`, `source-type` from note/answers.
   - If no existing value fits → best new value + `proposed: true`.
5. **Write frontmatter** to the note, set `stage: categorized`, move it to
   `<ideas_dir>/<domain>/<idea-slug>.md`.

## Frontmatter written
```yaml
domain: healthtech
business-model: SaaS
scale-thesis: venture
source-type: personal-pain
stage: categorized
idea-slug: <kebab>
categorized-date: <YYYY-MM-DD>
# proposed: true   # only if a new axis value was introduced
```

## Next
`{{PREFIX}}-research <idea-slug>` runs the orchestrated deep-research + validation + scoring.
