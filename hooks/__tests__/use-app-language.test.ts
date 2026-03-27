import {
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import i18n from "../../services/i18n";
import { useSettingsStore } from "../../store/settings-store";
import { useAppLanguage } from "../use-app-language";

const mockSyncRTLDirection = jest.fn(
  async (_language: "ar" | "en") => undefined,
);

jest.mock("../../utils/rtl", () => ({
  syncRTLDirection: (language: "ar" | "en") =>
    mockSyncRTLDirection(language),
}));

describe("useAppLanguage", () => {
  it("exposes the current language state", () => {
    const { result } = renderHook(() => useAppLanguage());

    expect(result.current.language).toBe("en");
    expect(result.current.isRTL).toBe(false);
  });

  it("updates the locale, store, and RTL sync when language changes", async () => {
    const changeLanguageSpy = jest
      .spyOn(i18n, "changeLanguage")
      .mockResolvedValue(i18n.t.bind(i18n));
    const { result } = renderHook(() => useAppLanguage());

    await act(async () => {
      await result.current.changeLanguage("ar");
    });

    expect(changeLanguageSpy).toHaveBeenCalledWith("ar");
    expect(mockSyncRTLDirection).toHaveBeenCalledWith("ar");
    expect(useSettingsStore.getState().language).toBe("ar");
    expect(result.current.isRTL).toBe(true);

    changeLanguageSpy.mockRestore();
  });
});
