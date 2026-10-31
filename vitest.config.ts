import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  // Next uses jsx: "preserve"; Vitest/Vite need transform for .tsx imports in tests.
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

