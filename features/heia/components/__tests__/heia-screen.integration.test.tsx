import {
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import { appRoutes } from "../../../../navigation/routes";
import { renderWithProviders } from "../../../../test/utils/render-with-providers";
import type { AiAdvisorTurnResult } from "../../../aiAdvisor/types";
import { HeiaScreen } from "../heia-screen";

const mockRequestAiAdvisorTurn = jest.fn(
  async (..._args: unknown[]): Promise<AiAdvisorTurnResult> => ({
    memory: {
      latestUserMessage: "",
      locale: "en",
      missingPreferenceIds: [],
      preferenceProfile: {},
      salientFacts: [],
      turnCount: 0,
      userIntentSummary: "",
    },
    providerName: "mock-heia",
    responses: [],
    usedFallback: false,
  }),
);

jest.mock("../../../aiAdvisor/services/ai-advisor.service", () => ({
  requestAiAdvisorTurn: (...args: unknown[]) =>
    mockRequestAiAdvisorTurn(...args),
}));

describe("HeiaScreen AI integration", () => {
  it("renders a structured recommendation returned by the AI layer", async () => {
    mockRequestAiAdvisorTurn.mockResolvedValue({
      memory: {
        latestUserMessage: "I want a polished island trip",
        locale: "en",
        missingPreferenceIds: [],
        preferenceProfile: {
          vibe: "beach",
        },
        salientFacts: ["User wants a warm island escape"],
        turnCount: 1,
        userIntentSummary: "Warm premium island escape",
      },
      providerName: "mock-heia",
      responses: [
        {
          bestForLabel: "Couples and easy luxury",
          budgetRange: {
            max: 4200,
            min: 2600,
          },
          country: "Maldives",
          ctaLabel: "See package",
          destination: "Maldives",
          id: "destination-maldives",
          imageUri: "https://example.com/maldives.jpg",
          luxuryLabel: "Premium",
          packageId: "maldives-escape",
          reasons: ["Warm weather", "Easy transfers", "Elegant resorts"],
          summary:
            "The Maldives is a strong match for a warm island escape with polished service.",
          type: "destination_recommendation",
          visaLabel: "Visa-friendly",
          weatherLabel: "Warm and sunny",
        },
      ],
      usedFallback: false,
    });

    renderWithProviders(<HeiaScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Message Heia..."),
      "I want a polished island trip",
    );
    fireEvent.press(screen.getByLabelText("Send message"));

    await waitFor(() => {
      expect(
        screen.getByText("The Maldives is a strong match for a warm island escape with polished service."),
      ).toBeTruthy();
    });

    fireEvent.press(screen.getByText("See package"));

    expect(router.push).toHaveBeenCalledWith(
      appRoutes.packageDetails("maldives-escape"),
    );
  });
});
