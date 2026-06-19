---
type: forge-taxonomy
updated:
---

# Forge Taxonomy — single source of truth

The `categorize` skill reads this at runtime. Edit values here; never in skill code.
5 axes, each = a frontmatter field on every idea note. The skill **prefers existing
values**; if nothing fits → it adds the value with `proposed: true` for periodic review.

| Axis (frontmatter field) | Seed values |
|---|---|
| `domain` | fintech · devtools · healthtech · ai-infra · consumer · edtech |
| `stage` | raw · categorized · researched · validated · scored · 1-pager · graduated · parked · killed |
| `business-model` | SaaS · marketplace · infra/API · info-product · services |
| `scale-thesis` | bootstrap · venture · unclear |
| `source-type` | tweet · article · conversation · personal-pain · slack · tool-release |

> These are starter values — edit the table to fit your domain. Add/remove rows freely.

## Stage machine
```
raw → categorized → researched → validated → scored → 1-pager → graduated
                                         ↘ parked (revisit-when)   ↘ killed (terminal)
```

## Proposed-value queue
New values land with `proposed: true`. Periodically: review `proposed: true` notes →
promote the value into this table or reject it.
