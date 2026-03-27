import { isDemoModeEnabled } from "../../../services/runtime/app-mode";
import { requireSupabaseUser } from "../../../services/supabase/auth";
import { supabase } from "../../../services/supabase/client";
import { isSupabaseConfigured } from "../../../services/supabase/config";
import type { TableRow } from "../../../services/supabase/database.types";
import { offersScreenMock } from "../data/offers.mock";
import type { OfferBookmark } from "../types";

const mapOfferBookmarkRow = (row: TableRow<"offer_bookmarks">): OfferBookmark => ({
  createdAt: row.created_at,
  id: row.id,
  ...(row.note ? { note: row.note } : {}),
  offerId: row.offer_id,
});

export const getOffers = async () => offersScreenMock.offers;

export const getOffersScreenData = async () => offersScreenMock;

export const getOfferBookmarks = async () => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return [] as OfferBookmark[];
  }

  const user = await requireSupabaseUser().catch(() => null);

  if (!user) {
    return [] as OfferBookmark[];
  }

  const { data, error } = await supabase
    .from("offer_bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapOfferBookmarkRow);
};

export const toggleOfferBookmark = async ({
  note,
  offerId,
}: {
  note?: string;
  offerId: string;
}) => {
  const user = await requireSupabaseUser();
  const { data, error } = await supabase
    .from("offer_bookmarks")
    .select("*")
    .eq("offer_id", offerId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data?.id) {
    const { error: deleteError } = await supabase
      .from("offer_bookmarks")
      .delete()
      .eq("id", data.id)
      .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    return null;
  }

  const { data: insertData, error: insertError } = await supabase
    .from("offer_bookmarks")
    .insert({
      ...(note ? { note } : {}),
      offer_id: offerId,
      user_id: user.id,
    })
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  return mapOfferBookmarkRow(insertData);
};
