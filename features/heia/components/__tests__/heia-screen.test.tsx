import {
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { fireEvent, screen } from "@testing-library/react-native";

import { renderWithProviders } from "../../../../test/utils/render-with-providers";
import { HeiaScreen } from "../heia-screen";

const mockUseAiAdvisorChat = jest.fn();

jest.mock("../../../aiAdvisor/hooks/use-ai-advisor-chat", () => ({
  useAiAdvisorChat: () => mockUseAiAdvisorChat(),
}));

describe("HeiaScreen", () => {
  it("renders messages, suggestion chips, and composer controls", () => {
    const sendDraft = jest.fn();
    const sendSuggestion = jest.fn();
    const setDraft = jest.fn();

    mockUseAiAdvisorChat.mockReturnValue({
      assistantAvatarUri: "https://example.com/heia.png",
      draft: "Plan something warm",
      isLoading: false,
      messages: [
        {
          id: "assistant-welcome",
          kind: "assistant_text",
          role: "assistant",
          showAvatar: true,
          suggestionIds: ["beach", "budget", "family", "surprise"],
          text: "Hi, I'm Haya. Tell me what kind of trip you want.",
        },
        {
          id: "user-1",
          kind: "user_text",
          role: "user",
          text: "I want a premium beach break.",
        },
      ],
      resetConversation: jest.fn(),
      retryLastTurn: jest.fn(),
      sendDraft,
      sendQuickReply: jest.fn(),
      sendSuggestion,
      setDraft,
    });

    renderWithProviders(<HeiaScreen />);

    expect(
      screen.getByText("Hi, I'm Haya. Tell me what kind of trip you want."),
    ).toBeTruthy();
    expect(screen.getByText("Beach getaway")).toBeTruthy();
    expect(
      screen.getByText(
        "AI can make mistakes. Verify travel details before booking.",
      ),
    ).toBeTruthy();

    fireEvent.press(screen.getByText("Beach getaway"));
    fireEvent.press(screen.getByLabelText("Send message"));

    expect(sendSuggestion).toHaveBeenCalledWith("beach");
    expect(sendDraft).toHaveBeenCalledTimes(1);
    expect(screen.UNSAFE_getByProps({ testID: "heia-message-list" }).props).toMatchObject({
      keyboardShouldPersistTaps: "handled",
      maxToRenderPerBatch: 6,
      windowSize: 10,
    });
  });

  it("batches follow-up quick replies until the card send action is pressed", () => {
    const sendQuickReply = jest.fn();

    mockUseAiAdvisorChat.mockReturnValue({
      assistantAvatarUri: "https://example.com/heia.png",
      draft: "",
      isLoading: false,
      messages: [
        {
          id: "assistant-follow-up",
          inset: true,
          kind: "assistant_response",
          response: {
            id: "follow-up-1",
            intro: "Answer these quick prompts and I can sharpen the shortlist.",
            questions: [
              {
                id: "budget",
                question: "What budget ceiling feels comfortable?",
                quickReplies: ["Up to $2,500", "$2,500-$4,500"],
              },
              {
                id: "departure",
                question: "Where will you depart from?",
                quickReplies: ["Baghdad", "Dubai"],
              },
            ],
            type: "follow_up_question_set",
          },
          role: "assistant",
        },
      ],
      resetConversation: jest.fn(),
      retryLastTurn: jest.fn(),
      sendDraft: jest.fn(),
      sendQuickReply,
      sendSuggestion: jest.fn(),
      setDraft: jest.fn(),
    });

    renderWithProviders(<HeiaScreen />);

    fireEvent.press(screen.getByText("$2,500-$4,500"));
    fireEvent.press(screen.getByText("Baghdad"));

    expect(sendQuickReply).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText("Send selected answers"));

    expect(sendQuickReply).toHaveBeenCalledWith(
      "What budget ceiling feels comfortable?: $2,500-$4,500\nWhere will you depart from?: Baghdad",
    );
  });
});
