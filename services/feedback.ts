import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

type FeedbackTone = "light" | "selection" | "success";

let lastFeedbackAt = 0;

const FEEDBACK_COOLDOWN_MS = 60;
const canUseHaptics = Platform.OS === "ios" || Platform.OS === "android";

export const triggerFeedback = async (tone: FeedbackTone = "selection") => {
  if (!canUseHaptics) {
    return;
  }

  const now = Date.now();
  if (now - lastFeedbackAt < FEEDBACK_COOLDOWN_MS) {
    return;
  }

  lastFeedbackAt = now;

  try {
    if (tone === "success") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (tone === "light") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    await Haptics.selectionAsync();
  } catch {
    // Haptics are enhancement-only. Silently ignore unsupported runtimes.
  }
};

export const triggerSelectionFeedback = () => triggerFeedback("selection");
