# UEMP design system

UEMP is a campus workspace for course decisions and academic records. Use a calm ink and teal palette, clear page titles, and direct instructions. Surface the user's next action and show the state of the record before they make a change.

`@uemp/theme` owns semantic light and dark values, Source Sans 3, and the browser baseline. The theme maps tokens to Tailwind v4 so pages can compose styles without hard-coded colors. `@uemp/ui` owns the reusable controls, layouts, and feedback CSS. Each app owns navigation, copy, status mapping, and authorization. The admin app has a development gallery at `/design-system`.

| Role               | Rule                                                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text               | Use Source Sans 3 for the UI. Body is 16px, secondary and table text 14px, and page titles scale from 30px to 44px. Use tabular figures for units, marks, and GPA.                                                     |
| Color              | Canvas supports the workspace, surface contains forms and records, and teal marks the primary action. Use separate ink, muted text, control border, and focus tokens. Select system, light, or dark from either shell. |
| Status             | Use neutral for drafts, information for submitted work, warning for corrections, success for publication, and danger for failed or destructive actions. Always include text.                                           |
| Space and surfaces | Use the shared 4px scale, comfortable form widths, and wider content areas for comparison. Reserve elevated surfaces for overlays. Use 44px minimum target height for primary controls.                                |
| Forms              | Give each input a visible label, associate error/help text, and retain typed values on ordinary request errors. Use one prominent submit action.                                                                       |
| Tables             | Use headers and a caption. Keep horizontal scrolling inside a labeled region for comparisons. Use stacked rows when a form needs comfortable inline editing on a phone.                                                |
| Feedback           | Keep layout stable while loading. Use a short error message and an appropriate next step. Keep alerts visible and announce state changes politely.                                                                     |

The shell uses a mobile header and modal drawer, expanding to a collapsible sidebar at 64rem. Sign-in uses one column until the expanded layout. Gutters increase at 37.5rem and 64rem. Controls wrap and forms stack as space tightens. Drawers and dialogs return focus to their opener. The system respects reduced motion and color preferences.

Check both modes with keyboard navigation, long labels, zoom, and narrow viewports. Target WCAG 2.2 AA. [Accessibility standard](https://www.w3.org/TR/WCAG22/)
