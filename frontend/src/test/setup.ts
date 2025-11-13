import '@testing-library/jest-dom/vitest';

declare global {
  // React 18 checks this flag to decide whether to suppress act() warnings.
  // Vitest doesn't set it automatically, so we do it once for all tests.
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

if (typeof window !== 'undefined') {
  class MemoryStorage implements Storage {
    #store = new Map<string, string>();

    get length() {
      return this.#store.size;
    }

    clear() {
      this.#store.clear();
    }

    getItem(key: string) {
      return this.#store.has(key) ? this.#store.get(key) ?? null : null;
    }

    key(index: number) {
      return Array.from(this.#store.keys())[index] ?? null;
    }

    removeItem(key: string) {
      this.#store.delete(key);
    }

    setItem(key: string, value: string) {
      this.#store.set(key, String(value));
    }
  }

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: new MemoryStorage(),
  });
}
