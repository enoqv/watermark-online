import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // GitHub Pages 部署於 https://<user>.github.io/watermark-online/
  base: '/watermark-online/',
  plugins: [react(), tailwindcss()],
});
