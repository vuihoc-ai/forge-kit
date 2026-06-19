---
name: {{PREFIX}}-v0
description: |
  Define V0 + MVP scope for an idea and graduate it to a product vault + tracker.
  Trigger "{{PREFIX}}-v0 <slug>". Post: graduated (handoff out of the pipeline).
---

**FIRST: read args** = idea-slug. If missing → ask.

## Config (read FIRST, every run)
Read the JSON at `{{CONFIG}}`. Resolve `onepager_dir`, `outputs_dir`,
`product_vault_dir`. Use them for every path below. Missing file → tell the user to
run the forge-kit `setup.sh`, then stop.

# {{PREFIX}}-v0

Scope the smallest shippable + graduate. This is the baton-pass **out** of the pipeline.

## Steps
1. Read the 1-pager (`<onepager_dir>/<slug>.md`) + score + findings.
2. **V0 (smallest shippable)** = the single wedge feature that tests the leap-of-faith.
   **MVP scope** = the next ring. Write both to `<outputs_dir>/<slug>-v0.md`.
3. **Graduate**: set `stage: graduated`; copy the idea into the product vault
   (`<product_vault_dir>/<product>/`).
4. **Handoff to your tracker**: create a project + V0 build issues in whatever issue
   tracker you use (Linear / Jira / GitHub Projects — via its MCP if connected).
   Day-to-day execution lives in the tracker; the vault stays durable.
5. **Tee up a build-plan review (optional):** the V0/MVP scope is now a *build-plan*.
   If you have a build-plan review skill installed, suggest running it on
   `<outputs_dir>/<slug>-v0.md` before any build.
