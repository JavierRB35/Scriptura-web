// Pruebas de integración de IA (Fase 5) contra PostgreSQL real:
// ingesta documental, recuperación léxica de versículos/chunks, consentimiento
// y cuota diaria. Sin proveedor real: se comprueba el modo degradado honesto.

import { beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { ingestDocument } from "@/ai/ingest";
import { retrieve } from "@/ai/rag";
import { remainingQuota, hasValidConsent, grantConsent, revokeConsent, askReadingAssistant } from "@/ai/assistant";

const DATABASE_URL = process.env.DATABASE_URL;
const d = describe.skipIf(!DATABASE_URL);

let client: pg.Client;
let editionId: string;
let userId: string;

beforeAll(async () => {
  client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  const { rows: ed } = await client.query("SELECT id FROM bible_editions WHERE identifier = 'spaRV1909'");
  editionId = ed[0].id;
  const email = `ia-${Date.now()}@scriptura.test`;
  const { rows } = await client.query("INSERT INTO auth.users (email) VALUES ($1) RETURNING id", [email]);
  userId = rows[0].id;
});

d("ingesta documental (§12.3)", () => {
  it("ingesta un documento con chunks aprobados y es idempotente por versión", async () => {
    const text = [
      "Los fariseos eran un grupo judío del periodo del Segundo Templo.",
      "Insistían en la pureza ritual y la ley oral. Su origen se relaciona con los hasidim.",
      "",
      "Los saduceos controlaban el Templo y negaban la resurrección según Joséfo.",
      "Su influencia decayó tras la destrucción del año 70.",
    ].join("\n\n");
    const first = await ingestDocument({
      sourceName: "Prueba IA · contexto histórico",
      sourceKind: "historical",
      provenance: "Fichas editoriales de prueba para la suite de integración",
      usageTerms: "Contenido propio de prueba (solo base de test)",
      title: "Fariseos y saduceos (test)",
      tradition: "Judaísmo del Segundo Templo",
      version: "1",
      text,
    });
    expect(first.ok).toBe(true);

    const { rows: chunks } = await client.query(
      `SELECT kc.content FROM knowledge_chunks kc
         JOIN knowledge_documents kd ON kd.id = kc.document_id
        WHERE kd.title = 'Fariseos y saduceos (test)'`
    );
    expect(chunks.length).toBeGreaterThanOrEqual(1);

    // Reingesta misma versión: no duplica chunks (borra y recrea).
    await ingestDocument({
      sourceName: "Prueba IA · contexto histórico",
      sourceKind: "historical",
      provenance: "Fichas editoriales de prueba",
      usageTerms: "Contenido propio de prueba",
      title: "Fariseos y saduceos (test)",
      tradition: "Judaísmo del Segundo Templo",
      version: "1",
      text,
    });
    const { rows: again } = await client.query(
      `SELECT count(*)::int AS n FROM knowledge_chunks kc
         JOIN knowledge_documents kd ON kd.id = kc.document_id
        WHERE kd.title = 'Fariseos y saduceos (test)'`
    );
    expect(again[0].n).toBe(chunks.length);
  });
});

d("recuperación (§12.2, §12.4)", () => {
  it("versículos por referencia explícita: Jn 3:16 desde el repositorio autorizado", async () => {
    const r = await retrieve("¿Qué significa Juan 3:16?", editionId);
    const ref = r.verses.find((v) => v.bookCode === "Jn" && v.chapter === 3 && v.verseNumber === 16);
    expect(ref).toBeDefined();
    expect(ref!.source).toBe("referencia");
    expect(ref!.text.startsWith("Porque de tal manera amó Dios")).toBe(true);
  });

  it("sin referencia explícita busca por texto completo y no inventa", async () => {
    const r = await retrieve("¿dónde habla del buen pastor y las ovejas?", editionId);
    // Puede haber coincidencias léxicas (Jn 10) o ninguna: jamás lanza ni inventa.
    for (const v of r.verses) expect(v.text.length).toBeGreaterThan(0);
  });

  it("recupera chunks documentales aprobados por término", async () => {
    const r = await retrieve("¿Quiénes eran los saduceos y qué creían?", editionId);
    expect(r.chunks.some((c) => c.documentTitle.includes("Fariseos"))).toBe(true);
  });
});

d("consentimiento y cuota (§12.6)", () => {
  it("sin consentimiento el asistente rechaza; tras concederlo y sin proveedor, modo degradado honesto", async () => {
    expect(await hasValidConsent(userId)).toBe(false);
    const before = await askReadingAssistant(userId, "¿Qué significa Juan 3:16?");
    expect(before.ok).toBe(false);
    expect((before as { error: string }).error).toContain("consentimiento");

    await grantConsent(userId);
    expect(await hasValidConsent(userId)).toBe(true);

    const after = await askReadingAssistant(userId, "¿Qué significa Juan 3:16?");
    // Sin proveedor configurado (no hay AI_PROVIDER_*): rechazo honesto, no simulación.
    if (!(process.env.AI_PROVIDER_API_KEY)) {
      expect(after.ok).toBe(false);
      expect((after as { error: string }).error).toContain("no está configurado");
    }

    await revokeConsent(userId);
    expect(await hasValidConsent(userId)).toBe(false);
  });

  it("la cuota restante se calcula desde los eventos reales del día", async () => {
    await client.query(
      `INSERT INTO ai_usage_events (user_id, capability, provider, model, success)
       VALUES ($1, 'reading_assistant', 'test', 'test-model', true)`,
      [userId]
    );
    const remaining = await remainingQuota(userId);
    expect(remaining).toBe(19); // cuota semilla 20 - 1 evento
  });

  it("limpieza de usuario de prueba", async () => {
    await client.query("DELETE FROM ai_usage_events WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM user_consents WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM auth.users WHERE id = $1", [userId]);
    const { rows } = await client.query("SELECT count(*)::int AS n FROM profiles WHERE id = $1", [userId]);
    expect(rows[0].n).toBe(0);
  });
});
