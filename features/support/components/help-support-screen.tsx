import { router } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { PremiumHeroCard } from "../../../components/ui/premium-hero-card";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SearchField } from "../../../components/ui/search-field";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { colors, spacing } from "../../../theme";
import { resolveLocalizedValue } from "../../../utils/localized";

const faqEntries = [
  {
    answer: {
      ar: "يمكنك البدء من هيا أو شاشة النتائج أو العروض. عند اقترابك من الحجز، ستنتقل تلقائياً إلى تفاصيل الرحلة والدفع.",
      en: "You can begin in Heia, Search Results, or Offers. As you get closer to booking, the flow naturally moves into trip details and checkout.",
    },
    question: {
      ar: "كيف أبدأ التخطيط داخل التطبيق؟",
      en: "Where should I start planning inside the app?",
    },
  },
  {
    answer: {
      ar: "اللغة تغيّر النصوص، تنسيق التواريخ والعملات، وبعض قرارات اتجاه الواجهة. يمكنك تعديلها من شاشة Language Selector.",
      en: "Language changes copy, date and currency formatting, and several directional UI decisions. You can update it from the Language Selector screen.",
    },
    question: {
      ar: "هل يؤثر تغيير اللغة على أسلوب الواجهة؟",
      en: "Does changing the language affect the interface style?",
    },
  },
  {
    answer: {
      ar: "عند ضعف الشبكة أو انقطاعها، تستمر بعض الأسطح المحلية مثل الرحلات المحفوظة والعناصر المخزنة مؤقتاً، وتعود المزامنة تلقائياً عند تحسن الاتصال.",
      en: "When the network is weak or offline, local surfaces like saved trips and cached items remain available, and sync resumes automatically when connectivity improves.",
    },
    question: {
      ar: "ماذا يحدث إذا أصبح الاتصال ضعيفاً؟",
      en: "What happens if the connection becomes weak?",
    },
  },
];

export const HelpSupportScreen = () => {
  const { language, t } = useLocalization();
  const [query, setQuery] = useState("");
  const copy =
    language === "ar"
      ? {
          channelsBody: "ابدأ بالمساعد الذكي، ثم انتقل إلى الإشعارات أو الإعدادات إذا احتجت دعماً أكثر تحديداً.",
          channelsTitle: "قنوات الدعم",
          faqTitle: "أسئلة شائعة",
          heroBadge: "دعم راقٍ وسريع",
          heroBody: "هذه الشاشة تجمع مداخل المساعدة العملية، الأسئلة السريعة، وروابط معاينة الحالات المهمة قبل الإطلاق.",
          heroTitle: "المساعدة والدعم",
          noResults: "لم نجد موضوعاً مطابقاً. جرّب كلمات أبسط أو افتح هيا للبدء.",
          previewBody: "روابط سريعة لمراجعة حالات Empty, Error, وOffline أثناء التجهيز للإطلاق.",
          previewTitle: "معاينة الحالات",
          searchPlaceholder: "ابحث عن سؤال أو موضوع",
          subtitle: "الأسئلة السريعة، قنوات الدعم، وروابط مراجعة حالات التطبيق قبل الإطلاق.",
          title: "المساعدة والدعم",
        }
      : {
          channelsBody: "Start with the AI assistant, then move into notifications or settings if you need a more specific support path.",
          channelsTitle: "Support channels",
          faqTitle: "Frequently asked questions",
          heroBadge: "Fast premium support",
          heroBody: "This screen brings together practical help entry points, quick questions, and review links for important launch states.",
          heroTitle: "Help and support",
          noResults: "No matching topic showed up. Try a simpler phrase or open Heia to start the conversation.",
          previewBody: "Quick links for reviewing Empty, Error, and Offline states during launch prep.",
          previewTitle: "State previews",
          searchPlaceholder: "Search a question or topic",
          subtitle: "Quick answers, support channels, and state review links for pre-launch readiness.",
          title: "Help and support",
        };
  const filteredFaq = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return faqEntries;
    }

    return faqEntries.filter((entry) => {
      const localizedQuestion = resolveLocalizedValue(language, entry.question);
      const localizedAnswer = resolveLocalizedValue(language, entry.answer);

      return (
        localizedQuestion.toLowerCase().includes(normalizedQuery) ||
        localizedAnswer.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [language, query]);

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
      <PremiumHeroCard
        accent={colors.gradients.navy}
        badge={copy.heroBadge}
        description={copy.heroBody}
        icon="help-circle-outline"
        metrics={[
          {
            icon: "time-outline",
            label:
              language === "ar"
                ? "إجابات فورية داخل التطبيق"
                : "In-app answers right away",
          },
          {
            icon: "chatbubble-ellipses-outline",
            label:
              language === "ar" ? "هيا كطبقة دعم أولى" : "Heia as first-line help",
          },
          {
            icon: "shield-checkmark-outline",
            label:
              language === "ar"
                ? "روابط مراجعة قبل الإطلاق"
                : "Launch review links",
          },
        ]}
        title={copy.heroTitle}
      />

      <AppCard elevated>
        <SearchField
          icon="search"
          onChangeText={setQuery}
          placeholder={copy.searchPlaceholder}
          value={query}
        />
      </AppCard>

      <AppCard>
        <AppText variant="title">{copy.faqTitle}</AppText>
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          {filteredFaq.length === 0 ? (
            <EmptyState
              description={copy.noResults}
              icon="search-outline"
              title={copy.faqTitle}
            />
          ) : (
            filteredFaq.map((entry) => (
              <View
                key={resolveLocalizedValue(language, entry.question)}
                style={{ gap: spacing.xs }}
              >
                <AppText variant="label">
                  {resolveLocalizedValue(language, entry.question)}
                </AppText>
                <AppText variant="bodySmall">
                  {resolveLocalizedValue(language, entry.answer)}
                </AppText>
              </View>
            ))
          )}
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{copy.channelsTitle}</AppText>
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <AppText variant="bodySmall">{copy.channelsBody}</AppText>
          <SecondaryButton
            label={language === "ar" ? "افتح هيا" : "Open Heia"}
            onPress={() => router.push(appRoutes.heia)}
            tone="coral"
          />
          <SecondaryButton
            label={language === "ar" ? "الإشعارات" : "Notifications"}
            onPress={() => router.push(appRoutes.notifications)}
            tone="primary"
          />
          <SecondaryButton
            label={language === "ar" ? "الإعدادات" : "Settings"}
            onPress={() => router.push(appRoutes.settings)}
            tone="navy"
          />
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{copy.previewTitle}</AppText>
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <AppText variant="bodySmall">{copy.previewBody}</AppText>
          <SecondaryButton
            label={language === "ar" ? "حالات الفراغ" : "Empty states"}
            onPress={() => router.push(appRoutes.emptyStates)}
            tone="primary"
          />
          <SecondaryButton
            label={language === "ar" ? "حالات الخطأ" : "Error states"}
            onPress={() => router.push(appRoutes.errorStates)}
            tone="coral"
          />
          <SecondaryButton
            label={language === "ar" ? "الوضع دون اتصال" : "Offline state"}
            onPress={() => router.push(appRoutes.offlineState)}
            tone="navy"
          />
        </View>
      </AppCard>
    </ScreenContainer>
  );
};
