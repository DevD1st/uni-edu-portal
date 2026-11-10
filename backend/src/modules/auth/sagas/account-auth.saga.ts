import { Injectable } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import type { IEvent } from '@nestjs/cqrs';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
import { AccountAuthChangedEvent } from '#shared/auth/user.contracts.js';
import { ClearRevokedSessionCommand } from '../commands/impl.js';

@Injectable()
export class AccountAuthSaga {
  @Saga()
  clearRevokedTokens = (events: Observable<IEvent>) =>
    events.pipe(
      ofType(AccountAuthChangedEvent),
      // Redis cleanup follows the commit. The database version already rejects old tokens.
      map(
        (event) =>
          new ClearRevokedSessionCommand(event.userId, event.authVersion),
      ),
    );
}
