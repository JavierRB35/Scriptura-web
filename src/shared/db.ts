// Pool de PostgreSQL para el servidor de Scriptura (conexión propietaria).
// La autorización se aplica en la capa de servidor (§18.6); RLS protege la
// superficie anon/authenticated. Este módulo nunca se importa en cliente.

import "server-only";
import pg from "pg";
import { getServerEnv } from "./env";

declare global {
  var __scripturaPool: pg.Pool | undefined;
}

function createPool(): pg.Pool {
  return new pg.Pool({
    connectionString: getServerEnv().DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

/** Pool compartido (evita agotar conexiones en recargas de desarrollo). */
export function db(): pg.Pool {
  if (!globalThis.__scripturaPool) {
    globalThis.__scripturaPool = createPool();
  }
  return globalThis.__scripturaPool;
}

/** Consulta con parámetros tipada mínima. */
export async function query<T extends pg.QueryResultRow>(
  text: string,
  params: readonly unknown[] = []
): Promise<pg.QueryResult<T>> {
  return db().query<T>(text, params as unknown[]);
}
