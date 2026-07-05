import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { PremiumHeroCard } from "../../../components/ui/premium-hero-card";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useLocalization } from "../../../hooks/use-localization";
import { appRoutes } from "../../../navigation/routes";
import { useTutorialStore } from "../../../store/tutorial-store";
import { colors, radius, spacing } from "../../../theme";

type TutorialStep = {
  body: string;
  title: string;
};

const tutorialIcons = [
  "sparkles-outline",
  "airplane-outline",
  "chatbubble-ellipses-outline",
  "heart-outline",
  "briefcase-outline",
  "notifications-outline",
] as const;

const defaultTutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to Haya Trips",
    body: "Your premium space to plan, demo book, and track your trips.",
  },
  {
    title: "Explore flights and packages",
    body: "Search destinations, compare packages, and open the details that matter.",
  },
  {
    title: "Ask Haya",
    body: "The AI assistant helps you choose ideas that fit your travel style.",
  },
  {
    title: "Save favorites",
    body: "Keep important destinations and packages close at hand.",
  },
  {
    title: "Book and track",
    body: "Create local demo bookings and find them again in My Trips.",
  },
  {
    title: "Notifications",
    body: "Turn on reminders for travel and booking updates.",
  },
];

const firstDefaultTutorialStep: TutorialStep = {
  body: "Your premium space to plan, demo book, and track your trips.",
  title: "Welcome to Haya Trips",
};

const safeText = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;

const normalizeTutorialSteps = (value: unknown) => {
  if (!Array.isArray(value)) {
    return defaultTutorialSteps;
  }

  const steps = value
    .map((step, stepIndex) => {
      if (!step || typeof step !== "object") {
        return null;
      }

      const fallbackStep =
        defaultTutorialSteps[stepIndex] ?? firstDefaultTutorialStep;
      const maybeStep = step as Partial<TutorialStep>;

      return {
        body: safeText(maybeStep.body, fallbackStep.body),
        title: safeText(maybeStep.title, fallbackStep.title),
      };
    })
    .filter((step): step is TutorialStep => Boolean(step));

  return steps.length > 0 ? steps : defaultTutorialSteps;
};

export const FirstTimeTutorialScreen = () => {
  const { t } = useLocalization();
  const completeTutorial = useTutorialStore((state) => state.completeTutorial);
  const [index, setIndex] = useState(0);
  const translate = (key: string, fallback: string) =>
    safeText(t(key, { defaultValue: fallback }), fallback);
  const steps = useMemo(
    () => normalizeTutorialSteps(t("tutorial.steps", { returnObjects: true })),
    [t],
  );
  const currentStep = steps[index] ?? steps[0] ?? firstDefaultTutorialStep;
  const isFinalStep = index >= steps.length - 1;

  const finish = () => {
    if (typeof completeTutorial === "function") {
      completeTutorial();
    }

    if (typeof router.replace === "function") {
      router.replace(appRoutes.home);
    }
  };

  return (
    <ScreenContainer
      subtitle={translate("tutorial.subtitle", "A quick guide before you start.")}
      title={translate("tutorial.title", "Haya Trips Guide")}
      withBottomTabSpacing={false}
    >
      <PremiumHeroCard
        accent={colors.gradients.navy}
        badge={`${index + 1} / ${steps.length}`}
        description={currentStep?.body ?? ""}
        icon={tutorialIcons[index] ?? "sparkles-outline"}
        metrics={[
          { icon: "shield-checkmark-outline", label: "Demo-ready" },
          { icon: "phone-portrait-outline", label: "Android" },
          { icon: "globe-outline", label: "EN / AR / FR" },
        ]}
        title={currentStep.title}
      />

      <AppCard>
        <View style={{ alignItems: "center", gap: spacing.lg }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: colors.background.softBlue,
              borderRadius: radius.round,
              height: 88,
              justifyContent: "center",
              width: 88,
            }}
          >
            <Ionicons
              color={colors.primary[500]}
              name={tutorialIcons[index] ?? "sparkles-outline"}
              size={38}
            />
          </View>
          <View style={{ alignItems: "center", gap: spacing.sm }}>
            <AppText align="center" variant="headline">
              {currentStep.title}
            </AppText>
            <AppText align="center">{currentStep.body}</AppText>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.xs }}>
            {steps.map((step, stepIndex) => (
              <Chip
                key={step.title}
                label={`${stepIndex + 1}`}
                selected={stepIndex === index}
                tone="primary"
              />
            ))}
          </View>
        </View>
      </AppCard>

      <View style={{ gap: spacing.md }}>
        <PrimaryButton
          label={
            isFinalStep
              ? translate("tutorial.start", "Start exploring")
              : translate("tutorial.continue", "Continue")
          }
          onPress={() => {
            if (isFinalStep) {
              finish();
              return;
            }

            setIndex((currentIndex) => currentIndex + 1);
          }}
        />
        <SecondaryButton
          label={translate("tutorial.skip", "Skip")}
          onPress={finish}
          tone="navy"
        />
      </View>
    </ScreenContainer>
  );
};
