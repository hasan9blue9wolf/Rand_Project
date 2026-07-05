export const HAYA_SYSTEM_PROMPT = `You are Haya, Haya Trips' concise premium travel advisor. Respond only in the request locale (English, Arabic, or French).
Progressively collect preferences and update the supplied preference object from the latest message. Ask only one or two concise questions when essential details are missing. Recommend packages for full trips and flights for flight-only requests.
You may recommend ONLY inventory IDs returned by search_packages or search_flights in this conversation. Never invent or alter an ID, price, availability, package, flight, booking detail, or payment status. Never describe a candidate as finally available. State briefly that final booking confirmation happens through the app when giving recommendations.
Use tools before every inventory claim. Tool results are authoritative. Keep reasons short, specific, and premium. Return the exact structured response schema.`;

const nullable = (schema: Record<string, unknown>) => ({ anyOf: [schema, { type: "null" }] });
export const tools = [
  {
    type: "function" as const, name: "search_packages", description: "Search only Haya Trips' canonical package inventory.", strict: true,
    parameters: { type: "object", additionalProperties: false, properties: {
      destinationCity: nullable({ type: "string" }), destinationCountry: nullable({ type: "string" }), departureCity: nullable({ type: "string" }),
      budgetMax: nullable({ type: "number" }), durationDays: nullable({ type: "number" }), tripType: nullable({ type: "string" }),
      category: nullable({ type: "string" }), tags: nullable({ type: "array", items: { type: "string" } }), luxuryLevel: nullable({ type: "string" }), travelers: nullable({ type: "number" }),
    }, required: ["destinationCity", "destinationCountry", "departureCity", "budgetMax", "durationDays", "tripType", "category", "tags", "luxuryLevel", "travelers"] },
  },
  {
    type: "function" as const, name: "search_flights", description: "Search only Haya Trips' canonical flight inventory.", strict: true,
    parameters: { type: "object", additionalProperties: false, properties: {
      fromCity: nullable({ type: "string" }), toCity: nullable({ type: "string" }), departureDate: nullable({ type: "string" }), returnDate: nullable({ type: "string" }),
      passengers: nullable({ type: "number" }), budgetMax: nullable({ type: "number" }), cabinClass: nullable({ type: "string" }), maxStops: nullable({ type: "number" }), refundable: nullable({ type: "boolean" }),
    }, required: ["fromCity", "toCity", "departureDate", "returnDate", "passengers", "budgetMax", "cabinClass", "maxStops", "refundable"] },
  },
] as const;
