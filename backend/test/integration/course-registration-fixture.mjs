import assert from 'node:assert/strict';
import { verifyResultsWorkflow } from './results-workflow-fixture.mjs';

export async function verifyCourseRegistration({
  request,
  url,
  staffToken,
  password,
  suffix,
  level,
  database,
}) {
  const academic = '/v1/admin/academic';
  const courses = '/v1/admin/courses';
  const registrations = '/v1/student/registrations';
  const adminRegistrations = '/v1/admin/registrations';
  const post = (path, data, token = staffToken, status = 201) =>
    request('POST', path, status, data, token);
  const get = (path, token = staffToken, status = 200) =>
    request('GET', path, status, undefined, token);
  const signIn = async (email, role) =>
    (await request('POST', '/v1/auth/sign-in', 200, { email, password, role }))
      .access.token;

  const setup = await get(academic);
  const year =
    Math.max(2030, ...setup.sessions.map(({ endYear }) => endYear)) + 1;
  const session = await post(academic + '/sessions', {
    startYear: year,
    endYear: year + 1,
    status: 'active',
  });
  const faculty = await post(academic + '/faculties', {
    name: 'Registration Faculty ' + suffix,
  });
  assert.equal(faculty.currentSemesterId, null);
  const termInput = {
    academicSessionId: session.id,
    termNumber: 1,
    name: 'First Semester',
    maxUnits: 4,
  };
  const term = await post(academic + '/semesters', termInput);
  const setCurrent = (status) =>
    request(
      'PUT',
      academic + '/faculties/' + faculty.id + '/current-semester',
      status,
      { semesterId: term.id },
      staffToken,
    );
  await setCurrent(400);
  await request(
    'PUT',
    academic + '/semesters/' + term.id,
    200,
    { ...termInput, status: 'active' },
    staffToken,
  );
  assert.equal((await setCurrent(200)).currentSemesterId, term.id);

  const first = await post(academic + '/departments', {
    facultyId: faculty.id,
    name: 'Computing',
  });
  const second = await post(academic + '/departments', {
    facultyId: faculty.id,
    name: 'Mathematics',
  });
  const roles = await get('/v1/admin/roles');
  const hodRole = roles.items.find(({ systemKey }) => systemKey === 'hod');
  const hodEmail = 'registration-hod-' + suffix + '@example.test';
  const hodAccount = await post('/v1/admin/admins', {
    email: hodEmail,
    password,
    roleId: hodRole.id,
    departmentId: first.id,
  });
  const hod = await signIn(hodEmail, 'admin');

  const programme = (departmentId, name, token = staffToken, status = 201) =>
    post(
      academic + '/programmes',
      { departmentId, name, programType: 'undergrad' },
      token,
      status,
    );
  const computing = await programme(first.id, 'Computer Science', hod);
  const mathematics = await programme(second.id, 'Mathematics');
  await programme(second.id, 'Out of scope', hod, 403);
  const hodSetup = await get(academic, hod);
  assert.deepEqual(
    hodSetup.departments.map(({ id }) => id),
    [first.id],
  );
  assert.equal(
    hodSetup.levels.find(({ id }) => id === level.id).status,
    'active',
  );
  const levelStatus = academic + '/levels/' + level.id + '/status';
  await request('PUT', levelStatus, 403, { status: 'inactive' }, hod);
  const disabled = await request(
    'PUT',
    levelStatus,
    200,
    { status: 'inactive' },
    staffToken,
  );
  assert.equal(disabled.status, 'inactive');
  assert.equal(disabled.displayName, '100 Level');
  const references = await request('GET', '/v1/academic-references', 200);
  assert.ok(!references.levels.some(({ id }) => id === level.id));
  assert.equal(
    (await request('PUT', levelStatus, 200, { status: 'active' }, staffToken))
      .status,
    'active',
  );

  const lecturerEmail = 'registration-lecturer-' + suffix + '@example.test';
  const lecturerInput = {
    email: lecturerEmail,
    password,
    firstName: 'Test',
    lastName: 'Lecturer',
  };
  await post(
    '/v1/admin/admins',
    { ...lecturerInput, departmentId: second.id },
    hod,
    403,
  );
  await post(
    '/v1/admin/admins',
    { ...lecturerInput, departmentId: first.id, roleId: hodRole.id },
    hod,
    403,
  );
  const lecturer = await post(
    '/v1/admin/admins',
    { ...lecturerInput, departmentId: first.id },
    hod,
  );
  assert.equal(lecturer.grant.name, 'lecturer');
  assert.equal(lecturer.grant.departmentId, first.id);
  const lecturerProfile = '/v1/admin/users/' + lecturer.userId;
  assert.equal(
    (
      await request(
        'PATCH',
        lecturerProfile,
        200,
        { firstName: 'Demo Lecturer' },
        hod,
      )
    ).firstName,
    'Demo Lecturer',
  );
  await request(
    'PATCH',
    lecturerProfile,
    403,
    { email: 'outside-edit@example.test' },
    hod,
  );
  const teacher = await signIn(lecturerEmail, 'admin');
  const lecturerRoles = '/v1/admin/admins/' + lecturer.id + '/roles';
  await post(
    lecturerRoles,
    { roleId: lecturer.grant.roleId, departmentId: second.id },
    hod,
    403,
  );
  const choices = await get(
    courses + '/lecturers?departmentId=' + first.id,
    hod,
  );
  assert.ok(choices.lecturers.some(({ id }) => id === lecturer.id));

  const catalog = (prefix, name, units) =>
    post(courses, { code: prefix + suffix.slice(0, 8), name, units });
  const shared = await catalog('CSC', 'Introduction to Computing', 3);
  const optional = await catalog('MAT', 'Discrete Mathematics', 2);
  const link = (courseId, courseOfStudyId, token = staffToken) =>
    post(courses + '/curriculum', { courseId, courseOfStudyId }, token);
  await link(shared.id, computing.id, hod);
  await link(shared.id, mathematics.id);
  await link(optional.id, computing.id, hod);

  const superAdmin = await get('/v1/admin/admins/me/authorization');
  const offering = (courseId, departmentId, lecturerId, token, status = 201) =>
    post(
      courses + '/offerings',
      {
        courseId,
        departmentId,
        semesterId: term.id,
        academicLevelId: level.id,
        lecturerId,
        status: 'active',
      },
      token,
      status,
    );
  const firstDelivery = await offering(shared.id, first.id, lecturer.id, hod);
  const extraDelivery = await offering(optional.id, first.id, lecturer.id, hod);
  await offering(shared.id, second.id, lecturer.id, staffToken, 400);
  const otherDelivery = await offering(
    shared.id,
    second.id,
    superAdmin.adminId,
    staffToken,
  );
  const lecturerPath = '/v1/lecturer/offerings/';
  await post(
    lecturerPath + firstDelivery.id + '/close-registration',
    undefined,
    teacher,
    409,
  );

  async function student(label, courseOfStudyId) {
    const email = label + '-' + suffix + '@example.test';
    const profile = await request('POST', '/v1/auth/signup/student', 201, {
      email,
      password,
      firstName: label,
      courseOfStudyId,
      academicLevelId: level.id,
    });
    return { ...profile, token: await signIn(email, 'student') };
  }
  const ada = await student('registration-ada', computing.id);
  const ben = await student('registration-ben', computing.id);
  const late = await student('registration-late', computing.id);
  const other = await student('registration-other', mathematics.id);
  await get(academic, ada.token, 403);
  await get(courses, ada.token, 403);
  await get(registrations + '/available', hod, 403);
  const available = await get(registrations + '/available', ada.token);
  assert.equal(available.semesterId, term.id);
  assert.equal(available.maxUnits, 4);
  assert.deepEqual(
    new Set(available.courses.map(({ offeringId }) => offeringId)),
    new Set([firstDelivery.id, extraDelivery.id]),
  );
  const selection = (...offeringIds) => ({ semesterId: term.id, offeringIds });
  await post(
    registrations,
    selection(firstDelivery.id, otherDelivery.id),
    ada.token,
    400,
  );
  await post(
    registrations,
    selection(firstDelivery.id, extraDelivery.id),
    ada.token,
    400,
  );
  await get(registrations + '/' + term.id, ada.token, 404);

  // Both writers can enroll, but there must be only one roster for the shared offering.
  const [enrolled, delegated] = await Promise.all([
    post(registrations, selection(firstDelivery.id), ada.token),
    post(
      adminRegistrations + '/students/' + ben.id,
      selection(firstDelivery.id),
      hod,
    ),
  ]);
  assert.equal(enrolled.totalUnits, 3);
  assert.equal(enrolled.matricNumber, ada.student.matricNumber);
  assert.equal(
    enrolled.courses[0].resultGroupId,
    delegated.courses[0].resultGroupId,
  );
  assert.equal(enrolled.courses[0].code, shared.code);
  const [delegation] = await database.query(
    'SELECT registered_by_user_id FROM student_registered_courses WHERE id = $1',
    [delegated.courses[0].id],
  );
  assert.equal(delegation.registered_by_user_id, hodAccount.userId);
  await post(registrations, selection(firstDelivery.id), ada.token, 409);

  const ownOfferings = await get('/v1/lecturer/offerings', teacher);
  assert.deepEqual(
    new Set(ownOfferings.offerings.map(({ offeringId }) => offeringId)),
    new Set([firstDelivery.id, extraDelivery.id]),
  );
  const roster = await get(
    lecturerPath + firstDelivery.id + '/roster',
    teacher,
  );
  assert.deepEqual(
    new Set(roster.items.map(({ studentId }) => studentId)),
    new Set([ada.student.id, ben.student.id]),
  );
  await get(lecturerPath + otherDelivery.id + '/roster', teacher, 403);
  const report = (departmentId, token, status = 200) =>
    get(
      adminRegistrations +
        '?departmentId=' +
        departmentId +
        '&semesterId=' +
        term.id,
      token,
      status,
    );
  assert.equal((await report(first.id, hod)).items.length, 2);
  await report(second.id, hod, 403);
  await report(first.id, teacher, 403);

  const reassign = (lecturerId) =>
    request(
      'PATCH',
      courses + '/offerings/' + firstDelivery.id,
      200,
      { lecturerId },
      hod,
    );
  await reassign(superAdmin.adminId);
  await get(lecturerPath + firstDelivery.id + '/roster', teacher, 403);
  assert.equal(
    (await get(lecturerPath + firstDelivery.id + '/roster')).items.length,
    2,
  );
  await reassign(lecturer.id);

  const close = () =>
    post(
      lecturerPath + firstDelivery.id + '/close-registration',
      undefined,
      teacher,
      200,
    );
  const closed = await close();
  assert.equal(closed.id, enrolled.courses[0].resultGroupId);
  assert.equal((await close()).closedAt, closed.closedAt);
  const rejected = await post(
    registrations,
    selection(firstDelivery.id),
    late.token,
    409,
  );
  assert.match(rejected.message, /closed/i);
  await post(
    adminRegistrations + '/students/' + late.id,
    selection(firstDelivery.id),
    hod,
    409,
  );
  assert.deepEqual(
    (await get(registrations + '/available', late.token)).courses.map(
      ({ offeringId }) => offeringId,
    ),
    [extraDelivery.id],
  );
  const differentDepartment = await post(
    registrations,
    selection(otherDelivery.id),
    other.token,
  );
  assert.notEqual(differentDepartment.courses[0].resultGroupId, closed.id);

  // Placement changes are used for future terms. This term keeps its original department and programme.
  await request(
    'PUT',
    academic + '/semesters/' + term.id,
    200,
    { ...termInput, maxUnits: 5, status: 'active' },
    staffToken,
  );
  await request(
    'PUT',
    '/v1/admin/users/' + ada.id + '/student-placement',
    200,
    {
      courseOfStudyId: mathematics.id,
      academicLevelId: level.id,
    },
    staffToken,
  );
  await post(registrations, selection(otherDelivery.id), ada.token, 400);
  await post(
    adminRegistrations + '/students/' + ada.id,
    selection(extraDelivery.id),
    hod,
    403,
  );
  const receivingHodEmail =
    'registration-receiving-hod-' + suffix + '@example.test';
  await post('/v1/admin/admins', {
    email: receivingHodEmail,
    password,
    roleId: hodRole.id,
    departmentId: second.id,
  });
  const receivingHod = await signIn(receivingHodEmail, 'admin');
  await post(
    adminRegistrations + '/students/' + ada.id,
    selection(extraDelivery.id),
    receivingHod,
    403,
  );
  const summary = await get(registrations + '/' + term.id, ada.token);
  assert.equal(summary.department, first.name);
  assert.equal(summary.totalUnits, 3);
  assert.equal((await get(registrations, ada.token)).terms[0].id, summary.id);
  const download = await fetch(
    url + registrations + '/' + term.id + '/summary/download',
    {
      headers: { authorization: 'Bearer ' + ada.token },
    },
  );
  assert.equal(download.status, 200);
  assert.match(download.headers.get('content-disposition'), /attachment/);
  assert.ok((await download.text()).includes(shared.code));

  const audit = await get(
    '/v1/admin/audit-events?action=registration.close_roster&targetId=' +
      closed.id,
  );
  assert.ok(audit.items.some(({ outcome }) => outcome === 'succeeded'));

  // The same session still has teaching permission in the second department.
  await post(lecturerRoles, {
    roleId: lecturer.grant.roleId,
    departmentId: second.id,
  });
  await request(
    'PATCH',
    lecturerProfile,
    403,
    { firstName: 'Outside scope' },
    hod,
  );
  await request(
    'DELETE',
    lecturerRoles + '/' + lecturer.grant.id,
    204,
    undefined,
    staffToken,
  );
  assert.deepEqual(
    (await get('/v1/lecturer/offerings', teacher)).offerings,
    [],
  );
  await get(lecturerPath + firstDelivery.id + '/roster', teacher, 403);
  await post(
    lecturerPath + firstDelivery.id + '/close-registration',
    undefined,
    teacher,
    403,
  );
  assert.deepEqual(
    (await get(registrations + '/available', late.token)).courses,
    [],
  );
  await post(registrations, selection(extraDelivery.id), late.token, 400);
  await get(registrations + '/' + term.id, late.token, 404);
  await request(
    'PATCH',
    courses + '/offerings/' + extraDelivery.id,
    200,
    {
      lecturerId: superAdmin.adminId,
    },
    hod,
  );
  const recovered = await post(
    registrations,
    selection(extraDelivery.id),
    late.token,
  );
  assert.equal(recovered.totalUnits, 2);

  const [competingRegistration, extraClosed] = await Promise.all([
    fetch(url + registrations, {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + ben.token,
        'content-type': 'application/json',
      },
      body: JSON.stringify(selection(extraDelivery.id)),
    }),
    post(
      lecturerPath + extraDelivery.id + '/close-registration',
      undefined,
      staffToken,
      200,
    ),
  ]);
  assert.ok([201, 409].includes(competingRegistration.status));
  await competingRegistration.json();
  assert.equal(extraClosed.id, recovered.courses[0].resultGroupId);
  const finalRoster = await get(lecturerPath + extraDelivery.id + '/roster');
  assert.equal(finalRoster.items.length, competingRegistration.ok ? 2 : 1);
  await post(registrations, selection(extraDelivery.id), ada.token, 409);
  await verifyResultsWorkflow({
    request,
    url,
    staffToken,
    hod,
    receivingHod,
    teacher,
    lecturer,
    hodRole,
    faculty,
    first,
    second,
    term,
    termInput,
    level,
    shared,
    optional,
    mathematics,
    database,
    ada,
    ben,
    other,
    enrolled,
    delegated,
    differentDepartment,
    extraEnrollmentCount: finalRoster.items.length,
  });
}
