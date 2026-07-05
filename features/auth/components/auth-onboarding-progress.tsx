import { View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { useLocalization } from "../../../hooks/use-localization";
import { colors, radius, spacing } from "../../../theme";

type AuthOnboardingProgressProps = {
  currentStepIndex: number;
  description: string;
  title: string;
  totalSteps: number;
};

export const AuthOnboardingProgress = ({
  currentStepIndex,
  description,
  title,
  totalSteps,
}: AuthOnboardingProgressProps) => {
  const { isRTL, t } = useLocalization();

  return (
    <View style={{ gap: spacing.md }}>
      <View
        style={{
          alignItems: "center",
          flexDirection: isRTL ? "row-reverse" : "row",
          justifyContent: "space-between",
        }}
      >
        <AppText color={colors.text.blue} variant="caption">
          {t("authFlow.onboarding.stepCounter", {
            current: currentStepIndex + 1,
            total: totalSteps,
          })}
        </AppText>
        <AppText variant="caption">{t("authFlow.onboarding.progressLabel")}</AppText>
      </View>

      <View
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          gap: spacing.xs,
        }}
      >
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index <= currentStepIndex;

          return (
            <View
              key={`auth-step-${index + 1}`}
              style={{
                backgroundColor: isActive ? colors.primary[500] : colors.background.subtle,
                borderRadius: radius.round,
                flex: 1,
                height: 6,
              }}
            />
          );
        })}
      </View>

      <View style={{ gap: spacing.xs }}>
        <AppText variant="headline">{title}</AppText>
        <AppText>{description}</AppText>
      </View>
    </View>
  );
};
