export const queryKeys = {
  aiAdvisor: ["aiAdvisor", "screen"] as const,
  aiChatMessages: (threadId: string | null) =>
    ["aiAdvisor", "messages", threadId ?? "anonymous"] as const,
  aiChatThreads: (userId: string | null) =>
    ["aiAdvisor", "threads", userId ?? "anonymous"] as const,
  auth: ["auth", "screen"] as const,
  authSession: ["auth", "session"] as const,
  bookingSummary: (bookingId: string, searchKey: string) =>
    ["booking", "summary", bookingId, searchKey] as const,
  catalogPackageDetails: (packageId: string, searchKey: string) =>
    ["catalog", "package", packageId, searchKey] as const,
  catalogSearchResults: (searchKey: string, filtersKey: string, sort: string) =>
    ["catalog", "search", searchKey, filtersKey, sort] as const,
  flights: ["flights", "screen"] as const,
  homeScreen: ["home", "screen"] as const,
  homeOffers: ["home", "offers"] as const,
  localization: ["localization", "screen"] as const,
  notificationCapability: ["notifications", "capability"] as const,
  notificationMetadata: (userId: string | null) =>
    ["notifications", "metadata", userId ?? "anonymous"] as const,
  notificationsScheduled: ["notifications", "scheduled"] as const,
  offerBookmarks: (userId: string | null) =>
    ["offers", "bookmarks", userId ?? "anonymous"] as const,
  trips: ["trips"] as const,
  offers: ["offers"] as const,
  notifications: ["notifications", "screen"] as const,
  packages: ["packages", "screen"] as const,
  payments: ["payments", "screen"] as const,
  profile: ["profile", "screen"] as const,
  savedDestinations: (userId: string | null) =>
    ["saved-destinations", userId ?? "anonymous"] as const,
  settings: ["settings", "screen"] as const,
  travelPreferences: (userId: string | null) =>
    ["travel-preferences", userId ?? "anonymous"] as const,
};
