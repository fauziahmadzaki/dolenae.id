import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    env: {
      // Env minimal agar modul config bisa dimuat di test tanpa DB nyata.
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://dolenae:dolenae@localhost:5432/dolenae",
      JWT_SECRET: "test-secret-test-secret",
    },
  },
});
