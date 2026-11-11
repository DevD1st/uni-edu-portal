"use client";

import { useState, type FormEvent } from "react";
import { Banner, Button, TextField, useClientReady } from "@uemp/ui";
import { readNoContent, readableError, ApiError } from "@uemp/web-client";
import { portalApi } from "../../portal/student-request";
import type { AcademicReferences, SignupInput } from "../signup-contract";
import { AcademicPlacementFields } from "./academic-placement-fields";
import { NewPasswordFields } from "./new-password-fields";

export function SignupForm({ references }: { references: AcademicReferences | null }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const ready = useClientReady();
  const disabled = !ready || pending;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || pending) return;
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
    <form
      method="post"
      className="u-sign-in-form"
      onSubmit={(event) => void submit(event)}
    >
      <fieldset disabled={disabled} className="student-signup-section u-stack min-w-0">
        <legend>Account details</legend>
        <div className="student-field-grid">
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
        </div>
        <TextField
          label="Email address"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
        />
        <NewPasswordFields
          mismatch={passwordMismatch}
          onChange={() => setPasswordMismatch(false)}
        />
      </fieldset>
      {references && references.faculties.length > 0 && (
        <AcademicPlacementFields references={references} disabled={disabled} />
      )}
      {error && <Banner tone="danger">{error}</Banner>}
      <Button type="submit" disabled={!ready} pending={pending}>
        {!ready ? "Loading form" : pending ? "Creating account" : "Create account"}
      </Button>
    </form>
  );
}
