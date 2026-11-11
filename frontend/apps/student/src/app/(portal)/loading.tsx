import { ResourceState, Surface } from "@uemp/ui";

export default function Loading() {
  return (
    <Surface>
      <ResourceState
        state="loading"
        title="Loading your workspace"
        detail="Getting your latest student records."
      />
    </Surface>
  );
}
