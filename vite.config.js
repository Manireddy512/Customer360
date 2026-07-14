import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // During local `npm run dev`, forward API calls to the Express server
      // (run `npm run dev:server` in a second terminal on port 3000).
      "/api": "http://localhost:3000",
    },
  },
});
