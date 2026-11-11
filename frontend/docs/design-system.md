# UEMP design system

UEMP is a campus workspace for course decisions and academic records. Use a calm ink and teal palette, clear page titles, and direct instructions. Surface the user's next action and show the state of the record before they make a change. Pages should feel composed: a clear introduction, related information grouped together, a visible next step, and enough space to read without losing context.

`@uemp/theme` owns semantic light and dark values, Source Sans 3, and the browser baseline. The theme maps tokens to Tailwind v4 so pages can compose styles without hard-coded colors. `@uemp/ui` owns the reusable controls, layouts, and feedback CSS. Each app owns navigation, copy, status mapping, and authorization. The admin app has a development gallery at `/design-system`.

| Role               | Rule                                                                                                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text               | Use Source Sans 3 for the UI. Body is 16px, secondary and table text 14px, and page titles scale from 30px to 44px. Use tabular figures for units, marks, and GPA.                                                               |
| Color              | Canvas supports the workspace, surface contains forms and records, and teal marks the primary action. Use separate ink, muted text, control border, and focus tokens. Select system, light, or dark from either shell.           |
| Status             | Use neutral for drafts, information for submitted work, warning for corrections, success for publication, and danger for failed or destructive actions. Always include text.                                                     |
| Space and surfaces | Use the shared 4px scale, comfortable form widths, and wider content areas for comparison. Cards use a quiet border and a restrained shadow; overlays carry the stronger elevation. Use 44px minimum target height for controls. |
| Forms              | Give each input a visible label, associate error/help text, and retain typed values on ordinary request errors. Use one prominent submit action.                                                                                 |
| Tables             | Use headers and a caption. Keep horizontal scrolling inside a labeled region for comparisons. Use stacked rows when a form needs comfortable inline editing on a phone.                                                          |
| Feedback           | Keep layout stable while loading. Use a short error message and an appropriate next step. Keep alerts visible and announce state changes politely.                                                                               |

The shell uses a mobile header and modal drawer, expanding to a collapsible sidebar at 64rem. Sign-in uses one column until the expanded layout. Gutters increase at 37.5rem and 64rem. Controls wrap and forms stack as space tightens. Drawers and dialogs return focus to their opener. The system respects reduced motion and color preferences.

## Review questions

Review each component, page, and state with the same questions. A positive answer needs visible evidence in the implementation, not a claim that every screen is perfect.

1. Is the purpose clear from its heading and first useful piece of information?
2. Is all the information needed to make the next decision present, accurate, and in the right order?
3. Are related items grouped, and are unrelated tasks visually separated?
4. Does the main action stand out, with secondary and destructive actions clearly distinguished?
5. Do typography, spacing, alignment, borders, and color follow the shared system?
6. Can a person understand labels, counts, units, statuses, and unavailable values without guessing?
7. Do loading, empty, success, error, restricted, and disabled states explain what happens next?
8. Are long names, large amounts of data, narrow screens, zoom, and both color themes handled?
9. Can someone complete the task with a keyboard, touch, or assistive technology?
10. Do data access, session handling, and workflow safeguards still work after the visual change?

## Shared component decisions

