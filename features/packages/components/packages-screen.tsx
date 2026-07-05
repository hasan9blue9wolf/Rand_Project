import { ScreenContainer } from "../../../components/ui/screen-container";
import { useLocalization } from "../../../hooks/use-localization";
import { packageCategories } from "../data/package-categories";
import { PackageCategoriesRail } from "./package-categories-rail";
import { PackageDiscoveryExperience } from "./package-discovery-experience";

export const PackagesScreen = () => {
  const { t } = useLocalization();

  return (
    <ScreenContainer
      contentStyle={{ flex: 1, paddingBottom: 0 }}
      scrollable={false}
      subtitle={t("packagesDiscovery.subtitle")}
      title={t("packagesDiscovery.title")}
    >
      <PackageDiscoveryExperience
        headerAddon={<PackageCategoriesRail categories={packageCategories} />}
      />
    </ScreenContainer>
  );
};
