import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { DetailRow } from "../../../components/ui/detail-row";
import { MetricChip } from "../../../components/ui/metric-chip";
import { MotionView } from "../../../components/ui/motion-view";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScalePressable } from "../../../components/ui/scale-pressable";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { useLocalization } from "../../../hooks/use-localization";
import { getRemoteImageSource } from "../../../services/media/remote-images";
import { colors, radius, spacing } from "../../../theme";
import type {
  AiAdvisorAssistantStructuredChatMessage,
  AiAdvisorFollowUpQuestion,
  AiAdvisorPackageRecommendationResponse,
} from "../../aiAdvisor/types";
import { demoFlights } from "../../flights/data/flights.mock";
import { demoTravelPackages } from "../../packages/data/demo-travel-packages.seed";
import { formatPackagePrice, resolvePackageImageUrl, resolvePackageText } from "../../packages/helpers/package-helpers";
import { usePackageFavoriteToggle } from "../../packages/hooks/use-package-favorite-toggle";
import { RecommendationMessageCard } from "./recommendation-message-card";

type StructuredAssistantMessageProps = {
  message: AiAdvisorAssistantStructuredChatMessage;
  messageIndex?: number;
  onPackagePress: (
    packageId: AiAdvisorPackageRecommendationResponse["packageId"],
  ) => void;
  onFlightBookPress: (flightId: string) => void;
  onFlightPress: (flightId: string) => void;
  onQuickReplyPress: (quickReply: string) => void;
};

const containsArabicText = (value: string) => /[\u0600-\u06FF]/.test(value);

const getFollowUpQuestionSetText = (
  content: AiAdvisorAssistantStructuredChatMessage["response"],
) => {
  if (content.type !== "follow_up_question_set") {
    return "";
  }

  return [
    content.intro,
    ...content.questions.flatMap((question) => [
      question.helpText ?? "",
      question.question,
      ...question.quickReplies,
    ]),
  ].join(" ");
};

