import { router } from "expo-router";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { Chip } from "../../../components/ui/chip";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { PremiumHeroCard } from "../../../components/ui/premium-hero-card";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { SecondaryButton } from "../../../components/ui/secondary-button";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { colors, spacing } from "../../../theme";

export const OfflineStateScreen = () => {
  const { language, t } = useLocalization();
  const copy =
    language === "ar"
      ? {
          availableBody: "حتى دون اتصال، تبقى بعض المساحات قابلة للوصول بفضل البيانات المؤقتة والسلوك الآمن أثناء ضعف الشبكة.",
          availableTitle: "ما الذي يبقى متاحاً",
          heroBadge: "جاهز للشبكة الضعيفة",
          heroBody: "الوضع دون اتصال يجب أن يشعر بالهدوء والثقة، لا بالانقطاع الكامل. هذه الشاشة تشرح ما يبقى متاحاً وكيف تعود المزامنة.",
          heroTitle: "الوضع دون اتصال",
          syncBody: "بمجرد عودة الاتصال، تُستأنف المزامنة وإعادة المحاولة والتحديثات في الخلفية بطريقة آمنة.",
          syncTitle: "عند عودة الاتصال",
          subtitle: "واجهة راقية ومطمئنة عندما ينخفض الاتصال أو يختفي مؤقتاً.",
          title: "الوضع دون اتصال",
        }
      : {
          availableBody: "Even offline, several surfaces stay reachable thanks to cached data and the app’s safe weak-network behavior.",
          availableTitle: "What remains available",
          heroBadge: "Built for weak networks",
          heroBody: "Offline mode should feel calm and trustworthy, not broken. This screen explains what remains available and how sync returns.",
          heroTitle: "Offline state",
          syncBody: "As soon as connectivity returns, sync, retries, and background refresh resume in a safe way.",
          syncTitle: "When connection returns",
          subtitle: "A calm premium surface for moments when connectivity drops or disappears temporarily.",
          title: "Offline state",
        };

  return (
    <ScreenContainer
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={() => navigateBackOr(appRoutes.helpSupport)}
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
        icon="cloud-offline-outline"
        metrics={[
          {
            icon: "refresh-outline",
            label:
              language === "ar" ? "إعادة المحاولة لاحقاً" : "Retry later",
          },
          {
            icon: "bookmark-outline",
            label:
              language === "ar" ? "الوصول للمحفوظات" : "Saved items still available",
          },
          {
            icon: "shield-outline",
            label:
              language === "ar" ? "فشل آمن" : "Fail-safe behavior",
          },
        ]}
        title={copy.heroTitle}
      />

      <EmptyState
        actionLabel={language === "ar" ? "العودة للرئيسية" : "Back home"}
        description={
          language === "ar"
            ? "تعذر إكمال هذا الطلب حالياً بسبب الشبكة. يمكنك متابعة العناصر المخزنة مؤقتاً أو المحفوظة لحين عودة الاتصال."
            : "This request cannot complete right now because the network is unavailable. You can still work from cached or saved surfaces until the connection returns."
        }
        icon="cloud-offline-outline"
        onPress={() => router.push(appRoutes.home)}
        title={language === "ar" ? "أنت تعمل دون اتصال" : "You’re working offline"}
        tone="premium"
      />

      <AppCard>
        <AppText variant="title">{copy.availableTitle}</AppText>
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <AppText variant="bodySmall">{copy.availableBody}</AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
            <Chip
              icon="briefcase-outline"
              label={language === "ar" ? "رحلاتك" : "My Trips"}
              tone="navy"
            />
            <Chip
              icon="bookmark-outline"
              label={language === "ar" ? "المحفوظات" : "Saved Items"}
              tone="primary"
            />
            <Chip
              icon="settings-outline"
              label={language === "ar" ? "الإعدادات" : "Settings"}
              tone="coral"
            />
          </View>
          <SecondaryButton
            label={language === "ar" ? "رحلاتي" : "Open My Trips"}
            onPress={() => router.push(appRoutes.trips)}
            tone="navy"
          />
          <SecondaryButton
            label={language === "ar" ? "العناصر المحفوظة" : "Open Saved Items"}
            onPress={() => router.push(appRoutes.savedDestinations)}
            tone="primary"
          />
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="title">{copy.syncTitle}</AppText>
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <AppText variant="bodySmall">{copy.syncBody}</AppText>
          <AppText color={colors.text.blue} variant="bodySmall">
            {language === "ar"
              ? "تم إعداد طبقة البيانات سابقاً بنمط offline-first، لذلك تبدو العودة للاتصال طبيعية وغير مفاجئة."
              : "The data layer was already prepared in offline-first mode, so reconnecting should feel natural rather than abrupt."}
          </AppText>
        </View>
      </AppCard>
    </ScreenContainer>
  );
};
