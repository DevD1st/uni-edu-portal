import 'reflect-metadata';
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { v7 as uuidv7 } from 'uuid';
import { verifyCourseRegistration } from './course-registration-fixture.mjs';

const enabled = process.env.UEMP_RUN_INTEGRATION === '1';

test(
  'migrations and the account API enforce session, role, audit, and redaction rules',
  { skip: !enabled, timeout: 90_000 },
  async () => {
    assert.equal(process.env.APP_ENV, 'test');
    assert.ok(
      process.env.POSTGRES_DB?.startsWith('uemp_test') ||
        process.env.UEMP_TEST_REDIS_MODULE,
      'Use a disposable uemp_test database',
    );
    const { Test } = await import('@nestjs/testing');
    const { AppModule } = await import('../../dist/app.module.js');
    const { configureApplication } = await import('../../dist/bootstrap.js');
    const { REDIS_CLIENT } = await import(
      '../../dist/core/cache/redis.module.js'
    );
    const { default: database } = await import(
      '../../dist/core/database/ormconfig.js'
    );
    const { hashPassword } = await import('../../dist/shared/auth/password.js');
    const { User } = await import(
      '../../dist/modules/user/entity/users.entity.js'
    );
    const { Admin } = await import(
      '../../dist/modules/admin/entity/admins.entity.js'
    );
    const { AdminRole } = await import(
      '../../dist/modules/admin/entity/admin-roles.entity.js'
    );
    const { Role } = await import(
      '../../dist/modules/admin/entity/roles.entity.js'
    );
    const { Faculty } = await import(
      '../../dist/modules/academic-reference/entity/faculties.entity.js'
    );
    const { Department } = await import(
      '../../dist/modules/academic-reference/entity/departments.entity.js'
    );
    const { CourseOfStudy } = await import(
      '../../dist/modules/academic-reference/entity/courses-of-study.entity.js'
    );
    await database.initialize();
    let app;
    try {
      await database.runMigrations();
      const suffix = randomUUID();
      const password = 'Test account password 2026';
      const studentEmail = 'student-' + suffix + '@example.test';
      const adminEmail = 'admin-' + suffix + '@example.test';
      const superRole = await database
        .getRepository(Role)
        .findOneByOrFail({ systemKey: 'super_admin' });
      const credentials = await database.getRepository(User).save(
        new UserWithFields(User, {
          email: adminEmail,
          role: 'admin',
          hashedPassword: await hashPassword(password),
        }),
      );
      const admin = await database
        .getRepository(Admin)
        .save(new UserWithFields(Admin, { userId: credentials.id }));
      await database.getRepository(AdminRole).save(
        new UserWithFields(AdminRole, {
          adminId: admin.id,
          roleId: superRole.id,
        }),
      );
      const faculty = await database
        .getRepository(Faculty)
        .save(new UserWithFields(Faculty, { name: 'Faculty ' + suffix }));
      const department = await database.getRepository(Department).save(
        new UserWithFields(Department, {
          name: 'Computing',
          facultyId: faculty.id,
        }),
      );
      const programme = await database.getRepository(CourseOfStudy).save(
        new UserWithFields(CourseOfStudy, {
          name: 'Computer Science',
          programType: 'undergrad',
          departmentId: department.id,
        }),
      );

      const builder = Test.createTestingModule({ imports: [AppModule] });
      if (process.env.UEMP_TEST_REDIS_MODULE) {
        const { default: MockRedis } = await import(
          pathToFileURL(process.env.UEMP_TEST_REDIS_MODULE).href
        );
        builder.overrideProvider(REDIS_CLIENT).useValue(new MockRedis());
      }
      const module = await builder.compile();
      app = module.createNestApplication();
      process.env.SWAGGER_USER = 'documentation-test';
      process.env.SWAGGER_PASSWORD = 'synthetic-documentation-password';
      await configureApplication(app);
      await app.listen(0, '127.0.0.1');
      const url = await app.getUrl();

      async function request(method, path, status, body, token) {
        const response = await fetch(url + path, {
          method,
          headers: {
            ...(body === undefined
              ? {}
              : { 'content-type': 'application/json' }),
            ...(token ? { authorization: 'Bearer ' + token } : {}),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
        const payload =
          response.status === 204 ? undefined : await response.json();
        assert.equal(
          response.status,
          status,
          method + ' ' + path + ' ' + JSON.stringify(payload),
        );
        assert.ok(response.headers.get('x-request-id'));
        return payload;
      }

      await checkOpenApi(url);
      const invalidSignIn = await request('POST', '/v1/auth/sign-in', 400, {
        email: 'not-an-email',
        password,
        role: 'invalid-role',
        unrecognizedField: true,
      });
      assert.deepEqual(
        new Set(invalidSignIn.errors),
        new Set([
          'The request includes a field this endpoint does not accept.',
          'Enter a valid email address.',
          'Choose either student or admin as the account type.',
        ]),
      );
      assert.equal(typeof invalidSignIn.message, 'string');
      assert.ok(invalidSignIn.requestId);
      const malformed = await fetch(url + '/v1/auth/sign-in', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{ "email": sample-value }',
      });
      assert.equal(malformed.status, 400);
      assert.equal(
        (await malformed.json()).message,
        'Check the request format and try again.',
      );

      const reference = await request('GET', '/v1/academic-references', 200);
      const level = reference.levels.find(
        (item) => item.programType === 'undergrad' && item.stage === 1,
      );
      assert.equal(level.displayName, '100 Level');
      assert.ok(
        reference.levels.some(
          (item) => item.selectionLabel === 'Undergraduate · Graduate',
        ),
      );
      const student = await request('POST', '/v1/auth/signup/student', 201, {
        email: studentEmail,
        password,
        firstName: 'Synthetic',
        lastName: 'Student',
        courseOfStudyId: programme.id,
        academicLevelId: level.id,
      });
      assert.match(student.student.matricNumber, /^\d{2}(\/\d+){4}$/);
      assert.equal(student.hashedPassword, undefined);
      const duplicateAccount = await request(
        'POST',
        '/v1/auth/signup/student',
        409,
        {
          email: studentEmail,
          password,
        },
      );
      assert.equal(
        duplicateAccount.message,
        'This email already has an account of that type.',
      );
      const signIn = (email, role) =>
        request('POST', '/v1/auth/sign-in', 200, { email, password, role });
      const initial = await signIn(studentEmail, 'student');
      const rotate = () =>
        fetch(url + '/v1/auth/refresh', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ refreshToken: initial.refresh.token }),
        });
      const rotations = await Promise.all([rotate(), rotate()]);
      assert.deepEqual(
        rotations.map(({ status }) => status).sort(),
        [200, 401],
      );
      const rotated = await rotations
        .find(({ status }) => status === 200)
        .json();
      await request('POST', '/v1/auth/refresh', 401, {
        refreshToken: initial.refresh.token,
      });
      await request(
        'GET',
        '/v1/users/me',
        401,
        undefined,
        initial.access.token,
      );
      assert.equal(
        (
          await request(
            'GET',
            '/v1/users/me',
            200,
            undefined,
            rotated.access.token,
          )
        ).id,
        student.id,
      );
      await request(
        'GET',
        '/v1/admin/users',
        403,
        undefined,
        rotated.access.token,
      );

      const staff = await signIn(adminEmail, 'admin');
      const staffToken = staff.access.token;
      const invalidPath = await request(
        'GET',
        '/v1/admin/users/invalid-id',
        400,
        undefined,
        staffToken,
      );
      assert.equal(invalidPath.message, 'Account ID must be a valid UUID.');
      const invalidQuery = await request(
        'GET',
        '/v1/admin/users?limit=101',
        400,
        undefined,
        staffToken,
      );
      assert.equal(invalidQuery.message, 'Page size must be 100 or fewer.');
      const newRole = await request(
        'POST',
        '/v1/admin/roles',
        201,
        { name: 'ict-manager-' + suffix, privileges: ['read_user'] },
        staffToken,
      );
      const duplicateRole = await request(
        'POST',
        '/v1/admin/roles',
        409,
        { name: newRole.name, privileges: ['read_user'] },
        staffToken,
      );
      assert.equal(
        duplicateRole.message,
        'A role with this name already exists.',
      );
      const delegate = await request(
        'POST',
        '/v1/admin/admins',
        201,
        {
          email: 'staff-' + suffix + '@example.test',
          password,
          roleId: newRole.id,
          departmentId: department.id,
        },
        staffToken,
      );
      assert.equal(delegate.grant.name, newRole.name);
      const duplicateGrant = await request(
        'POST',
        '/v1/admin/admins/' + delegate.id + '/roles',
        409,
        { roleId: newRole.id, departmentId: department.id },
        staffToken,
      );
      assert.equal(
        duplicateGrant.message,
        'This administrator already has this role in the selected department.',
      );
      const staffList = await request(
        'GET',
        '/v1/admin/admins?populate=roles%20user',
        200,
        undefined,
        staffToken,
      );
      assert.ok(
        staffList.items.some(
          ({ id, roles }) => id === delegate.id && roles.length === 1,
        ),
      );
      const populatedAdmin = staffList.items.find(
        ({ id }) => id === delegate.id,
      );
      assert.equal(populatedAdmin.user.hashedPassword, undefined);
      assert.equal(populatedAdmin.roles[0].role.name, newRole.name);
      const delegateTokens = await signIn(
        'staff-' + suffix + '@example.test',
        'admin',
      );
      const delegateToken = delegateTokens.access.token;
      const directory = await request(
        'GET',
        '/v1/admin/users?populate=student',
        200,
        undefined,
        delegateToken,
      );
      assert.ok(directory.items.some((item) => item.id === student.id));
      assert.ok(
        directory.items.every(
          (item) =>
            item.role === 'student' &&
            item.student.departmentId === department.id,
        ),
      );
      await request(
        'PATCH',
        '/v1/admin/users/' + student.id + '/status',
        403,
        { status: 'suspended' },
        delegateToken,
      );
      await request(
        'PATCH',
        '/v1/admin/users/' + student.id + '/status',
        200,
        { status: 'suspended' },
        staffToken,
      );
      await request(
        'GET',
        '/v1/users/me',
        401,
        undefined,
        rotated.access.token,
      );
      await request(
        'PATCH',
        '/v1/admin/users/' + student.id + '/status',
        200,
        { status: 'active' },
        staffToken,
      );
      const restored = await signIn(studentEmail, 'student');
      const enrollmentId = await recordApprovedEnrollment(database, {
        studentId: student.student.id,
        userId: student.id,
        facultyId: faculty.id,
        departmentId: department.id,
        programmeId: programme.id,
        levelId: level.id,
        adminId: admin.id,
      });

      await request(
        'DELETE',
        '/v1/admin/users/' + student.id,
        204,
        undefined,
        staffToken,
      );
      await request(
        'GET',
        '/v1/users/me',
        401,
        undefined,
        restored.access.token,
      );
      const [redacted] = await database.query(
        'SELECT email, first_name, last_name, hashed_password, deleted_at FROM users WHERE id = $1',
        [student.id],
      );
      assert.match(redacted.email, /^deleted-.*@redacted\.invalid$/);
      assert.equal(redacted.first_name, null);
      assert.equal(redacted.last_name, null);
      assert.equal(redacted.hashed_password, null);
      assert.ok(redacted.deleted_at);
      assert.equal(
        (
          await database.query(
            'SELECT id FROM matric_num_systems WHERE student_id = $1',
            [student.student.id],
          )
        ).length,
        0,
      );
      assert.equal(
        (
          await database.query(
            'SELECT id FROM student_registered_courses WHERE id = $1',
            [enrollmentId],
          )
        ).length,
        1,
      );
      const replacement = await request(
        'POST',
        '/v1/auth/signup/student',
        201,
        { email: studentEmail, password },
      );
      assert.notEqual(replacement.id, student.id);
      const replacementTokens = await signIn(studentEmail, 'student');
      await request(
        'POST',
        '/v1/auth/sign-out',
        204,
        undefined,
        replacementTokens.access.token,
      );
      await request(
        'GET',
        '/v1/users/me',
        401,
        undefined,
        replacementTokens.access.token,
      );
      await request('POST', '/v1/auth/refresh', 401, {
        refreshToken: replacementTokens.refresh.token,
      });

      const audit = await request(
        'GET',
        '/v1/admin/audit-events?targetId=' + student.id + '&limit=2',
        200,
        undefined,
        staffToken,
      );
      assert.equal(audit.items.length, 2);
      assert.ok(audit.nextCursor);
      const more = await request(
        'GET',
        '/v1/admin/audit-events?targetId=' +
          student.id +
          '&cursor=' +
          audit.nextCursor,
        200,
        undefined,
        staffToken,
      );
      assert.ok(more.items.some((item) => item.outcome === 'denied'));
      assert.ok(audit.items.every((item) => item.requestId));
      assert.ok(
        !JSON.stringify([...audit.items, ...more.items]).includes(studentEmail),
      );
      await assert.rejects(
        database.query(
          'UPDATE admin_audit_events SET reason = $1 WHERE id = $2',
          ['tampered', audit.items[0].id],
        ),
        /append-only/,
      );
      await request(
        'DELETE',
        '/v1/admin/admins/' + delegate.id + '/roles/' + delegate.grant.id,
        204,
        undefined,
        staffToken,
      );
      await request('GET', '/v1/admin/users', 403, undefined, delegateToken);
      await verifyCourseRegistration({
        request,
        url,
        staffToken,
        password,
        suffix,
        level,
        database,
      });
    } finally {
      if (app) await app.close();
      if (database.isInitialized) await database.destroy();
    }
  },
);

