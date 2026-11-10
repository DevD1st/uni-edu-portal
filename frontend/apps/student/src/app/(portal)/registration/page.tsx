import { PageHeader, ResourceState, Surface } from "@uemp/ui";
import { CourseSelection } from "../../../features/registration/components/course-selection";
import { RegistrationHistory } from "../../../features/registration/components/registration-history";
import {
  currentAvailability,
  registrationHistory,
} from "../../../features/registration/server/registration";

export const metadata = { title: "Course registration" };

export default async function RegistrationPage() {
  const [current, history] = await Promise.all([
    currentAvailability(),
    registrationHistory(),
  ]);
  return (
    <>
      <PageHeader title="Course registration" />
      {current.available ? (
        <CourseSelection
          key={current.available.semesterId}
          available={current.available}
        />
      ) : (
        <Surface>
          <ResourceState
            state="empty"
            title="Registration is unavailable"
            detail={current.unavailable}
          />
        </Surface>
      )}
      <RegistrationHistory history={history} />
    </>
  );
}
