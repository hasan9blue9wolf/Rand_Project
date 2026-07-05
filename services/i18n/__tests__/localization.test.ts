import {
  describe,
  expect,
  it,
} from "@jest/globals";

import { normalizeLocale } from "../index";
import {
  formatCurrencyRangeByLocale,
  formatDateByLocale,
  getLocaleCurrency,
  getLocaleTag,
} from "../localization";

describe("localization utilities", () => {
  it("normalizes supported locale tags safely", () => {
    expect(normalizeLocale("ar-IQ")).toBe("ar");
    expect(normalizeLocale("en-GB")).toBe("en");
    expect(normalizeLocale(undefined)).toBe("en");
  });

  it("returns locale metadata for formatting", () => {
    expect(getLocaleTag("en")).toBe("en-US");
    expect(getLocaleTag("ar")).toBe("ar");
    expect(getLocaleCurrency("en")).toBe("USD");
    expect(getLocaleCurrency("ar")).toBe("USD");
  });

  it("formats currency ranges and dates consistently", () => {
    expect(formatCurrencyRangeByLocale(1800, 4200, "en")).toContain("$1,800");
    expect(formatCurrencyRangeByLocale(1800, 4200, "en")).toContain(" - ");
    expect(
      formatDateByLocale("2026-10-12", "en", {
        day: "numeric",
        month: "short",
      }),
    ).toMatch(/Oct/i);
  });
});
