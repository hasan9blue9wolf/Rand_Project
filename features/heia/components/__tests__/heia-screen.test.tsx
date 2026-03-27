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
          text: "Hi, I'm Heia. Tell me what kind of trip you want.",
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
      screen.getByText("Hi, I'm Heia. Tell me what kind of trip you want."),
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
});
