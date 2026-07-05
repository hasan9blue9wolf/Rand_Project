import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AiAdvisorChatMessage } from "../features/aiAdvisor/types";
import { appStorage } from "../services/storage";

export type HayaTravelPreferences = {
  departureCity: string | null; destinationInterests: string[]; budgetMin: number | null; budgetMax: number | null;
  currency: string | null; durationDays: number | null; departureDate: string | null; returnDate: string | null;
  dateFlexibility: string | null; travelers: number | null; adults: number | null; children: number | null;
  tripType: string | null; luxuryLevel: string | null; cabinClass: string | null; directFlightPreferred: boolean | null;
  visaPreference: string | null; specialPreferences: string[];
};
export const emptyHayaPreferences = (): HayaTravelPreferences => ({
  departureCity: null, destinationInterests: [], budgetMin: null, budgetMax: null, currency: null, durationDays: null,
  departureDate: null, returnDate: null, dateFlexibility: null, travelers: null, adults: null, children: null,
  tripType: null, luxuryLevel: null, cabinClass: null, directFlightPreferred: null, visaPreference: null, specialPreferences: [],
});
const conversationId = () => `haya-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
export const mergeHayaPreferences = (current: HayaTravelPreferences, updated: HayaTravelPreferences) =>
  Object.fromEntries(Object.keys(current).map((key) => {
    const typedKey = key as keyof HayaTravelPreferences;
    const value = updated[typedKey];
    return [key, value === null || (Array.isArray(value) && value.length === 0) ? current[typedKey] : value];
  })) as HayaTravelPreferences;

type HayaConversationState = {
  apiStatus: "demo" | "idle" | "loading" | "online" | "error"; clarificationCount: number; recommendationsShown: boolean;
  conversationId: string; latestRecommendationIds: string[]; messages: AiAdvisorChatMessage[]; preferences: HayaTravelPreferences;
  mergePreferences: (value: HayaTravelPreferences) => void; resetConversation: () => void;
  setApiStatus: (value: HayaConversationState["apiStatus"]) => void; setMessages: (value: AiAdvisorChatMessage[]) => void;
  setRecommendationIds: (value: string[]) => void;
};
export const migrateHayaConversationState = (persisted: unknown) => {
  const value = (persisted ?? {}) as Partial<HayaConversationState>;
  return { ...value, clarificationCount: typeof value.clarificationCount === "number" ? value.clarificationCount : 0, recommendationsShown: value.recommendationsShown === true, conversationId: typeof value.conversationId === "string" ? value.conversationId : conversationId(), latestRecommendationIds: Array.isArray(value.latestRecommendationIds) ? value.latestRecommendationIds : [], messages: Array.isArray(value.messages) ? value.messages : [], preferences: { ...emptyHayaPreferences(), ...(value.preferences ?? {}) } } as HayaConversationState;
};
export const useHayaConversationStore = create<HayaConversationState>()(persist((set) => ({
  apiStatus: "idle", clarificationCount: 0, recommendationsShown: false, conversationId: conversationId(), latestRecommendationIds: [], messages: [], preferences: emptyHayaPreferences(),
  mergePreferences: (value) => set((state) => ({ preferences: mergeHayaPreferences(state.preferences, value) })),
  resetConversation: () => set({ apiStatus: "idle", clarificationCount: 0, recommendationsShown: false, conversationId: conversationId(), latestRecommendationIds: [], messages: [], preferences: emptyHayaPreferences() }),
  setApiStatus: (apiStatus) => set({ apiStatus }), setMessages: (messages) => set({ messages }), setRecommendationIds: (latestRecommendationIds) => set({ latestRecommendationIds }),
}), {
  name: "hayatrips-haya-conversation", version: 2, storage: appStorage,
  partialize: (state) => ({ clarificationCount: state.clarificationCount, recommendationsShown: state.recommendationsShown, conversationId: state.conversationId, latestRecommendationIds: state.latestRecommendationIds, messages: state.messages, preferences: state.preferences }),
  migrate: migrateHayaConversationState,
}));
