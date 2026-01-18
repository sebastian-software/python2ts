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
import { range, enumerate, sorted, len } from "pythonlib"

// Module functions from subpaths
import { combinations } from "pythonlib/itertools"
import { Counter } from "pythonlib/collections"
import { lru_cache } from "pythonlib/functools"

// Itertools
for (const combo of combinations([1, 2, 3], 2)) {
  console.log(combo) // [1,2], [1,3], [2,3]
}

// Collections
const counter = new Counter("mississippi")
console.log(counter.mostCommon(2)) // [["i", 4], ["s", 4]]

// Functools
const cached = lru_cache((n: number) => {
  console.log(`Computing ${n}`)
  return n * 2
})
```

## Import Structure

pythonlib uses subpath exports for tree-shakeable imports:

| Import Path             | Contents                                  |
| ----------------------- | ----------------------------------------- |
| `pythonlib`             | Builtins: `len`, `range`, `sorted`, etc.  |
| `pythonlib/itertools`   | `chain`, `combinations`, `permutations`   |
| `pythonlib/functools`   | `partial`, `reduce`, `lru_cache`          |
| `pythonlib/collections` | `Counter`, `defaultdict`, `deque`         |
| `pythonlib/math`        | `sqrt`, `floor`, `ceil`, `pi`, `e`        |
| `pythonlib/random`      | `randint`, `choice`, `shuffle`            |
| `pythonlib/datetime`    | `datetime`, `date`, `time`, `timedelta`   |
| `pythonlib/json`        | `loads`, `dumps`, `load`, `dump`          |
| `pythonlib/re`          | `search`, `match`, `findall`, `sub`       |
| `pythonlib/os`          | `path`, `getcwd`, `sep`                   |
| `pythonlib/string`      | `Template`, `capwords`, `ascii_lowercase` |