const QuickReplyChip = memo(function QuickReplyChip({
  question,
  selectedReplies,
  onPress,
}: {
  onPress: (question: AiAdvisorFollowUpQuestion, quickReply: string) => void;
  question: AiAdvisorFollowUpQuestion;
  selectedReplies: string[];
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
        {question.quickReplies.map((quickReply) => {
          const selected = selectedReplies.includes(quickReply);

          return (
            <ScalePressable
              key={`${question.id}-${quickReply}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              contentStyle={{
                alignItems: "center",
                backgroundColor: selected
                  ? colors.primary[50]
                  : colors.surface.base,
                borderColor: selected ? colors.primary[500] : colors.border.soft,
                borderRadius: radius.round,
                borderWidth: selected ? 1.5 : 1,
                justifyContent: "center",
                minHeight: 36,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
              }}
              onPress={() => onPress(question, quickReply)}
              scaleTo={0.97}
              style={{ borderRadius: radius.round }}
            >
              <AppText
                color={selected ? colors.primary[700] : colors.text.secondary}
                style={{ fontSize: 12, fontWeight: "600" }}
              >
                {quickReply}
              </AppText>
            </ScalePressable>
          );
        })}
      </View>
    </View>
  );
});

export const StructuredAssistantMessage = memo(function StructuredAssistantMessage({
  message,
  messageIndex = 0,
  onPackagePress,
  onFlightBookPress,
  onFlightPress,
  onQuickReplyPress,
}: StructuredAssistantMessageProps) {
  const { t } = useTranslation();
  const { isRTL } = useAppLanguage();
  const { formatCurrency, language } = useLocalization();
  const content = message.response;
  const favoriteCandidate = useMemo(() => {
    if (
      content.type !== "destination_recommendation" &&
      content.type !== "package_recommendation"
    ) {
      return null;
    }

    const packageId = content.packageId;
    const title = "title" in content ? content.title.toLowerCase() : "";
    const destination =
      "destination" in content ? content.destination.toLowerCase() : "";

    return (
      demoTravelPackages.find((packageItem) => packageItem.id === packageId) ??
      demoTravelPackages.find((packageItem) => {
        const city = resolvePackageText(
          packageItem.destinationCity,
          language,
        ).toLowerCase();
        const packageTitle = resolvePackageText(
          packageItem.title,
          language,
        ).toLowerCase();

        return (
          Boolean(destination && city.includes(destination)) ||
          Boolean(title && packageTitle.includes(title.split(" ")[0] ?? ""))
        );
      }) ??
      null
    );
  }, [content, language]);
  const favoriteAction = usePackageFavoriteToggle(favoriteCandidate);
  const [selectedQuickReplies, setSelectedQuickReplies] = useState<
    Record<string, string[]>
  >({});
  const containerStyle = {
    alignSelf: isRTL ? "flex-end" : "flex-start",
    marginLeft: !isRTL && message.inset ? 44 : 0,
    marginRight: isRTL && message.inset ? 44 : 0,
    width: "84%",
  } as const;
  const selectedResponseLines = useMemo(() => {
    if (content.type !== "follow_up_question_set") {
      return [];
    }

    return content.questions.flatMap((question) =>
      (selectedQuickReplies[question.id] ?? []).map(
        (quickReply) => `${question.question}: ${quickReply}`,
      ),
    );
  }, [content, selectedQuickReplies]);
  const selectedQuickReplyCount = selectedResponseLines.length;
  const handleQuickReplyToggle = useCallback(
    (question: AiAdvisorFollowUpQuestion, quickReply: string) => {
      setSelectedQuickReplies((currentSelections) => {
        const questionSelections = currentSelections[question.id] ?? [];
        const nextQuestionSelections = questionSelections.includes(quickReply)
          ? questionSelections.filter((selection) => selection !== quickReply)
          : [...questionSelections, quickReply];

        if (nextQuestionSelections.length === 0) {
          const { [question.id]: _removed, ...remainingSelections } =
            currentSelections;

          return remainingSelections;
        }

        return {
          ...currentSelections,
          [question.id]: nextQuestionSelections,
        };
      });
    },
    [],
  );
  const handleQuickReplySubmit = useCallback(() => {
    if (selectedResponseLines.length === 0) {
      return;
    }

    onQuickReplyPress(selectedResponseLines.join("\n"));
    setSelectedQuickReplies({});
  }, [onQuickReplyPress, selectedResponseLines]);

  if (content.type === "destination_recommendation") {
    const packageId = content.packageId;

    return (
      <View style={containerStyle}>
        <RecommendationMessageCard
          card={content}
          enteringIndex={messageIndex}
          favoriteAction={
            favoriteCandidate
              ? {
                  accessibilityLabel: favoriteAction.accessibilityLabel,
                  iconName: favoriteAction.iconName,
                  isFavorite: favoriteAction.isFavorite,
                  onPress: favoriteAction.toggleFavorite,
                }
              : undefined
          }
          onPress={packageId ? () => onPackagePress(packageId) : undefined}
        />
      </View>
    );
  }

  if (content.type === "package_recommendation") {
    const packageItem = demoTravelPackages.find(
      (item) => item.id === content.packageId,
    );

    if (!packageItem) {
      return null;
    }

    return (
      <MotionView index={messageIndex} style={containerStyle} variant="chat">
        <AppCard elevated>
          <View style={{ gap: spacing.md }}>
            <Image accessibilityLabel={resolvePackageText(packageItem.title, language)} source={getRemoteImageSource(resolvePackageImageUrl(packageItem.imageUrl))} style={{ borderRadius: radius.md, height: 140, width: "100%" }} />
            <AppText variant="title">{resolvePackageText(packageItem.title, language)}</AppText>
            <AppText color={colors.text.secondary}>{`${resolvePackageText(packageItem.destinationCity, language)}, ${resolvePackageText(packageItem.destinationCountry, language)}`}</AppText>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", flexWrap: "wrap", gap: spacing.xs }}>
              <MetricChip icon="time-outline" label={t("packagesDiscovery.meta.duration", { count: packageItem.durationDays })} />
              <MetricChip icon="star" label={packageItem.rating.toFixed(1)} />
              <MetricChip icon="cash-outline" label={formatPackagePrice(packageItem, language)} />
            </View>
            <AppText color={colors.text.secondary}>{content.summary}</AppText>
            <PrimaryButton fullWidth label={t("heiaChat.viewPackage")} onPress={() => onPackagePress(packageItem.id)} />
          </View>
        </AppCard>
      </MotionView>
    );
  }

  if (content.type === "flight_recommendation") {
    const flight = demoFlights.find((item) => item.id === content.flightId);
    if (!flight) return null;
    return (
      <MotionView index={messageIndex} style={containerStyle} variant="chat">
        <AppCard elevated>
          <View style={{ gap: spacing.md }}>
            <AppText variant="title">{flight.airline}</AppText>
            <AppText variant="bodyStrong">{`${flight.fromCity} (${flight.fromAirport}) → ${flight.toCity} (${flight.toAirport})`}</AppText>
            <DetailRow label={t("heiaChat.flightDeparture")} value={`${flight.departureDate} · ${flight.departureTime}`} />
            <DetailRow label={t("heiaChat.durationLabel")} value={flight.duration} />
            <DetailRow label={t("heiaChat.flightStops")} value={flight.stops === 0 ? t("heiaChat.nonstop") : `${flight.stops}`} />
            <DetailRow label={t("heiaChat.flightCabin")} value={flight.cabin} />
            <DetailRow label={t("heiaChat.flightPrice")} value={formatCurrency(flight.priceFrom, { currency: flight.currency })} />
            <AppText color={colors.text.secondary}>{content.reason}</AppText>
            <PrimaryButton fullWidth label={t("heiaChat.viewFlight")} onPress={() => onFlightPress(flight.id)} />
            <SecondaryButton fullWidth label={t("heiaChat.bookFlight")} onPress={() => onFlightBookPress(flight.id)} />
          </View>
        </AppCard>
      </MotionView>
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
    const titleLocale = containsArabicText(getFollowUpQuestionSetText(content))
      ? "ar"
      : undefined;
    const followUpTitle = titleLocale
      ? t("heiaChat.followUpTitle", { lng: titleLocale })
      : t("heiaChat.followUpTitle");

    return (
      <MotionView index={messageIndex} style={containerStyle} variant="chat">
        <AppCard>
          <AppText variant="title">{followUpTitle}</AppText>
          <AppText>{content.intro}</AppText>
          <View style={{ gap: spacing.md, marginTop: spacing.md }}>
            {content.questions.map((question) => (
              <QuickReplyChip
                key={question.id}
                onPress={handleQuickReplyToggle}
                question={question}
                selectedReplies={selectedQuickReplies[question.id] ?? []}
              />
            ))}
          </View>
          <PrimaryButton
            disabled={selectedQuickReplyCount === 0}
            fullWidth
            icon="send"
            label={t("heiaChat.sendSelectedAnswers")}
            onPress={handleQuickReplySubmit}
            style={{ marginTop: spacing.lg }}
          />
        </AppCard>
      </MotionView>
    );
  }

  return null;
});
