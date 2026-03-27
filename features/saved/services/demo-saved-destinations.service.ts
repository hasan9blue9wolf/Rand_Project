import { useDemoModeStore } from "../../../store/demo-mode-store";
import {
  featuredOffersById,
  savedDestinationIds,
} from "../../catalog/data/catalog.mock";
import type { SavedDestination, SaveDestinationInput } from "../types";

const buildFallbackDestinations = (): SavedDestination[] =>
  savedDestinationIds.flatMap((packageId) => {
    const offer = featuredOffersById[packageId];

    if (!offer) {
      return [];
    }

    return [
      {
        destinationName: offer.destination,
        destinationSlug: offer.id,
        id: offer.id,
        packageId: offer.id,
        priceFrom: offer.priceFrom,
        savedAt: "2026-01-01T00:00:00.000Z",
        summary: offer.title,
      } satisfies SavedDestination,
    ];
  });

const createSavedDestination = (
  input: SaveDestinationInput,
): SavedDestination => ({
  ...(input.countryName ? { countryName: input.countryName } : {}),
  destinationName: input.destinationName,
  destinationSlug: input.destinationSlug,
  id: input.destinationSlug,
  ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
  ...(input.packageId ? { packageId: input.packageId } : {}),
  ...(typeof input.priceFrom === "number"
    ? { priceFrom: input.priceFrom }
    : {}),
  savedAt: new Date().toISOString(),
  ...(input.source ? { source: input.source } : {}),
  ...(input.summary ? { summary: input.summary } : {}),
});

const getEffectiveSavedDestinations = () => {
  const store = useDemoModeStore.getState();

  if (store.savedDestinations.length > 0) {
    return store.savedDestinations;
  }

  const seededDestinations = buildFallbackDestinations();

  store.setSavedDestinations(seededDestinations);
  return seededDestinations;
};

export const getDemoSavedDestinations = async () =>
  getEffectiveSavedDestinations();

export const saveDemoDestination = async (input: SaveDestinationInput) => {
  const store = useDemoModeStore.getState();
  const nextDestination = createSavedDestination(input);
  const savedDestinations = getEffectiveSavedDestinations().filter(
    (destination) =>
      destination.destinationSlug !== nextDestination.destinationSlug,
  );
  const nextSavedDestinations = [nextDestination, ...savedDestinations];

  store.setSavedDestinations(nextSavedDestinations);
  return nextDestination;
};

export const removeDemoSavedDestination = async (destinationSlug: string) => {
  const store = useDemoModeStore.getState();
  const savedDestinations = getEffectiveSavedDestinations();

  store.setSavedDestinations(
    savedDestinations.filter(
      (destination) => destination.destinationSlug !== destinationSlug,
    ),
  );
};

export const toggleDemoSavedDestination = async (
  input: SaveDestinationInput,
) => {
  const exists = getEffectiveSavedDestinations().some(
    (destination) => destination.destinationSlug === input.destinationSlug,
  );

  if (exists) {
    await removeDemoSavedDestination(input.destinationSlug);
    return null;
  }

  return saveDemoDestination(input);
};
