import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller.js';
import { AuthenticationService } from './services/authentication.service.js';
import { TokenRegistryService } from './services/token-registry.service.js';
import { AccountAuthSaga } from './sagas/account-auth.saga.js';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard.js';
import { SignInHandler } from './commands/handlers/sign-in/sign-in.handler.js';
import { RefreshSessionHandler } from './commands/handlers/refresh-session/refresh-session.handler.js';
import { SignOutHandler } from './commands/handlers/sign-out/sign-out.handler.js';
import { ClearRevokedSessionHandler } from './commands/handlers/clear-revoked-session/clear-revoked-session.handler.js';
import { AuthenticateAccessHandler } from './queries/handlers/authenticate-access/authenticate-access.handler.js';

@Module({
  controllers: [AuthController],
  providers: [
    AuthenticationService,
    TokenRegistryService,
    AccountAuthSaga,
    AuthRateLimitGuard,
    SignInHandler,
    RefreshSessionHandler,
    SignOutHandler,
    ClearRevokedSessionHandler,
    AuthenticateAccessHandler,
  ],
})
export class AuthModule {}
