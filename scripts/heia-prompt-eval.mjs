import { spawn } from "node:child_process";

const port = Number(process.env.HEIA_EVAL_PORT ?? 18787);
const baseUrl = `http://127.0.0.1:${port}`;
const runCount = Number(process.env.HEIA_EVAL_RUNS ?? 1);

const cases = [
  {
    expectedFocus: "booking_process",
    expectedLocale: "ar",
    expectPackage: false,
    id: "ar_booking_process",
    latestUserMessage: "شلون اكدر اطلب",
    structuredContext: {
      budget: { currency: "USD" },
      destinationPreferences: [],
      language: "ar",
      partyComposition: {},
      salientFacts: [],
      travelDates: {},
      userIntentSummary: "المستخدم يسأل عن طريقة الحجز.",
    },
    templateId: "travel_tips",
  },
  {
    expectedFocus: "booking_process",
    expectedLocale: "ar",
    expectPackage: false,
    id: "ar_book_without_details",
    latestUserMessage: "اريد احجز بس شنو الخطوات؟",
    structuredContext: {
      budget: { currency: "USD" },
      destinationPreferences: [],
      language: "ar",
      partyComposition: {},
      salientFacts: [],
      travelDates: {},
      userIntentSummary: "المستخدم يريد معرفة خطوات الحجز.",
    },
    templateId: "travel_tips",
  },
  {
    expectedFocus: "trip_discovery",
    expectedLocale: "ar",
    expectPackage: false,
    id: "ar_greeting",
    latestUserMessage: "هلو، اريد اسافر بس ما اعرف وين",
    structuredContext: {
      budget: { currency: "USD" },
      destinationPreferences: [],
      language: "ar",
      partyComposition: {},
      salientFacts: [],
      travelDates: {},
      userIntentSummary: "المستخدم يريد يبدأ تخطيط رحلة.",
    },
    templateId: "destination_discovery",
  },
  {
    expectedFocus: "trip_discovery",
    expectedLocale: "ar",
    expectedTextIncludes: ["بحر", "مدينة", "جبال"],
    expectPackage: false,
    id: "ar_pure_greeting",
    latestUserMessage: "هلو",
    structuredContext: {
      budget: { currency: "USD" },
      destinationPreferences: [],
      language: "ar",
      partyComposition: {},
      salientFacts: [],
      travelDates: {},
      userIntentSummary: "المستخدم أرسل تحية فقط.",
    },
    templateId: "destination_discovery",
  },
  {
    expectedLocale: "ar",
    expectedPackageId: "bali-signature",
    expectPackage: true,
    id: "ar_family_beach_budget",
    latestUserMessage:
      "احنا عائلة من بغداد، نريد بحر وراحة 7 ليالي، الميزانية حوالي 3000 دولار",
    structuredContext: {
      budget: { currency: "USD", max: 3000 },
      departureCity: "Baghdad",
      destinationPreferences: ["beach", "family"],
      durationDays: 7,
      language: "ar",
      partyComposition: { totalTravelers: 4 },
      salientFacts: ["عائلة", "بحر", "راحة", "7 ليالي"],
      travelDates: {},
      tripType: "family",
      userIntentSummary: "عائلة تريد بحر وراحة لمدة 7 ليالي.",
      vibe: "beach",
    },
    templateId: "family_travel_recommendation",
  },
  {
    expectedFocus: "trip_discovery",
    expectedLocale: "ar",
    expectPackage: false,
    id: "ar_vague_advice",
    latestUserMessage: "وين تنصحني اسافر؟",
    structuredContext: {
      budget: { currency: "USD" },
      destinationPreferences: [],
      language: "ar",
      partyComposition: {},
      salientFacts: [],
      travelDates: {},
      userIntentSummary: "المستخدم يطلب نصيحة سفر عامة.",
    },
    templateId: "destination_discovery",
  },
  {
    expectedLocale: "ar",
    expectedPackageId: "bali-signature",
    expectPackage: true,
    id: "ar_codeswitch_bali",
    latestUserMessage: "اريد trip عائلي لبالي، 7 nights، من بغداد",
    structuredContext: {
      budget: { currency: "USD" },
      departureCity: "Baghdad",
      destinationPreferences: ["Bali", "family"],
      durationDays: 7,
      language: "ar",
      partyComposition: { totalTravelers: 4 },
      salientFacts: ["بالي", "عائلة", "7 nights"],
      travelDates: {},
      tripType: "family",
      userIntentSummary: "رحلة عائلية إلى بالي.",
      vibe: "beach",
    },
    templateId: "family_travel_recommendation",
  },
  {
    expectedLocale: "ar",
    expectedPackageId: "bali-signature",
    expectPackage: true,
    id: "ar_honeymoon_bali",
    latestUserMessage:
      "نريد شهر عسل هادي من دبي لمدة 7 ايام، نحب البحر والفندق يكون راقي",
    structuredContext: {
      budget: { currency: "USD" },
      departureCity: "Dubai",
      destinationPreferences: ["beach", "honeymoon"],
      durationDays: 7,
      language: "ar",
      partyComposition: { totalTravelers: 2 },
      salientFacts: ["شهر عسل", "بحر", "فندق راقي"],
      travelDates: { flexibility: "flexible" },
      tripType: "couples",
      userIntentSummary: "شهر عسل هادئ وراقي من دبي لمدة 7 أيام.",
      vibe: "beach",
    },
    templateId: "luxury_travel_recommendation",
  },
  {
    expectedLocale: "ar",
    expectedPackageId: "alps-private",
    expectPackage: true,
    id: "ar_mountains_spa",
    latestUserMessage:
      "ما اريد بحر، اريد جبال وسبا وهدوء، احنا شخصين والميزانية مفتوحة",
    structuredContext: {
      budget: { currency: "USD", level: "luxury" },
      destinationPreferences: ["mountains", "spa"],
      language: "ar",
      luxuryPreference: "luxury",
      partyComposition: { totalTravelers: 2 },
      salientFacts: ["جبال", "سبا", "هدوء", "شخصين"],
      travelDates: {},
      tripType: "couples",
      userIntentSummary: "رحلة جبال وسبا هادئة لشخصين.",
      vibe: "nature",
    },
    templateId: "luxury_travel_recommendation",
  },
  {
    expectedLocale: "ar",
    expectedPackageId: "tokyo-curated",
    expectPackage: true,
    id: "ar_tokyo_city",
    latestUserMessage:
      "اريد طوكيو، اكل ومطاعم وتسوق، 6 ليالي، احنا 2 من بغداد",
    structuredContext: {
      budget: { currency: "USD" },
      departureCity: "Baghdad",
      destinationPreferences: ["Tokyo", "food", "shopping"],
      durationDays: 6,
      language: "ar",
      partyComposition: { totalTravelers: 2 },
      salientFacts: ["طوكيو", "مطاعم", "تسوق", "6 ليالي"],
      travelDates: {},
      userIntentSummary: "رحلة مدينة ومطاعم وتسوق إلى طوكيو.",
      vibe: "city",
    },
    templateId: "destination_discovery",
  },
  {
    expectedFocus: "booking_process",
    expectedLocale: "ar",
    expectPackage: false,
    id: "ar_payment_process",
    latestUserMessage: "شلون الدفع؟ ادفع بالتطبيق لو بعدين؟",
    structuredContext: {
      budget: { currency: "USD" },
      destinationPreferences: [],
      language: "ar",
      partyComposition: {},
      salientFacts: [],
      travelDates: {},
      userIntentSummary: "المستخدم يسأل عن الدفع.",
    },
    templateId: "travel_tips",
  },
  {
    expectedFocus: "booking_process",
    expectedLocale: "ar",
    expectPackage: false,
    id: "ar_short_order_process",
    latestUserMessage: "اطلب",
    structuredContext: {
      budget: { currency: "USD" },
      destinationPreferences: [],
      language: "ar",
      partyComposition: {},
      salientFacts: [],
      travelDates: {},
      userIntentSummary: "المستخدم يطلب معرفة طريقة الطلب.",
    },
    templateId: "travel_tips",
  },
  {
    expectedLocale: "ar",
    expectedPackageId: "bali-signature",
    expectPackage: true,
    id: "ar_named_bali_booking",
    latestUserMessage: "اريد احجز بالي، شنو الخطوة الجاية؟",
    structuredContext: {
      budget: { currency: "USD" },
      destinationPreferences: ["Bali"],
      language: "ar",
      partyComposition: {},
      salientFacts: ["بالي", "حجز"],
      travelDates: {},
      userIntentSummary: "المستخدم يريد حجز بالي.",
      vibe: "beach",
    },
    templateId: "destination_discovery",
  },
  {
    expectedLocale: "ar",
    expectedPackageId: "tokyo-curated",
    expectPackage: true,
    id: "ar_no_beach_city",
    latestUserMessage:
      "ما اريد بحر، اريد مطاعم وتسوق وفنادق مرتبة لمدة 6 ليالي",
    structuredContext: {
      budget: { currency: "USD" },
      destinationPreferences: ["food", "shopping", "city"],
      durationDays: 6,
      language: "ar",
      partyComposition: {},
      salientFacts: ["ما اريد بحر", "مطاعم", "تسوق", "فنادق مرتبة"],
      travelDates: {},
      userIntentSummary: "المستخدم لا يريد البحر ويريد مدينة ومطاعم وتسوق.",
      vibe: "city",
    },
    templateId: "destination_discovery",
  },
  {
    expectedLocale: "ar",
    expectedPackageId: "bali-signature",
    expectPackage: true,
    id: "ar_family_kids_beach",
    latestUserMessage:
      "اني وزوجتي وطفلين نريد سفرة بحر وراحة من اربيل، اسبوع تقريباً",
    structuredContext: {
      budget: { currency: "USD" },
      departureCity: "Erbil",
      destinationPreferences: ["beach", "family"],
      durationDays: 7,
      language: "ar",
      partyComposition: { adults: 2, children: 2, totalTravelers: 4 },
      salientFacts: ["زوجين", "طفلين", "بحر", "راحة", "اسبوع"],
      travelDates: {},
      tripType: "family",
      userIntentSummary: "عائلة من أربيل تريد بحر وراحة لمدة أسبوع تقريباً.",
      vibe: "beach",
    },
    templateId: "family_travel_recommendation",
  },
  {
    expectedLocale: "ar",
    expectedPackageId: "alps-private",
    expectPackage: true,
    id: "ar_snow_spa_couple",
    latestUserMessage: "احب الثلج والهدوء والسبا، 5 ليالي، احنا شخصين",
    structuredContext: {
      budget: { currency: "USD", level: "luxury" },
      destinationPreferences: ["snow", "spa", "mountains"],
      durationDays: 5,
      language: "ar",
      partyComposition: { totalTravelers: 2 },
      salientFacts: ["ثلج", "هدوء", "سبا", "5 ليالي", "شخصين"],
      travelDates: {},
      tripType: "couples",
      userIntentSummary: "رحلة ثلج وسبا هادئة لشخصين.",
      vibe: "nature",
    },
    templateId: "luxury_travel_recommendation",
  },
  {
    expectedFocus: "trip_discovery",
    expectedLocale: "ar",
    expectPackage: false,
    id: "ar_vague_dates_departure",
    latestUserMessage: "اريد اسافر نهاية الشهر من بغداد، ما اعرف وين",
    structuredContext: {
      budget: { currency: "USD" },
      departureCity: "Baghdad",
      destinationPreferences: [],
      language: "ar",
      partyComposition: {},
      salientFacts: ["نهاية الشهر", "بغداد", "ما اعرف وين"],
      travelDates: { flexibility: "end_of_month" },
      userIntentSummary: "المستخدم يعرف وقت السفر والمغادرة لكن لا يعرف الوجهة.",
    },
    templateId: "destination_discovery",
  },
  {
    expectedLocale: "en",
    expectedPackageId: "tokyo-curated",
    expectPackage: true,
    id: "en_city_trip",
    latestUserMessage:
      "Plan a premium city trip for 2 from Dubai. Food, culture, and shopping matter.",
    structuredContext: {
      budget: { currency: "USD", level: "premium" },
      departureCity: "Dubai",
      destinationPreferences: ["city", "food", "shopping"],
      language: "en",
      partyComposition: { totalTravelers: 2 },
      salientFacts: ["Food", "culture", "shopping"],
      travelDates: {},
      userIntentSummary: "Premium city trip for two.",
      vibe: "city",
    },
    templateId: "destination_discovery",
  },
];

