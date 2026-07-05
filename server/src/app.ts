import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { createHayaService, type HayaService } from "./haya-service.js";
import { RateLimiter } from "./rate-limit.js";
import { chatRequestSchema } from "./schemas.js";

const MAX_BODY_BYTES = 64 * 1024;
const send = (response: ServerResponse, status: number, body: unknown, requestId: string, headers: Record<string, string> = {}) => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "X-Request-Id": requestId, ...headers });
  response.end(JSON.stringify(body));
};
async function body(request: IncomingMessage) {
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of request) { const value = Buffer.from(chunk); size += value.length; if (size > MAX_BODY_BYTES) throw new Error("too_large"); chunks.push(value); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export function createRequestHandler({ service = createHayaService(), limiter = new RateLimiter(), allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((v) => v.trim()).filter(Boolean) }: { service?: HayaService; limiter?: RateLimiter; allowedOrigins?: string[] } = {}) {
  return async (request: IncomingMessage, response: ServerResponse) => {
    const requestId = randomUUID();
    const origin = request.headers.origin;
    const cors: Record<string, string> = origin && allowedOrigins.includes(origin) ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "Content-Type,X-Request-Id", "Access-Control-Allow-Methods": "POST,GET,OPTIONS", Vary: "Origin" } : {};
    if (request.method === "OPTIONS") { response.writeHead(origin && !allowedOrigins.includes(origin) ? 403 : 204, cors); response.end(); return; }
    if (request.method === "GET" && request.url === "/health") { send(response, 200, { ok: true, service: "haya" }, requestId, cors); return; }
    if (request.method !== "POST" || request.url !== "/api/haya/chat") { send(response, 404, { error: "Not found", requestId }, requestId, cors); return; }
    const ip = String(request.headers["x-forwarded-for"] ?? request.socket.remoteAddress ?? "anonymous").split(",")[0]!.trim();
    const rate = limiter.consume(ip);
    if (!rate.allowed) { send(response, 429, { error: "Too many requests", requestId }, requestId, { ...cors, "Retry-After": String(rate.retryAfter) }); return; }
    if (!String(request.headers["content-type"] ?? "").includes("application/json")) { send(response, 415, { error: "JSON body required", requestId }, requestId, cors); return; }
    try {
      const parsed = chatRequestSchema.safeParse(await body(request));
      if (!parsed.success) { send(response, 400, { error: "Invalid request", requestId }, requestId, cors); return; }
      const result = await service.chat(parsed.data);
      send(response, 200, { ...result, requestId }, requestId, cors);
    } catch (error) {
      send(response, error instanceof Error && error.message === "too_large" ? 413 : 400, { error: "Request could not be processed", requestId }, requestId, cors);
    }
  };
}
