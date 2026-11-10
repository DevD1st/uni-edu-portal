import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository.js';
import { USER_REPOSITORY } from './util/constants.js';
import { StudentPlacementService } from './services/student-placement.service.js';
import { UserAdministrationService } from './services/user-administration.service.js';
import { UsersController } from './controllers/users.controller.js';
import { AdminUsersController } from './controllers/admin-users.controller.js';
import { CreateStudentAccountHandler } from './commands/handlers/create-student-account/create-student-account.handler.js';
import { AdvanceAuthVersionHandler } from './commands/handlers/advance-auth-version/advance-auth-version.handler.js';
import { UpdateUserProfileHandler } from './commands/handlers/update-user-profile/update-user-profile.handler.js';
import { UpdateStudentPlacementHandler } from './commands/handlers/update-student-placement/update-student-placement.handler.js';
import { ChangePasswordHandler } from './commands/handlers/change-password/change-password.handler.js';
import { ManageUserStatusHandler } from './commands/handlers/manage-user-status/manage-user-status.handler.js';
import { RevokeUserSessionsHandler } from './commands/handlers/revoke-user-sessions/revoke-user-sessions.handler.js';
import { DeleteUserAccountHandler } from './commands/handlers/delete-user-account/delete-user-account.handler.js';
import { FindAccountCredentialsHandler } from './queries/handlers/find-account-credentials/find-account-credentials.handler.js';
import { GetAuthAccountHandler } from './queries/handlers/get-auth-account/get-auth-account.handler.js';
import { GetUserProfileHandler } from './queries/handlers/get-user-profile/get-user-profile.handler.js';
import { ListUsersHandler } from './queries/handlers/list-users/list-users.handler.js';

@Module({
  controllers: [UsersController, AdminUsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    StudentPlacementService,
    UserAdministrationService,
    CreateStudentAccountHandler,
    AdvanceAuthVersionHandler,
    UpdateUserProfileHandler,
    UpdateStudentPlacementHandler,
    ChangePasswordHandler,
    ManageUserStatusHandler,
    RevokeUserSessionsHandler,
    DeleteUserAccountHandler,
    FindAccountCredentialsHandler,
    GetAuthAccountHandler,
    GetUserProfileHandler,
    ListUsersHandler,
  ],
})
export class UserModule {}
