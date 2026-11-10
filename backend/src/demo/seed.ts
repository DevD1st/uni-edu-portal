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

// These IDs mark the original seed and the added cohort. Each marker commits with its fixtures.
const facultyId = '0191e192-67ad-746b-9acb-c850234b408a';
const cohortCourseId = '0191e192-67ad-746b-9acb-c850234b408b';
const audit = new AdminAuditRepository(database);
class DemoSeedError extends Error {}

type DemoAdmin = { id: string; userId: string };
type DemoPlacement = {
  departmentId: string;
  programmeId: string;
  levelId: string;
  semesterId: string;
};
type DemoPolicy = { id: string; max_ca_score: string; max_exam_score: string };
type DemoScope = DemoPlacement & {
  policy: DemoPolicy;
  lecturer: DemoAdmin;
  hod: DemoAdmin;
};
type RegisteredDemoStudent = { id: string; userId: string; termId: string };
type DemoCourse = {
  id?: string;
  code: string;
  name: string;
  units: number;
  state: 'approved' | 'submitted' | 'pending' | 'available';
};

async function seed(
  manager: EntityManager,
  hashedPassword: string,
): Promise<'created' | 'expanded' | 'existing'> {
  await manager.query('SELECT pg_advisory_xact_lock($1)', [1_758_209_032]);
  const [cohort] = await manager.query('SELECT id FROM courses WHERE id = $1', [
    cohortCourseId,
  ]);
  if (cohort) return 'existing';
  const [marker] = await manager.query(
    'SELECT id FROM faculties WHERE id = $1',
    [facultyId],
  );
  const [policy] = await manager.query<DemoPolicy[]>(
    "SELECT id, max_ca_score, max_exam_score FROM grading_policies WHERE status = 'active' FOR SHARE",
  );
  if (!policy)
    throw new DemoSeedError(
      'Run migrations and ensure a grading policy is active.',
    );
  const scope = marker
    ? await readExistingScope(manager, policy)
    : await seedInitialDemo(manager, hashedPassword, policy);

  // Use new offerings for the new students. Existing rosters may already be closed.
  const maya = await enrollInSemester(
    manager,
    scope,
    await createStudent(manager, scope, hashedPassword, 'student-maya'),
  );
  const theo = await enrollInSemester(
    manager,
    scope,
    await createStudent(manager, scope, hashedPassword, 'student-theo'),
  );
  await createStudent(manager, scope, hashedPassword, 'student-nora');
  await seedCourse(
    manager,
    scope,
    {
      id: cohortCourseId,
      code: 'DEMO105',
      name: 'Web Development',
      units: 3,
      state: 'approved',
    },
    [
      { student: maya, percent: 65 },
      { student: theo, percent: 55 },
    ],
  );
  await seedCourse(
    manager,
    scope,
    {
      code: 'DEMO106',
      name: 'Database Fundamentals',
      units: 2,
      state: 'submitted',
    },
    [
      { student: maya, percent: 75 },
      { student: theo, percent: 68 },
    ],
  );
  return marker ? 'expanded' : 'created';
}

