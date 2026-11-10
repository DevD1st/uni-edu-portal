import { downloadStudentTerm } from "../../../../../../features/portal/server/student-api";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/student/registrations/[semesterId]/download">,
) {
  const { semesterId } = await params;
  return downloadStudentTerm(
    semesterId,
    "/v1/student/registrations/" + semesterId + "/summary/download",
    "course-registration.txt",
  );
}
