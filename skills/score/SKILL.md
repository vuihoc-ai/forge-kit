---
name: {{PREFIX}}-score
description: |
  Score a validated idea on the 5-axis rubric + route classifier → composite +
  verdict. Trigger "{{PREFIX}}-score <idea-slug>". Pre stage: validated. Post: scored.
---

**FIRST: read args** = idea-slug. If missing → ask.

## Config (read FIRST, every run)
Read the JSON at `{{CONFIG}}`. Resolve `ideas_dir`, `scored_dir`, `archive_dir`,
`scoring_config_path`. Use them for every path below. Missing file → tell the user to
run the forge-kit `setup.sh`, then stop.

# {{PREFIX}}-score

Score the idea from its researched + validated frontmatter. Stateless + re-runnable.

## Steps
1. Read the note (research + validation frontmatter) + `scoring_config_path`
   (weights + route thresholds).
2. **Score 5 directional axes 0–10** by the rubric:

   | axis | 0–3 weak | 4–6 moderate | 7–10 strong |
   |---|---|---|---|
   | `score-market` | TAM<$50M, CAGR<5%, stagnant | $50M–$500M, 5–15% | >$500M, >15%, tailwinds |
   | `score-competition` | 10+ VC-funded direct, saturated | moderate, slow incumbents, clear diff | greenfield/fragmented, distinct |
   | `score-feasibility` | unproven AI / heavy regulatory | standard APIs, minor compliance | off-the-shelf, zero reg overhead |
   | `score-demand` | low search, zero pain mentions | rising trends, proxy pain | active complaints, heavy hiring |
   | `score-wtp` | expected free, $0 spend | paying for clunky workaround | direct payments / LOIs |

   Cite the evidence (frontmatter `*-source`) behind each axis score.
3. **Route classifier**: `bootstrap | venture | unclear` (from `scale-thesis` +
   market/feasibility profile).
4. **Composite** = `Σ(score_i × weight_i)` (weights from `scoring_config_path`).
5. **Verdict**: composite ≥ `T(route)` → **pass**; else **park**; `unclear` → flag
   manual review.
6. Write frontmatter (`score-market/competition/feasibility/demand/wtp`, `score-total`,
   `route`, `verdict`); **append to `score-history:`** (re-runnable). Set
   `stage: scored`, move to `scored_dir`. Pass → suggest `{{PREFIX}}-1pager`; park →
   `<archive_dir>/parked/` with `revisit-when`.
