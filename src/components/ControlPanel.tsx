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
      <div className="mb-1 flex justify-between text-sm text-gray-600 dark:text-gray-300">
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
        <div className="mb-1 text-sm text-gray-600 dark:text-gray-300">浮水印文字</div>
        <textarea
          value={options.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
      </label>

      <div>
        <div className="mb-1 text-sm text-gray-600 dark:text-gray-300">排列模式</div>
        <div className="grid grid-cols-2 gap-2">
          {MODES.map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ mode })}
              className={`rounded-md border px-3 py-2 text-sm ${
                options.mode === mode
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 text-sm text-gray-600 dark:text-gray-300">文字顏色</div>
        <div className="flex items-center gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ color })}
              aria-label={`顏色 ${color}`}
              className={`h-7 w-7 rounded-full border ${
                options.color === color
                  ? 'ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-gray-800'
                  : 'border-gray-300 dark:border-gray-600'
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
            className="h-7 w-7 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
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
