# forge-kit

A shareable, configurable idea-validation pipeline as Claude Code skills. Drop a raw
idea in, and a family of 6 skills walks it through **categorize → research → validate →
score → 1-pager → deck → V0**, with web-research fan-out and citation-per-fact.

You can **rename the whole skill family** (so it doesn't clash with anyone else's) and
point **every folder wherever you want** — no shared root required.

## What you get

6 skills (shown with the default `forge` prefix — yours will use whatever
`skill_prefix` you set):

| Skill | Does |
|---|---|
| `forge-categorize` | Raw idea note → taxonomy frontmatter (domain, model, scale-thesis…) |
| `forge-research` | Orchestrates deep research + validation + scoring (human gates) |
| `forge-score` | 5-axis rubric → composite + route + pass/park verdict |
| `forge-1pager` | Passed idea → a structured 1-pager |
| `forge-deck` | 1-pager → landing/deck copy + interest-signal threshold |
| `forge-v0` | Smallest-shippable V0 + MVP scope, graduate to a product vault |

The research/validation engine is two native **Claude Workflow** scripts
(`workflows/research.js`, `workflows/validate.js`) — pure web-research fan-out, no
external services, no API keys.

## Requirements

- **Claude Code** (the skills are markdown the agent reads).
- `python3` + `bash` (the installer).
- `WebSearch` / `WebFetch` available to the agent (for the research workflow).
- *(optional)* an issue-tracker MCP (Linear / Jira / GitHub Projects) — only the last
  step (`*-v0`) hands off to it, and only if you have one connected.

## Install

```bash
git clone <this-repo> forge-kit
cd forge-kit
./setup.sh                       # first run creates forge.config.json from the example
```

Then edit **`forge.config.json`**:

- `skill_prefix` — renames the family, e.g. `"ideas"` → `ideas-categorize`, `ideas-score`…
- the 9 `*_dir` + 3 `*_path` values — point each one wherever you like (absolute paths
  or `~`). They do **not** need to share a parent folder.

Re-run to apply:

```bash
./setup.sh
```

It will:
1. write a **runtime config** to `~/.config/forge-kit/<prefix>.json`,
2. materialize the 6 renamed skills into `~/.claude/skills/<prefix>-*/`,
3. copy the Workflow scripts to your `workflows_dir`,
4. scaffold the vault folders + seed `taxonomy.md`, `scoring-config.md`,
   `1-pager-template.md` (existing files are **never** overwritten).

## Changing things later

- **Move a folder / retarget output** → edit `~/.config/forge-kit/<prefix>.json`
  directly. The skills read it every run, so **no re-install needed**.
- **Rename the skills** (`skill_prefix`) → edit `forge.config.json` + re-run `./setup.sh`
  (the name is baked into the skill folders, so this one needs a re-run). The old
  `<old-prefix>-*` skill folders can be deleted by hand.

## Customize the doctrine

- `taxonomy.md` — the 5 axes + their allowed values. Edit to fit your domain.
- `scoring-config.md` — the weights (sum to 1.0) + route pass-thresholds. Tune to your bar.
- `1-pager-template.md` — the 1-pager section layout.

These live at the paths you configured and are read at runtime — edit them anytime.

## Config keys

| Key | What lives there |
|---|---|
| `skill_prefix` | The skill family name (baked at install) |
| `ideas_dir` | Categorized idea notes (`<domain>/<slug>.md`) |
| `research_dir` | Research findings (`<slug>/findings.md`) |
| `runs_dir` | Raw workflow run JSON |
| `scored_dir` | Scored notes |
| `onepager_dir` | Generated 1-pagers |
| `outputs_dir` | Landing/deck/V0 outputs |
| `archive_dir` | `parked/` + `killed/` ideas |
| `product_vault_dir` | Graduated products (handoff target) |
| `workflows_dir` | Where `research.js` / `validate.js` are installed |
| `taxonomy_path` | The taxonomy file |
| `scoring_config_path` | The scoring weights/thresholds file |
| `onepager_template_path` | The 1-pager template file |
