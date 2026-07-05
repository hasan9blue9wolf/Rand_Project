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

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: createStorageMock(),
});

Object.defineProperty(globalThis, "sessionStorage", {
  configurable: true,
  value: createStorageMock(),
});
