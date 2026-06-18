import { router } from "expo-router";
import { View } from "react-native";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { PremiumHeroCard } from "../../../components/ui/premium-hero-card";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { colors, spacing } from "../../../theme";

export const ErrorStatesScreen = () => {
  const { language, t } = useLocalization();
  const copy =
    language === "ar"
      ? {
          guidance:
            "حالات الخطأ هنا مصممة لتبقى مهدئة وواضحة: تخبر المستخدم بما حدث، وما يمكنه فعله الآن، وتعيده إلى مسار موثوق.",
          guidanceTitle: "مبدأ المعالجة",
          heroBadge: "أخطاء لا تكسر الثقة",
          heroBody: "أنماط مرئية لحالات الفشل المؤقت في البحث أو الدفع أو خدمات المساعدة.",
          heroTitle: "حالات الخطأ",
          subtitle: "معاينات لأسطح الخطأ عندما يتعطل بحث، أو يتأخر دفع، أو تحتاج الخدمة إلى محاولة أخرى.",
          title: "حالات الخطأ",
        }
      : {
          guidance:
            "These error surfaces are designed to stay calm and direct: explain what happened, tell the user what to do next, and return them to a trusted path.",
          guidanceTitle: "Recovery principle",
          heroBadge: "Errors without trust loss",
          heroBody: "Visual patterns for temporary failures in search, payment, or support services.",
          heroTitle: "Error states",
          subtitle: "Preview surfaces for moments when search fails, checkout stalls, or a service needs another pass.",
          title: "Error states",
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
        accent={colors.gradients.coral}
        badge={copy.heroBadge}
        description={copy.heroBody}
        icon="alert-circle-outline"
        metrics={[
          {
            icon: "search-outline",
            label: language === "ar" ? "تعطل البحث" : "Search interruption",
          },
          {
            icon: "card-outline",
            label: language === "ar" ? "تعطل الدفع" : "Checkout interruption",
          },
          {
            icon: "help-buoy-outline",
            label: language === "ar" ? "خدمة تحتاج إعادة" : "Support retry needed",
          },
        ]}
        title={copy.heroTitle}
      />

      <View style={{ gap: spacing.lg }}>
        <EmptyState
          actionLabel={language === "ar" ? "إعادة البحث" : "Retry search"}
          description={
            language === "ar"
              ? "انقطع بناء النتائج مؤقتاً. أعد المحاولة وسنعيد ترتيب الباقات المقترحة."
              : "Discovery was interrupted for a moment. Retry and we will rebuild the package shortlist."
          }
          icon="search-outline"
          onPress={() => router.push(appRoutes.searchResults())}
          title={language === "ar" ? "البحث يحتاج محاولة أخرى" : "Search needs another pass"}
          tone="error"
        />

        <EmptyState
          actionLabel={language === "ar" ? "العودة للدفع" : "Return to checkout"}
          description={
            language === "ar"
              ? "حصل تأخير مؤقت أثناء تأكيد الطلب. لم يتم خصم أي مبلغ إضافي."
              : "There was a temporary delay while confirming the order. No extra charge was taken."
          }
          icon="card-outline"
          onPress={() => router.push(appRoutes.trips)}
          title={language === "ar" ? "تأكيد الدفع تأخر" : "Checkout confirmation delayed"}
          tone="error"
        />

        <EmptyState
          actionLabel={language === "ar" ? "افتح هيا" : "Open Haya"}
          description={
            language === "ar"
              ? "إذا احتاجت خدمة المساعدة لمحاولة أخرى، يبقى الانتقال إلى هيا مساراً سريعاً وواثقاً."
              : "If the support service needs another pass, opening Haya still gives users a fast and trustworthy path."
          }
          icon="chatbubble-ellipses-outline"
          onPress={() => router.push(appRoutes.heia)}
          title={
            language === "ar"
              ? "الخدمة تحتاج إعادة توجيه"
              : "Support needs another try"
          }
          tone="error"
        />
      </View>

      <AppCard>
        <AppText variant="title">{copy.guidanceTitle}</AppText>
        <View style={{ marginTop: spacing.md }}>
          <AppText variant="bodySmall">{copy.guidance}</AppText>
        </View>
      </AppCard>
    </ScreenContainer>
  );
};
