import Link from "next/link";
import { ApiError, readableError } from "@uemp/web-client";
import { ResourceState, Surface } from "@uemp/ui";
import { AcademicMetrics } from "../../portal/components/academic-metrics";
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
      <h2>Your registration</h2>
      <AcademicMetrics
        label="Registration summary"
        items={[
          { label: "Registered semesters", value: history.terms.length },
          { label: "Latest registered units", value: latest?.totalUnits ?? 0 },
        ]}
      />
      {latest ? (
        <Link className="u-text-link block" href={"/registration/" + latest.semesterId}>
          {latest.semesterName} · {latest.academicSession}
        </Link>
      ) : (
        <p>You haven’t registered for any courses yet.</p>
      )}
      <Link className="u-text-link block" href="/registration">
        Open course registration
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
      <h2>Your published results</h2>
      <AcademicMetrics
        label="Results summary"
        items={[
          { label: "Cumulative GPA", value: gradeAverage(history.cgpa) },
          { label: "Latest published GPA", value: gradeAverage(latest?.gpa ?? null) },
        ]}
      />
      {latest ? (
        <Link className="u-text-link block" href={"/results/" + latest.semesterId}>
          {latest.semesterName} · {latest.academicSession}
        </Link>
      ) : (
        <p>No grades have been published yet.</p>
      )}
      <Link className="u-text-link block" href="/results">
        Open my results
      </Link>
    </Surface>
  );
}
