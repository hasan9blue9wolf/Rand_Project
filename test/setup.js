const { afterEach, beforeEach, jest } = require("@jest/globals");
const { cleanup } = require("@testing-library/react-native");
const { TextDecoder, TextEncoder } = require("util");

const asyncStorageState = new Map();

const mockAsyncStorage = {
  clear: jest.fn(async () => {
    asyncStorageState.clear();
  }),
  getAllKeys: jest.fn(async () => Array.from(asyncStorageState.keys())),
  getItem: jest.fn(async (key) =>
    asyncStorageState.has(key) ? asyncStorageState.get(key) : null,
  ),
  multiGet: jest.fn(async (keys) =>
    keys.map((key) => [
      key,
      asyncStorageState.has(key) ? asyncStorageState.get(key) : null,
    ]),
  ),
  removeItem: jest.fn(async (key) => {
    asyncStorageState.delete(key);
  }),
  setItem: jest.fn(async (key, value) => {
    asyncStorageState.set(key, value);
  }),
};
const secureStoreState = new Map();

const mockSecureStore = {
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: "AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY",
  deleteItemAsync: jest.fn(async (key) => {
    secureStoreState.delete(key);
  }),
  getItemAsync: jest.fn(async (key) =>
    secureStoreState.has(key) ? secureStoreState.get(key) : null,
  ),
  setItemAsync: jest.fn(async (key, value) => {
    secureStoreState.set(key, value);
  }),
};

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (handle) => clearTimeout(handle);

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
jest.mock("expo-secure-store", () => mockSecureStore);

const { resetAllStores } = require("./utils/reset-app-state");
const { setTestLocale } = require("./utils/test-localization");

jest.mock("expo-haptics", () => ({
  ImpactFeedbackStyle: {
    Light: "light",
  },
  NotificationFeedbackType: {
    Success: "success",
  },
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name, ...rest }) => {
    const React = require("react");
    const { Text } = require("react-native");

    return React.createElement(Text, rest, name ?? "icon");
  },
}));

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children, ...rest }) => {
    const React = require("react");
    const { View } = require("react-native");

    return React.createElement(View, rest, children);
  },
}));

jest.mock("expo-localization", () => ({
  getLocales: jest.fn(() => [
    {
      languageCode: "en",
      languageTag: "en-US",
    },
  ]),
}));

jest.mock("expo-router", () => ({
  Link: ({ children }) => children ?? null,
  Stack: {
    Screen: () => null,
  },
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    navigate: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    setParams: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");

  const createAnimationChain = () => ({
    damping() {
      return this;
    },
    delay() {
      return this;
    },
    duration() {
      return this;
    },
    mass() {
      return this;
    },
    reduceMotion() {
      return this;
    },
    springify() {
      return this;
    },
    stiffness() {
      return this;
    },
  });

  return {
    __esModule: true,
    Easing: {
      ease: "ease",
      inOut: (value) => value,
      out: (value) => value,
      quad: "quad",
    },
    FadeIn: createAnimationChain(),
    FadeInDown: createAnimationChain(),
    FadeInUp: createAnimationChain(),
    LinearTransition: {
      springify: () => createAnimationChain(),
    },
    ReduceMotion: {
      System: "system",
    },
    default: {
      View,
      createAnimatedComponent: (Component) => Component,
    },
    interpolate: (value, inputRange, outputRange) => {
      if (!Array.isArray(outputRange) || outputRange.length === 0) {
        return value;
      }

      return outputRange[0];
    },
    useAnimatedStyle: (updater) => updater(),
    useSharedValue: (value) => ({
      value,
    }),
    withRepeat: (value) => value,
    withTiming: (value) => value,
  };
});

beforeEach(async () => {
  cleanup();
  jest.clearAllMocks();
  mockAsyncStorage.clear();
  secureStoreState.clear();

  const expoRouter = jest.requireMock("expo-router");

  expoRouter.router.canGoBack.mockReturnValue(true);
  expoRouter.useLocalSearchParams.mockReturnValue({});

  await resetAllStores();
  await setTestLocale("en");
  jest.useRealTimers();
});

afterEach(() => {
  cleanup();
});
