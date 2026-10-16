# ACME Salary Management System
## UI/UX Design Guidelines

**Document ID:** 13  
**Design direction:** Clean, sleek, professional enterprise HR portal  
**Audience:** HR Manager

## 1. Experience Goals

- Make employee management and compensation analytics equally easy to find.
- Support efficient daily HR work without visual clutter.
- Establish trust through consistent, clear handling of salary values and changes.
- Make the UI feel like a polished contemporary business application, not a generic starter template.
- Prioritize accessibility, responsiveness, and predictable interaction patterns.

## 2. Information Architecture

### Primary navigation
- **Employees:** directory, search, filters, pagination, employee details, create/edit forms, salary update, and salary history.
- **Analytics:** compensation metrics, department breakdown, and shared filters.
- **Account menu:** signed-in HR identity and logout.

Use separate Employees and Analytics views with clear active-navigation states. Avoid adding sections that are not supported by the agreed scope.

## 3. Dashboard Structure

### Analytics page
- Page title and brief context.
- Filter row: department, country, job title, minimum salary, maximum salary, and a clear/reset action.
- KPI cards: average, median, minimum, maximum, and employee count.
- Department breakdown presented as a readable table and/or restrained chart.
- Clear currency labels (`USD`) and consistent two-decimal formatting.
- Explicit empty state when no employees match the filters.

### Employees page
- Page title and primary “Add employee” action.
- Search input and filter controls.
- Table with employee ID, name, email, department, job title, country, and current salary.
- Server-side pagination and stable sorting.
- Row action to view/edit employee details.
- Salary update must be a distinct action from editing non-salary details.

## 4. Visual Design Principles

- Use a restrained neutral palette with one primary accent color.
- Use consistent spacing, typography, border radius, shadows, and icon style.
- Favor strong hierarchy and whitespace over dense decoration.
- Use tables for precise employee data; use charts only where they improve comparison.
- Use consistent currency formatting and alignment for salary columns.
- Use subtle separators and clear hover/focus states.
- Avoid excessive gradients, glassmorphism, animated transitions, and decorative cards that reduce data density.
- Do not copy another product's branding or exact interface.

## 5. Design Tokens

The implementation should define tokens centrally and use them consistently. Final hex values may be selected by the frontend agent within this direction.

- **Background:** light neutral page background.
- **Surface:** white or near-white cards and tables.
- **Text:** high-contrast primary text and muted secondary text.
- **Primary:** one restrained blue or indigo accent for primary actions and focus.
- **Success:** semantic green for confirmed success.
- **Warning:** amber for caution.
- **Error:** red for validation and operation failures.
- **Borders:** subtle neutral separators.
- **Typography:** modern sans-serif with clear size/weight hierarchy.
- **Spacing:** consistent scale, preferably based on 4px increments.
- **Radius:** consistent small/medium rounding; avoid excessive pill-shaped containers.
- **Focus:** visible keyboard focus ring.

## 6. Interaction Requirements

- Forms have visible labels, inline validation, and clear submit/cancel actions.
- Disable submit buttons while a request is in progress to prevent accidental duplicates.
- Confirm destructive actions if any are introduced later; permanent employee deletion is not in scope.
- On successful salary update, show confirmation and refresh the current salary and history.
- On server errors, show a safe, actionable message without exposing internal details.
- Search/filter changes should be predictable; avoid unexpectedly resetting unrelated filters.
- Include loading, empty, error, and success states for data-driven views.
- Use accessible dialog behavior if modals are chosen.
- Preserve filter state when moving between relevant employee/analytics interactions where practical.

## 7. Accessibility and Responsive Design

- Use semantic HTML and correct heading order.
- Ensure keyboard navigation and visible focus.
- Associate labels with form controls and provide accessible names for icon-only buttons.
- Do not rely on color alone to communicate status.
- Maintain sufficient text/background contrast.
- Support common desktop and tablet widths; on narrow screens, allow horizontal table scrolling or a deliberate compact layout.
- Respect reduced-motion preferences if animation is used.

## 8. Salary-Specific UX

- Always label salary values as USD.
- Use consistent two-decimal display rules.
- In the salary update form, clearly show the current salary before entering the new salary.
- Explain that the previous salary is captured automatically.
- Require an effective date and display it clearly in history.
- Do not let the general employee edit form change salary.
- Do not combine unrelated currencies or imply exchange-rate conversion.

## 9. Design Acceptance Checklist

- [ ] Employees and Analytics are clearly separated in navigation.
- [ ] HR can reach all required actions without confusing navigation.
- [ ] Tables, filters, forms, and KPI cards share one design system.
- [ ] Loading, empty, validation, error, and success states are implemented.
- [ ] Salary is clearly labeled USD everywhere.
- [ ] Core flows are keyboard accessible.
- [ ] The layout remains usable at desktop and tablet widths.
- [ ] UI uses real API data in the completed application, not placeholder-only metrics.
