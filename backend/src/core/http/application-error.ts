import { HttpException } from '@nestjs/common';

/** Carries a message deliberately written for the person making the request. */
export class ApplicationError extends HttpException {
  constructor(
    status: number,
    message: string,
    readonly errors?: readonly string[],
    cause?: unknown,
  ) {
    super(message, status, { cause });
  }
}
