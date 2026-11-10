import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LivenessResponseDto {
  @ApiProperty({
    enum: ['ok'],
    description: 'Whether the API process is running.',
    example: 'ok',
  })
  @Expose()
  status: 'ok' = 'ok';
}

export class ReadinessResponseDto {
  @ApiProperty({
    enum: ['ready'],
    description: 'Whether the API can reach PostgreSQL and Redis.',
    example: 'ready',
  })
  @Expose()
  status: 'ready' = 'ready';
}
