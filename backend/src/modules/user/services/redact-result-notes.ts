import type { EntityManager } from 'typeorm';

export async function redactResultNotes(
  manager: EntityManager,
  identity: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    matricNumber?: string | null;
  },
): Promise<void> {
  const names = [identity.firstName, identity.lastName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  const fullName = names.join(' ');
  const directIdentifiers = [
    identity.email,
    identity.matricNumber,
    /\s/.test(fullName) ? fullName : null,
    names.length === 2 ? names.toReversed().join(' ') : null,
  ];
  // Match literal identifiers at word boundaries. In a full name, allow formatting whitespace.
  // A lone word such as "Mark" is too ambiguous to remove from academic feedback.
  const escape = (part: string) => part.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&');
  const pattern =
    '(?<![[:alnum:]_])(?:' +
    [
      ...new Set(
        directIdentifiers.filter((part): part is string => Boolean(part)),
      ),
    ]
      .sort((left, right) => right.length - left.length)
      .map((part) => part.split(/\s+/).map(escape).join('[[:space:]]+'))
      .join('|') +
    ')(?![[:alnum:]_])';
  await manager.query(
    `
    UPDATE result_groups
    SET submission_reason = regexp_replace(submission_reason, $1, '[redacted]', 'gi'),
        approval_reason = regexp_replace(approval_reason, $1, '[redacted]', 'gi'),
        correction_request_reason = regexp_replace(correction_request_reason, $1, '[redacted]', 'gi'),
        updated_at = now()
    WHERE submission_reason ~* $1 OR approval_reason ~* $1 OR correction_request_reason ~* $1
    `,
    [pattern],
  );
}
