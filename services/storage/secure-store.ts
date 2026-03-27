import * as SecureStore from "expo-secure-store";

type SecureStorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  setItem: (key: string, value: string) => Promise<void>;
};

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export const secureStoreStorage: SecureStorageAdapter = {
  getItem: async (key) =>
    SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS),
  removeItem: async (key) =>
    SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS),
  setItem: async (key, value) =>
    SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS),
};
