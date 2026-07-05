import { router, useLocalSearchParams } from "expo-router";

import { EmptyState } from "../../../components/ui/empty-state";
import { HeaderIconButton } from "../../../components/ui/header-icon-button";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { useLocalization } from "../../../hooks/use-localization";
import { navigateBackOr } from "../../../navigation/go-back";
import { appRoutes } from "../../../navigation/routes";
import { getPackageCategoryById } from "../data/package-categories";
import { PackageDiscoveryExperience } from "./package-discovery-experience";

export const PackageCategoryScreen = () => {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const { t } = useLocalization();
  const category = categoryId ? getPackageCategoryById(categoryId) : undefined;

  if (!category) {
    return (
      <ScreenContainer
        leading={
          <HeaderIconButton
            accessibilityLabel={t("common.back")}
            icon="arrow-back"
            mirrorInRTL
            onPress={() => navigateBackOr(appRoutes.packages)}
          />
        }
        title={t("packagesDiscovery.title")}
        withBottomTabSpacing={false}
      >
        <EmptyState
          actionLabel={t("packagesDiscovery.title")}
          description={t("packagesDiscovery.emptyBody")}
          onPress={() => router.replace(appRoutes.packages)}
          title={t("packagesDiscovery.emptyTitle")}
          tone="premium"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      contentStyle={{ flex: 1, paddingBottom: 0 }}
      leading={
        <HeaderIconButton
          accessibilityLabel={t("common.back")}
          icon="arrow-back"
          mirrorInRTL
          onPress={() => navigateBackOr(appRoutes.packages)}
        />
      }
      scrollable={false}
      subtitle={t("packageCategories.subtitle")}
      title={t(category.titleKey)}
      withBottomTabSpacing={false}
    >
      <PackageDiscoveryExperience initialFilters={category.filters} />
    </ScreenContainer>
  );
};
