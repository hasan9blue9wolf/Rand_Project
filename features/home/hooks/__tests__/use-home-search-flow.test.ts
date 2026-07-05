import {
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";
import React, { type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "../../../../services/i18n";
import { useTravelDiscoveryStore } from "../../../../store/travel-discovery-store";
import { useHomeSearchFlow } from "../use-home-search-flow";

const mockTriggerFeedback = jest.fn(
  async (_tone?: "light" | "selection" | "success") => undefined,
);

jest.mock("../../../../services/feedback", () => ({
  triggerFeedback: (...args: ["light" | "selection" | "success" | undefined]) =>
    mockTriggerFeedback(...args),
}));

const LocalizationWrapper = ({ children }: { children: ReactNode }) =>
  React.createElement(I18nextProvider, { i18n }, children);

describe("useHomeSearchFlow", () => {
  it("cycles booking fields through the next mock values", () => {
    const { result } = renderHook(() => useHomeSearchFlow(), {
      wrapper: LocalizationWrapper,
    });

    expect(result.current.draftSearch.fromId).toBe("newYork");

    act(() => {
      result.current.cycleField("from");
      result.current.cycleField("to");
      result.current.cycleField("passengers");
    });

    expect(useTravelDiscoveryStore.getState().draftSearch.fromId).toBe(
      "losAngeles",
    );
    expect(useTravelDiscoveryStore.getState().draftSearch.toId).toBe("zermatt");
    expect(useTravelDiscoveryStore.getState().draftSearch.passengerOptionId).toBe(
      "familyFour",
    );
  });

  it("submits the current search and updates store state", async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useHomeSearchFlow(), {
      wrapper: LocalizationWrapper,
    });
    let didSubmit = false;

    await act(async () => {
      const submitPromise = result.current.submitSearch();

      await Promise.resolve();
      await jest.advanceTimersByTimeAsync(250);
      await Promise.resolve();
      didSubmit = await submitPromise;
    });

    expect(didSubmit).toBe(true);
    expect(mockTriggerFeedback).toHaveBeenCalledWith("success");
    expect(useTravelDiscoveryStore.getState().submittedSearch.source).toBe(
      "home",
    );
    expect(result.current.isSubmitting).toBe(false);
  });
});
