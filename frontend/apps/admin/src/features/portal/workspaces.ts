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
import { reviewRule, type Rule } from "../access/policy";

export type Workspace = {
  slug: string;
  label: string;
  icon: LucideIcon;
  description: string;
  rule: Rule;
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
        label: "My teaching",
        icon: BookOpen,
        description: "View the course offerings assigned to you.",
        rule: { anyOf: [["teach_course"]] },
      },
      {
        slug: "result-review",
        label: "Result review",
        icon: ClipboardCheck,
        description: "View submitted results in the departments you can review.",
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
        description: "Access academic setup for the university or your departments.",
        rule: { anyOf: [["manage_university"], ["manage_department"]] },
      },
      {
        slug: "registration",
        label: "Registration oversight",
        icon: GraduationCap,
        description: "Access course registration oversight in your scope.",
        rule: {
          anyOf: [
            ["read_registration", "manage_university"],
            ["read_registration", "manage_department"],
          ],
        },
      },
      {
        slug: "reports",
        label: "Reports",
        icon: FileChartColumn,
        description: "Access academic reporting for your scope.",
        rule: { anyOf: [["read_reports"]] },
      },
    ],
  },
  {
    label: "Staff administration",
    items: [
      {
        slug: "accounts",
        label: "Accounts",
        icon: UsersRound,
        description: "Access staff and student account administration.",
        rule: {
          anyOf: [["read_user"], ["read_admin"], ["create_student"], ["create_admin"]],
        },
      },
      {
        slug: "roles",
        label: "Roles",
        icon: Shield,
        description: "Access university-wide role definitions and privileges.",
        rule: { anyOf: [["read_role"], ["manage_roles"]], global: true },
      },
      {
        slug: "audit",
        label: "Audit trail",
        icon: ListChecks,
        description: "Access the university-wide record of administrative activity.",
        rule: { anyOf: [["read_audit"]], global: true },
      },
    ],
  },
];

export function workspacePath(workspace: Workspace) {
  return "/workspaces/" + workspace.slug;
}
