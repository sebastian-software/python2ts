import { defineConfig } from "vitest/config"
import { resolve } from "node:path"
import baseConfig from "./vitest.config"

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    coverage: {
      provider: "v8",
      include: ["packages/pythonlib/src/**/*.ts"],
      exclude: ["packages/*/src/**/*.d.ts", "packages/pythonlib/src/os.ts"],
      reporter: ["lcov"],
      reportsDirectory: "./coverage/pythonlib"
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
