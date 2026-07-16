# 圖片浮水印工具

完全在瀏覽器本地運行的圖片浮水印線上工具。圖片不會上傳到任何伺服器，也不發出任何網路請求，可離線使用。

🔗 **線上使用：<https://enoqv.github.io/watermark-online/>**

## 功能

- 上傳圖片：點擊選檔或拖放（支援鍵盤操作）
- 浮水印文字：支援多行輸入
- 兩種排列模式：
  - **平鋪**：文字交錯鋪滿整張圖（任何旋轉角度下皆無空白角落）
  - **單一置中**：文字置於圖片中央
- 文字顏色：6 個常用色票 + 原生調色盤自訂
- 旋轉角度（-180° ~ 180°）、透明度、行高、字體大小滑桿調整
- 即時預覽：所有參數變動即時反映
- 下載 PNG：以原圖解析度輸出，預覽與成品所見即所得

## 使用方式

1. 開啟網頁，點擊或拖放圖片到上傳區
2. 輸入浮水印文字，調整模式、顏色、角度、透明度、行高與字級
3. 預覽滿意後點「下載圖片」，即可取得 `watermarked.png`

## 開發

技術棧：React 19 + Vite + Tailwind CSS v4 + TypeScript。Runtime 依賴僅 `react` 與 `react-dom`。

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# Lint
npm run lint
```

## Build

```bash
npm run build    # tsc 型別檢查 + vite build，產出 dist/
npm run preview  # 本地預覽 build 結果
```

## 部署

推送 `v*.*.*` 格式的 tag 會觸發 GitHub Actions，經 lint、弱點掃描與建置後自動部署到 GitHub Pages：

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 架構說明

預覽用的 `<canvas>` 內部維持原圖解析度（僅以 CSS 縮放顯示），下載時直接由同一個 canvas 輸出，預覽與下載共用 `src/lib/watermark.ts` 的純繪製函式，保證所見即所得。
