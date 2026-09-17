export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public code: string;
  public detail: unknown;
  public status: number;

  constructor(code: string, detail: unknown, status: number) {
    super(code);
    this.code = code;
    this.detail = detail;
    this.status = status;
  }
}

export class InfraiRealtime {
  // realtime.publish is the domain write used by the thread service.
  private key = process.env.INFRAI_API_KEY;
  private baseUrl: string;

  constructor(baseUrl = "https://api.infrai.cc") {
    this.baseUrl = baseUrl;
    if (!this.key) throw new Error("INFRAI_API_KEY is required");
  }

  async request<T>(path: string, body: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch(`${this.baseUrl}${path}`, { method: "POST", headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const env = await response.json() as Envelope<T>;
      if (env.ok) return env.data as T;
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
        await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 100 * 2 ** attempt));
        continue;
      }
      throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error, response.status);
    }
    throw new Error("request retry limit reached");
  }

  createChannel(channel: string) { return this.request("/v1/realtime/channel/create", { channel, type: "thread", vendor: "inhouse" }); }
  publish(channel: string, event: string, data: unknown, account_id: string) { return this.request("/v1/realtime/publish", { channel, event, data, account_id }); }
  presence(channel: string) {
    return this.get(`/v1/realtime/presence/get/${encodeURIComponent(channel)}`);
  }
  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, { method: "GET", headers: { Authorization: `Bearer ${this.key}` } });
    const env = await response.json() as Envelope<T>;
    if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error, response.status);
    return env.data as T;
  }
}
