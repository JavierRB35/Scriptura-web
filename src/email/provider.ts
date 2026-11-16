// Proveedor de correo sustituible (§17.5). Resend cuando esté configurado;
// sin clave, los envíos fallan con error honesto (nunca se simula el éxito).

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendResult {
  id: string;
}

export interface EmailProvider {
  readonly name: string;
  send(email: OutgoingEmail): Promise<SendResult>;
}

export function readEmailConfig(): { apiKey: string; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

export function emailProviderConfigured(): boolean {
  return readEmailConfig() !== null;
}

export function getEmailProvider(): EmailProvider | null {
  const config = readEmailConfig();
  if (!config) return null;
  return {
    name: "resend",
    async send(email: OutgoingEmail) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: config.from, to: [email.to], subject: email.subject, html: email.html }),
      });
      if (!res.ok) throw new Error(`proveedor de correo HTTP ${res.status}`);
      const json = (await res.json()) as { id?: string };
      return { id: json.id ?? "sin-id" };
    },
  };
}