async function seedInitialDemo(
  manager: EntityManager,
  hashedPassword: string,
  policy: DemoPolicy,
): Promise<DemoScope> {
  const [level] = await manager.query<{ id: string }[]>(
    "SELECT id FROM academic_levels WHERE program_type = 'undergrad' AND stage = 1 AND status = 'active'",
  );
  if (!level)
    throw new DemoSeedError(
      'Run migrations and ensure the first undergraduate level is active.',
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
  const scope = {
    departmentId,
    programmeId,
    levelId: level.id,
    semesterId,
    policy,
    hod,
    lecturer,
  };
  const student = await enrollInSemester(
    manager,
    scope,
    await createStudent(manager, scope, hashedPassword, 'student'),
  );
  const fixtures: DemoCourse[] = [
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
  ];
  for (const course of fixtures)
    await seedCourse(
      manager,
      scope,
      course,
      course.state === 'available' ? [] : [{ student, percent: 80 }],
    );
  return scope;
}

async function readExistingScope(
  manager: EntityManager,
  policy: DemoPolicy,
): Promise<DemoScope> {
  // The original student's saved placement identifies the demo programme even after a transfer.
  const [placement] = await manager.query<DemoPlacement[]>(
    `SELECT d.id AS "departmentId", p.id AS "programmeId", l.id AS "levelId",
        sem.id AS "semesterId"
      FROM faculties f
      JOIN semesters sem ON sem.id = f.current_semester_id
      JOIN academic_sessions session ON session.id = sem.academic_session_id
      JOIN student_register_semesters t ON t.faculty_id = f.id
      JOIN student_registered_courses e ON e.student_register_semester_id = t.id
      JOIN courses c ON c.id = e.course_id AND c.code = 'DEMO101'
      JOIN departments d ON d.id = t.department_id AND d.faculty_id = f.id
      JOIN courses_of_study p ON p.id = t.course_of_study_id AND p.department_id = d.id
      JOIN academic_levels l ON l.id = t.academic_level_id AND l.program_type = p.program_type
      WHERE f.id = $1 AND f.status = 'active' AND d.status = 'active' AND p.status = 'active'
        AND l.status = 'active' AND l.stage > 0 AND sem.status = 'active' AND session.status = 'active'
        AND sem.max_units >= 5
      ORDER BY e.created_at, e.id LIMIT 1 FOR SHARE OF f, sem, session, d, p, l`,
    [facultyId],
  );
  if (!placement)
    throw new DemoSeedError(
      'The earlier demo needs an active Computing programme and current semester with at least five units to add the new cohort.',
    );
  const hod = await readDemoAdmin(
    manager,
    'hod',
    'approve_result',
    placement.departmentId,
  );
  const lecturer = await readDemoAdmin(
    manager,
    'lecturer',
    'teach_course',
    placement.departmentId,
  );
  return { ...placement, policy, hod, lecturer };
}

async function readDemoAdmin(
  manager: EntityManager,
  label: 'hod' | 'lecturer',
  privilege: 'approve_result' | 'teach_course',
  departmentId: string,
): Promise<DemoAdmin> {
  const [admin] = await manager.query<DemoAdmin[]>(
    `SELECT a.id, u.id AS "userId"
      FROM users u JOIN admins a ON a.user_id = u.id
      JOIN admin_roles g ON g.admin_id = a.id JOIN roles r ON r.id = g.role_id
      WHERE u.email = $1 AND u.role = 'admin' AND u.status = 'active' AND u.deleted_at IS NULL
        AND r.system_key = $2 AND $3 = ANY(r.privileges) AND g.department_id = $4
      LIMIT 1 FOR SHARE OF u, a, g, r`,
    [label + '@demo.example.test', label, privilege, departmentId],
  );
  if (!admin)
    throw new DemoSeedError(
      'Restore the active demo ' +
        label +
        ' assignment before adding the new cohort.',
    );
  return admin;
}

async function createStudent(
  manager: EntityManager,
  { departmentId, programmeId, levelId }: DemoPlacement,
  hashedPassword: string,
  label: string,
): Promise<Student> {
  const userId = await createAccount(manager, hashedPassword, label, 'student');
  const students = manager.getRepository(Student);
  const student = await students.save(
    students.create({
      userId,
      facultyId,
      departmentId,
      courseOfStudyId: programmeId,
      academicLevelId: levelId,
    }),
  );
  await new StudentPlacementService().issueMatriculation(manager, student);
  return student;
}

async function enrollInSemester(
  manager: EntityManager,
  { departmentId, programmeId, levelId, semesterId }: DemoPlacement,
  student: Student,
): Promise<RegisteredDemoStudent> {
  const termId = uuidv7();
  await manager.query(
    `INSERT INTO student_register_semesters
      (id, student_id, semester_id, academic_level_id, course_of_study_id, department_id, faculty_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      termId,
      student.id,
      semesterId,
      levelId,
      programmeId,
      departmentId,
      facultyId,
    ],
  );
  return { id: student.id, userId: student.userId, termId };
}

async function seedCourse(
  manager: EntityManager,
  {
    departmentId,
    programmeId,
    levelId,
    semesterId,
    lecturer,
    hod,
    policy,
  }: DemoScope,
  { id, code, name, units, state }: DemoCourse,
  registrations: readonly { student: RegisteredDemoStudent; percent: number }[],
): Promise<void> {
  const courseId = id ?? uuidv7();
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
      levelId,
      lecturer.id,
      units,
      policy.id,
    ],
  );
  if (state === 'available') return;
  const resultGroupId = uuidv7();
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
  const enrollments = [];
  for (const { student, percent } of registrations) {
    const enrollmentId = uuidv7();
    await manager.query(
      `INSERT INTO student_registered_courses
        (id, student_id, course_id, student_register_semester_id, result_group_id, registered_by_user_id, registered_units)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        enrollmentId,
        student.id,
        courseId,
        student.termId,
        resultGroupId,
        student.userId,
        units,
      ],
    );
    if (state === 'pending') continue;
    const caScore = Number(
      ((Number(policy.max_ca_score) * percent) / 100).toFixed(2),
    );
    const examScore = Number(
      ((Number(policy.max_exam_score) * percent) / 100).toFixed(2),
    );
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
    enrollments.push({ enrollmentId, marks });
  }
  if (state === 'pending') return;
  // All students must be enrolled and marked before the roster is closed and submitted.
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
  if (state === 'submitted') return;
  for (const { enrollmentId, marks } of enrollments) {
    const [grade] = await manager.query<{ id: string }[]>(
      'SELECT id FROM grade_systems WHERE grading_policy_id = $1 AND $2::numeric + $3::numeric BETWEEN min_score AND max_score',
      [policy.id, marks.caScore, marks.examScore],
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
  }
  await manager.query(
    "UPDATE result_groups SET status = 'approved', approved_at = now(), approved_by_admin_id = $2 WHERE id = $1",
    [resultGroupId, hod.id],
  );
  await record('result.approve', hod, resultGroupId, 'submitted', 'approved');
}

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
  if (!password || password.length < 7)
    throw new DemoSeedError(
      'Set DEMO_SEED_PASSWORD to at least 7 characters.',
    );
  const hashedPassword = await hashPassword(password);
  await database.initialize();
  const result = await writeTransaction(database, (manager) =>
    seed(manager, hashedPassword),
  );
  const messages = {
    created: 'Demo data created.',
    expanded: 'Demo data expanded with the new student cohort.',
    existing: 'Demo data already exists; no records were changed.',
  };
  console.log(messages[result]);
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
