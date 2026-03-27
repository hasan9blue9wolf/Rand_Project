import { isDemoModeEnabled } from "../../../services/runtime/app-mode";
import { requireSupabaseUser } from "../../../services/supabase/auth";
import { supabase } from "../../../services/supabase/client";
import { isSupabaseConfigured } from "../../../services/supabase/config";
import type { Json, TableRow } from "../../../services/supabase/database.types";
import { useAuthStore } from "../../../store/auth-store";
import type {
  AiAdvisorChatHistoryMessage,
  AiAdvisorChatHistoryThread,
  AiAdvisorChatMessage,
} from "../types";

const toJsonPayload = (message: AiAdvisorChatMessage) =>
  JSON.parse(JSON.stringify(message)) as Json;

const mapThreadRow = (
  row: TableRow<"ai_chat_threads">,
): AiAdvisorChatHistoryThread => ({
  createdAt: row.created_at,
  id: row.id,
  lastMessageAt: row.last_message_at,
  ...(row.last_message_preview
    ? { lastMessagePreview: row.last_message_preview }
    : {}),
  locale: row.locale,
  title: row.title,
  updatedAt: row.updated_at,
  userId: row.user_id,
});

const mapMessageRow = (
  row: TableRow<"ai_chat_messages">,
): AiAdvisorChatHistoryMessage => ({
  createdAt: row.created_at,
  id: row.id,
  messageKind: row.message_kind as AiAdvisorChatMessage["kind"],
  payload: row.message_payload as unknown as AiAdvisorChatMessage,
  role: row.role,
  threadId: row.thread_id,
  userId: row.user_id,
});

const getActiveDemoUserId = () =>
  useAuthStore.getState().demoSession?.userId ??
  useAuthStore.getState().user?.id ??
  "demo-user";

export const getAiChatThreads = async () => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return [] as AiAdvisorChatHistoryThread[];
  }

  const user = await requireSupabaseUser().catch(() => null);

  if (!user) {
    return [] as AiAdvisorChatHistoryThread[];
  }

  const { data, error } = await supabase
    .from("ai_chat_threads")
    .select("*")
    .eq("user_id", user.id)
    .order("last_message_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapThreadRow);
};

export const getAiChatMessages = async (threadId: string) => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    return [] as AiAdvisorChatHistoryMessage[];
  }

  const user = await requireSupabaseUser();
  const { data, error } = await supabase
    .from("ai_chat_messages")
    .select("*")
    .eq("thread_id", threadId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data.map(mapMessageRow);
};

export const createAiChatThread = async ({
  locale,
  title,
}: {
  locale: "ar" | "en";
  title: string;
}) => {
  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    const now = new Date().toISOString();

    return {
      createdAt: now,
      id: `demo-thread-${Date.now()}`,
      lastMessageAt: now,
      locale,
      title,
      updatedAt: now,
      userId: getActiveDemoUserId(),
    } satisfies AiAdvisorChatHistoryThread;
  }

  const user = await requireSupabaseUser();
  const { data, error } = await supabase
    .from("ai_chat_threads")
    .insert({
      last_message_at: new Date().toISOString(),
      locale,
      title,
      user_id: user.id,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapThreadRow(data);
};

export const appendAiChatMessages = async ({
  messages,
  threadId,
}: {
  messages: AiAdvisorChatMessage[];
  threadId: string;
}) => {
  if (messages.length === 0) {
    return [] as AiAdvisorChatHistoryMessage[];
  }

  if (isDemoModeEnabled() || !isSupabaseConfigured()) {
    const now = new Date().toISOString();
    const userId = getActiveDemoUserId();

    return messages.map((message, index) => ({
      createdAt: now,
      id: `demo-message-${threadId}-${index}`,
      messageKind: message.kind,
      payload: message,
      role: message.role,
      threadId,
      userId,
    }));
  }

  const user = await requireSupabaseUser();
  const payload = messages.map((message) => ({
    message_kind: message.kind,
    message_payload: toJsonPayload(message),
    role: message.role,
    thread_id: threadId,
    user_id: user.id,
  }));
  const { data, error } = await supabase
    .from("ai_chat_messages")
    .insert(payload)
    .select("*");

  if (error) {
    throw error;
  }

  const lastMessage = messages[messages.length - 1];

  if (!lastMessage) {
    return data.map(mapMessageRow);
  }

  const lastMessagePreview = (() => {
    switch (lastMessage.kind) {
      case "assistant_text":
      case "user_text":
        return lastMessage.text;
      case "status":
        return lastMessage.description;
      case "assistant_response":
        return lastMessage.response.type;
      default:
        return "Heia conversation";
    }
  })();
  const { error: threadError } = await supabase
    .from("ai_chat_threads")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: lastMessagePreview.slice(0, 140),
    })
    .eq("id", threadId)
    .eq("user_id", user.id);

  if (threadError) {
    throw threadError;
  }

  return data.map(mapMessageRow);
};
