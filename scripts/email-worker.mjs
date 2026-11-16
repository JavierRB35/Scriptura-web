#!/usr/bin/env node
// Worker de la cola de correos diarios (§13.4).
// Uso: node scripts/email-worker.mjs [--fecha YYYY-MM-DD] [--limit N]
// Encola para la fecha litúrgica indicada (por defecto hoy UTC) y procesa
// los pendientes con reintentos. Diseñado para cron (Vercel Cron o similar).
import pg from "pg";
import { enqueueForLocalDate, processPendingJobs } from "../src/email/service.ts";

const args = process.argv.slice(2);
const fechaIdx = args.indexOf("--fecha");
const limitIdx = args.indexOf("--limit");
const localDate = fechaIdx >= 0 ? args[fechaIdx + 1] : new Date().toISOString().slice(0, 10);
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : 100;

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL.");
  process.exit(1);
}

const summary = await enqueueForLocalDate(localDate);
console.log(`Encolados ${summary.queued} (ya en cola: ${summary.alreadyQueued}).`);
const processed = await processPendingJobs(undefined, limit);
console.log(`Enviados: ${processed.sent} · omitidos: ${processed.skipped} · fallidos: ${processed.failed}.`);
