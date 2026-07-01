import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 项目站点路径：
// https://xj32274080.github.io/four-color-evidence-observer/
export default defineConfig({
  base: '/four-color-evidence-observer/',
  plugins: [react()],
  // host: true 便于在同一局域网用手机直接访问（手机端优先）
  server: { host: true },
});
