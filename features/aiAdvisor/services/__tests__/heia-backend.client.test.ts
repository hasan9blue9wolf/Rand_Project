import flightCatalog from "../../../../shared/catalog/flights.json";
import packageCatalog from "../../../../shared/catalog/packages.json";
import { mapHayaResponseToChatResponses } from "../heia-backend.client";

const preferences = {
  departureCity: null, destinationInterests: [], budgetMin: null, budgetMax: null, currency: null, durationDays: null,
  departureDate: null, returnDate: null, dateFlexibility: null, travelers: null, adults: null, children: null,
  tripType: null, luxuryLevel: null, cabinClass: null, directFlightPreferred: null, visaPreference: null, specialPreferences: [],
};
const baseResponse = { assistantMessage: "Curated choices", locale: "en" as const, intent: "recommend_packages", updatedPreferences: preferences, needsMoreInformation: false, followUpQuestions: [], requestId: "test" };

describe("Haya recommendation lookup", () => {
  it("maps exact existing package and flight IDs", () => {
    const responses = mapHayaResponseToChatResponses({ ...baseResponse, recommendations: [
      { type: "package", id: packageCatalog[0]!.id, reason: "Package fit", matchScore: 90 },
      { type: "flight", id: flightCatalog[0]!.id, reason: "Flight fit", matchScore: 88 },
    ] });
    expect(responses).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "package_recommendation", packageId: packageCatalog[0]!.id }),
      expect.objectContaining({ type: "flight_recommendation", flightId: flightCatalog[0]!.id }),
    ]));
  });
  it("ignores invalid recommendation IDs", () => {
    const responses = mapHayaResponseToChatResponses({ ...baseResponse, recommendations: [{ type: "package", id: "invalid", reason: "No", matchScore: 50 }] });
    expect(responses.some((item) => item.type === "package_recommendation" || item.type === "flight_recommendation")).toBe(false);
  });
  it.each(["en", "ar", "fr"] as const)("preserves %s response locale", (locale) => {
    const responses = mapHayaResponseToChatResponses({ ...baseResponse, locale, recommendations: [] });
    expect(responses[0]).toMatchObject({ type: "plain_text_guidance", text: "Curated choices" });
  });
});
