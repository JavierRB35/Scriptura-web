// Proveedor de IA sustituible (§17.5): interfaz interna compatible con
// endpoints OpenAI (OpenAI, Groq,otros). Claves solo en servidor (§12.6).
// Sin configuración: modo degradado honesto (el asistente no se ofrece).

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResult {
  text: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AiProvider {
  readonly name: string;
  readonly model: string;
  chat(messages: ChatMessage[]): Promise<ChatResult>;
  embed(texts: string[]): Promise<number[][]>;
}

export interface AiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  embeddingModel: string;
}

export function readAiConfig(): AiConfig | null {
  const baseUrl = process.env.AI_PROVIDER_BASE_URL;
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  const model = process.env.AI_PROVIDER_MODEL;
  if (!baseUrl || !apiKey || !model) return null;
  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey,
    model,
    embeddingModel: process.env.AI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  };
}

export function aiConfigured(): boolean {
  return readAiConfig() !== null;
}

/** Implementación OpenAI-compatible. */
export class OpenAiCompatibleProvider implements AiProvider {
  readonly name: string;
  readonly model: string;

  constructor(private config: AiConfig) {
    this.name = new URL(config.baseUrl).hostname;
    this.model = config.model;
  }

  async chat(messages: ChatMessage[]): Promise<ChatResult> {
    const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        temperature: 0.2,
      }),
    });
    if (!res.ok) {
      throw new Error(`proveedor IA HTTP ${res.status}`);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    return {
      text: json.choices?.[0]?.message?.content ?? "",
      provider: this.name,
      model: this.config.model,
      inputTokens: json.usage?.prompt_tokens,
      outputTokens: json.usage?.completion_tokens,
    };
  }

  async embed(texts: string[]): Promise<number[][]> {
    const res = await fetch(`${this.config.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: this.config.embeddingModel, input: texts }),
    });
    if (!res.ok) {
      throw new Error(`embeddings HTTP ${res.status}`);
    }
    const json = (await res.json()) as { data?: { embedding: number[] }[] };
    return (json.data ?? []).map((d) => d.embedding);
  }
}

export function getProvider(): AiProvider | null {
  const config = readAiConfig();
  return config ? new OpenAiCompatibleProvider(config) : null;
}
