# Dark/Light Theme Toggle — Design

**Date:** 2026-07-17
**Status:** Approved

## Goal

Add a dark/light theme toggle to the watermark tool. An icon button in the
top-right corner of the header switches between themes. First visit follows
the OS `prefers-color-scheme`; once the user toggles, the choice is persisted
in `localStorage` and wins over the OS setting on later visits.

## Approach

Tailwind CSS 4 `dark:` variant driven by a `.dark` class on `<html>`
(approach A — chosen over semantic CSS variables, which would require
refactoring every existing color class for no benefit at this project size).

## Components

### `index.html` — pre-render theme script

Inline `<script>` in `<head>`, runs before React loads to avoid a flash of
the wrong theme (FOUC):

1. Read `localStorage.theme` (`"dark"` / `"light"`).
2. If absent, fall back to `matchMedia('(prefers-color-scheme: dark)')`.
3. Add `.dark` to `document.documentElement` when dark.
4. Wrapped in `try/catch` — if `localStorage` throws (private mode),
   fall back to the media query only.

### `src/index.css`

Add one line so the `dark:` variant follows the class instead of only the
media query:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

### `src/hooks/useTheme.ts` (new)

Returns `{ theme, toggle }`:

- `theme: 'light' | 'dark'` — initial value read from
  `document.documentElement.classList.contains('dark')` (already set by the
  inline script).
- `toggle()` — flips state, syncs the `.dark` class on `<html>`, and writes
  `localStorage.theme` inside `try/catch` (ignore write failures; theme still
  switches for the session).

### `src/components/ThemeToggle.tsx` (new)

Icon button using inline SVG (no new dependencies):

- Light mode → moon icon (pressing switches to dark).
- Dark mode → sun icon (pressing switches to light).
- `aria-label` describing the action (e.g. 「切換為深色主題」).
- Styled consistently with the existing UI, with `dark:` variants.

### `src/App.tsx`

- Header becomes a flex row: title/subtitle on the left, `<ThemeToggle />`
  on the right.
- Add `dark:` counterparts to existing color classes.

### `src/components/ImageUploader.tsx`, `src/components/ControlPanel.tsx`

Add `dark:` counterparts to existing color classes. `WatermarkCanvas.tsx`
has no color classes — untouched.

## Color mapping

| Role | Light | Dark |
| --- | --- | --- |
| Page background | `bg-gray-100` | `dark:bg-gray-900` |
| Card / header background | `bg-white` | `dark:bg-gray-800` |
| Primary text | `text-gray-800` | `dark:text-gray-100` |
| Secondary text | `text-gray-500` | `dark:text-gray-400` |
| Borders | `border-gray-200` | `dark:border-gray-700` |
| Primary action (blue) | `bg-blue-600` | keep, adjust hover if needed |
| Error banner (red) | `bg-red-100 text-red-700` | `dark:bg-red-950 dark:text-red-300` |
| Disabled button | `disabled:bg-gray-300` | `dark:disabled:bg-gray-600` |

Exact shades may be tuned during implementation for contrast; the mapping
above is the baseline.

## Error handling

- `localStorage` unavailable (private mode / blocked): try/catch around both
  read (inline script) and write (`toggle`). Behavior degrades to
  follow-system with per-session toggling — never crashes.

## Testing / verification

No test framework exists in this project. Verification:

1. `npm run lint` and `npm run build` pass.
2. Manual check via dev server: toggle switches all UI surfaces; reload
   keeps the chosen theme; first visit (cleared storage) follows the OS
   setting; no flash of wrong theme on load.
