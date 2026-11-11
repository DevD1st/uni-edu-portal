"use client";

import { useState } from "react";
import { SignInForm } from "@uemp/ui";
import { createApiClient, readableError, readNoContent } from "@uemp/web-client";
import { sessionFetch } from "../session-request";

const api = createApiClient({ baseUrl: "", fetcher: sessionFetch });

export function StudentSignIn() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <SignInForm
      pending={pending}
      error={error}
      onSubmit={async (input) => {
        setPending(true);
        setError(null);
        try {
          await api.request("/api/auth/sign-in", readNoContent, {
            method: "POST",
            json: input,
          });
          window.location.replace("/overview");
        } catch (error: unknown) {
          setError(readableError(error));
          setPending(false);
        }
      }}
    />
  );
}
