# UEMP design system

UEMP presents academic records and decisions with clear hierarchy, a calm ink and teal palette, and direct language. A page should establish whose record is open, the relevant semester or department, its current state, and the next permitted action. Related information belongs together, with room to read and act on narrow screens.

`@uemp/theme` owns fonts, semantic light/dark tokens, browser defaults, and Tailwind mappings. `@uemp/ui` owns reusable controls, layouts, and feedback. Each application owns navigation, domain copy, status mapping, and authorization. The staff development gallery at `/design-system` demonstrates shared components; it is excluded from production.

## Visual foundations

| Foundation        | Decision                                                                                                                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typography        | Self-host Source Sans 3 with its bundled open-font license. Use 16px body/input text, 14px secondary and table text, and page titles that scale from 30px to 44px. Use tabular figures for marks, units, and academic averages.   |
| Color             | Canvas supports the workspace; surfaces group records and forms; teal identifies primary actions. Separate semantic ink, muted text, control border, focus, and feedback tokens support both light and dark themes.               |
| Status            | Pair every color with text: neutral drafts, information for submitted work, warning for corrections, success for published records, and danger for destructive actions or failures.                                               |
| Space             | Use the shared 4px scale. A restrained border and shadow group content without giving every panel equal emphasis. Keep comfortable form widths and wider comparison areas.                                                        |
| Responsive layout | Start narrow. The mobile header and modal navigation drawer become a collapsible sidebar at 64rem. Gutters increase at 37.5rem and 64rem. Form fields and actions wrap while tables scroll only within their own labeled regions. |
| Accessibility     | Keep visible keyboard focus, stable accessible names, linked field help/errors, a skip link, comfortable 44px control targets, and reduced-motion behavior. Both themes must remain readable. Target WCAG 2.2 AA.                 |

