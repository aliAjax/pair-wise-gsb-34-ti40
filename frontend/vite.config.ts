import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    port: 20103,
    host: "0.0.0.0",
    proxy: {
      // 本地开发时把 /api 代理到 FastAPI，生产环境由 nginx.conf 反向代理
      "/api": {
        target: "http://localhost:21103",
        changeOrigin: true
      }
    }
  }
});
