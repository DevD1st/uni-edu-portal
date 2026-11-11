// Cookies are shared by tabs. Keep rotating refreshes and sign-out in order without
// exposing their token values or introducing a second session store.
let pending: Promise<unknown> = Promise.resolve();

export const sessionFetch: typeof fetch = (input, init) => {
  const send = () => fetch(input, init);
  const result =
    typeof navigator !== "undefined" && navigator.locks
      ? navigator.locks.request("uemp:student:session", send)
      : pending.then(send, send);
  pending = result.catch(() => undefined);
  return result;
};
