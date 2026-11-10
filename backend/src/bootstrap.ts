import { createHash, timingSafeEqual } from 'node:crypto';
import {
  ClassSerializerInterceptor,
  HttpStatus,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import {
  environment,
  intEnv,
  validateRuntimeConfig,
} from '#core/config/env.js';
import {
  LOG_PROVIDER,
  LogService,
} from '#core/logging/services/log.service.js';
import { requestLogging } from '#shared/http/request-logging.js';
import { ApplicationError } from '#core/http/application-error.js';
import { ErrorResponseDto } from '#shared/http/error-response.dto.js';
import { validationError } from '#shared/http/validation-error.js';

export async function createApplication() {
  validateRuntimeConfig();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    abortOnError: false,
  });
  return configureApplication(app);
}

export async function configureApplication(app: INestApplication) {
  const log = await app.resolve<LogService>(LOG_PROVIDER);
  log.setContext('Bootstrap');
  app.useLogger(log);
  app.use(requestLogging(log));
  const swaggerUser = process.env.SWAGGER_USER;
  const swaggerPassword = process.env.SWAGGER_PASSWORD;
  const swaggerEnabled =
    environment() !== 'production' && Boolean(swaggerUser && swaggerPassword);
  app.use(
    helmet({ contentSecurityPolicy: swaggerEnabled ? false : undefined }),
  );
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      validationError: { target: false, value: false },
      exceptionFactory: validationError,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins,
    exposedHeaders: ['x-request-id', 'x-trace-id'],
  });

  if (swaggerEnabled) {
    const expected = createHash('sha256')
      .update(swaggerUser + ':' + swaggerPassword)
      .digest();
    app.use(
      ['/docs', '/docs-json', '/docs-yaml'],
      (request: Request, response: Response, next: NextFunction) => {
        const value = /^Basic ([A-Za-z0-9+/=]+)$/i.exec(
          request.headers.authorization ?? '',
        )?.[1];
        const actual = createHash('sha256')
          .update(Buffer.from(value ?? '', 'base64'))
          .digest();
        if (value && timingSafeEqual(actual, expected)) return next();
        response.setHeader(
          'WWW-Authenticate',
          'Basic realm="API documentation"',
        );
        next(
          new ApplicationError(
            HttpStatus.UNAUTHORIZED,
            'Enter your API documentation username and password.',
          ),
        );
      },
    );
    const config = new DocumentBuilder()
      .setTitle('University Education Management Portal')
      .setVersion('1')
      .addBearerAuth()
      .addGlobalResponse({
        status: 'default',
        type: ErrorResponseDto,
        description: 'The request could not be completed.',
      })
      .build();
    SwaggerModule.setup('docs', app, () =>
      SwaggerModule.createDocument(app, config),
    );
  }
  return { app, log };
}

export async function bootstrap(telemetry?: { shutdown(): Promise<void> }) {
  const { app, log } = await createApplication();
  const port = intEnv('PORT', 3000, 65535);
  await app.listen(port, '0.0.0.0');
  log.log('Backend listening', { port, telemetry: Boolean(telemetry) });

  const shutdown = async (signal: string) => {
    try {
      log.log('Backend shutdown started', { signal });
      await app.close();
    } catch (error: unknown) {
      log.error('Backend shutdown failed', {
        errorType: error instanceof Error ? error.name : 'UnknownError',
      });
      process.exitCode = 1;
    } finally {
      await telemetry
        ?.shutdown()
        .catch(() => log.error('Telemetry shutdown failed'));
    }
  };
  let stopping = false;
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      if (stopping) return;
      stopping = true;
      void shutdown(signal);
    });
  }
}
