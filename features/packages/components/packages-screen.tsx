import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { LoadingState } from "../../../components/ui/loading-state";
import { PackageCard } from "../../../components/ui/package-card";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { usePackagesScreen } from "../hooks/use-packages-screen";

export const PackagesScreen = () => {
  const { packagesQuery, screenData } = usePackagesScreen();

  return (
    <ScreenContainer subtitle={screenData.subtitle} title={screenData.title}>
      {packagesQuery.isLoading ? (
        <LoadingState label={screenData.title} />
      ) : null}

      <AppCard elevated>
        <AppText variant="title">{`Highlighted package: ${screenData.highlightedPackageId}`}</AppText>
        <AppText>{`${screenData.items.length} premium package records ready for browsing.`}</AppText>
      </AppCard>

      {screenData.items.map((offer, index) => (
        <PackageCard enteringIndex={index} key={offer.id} offer={offer} />
      ))}
    </ScreenContainer>
  );
};
