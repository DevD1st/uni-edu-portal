"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Banner, Button, IconButton, TextField } from "./controls";

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
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");
    if (typeof email === "string" && typeof password === "string") {
      void onSubmit({ email: email.trim(), password });
    }
  }
  return (
    <form className="u-sign-in-form" onSubmit={submit}>
      {error && <Banner tone="danger">{error}</Banner>}
      <TextField
        label="Email address"
        name="email"
        type="email"
        autoComplete="username"
        required
        maxLength={254}
      />
      <div className="u-password-field">
        <TextField
          label="Password"
          name="password"
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          required
          maxLength={72}
        />
        <IconButton
          type="button"
          label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff size={19} aria-hidden /> : <Eye size={19} aria-hidden />}
        </IconButton>
      </div>
      <Button type="submit" pending={pending}>
        {pending ? "Signing in" : "Sign in"}
        {!pending && <ArrowRight size={18} aria-hidden />}
      </Button>
    </form>
  );
}
