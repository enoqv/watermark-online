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