Published GPA and CGPA use the shared average formatter on every screen and print view: `4.20 / 5.00`. A numeric zero displays `0.00 / 5.00`; an average without approved units displays `Unavailable`. API values remain numbers or `null`. Grade points awarded to an individual course remain distinct from an academic average. See [GPA and CGPA rules](../../docs/workflows.md#gpa-and-cgpa).

## Shared component decisions

| Component                  | Implementation standard                                                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tokens and CSS             | Use semantic tokens rather than isolated colors. Shared authored styles live in Tailwind's `components` layer so responsive utilities remain authoritative. Add shared tokens only when they have a shared visual role.                          |
| Stacks and grids           | `u-stack` supplies a 16px grid gap and safe shrinking; `u-section-stack` separates larger sections with 24px. `u-panel-grid` fits related panels without widening the page. Let these primitives own spacing instead of repeated manual margins. |
| Buttons and links          | Distinguish primary, secondary, ghost, and destructive actions. Show pending state and prevent duplicate writes. Label icon-only controls, preserve focus, and underline text links. Linked cards must describe their destination.               |
| Fields and selects         | Give each field a visible label, native required semantics, and associated help/errors. Required marks are visually separate from the accessible name. Keep body-size input text for mobile editing.                                             |
| Input actions              | `TextField.trailingAction` anchors controls such as password visibility to the input rather than its helper/error text. Visibility toggles retain stable, explicit labels.                                                                       |
| Checkboxes                 | Make the whole label clickable. Structured labels can show course code, title, and units while retaining one clear accessible name. Align the checkbox with the first line of wrapped content.                                                   |
| Surfaces and headings      | Group one coherent subject. Establish a page title, readable context, and a primary action. Keep unrelated forms in separate groups; let actions wrap below the introduction when necessary.                                                     |
| Metrics and descriptions   | Make academic values easy to scan. Use muted labels and prominent values, preserve natural wrapping, and distinguish unavailable values, previews, and complete totals.                                                                          |
| Tables                     | Supply visible captions, column headers, numeric alignment, and restrained row separators. A wide table belongs in a labeled, keyboard-focusable scrolling region. Its paper layout must fit every column and repeat headings.                   |
| Badges and banners         | Pair tone with a status label or message. Use compact badges for state and banners for feedback that needs attention. Errors and state changes retain appropriate announcements.                                                                 |
| Resource states            | Keep the icon, title, supporting detail, and recovery action together. A failed summary should not hide unaffected content. Empty, restricted, not-found, and error states explain the next useful action.                                       |
| Pagination                 | Keep position/context beside labeled previous/next controls. Controls wrap and respect pending or unsaved states. Changing a page must not silently discard an editor.                                                                           |
| Dialogs and drawers        | Use native modal focus behavior, scroll containment, reachable actions, Escape where dismissal is allowed, and focus restoration. Lock mutation dialogs while pending to avoid ambiguous or duplicate writes.                                    |
| Shell and account controls | Use the same campus mark in both portals. Keep location, account, theme, and sign-out visible. Collapsed navigation retains accessible labels; the mobile drawer remains a modal navigation surface.                                             |
| Authentication layout      | Put the form first in reading order with one primary submit. Wider screens can add contextual artwork and typography; phones keep the entire form without decorative clutter.                                                                    |

Controls that need hydration use `useClientReady` before accepting interaction. This includes navigation toggles, theme controls, credential/profile controls, and print actions. Keep a short loading explanation and a JavaScript-disabled message where necessary. Credential and profile forms retain a native POST fallback so their values cannot enter the URL.

Theme choice supports system, light, and dark modes with the existing persistence behavior. Motion reduction applies to loading animations as well as transitions. Browser icons use the same campus mark as the shell.

## Student page and component inventory

| Area                              | Information and interaction requirements                                                                                                                                                                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign-in, signup, and renewal      | Group identity, security, and optional placement fields. Preserve exact labels, password visibility, linked validation, pending state, safe return destinations, and renewal retry/sign-in actions. Explain an interruption without exposing credentials.                        |
| Academic placement choices        | Follow faculty → department → programme → level. Explain optional placement, retain cascading choices, and do not imply eligibility before the API confirms it. Existing placement labels come from the authenticated profile, including assigned records that are now inactive. |
| Shell and overview                | Keep navigation, current account, theme, and sign-out discoverable. Registration and approved-result summaries use deliberate grouping and direct destinations, with guidance for incomplete placement and honest empty states.                                                  |
| Profile and record details        | Distinguish editable names from department-managed academic placement and matriculation number. Preserve entered values after a failed save and show a clear result.                                                                                                             |
| Course selection and confirmation | Show course identity, units, remaining credit allowance, and the full selection before submission. Search changes visibility while preserving selected courses and totals. Provide explicit clearing and lock duplicate/pending submissions.                                     |
| Registration history and summary  | Attach semester/session context to each destination. Keep student identity, saved placement, course details, registered units, and the print action together.                                                                                                                    |
| Result history and statement      | Present approved units, GPA/CGPA, marks, grades, and grade points in a readable order. Use course cards on phones and a comparison table on wider screens. Use backend-approved averages and distinguish zero from unavailable.                                                  |
| Print views                       | Include identity, saved placement, semester/session, every course column, totals, and a timestamp. Fit A4 with repeated table headings, a light palette, and no portal navigation or print controls on paper. Reuse the authenticated record reads and course tables.            |
| Loading and recovery              | Use specific state copy and safe retry/back links. Preserve authentication redirects and approved-only result empty states. Section headings, metrics, semester rows, back links, record details, and print actions each retain one owning reusable component.                   |

## Staff workspace and component inventory

| Area                             | Information and interaction requirements                                                                                                                                                                                                                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign-in and shell                | Use the common authentication/navigation components with visible staff context and account identity. Apply privilege-filtered navigation and preserve tab-owned sessions and safe sign-out.                                                                                                                                   |
| Overview                         | Mount summaries only for current privileges. Balance the layout when only some cards are visible. Distinguish a review preview from totals, retain authorized department/semester choices, and link to the relevant workspace with that context.                                                                              |
| Teaching and offering details    | Make the assigned course, units, roster state, and next action apparent. Keep refresh and closure actions near their record context. Closing registration requires a deliberate permanent-closure confirmation.                                                                                                               |
| Rosters and marks                | Prioritize student identity, CA/exam limits, saved marks/totals, and edit state. Group save/discard actions. Keep draft and pending safeguards intact across tabs, pagination, refresh, and departure.                                                                                                                        |
| Department review                | Show department, status, completeness, notes/feedback, and marks before the available decisions. Approval, correction, and reopening each keep their own permission/state gate. Explain when a different approver is needed; use backend eligibility for the Super Admin exception and retain other permitted review actions. |
| Academic setup                   | Order faculties, departments, programmes, sessions, semesters, levels, catalog, curriculum, and offerings into distinct categories. Keep existing records beside their creation/edit actions and group relevant programme, level, semester, lecturer, and status choices.                                                     |
| Registration oversight           | Keep student, department, semester, eligible courses, unit allowance, and confirmation together. Apply the same placement, duplicate, closed-roster, and credit-limit rules as student registration.                                                                                                                          |
| Accounts and roles               | Distinguish student and staff records, placement, status, and permitted actions. Group identity, security, placement, and scope choices. Keep profile, access, deletion, and grant actions distinct; use readable privilege labels and compact disclosures.                                                                   |
| Reports and audit                | Separate registration activity, result state, and published performance. Retain semester/department context. Keep audit filters grouped and technical changes behind readable disclosures; audit records remain read-only.                                                                                                    |
| Recovery and shared presentation | Use generic rendering recovery, resource-specific retry, and links back to the owning workspace. Reuse staff record cards, action notices, resource states, form dialogs, scope controls, metrics, and pagination while domain copy and access remain inside the owning feature.                                              |

Staff marks stay mounted when switching roster/marks tabs. Disable page changes or refreshes that would remount an editor with unsaved changes. Navigation and sign-out ask before discarding work; pending saves finish before departure. Clean editors stop blocking navigation. Session revocation still ends access. See [security](../../docs/security.md) and [staff workflows](../../docs/workflows.md#staff-workspaces) for the underlying access and state rules.

## Review questions

Review the composed page, each component, and the states between actions:

1. Is the purpose clear, and are the student, semester, department, and scope identifiable?
2. Are the identity, status, counts, units, limits, saved values, and next actions required for this decision present?
3. Does the page follow the user's decision sequence, with related information and filters grouped together?
4. Does the primary action stand out while secondary, destructive, disabled, and pending actions remain distinct?
5. Are typography, line lengths, spacing, alignment, icons, surfaces, and color consistent with the shared system?
6. Can someone understand labels, dates, grades, zero/unavailable values, previews, and totals without guessing?
7. Can they select, search, review, save, cancel, retry, or leave without losing context or unsaved work?
8. Do loading, empty, success, restricted, error, and not-found states explain what happened and offer the right next step?
9. Does the layout handle long content, zoom, short viewports, both themes, and 320, 390, 768, 1024, and 1440 CSS px widths?
10. Can keyboard, touch, and assistive-technology users operate controls with stable labels, visible focus, and reachable dialog actions?
11. Do privilege scopes, assignment/state checks, published-only results, and session safeguards survive the visual change?
12. Is a print view self-contained and complete on paper, and does reusable behavior live at the correct package/feature boundary?

## Verification

Follow the [development verification modes](../../docs/development.md#verification). Review screenshots and the actual workflow as well as individual primitives. Browser regressions cover both themes, responsive overflow, authentication readiness and labels, course-search selection preservation, setup categories, statement printing, session behavior, privileges, and unsaved marks. Automated accessibility scans supplement keyboard and assistive-technology review; a passing scan alone is not a complete accessibility assessment.
