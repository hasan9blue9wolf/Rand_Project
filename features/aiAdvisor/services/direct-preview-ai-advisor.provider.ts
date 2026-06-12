import Constants from "expo-constants";

import type { AiAdvisorProvider, AiAdvisorProviderOutput } from "../types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini-2026-03-17";
const DEFAULT_TIMEOUT_MS = 30_000;

type DirectPreviewConfig = {
  heiaDirectPreviewModel?: string;
  heiaDirectPreviewOpenAiApiKey?: string;
  heiaDirectPreviewTimeoutMs?: number;
};

const directPreviewConfig = (Constants.expoConfig?.extra ??
  {}) as DirectPreviewConfig;

const trimValue = (value?: string | null) => value?.trim() ?? "";

const clampTimeoutMs = (value?: number) => {
  if (!Number.isFinite(value)) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.min(30_000, Math.max(3_000, Math.trunc(value ?? 0)));
};

const responseEnvelopeJsonSchema = {
  additionalProperties: false,
  properties: {
    responses: {
      items: {
        additionalProperties: true,
        properties: {
          id: { type: "string" },
          type: {
            enum: [
              "destination_recommendation",
              "follow_up_question_set",
              "itinerary_suggestion",
              "package_recommendation",
              "plain_text_guidance",
            ],
            type: "string",
          },
        },
        required: ["id", "type"],
        type: "object",
      },
      minItems: 1,
      type: "array",
    },
  },
  required: ["responses"],
  type: "object",
} as const;

const extractOutputText = (responseData: unknown) => {
  if (
    typeof responseData === "object" &&
    responseData !== null &&
    "output_text" in responseData &&
    typeof responseData.output_text === "string"
  ) {
    return responseData.output_text;
  }

  if (
    typeof responseData !== "object" ||
    responseData === null ||
    !("output" in responseData) ||
    !Array.isArray(responseData.output)
  ) {
    return "";
  }

  for (const outputItem of responseData.output) {
    if (
      typeof outputItem !== "object" ||
      outputItem === null ||
      !("content" in outputItem) ||
      !Array.isArray(outputItem.content)
    ) {
      continue;
    }

    for (const contentItem of outputItem.content) {
      if (
        typeof contentItem === "object" &&
        contentItem !== null &&
        "text" in contentItem &&
        typeof contentItem.text === "string"
      ) {
        return contentItem.text;
      }
    }
  }

  return "";
};

const requestOpenAI = async ({
  input,
  instructions,
}: {
  input: string;
  instructions: string;
}) => {
  const apiKey = trimValue(
    directPreviewConfig.heiaDirectPreviewOpenAiApiKey,
  );

  if (!apiKey) {
    throw new Error("Direct preview AI provider is not configured.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    clampTimeoutMs(directPreviewConfig.heiaDirectPreviewTimeoutMs),
  );

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      body: JSON.stringify({
        input,
        instructions,
        model:
          trimValue(directPreviewConfig.heiaDirectPreviewModel) ||
          DEFAULT_MODEL,
        text: {
          format: {
            description: "Structured Haya Trip assistant response envelope.",
            name: "heia_response_envelope",
            schema: responseEnvelopeJsonSchema,
            strict: false,
            type: "json_schema",
          },
        },
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });
    const responseData = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      throw new Error("Direct preview AI request failed.");
    }

    const outputText = extractOutputText(responseData);

    if (!outputText) {
      throw new Error("Direct preview AI response was empty.");
    }

    return outputText;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const isDirectPreviewAiAdvisorProviderConfigured = () =>
  Boolean(trimValue(directPreviewConfig.heiaDirectPreviewOpenAiApiKey));

export const createDirectPreviewAiAdvisorProvider = (): AiAdvisorProvider => ({
  generateResponse: async (request): Promise<AiAdvisorProviderOutput> =>
    requestOpenAI({
      input: request.prompt.user,
      instructions: request.prompt.system,
    }),
  mode: "direct-preview",
  name: "hayatrip-heia-direct-preview",
});
