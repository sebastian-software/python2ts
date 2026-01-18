# python2ts

[![npm version](https://img.shields.io/npm/v/python2ts.svg)](https://www.npmjs.com/package/python2ts)
[![License](https://img.shields.io/npm/l/python2ts.svg)](https://github.com/sebastian-software/python2ts/blob/main/LICENSE)

**AST-based Python to TypeScript transpiler** — Write Python, ship TypeScript.

Converts Python code to clean, idiomatic TypeScript with full type preservation.

## Installation

```bash
npm install python2ts
```

## CLI Usage

```bash
# Transpile a file
npx python2ts input.py -o output.ts

# Pipe from stdin
cat script.py | npx python2ts > script.ts

# Preview without runtime import
npx python2ts input.py --no-runtime
```

## API Usage

```typescript
import { transpile } from "python2ts"

const typescript = transpile(`
def fibonacci(n: int) -> list[int]:
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result
`)
```

**Output:**

```typescript
import { range } from "pythonlib"

function fibonacci(n: number): number[] {
  let [a, b] = [0, 1]
  let result: number[] = []
  for (const _ of range(n)) {
    result.push(a)
    ;[a, b] = [b, a + b]
  }
  return result
}
```

## What Gets Transpiled?

| Python                       | TypeScript                            |
| ---------------------------- | ------------------------------------- |
| `int`, `str`, `bool`, `None` | `number`, `string`, `boolean`, `null` |
| `list[T]`, `dict[K,V]`       | `T[]`, `Record<K,V>`                  |
| `Optional[T]`                | `T \| null`                           |
| `def fn():`                  | `function fn()`                       |
| `lambda x: x + 1`            | `(x) => x + 1`                        |
| `class Child(Parent):`       | `class Child extends Parent`          |
| `@dataclass`                 | Auto-generated constructor            |
| `for x in items:`            | `for (const x of items)`              |
| `if/elif/else`               | `if/else if/else`                     |
| `match/case`                 | `switch/case`                         |
| `async def` / `await`        | `async function` / `await`            |
| `//` (floor div)             | `floordiv()` (Python semantics)       |
| `%` (modulo)                 | `mod()` (Python semantics)            |
| `arr[1:-1]` (slicing)        | `slice()` (full support)              |
| `f"Hello {name}"`            | `` `Hello ${name}` ``                 |
| `"""docstring"""`            | `/** JSDoc */`                        |

## Advanced API

```typescript
import { parse, transform, generate } from "python2ts"

// Step-by-step transformation
const ast = parse(pythonCode)
const transformed = transform(ast)
const { code, usedRuntimeFunctions } = generate(transformed, {
  includeRuntime: true,
  runtimeImportPath: "pythonlib"
})
```

## Runtime Library

python2ts uses [pythonlib](https://www.npmjs.com/package/pythonlib) for Python standard library
functions:

```typescript
// Generated imports (grouped by module)
import { range, enumerate, len } from "pythonlib"
import { chain, combinations } from "pythonlib/itertools"
import { Counter } from "pythonlib/collections"
```

pythonlib is automatically included as a dependency.

## Type Hints Preserved

```python
from typing import Optional, Callable, TypeVar

T = TypeVar('T')

def process(
    items: list[T],
    callback: Callable[[T, int], bool],
    default: Optional[str] = None
) -> dict[str, T]:
    ...
```

Becomes:

```typescript
function process<T>(
  items: T[],
  callback: (arg0: T, arg1: number) => boolean,
  default_: string | null = null
): Record<string, T> {
  // ...
}
```

## Requirements

- Node.js >= 22.0.0

## Related

- [pythonlib](https://www.npmjs.com/package/pythonlib) — Python standard library for TypeScript
  (standalone runtime)

## License

MIT
