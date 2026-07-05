import { deterministicTurn } from "./conversation-state.js";
import type { ChatRequest, ChatResponse } from "./schemas.js";

export function buildFallback(request: ChatRequest): ChatResponse {
  return deterministicTurn(request);
}
