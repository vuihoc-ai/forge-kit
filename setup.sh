#!/usr/bin/env bash
# forge-kit installer (Option C — hybrid).
#   - skill_prefix is baked into the materialized skills at install time (rename).
#   - all *_dir / *_path values are written to a runtime config that the skills read
#     on every run, so you can change paths later WITHOUT re-running this script.
# Re-run this script only when you change skill_prefix (or want to refresh the skills).
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$REPO/forge.config.json"

if [ ! -f "$CONFIG" ]; then
  cp "$REPO/forge.config.example.json" "$CONFIG"
  echo "Created $CONFIG"
  echo "→ Edit skill_prefix + every path, then re-run ./setup.sh"
  exit 1
fi

python3 - "$REPO" "$CONFIG" <<'PY'
import json, os, re, shutil, sys

repo, config_path = sys.argv[1], sys.argv[2]
cfg = json.load(open(config_path))

def need(key):
    v = cfg.get(key)
    if not v or not str(v).strip():
        sys.exit(f"forge-kit: config key '{key}' is empty in {config_path}")
    return str(v).strip()

def path(key):
    return os.path.abspath(os.path.expanduser(need(key)))

prefix = need("skill_prefix")
if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", prefix):
    sys.exit(f"forge-kit: skill_prefix '{prefix}' must be lowercase letters/digits/hyphens")

DIR_KEYS  = ["ideas_dir","research_dir","runs_dir","scored_dir","onepager_dir",
             "outputs_dir","archive_dir","product_vault_dir","workflows_dir"]
FILE_KEYS = ["taxonomy_path","scoring_config_path","onepager_template_path"]
resolved = {"skill_prefix": prefix}
for k in DIR_KEYS + FILE_KEYS:
    resolved[k] = path(k)

# 1) Runtime config (what the installed skills read every run)
runtime_dir = os.path.expanduser("~/.config/forge-kit")
os.makedirs(runtime_dir, exist_ok=True)
runtime_config = os.path.join(runtime_dir, f"{prefix}.json")
with open(runtime_config, "w") as f:
    json.dump(resolved, f, indent=2)
print(f"[config]   runtime config → {runtime_config}")

# 2) Materialize the renamed skill family into ~/.claude/skills/
skills_root = os.path.expanduser("~/.claude/skills")
suffixes = ["categorize","research","score","1pager","deck","v0"]
for suf in suffixes:
    tmpl = os.path.join(repo, "skills", suf, "SKILL.md")
    body = open(tmpl).read().replace("{{PREFIX}}", prefix).replace("{{CONFIG}}", runtime_config)
    dest_dir = os.path.join(skills_root, f"{prefix}-{suf}")
    os.makedirs(dest_dir, exist_ok=True)
    with open(os.path.join(dest_dir, "SKILL.md"), "w") as f:
        f.write(body)
    print(f"[skill]    {prefix}-{suf} → {dest_dir}/SKILL.md")

# 3) Copy the Workflow scripts to workflows_dir
os.makedirs(resolved["workflows_dir"], exist_ok=True)
for js in ("research.js", "validate.js"):
    shutil.copy2(os.path.join(repo, "workflows", js),
                 os.path.join(resolved["workflows_dir"], js))
print(f"[workflows] research.js + validate.js → {resolved['workflows_dir']}")

# 4) Scaffold the vault (dirs + archive subdirs)
for k in DIR_KEYS:
    os.makedirs(resolved[k], exist_ok=True)
for sub in ("parked", "killed"):
    os.makedirs(os.path.join(resolved["archive_dir"], sub), exist_ok=True)

# 5) Seed the 3 template files — NEVER clobber an existing one
seeds = {
    "taxonomy_path":          "taxonomy.md",
    "scoring_config_path":    "scoring-config.md",
    "onepager_template_path": "1-pager-template.md",
}
for key, src in seeds.items():
    dest = resolved[key]
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if os.path.exists(dest):
        print(f"[seed]     kept existing {dest}")
    else:
        shutil.copy2(os.path.join(repo, "vault-template", src), dest)
        print(f"[seed]     {src} → {dest}")

print()
print(f"Done. Skill family '{prefix}-*' installed (6 skills).")
print(f"Trigger e.g.  {prefix}-categorize <path-to-idea-note>")
print(f"Change paths anytime by editing {runtime_config} (no re-run needed).")
print(f"Change the skill prefix → edit forge.config.json + re-run ./setup.sh.")
PY
