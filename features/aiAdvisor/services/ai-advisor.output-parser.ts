import type {
  AiAdvisorProviderOutput,
  AiAdvisorStructuredResponseEnvelope,
} from "../types";
import { aiAdvisorStructuredResponseEnvelopeSchema } from "./ai-advisor.schemas";

const extractJsonString = (rawOutput: string) => {
  const trimmed = rawOutput.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();
};

export const parseAiAdvisorProviderOutput = (
  rawOutput: AiAdvisorProviderOutput,
): AiAdvisorStructuredResponseEnvelope => {
  const parsedCandidate =
    typeof rawOutput === "string"
      ? JSON.parse(extractJsonString(rawOutput))
      : rawOutput;

  return aiAdvisorStructuredResponseEnvelopeSchema.parse(
    parsedCandidate,
  ) as AiAdvisorStructuredResponseEnvelope;
};
