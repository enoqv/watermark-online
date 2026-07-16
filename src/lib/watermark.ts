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
    for (let x = -radius - stepX; x <= radius; x += stepX) {
      lines.forEach((line, i) => {
        ctx.fillText(line, x + offsetX, y - blockHeight / 2 + i * innerStep);
      });
    }
  }
}
