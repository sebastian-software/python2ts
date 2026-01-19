import { defineConfig } from "vitest/config"
import { resolve } from "path"
import { playwright } from "@vitest/browser-playwright"

export default defineConfig({
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      headless: true
    },
    // Only test pythonlib runtime in browser - transpiler tests need Node.js
    include: ["tests/runtime-modules.test.ts", "tests/runtime.test.ts"]
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
