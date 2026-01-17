import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**/*.ts"],
      exclude: ["packages/*/src/**/*.d.ts"],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85
      },
      reporter: ["text", "html", "lcov"]
    }
  },
  resolve: {
    alias: {
      pythonlib: resolve(__dirname, "packages/pythonlib/src/index.ts"),
      python2ts: resolve(__dirname, "packages/python2ts/src/index.ts")
    }
  }
})
