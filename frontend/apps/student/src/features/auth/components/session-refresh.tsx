"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banner, Button, ResourceState } from "@uemp/ui";
import {
  ApiError,
  createApiClient,
  readableError,
  readNoContent,
} from "@uemp/web-client";
import { sessionFetch } from "../session-request";

const api = createApiClient({ baseUrl: "", fetcher: sessionFetch });
let refreshing: Promise<undefined> | undefined;

function renewSession() {
  // Strict Mode can mount the effect twice; both listeners need the same outcome.
  refreshing ??= api
    .request("/api/auth/refresh", readNoContent, { method: "POST" })
    .finally(() => {
      refreshing = undefined;
    });
  return refreshing;
}

export function SessionRefresh({ returnTo }: { returnTo: string }) {
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void renewSession().then(
      () => {
        if (active) window.location.replace(returnTo);
      },
      (cause: unknown) => {
        if (!active) return;
        if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403))
          window.location.replace("/sign-in");
        else setError(readableError(cause));
      },
    );
    return () => {
      active = false;
    };
  }, [attempt, returnTo]);

  return error ? (
    <div className="u-stack">
      <Banner tone="danger">{error}</Banner>
      <Button
        onClick={() => {
          setError(null);
          setAttempt((value) => value + 1);
        }}
      >
        Try again
      </Button>
      <Link className="u-text-link" href="/sign-in">
        Return to sign in
      </Link>
    </div>
  ) : (
    <ResourceState
      state="loading"
      title="Renewing your session…"
      detail="You'll return to the page you were viewing."
    />
  );
}
