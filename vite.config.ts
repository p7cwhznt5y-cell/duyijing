import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
// API 由 EdgeOne Cloud Functions 处理（cloud-functions/api/interpret.js），
// 本地如需联调请用 `edgeone pages dev`，它会把前端和函数一起跑起来。
export default defineConfig({
  plugins: [preact()],
})
