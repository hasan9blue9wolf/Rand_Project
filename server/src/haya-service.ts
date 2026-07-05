import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { buildFallback } from "./fallback.js";
import { isValidRecommendation, searchFlights, searchPackages } from "./inventory.js";
import { extractPreferences } from "./preferences.js";
import { HAYA_SYSTEM_PROMPT, tools } from "./prompt.js";
import { chatResponseSchema, type ChatRequest, type ChatResponse } from "./schemas.js";

type ResponsesClient = Pick<OpenAI["responses"], "create" | "parse">;
const temporary = (error: unknown) => typeof error === "object" && error !== null && "status" in error && [408, 409, 429, 500, 502, 503, 504].includes(Number(error.status));
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  try { return await operation(); } catch (error) {
    if (!temporary(error)) throw error;
    await sleep(250);
    return operation();
  }
}

export class HayaService {
  constructor(private readonly responses: ResponsesClient | null, private readonly model = "gpt-5.4-mini", private readonly timeoutMs = 12_000, private readonly maxOutputTokens = 700) {}

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.responses) return buildFallback(request);
    const preferences = extractPreferences(request.message, request.preferences);
    const input = [
      ...request.history.map((item) => ({ role: item.role, content: item.content })),
      { role: "user" as const, content: JSON.stringify({ message: request.message, locale: request.locale, preferences }) },
    ];
    try {
      const first = await withRetry(() => this.responses!.create({ model: this.model, instructions: HAYA_SYSTEM_PROMPT, input, tools: [...tools], tool_choice: "auto", max_output_tokens: this.maxOutputTokens }, { signal: AbortSignal.timeout(this.timeoutMs), maxRetries: 0 }));
      const calls = first.output.filter((item) => item.type === "function_call");
      const toolOutputs = calls.map((call) => {
        let output: unknown = [];
        try {
          const args = JSON.parse(call.arguments) as Record<string, unknown>;
          output = call.name === "search_packages" ? searchPackages(args) : call.name === "search_flights" ? searchFlights(args) : [];
        } catch { output = []; }
        return { type: "function_call_output" as const, call_id: call.call_id, output: JSON.stringify(output) };
      });
      const final = await withRetry(() => this.responses!.parse({
        model: this.model, instructions: HAYA_SYSTEM_PROMPT,
        input: toolOutputs.length ? toolOutputs : [{ role: "user", content: "Return the structured response now. Do not recommend inventory unless a tool returned it." }],
        previous_response_id: first.id,
        max_output_tokens: this.maxOutputTokens,
        text: { format: zodTextFormat(chatResponseSchema, "haya_chat_response") },
      }, { signal: AbortSignal.timeout(this.timeoutMs), maxRetries: 0 }));
      const parsed = chatResponseSchema.safeParse(final.output_parsed);
      if (!parsed.success) return buildFallback(request);
      const safe = parsed.data;
      safe.locale = request.locale;
      safe.updatedPreferences = extractPreferences(request.message, safe.updatedPreferences);
      safe.recommendations = safe.recommendations.filter((item) => isValidRecommendation(item.type, item.id));
      if (parsed.data.recommendations.length > 0 && safe.recommendations.length === 0) return buildFallback({ ...request, preferences: safe.updatedPreferences });
      return safe;
    } catch { return buildFallback({ ...request, preferences }); }
  }
}

const positiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const createHayaService = (apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_MODEL || "gpt-5.4-mini") =>
  new HayaService(apiKey?.trim() ? new OpenAI({ apiKey, maxRetries: 0 }).responses : null, model, 12_000, positiveInteger(process.env.MAX_OUTPUT_TOKENS, 700));
