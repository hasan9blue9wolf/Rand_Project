const createStorageMock = () => {
  const store = new Map();

  return {
    clear: () => {
      store.clear();
    },
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };
};

module.exports = {
  clearMocks: true,
  moduleNameMapper: {
    "^expo-modules-core$": "<rootDir>/node_modules/expo/node_modules/expo-modules-core",
    "^expo-modules-core/(.*)$":
      "<rootDir>/node_modules/expo/node_modules/expo-modules-core/$1",
  },
  modulePathIgnorePatterns: ["<rootDir>/dist", "<rootDir>/server"],
  preset: "jest-expo",
  setupFiles: ["<rootDir>/test/globals.js"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  testEnvironmentOptions: {
    localStorage: createStorageMock(),
    sessionStorage: createStorageMock(),
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/e2e/", "/server/"],
};
