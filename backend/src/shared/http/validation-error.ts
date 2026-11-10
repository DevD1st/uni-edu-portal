import { HttpStatus } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { ApplicationError } from '#core/http/application-error.js';

export function validationError(errors: ValidationError[]): ApplicationError {
  const messages = [...new Set(errors.flatMap(messagesFor))];
  return new ApplicationError(
    HttpStatus.BAD_REQUEST,
    messages[0] ?? 'Check the submitted values and try again.',
    messages.length ? messages : undefined,
  );
}

function messagesFor(error: ValidationError): string[] {
  // Do not echo unknown property names or values from the submitted payload.
  const messages = Object.entries(error.constraints ?? {}).map(
    ([rule, message]) => {
      if (rule === 'whitelistValidation')
        return 'The request includes a field this endpoint does not accept.';
      if (rule === 'unknownValue')
        return 'Send the request values in the format shown in the API documentation.';
      return message;
    },
  );
  return messages.concat((error.children ?? []).flatMap(messagesFor));
}
