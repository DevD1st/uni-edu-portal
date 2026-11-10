import 'reflect-metadata';
import assert from 'node:assert/strict';
import test from 'node:test';
import { METHOD_METADATA } from '@nestjs/common/constants.js';
import { RequestMethod } from '@nestjs/common';
import {
  hasPrivilege,
  authorizedDepartments,
} from '../dist/shared/admin-authorization/privilege.js';
import {
  ADMIN_AUDIT_ACTIONS,
  AUDIT_ACTION,
  auditAttempt,
} from '../dist/shared/admin-authorization/audit.contracts.js';
import { AdminUsersController } from '../dist/modules/user/controllers/admin-users.controller.js';
import { UsersController } from '../dist/modules/user/controllers/users.controller.js';
import { AdminsController } from '../dist/modules/admin/controllers/admins.controller.js';
import { RolesController } from '../dist/modules/admin/controllers/roles.controller.js';
import { AcademicSetupController } from '../dist/modules/academic-reference/controllers/academic-setup.controller.js';
import { CourseSetupController } from '../dist/modules/course/controllers/course-setup.controller.js';
import { DepartmentRegistrationController } from '../dist/modules/registration/controllers/department-registration.controller.js';
import { LecturerRegistrationController } from '../dist/modules/registration/controllers/lecturer-registration.controller.js';

test('a privilege can only use the department scope of the grant that supplied it', () => {
  const access = {
    adminId: 'admin',
    grants: [
      { departmentId: 'math', privileges: ['read_user'] },
      { departmentId: 'physics', privileges: ['approve_result'] },
    ],
  };
  assert.equal(hasPrivilege(access, 'approve_result', 'math'), false);
  assert.equal(hasPrivilege(access, 'approve_result', 'physics'), true);
  assert.equal(hasPrivilege(access, 'approve_result'), false);
  assert.deepEqual(authorizedDepartments(access, 'read_user'), ['math']);
  access.grants.push({ departmentId: null, privileges: ['read_user'] });
  assert.equal(authorizedDepartments(access, 'read_user'), null);
});

test('every account and admin mutation has a semantic audit action', () => {
  for (const controller of [
    UsersController,
    AdminUsersController,
    AdminsController,
    RolesController,
    AcademicSetupController,
    CourseSetupController,
    DepartmentRegistrationController,
    LecturerRegistrationController,
  ]) {
    for (const method of Object.getOwnPropertyNames(controller.prototype)) {
      const handler = controller.prototype[method];
      const verb = Reflect.getMetadata(METHOD_METADATA, handler);
      if (verb === undefined || verb === RequestMethod.GET) continue;
      const action = Reflect.getMetadata(AUDIT_ACTION, handler);
      assert.ok(action in ADMIN_AUDIT_ACTIONS, controller.name + '.' + method);
    }
  }
});

test('the audit projection accepts only known IDs and safe state values', () => {
  const id = '12345678-1234-4234-9234-123456789abc';
  const request = {
    account: { role: 'admin', userId: id },
    params: { userId: id },
    body: { password: 'discard', email: 'discard' },
  };
  const attempt = auditAttempt(request, 'user.set_status', 'succeeded', {
    id,
    status: 'suspended',
    email: 'discard',
  });
  assert.deepEqual(attempt, {
    action: 'user.set_status',
    outcome: 'succeeded',
    actorUserId: id,
    targetId: id,
    status: 'suspended',
    reason: undefined,
  });
  assert.equal(
    auditAttempt(
      { ...request, account: { role: 'student', userId: id } },
      'user.delete',
      'succeeded',
    ),
    undefined,
  );
});
