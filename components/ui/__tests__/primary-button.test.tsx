import {
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { fireEvent, screen } from "@testing-library/react-native";

import { renderWithProviders } from "../../../test/utils/render-with-providers";
import { PrimaryButton } from "../primary-button";

describe("PrimaryButton", () => {
  it("renders a tappable CTA and fires the press handler", () => {
    const onPress = jest.fn();

    renderWithProviders(<PrimaryButton label="Continue" onPress={onPress} />);

    fireEvent.press(screen.getByRole("button"));

    expect(screen.getByText("Continue")).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("hides the label and blocks presses while loading", () => {
    const onPress = jest.fn();

    renderWithProviders(
      <PrimaryButton label="Continue" loading onPress={onPress} />,
    );

    fireEvent.press(screen.getByRole("button"));

    expect(screen.queryByText("Continue")).toBeNull();
    expect(onPress).not.toHaveBeenCalled();
  });
});
