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
    "src/string.ts",
    "src/sys.ts",
    "src/time.ts",
    "src/copy.ts",
    "src/base64.ts",
    "src/uuid.ts",
    "src/hashlib.ts",
    "src/pathlib.ts",
    "src/glob.ts",
    "src/shutil.ts",
    "src/tempfile.ts",
    "src/subprocess.ts",
    "src/urllib.ts",
    "src/logging.ts"
  ],
  format: ["esm"],
  dts: true,
  clean: true
})
