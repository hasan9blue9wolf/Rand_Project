import { router } from "expo-router";
import { FlatList, View } from "react-native";

import { SectionHeader } from "../../../components/ui/section-header";
import { useLocalization } from "../../../hooks/use-localization";
import { appRoutes } from "../../../navigation/routes";
import { spacing } from "../../../theme";
import type { PackageCategoryDefinition } from "../data/package-categories";
import { PackageCategoryCard } from "./package-category-card";

type PackageCategoriesRailProps = {
  categories: PackageCategoryDefinition[];
};

export const PackageCategoriesRail = ({
  categories,
}: PackageCategoriesRailProps) => {
  const { isRTL, t } = useLocalization();

  return (
    <View style={{ gap: spacing.md }}>
      <SectionHeader title={t("packageCategories.title")} />
      <FlatList
        data={categories}
        horizontal
        inverted={isRTL}
        ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PackageCategoryCard
            category={item}
            onPress={() => router.push(appRoutes.packageCategory(item.id))}
          />
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};
