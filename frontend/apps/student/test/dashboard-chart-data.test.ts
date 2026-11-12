import assert from "node:assert/strict";
import test from "node:test";
import type { RegistrationHistory } from "../src/features/registration/contracts.ts";
import type { ResultHistory } from "../src/features/results/contracts.ts";
import {
  registrationChartData,
  resultChartData,
} from "../src/features/dashboard/chart-data.ts";

function term(index: number) {
  return {
    id: "term-" + index,
    semesterId: "semester-" + index,
    semesterName: "First Semester",
    academicSession: `${2030 - index}/${2031 - index}`,
    academicLevel: "100 Level",
    department: "Computing",
    programme: "BSc Computer Science",
  };
}

test("GPA history excludes unpublished terms and preserves an earned zero", () => {
  const terms: ResultHistory["terms"] = [
    { ...term(0), approvedUnits: 0, gpa: null },
    { ...term(1), approvedUnits: 3, gpa: 0 },
    { ...term(2), approvedUnits: 2, gpa: 4.5 },
  ];
  const points = resultChartData(terms);
  assert.deepEqual(
    points.map(({ id, value }) => ({ id, value })),
    [
      { id: "semester-2", value: 4.5 },
      { id: "semester-1", value: 0 },
    ],
  );
  assert.equal(points[1]?.label, "First Semester · 2029/2030");
  assert.equal(points[1]?.shortLabel, "First · 29/30");
  assert.equal(points[1]?.href, "/results/semester-1");
  assert.equal(terms[0]?.semesterId, "semester-0");
  assert.deepEqual(resultChartData([]), []);
});

test("credit-load comparisons show the latest six terms in chronological order", () => {
  const terms: RegistrationHistory["terms"] = Array.from({ length: 8 }, (_, index) => ({
    ...term(index),
    faculty: "Science",
    totalUnits: index === 0 ? 0 : index + 2,
  }));
  const points = registrationChartData(terms);
  assert.deepEqual(
    points.map(({ id }) => id),
    [
      "semester-5",
      "semester-4",
      "semester-3",
      "semester-2",
      "semester-1",
      "semester-0",
    ],
  );
  assert.equal(points[5]?.value, 0);
  assert.equal(points[0]?.href, "/registration/semester-5");
  assert.equal(terms[0]?.semesterId, "semester-0");
  assert.deepEqual(registrationChartData([]), []);
});
