#!/usr/bin/env python3
"""Archiva las seis traducciones inglesas de dominio publico de Gospels.net.

Uso: python scripts/import-apocrypha.py
No publica contenidos en la web ni los incorpora a la base de datos.
Falla por completo si una fuente, permiso o control de integridad no es verificable.
"""
from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup, Tag

BASE = "https://www.gospels.net"
ROOT = Path(__file__).resolve().parents[1] / "data" / "apocrypha"
RIGHTS_SENTENCE = (
    "The following translation has been committed to the public domain "
    "and may be freely copied and used, changed or unchanged, for any purpose."
)
WORKS = [
    ("thomas", "The Gospel of Thomas", "Evangelio de Tomás", 13000,
     ["Saying 1:", "Saying 114:", "Notes on Translation"]),
    ("mary", "The Gospel of Mary", "Evangelio de María", 2800,
     ["Pages 1 through 6 are missing.", "Pages 11 through 14 are missing.", "Conflict over Authority"]),
    ("judas", "The Gospel of Judas", "Evangelio de Judas", 4500,
     ["Jesus Criticizes the Disciples", "The Betrayal", "Notes on Translation"]),
    ("peter", "The Gospel of Peter", "Evangelio de Pedro", 3500,
     ["Pilate and Herod", "The Disciples Depart", "(60)"]),
    ("infancyjames", "The Infancy Gospel of James", "Protoevangelio de Santiago", 11000,
     ["Chapter 1:", "Chapter 25:", "Appendix: A Shorter Version", "Notes"]),
    ("infancythomas", "The Infancy Gospel of Thomas", "Evangelio de la infancia de Tomás", 6500,
     ["Chapter 1:", "Chapter 19:", "Notes"]),
]


def download(url: str) -> bytes:
    request = Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; ScripturaSourceArchive/1.0)",
        "Accept": "text/html,application/xhtml+xml",
    })
    with urlopen(request, timeout=45) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status}: {url}")
        data = response.read()
    if len(data) < 5000:
        raise RuntimeError(f"Respuesta sospechosamente corta: {url}")
    return data


def clean_text(tag: Tag) -> str:
    fragment = BeautifulSoup(str(tag), "html.parser")
    for br in fragment.find_all("br"):
        br.replace_with(" SCRIPTURA_LINE_BREAK ")
    text = fragment.get_text()
    text = re.sub(r"\s+", " ", text.replace("\xa0", " ")).strip()
    return text.replace(" SCRIPTURA_LINE_BREAK ", "\n")


def extract(html_bytes: bytes, title: str, min_chars: int, markers: list[str]) -> str:
    soup = BeautifulSoup(html_bytes, "html.parser")
    for trash in soup.select("script, style, noscript, nav, footer, header, form, aside"):
        trash.decompose()

    heading = next((
        h for h in soup.find_all(["h1", "h2", "h3"])
        if re.sub(r"\s+", " ", h.get_text(" ", strip=True)).strip() == title
    ), None)
    if heading is None:
        raise RuntimeError(f"No se encontró el título editorial: {title}")

    # Elegir el contenedor más específico que contenga TODO el texto, no solo la introducción.
    container = None
    for ancestor in heading.parents:
        if not isinstance(ancestor, Tag):
            continue
        body_text = ancestor.get_text(" ", strip=True)
        if len(body_text) >= min_chars and all(marker in body_text for marker in markers):
            container = ancestor
            break
    if container is None or container.name in ("html", "body"):
        raise RuntimeError(f"No se aisló un bloque editorial completo: {title}")

    blocks = []
    block_tags = {"h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "blockquote", "pre"}
    for element in container.find_all(list(block_tags)):
        if element.find_parent(list(block_tags)) is not None:
            continue
        line = clean_text(element)
        if line:
            blocks.append(line)

    content = "\n\n".join(blocks).strip() + "\n"
    if len(content) < min_chars:
        raise RuntimeError(f"Extracción truncada: {title} ({len(content)} caracteres)")
    for marker in markers:
        if marker not in content:
            raise RuntimeError(f"Marcador final/intermedio ausente en {title}: {marker}")
    if RIGHTS_SENTENCE not in content:
        raise RuntimeError(f"No consta la autorización individual en {title}")

    if title == "The Gospel of Thomas":
        nums = {int(n) for n in re.findall(r"\bSaying (\d+):", content)}
        if nums != set(range(1, 115)):
            raise RuntimeError(f"Tomás incompleto: {len(nums)}/114 dichos")
    elif title == "The Infancy Gospel of James":
        nums = {int(n) for n in re.findall(r"\bChapter (\d+):", content)}
        if nums != set(range(1, 26)):
            raise RuntimeError(f"Santiago incompleto: {len(nums)}/25 capítulos")
    elif title == "The Infancy Gospel of Thomas":
        nums = {int(n) for n in re.findall(r"\bChapter (\d+):", content)}
        if nums != set(range(1, 20)):
            raise RuntimeError(f"Infancia de Tomás incompleto: {len(nums)}/19 capítulos")
    return content


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> None:
    records = []
    staged = []
    for slug, title_en, title_es, min_chars, markers in WORKS:
        url = f"{BASE}/{slug}"
        html_bytes = download(url)
        text = extract(html_bytes, title_en, min_chars, markers)
        data = text.encode("utf-8")
        target = ROOT / "en" / f"{slug}.txt"
        staged.append((target, data))
        records.append({
            "id": slug,
            "title_en": title_en,
            "title_es": title_es,
            "source_url": url,
            "source_language": "en",
            "translator": "Mark M. Mattison",
            "rights": "public domain — explicit declaration on source page",
            "file": str(target.relative_to(ROOT)).replace("\\", "/"),
            "source_html_sha256": sha256(html_bytes),
            "text_sha256": sha256(data),
            "utf8_bytes": len(data),
            "characters": len(text),
            "translation_es_status": "pending",
            "web_publication_status": "not_published",
        })
        print(f"VERIFICADO {slug}: {len(data)} bytes, SHA256 {sha256(data)}")

    # Nunca sobrescribir el manifiesto editorial si ya contiene traducciones,
    # licencias, estados públicos o nuevos títulos añadidos posteriormente.
    manifest_path = ROOT / "manifest.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        by_id = {item["id"]: item for item in manifest["works"]}
        for record in records:
            existing = by_id.get(record["id"])
            if existing:
                if existing["text_sha256"] != record["text_sha256"]:
                    raise RuntimeError(
                        "La fuente inglesa ha cambiado; revisión editorial manual requerida: "
                        + record["id"]
                    )
                # La ficha existente, incluida la publicación y traducción,
                # tiene prioridad sobre metadatos de una nueva descarga.
            else:
                manifest["works"].append(record)
    else:
        manifest = {
            "collection": "Scriptura — evangelios extracanonicos",
            "archived_at_utc": datetime.now(timezone.utc).isoformat(),
            "rights_statement": RIGHTS_SENTENCE,
            "rights_url": BASE + "/",
            "type": "editorial_source_archive",
            "status": "source_only_not_translated_not_published",
            "works": records,
        }

    ROOT.mkdir(parents=True, exist_ok=True)
    (ROOT / "en").mkdir(exist_ok=True)
    for target, data in staged:
        target.write_bytes(data)
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print("IMPORTACIÓN VERIFICADA: seis fuentes inglesas; metadatos editoriales preservados.")


if __name__ == "__main__":
    main()
