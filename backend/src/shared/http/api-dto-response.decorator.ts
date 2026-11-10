import { applyDecorators, HttpStatus, SerializeOptions } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiDtoResponse<T>(
  type: Type<T>,
  status: number = HttpStatus.OK,
): MethodDecorator {
  // Swagger and runtime serialization use the same field allowlist.
  return applyDecorators(
    ApiResponse({ status, type }),
    SerializeOptions({
      type,
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    }),
  );
}
