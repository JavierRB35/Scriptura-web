#!/usr/bin/env python3
"""Control reproducible de la traducción española de Tomás (sin dependencias)."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
archive = ROOT / "data" / "apocrypha"
manifest = json.loads((archive / "manifest.json").read_text(encoding="utf-8"))
works = manifest["works"]
assert len(works) == 6, f"Se esperaban 6 evangelios, hay {len(works)}"
thomas = next(work for work in works if work["id"] == "thomas")
assert thomas["translation_es_status"] == "draft_completed_pending_editorial_review"
assert thomas["translation_es_units"] == 114
assert sum(work["translation_es_status"] != "pending" for work in works) == 1

english = (archive / "en" / "thomas.txt").read_text(encoding="utf-8")
spanish_path = archive / thomas["translation_es_file"]
spanish_bytes = spanish_path.read_bytes()
spanish = spanish_bytes.decode("utf-8")

original_body = english.split("\nThe Gospel\nAccording to Thomas", 1)[0]
source_ids = [int(x) for x in re.findall(r"(?m)^Saying (\d+):", original_body)]
translated_ids = [int(x) for x in re.findall(r"(?m)^## Dicho (\d+)\.", spanish)]
expected = list(range(1, 115))
assert source_ids == expected, f"Fuente alterada o incompleta: {source_ids}"
assert translated_ids == source_ids, f"Traducción incompleta o renumerada: {translated_ids}"

sections = re.split(r"(?m)^## Dicho \d+\.[^\n]*\n", spanish)[1:]
assert len(sections) == 114
assert all(len(section.strip()) >= 45 for section in sections), "Al menos un dicho está vacío o truncado"
assert "## Prólogo" in spanish
assert "## Notas de traducción" in spanish
assert "SCRIPTURA_LINE_BREAK" not in spanish
assert "[…]" in spanish
assert "/igual\\" in spanish

note_numbers = re.findall(r"(?m)^- \*\*Dicho(?:s)? ([^*]+)\*\*", spanish)
assert len(note_numbers) == 6, f"Faltan notas editoriales: {note_numbers}"

git_blob_sha = hashlib.sha1(b"blob " + str(len(spanish_bytes)).encode() + b"\0" + spanish_bytes).hexdigest()
assert git_blob_sha == thomas["translation_es_github_blob_sha"], "La traducción difiere de la versión registrada en el manifiesto"

print(
    "OK: 6 textos originales; Tomás 114/114 dichos, prólogo, lagunas, "
    "6 notas y SHA Git comprobados; 5 traducciones pendientes."
)