function UserWithFields(Entity, fields) {
  return Object.assign(new Entity(), fields);
}

async function checkOpenApi(url) {
  const unauthenticated = await fetch(url + '/docs-json');
  assert.equal(unauthenticated.status, 401);
  assert.match(unauthenticated.headers.get('www-authenticate'), /Basic/);
  assert.equal(
    (await unauthenticated.json()).message,
    'Enter your API documentation username and password.',
  );
  const credentials = Buffer.from(
    process.env.SWAGGER_USER + ':' + process.env.SWAGGER_PASSWORD,
  ).toString('base64');
  const response = await fetch(url + '/docs-json', {
    headers: { authorization: 'Basic ' + credentials },
  });
  assert.equal(response.status, 200);
  const document = await response.json();
  for (const [path, methods] of Object.entries(document.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      const label = method.toUpperCase() + ' ' + path;
      const success = Object.keys(operation.responses).find((status) =>
        /^2/.test(status),
      );
      assert.ok(success, label);
      if (path.endsWith('/summary/download')) {
        assert.equal(
          operation.responses[success].content['text/plain'].schema.type,
          'string',
          label,
        );
      } else if (success !== '204') {
        assert.ok(
          operation.responses[success].content['application/json'].schema.$ref,
          label,
        );
      }
      assert.equal(
        operation.responses.default.content['application/json'].schema.$ref,
        '#/components/schemas/ErrorResponseDto',
        label,
      );
      for (const parameter of operation.parameters ?? []) {
        assert.ok(
          parameter.description || parameter.schema.description,
          label + ' ' + parameter.name,
        );
        assert.ok(
          'example' in parameter || 'example' in parameter.schema,
          label + ' ' + parameter.name,
        );
      }
    }
  }
  for (const [schemaName, schema] of Object.entries(
    document.components.schemas,
  )) {
    for (const [property, definition] of Object.entries(
      schema.properties ?? {},
    )) {
      assert.ok(definition.description, schemaName + '.' + property);
      assert.ok('example' in definition, schemaName + '.' + property);
    }
  }
}

