import {
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { fireEvent, screen } from "@testing-library/react-native";

import { renderWithProviders } from "../../../test/utils/render-with-providers";
import { Chip } from "../chip";

describe("Chip", () => {
  it("renders the chip label", () => {
    renderWithProviders(<Chip label="Family trip" />);

    expect(screen.getByText("Family trip")).toBeTruthy();
  });

  it("fires the press callback when interactive", () => {
    const onPress = jest.fn();

    renderWithProviders(<Chip label="Beach getaway" onPress={onPress} />);

    fireEvent.press(screen.getByText("Beach getaway"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
