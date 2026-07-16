# 圖片浮水印線上工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一個完全在瀏覽器本地運行的圖片浮水印工具：上傳圖片、疊加可自訂文字浮水印（平鋪／置中）、即時預覽、下載成品。

**Architecture:** Canvas 單一渲染來源 — 圖片與浮水印皆由 `lib/watermark.ts` 的純函式繪於全解析度 `<canvas>`，預覽以 CSS 縮放顯示同一個 canvas，下載直接 `canvas.toBlob()`，保證所見即所得。React 管理參數狀態，三個元件（上傳、預覽、控制面板）由 `App` 組合。

**Tech Stack:** React（最新版）+ Vite（最新版）+ Tailwind CSS v4（`@tailwindcss/vite` plugin）+ TypeScript。

## Global Constraints

- Runtime 依賴僅 `react`、`react-dom`；其餘皆為 devDependencies，不得新增其他套件。
- 完全本地運行：程式碼不得發出任何網路請求（fetch/XHR/外部資源連結皆禁止）。
- UI 文案用繁體中文；commit message 用英文，且**不加** Claude 生成標記（不加 Co-Authored-By）。
- 不引入測試框架（spec 指定手動驗證為主）：每個 task 以 `npm run build`（tsc + vite build）驗證型別與建置，最後一個 task 附完整手動驗證清單。
- 安裝套件一律不鎖版本（抓 npm latest）。

---

