import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        challenges: resolve(__dirname, "challenges.html"),
        admin: resolve(__dirname, "admin.html"),
      },
    },
  },
  server: {
    port: 3000,
  },
});
