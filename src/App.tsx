import { useRef, useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ControlPanel from './components/ControlPanel';
import WatermarkCanvas from './components/WatermarkCanvas';
import ThemeToggle from './components/ThemeToggle';
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
      if (!blob) {
        setError('圖片輸出失敗，可能是圖片尺寸超過瀏覽器限制');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'watermarked.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

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
}