const wait = (durationMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const waitForServer = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);

      if (response.ok) {
        return;
      }
    } catch {
      // Server still starting.
    }

    await wait(250);
  }

  throw new Error("Timed out waiting for Heia eval server.");
};

const createRequestBody = (testCase) => ({
  latestUserMessage: testCase.latestUserMessage,
  locale: testCase.expectedLocale,
  recentConversation: [`[user] ${testCase.latestUserMessage}`],
  structuredContext: testCase.structuredContext,
  templateId: testCase.templateId,
});

const containsArabic = (value) => /[\u0600-\u06FF]/.test(value);

const iraqiMarkers = [
  "تكدر",
  "تگدر",
  "تقدر",
  "اكدر",
  "أكدر",
  "أگدر",
  "نكدر",
  "شلون",
  "تريد",
  "أرتبلك",
  "أرتّب لك",
  "ارتبلك",
  "حتى",
  "وياك",
  "بعدين",
  "نحدد",
  "نثبت",
  "أثبتلك",
  "أثبت لك",
  "أرشحلك",
  "تعطيني",
  "تجاوبني",
  "هال",
  "إذا تحب",
  "هسه",
];

const badEnglishInArabic = [
  "quick start",
  "reply with",
  "shortlist",
  "package id",
  "packageId",
  "mountain suites",
  "nights",
  "premium",
  "private transfers",
  "priority booking",
  "sunset dining",
  "boutique stays",
  "city guide",
  "priority booking",
];

