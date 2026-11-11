"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { readAccount } from "@uemp/api-contracts";
import { Banner, Button, TextField, useClientReady } from "@uemp/ui";
import { portalApi, studentError } from "../../portal/student-request";

export function ProfileForm({
  firstName,
  lastName,
}: {
  firstName: string | null;
  lastName: string | null;
}) {
  const router = useRouter();
  const ready = useClientReady();
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ message: string; error?: boolean }>();
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || pending) return;
    setNotice(undefined);
    setPending(true);
    const data = new FormData(event.currentTarget);
    try {
      await portalApi.request("/api/student/profile", readAccount, {
        method: "PATCH",
        json: {
          firstName: String(data.get("firstName") ?? "").trim(),
          lastName: String(data.get("lastName") ?? "").trim(),
        },
      });
      setNotice({ message: "Your profile was updated." });
      router.refresh();
    } catch (error) {
      setNotice({ message: studentError(error), error: true });
    } finally {
      setPending(false);
    }
  }
  return (
    <form method="post" className="u-stack" onSubmit={(event) => void save(event)}>
      {notice && (
        <Banner tone={notice.error ? "danger" : "success"}>{notice.message}</Banner>
      )}
      <div className="student-field-grid">
        <TextField
          label="First name"
          name="firstName"
          defaultValue={firstName ?? ""}
          disabled={!ready || pending}
          maxLength={100}
          autoComplete="given-name"
        />
        <TextField
          label="Last name"
          name="lastName"
          defaultValue={lastName ?? ""}
          disabled={!ready || pending}
          maxLength={100}
          autoComplete="family-name"
        />
      </div>
      <div className="student-form-footer">
        <p className="u-muted">Your name appears on your student records.</p>
        <Button type="submit" disabled={!ready} pending={pending}>
          {pending ? "Saving profile" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
