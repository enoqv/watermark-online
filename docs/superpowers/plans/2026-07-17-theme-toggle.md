# Dark/Light Theme Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dark/light theme toggle button in the header's top-right corner, following the OS preference on first visit and persisting the user's choice in localStorage.

**Architecture:** Tailwind CSS 4 `dark:` variant driven by a `.dark` class on `<html>`. An inline script in `index.html` sets the class before React loads (no FOUC). A `useTheme` hook owns toggle + persistence; a `ThemeToggle` icon button lives in the header. Existing components get `dark:` counterparts for their color classes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4 (`@tailwindcss/vite`), Vite 8. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-17-theme-toggle-design.md`

## Global Constraints

- No new npm dependencies — icons are inline SVG.
- `localStorage` access always wrapped in `try/catch`; failure degrades to follow-system, never crashes.
- localStorage key: `theme`, values: `"dark"` / `"light"` only.
- No test framework in this project — each task is verified with `npm run lint` + `npm run build` (run from repo root); final task adds a manual dev-server check.
- UI copy is Traditional Chinese (zh-Hant), matching existing copy.
- Commit messages in English, no AI attribution.

---

### Task 1: Theme infrastructure (pre-render script, dark variant, useTheme hook)

**Files:**
- Modify: `index.html` (add inline script in `<head>`)
- Modify: `src/index.css` (add custom variant)
- Create: `src/hooks/useTheme.ts`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `useTheme(): { theme: 'light' | 'dark'; toggle: () => void }` exported from `src/hooks/useTheme.ts` (named export `useTheme`, named type export `Theme`). Task 2 imports this.

- [ ] **Step 1: Add the pre-render theme script to `index.html`**

In `index.html`, insert the inline script immediately after the `<title>` line, so the `<head>` becomes:

```html
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="data:," />
    <title>圖片浮水印工具</title>
    <script>
      // 在 React 載入前決定主題，避免進頁面時閃爍（FOUC）
      (function () {
        var dark;
        try {
          var stored = localStorage.getItem('theme');
          dark = stored === 'dark' || (stored !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
        } catch (e) {
          // localStorage 不可用（如隱私模式）：退回跟隨系統
          dark = matchMedia('(prefers-color-scheme: dark)').matches;
        }
        if (dark) document.documentElement.classList.add('dark');
      })();
    </script>
  </head>
```

- [ ] **Step 2: Register the class-based dark variant in `src/index.css`**

Replace the entire file content with:

```css
@import "tailwindcss";

/* dark: variant 改由 <html> 上的 .dark class 控制，而非只跟系統設定 */
@custom-variant dark (&:where(.dark, .dark *));
```

- [ ] **Step 3: Create `src/hooks/useTheme.ts`**

```ts
export type Theme = 'light' | 'dark';

import { useState } from 'react';

export function useTheme() {
  // index.html 的 inline script 已在 React 載入前設好 .dark class，直接讀取
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    } catch {
      // 寫入失敗（如隱私模式）：本次仍切換，只是不記憶
    }
    setTheme(next);
  };

  return { theme, toggle };
}
```

Note: put the `import` line first and the `export type` after it (shown together above for completeness):

```ts
import { useState } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  // ...as above
}
```

- [ ] **Step 4: Verify lint and build pass**

Run: `npm run lint && npm run build`
Expected: both exit 0, no errors. (`useTheme` is not imported anywhere yet — ESLint has no unused-export rule here, so this passes.)

- [ ] **Step 5: Commit**

```bash
git add index.html src/index.css src/hooks/useTheme.ts
git commit -m "Add theme infrastructure: pre-render script, dark variant, useTheme hook"
```

---

### Task 2: ThemeToggle button + header integration + App dark classes

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useTheme()` from `src/hooks/useTheme.ts` (Task 1) — `{ theme: 'light' | 'dark'; toggle: () => void }`.
- Produces: `ThemeToggle` default export (no props). Rendered in App's header.

- [ ] **Step 1: Create `src/components/ThemeToggle.tsx`**

```tsx
import { useTheme } from '../hooks/useTheme';

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const label = theme === 'dark' ? '切換為淺色主題' : '切換為深色主題';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
```

- [ ] **Step 2: Update `src/App.tsx` — header layout + dark classes**

Add the import at the top with the other component imports:

```tsx
import ThemeToggle from './components/ThemeToggle';
```

Replace the returned JSX (the whole `return (...)`) with:

