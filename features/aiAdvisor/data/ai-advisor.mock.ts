import { featuredOffers } from "../../../constants/mock-data";
import type { PackageId } from "../../../navigation/routes";
import type { AppLocale } from "../../../types/i18n";
import { catalogPackagesById } from "../../catalog/data/catalog.mock";
import type {
  AiAdvisorCatalogDestination,
  AiAdvisorChatMessage,
  AiAdvisorPackageCatalogItem,
  AiAdvisorScreenData,
  AiAdvisorSuggestionId,
} from "../types";

export const heiaAssistantAvatarUri =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCjKUxfFvSMwLdZJi0pAFGiBGSQrqRD3EdThx7btlBjGbzTaIwFmQQ0lKGL35i3sGydA-OiUmonAjDfUH95LD_RrgRA2BLmF6lQ6lCzpWOYmgOIdqBt1tT1HPOaLg_vj0nCwdQeLx9NfBGALku9PtaySrMxPdYyVgczch_U10Q5flV2PfeYOWNjm7n-ubH10cgX4nymjQSbzlnkT26p8Nq00UzMGcpmsbo-C4irqqlXlW5dHvbabb2AThgn-WLl9p_v1NUF4k_8TjE";

export const aiAdvisorSuggestionIds: AiAdvisorSuggestionId[] = [
  "beach",
  "budget",
  "family",
  "surprise",
];

const suggestionPrompts = {
  ar: {
    beach: "أريد عطلة شاطئية دافئة بطابع راقٍ ومريح.",
    budget: "أريد رحلة أنيقة لكن ضمن ميزانية مدروسة.",
    family: "أخطط لرحلة عائلية مريحة وسهلة للأطفال.",
    surprise: "افاجئني بوجهة مميزة تناسب السفر الراقي.",
  },
  en: {
    beach: "I want a warm beach escape with a polished premium feel.",
    budget: "I want a stylish trip that still respects a smart budget.",
    family: "I am planning a family trip that feels smooth and child-friendly.",
    surprise: "Surprise me with a refined destination that still feels practical.",
  },
} as const;

export const getSuggestionPrompt = (
  suggestionId: AiAdvisorSuggestionId,
  locale: AppLocale,
) => suggestionPrompts[locale === "ar" ? "ar" : "en"][suggestionId];

export const createInitialAiAdvisorMessages = (
  locale: AppLocale,
): AiAdvisorChatMessage[] => [
  {
    id: `assistant-welcome-${locale}`,
    kind: "assistant_text",
    role: "assistant",
    showAvatar: true,
    suggestionIds: aiAdvisorSuggestionIds,
    text:
      locale === "ar"
        ? "أهلاً، أنا هيا. أخبرني عن الميزانية، عدد المسافرين، مدة الرحلة، الطابع الذي تريده، ومدينة المغادرة لأبني لك shortlist مدروساً."
        : "Hi, I'm Haya. Tell me your budget, traveler count, trip length, desired vibe, and departure city and I'll build you a polished shortlist.",
  },
];

export const aiAdvisorScreenMock: AiAdvisorScreenData = {
  assistantAvatarUri: heiaAssistantAvatarUri,
  subtitle: "Premium AI travel orchestration with prompt building, memory, structured responses, and provider abstraction.",
  title: "AI Advisor",
};

const packageCatalogEntries = featuredOffers.map((offer) => {
  const packageData = catalogPackagesById[offer.id as PackageId];

  if (!packageData) {
    throw new Error(`Missing catalog package data for ${offer.id}.`);
  }

  return [
    offer.id,
    {
      imageUri: packageData.heroImageUri,
      offer,
    },
  ] as const;
});

export const aiAdvisorPackageCatalog = Object.fromEntries(
  packageCatalogEntries,
) as Record<PackageId, AiAdvisorPackageCatalogItem>;

export const getAiAdvisorPackageCatalogItem = (
  packageId: PackageId,
): AiAdvisorPackageCatalogItem => {
  const packageCatalogItem = aiAdvisorPackageCatalog[packageId];

  if (!packageCatalogItem) {
    throw new Error(`Missing AI advisor package catalog item for ${packageId}.`);
  }

  return packageCatalogItem;
};

