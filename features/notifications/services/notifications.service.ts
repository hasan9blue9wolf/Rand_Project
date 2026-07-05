import { isDemoModeEnabled } from "../../../services/runtime/app-mode";
import { requireSupabaseUser } from "../../../services/supabase/auth";
import { supabase } from "../../../services/supabase/client";
import { isSupabaseConfigured } from "../../../services/supabase/config";
import type { TableRow } from "../../../services/supabase/database.types";
import { useAuthStore } from "../../../store/auth-store";
import { notificationsScreenMock } from "../data/notifications.mock";
import type {
  NotificationMetadata,
  UpsertNotificationMetadataInput,
} from "../types";

const mapNotificationMetadataRow = (
  row: TableRow<"notification_metadata">,
): NotificationMetadata => ({
  category: row.category,
  channel: row.channel,
  createdAt: row.created_at,
  id: row.id,
  ...(row.last_opened_at ? { lastOpenedAt: row.last_opened_at } : {}),
  ...(row.last_received_at ? { lastReceivedAt: row.last_received_at } : {}),
  metadata: row.metadata,
  ...(row.muted_until ? { mutedUntil: row.muted_until } : {}),
  unreadCount: row.unread_count,
  updatedAt: row.updated_at,
  userId: row.user_id,
});

export const getNotificationsScreenData = async () => notificationsScreenMock;

export const getNotificationMetadata = async () => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return [] as NotificationMetadata[];
  }

  const user = await requireSupabaseUser().catch(() => null);

  if (!user) {
    return [] as NotificationMetadata[];
  }

  const { data, error } = await supabase
    .from("notification_metadata")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapNotificationMetadataRow);
};

export const upsertNotificationMetadata = async (
  input: UpsertNotificationMetadataInput,
) => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    const userId =
      useAuthStore.getState().user?.id ??
      useAuthStore.getState().demoSession?.userId ??
      "demo-user";
    const now = new Date().toISOString();

    return {
      category: input.category,
      channel: input.channel,
      createdAt: now,
      id: `demo-${input.channel}-${input.category}`,
      ...(input.lastOpenedAt ? { lastOpenedAt: input.lastOpenedAt } : {}),
      ...(input.lastReceivedAt ? { lastReceivedAt: input.lastReceivedAt } : {}),
      metadata: input.metadata ?? {},
      ...(input.mutedUntil ? { mutedUntil: input.mutedUntil } : {}),
      unreadCount: input.unreadCount ?? 0,
      updatedAt: now,
      userId,
    } satisfies NotificationMetadata;
  }

  const user = await requireSupabaseUser();
  const { data, error } = await supabase
    .from("notification_metadata")
    .upsert(
      {
        category: input.category,
        channel: input.channel,
        ...(input.lastOpenedAt ? { last_opened_at: input.lastOpenedAt } : {}),
        ...(input.lastReceivedAt
          ? { last_received_at: input.lastReceivedAt }
          : {}),
        ...(input.metadata ? { metadata: input.metadata } : {}),
        ...(input.mutedUntil ? { muted_until: input.mutedUntil } : {}),
        ...(typeof input.unreadCount === "number"
          ? { unread_count: input.unreadCount }
          : {}),
        user_id: user.id,
      },
      { onConflict: "user_id,channel,category" },
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapNotificationMetadataRow(data);
};
