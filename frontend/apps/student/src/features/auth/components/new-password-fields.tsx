"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { IconButton, TextField } from "@uemp/ui";

function NewPasswordField({
  confirmation = false,
  mismatch,
  onChange,
}: {
  confirmation?: boolean;
  mismatch: boolean;
  onChange: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const label = confirmation ? "Confirm password" : "Password";
  return (
    <TextField
      label={label}
      name={confirmation ? "confirmPassword" : "password"}
      type={visible ? "text" : "password"}
      autoComplete="new-password"
      required
      {...(!confirmation
        ? { minLength: 12, maxLength: 72, hint: "Use at least 12 characters." }
        : {})}
      {...(confirmation && mismatch
        ? { error: "Enter the same password in both fields." }
        : {})}
      onChange={onChange}
      trailingAction={
        <IconButton
          label={(visible ? "Hide " : "Show ") + label.toLowerCase()}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff size={19} aria-hidden /> : <Eye size={19} aria-hidden />}
        </IconButton>
      }
    />
  );
}

export function NewPasswordFields({
  mismatch,
  onChange,
}: {
  mismatch: boolean;
  onChange: () => void;
}) {
  return (
    <>
      <NewPasswordField mismatch={mismatch} onChange={onChange} />
      <NewPasswordField confirmation mismatch={mismatch} onChange={onChange} />
    </>
  );
}
