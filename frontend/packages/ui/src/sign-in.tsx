"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Banner, Button, IconButton, TextField } from "./controls";
import { useClientReady } from "./use-client-ready";

export function SignInForm({
  onSubmit,
  error,
  pending,
}: {
  onSubmit: (input: { email: string; password: string }) => Promise<void>;
  error: string | null;
  pending: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const ready = useClientReady();
  const disabled = !ready || pending;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || pending) return;
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");
    if (typeof email === "string" && typeof password === "string") {
      void onSubmit({ email: email.trim(), password });
    }
  }
  return (
    <form method="post" className="u-sign-in-form" onSubmit={submit}>
      {error && <Banner tone="danger">{error}</Banner>}
      <TextField
        label="Email address"
        name="email"
        type="email"
        autoComplete="username"
        disabled={disabled}
        required
        maxLength={254}
      />
      <TextField
        label="Password"
        name="password"
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        disabled={disabled}
        required
        maxLength={72}
        trailingAction={
          <IconButton
            type="button"
            label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            disabled={disabled}
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? <EyeOff size={19} aria-hidden /> : <Eye size={19} aria-hidden />}
          </IconButton>
        }
      />
      <Button type="submit" disabled={!ready} pending={pending}>
        {!ready ? "Loading form" : pending ? "Signing in" : "Sign in"}
        {ready && !pending && <ArrowRight size={18} aria-hidden />}
      </Button>
    </form>
  );
}
