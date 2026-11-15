// Ingesta de la biblioteca documental (§12.3): troceado, embeddings si hay
// proveedor y estado editorial aprobado. Trazable por documento y versión.

import "server-only";
import { db } from "@/shared/db";
import { getProvider } from "./provider";

export interface IngestInput {
  sourceName: string;
  sourceKind: "historical" | "academic" | "religious" | "metadata";
  provenance: string;
  url?: string;
  usageTerms: string;
  title: string;
  author?: string;
  tradition?: string;
  version: string;
  text: string;
  chunkSize?: number;
}

/** Trocea por párrafos con tamaño máximo. */
export function chunkText(text: string, chunkSize = 900): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > chunkSize && current) {
      chunks.push(current);
      current = p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Ingresa un documento (idempotente por título+versión): sustituye sus chunks
 * y regenera embeddings si hay proveedor. Devuelve el número de fragmentos.
 */
export async function ingestDocument(input: IngestInput): Promise<{ ok: true; chunks: number } | { ok: false; error: string }> {
  const provider = getProvider();
  const client = await db().connect();
  try {
    await client.query("BEGIN");

    const { rows: src } = await client.query<{ id: string }>(
      `INSERT INTO knowledge_sources (name, kind, url, license_status, license_evidence, verified_at)
       VALUES ($1, $2, $3, 'licensed', $4, CURRENT_DATE)
       ON CONFLICT (name) DO UPDATE SET kind = EXCLUDED.kind
       RETURNING id`,
      [input.sourceName, input.sourceKind, input.url ?? null, input.provenance]
    );
    const sourceId = src[0].id;

    // Idempotente por (fuente, título, versión): reutiliza el documento existente.
    const { rows: existing } = await client.query<{ id: string }>(
      "SELECT id FROM knowledge_documents WHERE source_id = $1 AND title = $2 AND version = $3",
      [sourceId, input.title, input.version]
    );
    let documentId: string;
    if (existing.length > 0) {
      documentId = existing[0].id;
      await client.query(
        "UPDATE knowledge_documents SET usage_terms = $2, tradition = $3, last_verified_at = now() WHERE id = $1",
        [documentId, input.usageTerms, input.tradition ?? null]
      );
    } else {
      const { rows: doc } = await client.query<{ id: string }>(
        `INSERT INTO knowledge_documents (source_id, title, author, provenance, url, usage_terms, tradition, version, editorial_state, last_verified_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'approved', now())
         RETURNING id`,
        [sourceId, input.title, input.author ?? null, input.provenance, input.url ?? null, input.usageTerms, input.tradition ?? null, input.version]
      );
      documentId = doc[0].id;
    }

    await client.query("DELETE FROM knowledge_chunks WHERE document_id = $1", [documentId]);

    const chunks = chunkText(input.text);
    let embeddings: number[][] | null = null;
    if (provider) {
      try {
        embeddings = await provider.embed(chunks);
      } catch {
        embeddings = null; // sin embeddings: la vía léxica sigue operativa
      }
    }

    for (let i = 0; i < chunks.length; i++) {
      const { rows: ch } = await client.query<{ id: string }>(
        `INSERT INTO knowledge_chunks (document_id, chunk_index, content, char_count)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [documentId, i, chunks[i], chunks[i].length]
      );
      if (embeddings && embeddings[i]) {
        await client.query(
          `INSERT INTO knowledge_embeddings (chunk_id, model, embedding)
           VALUES ($1, $2, $3::vector)
           ON CONFLICT (chunk_id, model) DO UPDATE SET embedding = EXCLUDED.embedding`,
          [ch[0].id, provider!.model, `[${embeddings[i].map((n) => n.toFixed(6)).join(",")}]`]
        );
      }
    }

    await client.query(
      "UPDATE knowledge_documents SET last_verified_at = now() WHERE id = $1",
      [documentId]
    );
    await client.query("COMMIT");
    return { ok: true, chunks: chunks.length };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    return { ok: false, error: err instanceof Error ? err.message : "error de ingesta" };
  } finally {
    client.release();
  }
}
