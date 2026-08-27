import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  base: "./",

  build: {
    outDir: "../ts",
    emptyOutDir: false,

    rollupOptions: {
      output: {
        entryFileNames: "vue-app.js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});
