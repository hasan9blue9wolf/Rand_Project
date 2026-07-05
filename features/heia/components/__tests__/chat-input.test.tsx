import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import i18n from "../../../../services/i18n";
import { useSettingsStore } from "../../../../store/settings-store";
import { renderWithProviders } from "../../../../test/utils/render-with-providers";
import { ChatInput } from "../chat-input";

describe("ChatInput", () => {
  const languageCases: ["ar" | "en" | "fr", "rtl" | "ltr", "right" | "left", string][] = [
    ["ar", "rtl", "right", "اكتب رسالتك إلى هيا..."],
    ["en", "ltr", "left", "Message Haya..."],
    ["fr", "ltr", "left", "Écrivez à Haya..."],
  ];
  it.each(languageCases)("supports stable %s multiline input", async (language, direction, alignment, placeholder) => {
    await i18n.changeLanguage(language);
    useSettingsStore.setState({ language });
    const onChangeText = jest.fn();
    const { rerender } = renderWithProviders(<ChatInput onChangeText={onChangeText} onSend={jest.fn()} value="first line" />);
    const input = screen.getByTestId("haya-message-input");
    expect(input.props.multiline).toBe(true);
    expect(input.props.scrollEnabled).toBe(true);
    expect(input.props.placeholder).toBe(placeholder);
    expect(StyleSheet.flatten(input.props.style)).toMatchObject({ maxHeight: 110, textAlign: alignment, writingDirection: direction });
    fireEvent.changeText(input, "first line\nsecond line");
    expect(onChangeText).toHaveBeenCalledWith("first line\nsecond line");
    rerender(<ChatInput onChangeText={onChangeText} onSend={jest.fn()} value="first line\nsecond line" />);
    expect(screen.getByTestId("haya-message-input")).toBe(input);
  });

  it("submits through the stable send control", async () => {
    await i18n.changeLanguage("en");
    const onSend = jest.fn();
    renderWithProviders(<ChatInput onChangeText={jest.fn()} onSend={onSend} value="Ready" />);
    fireEvent.press(screen.getByLabelText("Send message"));
    expect(onSend).toHaveBeenCalledTimes(1);
  });
});
