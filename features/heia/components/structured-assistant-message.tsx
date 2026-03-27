import { memo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { DetailRow } from "../../../components/ui/detail-row";
import { MetricChip } from "../../../components/ui/metric-chip";
import { MotionView } from "../../../components/ui/motion-view";
import { PackageCard } from "../../../components/ui/package-card";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { useLocalization } from "../../../hooks/use-localization";
import { colors, radius, spacing } from "../../../theme";
import { getAiAdvisorPackageCatalogItem } from "../../aiAdvisor/data/ai-advisor.mock";
import type {
  AiAdvisorAssistantStructuredChatMessage,
  AiAdvisorFollowUpQuestion,
  AiAdvisorPackageRecommendationResponse,
} from "../../aiAdvisor/types";
import { RecommendationMessageCard } from "./recommendation-message-card";

type StructuredAssistantMessageProps = {
  message: AiAdvisorAssistantStructuredChatMessage;
  messageIndex?: number;
  onPackagePress: (
    packageId: AiAdvisorPackageRecommendationResponse["packageId"],
  ) => void;
  onQuickReplyPress: (quickReply: string) => void;
};

const QuickReplyChip = memo(function QuickReplyChip({
  question,
  onPress,
}: {
  onPress: (quickReply: string) => void;
  question: AiAdvisorFollowUpQuestion;
}) {
  return (
  <View style={{ gap: spacing.sm }}>
    <View style={{ gap: spacing.xxs }}>
      <AppText variant="label">{question.question}</AppText>
      {question.helpText ? (
        <AppText color={colors.text.muted} variant="bodySmall">
          {question.helpText}
        </AppText>
      ) : null}
    </View>
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
      }}
    >
      {question.quickReplies.map((quickReply) => (
        <ScalePressable
          key={`${question.id}-${quickReply}`}
          accessibilityRole="button"
          contentStyle={{
            alignItems: "center",
            backgroundColor: colors.surface.base,
            borderColor: colors.border.soft,
            borderRadius: radius.round,
            borderWidth: 1,
            justifyContent: "center",
            minHeight: 36,
            paddingHorizontal: spacing.md,
          }}
          onPress={() => onPress(quickReply)}
          scaleTo={0.97}
          style={{ borderRadius: radius.round }}
        >
          <AppText
            color={colors.text.secondary}
            style={{ fontSize: 12, fontWeight: "600" }}
          >
            {quickReply}
          </AppText>
        </ScalePressable>
      ))}
    </View>
  </View>
  );
});

export const StructuredAssistantMessage = memo(function StructuredAssistantMessage({
  message,
  messageIndex = 0,
  onPackagePress,
  onQuickReplyPress,
}: StructuredAssistantMessageProps) {
  const { t } = useTranslation();
  const { isRTL } = useAppLanguage();
  const { formatCurrency } = useLocalization();
  const content = message.response;
  const containerStyle = {
    alignSelf: isRTL ? "flex-end" : "flex-start",
    marginLeft: !isRTL && message.inset ? 44 : 0,
    marginRight: isRTL && message.inset ? 44 : 0,
    width: "84%",
  } as const;

  if (content.type === "destination_recommendation") {
    const packageId = content.packageId;

    return (
      <View style={containerStyle}>
        <RecommendationMessageCard
          card={content}
          enteringIndex={messageIndex}
          onPress={packageId ? () => onPackagePress(packageId) : undefined}
        />
      </View>
    );
  }

  if (content.type === "package_recommendation") {
    const packageOffer = getAiAdvisorPackageCatalogItem(
      content.packageId,
    ).offer;

    return (
      <View style={containerStyle}>
        <PackageCard
          actionLabel={content.ctaLabel}
          enteringIndex={messageIndex}
          offer={packageOffer}
          onActionPress={() => onPackagePress(content.packageId)}
        />
        <MotionView
          index={messageIndex + 1}
          style={{ marginTop: spacing.sm }}
          variant="chat"
        >
          <AppCard>
            <AppText variant="title">{content.title}</AppText>
            <AppText>{content.summary}</AppText>
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                flexWrap: "wrap",
                gap: spacing.xs,
                marginTop: spacing.md,
              }}
            >
              {content.highlights.map((highlight) => (
                <MetricChip
                  key={highlight}
                  icon="sparkles-outline"
                  label={highlight}
                />
              ))}
            </View>
          </AppCard>
        </MotionView>
      </View>
    );
  }

  if (content.type === "itinerary_suggestion") {
    return (
      <MotionView index={messageIndex} style={containerStyle} variant="chat">
        <AppCard>
          <AppText variant="title">{content.title}</AppText>
          <AppText>{content.summary}</AppText>
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            <DetailRow
              label={t("heiaChat.durationLabel")}
              value={`${content.durationDays}`}
            />
            <DetailRow
              label={t("heiaChat.estimatedBudget")}
              value={formatCurrency(content.estimatedBudget)}
            />
          </View>
          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            {content.days.map((day) => (
              <View
                key={day.dayLabel}
                style={{
                  borderLeftColor: isRTL ? "transparent" : colors.border.soft,
                  borderLeftWidth: isRTL ? 0 : 2,
                  borderRightColor: isRTL ? colors.border.soft : "transparent",
                  borderRightWidth: isRTL ? 2 : 0,
                  gap: spacing.xxs,
                  paddingHorizontal: spacing.md,
                }}
              >
                <AppText color={colors.primary[600]} variant="label">
                  {day.dayLabel}
                </AppText>
                <AppText variant="bodyStrong">{day.title}</AppText>
                <AppText color={colors.text.secondary} variant="bodySmall">
                  {day.summary}
                </AppText>
              </View>
            ))}
          </View>
        </AppCard>
      </MotionView>
    );
  }

  if (content.type === "follow_up_question_set") {
    return (
      <MotionView index={messageIndex} style={containerStyle} variant="chat">
        <AppCard>
          <AppText variant="title">{t("heiaChat.followUpTitle")}</AppText>
          <AppText>{content.intro}</AppText>
          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            {content.questions.map((question) => (
              <QuickReplyChip
                key={question.id}
                onPress={onQuickReplyPress}
                question={question}
              />
            ))}
          </View>
        </AppCard>
      </MotionView>
    );
  }

  return null;
});
