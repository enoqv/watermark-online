# 圖片浮水印線上工具 — 設計文件

日期：2026-07-16
狀態：已核准

## 目標

一個完全在瀏覽器本地運行的圖片浮水印工具：上傳圖片、疊加可自訂的文字浮水印、即時預覽、下載成品。不進行任何網路請求，依賴套件最少化。

## 技術選型

- **React**（最新版）+ **Vite**（最新版）+ **Tailwind CSS v4**（透過 `@tailwindcss/vite` plugin，不需 PostCSS 設定）
- **TypeScript**
- Runtime 依賴僅 `react`、`react-dom`；其餘皆為 devDependencies
- 渲染方案：**Canvas 單一渲染來源** — 圖片與浮水印皆繪於 `<canvas>`，預覽與下載共用同一套繪製函式，保證所見即所得

## 功能需求

1. **上傳圖片**：點擊選檔 + 拖放。以 `FileReader` / `Image` 本地讀取，不上傳。非圖片檔顯示錯誤提示。
2. **浮水印文字**：多行文字輸入（textarea）。
3. **排列模式**：使用者可切換
   - **平鋪**：文字以固定間距重複鋪滿整張圖（交錯排列）
   - **單一置中**：文字置於圖片中央
4. **文字顏色**：預設色票（白、黑、紅、灰、藍、黃等）+ 原生 `<input type="color">` 調色盤。
5. **旋轉角度**：滑桿 -180° ~ 180°。
6. **透明度**：滑桿 0 ~ 100%。
7. **行高**：滑桿。平鋪模式 = 各行浮水印的垂直間距倍率；置中模式 = 多行文字的行距倍率。
8. **字體大小**：滑桿，讓浮水印大小能適應不同解析度的圖片。
9. **即時預覽**：任何參數變動即重繪 canvas，以 `requestAnimationFrame` 節流。
10. **下載**：`canvas.toBlob('image/png')` 以**原圖解析度**輸出。預覽以 CSS 縮放顯示，內部 canvas 維持原始尺寸，下載不失真。無圖片時下載按鈕停用。

## 架構

```
src/
  App.tsx                — 版面組合 + 浮水印參數狀態（單一 state 物件）
  components/
    ImageUploader.tsx    — 上傳/拖放區（無圖時全版顯示，有圖時可重新選圖）
    ControlPanel.tsx     — 所有控制項（文字、模式、顏色、角度、透明度、行高、字級）
    WatermarkCanvas.tsx  — canvas 預覽（監聽參數變化重繪）
  lib/
    watermark.ts         — 純函式 drawWatermark(ctx, image, options)：預覽與下載共用
```

- **版面**：左側預覽區（大）、右側控制面板；窄螢幕時上下堆疊（Tailwind responsive）。
- **資料流**：`App` 持有 `image` 與 `WatermarkOptions` state → 傳給 `WatermarkCanvas` 繪製、傳給 `ControlPanel` 編輯 → 下載時以同一 options 重繪全尺寸 canvas 輸出。

## WatermarkOptions 介面

```ts
interface WatermarkOptions {
  text: string;        // 多行以 \n 分隔
  mode: 'tile' | 'center';
  color: string;       // hex
  rotation: number;    // -180 ~ 180 (deg)
  opacity: number;     // 0 ~ 1
  lineHeight: number;  // 倍率，例如 1.0 ~ 10
  fontSize: number;    // px，相對原圖尺寸
}
```

## 繪製邏輯（lib/watermark.ts）

- 先 `drawImage` 原圖鋪底。
- 設定 `globalAlpha`、`fillStyle`、`font`。
- **center 模式**：translate 至圖中心 → rotate → 逐行 `fillText`（依 lineHeight 排列，整體垂直置中）。
- **tile 模式**：translate 至圖中心 → rotate → 以文字寬度 + 間距為步長，在旋轉後座標系中網格狀重複繪製（範圍取圖片對角線長度，確保旋轉後仍鋪滿）；奇偶行水平錯位形成交錯效果。

## 錯誤處理

- 選擇非圖片檔 → 顯示錯誤訊息，不改變現有狀態。
- 圖片載入失敗 → 顯示錯誤訊息。
- 無圖片時：下載按鈕 disabled。

## 測試

- 手動驗證為主（純視覺工具）：上傳、各參數即時反應、兩種模式、下載結果與預覽一致、大圖（>4000px）效能。
- `lib/watermark.ts` 為純函式設計，保留未來單元測試空間。

## 非目標（YAGNI）

- 圖片浮水印（logo）、多組浮水印、匯出格式選擇（jpg/webp）、參數儲存、批次處理。
