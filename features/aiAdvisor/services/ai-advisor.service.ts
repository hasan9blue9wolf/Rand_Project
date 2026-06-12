import { isDemoModeEnabled } from "../../../services/runtime/app-mode";
import type {
  AiAdvisorProvider,
  AiAdvisorProviderMode,
  AiAdvisorTurnRequest,
  AiAdvisorTurnResult,
} from "../types";
import {
  buildAiAdvisorStructuredContext,
  selectAiAdvisorPromptTemplate,
} from "./ai-advisor.context";
import {
  buildAiAdvisorFallbackResponses,
  buildAiAdvisorSafetyResponses,
} from "./ai-advisor.fallback";
import {
  buildAiAdvisorConversationMemory,
  isUnsafeTravelRequest,
} from "./ai-advisor.memory";
import { parseAiAdvisorProviderOutput } from "./ai-advisor.output-parser";
import { buildAiAdvisorPromptBundle } from "./ai-advisor.prompt-builder";
import {
  createDirectPreviewAiAdvisorProvider,
  isDirectPreviewAiAdvisorProviderConfigured,
} from "./direct-preview-ai-advisor.provider";
import { createMockAiAdvisorProvider } from "./mock-ai-advisor.provider";
import {
  createRealAiAdvisorProvider,
  isRealAiAdvisorProviderConfigured,
} from "./real-ai-advisor.provider";

const { EXPO_PUBLIC_HEIA_PROVIDER } = process.env as Record<
  string,
  string | undefined
>;

const resolveProvider = (
  providerMode?: AiAdvisorProviderMode,
): AiAdvisorProvider => {
  const requestedProvider = providerMode ?? EXPO_PUBLIC_HEIA_PROVIDER;

  if (
    requestedProvider === "direct-preview" &&
    isDirectPreviewAiAdvisorProviderConfigured()
  ) {
    return createDirectPreviewAiAdvisorProvider();
  }

  if (requestedProvider === "real" && isRealAiAdvisorProviderConfigured()) {
    return createRealAiAdvisorProvider();
  }

  if (isDemoModeEnabled()) {
    return createMockAiAdvisorProvider();
  }

  return createMockAiAdvisorProvider();
};

export const requestAiAdvisorTurn = async ({
  history,
  latestUserMessage,
  locale,
  previousMemory,
  providerMode,
}: AiAdvisorTurnRequest): Promise<AiAdvisorTurnResult> => {
  const memory = buildAiAdvisorConversationMemory({
    history,
    latestUserMessage,
    locale,
    ...(previousMemory ? { previousMemory } : {}),
  });

  if (isUnsafeTravelRequest(latestUserMessage)) {
    return {
      memory,
      providerName: "safety-guard",
      responses: buildAiAdvisorSafetyResponses({ locale }),
      usedFallback: true,
    };
  }

  const structuredContext = buildAiAdvisorStructuredContext({
    history,
    locale,
    memory,
  });
  const templateId = selectAiAdvisorPromptTemplate({
    latestUserMessage,
    structuredContext,
  });

  const provider = resolveProvider(providerMode);
  const prompt = buildAiAdvisorPromptBundle({
    history,
    latestUserMessage,
    locale,
    structuredContext,
    templateId,
  });

  try {
    const rawProviderOutput = await provider.generateResponse({
      history,
      latestUserMessage,
      locale,
      memory,
      prompt,
      structuredContext,
      templateId,
    });
    const parsedOutput = parseAiAdvisorProviderOutput(rawProviderOutput);

    return {
      memory,
      providerName: provider.name,
      responses: parsedOutput.responses,
      usedFallback: false,
    };
  } catch {
    return {
      memory,
      providerName: provider.name,
      responses: buildAiAdvisorFallbackResponses({
        locale,
        memorySummary: memory.userIntentSummary,
      }),
      usedFallback: true,
    };
  }
};
