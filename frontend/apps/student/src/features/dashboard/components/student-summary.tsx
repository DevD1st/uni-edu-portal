import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardList, GraduationCap } from "lucide-react";
import { ApiError, readableError } from "@uemp/web-client";
import { ResourceState, Surface } from "@uemp/ui";
import { AcademicMetrics } from "../../portal/components/academic-metrics";
import { StudentSectionHeading } from "../../portal/components/student-section-heading";
import { registrationHistory } from "../../registration/server/registration";
import { resultHistory } from "../../results/server/results";
import { gradeAverage } from "../../results/grade-average";

function SummaryFailure({ title, detail }: { title: string; detail: string }) {
  return (
    <Surface>
      <ResourceState
        state="error"
        title={title}
        detail={detail}
        action={
          <a className="u-text-link" href="/overview">
            Reload overview
          </a>
        }
      />
    </Surface>
  );
}

export async function RegistrationDashboard() {
  let history;
  try {
    history = await registrationHistory();
  } catch (error) {
    // Let authentication redirects reach Next; an ordinary API failure affects only this card.
    if (!(error instanceof ApiError)) throw error;
    return (
      <SummaryFailure
        title="We couldn’t load your registration summary"
        detail={readableError(error)}
      />
    );
  }
  const latest = history.terms[0];
  return (
    <Surface className="u-stack" aria-label="Registration dashboard">
      <StudentSectionHeading
        title="Your registration"
        icon={ClipboardList}
        description="Your saved semesters and most recent credit total."
      />
      <AcademicMetrics
        label="Registration summary"
        items={[
          { label: "Registered semesters", value: history.terms.length },
          { label: "Latest registered units", value: latest?.totalUnits ?? 0 },
        ]}
      />
      {latest ? (
        <Link
          className="student-context-link u-text-link"
          href={"/registration/" + latest.semesterId}
        >
          <CalendarDays size={17} aria-hidden /> {latest.semesterName} ·{" "}
          {latest.academicSession}
        </Link>
      ) : (
        <p>You haven’t registered for any courses yet.</p>
      )}
      <Link className="student-card-action u-text-link" href="/registration">
        Open course registration <ArrowRight size={17} aria-hidden />
      </Link>
    </Surface>
  );
}

export async function ResultsDashboard() {
  let history;
  try {
    history = await resultHistory();
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return (
      <SummaryFailure
        title="We couldn’t load your results summary"
        detail={readableError(error)}
      />
    );
  }
  const latest = history.terms.find(({ approvedUnits }) => approvedUnits > 0);
  return (
    <Surface className="u-stack" aria-label="Results dashboard">
      <StudentSectionHeading
        title="Your published results"
        icon={GraduationCap}
        description="Academic averages from your approved results."
      />
      <AcademicMetrics
        label="Results summary"
        items={[
          { label: "Cumulative GPA", value: gradeAverage(history.cgpa) },
          { label: "Latest published GPA", value: gradeAverage(latest?.gpa ?? null) },
        ]}
      />
      {latest ? (
        <Link
          className="student-context-link u-text-link"
          href={"/results/" + latest.semesterId}
        >
          <CalendarDays size={17} aria-hidden /> {latest.semesterName} ·{" "}
          {latest.academicSession}
        </Link>
      ) : (
        <p>No grades have been published yet.</p>
      )}
      <Link className="student-card-action u-text-link" href="/results">
        Open my results <ArrowRight size={17} aria-hidden />
      </Link>
    </Surface>
  );
}
