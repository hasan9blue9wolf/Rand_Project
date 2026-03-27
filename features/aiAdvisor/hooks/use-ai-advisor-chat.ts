import { startTransition, useEffect, useRef, useState } from "react";

import { useLocalization } from "../../../hooks/use-localization";
import { selectActiveUserId, useAuthStore } from "../../../store/auth-store";
import {
  aiAdvisorScreenMock,
  createInitialAiAdvisorMessages,
  getSuggestionPrompt,
} from "../data/ai-advisor.mock";
import { requestAiAdvisorTurn } from "../services/ai-advisor.service";
import {
  appendAiChatMessages,
  createAiChatThread,
} from "../services/ai-advisor-history.service";
import type {
  AiAdvisorChatMessage,
  AiAdvisorConversationMemory,
  AiAdvisorRenderableStructuredResponse,
  AiAdvisorStructuredResponse,
  AiAdvisorSuggestionId,
} from "../types";

const createLoadingStatusMessage = (
  title: string,
  description: string,
): AiAdvisorChatMessage => ({
  description,
  id: `status-loading-${Date.now()}`,
  kind: "status",
  role: "system",
  status: "loading",
  title,
});

const createErrorStatusMessage = (
  title: string,
  description: string,
): AiAdvisorChatMessage => ({
  description,
  id: `status-error-${Date.now()}`,
  kind: "status",
  retryable: true,
  role: "system",
  status: "error",
  title,
});

const mapResponsesToChatMessages = (responses: AiAdvisorStructuredResponse[]) =>
  responses.map((response, index) =>
    response.type === "plain_text_guidance"
      ? {
          id: `assistant-text-${response.id}`,
          kind: "assistant_text",
          role: "assistant",
          showAvatar: index === 0,
          text: response.text,
          ...(response.tone ? { tone: response.tone } : {}),
        }
      : {
          id: `assistant-response-${response.id}`,
          inset: true,
          kind: "assistant_response",
          response: response as AiAdvisorRenderableStructuredResponse,
          role: "assistant",
        },
  ) satisfies AiAdvisorChatMessage[];

export const useAiAdvisorChat = () => {
  const { language, t } = useLocalization();
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const userId = useAuthStore(selectActiveUserId);
  const [messages, setMessages] = useState<AiAdvisorChatMessage[]>(() =>
    createInitialAiAdvisorMessages(language),
  );
  const memoryRef = useRef<AiAdvisorConversationMemory | undefined>(undefined);
  const messagesRef = useRef(messages);
  const lastUserMessageRef = useRef<string | undefined>(undefined);
  const threadIdRef = useRef<string | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const resetConversation = () => {
    const initialMessages = createInitialAiAdvisorMessages(language);

    lastUserMessageRef.current = undefined;
    memoryRef.current = undefined;
    messagesRef.current = initialMessages;
    threadIdRef.current = null;
    setDraft("");
    setMessages(initialMessages);
    setIsLoading(false);
  };

  const persistMessages = async ({
    messagesToPersist,
    titleSeed,
  }: {
    messagesToPersist: AiAdvisorChatMessage[];
    titleSeed: string;
  }) => {
    if (!userId || messagesToPersist.length === 0) {
      return;
    }

    try {
      if (!threadIdRef.current) {
        const thread = await createAiChatThread({
          locale: language,
          title: titleSeed.slice(0, 72),
        });

        threadIdRef.current = thread.id;
      }

      if (!threadIdRef.current) {
        return;
      }

      await appendAiChatMessages({
        messages: messagesToPersist,
        threadId: threadIdRef.current,
      });
    } catch {
      // Keep chat responsive even if storage fails.
    }
  };

  const executeTurn = async ({
    includeUserMessage,
    input,
  }: {
    includeUserMessage: boolean;
    input: string;
  }) => {
    const trimmed = input.trim();

    if (!trimmed || isLoading) {
      return;
    }

    const baseMessages = messagesRef.current.filter(
      (message) => message.kind !== "status",
    );
    const userMessage: AiAdvisorChatMessage = {
      id: `user-${Date.now()}`,
      kind: "user_text",
      role: "user",
      text: trimmed,
    };
    const workingHistory = includeUserMessage
      ? [...baseMessages, userMessage]
      : baseMessages;
    const loadingMessage = createLoadingStatusMessage(
      t("heiaChat.thinkingTitle"),
      t("heiaChat.thinkingBody"),
    );

    lastUserMessageRef.current = trimmed;
    messagesRef.current = [...workingHistory, loadingMessage];
    startTransition(() => {
      setDraft("");
      setIsLoading(true);
      setMessages(messagesRef.current);
    });

    try {
      const turnResult = await requestAiAdvisorTurn({
        history: workingHistory,
        latestUserMessage: trimmed,
        locale: language,
        ...(memoryRef.current ? { previousMemory: memoryRef.current } : {}),
      });
      const assistantMessages = mapResponsesToChatMessages(
        turnResult.responses,
      );
      const nextMessages = [...workingHistory, ...assistantMessages];
      const messagesToPersist = [
        ...(includeUserMessage ? [userMessage] : []),
        ...assistantMessages,
      ];

      memoryRef.current = turnResult.memory;
      messagesRef.current = nextMessages;
      startTransition(() => {
        setMessages(nextMessages);
      });
      void persistMessages({
        messagesToPersist,
        titleSeed: trimmed,
      });
    } catch {
      const errorMessage = createErrorStatusMessage(
        t("heiaChat.errorTitle"),
        t("heiaChat.errorBody"),
      );
      const nextMessages = [...workingHistory, errorMessage];
      const messagesToPersist = [
        ...(includeUserMessage ? [userMessage] : []),
        errorMessage,
      ];

      messagesRef.current = nextMessages;
      startTransition(() => {
        setMessages(nextMessages);
      });
      void persistMessages({
        messagesToPersist,
        titleSeed: trimmed,
      });
    } finally {
      startTransition(() => {
        setIsLoading(false);
      });
    }
  };

  const sendDraft = () =>
    void executeTurn({ includeUserMessage: true, input: draft });

  const sendText = (input: string) =>
    void executeTurn({
      includeUserMessage: true,
      input,
    });

  const sendSuggestion = (suggestionId: AiAdvisorSuggestionId) =>
    sendText(getSuggestionPrompt(suggestionId, language));

  const sendQuickReply = (quickReply: string) => sendText(quickReply);

  const retryLastTurn = () => {
    if (!lastUserMessageRef.current) {
      return;
    }

    void executeTurn({
      includeUserMessage: false,
      input: lastUserMessageRef.current,
    });
  };

  return {
    assistantAvatarUri: aiAdvisorScreenMock.assistantAvatarUri,
    draft,
    isLoading,
    messages,
    resetConversation,
    retryLastTurn,
    screenData: aiAdvisorScreenMock,
    sendDraft,
    sendText,
    sendQuickReply,
    sendSuggestion,
    setDraft,
  };
};
