#!/usr/bin/env python3
"""Archiva seis imágenes libres vinculadas a los evangelios extracanonicos.

No altera textos ni habilita funcionalidades. Guarda originales intactos
y variantes WebP para uso futuro. Requiere Pillow. Uso:
  python scripts/import-apocrypha-images.py
  python scripts/import-apocrypha-images.py --verify
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlparse

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets" / "apocrypha" / "originals"
WEB = ROOT / "public" / "images" / "apocrypha"
MANIFEST = ROOT / "data" / "apocrypha" / "images-manifest.json"

# Fichas editoriales contrastadas individualmente en Wikimedia Commons (15-11-2026).
# "relation" distingue un testimonio directo del evangelio de una ilustración posterior.
IMAGES = [
    {
        "gospel_id": "thomas",
        "title_es": "Evangelio de Tomás",
        "commons_file": "Nag_Hammadi_Codex_II.jpg",
        "source_url": "https://upload.wikimedia.org/wikipedia/commons/b/bb/Nag_Hammadi_Codex_II.jpg",
        "commons_page": "https://commons.wikimedia.org/wiki/File:Nag_Hammadi_Codex_II.jpg",
        "license": "Public domain (PD-Art; Wikimedia Commons)",
        "credit": "Autor del manuscrito desconocido; reproducción de folio de Nag Hammadi, Códice II",
        "relation": "manuscript_witness",
        "description_es": "Folio 32 del Códice II de Nag Hammadi: final del Apócrifo de Juan y comienzo del Evangelio de Tomás.",
        "alt_es": "Folio antiguo en copto con el comienzo del Evangelio de Tomás.",
    },
    {
        "gospel_id": "mary",
        "title_es": "Evangelio de María",
        "commons_file": "Gospel_of_Mary.jpg",
        "source_url": "https://upload.wikimedia.org/wikipedia/commons/4/49/Gospel_of_Mary.jpg",
        "commons_page": "https://commons.wikimedia.org/wiki/File:Gospel_of_Mary.jpg",
        "license": "Public domain (PD-old; Wikimedia Commons)",
        "credit": "P.Oxy. L 3525; Ashmolean Museum, Oxford; autor antiguo desconocido",
        "relation": "manuscript_witness",
        "description_es": "Fragmento griego P. Oxyrhynchus 3525 del Evangelio de María; no es el códice copto de Berlín.",
        "alt_es": "Fragmento de papiro griego con texto conservado del Evangelio de María.",
    },
    {
        "gospel_id": "judas",
        "title_es": "Evangelio de Judas",
        "commons_file": "Codex_Tchacos_p33.jpg",
        "source_url": "https://upload.wikimedia.org/wikipedia/commons/4/49/Codex_Tchacos_p33.jpg",
        "commons_page": "https://commons.wikimedia.org/wiki/File:Codex_Tchacos_p33.jpg",
        "license": "Public domain / Public Domain Mark (Wikimedia Commons)",
        "credit": "Códice Tchacos, p. 33; reproducción incorporada a Wikimedia Commons por WolfgangRieger",
        "relation": "manuscript_witness",
        "description_es": "Página 33 del Códice Tchacos, comienzo del Evangelio de Judas.",
        "alt_es": "Página de papiro copto fragmentario del Códice Tchacos con el comienzo del Evangelio de Judas.",
    },
    {
        "gospel_id": "peter",
        "title_es": "Evangelio de Pedro",
        "commons_file": "Gospel_of_Peter.jpg",
        "source_url": "https://upload.wikimedia.org/wikipedia/commons/7/73/Gospel_of_Peter.jpg",
        "commons_page": "https://commons.wikimedia.org/wiki/File:Gospel_of_Peter.jpg",
        "license": "Public domain (PD-old; Wikimedia Commons)",
        "credit": "Fragmento de Akhmim; autor del manuscrito antiguo desconocido",
        "relation": "manuscript_witness",
        "description_es": "Página del manuscrito de Akhmim asociado al Evangelio de Pedro.",
        "alt_es": "Página antigua en griego del Evangelio de Pedro recuperada en Akhmim.",
    },
    {
        "gospel_id": "infancyjames",
        "title_es": "Protoevangelio de Santiago",
        "commons_file": "Trebizond_Gospels,_The_Annunciation,_Walters_Manuscript_W.531,_fol._102v.jpg",
        "source_url": "https://upload.wikimedia.org/wikipedia/commons/6/68/Trebizond_Gospels%2C_The_Annunciation%2C_Walters_Manuscript_W.531%2C_fol._102v.jpg",
        "commons_page": "https://commons.wikimedia.org/wiki/File:Trebizond_Gospels,_The_Annunciation,_Walters_Manuscript_W.531,_fol._102v.jpg",
        "license": "CC0 1.0 (Walters Art Museum)",
        "credit": "Walters Art Museum, manuscrito W.531, folio 102v, escena de la Anunciación",
        "relation": "historical_illustration",
        "description_es": "Miniatura medieval de la Anunciación con detalles iconográficos relacionados con el Protoevangelio de Santiago 10:2–11:1. NO es una página de ese evangelio.",
        "alt_es": "Miniatura medieval de la Anunciación, relacionada con pasajes del Protoevangelio de Santiago.",
    },
    {
        "gospel_id": "infancythomas",
        "title_es": "Evangelio de la infancia de Tomás",
        "commons_file": "Codex_Sabaiticus_259_66r_Infancy_Gospel_of_Thomas.jpg",
        "source_url": "https://upload.wikimedia.org/wikipedia/commons/6/67/Codex_Sabaiticus_259_66r_Infancy_Gospel_of_Thomas.jpg",
        "commons_page": "https://commons.wikimedia.org/wiki/File:Codex_Sabaiticus_259_66r_Infancy_Gospel_of_Thomas.jpg",
        "license": "Public domain / Public Domain Mark (Library of Congress)",
        "credit": "Hagios Sabas 259, fol. 66r; Biblioteca del Patriarcado Griego de Jerusalén; digitalización Library of Congress",
        "relation": "manuscript_witness",
        "description_es": "Comienzo del Evangelio de la infancia de Tomás en el manuscrito griego Hagios Sabas 259 (1089).",
        "alt_es": "Folio griego medieval con el comienzo del Evangelio de la infancia de Tomás.",
    },
]


def digest(data: bytes) -> str:
    return sha256(data).hexdigest()


def archive() -> None:
    # No escribir ningún archivo hasta que todas las descargas se hayan validado.
    staged = []
    for item in IMAGES:
        url = item["source_url"]
        assert urlparse(url).hostname == "upload.wikimedia.org"
        req = Request(url, headers={
            "User-Agent": "ScripturaWeb/1.0 (educational sources; Wikimedia Commons)",
            "Accept": "image/jpeg,image/*;q=0.9",
        })
        with urlopen(req, timeout=50) as response:
            final_url = response.geturl()
            if urlparse(final_url).hostname != "upload.wikimedia.org":
                raise ValueError(f"Redirección a un dominio no esperado: {final_url}")
            original = response.read()
        if len(original) < 12000 or len(original) > 12000000:
            raise ValueError(f"Imagen inusual: {item['gospel_id']} ({len(original)} bytes)")
        with Image.open(BytesIO(original)) as raw:
            if raw.format != "JPEG":
                raise ValueError(f"No es JPEG: {item['gospel_id']} ({raw.format})")
            if raw.width < 450 or raw.height < 580:
                raise ValueError(f"Resolución insuficiente: {item['gospel_id']}")
            image = ImageOps.exif_transpose(raw).convert("RGB")
        image.thumbnail((1500, 1800), Image.Resampling.LANCZOS)
        optimized_stream = BytesIO()
        image.save(optimized_stream, format="WEBP", quality=82, method=6)
        optimized = optimized_stream.getvalue()
        if len(optimized) > 1400000:
            raise ValueError(f"WebP demasiado pesado: {item['gospel_id']}")
        basename = f"{item['gospel_id']}.jpg"
        original_path = DEST / basename
        web_path = WEB / f"{item['gospel_id']}.webp"
        staged.append((original_path, original, web_path, optimized))
        item["original_path"] = original_path.relative_to(ROOT).as_posix()
        item["web_path"] = "/" + web_path.relative_to(ROOT / "public").as_posix()
        item["original_sha256"] = digest(original)
        item["web_sha256"] = digest(optimized)
        item["original_bytes"] = len(original)
        item["web_bytes"] = len(optimized)
        item["web_dimensions"] = {"width": image.width, "height": image.height}
        item["status"] = "asset_ready_not_yet_used_in_reader"
        print(f"OK {item['gospel_id']} / orig {len(original)} bytes / webp {len(optimized)} bytes")

    DEST.mkdir(parents=True, exist_ok=True)
    WEB.mkdir(parents=True, exist_ok=True)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    for original_path, original, web_path, optimized in staged:
        original_path.write_bytes(original)
        web_path.write_bytes(optimized)
    payload = {
        "collection": "Scriptura — imágenes para evangelios extracanonicos",
        "archived_at_utc": datetime.now(timezone.utc).isoformat(),
        "status": "assets_ready_not_published_in_catalog",
        "image_count": len(IMAGES),
        "notes": "5 testimonios de manuscritos y 1 ilustración histórica claramente identificada. No confundir obra, testimonio y recreación.",
        "images": IMAGES,
    }
    MANIFEST.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    verify()


def verify() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    items = data["images"]
    assert len(items) == 6
    assert {i["gospel_id"] for i in items} == {"thomas", "mary", "judas", "peter", "infancyjames", "infancythomas"}
    assert sum(i["relation"] == "historical_illustration" for i in items) == 1
    for item in items:
        for path_key, sha_key in (("original_path", "original_sha256"), ("web_path", "web_sha256")):
            relative = item[path_key].lstrip("/")
            real_path = (ROOT / "public" / relative) if path_key == "web_path" else ROOT / relative
            data_bytes = real_path.read_bytes()
            if digest(data_bytes) != item[sha_key]:
                raise ValueError(f"Integridad incorrecta: {real_path}")
            with Image.open(real_path) as photo:
                photo.verify()
        print(f"VERIFICADO {item['gospel_id']} {item['web_path']}")
    print("INTEGRIDAD APROBADA: 6/6 pares de original/WebP y manifiesto")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    verify() if args.verify else archive()
