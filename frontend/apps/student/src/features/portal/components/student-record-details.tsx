import { DescriptionList } from "@uemp/ui";

type StudentRecord = {
  firstName: string | null;
  lastName: string | null;
  matricNumber: string | null;
  faculty?: string;
  department: string;
  programme: string;
  academicLevel: string;
};

export function StudentRecordDetails({ record }: { record: StudentRecord }) {
  return (
    <div className="student-record-details">
      <DescriptionList
        items={[
          {
            label: "Student name",
            value:
              [record.firstName, record.lastName].filter(Boolean).join(" ") ||
              "Unavailable",
          },
          {
            label: "Matriculation number",
            value: record.matricNumber ?? "Pending assignment",
          },
          ...(record.faculty ? [{ label: "Faculty", value: record.faculty }] : []),
          { label: "Department", value: record.department },
          { label: "Programme", value: record.programme },
          { label: "Academic level", value: record.academicLevel },
        ]}
      />
    </div>
  );
}
