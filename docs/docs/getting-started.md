---
sidebar_position: 2
---

# Getting Started

## Installation

```bash
npm install python2ts
# or
pnpm add python2ts
# or
yarn add python2ts
```

## CLI Usage

Transpile a Python file to TypeScript:

```bash
# Transpile to stdout
npx python2ts input.py

# Transpile to file
npx python2ts input.py -o output.ts

# Pipe from stdin
cat script.py | npx python2ts > script.ts

# Without runtime import (for inspection)
npx python2ts input.py --no-runtime
```

## Programmatic API

```typescript
import { transpile } from "python2ts"

const typescript = transpile(`
def greet(name: str) -> str:
    return f"Hello, {name}!"
`)

console.log(typescript)
// Output:
// function greet(name: string): string {
//   return `Hello, ${name}!`
// }
```

### Advanced API

For more control, use the step-by-step API:

```typescript
import { parse, transform, generate } from "python2ts"

// Step 1: Parse Python to AST
const ast = parse(pythonCode)

// Step 2: Transform to TypeScript AST
const transformed = transform(ast)

// Step 3: Generate TypeScript code
const { code, usedRuntimeFunctions } = generate(transformed, {
  includeRuntime: true,
  runtimeImportPath: "pythonlib"
})
```

## Using pythonlib Standalone

Don't need the transpiler? Use pythonlib directly for Python-style utilities:

```bash
npm install pythonlib
```

```typescript
// Builtins from main export
import { range, enumerate, sorted, len, zip } from "pythonlib"

// Module functions from subpaths
import { combinations, permutations } from "pythonlib/itertools"
import { Counter, defaultdict, deque } from "pythonlib/collections"
import { lruCache, partial, pipe } from "pythonlib/functools"
import { Path } from "pythonlib/pathlib"
import { sha256 } from "pythonlib/hashlib"
```

## All Available Modules

pythonlib provides **20+ modules** covering Python's most useful standard library functionality:

### Core Utilities

| Import Path             | Key Functions                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `pythonlib`             | `range`, `enumerate`, `zip`, `sorted`, `len`, `min`, `max`, `sum`                                |
| `pythonlib/itertools`   | `combinations`, `permutations`, `product`, `chain`, `cycle`, `groupby`, `takeWhile`, `dropWhile` |
| `pythonlib/functools`   | `lruCache`, `partial`, `reduce`, `pipe`, `compose`, `cache`                                      |
| `pythonlib/collections` | `Counter`, `defaultdict`, `deque`, `OrderedDict`                                                 |

### Data Processing

| Import Path          | Key Functions                                      |
| -------------------- | -------------------------------------------------- |
| `pythonlib/datetime` | `datetime`, `date`, `time`, `timedelta`            |
| `pythonlib/json`     | `loads`, `dumps`, `load`, `dump`                   |
| `pythonlib/re`       | `search`, `match`, `findAll`, `sub`, `compile`     |
| `pythonlib/string`   | `Template`, `capWords`, `asciiLowercase`, `digits` |

### Math & Random

| Import Path        | Key Functions                                                 |
| ------------------ | ------------------------------------------------------------- |
| `pythonlib/math`   | `sqrt`, `floor`, `ceil`, `factorial`, `gcd`, `lcm`, `pi`, `e` |
| `pythonlib/random` | `randInt`, `choice`, `shuffle`, `sample`, `uniform`, `random` |

### File System (Node.js/Deno/Bun)

| Import Path          | Key Functions                                                       |
| -------------------- | ------------------------------------------------------------------- |
| `pythonlib/os`       | `path.join`, `path.dirname`, `environ`, `getcwd`, `listdir`, `walk` |
| `pythonlib/pathlib`  | `Path` class with `readText`, `writeText`, `exists`, `glob`         |
| `pythonlib/glob`     | `glob`, `iglob`, pattern matching                                   |
| `pythonlib/shutil`   | `copy`, `copy2`, `move`, `rmtree`, `which`                          |
| `pythonlib/tempfile` | `NamedTemporaryFile`, `TemporaryDirectory`, `mkdtemp`               |

