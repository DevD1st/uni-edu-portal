import type { ChartDatum } from "@uemp/ui";
import type { RegistrationHistory } from "../registration/contracts";
import type { ResultHistory } from "../results/contracts";

type AcademicTerm = { semesterName: string; academicSession: string };

function labels(term: AcademicTerm) {
  const semester = term.semesterName.replace(/\bsemester\b/gi, "").trim();
  const session = term.academicSession.replace(
    /^(\d{2})(\d{2})\/(\d{2})(\d{2})$/,
    "$2/$4",
  );
  return {
    label: term.semesterName + " · " + term.academicSession,
    shortLabel: (semester || term.semesterName) + " · " + session,
  };
}

export function registrationChartData(
  terms: RegistrationHistory["terms"],
): ChartDatum[] {
  // Histories arrive newest first. Compare recent terms in reading order without changing the source.
  return terms
    .slice(0, 6)
    .reverse()
    .map((term) => ({
      id: term.semesterId,
      ...labels(term),
      value: term.totalUnits,
      href: "/registration/" + term.semesterId,
      hrefLabel: "Open semester registration",
    }));
}

export function resultChartData(terms: ResultHistory["terms"]): ChartDatum[] {
  return terms
    .filter((term) => term.approvedUnits > 0 && term.gpa !== null)
    .slice(0, 6)
    .reverse()
    .map((term) => ({
      id: term.semesterId,
      ...labels(term),
      // Zero is an earned GPA, not a missing result. The API owns the weighted calculation.
      value: term.gpa,
      detail: term.approvedUnits + " approved credit units",
      href: "/results/" + term.semesterId,
      hrefLabel: "Open semester results",
    }));
}
