import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    type: Number,
    description: 'HTTP status code for the failed request.',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    type: String,
    description: 'Explanation of what happened and how to proceed.',
    example: 'Enter a valid email address.',
  })
  message!: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Validation messages for the submitted values.',
    example: [
      'Enter a valid email address.',
      'Choose either student or admin as the account type.',
    ],
  })
  errors?: readonly string[];

  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Request ID to include when asking for support.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  requestId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Trace ID, when tracing is enabled.',
    example: '5e45e09177a37c66e0860a404f3a191f',
  })
  traceId?: string;
}