const noisyPattern = /(?:[23]D){3,}|[A-Za-z0-9_]{28,}/i;
const malformedArabicPatterns = [
  /نكملون/,
  /تجاوبني على الخيارات/,
  /ادزلك/,
  /يكّتب/,
  /يكّدر/,
  /يككّي/,
  /أنرتبلك/,
  /السببا/,
  /الهوس الغذائي/,
  /للويكند/,
  /جوّه/,
  /تگضّون/,
];
const pluralUserAddressPatterns = [
  /حسب (?:طلبكم|رغبتكم|وصفكم|تفاصيلكم|كلامكم|تفضيلاتكم)/,
  /(?:ميزانيتكم|رحلتكم|تاريخكم|عددكم|تفضيلكم|تفضيلاتكم)/,
  /(?:إنكم|انكم|لأنكم|لانكم)/,
  /(?:ذكرتوه|وصفتوه|تفضلونه|يناسبكم|تناسبكم)/,
  /إلكم/,
  /لكم/,
  /معكم/,
  /يخصكم/,
  /أنتوا/,
  /انتم/,
  /أنتم/,
  /تكدرون/,
  /تقدرون/,
  /تريدون/,
  /تحبون/,
  /تثبتون/,
  /تستمتعون/,
  /تعطوني/,
  /ترسلون/,
  /تبعتون/,
  /تبعثون/,
  /تجاوبون/,
  /تختارون/,
  /تكملون/,
  /أرتبلكم/,
  /ارتبلكم/,
  /أرتّب لكم/,
  /نرتب لكم/,
];
const allowedEnglishInArabic = ["USD"];

