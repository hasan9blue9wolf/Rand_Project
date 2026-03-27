import {
  createInitialAiAdvisorMessages,
  heiaAssistantAvatarUri,
} from "../../aiAdvisor/data/ai-advisor.mock";
import type { HeiaChatMessage } from "../types";

export { heiaAssistantAvatarUri };

export const heiaInitialMessages: HeiaChatMessage[] = createInitialAiAdvisorMessages("en");
