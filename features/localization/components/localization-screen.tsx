import { useState } from "react";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { DetailRow } from "../../../components/ui/detail-row";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { LoadingState } from "../../../components/ui/loading-state";
import { PremiumHeroCard } from "../../../components/ui/premium-hero-card";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useAppLanguage } from "../../../hooks/use-app-language";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { colors, spacing } from "../../../theme";
import type { AppLocale } from "../../../types/i18n";
import { useLocalizationScreen } from "../hooks/use-localization-screen";

export const LocalizationScreen = () => {
  const { localizationQuery, screenData } = useLocalizationScreen();
  const { changeLanguage, isRTL, language } = useAppLanguage();
  const { t } = useLocalization();
  const [busyLocale, setBusyLocale] = useState<AppLocale | null>(null);
  const copy =
    language === "ar"
      ? {
          currentTitle: "المظهر الحالي",
          heroBadge: "تجربة ثنائية اللغة",
          heroBody: "اختر اللغة التي يجب أن تقود أسلوب الواجهة، النغمة النصية، واتجاه القراءة داخل التجربة الفاخرة.",
          heroTitle: "اختيار اللغة",
          previewTitle: "معاينة التنسيق",
          subtitle: "اختيار اللغة، معاينة التنسيق، ودعم الاتجاه من اليمين إلى اليسار بنفس لغة الواجهة الراقية.",
          supportTitle: "ماذا يتغير",
          title: "اختيار اللغة",
        }
      : {
          currentTitle: "Current presentation",
          heroBadge: "Bilingual experience",
          heroBody: "Choose the language that should lead the interface tone, formatting, and reading direction across the premium journey.",
          heroTitle: "Language selector",
          previewTitle: "Formatting preview",
          subtitle: "Language choice, formatting preview, and right-to-left support in the same premium interface language.",
          supportTitle: "What changes",
          title: "Language selector",
        };

  const handleLanguageChange = async (nextLocale: AppLocale) => {
    if (busyLocale || nextLocale === language) {
      return;
    }

    setBusyLocale(nextLocale);

    try {
      await changeLanguage(nextLocale);
    } finally {
      setBusyLocale(null);
    }
  };

  return (
    <ScreenContainer
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={() => navigateBackOr(appRoutes.settings)}
        />
      }
      subtitle={copy.subtitle}
      title={copy.title}
      withBottomTabSpacing={false}
    >
      {localizationQuery.isLoading ? <LoadingState label={copy.title} /> : null}

      <PremiumHeroCard
        accent={colors.gradients.primary}
        badge={copy.heroBadge}
        description={copy.heroBody}
        icon="language-outline"
        metrics={[
          {
            icon: "globe-outline",
            label: language === "ar" ? "العربية / English" : "English / العربية",
          },
          {
            icon: "swap-horizontal-outline",
            label: isRTL ? "RTL" : "LTR",
          },
          {
            icon: "sparkles-outline",
            label:
              language === "ar" ? "واجهة متكيفة بالكامل" : "Fully adaptive UI",
          },
        ]}
        title={copy.heroTitle}
      />

      <AppCard elevated>
        <AppText variant="title">{copy.currentTitle}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <DetailRow
            label={language === "ar" ? "اللغة الحالية" : "Current locale"}
            value={screenData.currentLocale}
          />
          <DetailRow
            label={language === "ar" ? "اتجاه القراءة" : "Reading direction"}
            value={isRTL ? "RTL" : "LTR"}
          />
          <DetailRow
            label={language === "ar" ? "عدد الخيارات" : "Available options"}
            value={String(screenData.locales.length)}
          />
        </View>
      </AppCard>

      {screenData.locales.map((locale) => (
        <AppCard elevated={locale.locale === language} key={locale.locale}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="title">{locale.nativeLabel}</AppText>
            <AppText variant="bodySmall">
              {locale.locale === "ar"
                ? "واجهة عربية طبيعية مع دعم كامل للاتجاه من اليمين إلى اليسار."
                : "A clear English interface with premium editorial spacing and formatting."}
            </AppText>
          </View>

          <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
            <DetailRow
              label={language === "ar" ? "مثال العملة" : "Currency example"}
              value={locale.currencyExample}
            />
            <DetailRow
              label={language === "ar" ? "مثال التاريخ" : "Date example"}
              value={locale.dateExample}
            />
          </View>

          <View style={{ marginTop: spacing.lg }}>
            {locale.locale === language ? (
              <PrimaryButton
                label={locale.nativeLabel}
                loading={busyLocale === locale.locale}
                onPress={() => handleLanguageChange(locale.locale)}
                tone={locale.locale === "ar" ? "coral" : "primary"}
              />
            ) : (
              <SecondaryButton
                label={locale.nativeLabel}
                loading={busyLocale === locale.locale}
                onPress={() => handleLanguageChange(locale.locale)}
                tone={locale.locale === "ar" ? "coral" : "primary"}
              />
            )}
          </View>
        </AppCard>
      ))}

      <AppCard>
        <AppText variant="title">{copy.previewTitle}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {screenData.locales.map((locale) => (
            <DetailRow
              key={`preview-${locale.locale}`}
              label={locale.nativeLabel}
              value={`${locale.currencyExample} · ${locale.dateExample}`}
            />
          ))}
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{copy.supportTitle}</AppText>
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <AppText variant="bodySmall">
            {language === "ar"
              ? "تتبدل اللغة النصية، تنسيق العملة والتاريخ، وبعض قرارات الاتجاه البصري على مستوى التطبيق."
              : "Text language, currency/date formatting, and several visual direction decisions update across the app."}
          </AppText>
          <AppText color={colors.text.blue} variant="bodySmall">
            {language === "ar"
              ? "تم تصميم هذه الشاشة لتبدو وكأنها امتداد طبيعي لأسلوب Home وHaya."
              : "This screen is intentionally styled to feel like a natural extension of Home and Haya."}
          </AppText>
        </View>
      </AppCard>
    </ScreenContainer>
  );
};
