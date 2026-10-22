"""Copy the agent instructions of the product into the presentation.

Reads F:/projects/metall-dev-2 only: D001 role files, skill packages and the
prompts the recognition pipeline actually builds (default "autonomous" mode).
Writes public/instructions/*.md and src/data/instructions-manifest.json.
Run: python scripts/capture-instructions.py  (needs `uv` for the product env).
"""

import hashlib
import json
import subprocess
import sys
from pathlib import Path

PRODUCT = Path("F:/projects/metall-dev-2")
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "instructions"
MANIFEST = ROOT / "src" / "data" / "instructions-manifest.json"
SKILL_HEADING = "# Руководства по типам геометрии (Skills):"

# Prompts that live in Python code are rendered by the product itself.
EXTRACT = r"""
import json, sys
from metall_mvp.skills import build_project_skill_registry
from metall_mvp.agents.prompts import (
    build_recognition_prompt_set, RecognitionPromptMode, SOURCE_READING_SCOPE_PROMPT,
)
from metall_mvp.workflows.material_research import _PROMPT
from metall_mvp.workflows.stock_selection_explanation import STOCK_SELECTION_EXPLANATION_PROMPT
from metall_mvp.agents.definitions import DEEP_ANALYSIS_AGENT_DEFINITION
registry = build_project_skill_registry()
geometry = registry.activate(["geometry-sheet-metal", "geometry-rotational", "geometry-weldment"])
prompts = build_recognition_prompt_set(registry, geometry, mode=RecognitionPromptMode.AUTONOMOUS)
sys.stdout.buffer.write(json.dumps({
    "agent_1": prompts.static_instructions("agent_1"),
    "agent_2": prompts.static_instructions("agent_2"),
    "source_rules": SOURCE_READING_SCOPE_PROMPT,
    "material": _PROMPT,
    "explanation": STOCK_SELECTION_EXPLANATION_PROMPT,
    "deep": DEEP_ANALYSIS_AGENT_DEFINITION.system_prompt,
    "deep_skills": list(DEEP_ANALYSIS_AGENT_DEFINITION.skill_ids),
    "skills": [
        {"id": s.skill_id, "version": s.version, "description": s.description, "hash": s.content_hash}
        for s in registry.list()
    ],
}, ensure_ascii=False).encode("utf-8"))
"""


def skill_body(skill_id: str) -> str:
    text = (PRODUCT / "mvp" / "skills" / skill_id / "SKILL.md").read_text(encoding="utf-8")
    lines = text.splitlines()
    closing = next(i for i, line in enumerate(lines[1:], 1) if line.strip() == "---")
    return "\n".join(lines[closing + 1 :]).strip() + "\n"


def main() -> None:
    raw = subprocess.run(
        ["uv", "run", "--no-sync", "python", "-c", EXTRACT],
        cwd=PRODUCT / "mvp",
        check=True,
        capture_output=True,
    ).stdout
    live = json.loads(raw.decode("utf-8"))
    # Agent 1 = base text + geometry skills + shared source rules (appended last).
    base, _, _ = live["agent_1"].partition(SKILL_HEADING)
    assert live["agent_1"].endswith(live["source_rules"])

    texts = {
        "reader-base": (base.rstrip() + "\n", "mvp/src/metall_mvp/agents/prompts.py · AUTONOMOUS_ENGINEERING_AGENT_PROMPT"),
        "reader-rules": (live["source_rules"], "mvp/src/metall_mvp/agents/prompts.py · SOURCE_READING_SCOPE_PROMPT"),
        "reader-full": (live["agent_1"], "собранная инструкция: базовая часть + три навыка + общие правила источника"),
        "refiner": (live["agent_2"], "mvp/src/metall_mvp/agents/prompts.py · AGENT_TWO_ROLE_PROMPT"),
        "material": (live["material"], "mvp/src/metall_mvp/workflows/material_research.py"),
        "explanation": (live["explanation"], "mvp/src/metall_mvp/workflows/stock_selection_explanation.py"),
        "deep": (live["deep"], "mvp/src/metall_mvp/agents/definitions.py · DEEP_ANALYSIS_AGENT_DEFINITION"),
    }
    for role, name in {
        "route-planner": "ROUTE_PLANNER.md",
        "blank": "BLANK_PREPARATION.md",
        "turning": "TURNING.md",
        "milling": "MILLING_DRILLING.md",
        "time": "TIME_ESTIMATION.md",
    }.items():
        path = PRODUCT / "mvp" / "instructions" / "d001" / name
        # Exact bytes: the product pins each role file by its SHA-256.
        texts[role] = (path.read_bytes().decode("utf-8"), "mvp/instructions/d001/" + name)
    for skill in live["skills"]:
        texts["skill-" + skill["id"]] = (
            skill_body(skill["id"]),
            "mvp/skills/" + skill["id"] + "/SKILL.md",
        )

    OUT.mkdir(parents=True, exist_ok=True)
    files = {}
    for key, (text, source) in texts.items():
        data = text.encode("utf-8")
        (OUT / f"{key}.md").write_bytes(data)  # binary write keeps line endings
        files[key] = {
            "file": f"/instructions/{key}.md",
            "source": source,
            "chars": len(text),
            "sha256": hashlib.sha256(data).hexdigest(),
        }
    head = subprocess.run(
        ["git", "rev-parse", "--short", "HEAD"], cwd=PRODUCT, capture_output=True, text=True
    ).stdout.strip()
    manifest = {
        "product_head": head,
        "deep_skills": live["deep_skills"],
        "skills": live["skills"],
        "files": files,
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(files)} files from metall-dev-2 {head}", file=sys.stderr)


if __name__ == "__main__":
    main()