| Component or decision      | Implementation standard                                                                                                                                                                                                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme tokens               | Keep ink, teal, muted text, borders, surfaces, and feedback semantic. `light-dark()` supplies coherent light and dark colors. Shared shadow and radius tokens keep controls, cards, and overlays related without giving every element equal emphasis.                                         |
| Source Sans 3              | Use the bundled open font consistently, with readable weights and tabular numbers for academic values. Keep body inputs at 16px to preserve comfortable mobile editing.                                                                                                                       |
| Stack and grid primitives  | `u-stack` is a real grid with a 16px gap, start alignment, and children that can shrink. `u-section-stack` separates larger sections with a 24px gap. `u-panel-grid` fits related panels without forcing the page wider than its viewport. Do not replace these with repeated manual margins. |
| CSS order                  | Shared authored UI styles live in Tailwind's `components` layer, so intentional utilities such as `medium:hidden` can override display and spacing. App-specific feature styles remain in the owning application.                                                                             |
| Buttons and icon buttons   | Keep primary, secondary, ghost, and danger treatments distinct. Show pending state, prevent duplicate actions through the existing disabled behavior, retain a visible focus ring, and label every icon-only control. Custom classes are merged rather than discarded.                        |
| Fields and selects         | Keep a visible label, native required semantics, and linked help/error text. Required fields have an `aria-hidden` visual mark so accessible labels remain stable. Input focus, invalid, disabled, placeholder, and hover states each remain legible.                                         |
| Checkboxes                 | Keep the whole label clickable, leave room for wrapped copy, and align the check with its first line. A label may contain structured text such as course code, title, and units while preserving one clear accessible name.                                                                   |
| Badges and banners         | Pair every tone with a text label or message. Use compact badges for state, and a roomier banner for feedback requiring attention. Error alerts retain their existing announcement behavior.                                                                                                  |
| Surfaces and page headings | Cards group one coherent subject. Use a stronger title, restrained heading tracking, readable description, and action area that wraps beneath the introduction when needed. Avoid placing unrelated forms in one undifferentiated card.                                                       |
| Description lists          | Keep labels muted and values prominent. Use natural wrapping and a responsive grid; let the containing stack establish spacing rather than adding a hidden extra top margin.                                                                                                                  |
| Tables                     | Keep a visible caption, clear column headers, aligned numeric values, restrained row separators, and hover tracking. Wide tables scroll inside a labeled, keyboard-focusable region. Paper views must fit all columns and repeat headings, rather than inherit screen scrolling.              |
| Resource states            | Keep the state icon, title, supporting detail, and recovery action together. Loading and empty states use quiet surfaces; error and restricted states keep their meaningful alert tones. Preserve content outside the failed region where possible.                                           |
| Pagination                 | Keep the range or page label beside clearly labeled previous/next controls. Controls wrap, respect the existing busy state, and remain reachable on narrow screens.                                                                                                                           |
| Dialogs and drawers        | Keep the native modal focus behavior, clear title, visible close action, scroll containment, and focus restoration. The header is visually separated from the content. Pending operations can retain the existing close lock.                                                                 |
| Brand and navigation       | Use the same compact campus mark in both portals. Section captions and a bordered current item make location clear. Collapsed navigation retains accessible labels and hover titles; mobile navigation remains a modal drawer.                                                                |
| Account and theme controls | Keep the active account's name and workspace label visible, with an understated initial avatar. Theme choice remains a labeled native select with its existing persistence and cross-tab synchronization.                                                                                     |
| Authentication layout      | Keep the form first in reading order with a concise introduction, comfortable field rhythm, and one clear submit action. On wide screens, the editorial panel adds context with restrained campus imagery and typography; phones retain the complete form without decorative clutter.         |
| Links and cards            | Underline text links and provide clear hover/focus feedback. Linked cards use restrained border and surface changes, while their accessible text continues to describe the destination.                                                                                                       |

Use `TextField.trailingAction` for input actions such as password visibility. Its wrapper anchors the action to the input, so a wrapped hint or error cannot push it onto the supporting text. Required marks remain outside the actual label to preserve its exact text and native label association.

The shell's navigation opener and sidebar toggle remain disabled in server-rendered HTML until hydration attaches their event handlers. This keeps an early click from silently disappearing while a newly opened portal loads its JavaScript. Native links continue to provide navigation independently of these controls.

Credential forms use the same `useClientReady` helper. Their fields, placement choices, and submit controls wait for hydration, with a short loading caption and a JavaScript-disabled explanation. Their native method is `post`, so a fallback submission cannot put credentials into a URL. Once ready, existing pending labels and validation rules continue to apply.

Spacing improvements must not remove saved draft protection, alter privilege checks, invent unavailable data, or turn a print view into an authenticated data leak. Test the actual workflow alongside its appearance.

Check both modes with keyboard navigation, long labels, zoom, and narrow viewports. Target WCAG 2.2 AA. [Accessibility standard](https://www.w3.org/TR/WCAG22/)
