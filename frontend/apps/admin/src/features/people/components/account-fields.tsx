import { TextField } from "@uemp/ui";
import { requiredText, textField } from "../../portal/components/staff-controls";
import type { Dto } from "@uemp/api-contracts/response";

type Profile = Pick<
  Dto<"AdminDirectoryUserResponseDto">,
  "firstName" | "lastName" | "email"
>;
export function AccountFields({
  record,
  email = true,
  password = false,
}: {
  record?: Profile;
  email?: boolean;
  password?: boolean;
}) {
  return (
    <fieldset className="staff-fields staff-form-group">
      <legend>Account details</legend>
      <TextField
        name="firstName"
        label="First name"
        defaultValue={record?.firstName ?? ""}
        maxLength={100}
      />
      <TextField
        name="lastName"
        label="Last name"
        defaultValue={record?.lastName ?? ""}
        maxLength={100}
      />
      {email && (
        <TextField
          name="email"
          label="Email address"
          type="email"
          defaultValue={record?.email}
          maxLength={254}
          required
        />
      )}
      {password && (
        <TextField
          name="password"
          label="Initial password"
          type="password"
          minLength={12}
          maxLength={72}
          hint="Use at least 12 characters."
          autoComplete="new-password"
          required
        />
      )}
    </fieldset>
  );
}

export function names(form: FormData) {
  return {
    firstName: textField(form, "firstName") || null,
    lastName: textField(form, "lastName") || null,
  };
}

export function newAccount(form: FormData) {
  return {
    ...names(form),
    email: requiredText(form, "email", "an email address"),
    password: String(form.get("password") ?? ""),
  };
}
