export function createTabSessionStore<T>(key: string, validate: (value: unknown) => T) {
  let current: T | null = null;
  let loaded = false;
  const listeners = new Set<() => void>();

  function get() {
    if (!loaded && typeof window !== "undefined") {
      loaded = true;
      try {
        const raw = window.sessionStorage.getItem(key);
        current = raw ? validate(JSON.parse(raw)) : null;
      } catch {
        current = null;
        try {
          window.sessionStorage.removeItem(key);
        } catch {
          /* Storage may be disabled. */
        }
      }
    }
    return current;
  }

  function set(value: T | null) {
    current = value;
    loaded = true;
    try {
      if (value === null) window.sessionStorage.removeItem(key);
      else window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Keep the tab session usable when browser storage is unavailable. */
    }
    for (const listener of listeners) listener();
  }

  return {
    get,
    set,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
