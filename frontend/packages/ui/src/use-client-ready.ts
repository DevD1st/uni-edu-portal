"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

export function useClientReady() {
  // Server HTML can appear before handlers attach; interactive controls must wait for hydration.
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
