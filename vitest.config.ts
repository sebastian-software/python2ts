import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**/*.ts"],
      exclude: [
        "packages/*/src/**/*.d.ts",
        "packages/python2ts/src/cli/**" // Integration-tested via execSync
      ],
      thresholds: {
        lines: 84,
        functions: 84,
        branches: 83,
        statements: 84
      },
      reporter: ["text", "html", "lcov"]
    }
  },
  resolve: {
    alias: {
      pythonlib: resolve(__dirname, "packages/pythonlib/src/index.ts"),
      "pythonlib/random": resolve(__dirname, "packages/pythonlib/src/random.ts"),
      "pythonlib/math": resolve(__dirname, "packages/pythonlib/src/math.ts"),
      "pythonlib/datetime": resolve(__dirname, "packages/pythonlib/src/datetime.ts"),
      "pythonlib/json": resolve(__dirname, "packages/pythonlib/src/json.ts"),
      "pythonlib/re": resolve(__dirname, "packages/pythonlib/src/re.ts"),
      "pythonlib/functools": resolve(__dirname, "packages/pythonlib/src/functools.ts"),
      "pythonlib/os": resolve(__dirname, "packages/pythonlib/src/os.ts"),
      "pythonlib/itertools": resolve(__dirname, "packages/pythonlib/src/itertools.ts"),
      "pythonlib/collections": resolve(__dirname, "packages/pythonlib/src/collections.ts"),
      "pythonlib/string": resolve(__dirname, "packages/pythonlib/src/string.ts"),
      python2ts: resolve(__dirname, "packages/python2ts/src/index.ts")
    }
  }
})
