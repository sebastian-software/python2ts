import { defineConfig } from "tsup"

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/collections.ts",
    "src/itertools.ts",
    "src/functools.ts",
    "src/math.ts",
    "src/random.ts",
    "src/datetime.ts",
    "src/re.ts",
    "src/json.ts",
    "src/os.browser.ts",
    "src/os.node.ts",
    "src/string.ts"
  ],
  format: ["esm"],
  dts: true,
  clean: true
})
