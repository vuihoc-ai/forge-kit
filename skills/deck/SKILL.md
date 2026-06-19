---
name: {{PREFIX}}-deck
description: |
  Generate landing/deck copy for a 1-pager'd idea + define the interest-signal to
  gauge before building. Trigger "{{PREFIX}}-deck <slug>". Pre stage: 1-pager. Post: deck.
---

**FIRST: read args** = idea-slug. If missing → ask.

## Config (read FIRST, every run)
Read the JSON at `{{CONFIG}}`. Resolve `onepager_dir`, `outputs_dir`. Use them for
every path below. Missing file → tell the user to run the forge-kit `setup.sh`, then stop.

# {{PREFIX}}-deck

Turn a 1-pager into something that gauges real interest before any V0 spend.

## Steps
1. Read `<onepager_dir>/<slug>.md`.
2. **Landing copy** → `<outputs_dir>/<slug>-landing.md`: hero (one-line promise) ·
   problem · solution · proof/credibility · CTA (waitlist / book-a-call).
3. **Deck outline** (≤10 slides): problem → why-now → solution → wedge → market →
   competition → business model → ask.
4. **Define the interest-signal + threshold** to clear before V0 (e.g. ≥N waitlist
   signups, ≥M discovery calls, landing CVR ≥ x%). Write it into the note frontmatter.
5. Set `stage: deck`. If the signal later clears the threshold → `{{PREFIX}}-v0 <slug>`.
