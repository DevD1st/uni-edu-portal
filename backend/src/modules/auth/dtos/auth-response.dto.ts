import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SessionTokenResponseDto {
  @ApiProperty({
    type: String,
    description: 'Signed bearer token.',
    example: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleGFtcGxlIn0.example-signature',
  })
  @Expose()
  token!: string;

  @ApiProperty({
    type: Number,
    description: 'Expiry as a Unix timestamp in seconds.',
    example: 1794307500,
  })
  @Expose()
  expiresAt!: number;
}

export class SessionResponseDto {
  @ApiProperty({
    type: () => SessionTokenResponseDto,
    description: 'Token used to authorize API requests.',
    example: {
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleGFtcGxlIn0.example-signature',
      expiresAt: 1794307500,
    },
  })
  @Expose()
  @Type(() => SessionTokenResponseDto)
  access!: SessionTokenResponseDto;

  @ApiProperty({
    type: () => SessionTokenResponseDto,
    description: 'Single-use token for obtaining a new session.',
    example: {
      token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleGFtcGxlIn0.example-signature',
      expiresAt: 1794911400,
    },
  })
  @Expose()
  @Type(() => SessionTokenResponseDto)
  refresh!: SessionTokenResponseDto;
}
