import {
  BookOpen,
  Building2,
  ClipboardCheck,
  FileChartColumn,
  GraduationCap,
  ListChecks,
  Shield,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { registrationOversight, reviewRule, type Rule } from "../access/policy";

export type Workspace = {
  slug:
    | "teaching"
    | "result-review"
    | "academics"
    | "registration"
    | "reports"
    | "accounts"
    | "roles"
    | "audit";
  label: string;
  icon: LucideIcon;
  description: string;
  rule: Rule;
  details?: boolean;
};

// Routes and navigation both read this catalog so their privilege requirements stay in sync.
export const workspaceGroups: readonly {
  label: string;
  items: readonly Workspace[];
}[] = [
  {
    label: "Teaching and review",
    items: [
      {
        slug: "teaching",
        details: true,
        label: "My teaching",
        icon: BookOpen,
        description:
          "Open assigned class rosters, enter marks, and submit results for review.",
        rule: { anyOf: [["teach_course"]] },
      },
      {
        slug: "result-review",
        details: true,
        label: "Result review",
        icon: ClipboardCheck,
        description: "Review submitted result groups within your assigned departments.",
        rule: reviewRule,
      },
    ],
  },
  {
    label: "Academic administration",
    items: [
      {
        slug: "academics",
        label: "Academic setup",
        icon: Building2,
        description:
          "Configure academic records, curricula, and course offerings within your scope.",
        rule: { anyOf: [["manage_university"], ["manage_department"]] },
      },
      {
        slug: "registration",
        details: true,
        label: "Registration oversight",
        icon: GraduationCap,
        description:
          "Review departmental enrollments and eligible student course selections.",
        rule: {
          anyOf: [...registrationOversight.anyOf, ["register_student_courses"]],
        },
      },
      {
        slug: "reports",
        label: "Reports",
        icon: FileChartColumn,
        description:
          "Explore enrollments, result progress, and published course performance.",
        rule: { anyOf: [["read_reports"]] },
      },
    ],
  },
  {
    label: "Staff administration",
    items: [
      {
        slug: "accounts",
        details: true,
        label: "Accounts",
        icon: UsersRound,
        description:
          "Find staff and student accounts and manage their permitted details and access.",
        rule: {
          anyOf: [["read_user"], ["read_admin"], ["create_student"], ["create_admin"]],
        },
      },
      {
        slug: "roles",
        label: "Roles",
        icon: Shield,
        description:
          "Review role definitions and the privileges they provide across the university.",
        rule: { anyOf: [["read_role"], ["manage_roles"]], global: true },
      },
      {
        slug: "audit",
        details: true,
        label: "Audit trail",
        icon: ListChecks,
        description:
          "Follow administrative changes, access decisions, and their recorded outcomes.",
        rule: { anyOf: [["read_audit"]], global: true },
      },
    ],
  },
];

export function workspacePath(workspace: Workspace) {
  return "/workspaces/" + workspace.slug;
}
