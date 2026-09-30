import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/api": {
        target: process.env.PLEASEVOTE_API_ORIGIN ?? "http://localhost:8080",
        changeOrigin: true,
      },
    },
  }
});
