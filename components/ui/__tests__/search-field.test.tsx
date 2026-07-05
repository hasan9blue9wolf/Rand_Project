import { fireEvent, screen } from "@testing-library/react-native";
import { useState } from "react";
import { TextInput } from "react-native";

import { renderWithProviders } from "../../../test/utils/render-with-providers";
import { SearchField } from "../search-field";

const ControlledSearchField = ({ onValueChange }: { onValueChange: (value: string) => void }) => {
  const [value, setValue] = useState("");

  return (
    <SearchField
      label="Search"
      onChangeText={(nextValue) => {
        setValue(nextValue);
        onValueChange(nextValue);
      }}
      testID="search-input"
      value={value}
    />
  );
};

describe("SearchField", () => {
  it("forwards text changes and immediately renders controlled values", () => {
    const onValueChange = jest.fn();

    renderWithProviders(<ControlledSearchField onValueChange={onValueChange} />);
    const input = screen.getByTestId("search-input");

    fireEvent.changeText(input, "Dubai");

    expect(onValueChange).toHaveBeenLastCalledWith("Dubai");
    expect(screen.getByDisplayValue("Dubai")).toBeTruthy();
  });

  it("forwards its native ref", () => {
    const ref = { current: null as TextInput | null };

    renderWithProviders(<SearchField label="Name" ref={ref} testID="name-input" />);

    expect(ref.current).toBeTruthy();
  });

  it("keeps the same native input mounted when Android focus state changes", () => {
    const ref = { current: null as TextInput | null };

    renderWithProviders(<SearchField label="Email" ref={ref} testID="email-input" />);
    const nativeInput = ref.current;

    fireEvent(screen.getByTestId("email-input"), "focus");

    expect(ref.current).toBe(nativeInput);
  });
});
