import { router } from "expo-router";
import { View } from "react-native";

import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { PremiumHeroCard } from "../../../components/ui/premium-hero-card";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { colors, spacing } from "../../../theme";

export const EmptyStatesScreen = () => {
  const { language, t } = useLocalization();
  const copy =
    language === "ar"
      ? {
          heroBadge: "أسطح فارغة جاهزة للإطلاق",
          heroBody: "نماذج بصرية لحالات عدم وجود بيانات، من دون كسر الإحساس الراقي للتطبيق.",
          heroTitle: "حالات الفراغ",
          subtitle: "معاينات جاهزة لحالات عدم وجود إشعارات أو رحلات أو عناصر محفوظة.",
          title: "حالات الفراغ",
        }
      : {
          heroBadge: "Launch-ready empty surfaces",
          heroBody: "Visual patterns for moments when data is absent without breaking the premium feel of the app.",
          heroTitle: "Empty states",
          subtitle: "Ready previews for moments with no notifications, trips, or saved items.",
          title: "Empty states",
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
        accent={colors.gradients.primary}
        badge={copy.heroBadge}
        description={copy.heroBody}
        icon="layers-outline"
        metrics={[
          {
            icon: "bookmark-outline",
            label:
              language === "ar" ? "محفوظات فارغة" : "Saved items empty",
          },
          {
            icon: "briefcase-outline",
            label: language === "ar" ? "رحلات فارغة" : "Trips empty",
          },
          {
            icon: "notifications-outline",
            label:
              language === "ar" ? "إشعارات فارغة" : "Notifications empty",
          },
        ]}
        title={copy.heroTitle}
      />

      <View style={{ gap: spacing.lg }}>
        <EmptyState
          actionLabel={language === "ar" ? "استكشف العروض" : "Explore offers"}
          description={
            language === "ar"
              ? "عندما لا يملك المسافر عناصر محفوظة بعد، يبقى الاتجاه القادم واضحاً وراقياً."
              : "When a traveler has not saved anything yet, the next action should still feel clear and elevated."
          }
          icon="bookmark-outline"
          onPress={() => router.push(appRoutes.offers)}
          title={
            language === "ar"
              ? "لا توجد عناصر محفوظة بعد"
              : "No saved items yet"
          }
          tone="premium"
        />

        <EmptyState
          actionLabel={language === "ar" ? "ابدأ التخطيط" : "Start planning"}
          description={
            language === "ar"
              ? "إذا لم تُنشأ رحلات بعد، يمكن إعادة المسافر مباشرة إلى مساحة الاكتشاف."
              : "If no trips exist yet, the user can be guided directly back into discovery."
          }
          icon="briefcase-outline"
          onPress={() => router.push(appRoutes.home)}
          title={language === "ar" ? "لا توجد رحلات بعد" : "No trips yet"}
          tone="default"
        />

        <EmptyState
          actionLabel={language === "ar" ? "العودة للرئيسية" : "Back home"}
          description={
            language === "ar"
              ? "حتى عندما تكون قائمة الإشعارات فارغة، يبقى السطح مشحوناً بهدوء وثقة."
              : "Even when the inbox is quiet, the surface should still feel calm and composed."
          }
          icon="notifications-outline"
          onPress={() => router.push(appRoutes.home)}
          title={
            language === "ar"
              ? "لا توجد إشعارات جديدة"
              : "No new notifications"
          }
          tone="premium"
        />
      </View>
    </ScreenContainer>
  );
};
