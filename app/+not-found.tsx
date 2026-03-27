import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { AppButton } from "../components/ui/app-button";
import { AppCard } from "../components/ui/app-card";
import { AppScreen } from "../components/ui/app-screen";
import { AppText } from "../components/ui/app-text";
import { appRoutes } from "../navigation/routes";

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <AppScreen scrollable={false}>
      <AppCard className="mt-16 gap-4">
        <AppText variant="headline">404</AppText>
        <AppText>{t("common.comingSoon")}</AppText>
        <AppButton label={t("tabs.home")} onPress={() => router.replace(appRoutes.home)} />
      </AppCard>
    </AppScreen>
  );
}
