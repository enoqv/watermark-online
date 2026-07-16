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
