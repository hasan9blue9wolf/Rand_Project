import type { Ionicons } from "@expo/vector-icons";

export type BookingMode = "flights" | "packages";

export type HomeBookingFieldId = "from" | "to" | "dates" | "passengers";
export type HomePackageMetaKey = "duration" | "bundle";
export type HomeTrendingPackageId = "baliTropical" | "swissAlps" | "modernTokyo";

export type HomeBookingField = {
  icon: keyof typeof Ionicons.glyphMap;
  id: HomeBookingFieldId;
  state: "filled" | "placeholder";
};

export type HomePackageMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  key: HomePackageMetaKey;
};

export type HomeTrendingPackage = {
  id: HomeTrendingPackageId;
  imageUri: string;
  meta: HomePackageMeta[];
  priceFrom: number;
  showBadge?: boolean;
};

export type HomeScreenData = {
  bookingDateRange: {
    endDate: string;
    startDate: string;
  };
  bookingFields: HomeBookingField[];
  defaultMode: BookingMode;
  header: {
    hasUnreadNotifications: boolean;
    profileAvatarUri: string;
  };
  trendingPackages: HomeTrendingPackage[];
};
