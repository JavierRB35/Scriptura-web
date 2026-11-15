#!/usr/bin/env python3
"""Verificación estructural de seis traducciones iniciales y de futuras incorporaciones.

Sin bibliotecas externas, sin consultas de red ni cambios en la base de datos.
Valida fuente inglesa, integridad SHA, numeración y variantes; NO sustituye
una corrección editorial humana ni una colación filológica desde copto/griego.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "data" / "apocrypha"
RIGHTS = "The following translation has been committed to the public domain"
COMPLETE = "draft_completed_pending_editorial_review"
BOOK_IDS = {"thomas", "mary", "peter", "infancyjames", "infancythomas", "judas"}
NOTES = {"thomas": 6, "mary": 4, "peter": 0,
         "infancyjames": 10, "infancythomas": 9, "judas": 13}


def require(condition: bool, msg: str) -> None:
    if not condition:
        raise AssertionError(msg)


def git_blob_sha(content: bytes) -> str:
    return hashlib.sha1(
        b"blob " + str(len(content)).encode("ascii") + b"\0" + content
    ).hexdigest()


def number_list(body: str, pattern: str) -> list[int]:
    return [int(m.group(1)) for m in re.finditer(pattern, body, flags=re.M)]


def excerpt(text: str, start: str, end: str | None) -> str:
    i = text.find(start)
    require(i != -1, f"No se encuentra el encabezado: {start}")
    j = text.find(end, i) if end is not None else -1
    if end is not None:
        require(j != -1, f"No se encuentra el final de sección: {end}")
    return text[i:j if j >= 0 else None]


def sections(text: str, pattern: str) -> dict[int, list[int]]:
    matches = list(re.finditer(pattern, text, flags=re.M))
    result: dict[int, list[int]] = {}
    for i, match in enumerate(matches):
        number = int(match.group(1))
        require(number not in result, f"Capítulo duplicado: {number}")
        ending = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[match.end():ending]
        result[number] = number_list(body, r"\((\d+)\)")
    return result


def verify_chapters(en: str, es: str, id_: str) -> None:
    en_body = excerpt(
        en, "Chapter 1:",
        "Appendix: A Shorter" if id_ == "infancyjames" else "\nNotes\n"
    )
    es_body = excerpt(
        es, "## Capítulo 1.",
        "## Apéndice." if id_ == "infancyjames" else "\n## Notas "
    )
    original = sections(en_body, r"^Chapter (\d+):[^\n]*")
    translated = sections(es_body, r"^## Capítulo (\d+)\.[^\n]*")
    expected_count = 25 if id_ == "infancyjames" else 19
    require(list(original) == list(range(1, expected_count + 1)),
            f"{id_}: capítulos originales inconsistentes")
    require(translated == original,
            f"{id_}: capítulos o párrafos numerados alterados: {original} != {translated}")

    if id_ == "infancyjames":
        en_appendix = excerpt(en, "Appendix: A Shorter", "\nNotes\n")
        es_appendix = excerpt(es, "### Capítulo 18 (versión breve)", "\n## Notas ")
        original_alt = sections(en_appendix, r"^Chapter (\d+):[^\n]*")
        translated_alt = sections(es_appendix, r"^### Capítulo (\d+) \(versión breve\)[^\n]*")
        require(list(original_alt) == [18, 19, 20, 21],
                "Santiago: faltan capítulos alternativos del Papiro Bodmer V")
        require(translated_alt == original_alt,
                "Santiago: divergencia de párrafos numerados en versión breve")
    else:
        require("capítulos 17 y 18 no aparecen" in es.lower()
                or "capítulos 17 y 18 no aparecen" in es,
                "Infancia de Tomás: falta el aviso de manuscritos tardíos")
        require("capítulo 10" in es.lower(), "Infancia de Tomás: falta nota de posición")


def verify(id_: str, work: dict) -> None:
    en_bytes = (ROOT / "en" / (id_ + ".txt")).read_bytes()
    en = en_bytes.decode("utf-8")
    es_path = ROOT / work["translation_es_file"]
    es_bytes = es_path.read_bytes()
    es = es_bytes.decode("utf-8")
    require(work["translation_es_file"] == f"es/{id_}.md",
            f"{id_}: ruta de traducción incorrecta")
    require(work["translation_es_status"] == COMPLETE,
            f"{id_}: traducción no marcada como borrador completo")
    require(work["web_publication_status"] in {"not_published", "public_draft", "published"},
            f"{id_}: estado público no reconocido")
    if work["web_publication_status"] in {"public_draft", "published"}:
        require(bool(work.get("library", {}).get("category")) and
                bool(work.get("library", {}).get("summary")),
                f"{id_}: faltan metadatos públicos del catálogo")
    require(RIGHTS in en, f"{id_}: falta licencia del original inglés")
    require(hashlib.sha256(en_bytes).hexdigest() == work["text_sha256"],
            f"{id_}: cambió el original inglés")
    require(git_blob_sha(es_bytes) == work["translation_es_github_blob_sha"],
            f"{id_}: el texto español no coincide con el hash versionado")
    require(len(es) > max(1500, len(en) * 0.6), f"{id_}: traducción aparentemente truncada")
    require("Traducción española de trabajo" in es,
            f"{id_}: no se indica que esta versión es una traducción de trabajo")
    require("SCRIPTURA_LINE_BREAK" not in es,
            f"{id_}: marcador HTML residual en texto español")

    if id_ == "thomas":
        en_body = excerpt(en, "Saying 1:", "\nThe Gospel\nAccording to Thomas")
        en_nums = number_list(en_body, r"^Saying (\d+):")
        es_nums = number_list(es, r"^## Dicho (\d+)\.")
        require(en_nums == es_nums == list(range(1, 115)),
                "Tomás: los 114 dichos no están completos o numerados")
        require("## Prólogo" in es and "[…]" in es and "/igual\\" in es,
                "Tomás: faltan el prólogo, lagunas o correcciones de copia")
    elif id_ == "peter":
        en_nums = number_list(en[en.index("Pilate and Herod"):], r"\((\d+)\)")
        es_body = excerpt(es, "## Pilato y Herodes", "\n## Nota editorial")
        es_nums = number_list(es_body, r"\((\d+)\)")
        require(en_nums == es_nums == list(range(1, 61)),
                "Pedro: los 60 números no coinciden con el original")
    elif id_ == "mary":
        pages = number_list(es, r"⟦p\. (\d+)⟧")
        require(pages == [7, 8, 9, 10, 15, 16, 17, 18, 19],
                f"María: paginación original incompleta: {pages}")
        require("Faltan las páginas 1 a 6" in es and
                "Faltan las páginas 11 a 14" in es,
                "María: deben señalarse las páginas no conservadas")
    elif id_ == "judas":
        pages = number_list(excerpt(es, "## Introducción", "\n## Notas "), r"⟦p\. (\d+)⟧")
        require(pages == list(range(33, 59)),
                f"Judas: paginación 33–58 incompleta: {pages}")
    elif id_ in {"infancyjames", "infancythomas"}:
        verify_chapters(en, es, id_)

    if NOTES.get(id_, 0) > 0:
        notes = excerpt(es, "## Notas ", None)
        n = len(re.findall(r"^- \*\*", notes, flags=re.M))
        require(n == NOTES[id_], f"{id_}: faltan notas de traducción ({n})")

    print(f"OK {id_}: fuente SHA-256, traducción SHA Git y estructura verificadas")


def main() -> None:
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    works = manifest["works"]
    require(len(works) >= 6 and BOOK_IDS.issubset({w["id"] for w in works}),
            "Inventario inconsistente: faltan evangelios iniciales")
    require(all(w["translation_es_status"] == COMPLETE for w in works),
            "Existe al menos una traducción española incompleta")
    for work in works:
        verify(work["id"], work)
    require(manifest["translation_completion"]["pending_translation"] == 0,
            "El manifiesto declara traducciones pendientes")
    require(manifest["translation_completion"]["spanish_full_drafts"] >= 6,
            "El manifiesto debe reflejar al menos seis borradores completos")
    require(manifest["translation_completion"].get("available_in_library_as_draft", 0) >= 6,
            "El manifiesto debe reflejar las obras accesibles en la Biblioteca")
    print("VERIFICADO: seis textos iniciales íntegros y catálogo preparado para nuevas obras.")
    print("AVISO: la verificación es estructural, no un cotejo lingüístico humano.")


if __name__ == "__main__":
    main()
