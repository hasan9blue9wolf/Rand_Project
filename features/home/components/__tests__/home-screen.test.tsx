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
import { homeScreenMock } from "../../data/home.mock";
import { HomeScreen } from "../home-screen";

const mockUseHomeData = jest.fn();
const mockUseHomeSearchFlow = jest.fn();

jest.mock("../../hooks/use-home-data", () => ({
  useHomeData: () => mockUseHomeData(),
}));

jest.mock("../../hooks/use-home-search-flow", () => ({
  useHomeSearchFlow: () => mockUseHomeSearchFlow(),
}));

describe("HomeScreen", () => {
  it("renders the premium home content", () => {
    mockUseHomeData.mockReturnValue({
      data: homeScreenMock,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    });
    mockUseHomeSearchFlow.mockReturnValue({
      cycleField: jest.fn(),
      draftSearch: { mode: "flights" },
      fieldValues: {
        dates: "Oct 12 - Oct 19",
        from: "New York",
        passengers: "2 Adults",
        to: "Bali",
      },
      isSubmitting: false,
      setMode: jest.fn(),
      submitSearch: jest.fn(async () => true),
    });

    renderWithProviders(<HomeScreen />);

    expect(screen.getByText("Search Flights")).toBeTruthy();
    expect(screen.getByText("Trending Packages")).toBeTruthy();
    expect(screen.getByText("Start Planning")).toBeTruthy();
  });

  it("navigates to search results after a successful submission", async () => {
    const submitSearch = jest.fn(async () => true);

    mockUseHomeData.mockReturnValue({
      data: homeScreenMock,
      isError: false,
      isLoading: false,
      refetch: jest.fn(),
    });
    mockUseHomeSearchFlow.mockReturnValue({
      cycleField: jest.fn(),
      draftSearch: { mode: "flights" },
      fieldValues: {
        dates: "Oct 12 - Oct 19",
        from: "New York",
        passengers: "2 Adults",
        to: "Bali",
      },
      isSubmitting: false,
      setMode: jest.fn(),
      submitSearch,
    });

    renderWithProviders(<HomeScreen />);

    fireEvent.press(screen.getByText("Search Flights"));

    await waitFor(() => {
      expect(submitSearch).toHaveBeenCalledTimes(1);
      expect(router.push).toHaveBeenCalledWith(
        appRoutes.searchResults({
          mode: "flights",
          source: "home",
        }),
      );
    });
  });
});
