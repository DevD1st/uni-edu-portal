import { Catch, HttpException, HttpStatus, Inject } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { mapDatabaseWriteError } from '#core/database/database-write.js';
import { ApplicationError } from '#core/http/application-error.js';
import {
  LOG_PROVIDER,
  LogService,
} from '#core/logging/services/log.service.js';
import { requestContext } from '#core/logging/request-context.js';
import { ErrorResponseDto } from './error-response.dto.js';

const publicMessages: Partial<Record<number, string>> = {
  400: 'Check the request format and try again.',
  401: 'Sign in to continue.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested page or record could not be found.',
  405: 'This action is unavailable at the requested address.',
  409: 'This change conflicts with the current data. Refresh and try again.',
  413: 'The request is too large. Reduce its size and try again.',
  415: 'Send the request in the format shown in the API documentation.',
  422: 'Check the submitted values and try again.',
  429: 'Too many requests. Wait a moment and try again.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    this.log.setContext(HttpExceptionFilter.name);
  }

  catch(error: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;
    const response = host.switchToHttp().getResponse();
    const publicError =
      error instanceof ApplicationError ? error : mapDatabaseWriteError(error);
    const status = publicError?.getStatus() ?? errorStatus(error);
    const context = requestContext.getStore();
    if (status >= 500) {
      this.log.error('HTTP request failed', {
        status,
        errorType: error instanceof Error ? error.name : 'UnknownError',
      });
    }
    if (httpAdapter.isHeadersSent(response)) {
      httpAdapter.end(response);
      return;
    }
    // Only application errors carry trusted public text. Framework errors may quote input.
    const body = Object.assign(new ErrorResponseDto(), {
      statusCode: status,
      message:
        publicError?.message ??
        publicMessages[status] ??
        (status >= 500
          ? 'Something went wrong. Please try again later.'
          : 'The request could not be completed. Check the details and try again.'),
      errors: publicError?.errors,
      requestId: context?.requestId,
      traceId: context?.traceId,
    });
    httpAdapter.reply(response, body, status);
  }
}

function errorStatus(error: unknown): number {
  if (error instanceof HttpException) return error.getStatus();
  if (error instanceof Error && 'statusCode' in error) {
    const status = error.statusCode;
    if (
      typeof status === 'number' &&
      Number.isInteger(status) &&
      status >= 400 &&
      status < 500
    )
      return status;
  }
  return HttpStatus.INTERNAL_SERVER_ERROR;
}