```tsx
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">圖片浮水印工具</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">完全在瀏覽器本地運行，圖片不會上傳到任何地方</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        <main className="flex flex-1 flex-col items-center justify-center gap-4">
          {error && (
            <p className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>
          )}
          {image ? (
            <>
              <WatermarkCanvas image={image} options={options} canvasRef={canvasRef} />
              <ImageUploader hasImage onImageLoad={handleImageLoad} onError={setError} />
            </>
          ) : (
            <ImageUploader hasImage={false} onImageLoad={handleImageLoad} onError={setError} />
          )}
        </main>

        <aside className="w-full shrink-0 self-start rounded-xl bg-white p-5 shadow-sm lg:w-80 dark:bg-gray-800">
          <ControlPanel options={options} onChange={handleChange} />
          <button
            type="button"
            onClick={handleDownload}
            disabled={!image}
            className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600"
          >
            下載圖片
          </button>
        </aside>
      </div>
    </div>
  );
```

All logic above the `return` stays unchanged.

- [ ] **Step 3: Verify lint and build pass**

Run: `npm run lint && npm run build`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/ThemeToggle.tsx src/App.tsx
git commit -m "Add theme toggle button to header with dark styles for app shell"
```

---

### Task 3: Dark classes for ImageUploader and ControlPanel

**Files:**
- Modify: `src/components/ImageUploader.tsx`
- Modify: `src/components/ControlPanel.tsx`

**Interfaces:**
- Consumes: nothing — pure className changes, no logic or props change.
- Produces: nothing new.

- [ ] **Step 1: Update `src/components/ImageUploader.tsx` classNames**

Three changes, logic untouched.

The "重新選擇圖片" button (`hasImage` branch) className becomes:

```tsx
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
```

The dropzone `<div>` className template becomes:

```tsx
      className={`flex h-72 w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        dragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
          : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
      }`}
```

The two `<p>` lines inside the dropzone become:

```tsx
      <p className="text-gray-600 dark:text-gray-300">點擊選擇圖片，或將圖片拖放到這裡</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">完全在瀏覽器本地處理，不會上傳</p>
```

- [ ] **Step 2: Update `src/components/ControlPanel.tsx` classNames**

Six changes, logic untouched.

Every label line `<div className="mb-1 text-sm text-gray-600">` and the Slider's `<div className="mb-1 flex justify-between text-sm text-gray-600">` get `dark:text-gray-300` appended, e.g.:

```tsx
      <div className="mb-1 flex justify-between text-sm text-gray-600 dark:text-gray-300">
```

```tsx
        <div className="mb-1 text-sm text-gray-600 dark:text-gray-300">浮水印文字</div>
```

(Apply the same `dark:text-gray-300` suffix to all four label `<div>`s: 浮水印文字, 排列模式, 文字顏色, and the Slider label row.)

The `<textarea>` className becomes:

```tsx
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
```

The mode button's unselected branch becomes:

```tsx
                options.mode === mode
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
```

The preset color swatch button className becomes (ring-offset must match the dark card background):

```tsx
              className={`h-7 w-7 rounded-full border ${
                options.color === color
                  ? 'ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-gray-800'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
```

The `<input type="color">` className becomes:

```tsx
            className="h-7 w-7 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
```

- [ ] **Step 3: Verify lint and build pass**

Run: `npm run lint && npm run build`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/ImageUploader.tsx src/components/ControlPanel.tsx
git commit -m "Add dark mode styles to ImageUploader and ControlPanel"
```

---

### Task 4: End-to-end manual verification

**Files:**
- No file changes expected (fix-ups only if a check fails).

**Interfaces:**
- Consumes: everything from Tasks 1–3.
- Produces: verified feature.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (background). Open the printed URL (default `http://localhost:5173`).

- [ ] **Step 2: Verify toggle behavior**

- Click the moon icon (light mode) → page, header, card, buttons, inputs all switch to dark; icon becomes a sun.
- Click again → back to light.
- Upload an image and confirm the control panel, dropzone/re-select button, and error styles (if triggered) look correct in both themes.

- [ ] **Step 3: Verify persistence and first-visit behavior**

- Toggle to dark, reload → stays dark (localStorage `theme` = `dark`).
- In DevTools console run `localStorage.removeItem('theme')`, set the OS/emulated preference to dark (DevTools → Rendering → emulate `prefers-color-scheme: dark`), reload → page loads dark with no white flash.
- Emulate light preference, reload → loads light.

- [ ] **Step 4: Fix anything found, re-run lint/build, commit fixes if any**

Run: `npm run lint && npm run build`
Expected: both exit 0. If fixes were needed:

```bash
git add -A src index.html
git commit -m "Polish dark mode styles"
```
