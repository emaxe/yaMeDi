# Design spec: apply Evreghen Command Center design system to testApp

Date: 2026-06-14
Approach: Layout-driven redesign
Source design: `testApp/DESIGN.md`

## Goal

Redesign the existing `testApp` (Yandex Metrics Dashboard, Electron + React + Vite + Tailwind CSS) so that its visual language matches the **Evreghen Command Center** design system described in `testApp/DESIGN.md`:

- Warm off-white workspace (`#fcfaf7`) with dark frosted-glass shell.
- Orange (`#fe6e00` / `#ff6b00`) as the primary action, telemetry, and focus color.
- System-sans typography, compact spacing, and restrained depth.
- Neutral analytical surfaces that let status badges and telemetry stand out.

## Constraints

- Keep the current stack: React 18, TypeScript, Vite, Electron, Tailwind CSS, Recharts, React Query.
- Do not change the application functionality (tabs, API calls, data flows).
- Preserve existing test structure; update tests to match new classes and markup.
- First iteration adds only a frosted sidebar; a top header is not added because the current app has no user/search functionality.

## Architecture and tokens

### Tailwind theme extension

Extend `tailwind.config.js` with the following design tokens from `DESIGN.md`:

- **Colors:** `background`, `on-background`, `surface`, `surface-soft`, `surface-elevated`, `on-surface`, `on-surface-muted`, `outline`, `outline-strong`, `primary`, `primary-strong`, `primary-warm`, `primary-focus`, `on-primary`, `shell-base`, `on-shell`, `shell-border`, `success`, `warning`, `danger`, `info`, `status-mock-bg`, `status-mock-fg`, `status-planned-bg`, `status-planned-fg`, `status-development-bg`, `status-development-fg`, `status-integrated-bg`, `status-integrated-fg`, `status-production-bg`, `status-production-fg`, `dark-background`, `dark-surface`, `dark-on-surface`, `dark-on-surface-muted`.
- **Typography:** `display-hero`, `headline-xl`, `headline-lg`, `title-md`, `body-lg`, `body-md`, `body-sm`, `label-md`, `label-sm`, `code-sm` (font family, size, weight, line height, letter spacing).
- **Spacing:** `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `container-padding`.
- **Border radius:** `xs`, `sm`, `md`, `lg`, `pill`.
- **Shadows:** `subtle`, `raised`, `dialog`.
- **Layout constants:** `container-max`, `shell-header-height`, `shell-sidebar-expanded`, `shell-sidebar-collapsed`.
- **Motion constants:** `fast`, `normal`, `slow`, `panel`, `easing-standard`.

### CSS variables

Update `src/index.css` to:

- Set `body` background to `background` and text color to `on-background`.
- Set `font-family` to `ui-sans-serif, system-ui, sans-serif`.
- Add CSS custom properties for shell transparency/blur if they are not directly expressible in Tailwind utilities (e.g., `--shell-blur: 12px`, `--shell-opacity: 0.70`, `--shell-border-opacity: 0.10`).
- Recolor scrollbars to neutral/warm tones (`outline` track, `outline-strong` thumb).
- Remove the old `yandex-dark` / `yandex-card` / `yandex-border` styling.

### Color migration

- Replace all `bg-yandex-*`, `text-yandex-*`, `border-yandex-*` usages with the new design tokens.
- Remove the `yandex` color map from `tailwind.config.js` after the migration (or mark as deprecated).

## Shell layout

### App.tsx

- Root container: `flex h-screen w-screen overflow-hidden bg-background`.
- Keep the existing tab switcher logic and lazy loading.
- Main content area: `flex-1 overflow-y-auto`, light background, centered container.

### Sidebar

- Width: `256px` (`shell-sidebar-expanded`).
- Background: `bg-shell-base/70` (`#000000` at 70% opacity) with `backdrop-blur-xl` (12px blur).
- Right border: `border-white/10` (shell-border opacity).
- Text: `text-white/70` for normal items, `text-white` for active/hover.
- Active item: `bg-primary text-on-primary` with `rounded-md`.
- Hover item: `bg-white/10 text-white`.
- Disabled item: `opacity-40 cursor-not-allowed`.
- Header block (title + subtitle) in sidebar: white text, subtle bottom border.
- Footer (version): `text-white/50`.
- Focus rings: `ring-primary-focus`.

### Top header

