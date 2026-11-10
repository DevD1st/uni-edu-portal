import database from '#core/database/ormconfig.js';
import { environment } from '#core/config/env.js';
import { writeTransaction } from '#core/database/database-write.js';
import { ApplicationError } from '#core/http/application-error.js';
import { ADMIN_AUDIT_ACTIONS } from '#shared/admin-authorization/audit.contracts.js';
import type { AuditAction } from '#shared/admin-authorization/audit.contracts.js';
import { hashPassword } from '#shared/auth/password.js';
import { AdminAuditRepository } from '#modules/admin/repositories/admin-audit.repository.js';
import { StudentPlacementService } from '#modules/user/services/student-placement.service.js';
import { Student } from '#modules/student/entity/students.entity.js';
import type { EntityManager } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

// A fixed faculty ID marks a completed seed. It is committed along with every demo row.
const facultyId = '0191e192-67ad-746b-9acb-c850234b408a';
const audit = new AdminAuditRepository(database);
class DemoSeedError extends Error {}

async function seed(
  manager: EntityManager,
  hashedPassword: string,
): Promise<boolean> {
  await manager.query('SELECT pg_advisory_xact_lock($1)', [1_758_209_032]);
  const [marker] = await manager.query(
    'SELECT id FROM faculties WHERE id = $1',
    [facultyId],
  );
  if (marker) return false;

  const [level] = await manager.query<{ id: string }[]>(
    "SELECT id FROM academic_levels WHERE program_type = 'undergrad' AND stage = 1 AND status = 'active'",
  );
  const [policy] = await manager.query<
    { id: string; max_ca_score: string; max_exam_score: string }[]
  >(
    "SELECT id, max_ca_score, max_exam_score FROM grading_policies WHERE status = 'active'",
  );
  if (!level || !policy)
    throw new DemoSeedError(
      'Run migrations and ensure the undergraduate level and grading policy are active.',
    );

  // Choose the first unused start year so a disposable database can also contain test fixtures.
  const [sessionYear] = await manager.query<{ year: number }[]>(
    `SELECT year FROM generate_series($1::int, $1::int + 9) AS year
      WHERE NOT EXISTS (SELECT 1 FROM academic_sessions s WHERE s.start_year = year)
      ORDER BY year LIMIT 1`,
    [new Date().getUTCFullYear()],
  );
  if (!sessionYear)
    throw new DemoSeedError(
      'No unused academic session is available for the demo.',
    );
  const sessionId = uuidv7();
  const semesterId = uuidv7();
  const departmentId = uuidv7();
  const programmeId = uuidv7();
  await manager.query(
    "INSERT INTO academic_sessions (id, start_year, end_year, status) VALUES ($1, $2, $3, 'active')",
    [sessionId, sessionYear.year, sessionYear.year + 1],
  );
  await manager.query(
    "INSERT INTO semesters (id, academic_session_id, term_number, name, max_units, status) VALUES ($1, $2, 1, 'First Semester', 24, 'active')",
    [semesterId, sessionId],
  );
  await manager.query(
    "INSERT INTO faculties (id, name, current_semester_id) VALUES ($1, 'Demo Faculty of Science', $2)",
    [facultyId, semesterId],
  );
  await manager.query(
    "INSERT INTO departments (id, faculty_id, name) VALUES ($1, $2, 'Demo Computing')",
    [departmentId, facultyId],
  );
  await manager.query(
    "INSERT INTO courses_of_study (id, department_id, name, program_type) VALUES ($1, $2, 'Demo Computer Science', 'undergrad')",
    [programmeId, departmentId],
  );

  const superAdmin = await createAdmin(
    manager,
    hashedPassword,
    'super-admin',
    'super_admin',
    null,
    null,
  );
  const hod = await createAdmin(
    manager,
    hashedPassword,
    'hod',
    'hod',
    departmentId,
    superAdmin.id,
  );
  const lecturer = await createAdmin(
    manager,
    hashedPassword,
    'lecturer',
    'lecturer',
    departmentId,
    hod.id,
  );
  const studentUserId = await createAccount(
    manager,
    hashedPassword,
    'student',
    'student',
  );
  const students = manager.getRepository(Student);
  const student = await students.save(
    students.create({
      userId: studentUserId,
      facultyId,
      departmentId,
      courseOfStudyId: programmeId,
      academicLevelId: level.id,
    }),
  );
  await new StudentPlacementService().issueMatriculation(manager, student);
  const termId = uuidv7();
  await manager.query(
    `INSERT INTO student_register_semesters
      (id, student_id, semester_id, academic_level_id, course_of_study_id, department_id, faculty_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      termId,
      student.id,
      semesterId,
      level.id,
      programmeId,
      departmentId,
      facultyId,
    ],
  );

  const fixtures = [
    {
      code: 'DEMO101',
      name: 'Introduction to Computing',
      units: 3,
      state: 'approved',
    },
    {
      code: 'DEMO102',
      name: 'Programming Fundamentals',
      units: 3,
      state: 'submitted',
    },
    {
      code: 'DEMO103',
      name: 'Discrete Mathematics',
      units: 2,
      state: 'pending',
    },
    { code: 'DEMO104', name: 'Data and Society', units: 2, state: 'available' },
  ] as const;
  for (const { code, name, units, state } of fixtures) {
    const courseId = uuidv7();
    const offeringId = uuidv7();
    await manager.query(
      'INSERT INTO courses (id, code, name, units) VALUES ($1, $2, $3, $4)',
      [courseId, code, name, units],
    );
    await manager.query(
      'INSERT INTO course_of_study_courses (id, course_of_study_id, course_id) VALUES ($1, $2, $3)',
      [uuidv7(), programmeId, courseId],
    );
    await manager.query(
      `INSERT INTO course_offerings
        (id, course_id, department_id, semester_id, academic_level_id, lecturer_id, units, grading_policy_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')`,
      [
        offeringId,
        courseId,
        departmentId,
        semesterId,
        level.id,
        lecturer.id,
        units,
        policy.id,
      ],
    );
    if (state === 'available') continue;
    const resultGroupId = uuidv7();
    const enrollmentId = uuidv7();
    const metadata = { departmentId, offeringId, resultGroupId };
    const record = (
      action: AuditAction,
      actor: DemoAdmin,
      targetId: string,
      before: unknown,
      after: unknown,
    ) =>
      audit.appendInTransaction(manager, [
        {
          ...ADMIN_AUDIT_ACTIONS[action],
          action,
          outcome: 'succeeded',
          actorUserId: actor.userId,
          actorAdminId: actor.id,
          targetId,
          changes: { before, after },
          metadata,
        },
      ]);
    await manager.query(
      'INSERT INTO result_groups (id, course_offering_id, lecturer_id) VALUES ($1, $2, $3)',
      [resultGroupId, offeringId, lecturer.id],
    );
    await manager.query(
      `INSERT INTO student_registered_courses
        (id, student_id, course_id, student_register_semester_id, result_group_id, registered_by_user_id, registered_units)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        enrollmentId,
        student.id,
        courseId,
        termId,
        resultGroupId,
        studentUserId,
        units,
      ],
    );
    if (state === 'pending') continue;

    // Even fixtures follow the normal order: enter marks, close, submit, award, approve.
    const caScore = Number((Number(policy.max_ca_score) * 0.8).toFixed(2));
    const examScore = Number((Number(policy.max_exam_score) * 0.8).toFixed(2));
    const marks = { caScore, examScore, awardedGradeSystemId: null };
    await manager.query(
      'UPDATE student_registered_courses SET ca_score = $2, exam_score = $3 WHERE id = $1',
      [enrollmentId, caScore, examScore],
    );
    await record(
      'result.marks.save',
      lecturer,
      enrollmentId,
      { caScore: null, examScore: null, awardedGradeSystemId: null },
      marks,
    );
    await manager.query(
      `UPDATE result_groups SET registration_status = 'closed', registration_closed_at = now(),
        registration_closed_by_admin_id = $2, status = 'submitted', submitted_at = now(), submitted_by_admin_id = $2
        WHERE id = $1`,
      [resultGroupId, lecturer.id],
    );
    await record(
      'registration.close_roster',
      lecturer,
      resultGroupId,
      'opened',
      'closed',
    );
    await record(
      'result.submit',
      lecturer,
      resultGroupId,
      'pending',
      'submitted',
    );
    if (state === 'submitted') continue;
    const [grade] = await manager.query<{ id: string }[]>(
      'SELECT id FROM grade_systems WHERE grading_policy_id = $1 AND $2::numeric + $3::numeric BETWEEN min_score AND max_score',
      [policy.id, caScore, examScore],
    );
    if (!grade)
      throw new DemoSeedError(
        'The active policy is missing a grade band for the demo marks.',
      );
    await manager.query(
      'UPDATE student_registered_courses SET awarded_grade_system_id = $2 WHERE id = $1',
      [enrollmentId, grade.id],
    );
    await record('result.grade.award', hod, enrollmentId, marks, {
      ...marks,
      awardedGradeSystemId: grade.id,
    });
    await manager.query(
      "UPDATE result_groups SET status = 'approved', approved_at = now(), approved_by_admin_id = $2 WHERE id = $1",
      [resultGroupId, hod.id],
    );
    await record('result.approve', hod, resultGroupId, 'submitted', 'approved');
  }
  return true;
}

type DemoAdmin = { id: string; userId: string };

async function createAccount(
  manager: EntityManager,
  hashedPassword: string,
  label: string,
  role: 'student' | 'admin',
): Promise<string> {
  const id = uuidv7();
  await manager.query(
    "INSERT INTO users (id, email, role, hashed_password, first_name, last_name) VALUES ($1, $2, $3, $4, 'Demo', $5)",
    [id, label + '@demo.example.test', role, hashedPassword, label],
  );
  return id;
}

async function createAdmin(
  manager: EntityManager,
  hashedPassword: string,
  label: string,
  systemKey: 'super_admin' | 'hod' | 'lecturer',
  departmentId: string | null,
  assignedBy: string | null,
): Promise<DemoAdmin> {
  const userId = await createAccount(manager, hashedPassword, label, 'admin');
  const id = uuidv7();
  await manager.query(
    'INSERT INTO admins (id, user_id, created_by_admin_id) VALUES ($1, $2, $3)',
    [id, userId, assignedBy],
  );
  const [role] = await manager.query<{ id: string }[]>(
    'SELECT id FROM roles WHERE system_key = $1',
    [systemKey],
  );
  if (!role)
    throw new DemoSeedError(
      'Run migrations to install the system roles before seeding.',
    );
  await manager.query(
    'INSERT INTO admin_roles (id, admin_id, role_id, department_id, assigned_by_admin_id) VALUES ($1, $2, $3, $4, $5)',
    [uuidv7(), id, role.id, departmentId, assignedBy],
  );
  return { id, userId };
}

try {
  if (
    environment() === 'production' ||
    !/^uemp_(demo|test)(?:_|$)/.test(String(database.options.database))
  )
    throw new DemoSeedError(
      'Use a non-production demo or test database named uemp_demo or uemp_test (suffixes allowed).',
    );
  const password = process.env.DEMO_SEED_PASSWORD;
  if (!password || password.length < 12)
    throw new DemoSeedError(
      'Set DEMO_SEED_PASSWORD to at least 12 characters.',
    );
  const hashedPassword = await hashPassword(password);
  await database.initialize();
  const created = await writeTransaction(database, (manager) =>
    seed(manager, hashedPassword),
  );
  console.log(
    created
      ? 'Demo data created.'
      : 'Demo data already exists; no records were changed.',
  );
} catch (error: unknown) {
  // Only print messages from our validation or mapped application errors.
  console.error(
    'Demo seed failed. ' +
      (error instanceof ApplicationError || error instanceof DemoSeedError
        ? error.message
        : 'Check the database connection and confirm migrations are applied.'),
  );
  process.exitCode = 1;
} finally {
  if (database.isInitialized) await database.destroy();
}