const removeAllowedEnglish = (value) =>
  allowedEnglishInArabic.reduce(
    (result, allowedPhrase) =>
      result.replaceAll(new RegExp(allowedPhrase, "gi"), ""),
    value,
  );

const getGeneratedTextBlob = (responses) =>
  responses
    .flatMap((response) => {
      if (response.type === "plain_text_guidance") {
        return [response.text];
      }

      if (response.type === "package_recommendation") {
        return [response.summary, response.ctaLabel];
      }

      if (response.type === "follow_up_question_set") {
        return [
          response.intro,
          ...response.questions.flatMap((question) => [
            question.helpText ?? "",
            question.question,
            ...question.quickReplies,
          ]),
        ];
      }

      return [];
    })
    .join(" ");

const scoreCase = (testCase, responseBody) => {
  const failures = [];
  const responses = responseBody.responses ?? [];
  const guidance = responses.find(
    (response) => response.type === "plain_text_guidance",
  );
  const packageCard = responses.find(
    (response) => response.type === "package_recommendation",
  );
  const followUp = responses.find(
    (response) => response.type === "follow_up_question_set",
  );
  const generatedTextBlob = getGeneratedTextBlob(responses);

  if (!responseBody.ok) {
    failures.push("response ok=false");
  }

  if (!guidance?.text) {
    failures.push("missing guidance text");
  }

  if (testCase.expectedLocale === "ar") {
    if (!containsArabic(guidance?.text ?? "")) {
      failures.push("Arabic case did not produce Arabic guidance");
    }

    if (
      !iraqiMarkers.some((marker) => (guidance?.text ?? "").includes(marker))
    ) {
      failures.push("Arabic guidance lacks Iraqi-friendly markers");
    }

    if (
      badEnglishInArabic.some((phrase) =>
        generatedTextBlob.toLowerCase().includes(phrase),
      )
    ) {
      failures.push("Arabic output contains generic English filler");
    }

    if (/[A-Za-z]{3,}/.test(removeAllowedEnglish(generatedTextBlob))) {
      failures.push("Arabic output contains untranslated English words");
    }

    if (/[*_`#>•]/.test(generatedTextBlob)) {
      failures.push("Arabic output contains Markdown/decorative formatting");
    }

    if (
      malformedArabicPatterns.some((pattern) =>
        pattern.test(generatedTextBlob),
      )
    ) {
      failures.push("Arabic output contains malformed Iraqi phrasing");
    }

    if (
      pluralUserAddressPatterns.some((pattern) =>
        pattern.test(generatedTextBlob),
      )
    ) {
      failures.push("Arabic output addresses user as plural");
    }
  } else if (containsArabic(generatedTextBlob)) {
    failures.push("English output contains Arabic text");
  }

  if (testCase.expectPackage && !packageCard) {
    failures.push("expected a package recommendation");
  }

  if (!testCase.expectPackage && packageCard) {
    failures.push(`unexpected package recommendation: ${packageCard.packageId}`);
  }

  if (
    testCase.expectedPackageId &&
    packageCard?.packageId !== testCase.expectedPackageId
  ) {
    failures.push(
      `expected ${testCase.expectedPackageId}, got ${packageCard?.packageId}`,
    );
  }

  for (const expectedText of testCase.expectedTextIncludes ?? []) {
    if (!generatedTextBlob.includes(expectedText)) {
      failures.push(`missing expected text: ${expectedText}`);
    }
  }

  if (!followUp?.questions?.length) {
    failures.push("missing follow-up questions");
  }

  for (const question of followUp?.questions ?? []) {
    if (question.quickReplies.length < 2 || question.quickReplies.length > 3) {
      failures.push(`bad quick reply count for ${question.id}`);
    }

    for (const quickReply of question.quickReplies) {
      if (quickReply.length > 38) {
        failures.push(`quick reply too long: ${quickReply}`);
      }

      if (noisyPattern.test(quickReply)) {
        failures.push(`noisy quick reply: ${quickReply}`);
      }
    }
  }

  return {
    failures,
    guidanceText: guidance?.text ?? "",
    packageId: packageCard?.packageId,
  };
};

const run = async () => {
  const server = spawn("node", ["scripts/heia-dev-server.mjs"], {
    env: {
      ...process.env,
      HEIA_DEV_PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  server.stdout.on("data", (chunk) => {
    process.stderr.write(chunk);
  });
  server.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  try {
    await waitForServer();

    let failureCount = 0;

    for (let runIndex = 0; runIndex < runCount; runIndex += 1) {
      for (const testCase of cases) {
        const response = await fetch(`${baseUrl}/api/heia`, {
          body: JSON.stringify(createRequestBody(testCase)),
          headers: {
            "Accept-Language": testCase.expectedLocale,
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const responseBody = await response.json();
        const result = scoreCase(testCase, responseBody);

        if (result.failures.length > 0) {
          failureCount += result.failures.length;
        }

        console.log(
          JSON.stringify(
            {
              failures: result.failures,
              guidance: result.guidanceText,
              id: testCase.id,
              packageId: result.packageId ?? null,
              run: runIndex + 1,
            },
            null,
            2,
          ),
        );
      }
    }

    if (failureCount > 0) {
      throw new Error(`Heia prompt eval failed with ${failureCount} issue(s).`);
    }
  } finally {
    server.kill("SIGTERM");
  }
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
