// Helper compartido por acciones e interfaz (evita ciclos de importación).
import "server-only";
import { aiConfigured } from "./provider";

export { askReadingAssistant, grantConsent, revokeConsent, remainingQuota } from "./assistant";
export function aiConfiguredStatus(): boolean {
  return aiConfigured();
}
