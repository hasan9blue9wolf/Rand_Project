import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../constants/query-keys";
import { selectActiveUserId, useAuthStore } from "../../../store/auth-store";
import { offersScreenMock } from "../data/offers.mock";
import { getOfferBookmarks, getOffers } from "../services/offers.service";

export const useOffersScreen = () => {
  const userId = useAuthStore(selectActiveUserId);
  const offersQuery = useQuery({
    placeholderData: offersScreenMock.offers,
    queryKey: queryKeys.offers,
    queryFn: getOffers,
  });
  const bookmarksQuery = useQuery({
    queryKey: queryKeys.offerBookmarks(userId),
    queryFn: getOfferBookmarks,
  });
  const offers = offersQuery.data ?? offersScreenMock.offers;
  const bookmarkedOfferIds = (bookmarksQuery.data ?? []).map(
    (bookmark) => bookmark.offerId,
  );

  return {
    bookmarkedOfferIds,
    hasOffers: offers.length > 0,
    offers,
    bookmarksQuery,
    offersQuery,
  };
};
