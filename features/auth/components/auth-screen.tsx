import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { LoadingState } from "../../../components/ui/loading-state";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { SearchField } from "../../../components/ui/search-field";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useLocalization } from "../../../hooks/use-localization";
import { colors, radius, shadows, spacing } from "../../../theme";
import type { AppLocale } from "../../../types/i18n";
import type {
  AiAdvisorBudgetLevel,
  AiAdvisorLuxuryLevel,
  AiAdvisorTripType,
} from "../../aiAdvisor/types";
import { useAuthScreen } from "../hooks/use-auth-screen";
import type { AuthFlowStage, AuthTravelerProfile } from "../types";
import { AuthOnboardingProgress } from "./auth-onboarding-progress";
import { AuthShell } from "./auth-shell";
import { AuthSocialPlaceholders } from "./auth-social-placeholders";

type BannerTone = "error" | "notice";

type FeedbackBannerProps = {
  message: string;
  tone: BannerTone;
};

type FieldSectionProps = {
  children: ReactNode;
  label: string;
};

type OptionCardProps = {
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  selected: boolean;
};

type StageToggleProps = {
  onSelect: (stage: Extract<AuthFlowStage, "signIn" | "signUp">) => void;
  stage: Extract<AuthFlowStage, "signIn" | "signUp">;
};

const FeedbackBanner = ({ message, tone }: FeedbackBannerProps) => {
  const toneStyles =
    tone === "error"
      ? {
          backgroundColor: "#FFF3F5",
          borderColor: "#F7D1D9",
          icon: "alert-circle" as const,
          textColor: colors.status.danger,
        }
      : {
          backgroundColor: "#EEF8F2",
          borderColor: "#C9E9D7",
          icon: "checkmark-circle" as const,
          textColor: colors.status.success,
        };

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: toneStyles.backgroundColor,
        borderColor: toneStyles.borderColor,
        borderRadius: radius.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      }}
    >
      <Ionicons
        color={toneStyles.textColor}
        name={toneStyles.icon}
        size={18}
      />
      <AppText color={colors.text.primary} style={{ flex: 1 }} variant="bodySmall">
        {message}
      </AppText>
    </View>
  );
};

const FieldSection = ({ children, label }: FieldSectionProps) => (
  <View style={{ gap: spacing.xs }}>
    <AppText color={colors.text.primary} variant="caption">
      {label}
    </AppText>
    {children}
  </View>
);

const OptionCard = ({
  description,
  icon,
  label,
  onPress,
  selected,
}: OptionCardProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      flexBasis: "48%",
      flexGrow: 1,
      transform: [{ scale: pressed ? 0.985 : 1 }],
    })}
  >
    <View
      style={[
        shadows.card,
        {
          backgroundColor: selected ? colors.navy[700] : colors.surface.base,
          borderColor: selected ? colors.navy[700] : colors.border.soft,
          borderRadius: radius.md,
          borderWidth: 1,
          gap: spacing.sm,
          minHeight: 112,
          padding: spacing.md,
        },
      ]}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: selected ? "rgba(255,255,255,0.12)" : colors.background.subtle,
          borderRadius: radius.round,
          height: 40,
          justifyContent: "center",
          width: 40,
        }}
      >
        <Ionicons
          color={selected ? colors.text.inverse : colors.primary[500]}
          name={icon}
          size={18}
        />
      </View>
      <View style={{ gap: spacing.xxs }}>
        <AppText
          color={selected ? colors.text.inverse : colors.text.primary}
          variant="label"
        >
          {label}
        </AppText>
        {description ? (
          <AppText
            color={selected ? "rgba(255,255,255,0.74)" : colors.text.secondary}
            variant="bodySmall"
          >
            {description}
          </AppText>
        ) : null}
      </View>
    </View>
  </Pressable>
);