export const aiAdvisorDestinationCatalog: AiAdvisorCatalogDestination[] = [
  {
    bestFor: {
      ar: "راحة راقية مع شواطئ وسبا وتنقلات سهلة",
      en: "Relaxed premium beach time with wellness and easy transfers",
    },
    budgetRange: {
      max: 4200,
      min: 1800,
    },
    country: {
      ar: "إندونيسيا",
      en: "Indonesia",
    },
    departureBiases: ["baghdad", "dubai", "jfk", "new york", "london"],
    destination: {
      ar: "بالي",
      en: "Bali",
    },
    familyFriendly: true,
    highlightLabels: {
      ar: ["فلل هادئة", "سبا فاخر", "تنقلات خاصة"],
      en: ["Private villas", "Wellness rhythm", "Smooth transfers"],
    },
    iconImageUri: getAiAdvisorPackageCatalogItem("bali-signature").imageUri,
    id: "bali-signature",
    idealDurationDays: [5, 8],
    itineraryStops: [
      {
        summary: {
          ar: "وصول سلس مع وقت للاسترخاء وعشاء هادئ قرب الإقامة.",
          en: "Ease into the trip with a gentle arrival and a relaxed dinner close to the resort.",
        },
        title: {
          ar: "أوبود الهادئة",
          en: "Soft landing in Ubud",
        },
      },
      {
        summary: {
          ar: "جلسة سبا صباحية ثم جولة ثقافية وعشاء عند الغروب.",
          en: "Pair a spa morning with a cultural stop and a sunset dining plan.",
        },
        title: {
          ar: "يوم wellness وثقافة",
          en: "Wellness and culture day",
        },
      },
      {
        summary: {
          ar: "اختتم الرحلة بنشاط بحري أو يوم شاطئي راقٍ.",
          en: "Close with a polished beach day or a light water activity.",
        },
        title: {
          ar: "إيقاع ساحلي أنيق",
          en: "Refined coastal finish",
        },
      },
    ],
    luxuryLevels: ["premium", "luxury", "ultraLuxury"],
    packageId: "bali-signature",
    summary: {
      ar: "بالي مناسبة عندما تريد أجواء دافئة وراحة راقية ومزيجاً من الشاطئ والهدوء الثقافي.",
      en: "Bali works when you want warm weather, polished comfort, and a mix of beach time with a softer cultural rhythm.",
    },
    vibeTags: ["beach", "wellness", "romantic", "family"],
    visaOptions: ["easyVisa", "flexible"],
    weatherDescriptor: {
      ar: "دافئ واستوائي أغلب الموسم",
      en: "Warm and tropical through most of the year",
    },
    weatherOptions: ["warm", "mild"],
  },
  {
    bestFor: {
      ar: "مدينة متجددة بطابع عصري وثقافي مناسب للأزواج والعائلات الصغيرة",
      en: "A modern cultural city break with strong food, design, and family balance",
    },
    budgetRange: {
      max: 4600,
      min: 2100,
    },
    country: {
      ar: "اليابان",
      en: "Japan",
    },
    departureBiases: ["lax", "los angeles", "seattle", "baghdad", "dubai"],
    destination: {
      ar: "طوكيو",
      en: "Tokyo",
    },
    familyFriendly: true,
    highlightLabels: {
      ar: ["فنادق بوتيكية", "حيّات حيوية", "تجارب طعام مختارة"],
      en: ["Boutique stays", "Lively districts", "Curated dining"],
    },
    iconImageUri: getAiAdvisorPackageCatalogItem("tokyo-curated").imageUri,
    id: "tokyo-curated",
    idealDurationDays: [4, 7],
    itineraryStops: [
      {
        summary: {
          ar: "ابدأ بأحياء التصميم والمقاهي الهادئة لتدخل إيقاع المدينة بدون إرهاق.",
          en: "Start with calmer design districts and relaxed cafes to settle into the city cleanly.",
        },
        title: {
          ar: "يوم وصول مصمم بعناية",
          en: "Design-led arrival day",
        },
      },
      {
        summary: {
          ar: "وازن بين المتاحف والتسوق الذكي وتجربة طعام مميزة في المساء.",
          en: "Balance museums, smart shopping, and a standout dining reservation in the evening.",
        },
        title: {
          ar: "ثقافة وطعام",
          en: "Culture and culinary day",
        },
      },
      {
        summary: {
          ar: "اختر رحلة يومية خفيفة أو وقتاً أبطأ في أحياء المدينة الراقية.",
          en: "Finish with either a gentle day trip or a slower luxury neighborhood circuit.",
        },
        title: {
          ar: "وتيرة أهدأ في الختام",
          en: "Soft final day",
        },
      },
    ],
    luxuryLevels: ["comfort", "premium", "luxury"],
    packageId: "tokyo-curated",
    summary: {
      ar: "طوكيو تلمع عندما تريد رحلة مدينة راقية مع طعام ممتاز وثقافة قوية وتنظيم دقيق.",
      en: "Tokyo shines when you want a polished city trip with excellent dining, design energy, and efficient pacing.",
    },
    vibeTags: ["city", "culture", "family"],
    visaOptions: ["easyVisa", "flexible"],
    weatherDescriptor: {
      ar: "أفضلها أجواء معتدلة إلى باردة قليلاً حسب الموسم",
      en: "Best in mild to cool seasons with clear urban exploring weather",
    },
    weatherOptions: ["cool", "mild"],
  },
  {
    bestFor: {
      ar: "هدوء جبلي فاخر مع هواء بارد وخدمة عالية الخصوصية",
      en: "A high-touch alpine retreat with cooler weather and discreet luxury",
    },
    budgetRange: {
      max: 6200,
      min: 2600,
    },
    country: {
      ar: "سويسرا",
      en: "Switzerland",
    },
    departureBiases: ["jfk", "new york", "london", "paris", "baghdad"],
    destination: {
      ar: "زيرمات",
      en: "Zermatt",
    },
    familyFriendly: true,
    highlightLabels: {
      ar: ["أجنحة جبلية", "سبا هادئ", "إطلالات بانورامية"],
      en: ["Mountain suites", "Spa downtime", "Panoramic scenery"],
    },
    iconImageUri: getAiAdvisorPackageCatalogItem("alps-private").imageUri,
    id: "alps-private",
    idealDurationDays: [4, 6],
    itineraryStops: [
      {
        summary: {
          ar: "اجعل اليوم الأول خفيفاً مع تسجيل دخول مبكر وسبا وإطلالات جبلية.",
          en: "Keep the first day gentle with early check-in, spa time, and mountain views.",
        },
        title: {
          ar: "استقبال جبلي هادئ",
          en: "Calm alpine arrival",
        },
      },
      {
        summary: {
          ar: "ادمج القطار البانورامي أو نزهة سهلة مع غداء طويل فاخر.",
          en: "Blend a scenic rail or gentle walk with a long polished lunch.",
        },
        title: {
          ar: "مناظر وتجربة مريحة",
          en: "Scenic day with comfort",
        },
      },
      {
        summary: {
          ar: "اترك وقتاً كافياً للهدوء والسبا قبل العودة.",
          en: "Leave space for slower luxury before the return flight.",
        },
        title: {
          ar: "ختام بطيء وفاخر",
          en: "Slow luxury finish",
        },
      },
    ],
    luxuryLevels: ["premium", "luxury", "ultraLuxury"],
    packageId: "alps-private",
    summary: {
      ar: "الألب السويسرية خيار ممتاز إذا كنت تريد برودة أنيقة وخصوصية عالية وإيقاعاً هادئاً.",
      en: "The Swiss Alps are strongest when you want cooler weather, strong privacy, and a slower premium pace.",
    },
    vibeTags: ["nature", "romantic", "adventure", "wellness"],
    visaOptions: ["easyVisa", "flexible"],
    weatherDescriptor: {
      ar: "بارد إلى ثلجي حسب الوقت مع هواء نقي وإطلالات قوية",
      en: "Cool to snowy depending on timing, with crisp air and dramatic views",
    },
    weatherOptions: ["cool", "snow"],
  },
];
