import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const seedPath = fileURLToPath(
  new URL('../../dist/demo/seed.js', import.meta.url),
);

export async function verifyDemoSeed(request, database) {
  const password = 'Demo fixture password 2026';
  const seed = (env) =>
    run(process.execPath, [seedPath], {
      env: { ...process.env, DEMO_SEED_PASSWORD: password, ...env },
      timeout: 20_000,
    });
  await assert.rejects(seed({ APP_ENV: 'production' }), (error) =>
    /Use a non-production demo or test database/.test(error.stderr),
  );
  const [marker] = await database.query(
    `SELECT EXISTS (SELECT 1 FROM faculties WHERE id = '0191e192-67ad-746b-9acb-c850234b408a') AS initial,
      EXISTS (SELECT 1 FROM courses WHERE id = '0191e192-67ad-746b-9acb-c850234b408b') AS cohort`,
  );
  const [first, second] = await Promise.all([seed(), seed()]);
  assert.deepEqual([first.stdout.trim(), second.stdout.trim()].sort(), [
    'Demo data already exists; no records were changed.',
    marker.cohort
      ? 'Demo data already exists; no records were changed.'
      : marker.initial
        ? 'Demo data expanded with the new student cohort.'
        : 'Demo data created.',
  ]);
  const [{ count }] = await database.query(
    "SELECT count(*)::int AS count FROM users WHERE email LIKE '%@demo.example.test'",
  );
  assert.equal(count, 7);
  const signIn = async (label, role) =>
    (
      await request('POST', '/v1/auth/sign-in', 200, {
        email: label + '@demo.example.test',
        password,
        role,
      })
    ).access.token;
  const [student, lecturer, hod, superAdmin, maya, theo, nora] =
    await Promise.all([
      signIn('student', 'student'),
      signIn('lecturer', 'admin'),
      signIn('hod', 'admin'),
      signIn('super-admin', 'admin'),
      signIn('student-maya', 'student'),
      signIn('student-theo', 'student'),
      signIn('student-nora', 'student'),
    ]);
  const get = (path, token, status = 200) =>
    request('GET', path, status, undefined, token);
  const { terms } = await get('/v1/student/results', student);
  assert.equal(terms.length, 1);
  const termId = terms[0].semesterId;
  const statement = await get('/v1/student/results/' + termId, student);
  assert.deepEqual(
    statement.courses.map(({ code }) => code),
    ['DEMO101'],
  );
  const available = await get('/v1/student/registrations/available', student);
  assert.ok(available.courses.some(({ code }) => code === 'DEMO104'));
  for (const [token, grade] of [
    [maya, 'B'],
    [theo, 'C'],
  ]) {
    const registration = await get(
      '/v1/student/registrations/' + termId,
      token,
    );
    assert.equal(registration.totalUnits, 5);
    assert.ok(registration.matricNumber);
    assert.deepEqual(
      registration.courses.map(({ code }) => code),
      ['DEMO105', 'DEMO106'],
    );
    const published = await get('/v1/student/results/' + termId, token);
    assert.deepEqual(
      published.courses.map(({ code, grade }) => [code, grade]),
      [['DEMO105', grade]],
    );
  }
  assert.deepEqual((await get('/v1/student/results', nora)).terms, []);
  const noraAvailable = await get('/v1/student/registrations/available', nora);
  assert.ok(noraAvailable.courses.some(({ code }) => code === 'DEMO104'));
  const assigned = await get(
    '/v1/lecturer/results?semesterId=' + termId,
    lecturer,
  );
  assert.deepEqual(assigned.items.map(({ status }) => status).sort(), [
    'approved',
    'approved',
    'pending',
    'submitted',
    'submitted',
  ]);
  const { departmentId } = assigned.items[0];
  const scoped =
    '/v1/admin/reports/overview?semesterId=' +
    termId +
    '&departmentId=' +
    departmentId;
  const overview = await get(scoped, hod);
  assert.equal(overview.offeringCount, 6);
  assert.equal(overview.studentCount, 3);
  assert.equal(overview.enrollmentCount, 7);
  assert.equal(overview.submittedCount, 2);
  assert.equal(overview.publishedCount, 3);
  assert.equal(overview.averageScore, 66.67);
  await get(scoped, lecturer, 403);
  await get('/v1/admin/reports/overview?semesterId=' + termId, hod, 403);
  assert.equal(
    (await get('/v1/admin/reports/overview?semesterId=' + termId, superAdmin))
      .offeringCount,
    6,
  );
  const queue = await get(
    '/v1/admin/results?departmentId=' + departmentId,
    hod,
  );
  assert.deepEqual(queue.items.map(({ code }) => code).sort(), [
    'DEMO102',
    'DEMO106',
  ]);
}
