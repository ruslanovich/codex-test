const THEME_STORAGE_KEY = 'task-board-theme';

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storage: Storage | undefined = window.localStorage;
  if (!storage) {
    return null;
  }

  const hasRequiredMethods =
    typeof storage.getItem === 'function' && typeof storage.setItem === 'function';

  return hasRequiredMethods ? storage : null;
};

export const readStoredTheme = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const stored = storage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Ignore storage access issues and fall back to defaults.
  }

  return null;
};

export const persistStoredTheme = (theme: 'light' | 'dark') => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage access issues and avoid crashing the UI/tests.
  }
};