Not added in this iteration. The current app has no user, search, or global actions that justify a top bar. The sidebar alone provides the dark frosted shell framing. A top header can be added later if global search or user profile is introduced.

## Workspace content

### Page container

- `max-w-[1400px]` centered with `32px` horizontal padding (`container-padding`).
- Vertical section spacing: `24px` (`xl`).
- Card grids: `16px` (`lg`) gaps.

### Surfaces

- Cards: `bg-surface-elevated` (`#ffffff`), `rounded-lg` (`12px`), `border border-outline`, `shadow-subtle`.
- Muted panels: `bg-surface-soft`.
- Tables: neutral background, header `48px` tall, small text, compact padding.
- Status badges: use the `status-*` token pairs, fully rounded (`pill`), small uppercase labels.

## Components

### Card

```
bg-surface-elevated rounded-lg border border-outline shadow-subtle
```

### Button

- **Primary:** `bg-primary text-on-primary rounded-sm h-10 px-4 font-medium hover:bg-primary-strong transition-fast`.
- **Ghost (for shell):** `bg-transparent text-white/70 hover:bg-white/10 hover:text-white rounded-md h-10 w-10`.

### Input

- **Surface input:** `bg-surface-elevated text-on-surface border border-outline rounded-sm h-9 px-3 focus:border-primary-focus focus:ring-primary-focus`.
- Shell input is not required in this iteration.

### StatCard and ChartCard

- Use the base `Card` with `p-6` (24px) internal padding.
- Label: `label-sm uppercase text-on-surface-muted`.
- Value: `headline-lg text-on-background`.
- Chart cards use `bg-primary/60` for bars/areas.

### Badge

- Map statuses to the `status-*` token pairs from `DESIGN.md`.
- Shape: `rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide`.

### Skeleton

- Use `bg-surface-soft` and animate pulse; replace dark blue skeletons.

### ErrorAlert

- Light surface card with `text-danger` and `border-danger` accent.

## Page-by-page migration

### TokenSetup

- Move from a dark screen to a centered white card on a light workspace.
- Input: surface input style.
- Button: primary orange.
- Preserve form validation and error messages.

### Diagnostics

- Wrap `AccountInfo` and `ScopesCheck` in light cards.
- Use status badges for token scope results.

### CountersList

- Render the counter table in a neutral card.
- Use `label-sm` uppercase for the table header.
- Use status badges for counter states if applicable.

### MetricsDashboard

- `TotalsSection` as a grid of `StatCard` components.
- `TrafficChart`, `SourcesChart`, `DevicesChart` inside `ChartCard` components.
- Recharts fills: `rgba(254, 110, 0, 0.6)`; axes and grid use `outline`/`on-surface-muted`.

### Campaigns

- Migrate cards/tables to light surfaces and neutral/primary accents.

## Charts and telemetry

- Recharts color palette: primary orange at 60% opacity for fills, primary-strong for strokes.
- Axis tick: `on-surface-muted`.
- Grid lines: `outline`.
- Tooltips: white surface, subtle shadow, dark text.

## Motion and elevation

- Transitions: `150ms` for fast states, `200ms` normal, `300ms` for panels; `ease-out` / `cubic-bezier(0.4, 0, 0.2, 1)`.
- Card hover: `shadow-raised`.
- Shell: `12px` backdrop blur.
- Focus rings: `2px` `primary-focus`.

## Error handling and accessibility

- Preserve existing error boundaries and loading states.
- Ensure focus rings are visible on all interactive controls.
- Maintain `aria-current`, `aria-disabled`, and keyboard navigation on the sidebar.
- Error and warning states use `danger` and `warning` colors; do not rely solely on color.

## Testing

- Update existing unit tests that assert on Tailwind classes (e.g., `TokenSetup.test.tsx`, `CountersList.test.tsx`).
- Run `npm run lint`, `npm run typecheck`, `npm run test:unit` after the migration.
- Run `npm run dev` and manually verify:
  - Sidebar frosted glass appearance.
  - Active/hover navigation states.
  - Light workspace background.
  - Card surfaces, shadows, and borders.
  - Chart orange fills and muted axes.
  - Badge colors and table density.

## Out of scope

- Adding a top header or global search.
- New features, pages, or API endpoints.
- Dark mode toggle (the design system includes dark tokens, but default light mode remains the primary identity).
- Animation beyond standard Tailwind transitions.

## Open questions

None. The design system in `testApp/DESIGN.md` is treated as the authoritative source of truth.