async function recordApprovedEnrollment(database, placement) {
  const {
    studentId,
    userId,
    facultyId,
    departmentId,
    programmeId,
    levelId,
    adminId,
  } = placement;
  const [session] = await database.query(
    'INSERT INTO academic_sessions (id, start_year, end_year) VALUES ($1, 2026, 2027) ON CONFLICT (start_year, end_year) DO UPDATE SET status = academic_sessions.status RETURNING id',
    [uuidv7()],
  );
  const [semester] = await database.query(
    "INSERT INTO semesters (id, academic_session_id, term_number, name, max_units) VALUES ($1, $2, 1, 'First Semester', 24) ON CONFLICT (academic_session_id, term_number) DO UPDATE SET name = semesters.name RETURNING id",
    [uuidv7(), session.id],
  );
  const [policy] = await database.query(
    "SELECT id FROM grading_policies WHERE status = 'active'",
  );
  const [band] = await database.query(
    "SELECT id FROM grade_systems WHERE grading_policy_id = $1 AND grade = 'A'",
    [policy.id],
  );
  const courseId = uuidv7();
  const offeringId = uuidv7();
  const termId = uuidv7();
  const groupId = uuidv7();
  const enrollmentId = uuidv7();
  await database.query(
    'INSERT INTO courses (id, name, code, units) VALUES ($1, $2, $3, 3)',
    [courseId, 'Test Course', courseId.toUpperCase()],
  );
  await database.query(
    'INSERT INTO course_offerings (id, course_id, department_id, semester_id, academic_level_id, lecturer_id, units, grading_policy_id) VALUES ($1, $2, $3, $4, $5, $6, 3, $7)',
    [
      offeringId,
      courseId,
      departmentId,
      semester.id,
      levelId,
      adminId,
      policy.id,
    ],
  );
  await database.query(
    'INSERT INTO student_register_semesters (id, student_id, semester_id, academic_level_id, course_of_study_id, department_id, faculty_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [
      termId,
      studentId,
      semester.id,
      levelId,
      programmeId,
      departmentId,
      facultyId,
    ],
  );
  await assert.rejects(
    database.query(
      "INSERT INTO result_groups (id, course_offering_id, lecturer_id, registration_status, registration_closed_at, registration_closed_by_admin_id, status, submitted_at, submitted_by_admin_id, approved_at, approved_by_admin_id) VALUES ($1, $2, $3, 'closed', now(), $3, 'approved', now(), $3, now(), $3)",
      [groupId, offeringId, adminId],
    ),
    /New result groups must start pending with registration open/,
  );
  await database.query(
    'INSERT INTO result_groups (id, course_offering_id, lecturer_id) VALUES ($1, $2, $3)',
    [groupId, offeringId, adminId],
  );
  const enrollmentValues = [
    enrollmentId,
    studentId,
    courseId,
    termId,
    groupId,
    userId,
  ];
  await assert.rejects(
    database.query(
      'INSERT INTO student_registered_courses (id, student_id, course_id, student_register_semester_id, result_group_id, registered_by_user_id, registered_units, ca_score, exam_score, awarded_grade_system_id) VALUES ($1, $2, $3, $4, $5, $6, 3, 25, 55, $7)',
      [...enrollmentValues, band.id],
    ),
    /New enrollments cannot have an awarded grade/,
  );
  const enrollment =
    'INSERT INTO student_registered_courses (id, student_id, course_id, student_register_semester_id, result_group_id, registered_by_user_id, registered_units, ca_score, exam_score) VALUES ($1, $2, $3, $4, $5, $6, 3, 25, 55)';
  await database.query(enrollment, enrollmentValues);
  await database.query(
    "UPDATE result_groups SET registration_status = 'closed', registration_closed_at = now(), registration_closed_by_admin_id = $2 WHERE id = $1",
    [groupId, adminId],
  );
  await assert.rejects(
    database.query(enrollment, [
      uuidv7(),
      studentId,
      courseId,
      termId,
      groupId,
      userId,
    ]),
    /Registration is closed/,
  );
  await database.query(
    "UPDATE result_groups SET status = 'submitted', submitted_at = now(), submitted_by_admin_id = $2 WHERE id = $1",
    [groupId, adminId],
  );
  await database.transaction(async (manager) => {
    await manager.query(
      'UPDATE student_registered_courses SET awarded_grade_system_id = $2 WHERE id = $1',
      [enrollmentId, band.id],
    );
    await manager.query(
      "UPDATE result_groups SET status = 'approved', approved_at = now(), approved_by_admin_id = $2 WHERE id = $1",
      [groupId, adminId],
    );
  });
  const [group] = await database.query(
    'SELECT status, submitted_by_admin_id, approved_by_admin_id FROM result_groups WHERE id = $1',
    [groupId],
  );
  assert.equal(group.status, 'approved');
  assert.equal(group.submitted_by_admin_id, group.approved_by_admin_id);
  return enrollmentId;
}
