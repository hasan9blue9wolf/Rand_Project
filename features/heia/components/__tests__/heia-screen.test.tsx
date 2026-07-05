import {
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { fireEvent, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { Keyboard } from "react-native";

import { appRoutes } from "../../../../navigation/routes";
import i18n from "../../../../services/i18n";
import flightCatalog from "../../../../shared/catalog/flights.json";
import packageCatalog from "../../../../shared/catalog/packages.json";
import { renderWithProviders } from "../../../../test/utils/render-with-providers";
import { HeiaScreen } from "../heia-screen";

const mockUseAiAdvisorChat = jest.fn();

jest.mock("../../../aiAdvisor/hooks/use-ai-advisor-chat", () => ({
  useAiAdvisorChat: () => mockUseAiAdvisorChat(),
}));

describe("HeiaScreen", () => {
  const chatWith = (response: Record<string, unknown>) => ({
    assistantAvatarUri: "https://example.com/heia.png", draft: "", isLoading: false,
    messages: [{ id: "recommendation", inset: true, kind: "assistant_response", response, role: "assistant" }],
    resetConversation: jest.fn(), retryLastTurn: jest.fn(), sendDraft: jest.fn(), sendQuickReply: jest.fn(), sendSuggestion: jest.fn(), sendText: jest.fn(), setDraft: jest.fn(),
  });

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
    expect(screen.UNSAFE_getByProps({ testID: "heia-message-list" }).findAllByProps({ testID: "haya-message-composer" })).toHaveLength(0);
  });

  it("cleans up Android keyboard listeners", () => {
    const remove = jest.fn();
    const listener = jest.spyOn(Keyboard, "addListener").mockReturnValue({ remove } as never);
    mockUseAiAdvisorChat.mockReturnValue(chatWith({ id: "text", type: "plain_text_guidance", text: "Hello", tone: "guidance" }));
    const view = renderWithProviders(<HeiaScreen />);
    const registeredListeners = listener.mock.calls.length;
    expect(registeredListeners).toBeGreaterThanOrEqual(2);
    view.unmount();
    expect(remove).toHaveBeenCalledTimes(registeredListeners);
    listener.mockRestore();
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

  it("renders an Arabic package card and opens its exact details route", async () => {
    await i18n.changeLanguage("ar");
    const item = packageCatalog[0]!;
    mockUseAiAdvisorChat.mockReturnValue(chatWith({ id: "package-card", type: "package_recommendation", packageId: item.id, title: "ignored", summary: "سبب مناسب", imageUri: "ignored", priceFrom: 1, durationLabel: "ignored", highlights: [], ctaLabel: "ignored" }));
    renderWithProviders(<HeiaScreen />);
    fireEvent.press(screen.getByText("عرض الباقة"));
    expect(router.push).toHaveBeenCalledWith(appRoutes.packageDetails(item.id));
  });

  it("renders an English flight card and preserves its ID for details and booking", async () => {
    await i18n.changeLanguage("en");
    const item = flightCatalog[0]!;
    mockUseAiAdvisorChat.mockReturnValue(chatWith({ id: "flight-card", type: "flight_recommendation", flightId: item.id, reason: "Best route" }));
    renderWithProviders(<HeiaScreen />);
    fireEvent.press(screen.getByText("View Flight"));
    expect(router.push).toHaveBeenCalledWith(appRoutes.flightDetails(item.id));
    fireEvent.press(screen.getByText("Book Flight"));
    expect(router.push).toHaveBeenCalledWith(appRoutes.demoBooking(item.id));
  });

  it("renders a French package CTA from canonical inventory", async () => {
    await i18n.changeLanguage("fr");
    const item = packageCatalog[1]!;
    mockUseAiAdvisorChat.mockReturnValue(chatWith({ id: "package-fr", type: "package_recommendation", packageId: item.id, title: "ignored", summary: "Bon choix", imageUri: "ignored", priceFrom: 1, durationLabel: "ignored", highlights: [], ctaLabel: "ignored" }));
    renderWithProviders(<HeiaScreen />);
    expect(screen.getByText("Voir le forfait")).toBeTruthy();
  });

  it("renders no card container when there are no recommendations", async () => {
    await i18n.changeLanguage("en");
    mockUseAiAdvisorChat.mockReturnValue({ ...chatWith({}), messages: [{ id: "text", kind: "assistant_text", role: "assistant", text: "Tell me more" }] });
    renderWithProviders(<HeiaScreen />);
    expect(screen.getByText("Tell me more")).toBeTruthy();
    expect(screen.queryByText("View package")).toBeNull();
  });
});
