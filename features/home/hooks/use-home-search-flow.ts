import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useLocalization } from "../../../hooks/use-localization";
import { triggerFeedback } from "../../../services/feedback";
import { useTravelDiscoveryStore } from "../../../store/travel-discovery-store";
import {
  travelDateOptions,
  travelDepartureOptions,
  travelDestinationOptions,
  travelPassengerOptions,
  travelPassengerOptionsById,
} from "../../catalog/data/catalog.mock";
import type {
  TravelDateOption,
  TravelDiscoverySearchRequest,
  TravelSearchFieldId,
} from "../../catalog/types";

const getNextOption = <Option>(
  options: readonly Option[],
  currentIndex: number,
): Option => {
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  return options[(safeIndex + 1) % options.length] ?? options[0]!;
};

const getDatesBySearch = (
  search: TravelDiscoverySearchRequest,
): TravelDateOption => ({
  endDate: search.endDate,
  id:
    travelDateOptions.find(
      (option) =>
        option.startDate === search.startDate &&
        option.endDate === search.endDate,
    )?.id ?? "tropicalOctober",
  startDate: search.startDate,
});

export const useHomeSearchFlow = () => {
  const { formatDateRange, t } = useLocalization();
  const { draftSearch, setDraftSearch, setSubmittedSearch } =
    useTravelDiscoveryStore(
      useShallow((state) => ({
        draftSearch: state.draftSearch,
        setDraftSearch: state.setDraftSearch,
        setSubmittedSearch: state.setSubmittedSearch,
      })),
    );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  const cycleField = useCallback(
    (fieldId: TravelSearchFieldId) => {
      if (fieldId === "from") {
        const currentIndex = travelDepartureOptions.findIndex(
          (option) => option.cityId === draftSearch.fromId,
        );
        const nextOption = getNextOption(travelDepartureOptions, currentIndex);

        setDraftSearch({ fromId: nextOption.cityId });
        return;
      }

      if (fieldId === "to") {
        const currentIndex = travelDestinationOptions.findIndex(
          (option) => option.id === draftSearch.toId,
        );
        const nextOption = getNextOption(travelDestinationOptions, currentIndex);

        setDraftSearch({ toId: nextOption.id });
        return;
      }

      if (fieldId === "dates") {
        const currentIndex = travelDateOptions.findIndex(
          (option) =>
            option.startDate === draftSearch.startDate &&
            option.endDate === draftSearch.endDate,
        );
        const nextOption = getNextOption(travelDateOptions, currentIndex);

        setDraftSearch({
          endDate: nextOption.endDate,
          startDate: nextOption.startDate,
        });
        return;
      }

      const currentIndex = travelPassengerOptions.findIndex(
        (option) => option.id === draftSearch.passengerOptionId,
      );
      const nextOption = getNextOption(travelPassengerOptions, currentIndex);

      setDraftSearch({ passengerOptionId: nextOption.id });
    },
    [draftSearch, setDraftSearch],
  );

  const submitSearch = useCallback(async () => {
    if (isSubmitting) {
      return false;
    }

    setIsSubmitting(true);
    setSubmittedSearch({
      source: "home",
    });

    await triggerFeedback("success");
    await new Promise((resolve) => {
      setTimeout(resolve, 220);
    });

    if (isMountedRef.current) {
      setIsSubmitting(false);
    }

    return true;
  }, [isSubmitting, setSubmittedSearch]);

  const passengerOption =
    travelPassengerOptionsById[draftSearch.passengerOptionId];
  const currentDates = getDatesBySearch(draftSearch);
  const fieldValues = useMemo(
    () => ({
      dates: formatDateRange(currentDates.startDate, currentDates.endDate),
      from: t(`searchDiscovery.locations.${draftSearch.fromId}`),
      passengers: t(`searchDiscovery.passengers.${passengerOption.id}`),
      to: t(`searchDiscovery.locations.${draftSearch.toId}`),
    }),
    [currentDates.endDate, currentDates.startDate, draftSearch.fromId, draftSearch.toId, formatDateRange, passengerOption.id, t],
  );
  const setMode = useCallback(
    (mode: TravelDiscoverySearchRequest["mode"]) =>
      setDraftSearch({ mode }),
    [setDraftSearch],
  );

  return {
    cycleField,
    draftSearch,
    fieldValues,
    isSubmitting,
    setMode,
    submitSearch,
  };
};
