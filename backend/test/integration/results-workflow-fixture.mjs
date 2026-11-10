import assert from 'node:assert/strict';

export async function verifyResultsWorkflow({
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
  extraEnrollmentCount,
}) {
  const academic = '/v1/admin/academic';
  const catalog = '/v1/admin/courses';
  const registrations = '/v1/student/registrations';
  const lecturerResults = '/v1/lecturer/results';
  const departmentalResults = '/v1/admin/results';
  const studentResults = '/v1/student/results';
  const groupId = enrolled.courses[0].resultGroupId;
  const lecturerGroup = lecturerResults + '/' + groupId;
  const reviewGroup = departmentalResults + '/' + groupId;
  const adaEnrollment = enrolled.courses[0].id;
  const benEnrollment = delegated.courses[0].id;
  const studentTerm = studentResults + '/' + term.id;
  const get = (path, token = staffToken, status = 200) =>
    request('GET', path, status, undefined, token);
  const send = (method, path, input, token = staffToken, status = 200) =>
    request(method, path, status, input, token);
  const save = (marks, status = 200) =>
    send('PATCH', lecturerGroup + '/marks', { marks }, teacher, status);
  const submit = (status = 200) =>
    send(
      'POST',
      lecturerGroup + '/submit',
      { note: 'Checked against exam records.' },
      teacher,
      status,
    );
  const approve = (token, status = 200) =>
    send(
      'POST',
      reviewGroup + '/approve',
      { note: 'Department approval note.' },
      token,
      status,
    );
  const statement = (token = ada.token) => get(studentTerm, token);
  const pendingReviews = () =>
    get(departmentalResults + '?departmentId=' + first.id, hod);
  const report = (path, departmentId, token, status = 200) =>
    get(
      '/v1/admin/reports/' +
        path +
        (path.includes('?') ? '&' : '?') +
        'semesterId=' +
        term.id +
        (departmentId ? '&departmentId=' + departmentId : ''),
      token,
      status,
    );
  const createRole = (label, privileges) =>
    send(
      'POST',
      '/v1/admin/roles',
      { name: 'results-' + label + '-' + groupId, privileges },
      staffToken,
      201,
    );
  const assignRole = (path, roleId, departmentId) =>
    send('POST', path, { roleId, departmentId }, staffToken, 201);

  // The teaching grant for this department was revoked during the registration checks.
  await get(lecturerGroup, teacher, 403);
  await save([{ enrollmentId: adaEnrollment, caScore: 24.5 }], 403);
  const assignments = '/v1/admin/admins/' + lecturer.id + '/roles';
  const teachOnly = await createRole('teach-only', ['teach_course']);
  const temporaryTeaching = await assignRole(
    assignments,
    teachOnly.id,
    first.id,
  );
  assert.equal((await get(lecturerGroup, teacher)).id, groupId);
  // The assigned lecturer has teaching authority here and a separate grading grant elsewhere.
  await save([{ enrollmentId: adaEnrollment, caScore: 24.5 }], 403);
  await submit(403);
  await assignRole(assignments, lecturer.grant.roleId, first.id);
  await send(
    'DELETE',
    assignments + '/' + temporaryTeaching.id,
    undefined,
    staffToken,
    204,
  );

  const drafts = await get(
    lecturerResults + '?semesterId=' + term.id + '&status=pending',
    teacher,
  );
  assert.ok(drafts.items.some(({ id }) => id === groupId));
  assert.ok(
    !drafts.items.some(
      ({ id }) => id === differentDepartment.courses[0].resultGroupId,
    ),
  );
  await get(lecturerGroup, ada.token, 403);
  await get(reviewGroup, hod, 404);
  assert.deepEqual((await pendingReviews()).items, []);
  await get(departmentalResults + '?departmentId=' + first.id, teacher, 403);
  await get(studentResults, hod, 403);
  assert.deepEqual((await statement()).courses, []);
  assert.equal((await statement()).gpa, null);
  await report('overview', first.id, ada.token, 403);
  await report('overview', first.id, teacher, 403);
  await report('courses', first.id, receivingHod, 403);
  await report('overview', null, hod, 403);
  const empty = await report('overview', first.id, hod);
  assert.equal(empty.studentCount, 3);
  assert.equal(empty.enrollmentCount, 2 + extraEnrollmentCount);
  assert.equal(empty.publishedCount, 0);
  assert.equal(empty.averageScore, null);
  const university = await report('overview', null, staffToken);
  assert.equal(university.departmentId, null);
  assert.equal(university.enrollmentCount, empty.enrollmentCount + 1);
  const firstPage = await report('courses?limit=1', first.id, hod);
  assert.equal(firstPage.items.length, 1);
  assert.equal(firstPage.items[0].departmentId, first.id);
  assert.ok(firstPage.nextCursor);
  const secondPage = await report(
    'courses?limit=1&cursor=' + firstPage.nextCursor,
    first.id,
    hod,
  );
  assert.equal(secondPage.items[0].departmentId, first.id);
  assert.notEqual(
    secondPage.items[0].offeringId,
    firstPage.items[0].offeringId,
  );

  const initial = await get(lecturerGroup + '?limit=1', teacher);
  assert.equal(initial.enrolledCount, 2);
  assert.equal(initial.markedCount, 0);
  assert.equal(initial.maxCaScore, 30);
  assert.equal(initial.maxExamScore, 70);
  assert.ok(initial.nextCursor);
  const next = await get(
    lecturerGroup + '?limit=1&cursor=' + initial.nextCursor,
    teacher,
  );
  assert.notEqual(next.marks[0].id, initial.marks[0].id);
  assert.equal(next.nextCursor, null);

  await save(
    [
      { enrollmentId: adaEnrollment, caScore: 24.5 },
      { enrollmentId: differentDepartment.courses[0].id, examScore: 40 },
    ],
    400,
  );
  await save(
    [
      { enrollmentId: adaEnrollment, caScore: 24.5 },
      { enrollmentId: adaEnrollment, examScore: 40 },
    ],
    400,
  );
  await save([{ enrollmentId: adaEnrollment, caScore: 1e-7 }], 400);
  await save([{ enrollmentId: adaEnrollment, caScore: 30.01 }], 400);
  assert.ok(
    (await get(lecturerGroup, teacher)).marks.every(
      ({ caScore, examScore }) => caScore === null && examScore === null,
    ),
  );
  const partial = await save([
    { enrollmentId: adaEnrollment, caScore: 24.5 },
    { enrollmentId: benEnrollment, caScore: 0, examScore: 39.99 },
  ]);
  assert.equal(partial.changedCount, 2);
  await save([{ enrollmentId: adaEnrollment, caScore: null }]);
  assert.equal(
    (await get(lecturerGroup, teacher)).marks.find(
      ({ id }) => id === adaEnrollment,
    ).caScore,
    null,
  );
  await submit(409);
  await save([{ enrollmentId: adaEnrollment, caScore: 24.5 }]);
  assert.equal(
    (await save([{ enrollmentId: adaEnrollment, examScore: 45.49 }]))
      .changedCount,
    1,
  );
  assert.equal(
    (await save([{ enrollmentId: adaEnrollment, examScore: 45.49 }]))
      .changedCount,
    0,
  );
  const preview = await get(lecturerGroup, teacher);
  assert.equal(preview.markedCount, 2);
  assert.equal(preview.marks.find(({ id }) => id === adaEnrollment).grade, 'B');
  assert.equal(preview.marks.find(({ id }) => id === benEnrollment).grade, 'F');
  assert.deepEqual((await statement()).courses, []);

  assert.equal((await submit()).status, 'submitted');
  await save([{ enrollmentId: adaEnrollment, examScore: 46 }], 409);
  assert.ok((await pendingReviews()).items.some(({ id }) => id === groupId));
  assert.equal((await get(reviewGroup, hod)).marks.length, 2);
  await get(reviewGroup, receivingHod, 403);
  await approve(receivingHod, 403);
  await approve(teacher, 403);
  assert.deepEqual((await statement()).courses, []);
  const receivingAdmin = await get(
    '/v1/admin/admins/me/authorization',
    receivingHod,
  );
  const reviewOnly = await createRole('review-only', ['review_result']);
  await assignRole(
    '/v1/admin/admins/' + receivingAdmin.adminId + '/roles',
    reviewOnly.id,
    first.id,
  );
  assert.equal((await get(reviewGroup, receivingHod)).id, groupId);
  await approve(receivingHod, 403);
  await send(
    'POST',
    reviewGroup + '/reopen',
    { reason: 'review_error' },
    receivingHod,
    403,
  );

  await send('PATCH', '/v1/users/me', { lastName: 'Fixture' }, ben.token);
  const fullName = ben.firstName + ' Fixture';
  const feedback =
    'Please verify the exam mark for ' + fullName.toUpperCase() + '.';
  const correction = await send(
    'POST',
    reviewGroup + '/request-corrections',
    { reason: feedback },
    receivingHod,
  );
  assert.equal(correction.status, 'correction_requested');
  const returned = await get(lecturerGroup, teacher);
  assert.equal(returned.correctionRequestReason, feedback);
  assert.equal(returned.registrationStatus, 'closed');
  await approve(hod, 409);
  await save([{ enrollmentId: adaEnrollment, examScore: 45.5 }]);
  assert.equal((await submit()).status, 'submitted');

  // An assigned lecturer may approve their own submission after obtaining approval authority in this department.
  await send(
    'POST',
    assignments,
    { roleId: hodRole.id, departmentId: first.id },
    staffToken,
    201,
  );
  // A failed success-audit insert must roll back both publication and grade awards.
  await database.query(
    "ALTER TABLE admin_audit_events ADD CONSTRAINT test_block_result_approval_audit CHECK (action <> 'result.approve' OR outcome <> 'succeeded') NOT VALID",
  );
  try {
    const rejected = await approve(teacher, 503);
    assert.equal(
      rejected.message,
      'We could not record this change. Please try again.',
    );
    assert.equal((await get(reviewGroup, hod)).status, 'submitted');
    const awards = await database.query(
      'SELECT awarded_grade_system_id FROM student_registered_courses WHERE result_group_id = $1',
      [groupId],
    );
    assert.ok(
      awards.every(
        ({ awarded_grade_system_id }) => awarded_grade_system_id === null,
      ),
    );
    assert.deepEqual((await statement()).courses, []);
  } finally {
    await database.query(
      'ALTER TABLE admin_audit_events DROP CONSTRAINT test_block_result_approval_audit',
    );
  }
  assert.equal((await approve(teacher)).status, 'approved');
  const published = await statement();
  assert.equal(published.gpa, 5);
  assert.equal(published.cgpa, 5);
  assert.equal(published.approvedUnits, 3);
  assert.deepEqual(
    published.courses.map(({ grade, totalScore, units }) => ({
      grade,
      totalScore,
      units,
    })),
    [{ grade: 'A', totalScore: 70, units: 3 }],
  );
  const failed = await statement(ben.token);
  assert.equal(failed.gpa, 0);
  assert.equal(failed.approvedUnits, 3);
  assert.equal(failed.courses[0].grade, 'F');
  assert.deepEqual((await statement(other.token)).courses, []);
  const approvedReport = await report('overview', first.id, hod);
  assert.equal(approvedReport.approvedCount, 1);
  assert.equal(approvedReport.publishedCount, 2);
  assert.equal(approvedReport.passedCount, 1);
  assert.equal(approvedReport.averageScore, 55);
  const publishedOffering = (await report('courses', first.id, hod)).items.find(
    (item) => item.code === shared.code,
  );
  assert.equal(publishedOffering.resultStatus, 'approved');
  assert.equal(publishedOffering.publishedCount, 2);
  assert.equal(publishedOffering.passedCount, 1);
  assert.equal(publishedOffering.averageScore, approvedReport.averageScore);

  const reopened = await send(
    'POST',
    reviewGroup + '/reopen',
    { reason: 'mark_correction' },
    hod,
  );
  assert.equal(reopened.status, 'pending');
  assert.equal(reopened.registrationStatus, 'closed');
  assert.deepEqual((await statement()).courses, []);
  assert.equal((await statement()).cgpa, null);
  const withdrawnReport = await report('overview', first.id, hod);
  assert.equal(withdrawnReport.approvedCount, 0);
  assert.equal(withdrawnReport.publishedCount, 0);
  assert.equal(withdrawnReport.averageScore, null);
  assert.equal(withdrawnReport.enrollmentCount, approvedReport.enrollmentCount);
  const audit = (query) =>
    get('/v1/admin/audit-events?category=results&' + query);
  const history = (await audit('targetId=' + groupId)).items;
  const success = (action) =>
    history.filter(
      (event) => event.action === action && event.outcome === 'succeeded',
    );
  assert.equal(success('result.approve').length, 1);
  assert.equal(success('result.approve')[0].actorAdminId, lecturer.id);
  assert.ok(
    success('result.submit').every(
      ({ actorAdminId }) => actorAdminId === lecturer.id,
    ),
  );
  assert.equal(success('result.reopen')[0].reason, 'mark_correction');
  assert.ok(!JSON.stringify(history).includes(feedback));
  assert.ok(!JSON.stringify(history).includes('Department approval note.'));
  const cleared = (
    await audit('action=result.grade.clear&targetId=' + adaEnrollment)
  ).items;
  assert.equal(cleared.length, 1);
  assert.equal(cleared[0].changes.before.examScore, 45.5);
  assert.ok(cleared[0].changes.before.awardedGradeSystemId);
  assert.equal(cleared[0].changes.after.awardedGradeSystemId, null);
  assert.equal(cleared[0].metadata.resultGroupId, groupId);
  assert.ok(cleared[0].requestId);
  await submit();
  await approve(hod);

  // A later attempt at the same course uses its own credit snapshot and contributes to CGPA.
  const later = await send(
    'POST',
    academic + '/semesters',
    {
      ...termInput,
      termNumber: 2,
      name: 'Second Semester',
      maxUnits: 6,
      status: 'active',
    },
    staffToken,
    201,
  );
  await send(
    'PUT',
    academic + '/faculties/' + faculty.id + '/current-semester',
    { semesterId: later.id },
  );
  await send('PUT', catalog + '/' + shared.id, {
    code: shared.code,
    name: shared.name,
    units: 2,
  });
  await send('PUT', catalog + '/' + optional.id, {
    code: optional.code,
    name: optional.name,
    units: 4,
  });
  await send(
    'POST',
    catalog + '/curriculum',
    {
      courseId: optional.id,
      courseOfStudyId: mathematics.id,
    },
    staffToken,
    201,
  );
  const repeatOffering = await send(
    'POST',
    catalog + '/offerings',
    {
      courseId: shared.id,
      departmentId: second.id,
      semesterId: later.id,
      academicLevelId: level.id,
      lecturerId: lecturer.id,
      status: 'active',
    },
    staffToken,
    201,
  );
  const companionOffering = await send(
    'POST',
    catalog + '/offerings',
    {
      courseId: optional.id,
      departmentId: second.id,
      semesterId: later.id,
      academicLevelId: level.id,
      lecturerId: lecturer.id,
      status: 'active',
    },
    staffToken,
    201,
  );
  const repeat = await send(
    'POST',
    registrations,
    {
      semesterId: later.id,
      offeringIds: [repeatOffering.id, companionOffering.id],
    },
    ada.token,
    201,
  );
  const repeatResult = repeat.courses.find(
    ({ offeringId }) => offeringId === repeatOffering.id,
  );
  const companion = repeat.courses.find(
    ({ offeringId }) => offeringId === companionOffering.id,
  );
  const repeatLecturer = lecturerResults + '/' + repeatResult.resultGroupId;
  const repeatReview = departmentalResults + '/' + repeatResult.resultGroupId;
  await send(
    'PATCH',
    repeatLecturer + '/marks',
    {
      marks: [{ enrollmentId: repeatResult.id, caScore: 10, examScore: 15 }],
    },
    teacher,
  );
  await send('POST', repeatLecturer + '/submit', {}, teacher, 409);
  await send(
    'POST',
    '/v1/lecturer/offerings/' + repeatOffering.id + '/close-registration',
    undefined,
    teacher,
  );
  await send('POST', repeatLecturer + '/submit', {}, teacher);
  // Teaching authority in the new department and approval authority in the old one do not combine.
  await send('POST', repeatReview + '/approve', {}, teacher, 403);
  await send('POST', repeatReview + '/approve', {}, receivingHod);
  const laterStatement = await get(studentResults + '/' + later.id, ada.token);
  assert.equal(laterStatement.gpa, 0);
  assert.equal(laterStatement.approvedUnits, 2);
  assert.equal(laterStatement.courses[0].code, published.courses[0].code);
  assert.equal((await statement()).approvedUnits, 3);
  assert.equal(laterStatement.cgpa, 3);
  assert.equal((await get(studentResults, ada.token)).cgpa, 3);
  await get(studentResults + '/' + later.id, other.token, 404);

  const companionLecturer = lecturerResults + '/' + companion.resultGroupId;
  const companionReview = departmentalResults + '/' + companion.resultGroupId;
  await send(
    'PATCH',
    companionLecturer + '/marks',
    {
      marks: [{ enrollmentId: companion.id, caScore: 20, examScore: 45 }],
    },
    teacher,
  );
  await send(
    'POST',
    '/v1/lecturer/offerings/' + companionOffering.id + '/close-registration',
    undefined,
    teacher,
  );
  await send('POST', companionLecturer + '/submit', {}, teacher);
  assert.deepEqual(
    (await get(studentResults + '/' + later.id, ada.token)).courses.map(
      ({ id }) => id,
    ),
    [repeatResult.id],
  );
  const submitApproval = () =>
    fetch(url + companionReview + '/approve', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + receivingHod,
        'content-type': 'application/json',
      },
      body: '{}',
    });
  const approvals = await Promise.all([submitApproval(), submitApproval()]);
  assert.deepEqual(approvals.map(({ status }) => status).sort(), [200, 409]);
  await Promise.all(approvals.map((response) => response.json()));
  const approvalEvents = (
    await audit('action=result.approve&targetId=' + companion.resultGroupId)
  ).items;
  assert.equal(
    approvalEvents.filter(({ outcome }) => outcome === 'succeeded').length,
    1,
  );

  // (0 x 2 + 4 x 4) / 6 gives 2.67. CGPA is 31 / 9 = 3.44, using the unrounded term totals.
  const weighted = await get(studentResults + '/' + later.id, ada.token);
  assert.equal(weighted.approvedUnits, 6);
  assert.equal(weighted.gpa, 2.67);
  assert.equal(weighted.cgpa, 3.44);
  assert.equal((await get(studentResults, ada.token)).cgpa, 3.44);
  assert.equal((await statement()).cgpa, 3.44);
  const download = await fetch(url + studentTerm + '/statement/download', {
    headers: { authorization: 'Bearer ' + ada.token },
  });
  assert.equal(download.status, 200);
  assert.equal(download.headers.get('cache-control'), 'no-store');
  assert.match(
    download.headers.get('content-disposition'),
    /result-statement\.txt/,
  );
  const text = await download.text();
  assert.ok(text.includes(shared.code));
  assert.match(text, /CGPA: 3\.44/);
  await send(
    'POST',
    reviewGroup + '/reopen',
    { reason: 'mark_correction' },
    hod,
  );
  assert.equal((await statement()).gpa, null);
  assert.equal((await get(studentResults, ada.token)).cgpa, 2.67);
  await send(
    'POST',
    lecturerGroup + '/submit',
    {
      note: 'Cross-checked the marks for ' + ben.email.toUpperCase() + '.',
    },
    teacher,
  );
  await send(
    'POST',
    reviewGroup + '/approve',
    {
      note:
        'Approved after verifying matriculation number ' +
        ben.student.matricNumber +
        '.',
    },
    hod,
  );
  assert.equal((await get(studentResults, ada.token)).cgpa, 3.44);
  await send('DELETE', '/v1/admin/users/' + ben.id, undefined, staffToken, 204);
  await get(studentResults, ben.token, 401);
  const redacted = await get(reviewGroup, hod);
  assert.equal(
    redacted.submissionReason,
    'Cross-checked the marks for [redacted].',
  );
  assert.equal(
    redacted.approvalReason,
    'Approved after verifying matriculation number [redacted].',
  );
  assert.equal(
    redacted.correctionRequestReason,
    'Please verify the exam mark for [redacted].',
  );
  const historicMark = redacted.marks.find(({ id }) => id === benEnrollment);
  assert.equal(historicMark.firstName, null);
  assert.equal(historicMark.lastName, null);
  assert.equal(historicMark.matricNumber, null);
  assert.equal(historicMark.grade, 'F');
  assert.equal((await get(studentResults, ada.token)).cgpa, 3.44);
}
