import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En desarrollo el front llama a /api y Vite lo reenvía al backend (puerto 3000),
// así no hace falta configurar CORS ni la URL del servidor.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": { target: process.env.VITE_BACKEND_URL || "http://localhost:3000", changeOrigin: true },
    },
  },
});
