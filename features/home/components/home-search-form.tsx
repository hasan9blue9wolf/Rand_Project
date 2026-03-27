import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { z } from "zod";

import { AppCard } from "../../../components/ui/app-card";
import { AppText } from "../../../components/ui/app-text";
import { PrimaryButton } from "../../../components/ui/primary-button";
import { SearchField } from "../../../components/ui/search-field";
import { SegmentedControl } from "../../../components/ui/segmented-control";
import { useTravelStore } from "../../../store/travel-store";
import { colors, spacing } from "../../../theme";

const schema = z.object({
  destination: z.string().trim().min(2),
  travelMonth: z.string().trim().min(3),
  travelers: z.string().trim().min(1),
});

type HomeSearchFormProps = {
  onSubmitSuccess: () => void;
};

type FormValues = z.infer<typeof schema>;

export const HomeSearchForm = ({ onSubmitSuccess }: HomeSearchFormProps) => {
  const { t } = useTranslation();
  const search = useTravelStore();
  const [mode, setMode] = useState<"flights" | "packages">("flights");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      destination: search.destination,
      travelMonth: search.travelMonth,
      travelers: search.travelers,
    },
    resolver: zodResolver(schema),
  });

  const submit = handleSubmit((values) => {
    search.updateSearch(values);
    onSubmitSuccess();
  });

  return (
    <AppCard elevated>
      <View style={{ gap: spacing.md }}>
        <SegmentedControl
          onChange={setMode}
          options={[
            { label: t("home.bookFlights"), value: "flights" },
            { label: t("home.travelPackages"), value: "packages" },
          ]}
          value={mode}
        />
      </View>
      <View style={{ gap: spacing.xs, marginTop: spacing.md }}>
        <AppText variant="title">{t("home.formTitle")}</AppText>
        <AppText>{t("home.subheading")}</AppText>
      </View>
      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        <Controller
          control={control}
          name="destination"
          render={({ field: { onBlur, onChange, value } }) => (
            <SearchField
              autoCapitalize="words"
              error={errors.destination?.message}
              icon="location-outline"
              label={t("home.destination")}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t("home.destinationPlaceholder")}
              returnKeyType="next"
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="travelMonth"
          render={({ field: { onBlur, onChange, value } }) => (
            <SearchField
              error={errors.travelMonth?.message}
              icon="calendar-outline"
              label={t("home.month")}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t("home.monthPlaceholder")}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="travelers"
          render={({ field: { onBlur, onChange, value } }) => (
            <SearchField
              error={errors.travelers?.message}
              icon="people-outline"
              label={t("home.travelers")}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t("home.travelersPlaceholder")}
              rightAdornment={
                <Ionicons color={colors.text.muted} name="chevron-down" size={18} />
              }
              value={value}
            />
          )}
        />
      </View>
      <View style={{ marginTop: spacing.lg }}>
        <PrimaryButton label={t("home.searchCta")} onPress={submit} />
      </View>
    </AppCard>
  );
};
