import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// host: true 便于在同一局域网用手机直接访问（手机端优先）
export default defineConfig({
  plugins: [react()],
  server: { host: true },
});
