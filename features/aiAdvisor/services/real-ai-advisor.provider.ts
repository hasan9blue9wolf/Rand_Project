import { ApiRequestError } from "../../../services/api/request";
import { isHayaApiConfigured } from "../../../services/runtime/haya-api-config";
import type { AiAdvisorProvider, AiAdvisorProviderOutput } from "../types";
import { requestHeiaBackend } from "./heia-backend.client";

export const isRealAiAdvisorProviderConfigured = isHayaApiConfigured;

export const createRealAiAdvisorProvider = (): AiAdvisorProvider => ({
  generateResponse: async (request): Promise<AiAdvisorProviderOutput> => {
    try {
      const response = await requestHeiaBackend({
        body: {
          history: request.history,
          latestUserMessage: request.latestUserMessage,
          locale: request.locale,
          recentConversation: request.prompt.recentConversation,
          structuredContext: request.structuredContext,
          templateId: request.templateId,
        },
        language: request.locale,
      });

      return {
        responses: response.responses,
      };
    } catch (error) {
      if (
        error instanceof ApiRequestError &&
        typeof error.data === "object" &&
        error.data !== null &&
        "fallbackResponses" in error.data &&
        Array.isArray(error.data.fallbackResponses)
      ) {
        return {
          responses: error.data.fallbackResponses,
        };
      }

      throw error;
    }
  },
  mode: "real",
  name: "hayatrips-haya-backend",
});
