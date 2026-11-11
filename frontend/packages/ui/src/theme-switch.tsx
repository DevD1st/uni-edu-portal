"use client";

import { useId, useSyncExternalStore } from "react";
import { Contrast } from "lucide-react";
import { themeStorageKey } from "./theme-init";
import { useClientReady } from "./use-client-ready";

const themeEvent = "uemp-theme-change";
type Theme = "system" | "light" | "dark";

function subscribe(callback: () => void) {
  window.addEventListener(themeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(themeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function readTheme(): Theme {
  const value = document.documentElement.dataset["theme"];
  return value === "light" || value === "dark" ? value : "system";
}

function syncTheme(value: Theme) {
  if (value === "system") delete document.documentElement.dataset["theme"];
  else document.documentElement.dataset["theme"] = value;
}

export function ThemeSwitch() {
  const id = useId();
  const ready = useClientReady();
  const theme = useSyncExternalStore(
    (callback) => {
      function onStorage(event: StorageEvent) {
        if (event.key === themeStorageKey || event.key === null) {
          syncTheme(
            event.newValue === "dark" || event.newValue === "light"
              ? event.newValue
              : "system",
          );
        }
      }
      window.addEventListener("storage", onStorage);
      const unsubscribe = subscribe(callback);
      return () => {
        window.removeEventListener("storage", onStorage);
        unsubscribe();
      };
    },
    readTheme,
    () => "system" as Theme,
  );
  return (
    <div className="u-theme-switch">
      <Contrast size={17} aria-hidden />
      <label className="sr-only" htmlFor={id}>
        Color theme
      </label>
      <select
        id={id}
        value={theme}
        disabled={!ready}
        onChange={(event) => {
          const value = event.target.value;
          const next = value === "light" || value === "dark" ? value : "system";
          syncTheme(next);
          try {
            localStorage.setItem(themeStorageKey, next);
          } catch {
            /* Theme still works for this page. */
          }
          window.dispatchEvent(new Event(themeEvent));
        }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