### Task 1: 專案鷹架（Vite + React + TS + Tailwind v4）

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/App.tsx`（暫時佔位，Task 6 會整個改寫）

**Interfaces:**
- Consumes: 無
- Produces: 可執行的 `npm run dev` / `npm run build`；`src/App.tsx` 為 default export 的 React 元件；Tailwind class 全域可用。

> 注意：不要用 `npm create vite` 互動式鷹架（目錄已有 docs/ 與 .git，會觸發互動提示）。直接手寫以下檔案，再 `npm install` 抓最新版。

- [ ] **Step 1: 建立 `package.json`**

```json
{
  "name": "watermark-online",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 2: 建立 `.gitignore`**

```
node_modules
dist
```

- [ ] **Step 3: 安裝最新版依賴**

Run:
```bash
npm install react react-dom
npm install -D typescript vite @vitejs/plugin-react @types/react @types/react-dom tailwindcss @tailwindcss/vite
```
Expected: 安裝成功，`package.json` 的 dependencies 只有 `react`、`react-dom`。

- [ ] **Step 4: 建立 `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 5: 建立 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 6: 建立 `index.html`**

```html
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="data:," />
    <title>圖片浮水印工具</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

（`<link rel="icon" href="data:," />` 是為了避免瀏覽器自動請求 /favicon.ico。）

- [ ] **Step 7: 建立 `src/index.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 8: 建立 `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 9: 建立佔位 `src/App.tsx`**

```tsx
export default function App() {
  return <h1 className="p-6 text-lg font-bold text-gray-800">圖片浮水印工具</h1>;
}
```

- [ ] **Step 10: 驗證建置**

Run: `npm run build`
Expected: tsc 無錯誤，vite build 產出 `dist/`，且 build log 沒有警告 Tailwind 未生效之類的訊息。

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "Scaffold Vite + React + TypeScript + Tailwind v4 project"
```

---

### Task 2: 浮水印繪製核心 `lib/watermark.ts`

**Files:**
- Create: `src/lib/watermark.ts`

**Interfaces:**
- Consumes: 無（純函式，只用 Canvas 2D API）
- Produces:
  - `interface WatermarkOptions { text: string; mode: 'tile' | 'center'; color: string; rotation: number; opacity: number; lineHeight: number; fontSize: number; }`
  - `const DEFAULT_OPTIONS: WatermarkOptions`
  - `function drawWatermark(ctx: CanvasRenderingContext2D, image: HTMLImageElement, options: WatermarkOptions): void`

- [ ] **Step 1: 建立 `src/lib/watermark.ts`**

```ts
export interface WatermarkOptions {
  text: string;        // 多行以 \n 分隔
  mode: 'tile' | 'center';
  color: string;       // hex，例如 #ffffff
  rotation: number;    // 角度，-180 ~ 180
  opacity: number;     // 0 ~ 1
  lineHeight: number;  // 行高倍率（相對 fontSize）
  fontSize: number;    // px，相對原圖尺寸
}

export const DEFAULT_OPTIONS: WatermarkOptions = {
  text: '僅供驗證使用',
  mode: 'tile',
  color: '#ffffff',
  rotation: -30,
  opacity: 0.5,
  lineHeight: 2,
  fontSize: 48,
};

const FONT_FAMILY =
  "'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif";

// 把原圖 + 浮水印畫到 ctx（canvas 尺寸須等於原圖尺寸）。預覽與下載共用。
export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  options: WatermarkOptions,
): void {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  const lines = options.text.split('\n').filter((line) => line.trim() !== '');
  if (lines.length === 0) return;

  ctx.save();
  ctx.globalAlpha = options.opacity;
  ctx.fillStyle = options.color;
  ctx.font = `${options.fontSize}px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.translate(width / 2, height / 2);
  ctx.rotate((options.rotation * Math.PI) / 180);

  if (options.mode === 'center') {
    drawCenterLines(ctx, lines, options);
  } else {
    drawTiledLines(ctx, lines, options, width, height);
  }

  ctx.restore();
}

// 以 (0, 0) 為中心逐行繪製多行文字，行距 = fontSize * lineHeight
function drawCenterLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  options: WatermarkOptions,
): void {
  const step = options.fontSize * options.lineHeight;
  const startY = (-step * (lines.length - 1)) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, startY + i * step);
  });
}

// 在旋轉後的座標系中，以文字區塊為單位鋪滿整張圖（奇偶列水平交錯）
function drawTiledLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  options: WatermarkOptions,
  width: number,
  height: number,
): void {
  const radius = Math.hypot(width, height) / 2; // 半對角線長，確保任意旋轉角度下仍鋪滿
  const innerStep = options.fontSize * 1.2;     // 區塊內多行文字用固定行距
  const blockHeight = innerStep * (lines.length - 1);
  const maxLineWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
  const stepX = maxLineWidth + options.fontSize * 2;
  const stepY = blockHeight + options.fontSize * options.lineHeight; // lineHeight 控制列與列的間距

  let row = 0;
  for (let y = -radius; y <= radius + blockHeight; y += stepY, row++) {
    const offsetX = row % 2 === 0 ? 0 : stepX / 2;
    for (let x = -radius; x <= radius; x += stepX) {
      lines.forEach((line, i) => {
        ctx.fillText(line, x + offsetX, y - blockHeight / 2 + i * innerStep);
      });
    }
  }
}
```

- [ ] **Step 2: 驗證型別**

Run: `npm run build`
Expected: tsc 無錯誤，建置成功。

- [ ] **Step 3: Commit**

```bash
git add src/lib/watermark.ts
git commit -m "Add pure canvas watermark drawing core"
```

---

### Task 3: 上傳元件 `ImageUploader`

**Files:**
- Create: `src/components/ImageUploader.tsx`

**Interfaces:**
- Consumes: 無
- Produces: default export 元件，props：
  - `hasImage: boolean` — true 時只渲染「重新選擇圖片」按鈕；false 時渲染整個拖放區
  - `onImageLoad: (image: HTMLImageElement) => void` — 圖片解碼完成後呼叫（`image.src` 為 object URL，呼叫端負責 revoke 舊圖）
  - `onError: (message: string) => void` — 非圖片檔或載入失敗時呼叫

- [ ] **Step 1: 建立 `src/components/ImageUploader.tsx`**

```tsx
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';

interface Props {
  hasImage: boolean;
  onImageLoad: (image: HTMLImageElement) => void;
  onError: (message: string) => void;
}

export default function ImageUploader({ hasImage, onImageLoad, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const loadFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError('請選擇圖片檔案（png、jpg、webp…）');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => onImageLoad(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      onError('圖片載入失敗，請換一張試試');
    };
    img.src = url;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    loadFile(e.target.files?.[0]);
    e.target.value = ''; // 允許重選同一個檔案
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    loadFile(e.dataTransfer.files?.[0]);
  };

  const fileInput = (
    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
  );

  if (hasImage) {
    return (
      <>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          重新選擇圖片
        </button>
        {fileInput}
      </>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex h-72 w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <span className="text-4xl">🖼️</span>
      <p className="text-gray-600">點擊選擇圖片，或將圖片拖放到這裡</p>
      <p className="text-xs text-gray-400">完全在瀏覽器本地處理，不會上傳</p>
      {fileInput}
    </div>
  );
}
```

- [ ] **Step 2: 驗證型別**

Run: `npm run build`
Expected: tsc 無錯誤，建置成功。

- [ ] **Step 3: Commit**

```bash
git add src/components/ImageUploader.tsx
git commit -m "Add image uploader with click and drag-and-drop"
```

---

### Task 4: 預覽元件 `WatermarkCanvas`

**Files:**
- Create: `src/components/WatermarkCanvas.tsx`

**Interfaces:**
- Consumes: Task 2 的 `drawWatermark(ctx, image, options)`、`WatermarkOptions`
- Produces: default export 元件，props：
  - `image: HTMLImageElement`
  - `options: WatermarkOptions`
  - `canvasRef: RefObject<HTMLCanvasElement | null>` — 由 App 持有，下載時直接取用（canvas 為原圖全解析度）

- [ ] **Step 1: 建立 `src/components/WatermarkCanvas.tsx`**

```tsx
import { useEffect, type RefObject } from 'react';
import { drawWatermark, type WatermarkOptions } from '../lib/watermark';

interface Props {
  image: HTMLImageElement;
  options: WatermarkOptions;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

// canvas 內部維持原圖解析度（下載不失真），僅以 CSS 縮小顯示；
// 參數變動用 requestAnimationFrame 節流重繪。
export default function WatermarkCanvas({ image, options, canvasRef }: Props) {
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) drawWatermark(ctx, image, options);
    });
    return () => cancelAnimationFrame(id);
  }, [image, options, canvasRef]);

  return <canvas ref={canvasRef} className="max-h-[70vh] max-w-full rounded-lg shadow-lg" />;
}
```

- [ ] **Step 2: 驗證型別**

Run: `npm run build`
Expected: tsc 無錯誤，建置成功。

- [ ] **Step 3: Commit**

```bash
git add src/components/WatermarkCanvas.tsx
git commit -m "Add full-resolution live preview canvas"
```

---

### Task 5: 控制面板 `ControlPanel`

**Files:**
- Create: `src/components/ControlPanel.tsx`

**Interfaces:**
- Consumes: Task 2 的 `WatermarkOptions`（僅型別）
- Produces: default export 元件，props：
  - `options: WatermarkOptions`
  - `onChange: (patch: Partial<WatermarkOptions>) => void`

- [ ] **Step 1: 建立 `src/components/ControlPanel.tsx`**

```tsx
import type { WatermarkOptions } from '../lib/watermark';

const PRESET_COLORS = ['#ffffff', '#000000', '#ef4444', '#6b7280', '#3b82f6', '#eab308'];

const MODES = [
  ['tile', '平鋪'],
  ['center', '單一置中'],
] as const;

interface Props {
  options: WatermarkOptions;
  onChange: (patch: Partial<WatermarkOptions>) => void;
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex justify-between text-sm text-gray-600">
        <span>{label}</span>
        <span className="tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
    </label>
  );
}

export default function ControlPanel({ options, onChange }: Props) {
  return (
    <div className="space-y-5">
      <label className="block">
        <div className="mb-1 text-sm text-gray-600">浮水印文字</div>
        <textarea
          value={options.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </label>

      <div>
        <div className="mb-1 text-sm text-gray-600">排列模式</div>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ mode })}
              className={`rounded-md border px-3 py-2 text-sm ${
                options.mode === mode
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 text-sm text-gray-600">文字顏色</div>
        <div className="flex items-center gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ color })}
              aria-label={`顏色 ${color}`}
              className={`h-7 w-7 rounded-full border ${
                options.color === color ? 'ring-2 ring-blue-600 ring-offset-1' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={options.color}
            onChange={(e) => onChange({ color: e.target.value })}
            aria-label="自訂顏色"
            title="自訂顏色"
            className="h-7 w-7 cursor-pointer rounded border border-gray-300"
          />
        </div>
      </div>

      <Slider
        label="旋轉角度"
        value={options.rotation}
        min={-180}
        max={180}
        display={`${options.rotation}°`}
        onChange={(rotation) => onChange({ rotation })}
      />
      <Slider
        label="透明度"
        value={options.opacity}
        min={0}
        max={1}
        step={0.01}
        display={`${Math.round(options.opacity * 100)}%`}
        onChange={(opacity) => onChange({ opacity })}
      />
      <Slider
        label="行高"
        value={options.lineHeight}
        min={1}
        max={10}
        step={0.1}
        display={options.lineHeight.toFixed(1)}
        onChange={(lineHeight) => onChange({ lineHeight })}
      />
      <Slider
        label="字體大小"
        value={options.fontSize}
        min={8}
        max={200}
        display={`${options.fontSize}px`}
        onChange={(fontSize) => onChange({ fontSize })}
      />
    </div>
  );
}
```

- [ ] **Step 2: 驗證型別**

Run: `npm run build`
Expected: tsc 無錯誤，建置成功。

- [ ] **Step 3: Commit**

```bash
git add src/components/ControlPanel.tsx
git commit -m "Add control panel with color, rotation, opacity, line-height and font-size controls"
```

---

### Task 6: App 整合 + 下載 + 手動驗證

**Files:**
- Modify: `src/App.tsx`（整個改寫）

**Interfaces:**
- Consumes:
  - Task 2：`DEFAULT_OPTIONS`、`WatermarkOptions`
  - Task 3：`<ImageUploader hasImage onImageLoad onError />`
  - Task 4：`<WatermarkCanvas image options canvasRef />`
  - Task 5：`<ControlPanel options onChange />`
- Produces: 完整可用的應用程式。

- [ ] **Step 1: 改寫 `src/App.tsx`**

```tsx
import { useRef, useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ControlPanel from './components/ControlPanel';
import WatermarkCanvas from './components/WatermarkCanvas';
import { DEFAULT_OPTIONS, type WatermarkOptions } from './lib/watermark';

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [options, setOptions] = useState<WatermarkOptions>(DEFAULT_OPTIONS);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageLoad = (img: HTMLImageElement) => {
    setImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.src); // 釋放前一張圖的 object URL
      return img;
    });
    setError('');
  };

  const handleChange = (patch: Partial<WatermarkOptions>) =>
    setOptions((prev) => ({ ...prev, ...patch }));

  // 預覽 canvas 本身就是原圖全解析度，直接輸出
  const handleDownload = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'watermarked.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-bold text-gray-800">圖片浮水印工具</h1>
        <p className="text-xs text-gray-500">完全在瀏覽器本地運行，圖片不會上傳到任何地方</p>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        <main className="flex flex-1 flex-col items-center justify-center gap-4">
          {error && (
            <p className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p>
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

        <aside className="w-full shrink-0 self-start rounded-xl bg-white p-5 shadow-sm lg:w-80">
          <ControlPanel options={options} onChange={handleChange} />
          <button
            type="button"
            onClick={handleDownload}
            disabled={!image}
            className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            下載圖片
          </button>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 驗證建置**

Run: `npm run build`
Expected: tsc 無錯誤，建置成功。

- [ ] **Step 3: 手動驗證清單**

Run: `npm run dev`，在瀏覽器逐項確認：

1. 未上傳圖片時：顯示拖放區；「下載圖片」按鈕為 disabled 灰色。
2. 點擊拖放區選一張圖 → 立即顯示預覽，預設平鋪浮水印「僅供驗證使用」。
3. 拖放一張圖到拖放區 → 同樣載入成功。
4. 選一個文字檔（.txt）→ 顯示「請選擇圖片檔案…」錯誤，原狀態不變。
5. 修改浮水印文字（含輸入多行）→ 預覽即時更新。
6. 切換「平鋪」↔「單一置中」→ 排列方式改變。
7. 點各預設色票、再用調色盤選自訂色 → 顏色即時改變，選中色票有藍色外框。
8. 拖動旋轉角度滑桿（含 -180、0、180 極值）→ 文字角度即時改變，平鋪模式在任何角度下仍鋪滿整張圖（無空白角落）。
9. 拖動透明度滑桿到 0% → 浮水印消失；100% → 完全不透明。
10. 拖動行高滑桿 → 平鋪模式列間距改變；置中模式多行文字行距改變。
11. 拖動字體大小滑桿 → 文字大小即時改變。
12. 清空浮水印文字 → 只顯示原圖，不報錯。
13. 點「下載圖片」→ 下載 `watermarked.png`，開啟後與預覽一致、解析度等於原圖。
14. 開啟 DevTools Network 頁籤重整並操作 → 除本地 dev server 資源外無任何外部請求。
15. 「重新選擇圖片」換另一張不同長寬比的圖 → 預覽正確更新。

Expected: 全部通過。任何一項失敗，修正後重跑該項。

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "Wire up app layout, live preview and PNG download"
```
