"use client";

import { useState, type FormEvent } from "react";
import { Banner, Button, TextField } from "@uemp/ui";
import { readNoContent, readableError, ApiError } from "@uemp/web-client";
import { portalApi } from "../../portal/student-request";
import type { AcademicReferences, SignupInput } from "../signup-contract";
import { AcademicPlacementFields } from "./academic-placement-fields";

export function SignupForm({ references }: { references: AcademicReferences | null }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(undefined);
    const fields = new FormData(event.currentTarget);
    const password = String(fields.get("password") ?? "");
    if (password !== fields.get("confirmPassword")) {
      setPasswordMismatch(true);
      const confirmation = event.currentTarget.elements.namedItem("confirmPassword");
      if (confirmation instanceof HTMLInputElement) confirmation.focus();
      return;
    }
    setPasswordMismatch(false);
    const input: SignupInput = {
      firstName: String(fields.get("firstName") ?? "").trim(),
      lastName: String(fields.get("lastName") ?? "").trim(),
      email: String(fields.get("email") ?? "").trim(),
      password,
    };
    for (const field of [
      "facultyId",
      "departmentId",
      "courseOfStudyId",
      "academicLevelId",
    ] as const) {
      const value = fields.get(field);
      if (typeof value === "string" && value) input[field] = value;
    }
    setPending(true);
    try {
      await portalApi.request("/api/auth/signup", readNoContent, {
        method: "POST",
        json: input,
      });
      window.location.replace("/sign-in?created=1");
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.details.length
          ? cause.details.join(" ")
          : readableError(cause),
      );
      setPending(false);
    }
  }

  return (
    <form className="u-sign-in-form" onSubmit={(event) => void submit(event)}>
      <fieldset disabled={pending} className="u-stack min-w-0">
        <legend className="sr-only">Account details</legend>
        <TextField
          label="First name"
          name="firstName"
          autoComplete="given-name"
          maxLength={100}
        />
        <TextField
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          maxLength={100}
        />
        <TextField
          label="Email address"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          required
          hint="Use at least 12 characters."
          onChange={() => setPasswordMismatch(false)}
        />
        <TextField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          {...(passwordMismatch
            ? { error: "Enter the same password in both fields." }
            : {})}
          onChange={() => setPasswordMismatch(false)}
        />
      </fieldset>
      {references && references.faculties.length > 0 && (
        <AcademicPlacementFields references={references} disabled={pending} />
      )}
      {error && <Banner tone="danger">{error}</Banner>}
      <Button type="submit" pending={pending}>
        {pending ? "Creating account" : "Create account"}
      </Button>
    </form>
  );
}
