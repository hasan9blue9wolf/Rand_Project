import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { renderWithProviders } from "../../../test/utils/render-with-providers";
import { setTestLocale } from "../../../test/utils/test-localization";
import { SettingsRow } from "../settings-row";

describe("SettingsRow", () => {
  beforeEach(async () => {
    await setTestLocale("en");
  });

  it("places the switch on the left and corrects switch direction in Arabic", async () => {
    const onValueChange = jest.fn();

    await setTestLocale("ar");

    renderWithProviders(
      <SettingsRow
        description="تنبيهات الرحلات"
        onValueChange={onValueChange}
        title="الإشعارات"
        value
      />,
    );

    const rowContainer = screen.getByTestId("settings-row-container");
    const switchControl = screen.getByTestId("settings-row-switch");
    const switchThumb = screen.getByTestId("settings-row-switch-thumb");
    const rowChildren = rowContainer.props.children as {
      props?: { testID?: string };
    }[];
    const rowStyle = StyleSheet.flatten(rowContainer.props.style);
    const thumbStyle = StyleSheet.flatten(switchThumb.props.style);

    expect(rowStyle).toEqual(
      expect.objectContaining({
        alignSelf: "stretch",
        direction: "ltr",
        flexDirection: "row",
      }),
    );
    expect(rowChildren[0]?.props?.testID).toBe("settings-row-switch");
    expect(rowChildren[1]?.props?.testID).toBe("settings-row-copy");
    expect(thumbStyle).toEqual(expect.objectContaining({ left: 3 }));

    fireEvent.press(switchControl);

    expect(onValueChange).toHaveBeenCalledWith(false);
  });
});
