import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { useLocalization } from "../../../hooks/use-localization";
import { isDemoModeEnabled } from "../../../services/runtime/app-mode";
import { colors, radius, spacing } from "../../../theme";
import type { AuthProvider } from "../types";

type AuthSocialProvider = {
  icon: keyof typeof Ionicons.glyphMap;
  id: Exclude<AuthProvider, "email">;
  label: string;
};

type AuthSocialPlaceholdersProps = {
  onPress: (provider: Exclude<AuthProvider, "email">) => void;
  providers: AuthSocialProvider[];
  title: string;
};

export const AuthSocialPlaceholders = ({
  onPress,
  providers,
  title,
}: AuthSocialPlaceholdersProps) => {
  const { isRTL, t } = useLocalization();
  const socialChipLabel = isDemoModeEnabled()
    ? t("authFlow.social.demoReady")
    : t("authFlow.social.comingSoon");

  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="caption">{title}</AppText>
      <View
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          flexWrap: "wrap",
          gap: spacing.sm,
        }}
      >
        {providers.map((provider) => (
          <Pressable
            key={provider.id}
            onPress={() => onPress(provider.id)}
            style={({ pressed }) => ({
              flexGrow: 1,
              minWidth: 148,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            })}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: colors.background.subtle,
                borderColor: colors.border.soft,
                borderRadius: radius.md,
                borderWidth: 1,
                flexDirection: isRTL ? "row-reverse" : "row",
                gap: spacing.sm,
                justifyContent: "space-between",
                minHeight: 58,
                paddingHorizontal: spacing.md,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: spacing.sm,
                }}
              >
                <Ionicons color={colors.navy[700]} name={provider.icon} size={20} />
                <AppText color={colors.text.primary} variant="label">
                  {provider.label}
                </AppText>
              </View>
              <Chip label={socialChipLabel} tone="navy" />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
