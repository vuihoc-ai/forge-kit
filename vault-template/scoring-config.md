---
type: forge-scoring-config
updated:
---

# Forge scoring config

The `score` skill reads this at runtime. Edit weights/thresholds here, not in skill code.

## Weights (must sum to 1.0)
Composite `score-total = Σ(score_i × weight_i)`, each `score_i` ∈ 0–10.

```yaml
weights:
  market: 0.20
  competition: 0.20
  feasibility: 0.20
  demand: 0.20
  wtp: 0.20
```

## Pass thresholds — route-asymmetric
```yaml
thresholds:
  bootstrap: 6.0   # lower scale bar — cashflow + feasibility
  venture: 7.5     # needs high market size + compounding growth
  unclear: null    # → manual review / re-validate
```
Verdict: `score-total ≥ T(route)` → **pass** (eligible for 1-pager); else **park**
(→ the archive dir). Re-runnable; keep `score-history:` on the note.

> Tune the weights and thresholds to your own bar before relying on the verdict.