### Security & Encoding

| Import Path         | Key Functions                                |
| ------------------- | -------------------------------------------- |
| `pythonlib/hashlib` | `md5`, `sha1`, `sha256`, `sha512`, `newHash` |
| `pythonlib/base64`  | `b64encode`, `b64decode`, `urlsafeB64encode` |
| `pythonlib/uuid`    | `uuid4`, `uuid1`, `UUID` class               |

### System & Network

| Import Path            | Key Functions                                        |
| ---------------------- | ---------------------------------------------------- |
| `pythonlib/sys`        | `argv`, `platform`, `exit`, `version`                |
| `pythonlib/subprocess` | `run`, `call`, `checkCall`, `checkOutput`            |
| `pythonlib/urllib`     | `urlparse`, `urljoin`, `urlencode`, `quote`          |
| `pythonlib/time`       | `time`, `sleep`, `strftime`, `localtime`             |
| `pythonlib/logging`    | `getLogger`, `basicConfig`, `debug`, `info`, `error` |
| `pythonlib/copy`       | `copy`, `deepcopy`                                   |

## Quick Examples

### itertools

```typescript
import { combinations, product, chain } from "pythonlib/itertools"

// All 2-combinations of [1, 2, 3]
for (const combo of combinations([1, 2, 3], 2)) {
  console.log(combo) // [1,2], [1,3], [2,3]
}

// Cartesian product
[...product(["a", "b"], [1, 2])]
// [["a", 1], ["a", 2], ["b", 1], ["b", 2]]

// Chain iterables
[...chain([1, 2], [3, 4], [5])]
// [1, 2, 3, 4, 5]
```

### collections

```typescript
import { Counter, defaultdict, deque } from "pythonlib/collections"

// Count occurrences
const counter = new Counter("mississippi")
counter.mostCommon(2) // [["i", 4], ["s", 4]]

// Default values for missing keys
const graph = defaultdict<string, string[]>(() => [])
graph.get("node1").push("node2")
graph.get("node1").push("node3")

// Double-ended queue
const dq = new deque([1, 2, 3])
dq.appendLeft(0) // O(1) prepend
dq.rotate(1) // Rotate right
```

### functools

```typescript
import { lruCache, partial, pipe } from "pythonlib/functools"

// Memoization
const fib = lruCache((n: number): number => (n <= 1 ? n : fib(n - 1) + fib(n - 2)))
fib(100) // Instant, even for large values

// Partial application
const add = (a: number, b: number) => a + b
const add10 = partial(add, 10)
add10(5) // 15

// Function composition
const process = pipe(
  (x: number) => x * 2,
  (x: number) => x + 1,
  (x: number) => x.toString()
)
process(5) // "11"
```

### pathlib

```typescript
import { Path } from "pythonlib/pathlib"

const p = new Path("/home/user/documents/file.txt")

p.name // "file.txt"
p.stem // "file"
p.suffix // ".txt"
p.parent // Path("/home/user/documents")

// File operations (async)
await p.exists()
await p.readText()
await p.writeText("Hello World")

// Glob patterns
const pyFiles = await p.parent.glob("*.py")
```

### hashlib

```typescript
import { sha256, md5 } from "pythonlib/hashlib"

const hash = sha256()
hash.update("Hello ")
hash.update("World")
hash.hexdigest()
// "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"

// One-liner
sha256("password").hexdigest()
```

### datetime

```typescript
import { datetime, timedelta } from "pythonlib/datetime"

const now = datetime.now()
const nextWeek = now.add(timedelta({ days: 7 }))

now.strftime("%Y-%m-%d %H:%M:%S")
// "2024-01-15 14:30:00"

nextWeek.isoformat()
// "2024-01-22T14:30:00"
```

## Next Steps

- [Syntax Reference](/docs/syntax) — Complete Python to TypeScript transformation rules
- [Runtime Library](/docs/runtime) — Detailed documentation for all pythonlib modules
- [API Reference](/docs/api) — Full API documentation
