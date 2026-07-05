import type { HomeScreenData } from "../types";

export const homeScreenMock: HomeScreenData = {
  bookingDateRange: {
    endDate: "2026-10-19",
    startDate: "2026-10-12",
  },
  bookingFields: [
    {
      icon: "location-outline",
      id: "from",
      state: "filled",
    },
    {
      icon: "location-outline",
      id: "to",
      state: "placeholder",
    },
    {
      icon: "calendar-outline",
      id: "dates",
      state: "filled",
    },
    {
      icon: "people-outline",
      id: "passengers",
      state: "filled",
    },
  ],
  defaultMode: "flights",
  header: {
    hasUnreadNotifications: true,
    profileAvatarUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCPI6QP4D5pb0YTCcCc8DLOsm5Xbm8vVA8odaS5XNz7J_uAK0GIhTYxFiEGIEzWbq0io1hMjnMm1LD4iJ_NfADeqr9f7nH_swAS_JEkfw0GWhGFJxlYPODqszt73LScQUdTMLvd1dPePPeW0sxdMo3m__uDINrOMweSen39zHQZ6fD6FG0aM2rUEVDjsQTWrV_d5r_lVkGsuNhxaj0CtajtxJ0RRBqGfk_OvM2UHpGpICatHefQ7--r3rCoV2Ql8X7LdW3jgpbhtcM",
  },
  trendingPackages: [
    {
      id: "baliTropical",
      imageUri:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAT233YHme06E_YiVqRnAR2bjPeJaQWbdECW81Op2JcFnlgFcaWdcsbyqdflhGrGJbILX_tBESbQCXTgSMk8XSc1CrIsxw95PFsmsUMZSx4VNc-6FxWighksBxADtTqQbi57a57d0wy_Jyt8wkl9Er_DINsNDCxGCHUEHvMq80bYeyP69VVpAquVL8-g5K9XU48FB8odPvpkNGUdhVfHNsMUls110B9gg527q63v4EewsFZ5fCllEEKfjtQwaYqhWTimuVO_jrQNQw",
      meta: [
        {
          icon: "time-outline",
          key: "duration",
        },
        {
          icon: "checkmark-done-outline",
          key: "bundle",
        },
      ],
      priceFrom: 1299,
      showBadge: true,
    },
    {
      id: "swissAlps",
      imageUri:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDs3YV4WbhnJ3SC2lehzvCXuchyDNBeV-sLWdReXrDvt9UURq4ZnoXKr1-A5oSzSd5788Xfi0-W6AZ8p2au6ZTLvLNAEg1ML4RckeBrUBqnbqhM0Xkwj-lD_tNxfdAvQXAb9IsGCs6dUFzWgeXQeB593Kco-KMZ5rMg-6Z6iN5p6tiA2UQNr0fz_uBsAlXMX3Q45nYldTGzjMUvZL_zndps6T6iKn5qXmpnA8KKjBS0aTUvwYWgvd81a5S8_CJwXm32TyYMhuUAXpk",
      meta: [
        {
          icon: "time-outline",
          key: "duration",
        },
        {
          icon: "checkmark-done-outline",
          key: "bundle",
        },
      ],
      priceFrom: 2450,
    },
    {
      id: "modernTokyo",
      imageUri:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB5YYZkCQh9sCjf1EalvTwST_-k7_eUzGNs5joktm7kU41A9MQqUnKPauOyonmmn3Y4qwpU0yUn813zuo9nn44w23Q-VwPTs14xkA7ZcV-6Dytq2DA1UBJm8Apa965NWnPQ9S4Lk333_gUPNd4CPiAXtLinFPIv4Tw-8rR68jldcJgoJdKBMMEZ4ZNT3aTEXD4vuRCb9YfirsvwWtkA0QDz41GxogHVbkyhwX4v1ShKiHkHPFQPhkandy4wN45dykvr788pKJ8cp4o",
      meta: [
        {
          icon: "time-outline",
          key: "duration",
        },
      ],
      priceFrom: 1890,
    },
  ],
};
