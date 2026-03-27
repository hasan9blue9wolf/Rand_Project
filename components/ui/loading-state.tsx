import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { AppCard } from "./app-card";
import { AppText } from "./app-text";
import { SkeletonBlock } from "./skeleton-block";

type LoadingStateProps = {
  label?: string;
};

export const LoadingState = ({ label }: LoadingStateProps) => (
  <AppCard elevated style={{ minHeight: 220 }}>
    <LinearGradient
      colors={["rgba(15, 73, 189, 0.08)", "rgba(255, 127, 80, 0.02)"]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={{
        borderRadius: radius.xl,
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
      }}
    />

    <View style={{ gap: spacing.lg }}>
      <SkeletonBlock borderRadius={radius.round} height={28} width={120} />

      <View style={{ gap: spacing.sm }}>
        <SkeletonBlock height={24} width="68%" />
        <SkeletonBlock height={16} width="92%" />
        <SkeletonBlock height={16} width="78%" />
      </View>

      <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
        <SkeletonBlock borderRadius={radius.md} height={76} />
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <SkeletonBlock
            borderRadius={radius.md}
            height={48}
            style={{ flex: 1 }}
          />
          <SkeletonBlock
            borderRadius={radius.md}
            height={48}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </View>

    {label ? (
      <AppText
        align="center"
        color={colors.text.muted}
        style={{ marginTop: spacing.lg }}
        variant="bodySmall"
      >
        {label}
      </AppText>
    ) : null}
  </AppCard>
);
