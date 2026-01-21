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
      // Use browser versions for browser tests
      pythonlib: resolve(__dirname, "packages/pythonlib/src/index.browser.ts"),
      "pythonlib/random": resolve(__dirname, "packages/pythonlib/src/random.ts"),
      "pythonlib/math": resolve(__dirname, "packages/pythonlib/src/math.ts"),
      "pythonlib/datetime": resolve(__dirname, "packages/pythonlib/src/datetime.ts"),
      "pythonlib/json": resolve(__dirname, "packages/pythonlib/src/json.ts"),
      "pythonlib/re": resolve(__dirname, "packages/pythonlib/src/re.ts"),
      "pythonlib/functools": resolve(__dirname, "packages/pythonlib/src/functools.ts"),
      "pythonlib/os": resolve(__dirname, "packages/pythonlib/src/os.browser.ts"),
      "pythonlib/itertools": resolve(__dirname, "packages/pythonlib/src/itertools.ts"),
      "pythonlib/collections": resolve(__dirname, "packages/pythonlib/src/collections.ts"),
      "pythonlib/string": resolve(__dirname, "packages/pythonlib/src/string.ts"),
      "pythonlib/pathlib": resolve(__dirname, "packages/pythonlib/src/pathlib.browser.ts"),
      "pythonlib/glob": resolve(__dirname, "packages/pythonlib/src/glob.browser.ts"),
      "pythonlib/shutil": resolve(__dirname, "packages/pythonlib/src/shutil.browser.ts"),
      "pythonlib/tempfile": resolve(__dirname, "packages/pythonlib/src/tempfile.browser.ts"),
      "pythonlib/logging": resolve(__dirname, "packages/pythonlib/src/logging.browser.ts"),
      python2ts: resolve(__dirname, "packages/python2ts/src/index.ts")
    }
  }
})