const StageToggle = ({ onSelect, stage }: StageToggleProps) => {
  const { isRTL, t } = useLocalization();

  return (
    <View
      style={{
        backgroundColor: colors.background.subtle,
        borderRadius: radius.round,
        flexDirection: isRTL ? "row-reverse" : "row",
        padding: spacing.xxs,
      }}
    >
      {(["signIn", "signUp"] as const).map((item) => {
        const selected = stage === item;
        const label =
          item === "signIn"
            ? t("authFlow.signIn.tabLabel")
            : t("authFlow.signUp.tabLabel");

        return (
          <Pressable
            key={item}
            onPress={() => onSelect(item)}
            style={({ pressed }) => ({
              flex: 1,
              opacity: pressed ? 0.92 : 1,
            })}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: selected ? colors.surface.base : "transparent",
                borderRadius: radius.round,
                minHeight: 48,
                justifyContent: "center",
                paddingHorizontal: spacing.md,
              }}
            >
              <AppText
                color={selected ? colors.text.primary : colors.text.secondary}
                variant="label"
              >
                {label}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export const AuthScreen = () => {
  const { t } = useLocalization();
  const {
    authProviders,
    busyAction,
    continueToApp,
    currentOnboardingStep,
    errorMessage,
    formValues,
    guestModeEnabled,
    goToNextOnboardingStep,
    goToPreviousOnboardingStep,
    handleGuestMode,
    handlePreferredLanguageChange,
    handleSignOut,
    handleSocialPlaceholderPress,
    hasCompletedOnboarding,
    hasSession,
    isInitializing,
    noticeMessage,
    onboardingStepIndex,
    onboardingSteps,
    onboardingValues,
    openStage,
    session,
    setFormValue,
    setOnboardingValue,
    stage,
    submitForgotPassword,
    submitSignIn,
    submitSignUp,
  } = useAuthScreen();

  const heroBadges = [
    t("authFlow.hero.badges.concierge"),
    t("authFlow.hero.badges.heia"),
    t("authFlow.hero.badges.flexible"),
  ];

  const socialProviders = authProviders
    .filter((provider): provider is "apple" | "google" => provider !== "email")
    .map((provider) => ({
      icon: provider === "apple" ? ("logo-apple" as const) : ("logo-google" as const),
      id: provider,
      label: t(`authFlow.social.providers.${provider}`),
    }));

  const heroTitle =
    stage === "forgotPassword"
      ? t("authFlow.forgotPassword.heroTitle")
      : stage === "onboarding"
        ? t("authFlow.onboarding.heroTitle")
        : stage === "signIn"
          ? t("authFlow.signIn.heroTitle")
          : stage === "signUp"
            ? t("authFlow.signUp.heroTitle")
            : hasSession
              ? t("authFlow.authenticated.heroTitle", {
                  name: session?.firstName ?? t("common.appName"),
                })
              : t("authFlow.welcome.heroTitle");

  const heroSubtitle =
    stage === "forgotPassword"
      ? t("authFlow.forgotPassword.heroSubtitle")
      : stage === "onboarding"
        ? t("authFlow.onboarding.heroSubtitle")
        : stage === "signIn"
          ? t("authFlow.signIn.heroSubtitle")
          : stage === "signUp"
            ? t("authFlow.signUp.heroSubtitle")
            : hasSession
              ? t("authFlow.authenticated.heroSubtitle")
              : t("authFlow.welcome.heroSubtitle");

  const languageOptions: {
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: AppLocale;
  }[] = [
    {
      description: t("authFlow.onboarding.options.language.enDescription"),
      icon: "language-outline",
      label: t("common.english"),
      value: "en",
    },
    {
      description: t("authFlow.onboarding.options.language.arDescription"),
      icon: "globe-outline",
      label: t("common.arabic"),
      value: "ar",
    },
  ];

  const travelerOptions: {
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: AuthTravelerProfile;
  }[] = [
    {
      description: t("authFlow.onboarding.options.traveler.businessDescription"),
      icon: "briefcase-outline",
      label: t("authFlow.onboarding.options.traveler.business"),
      value: "business",
    },
    {
      description: t("authFlow.onboarding.options.traveler.couplesDescription"),
      icon: "heart-outline",
      label: t("authFlow.onboarding.options.traveler.couples"),
      value: "couples",
    },
    {
      description: t("authFlow.onboarding.options.traveler.familyDescription"),
      icon: "people-outline",
      label: t("authFlow.onboarding.options.traveler.family"),
      value: "family",
    },
    {
      description: t("authFlow.onboarding.options.traveler.soloDescription"),
      icon: "person-outline",
      label: t("authFlow.onboarding.options.traveler.solo"),
      value: "solo",
    },
  ];

  const budgetOptions: {
    label: string;
    value: AiAdvisorBudgetLevel;
  }[] = [
    {
      label: t("authFlow.onboarding.options.budget.smart"),
      value: "smart",
    },
    {
      label: t("authFlow.onboarding.options.budget.premium"),
      value: "premium",
    },
    {
      label: t("authFlow.onboarding.options.budget.luxury"),
      value: "luxury",
    },
  ];

  const tripTypeOptions: {
    label: string;
    value: AiAdvisorTripType;
  }[] = [
    { label: t("authFlow.onboarding.options.tripType.adventure"), value: "adventure" },
    { label: t("authFlow.onboarding.options.tripType.family"), value: "family" },
    { label: t("authFlow.onboarding.options.tripType.friends"), value: "friends" },
    { label: t("authFlow.onboarding.options.tripType.luxury"), value: "luxury" },
    { label: t("authFlow.onboarding.options.tripType.solo"), value: "solo" },
    { label: t("authFlow.onboarding.options.tripType.wellness"), value: "wellness" },
  ];

  const luxuryOptions: {
    label: string;
    value: AiAdvisorLuxuryLevel;
  }[] = [
    { label: t("authFlow.onboarding.options.luxury.comfort"), value: "comfort" },
    { label: t("authFlow.onboarding.options.luxury.premium"), value: "premium" },
    { label: t("authFlow.onboarding.options.luxury.luxury"), value: "luxury" },
    {
      label: t("authFlow.onboarding.options.luxury.ultraLuxury"),
      value: "ultraLuxury",
    },
  ];

  const renderFormHeader = (title: string, subtitle: string) => (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="headline">{title}</AppText>
      <AppText>{subtitle}</AppText>
    </View>
  );

  const renderWelcomeScreen = () => {
    if (hasSession) {
      return (
        <View style={{ gap: spacing.lg }}>
          {renderFormHeader(
            t("authFlow.authenticated.title", {
              name: session?.firstName ?? t("common.appName"),
            }),
            t("authFlow.authenticated.subtitle"),
          )}

          <PrimaryButton
            label={t("authFlow.authenticated.continueCta")}
            onPress={continueToApp}
          />
          <SecondaryButton
            label={t("authFlow.authenticated.refineCta")}
            onPress={() => openStage("onboarding")}
            tone="navy"
          />
          <SecondaryButton
            label={t("authFlow.authenticated.signOutCta")}
            loading={busyAction === "signOut"}
            onPress={() => void handleSignOut()}
            tone="coral"
          />
        </View>
      );
    }

    return (
      <View style={{ gap: spacing.xl }}>
        {renderFormHeader(
          t("authFlow.welcome.title"),
          t("authFlow.welcome.subtitle"),
        )}

        <View style={{ gap: spacing.md }}>
          <PrimaryButton
            label={t("authFlow.welcome.signInCta")}
            onPress={() => openStage("signIn")}
          />
          <SecondaryButton
            label={t("authFlow.welcome.signUpCta")}
            onPress={() => openStage("signUp")}
            tone="navy"
          />
        </View>

        <AuthSocialPlaceholders
          onPress={handleSocialPlaceholderPress}
          providers={socialProviders}
          title={t("authFlow.social.title")}
        />

        <LinearGradient
          colors={["#FFF8F2", "#FFF2EA"]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={{
            borderColor: "#F5DCCC",
            borderRadius: radius.lg,
            borderWidth: 1,
            gap: spacing.md,
            padding: spacing.lg,
          }}
        >
          <View style={{ gap: spacing.xs }}>
            <AppText color={colors.text.primary} variant="title">
              {t("authFlow.guest.title")}
            </AppText>
            <AppText>{t("authFlow.guest.subtitle")}</AppText>
          </View>

          <SecondaryButton
            label={
              guestModeEnabled && hasCompletedOnboarding
                ? t("authFlow.guest.resumeCta")
                : t("authFlow.guest.cta")
            }
            loading={busyAction === "guest"}
            onPress={() =>
              guestModeEnabled && hasCompletedOnboarding
                ? continueToApp()
                : void handleGuestMode()
            }
            tone="coral"
          />
        </LinearGradient>
      </View>
    );
  };

  const renderAuthForm = () => {
    const isSignIn = stage === "signIn";

    return (
      <View style={{ gap: spacing.lg }}>
        <StageToggle
          onSelect={(nextStage) => openStage(nextStage)}
          stage={isSignIn ? "signIn" : "signUp"}
        />

        {renderFormHeader(
          isSignIn ? t("authFlow.signIn.title") : t("authFlow.signUp.title"),
          isSignIn
            ? t("authFlow.signIn.subtitle")
            : t("authFlow.signUp.subtitle"),
        )}

        <View style={{ gap: spacing.md }}>
          {!isSignIn ? (
            <FieldSection label={t("authFlow.fields.firstName.label")}>
              <SearchField
                autoCapitalize="words"
                autoCorrect={false}
                icon="person-outline"
                onChangeText={(value) => setFormValue("firstName", value)}
                placeholder={t("authFlow.fields.firstName.placeholder")}
                value={formValues.firstName}
              />
            </FieldSection>
          ) : null}

          <FieldSection label={t("authFlow.fields.email.label")}>
            <SearchField
              autoCapitalize="none"
              autoCorrect={false}
              icon="mail-outline"
              keyboardType="email-address"
              onChangeText={(value) => setFormValue("email", value)}
              placeholder={t("authFlow.fields.email.placeholder")}
              value={formValues.email}
            />
          </FieldSection>

          <FieldSection label={t("authFlow.fields.password.label")}>
            <SearchField
              autoCapitalize="none"
              autoCorrect={false}
              icon="lock-closed-outline"
              onChangeText={(value) => setFormValue("password", value)}
              placeholder={t("authFlow.fields.password.placeholder")}
              secureTextEntry
              value={formValues.password}
            />
          </FieldSection>
        </View>

        {isSignIn ? (
          <Pressable onPress={() => openStage("forgotPassword")}>
            <AppText color={colors.text.blue} variant="label">
              {t("authFlow.signIn.forgotPasswordCta")}
            </AppText>
          </Pressable>
        ) : null}

        <View style={{ gap: spacing.md }}>
          <PrimaryButton
            label={
              isSignIn
                ? t("authFlow.signIn.primaryCta")
                : t("authFlow.signUp.primaryCta")
            }
            loading={busyAction === (isSignIn ? "signIn" : "signUp")}
            onPress={() =>
              isSignIn ? void submitSignIn() : void submitSignUp()
            }
          />
          <SecondaryButton
            label={t("authFlow.common.backToWelcome")}
            onPress={() => openStage("welcome")}
            tone="navy"
          />
        </View>

        <AuthSocialPlaceholders
          onPress={handleSocialPlaceholderPress}
          providers={socialProviders}
          title={t("authFlow.social.title")}
        />
      </View>
    );
  };

  const renderForgotPassword = () => (
    <View style={{ gap: spacing.lg }}>
      {renderFormHeader(
        t("authFlow.forgotPassword.title"),
        t("authFlow.forgotPassword.subtitle"),
      )}

      <FieldSection label={t("authFlow.fields.email.label")}>
        <SearchField
          autoCapitalize="none"
          autoCorrect={false}
          icon="mail-outline"
          keyboardType="email-address"
          onChangeText={(value) => setFormValue("email", value)}
          placeholder={t("authFlow.fields.email.placeholder")}
          value={formValues.email}
        />
      </FieldSection>

      <View style={{ gap: spacing.md }}>
        <PrimaryButton
          label={t("authFlow.forgotPassword.primaryCta")}
          loading={busyAction === "forgotPassword"}
          onPress={() => void submitForgotPassword()}
        />
        <SecondaryButton
          label={t("authFlow.forgotPassword.secondaryCta")}
          onPress={() => openStage("signIn")}
          tone="navy"
        />
      </View>
    </View>
  );

  const renderOnboardingStepContent = () => {
    if (!currentOnboardingStep) {
      return null;
    }

    if (currentOnboardingStep.id === "language") {
      return (
        <View style={{ gap: spacing.md }}>
          <FieldSection label={t("authFlow.onboarding.fields.preferredLanguage")}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {languageOptions.map((option) => (
                <OptionCard
                  description={option.description}
                  icon={option.icon}
                  key={option.value}
                  label={option.label}
                  onPress={() => void handlePreferredLanguageChange(option.value)}
                  selected={onboardingValues.preferredLanguage === option.value}
                />
              ))}
            </View>
          </FieldSection>
        </View>
      );
    }

    if (currentOnboardingStep.id === "traveler") {
      return (
        <View style={{ gap: spacing.lg }}>
          <FieldSection label={t("authFlow.onboarding.fields.travelerProfile")}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {travelerOptions.map((option) => (
                <OptionCard
                  description={option.description}
                  icon={option.icon}
                  key={option.value}
                  label={option.label}
                  onPress={() => setOnboardingValue("travelerProfile", option.value)}
                  selected={onboardingValues.travelerProfile === option.value}
                />
              ))}
            </View>
          </FieldSection>

          <FieldSection label={t("authFlow.onboarding.fields.tripType")}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {tripTypeOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  onPress={() => setOnboardingValue("tripType", option.value)}
                  selected={onboardingValues.tripType === option.value}
                  tone="primary"
                />
              ))}
            </View>
          </FieldSection>
        </View>
      );
    }

    if (currentOnboardingStep.id === "travelStyle") {
      return (
        <View style={{ gap: spacing.lg }}>
          <FieldSection label={t("authFlow.onboarding.fields.budgetLevel")}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {budgetOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  onPress={() => setOnboardingValue("budgetLevel", option.value)}
                  selected={onboardingValues.budgetLevel === option.value}
                  tone="coral"
                />
              ))}
            </View>
          </FieldSection>

          <FieldSection label={t("authFlow.onboarding.fields.budgetRange")}>
            <View style={{ gap: spacing.md }}>
              <SearchField
                icon="wallet-outline"
                keyboardType="number-pad"
                onChangeText={(value) => setOnboardingValue("budgetMin", value)}
                placeholder={t("authFlow.fields.budgetMin.placeholder")}
                value={onboardingValues.budgetMin}
              />
              <SearchField
                icon="wallet-outline"
                keyboardType="number-pad"
                onChangeText={(value) => setOnboardingValue("budgetMax", value)}
                placeholder={t("authFlow.fields.budgetMax.placeholder")}
                value={onboardingValues.budgetMax}
              />
            </View>
          </FieldSection>

          <FieldSection label={t("authFlow.onboarding.fields.luxuryLevel")}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {luxuryOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  onPress={() => setOnboardingValue("luxuryLevel", option.value)}
                  selected={onboardingValues.luxuryLevel === option.value}
                  tone="navy"
                />
              ))}
            </View>
          </FieldSection>
        </View>
      );
    }

    return (
      <View style={{ gap: spacing.md }}>
        <FieldSection label={t("authFlow.onboarding.fields.favoriteDestinations")}>
          <SearchField
            icon="heart-outline"
            multiline
            onChangeText={(value) => setOnboardingValue("favoriteDestinations", value)}
            placeholder={t("authFlow.fields.favoriteDestinations.placeholder")}
            value={onboardingValues.favoriteDestinations}
          />
        </FieldSection>

        <FieldSection label={t("authFlow.onboarding.fields.departureLocation")}>
          <SearchField
            icon="airplane-outline"
            onChangeText={(value) => setOnboardingValue("departureLocation", value)}
            placeholder={t("authFlow.fields.departureLocation.placeholder")}
            value={onboardingValues.departureLocation}
          />
        </FieldSection>
      </View>
    );
  };

  const renderOnboarding = () => (
    <View style={{ gap: spacing.xl }}>
      <AuthOnboardingProgress
        currentStepIndex={onboardingStepIndex}
        description={currentOnboardingStep?.description ?? ""}
        title={currentOnboardingStep?.title ?? ""}
        totalSteps={onboardingSteps.length}
      />

      <AppCard
        style={{
          backgroundColor: guestModeEnabled ? "#FFF8F2" : colors.background.subtle,
          borderColor: guestModeEnabled ? "#F5DCCC" : colors.border.soft,
          gap: spacing.xs,
          padding: spacing.md,
        }}
      >
        <AppText color={colors.text.primary} variant="label">
          {guestModeEnabled
            ? t("authFlow.onboarding.guestModeTitle")
            : t("authFlow.onboarding.syncTitle")}
        </AppText>
        <AppText variant="bodySmall">
          {guestModeEnabled
            ? t("authFlow.onboarding.guestModeSubtitle")
            : t("authFlow.onboarding.syncSubtitle")}
        </AppText>
      </AppCard>

      {renderOnboardingStepContent()}

      <View style={{ gap: spacing.md }}>
        <PrimaryButton
          label={
            onboardingStepIndex === onboardingSteps.length - 1
              ? t("authFlow.onboarding.finishCta")
              : t("authFlow.onboarding.nextCta")
          }
          loading={busyAction === "onboarding"}
          onPress={() => void goToNextOnboardingStep()}
        />
        <SecondaryButton
          label={t("authFlow.onboarding.backCta")}
          onPress={goToPreviousOnboardingStep}
          tone="navy"
        />
      </View>
    </View>
  );

  return (
    <AuthShell badgeLabels={heroBadges} subtitle={heroSubtitle} title={heroTitle}>
      <AppCard elevated style={{ gap: spacing.xl, padding: spacing.xl }}>
        {errorMessage ? <FeedbackBanner message={errorMessage} tone="error" /> : null}
        {noticeMessage ? <FeedbackBanner message={noticeMessage} tone="notice" /> : null}

        {isInitializing ? (
          <LoadingState label={t("authFlow.loading")} />
        ) : stage === "welcome" ? (
          renderWelcomeScreen()
        ) : stage === "signIn" || stage === "signUp" ? (
          renderAuthForm()
        ) : stage === "forgotPassword" ? (
          renderForgotPassword()
        ) : (
          renderOnboarding()
        )}
      </AppCard>
    </AuthShell>
  );
};
