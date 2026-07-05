import { emptyHayaPreferences, mergeHayaPreferences, migrateHayaConversationState } from "../haya-conversation-store";

describe("Haya conversation preferences", () => {
  it("preserves known values when an update is null", () => {
    const current = { ...emptyHayaPreferences(), departureCity: "Baghdad", budgetMax: 2000 };
    const updated = { ...emptyHayaPreferences(), destinationInterests: ["Bali"] };
    expect(mergeHayaPreferences(current, updated)).toMatchObject({ departureCity: "Baghdad", budgetMax: 2000, destinationInterests: ["Bali"] });
  });
  it("migrates incomplete older state safely", () => {
    const migrated = migrateHayaConversationState({ preferences: { departureCity: "Paris" } });
    expect(migrated.preferences).toMatchObject({ departureCity: "Paris", destinationInterests: [], specialPreferences: [] });
    expect(migrated.conversationId).toMatch(/^haya-/);
    expect(migrated.messages).toEqual([]);
  });
  it("preserves structured recommendation cards during migration", () => {
    const message = { id: "card", kind: "assistant_response", role: "assistant", response: { id: "p", type: "flight_recommendation", flightId: "flight-bgw-dxb-economy", reason: "Fit" } };
    expect(migrateHayaConversationState({ messages: [message] }).messages).toEqual([message]);
  });
});
