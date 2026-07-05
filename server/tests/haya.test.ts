import { describe, expect, it, vi } from "vitest";
import { once } from "node:events";
import { createServer } from "node:http";

import { createRequestHandler } from "../src/app.js";
import { HayaService } from "../src/haya-service.js";
import { flightCatalog, packageCatalog, searchFlights, searchPackages } from "../src/inventory.js";
import { extractPreferences } from "../src/preferences.js";
import { RateLimiter } from "../src/rate-limit.js";
import { preferencesSchema, type ChatRequest } from "../src/schemas.js";

const preferences = preferencesSchema.parse({});
const request = (message: string, locale: "en" | "ar" | "fr" = "en"): ChatRequest => ({ message, locale, conversationId: "test", history: [], preferences });

describe("preference extraction", () => {
  it("extracts Arabic preferences", () => {
    const result = extractPreferences("من بغداد إلى دبي، 4 مسافر، ميزانيتي 3000 دولار، 7 أيام عائلية", preferences);
    expect(result).toMatchObject({ departureCity: "Baghdad", budgetMax: 3000, travelers: 4, durationDays: 7, tripType: "family" });
    expect(result.destinationInterests).toContain("Dubai");
  });
  it("extracts English preferences", () => {
    const result = extractPreferences("From Baghdad to Bali, 2 travelers, budget 2500 USD for 6 days luxury", preferences);
    expect(result).toMatchObject({ departureCity: "Baghdad", budgetMax: 2500, travelers: 2, durationDays: 6, luxuryLevel: "luxury" });
    expect(result.destinationInterests).toContain("Bali");
  });
  it("extracts French preferences", () => {
    const result = extractPreferences("Depuis Baghdad vers Paris, 2 voyageurs, budget de 2800 USD pour 5 jours en luxe", preferences);
    expect(result).toMatchObject({ departureCity: "Baghdad", budgetMax: 2800, travelers: 2, durationDays: 5, luxuryLevel: "luxury" });
    expect(result.destinationInterests).toContain("Paris");
  });
});

describe("deterministic inventory tools", () => {
  it("returns package IDs from inventory only", () => expect(searchPackages({ destinationCity: "Bali" }).every((r) => packageCatalog.some((p) => p.id === r.id))).toBe(true));
  it("returns flight IDs from inventory only", () => expect(searchFlights({ fromCity: "Baghdad" }).every((r) => flightCatalog.some((f) => f.id === r.id))).toBe(true));
  it("filters package budgets", () => expect(searchPackages({ budgetMax: 900 }).every((r) => r.price <= 900)).toBe(true));
  it("filters family trips", () => expect(searchPackages({ tripType: "family", travelers: 4 }).every((r) => r.tripType === "family")).toBe(true));
  it("filters luxury trips", () => expect(searchPackages({ luxuryLevel: "luxury" }).every((r) => r.luxuryLevel.toLowerCase().includes("luxury"))).toBe(true));
  it("handles empty inventories", () => { expect(searchPackages({}, [])).toEqual([]); expect(searchFlights({}, [])).toEqual([]); });
});

describe("resilience", () => {
  it("uses fallback when key/client is missing", async () => expect((await new HayaService(null).chat(request("Hello"))).intent).toBe("collect_preferences"));
  it("uses fallback after OpenAI failure", async () => {
    const client = { create: vi.fn().mockRejectedValue(new Error("down")), parse: vi.fn() } as any;
    expect((await new HayaService(client).chat(request("Hello"))).needsMoreInformation).toBe(true);
  });
  it("recovers from malformed model output", async () => {
    const client = { create: vi.fn().mockResolvedValue({ id: "r1", output: [] }), parse: vi.fn().mockResolvedValue({ output_parsed: { bad: true } }) } as any;
    expect((await new HayaService(client).chat(request("Hello"))).intent).toBe("collect_preferences");
  });
  it("removes invalid recommendation IDs", async () => {
    const output = { assistantMessage: "Choice", locale: "en", intent: "recommend_packages", updatedPreferences: preferences, needsMoreInformation: false, followUpQuestions: [], recommendations: [{ type: "package", id: "invented", reason: "x", matchScore: 90 }] };
    const client = { create: vi.fn().mockResolvedValue({ id: "r1", output: [] }), parse: vi.fn().mockResolvedValue({ output_parsed: output }) } as any;
    expect((await new HayaService(client).chat(request("Hello"))).recommendations).toEqual([]);
  });
  it("rate limits requests", () => {
    const limiter = new RateLimiter(1, 60_000);
    expect(limiter.consume("ip").allowed).toBe(true);
    expect(limiter.consume("ip").allowed).toBe(false);
  });
  it("returns an HTTP 429 rate-limit response", async () => {
    const server = createServer(createRequestHandler({ service: new HayaService(null), limiter: new RateLimiter(1, 60_000) }));
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not start");
    const body = JSON.stringify(request("Hello"));
    const url = `http://127.0.0.1:${address.port}/api/haya/chat`;
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    const limited = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    expect(limited.status).toBe(429);
    expect(await limited.json()).toMatchObject({ error: "Too many requests" });
    server.close();
    await once(server, "close");
  });
});

describe("HTTP API", () => {
  async function withServer(run: (baseUrl: string) => Promise<void>, allowedOrigins: string[] = []) {
    const server = createServer(createRequestHandler({ service: new HayaService(null), allowedOrigins }));
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not start");
    try {
      await run(`http://127.0.0.1:${address.port}`);
    } finally {
      server.close();
      await once(server, "close");
    }
  }

  it("returns JSON health status", () => withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toEqual({ ok: true, service: "haya" });
  }));

  it("accepts native chat requests without an Origin header", () => withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/haya/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request("Hello")),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ intent: "collect_preferences" });
  }));

  it("allows configured browser origins and rejects unknown preflights", () => withServer(async (baseUrl) => {
    const allowed = await fetch(`${baseUrl}/api/haya/chat`, {
      method: "OPTIONS",
      headers: { Origin: "https://app.example.com" },
    });
    expect(allowed.status).toBe(204);
    expect(allowed.headers.get("access-control-allow-origin")).toBe("https://app.example.com");

    const denied = await fetch(`${baseUrl}/api/haya/chat`, {
      method: "OPTIONS",
      headers: { Origin: "https://unknown.example.com" },
    });
    expect(denied.status).toBe(403);
    expect(denied.headers.get("access-control-allow-origin")).toBeNull();
  }, ["https://app.example.com"]));

  it("rejects overlong messages with a safe validation error", () => withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/haya/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request("x".repeat(2001))),
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Invalid request" });
  }));
});
