import { useState } from 'react';

export type Theme = 'light' | 'dark';

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
