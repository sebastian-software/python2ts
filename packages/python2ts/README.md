# python2ts

[![npm version](https://img.shields.io/npm/v/python2ts.svg)](https://www.npmjs.com/package/python2ts)
[![npm downloads](https://img.shields.io/npm/dm/python2ts.svg)](https://www.npmjs.com/package/python2ts)
[![CI](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/python2ts.svg)](https://github.com/sebastian-software/python2ts/blob/main/LICENSE)

**AST-based Python to TypeScript transpiler** — Write Python, ship TypeScript.

> Convert Python code to clean, idiomatic TypeScript with full type preservation.

## Why python2ts?

Python dominates AI, ML, and data science. TypeScript powers modern web applications. **python2ts**
bridges these worlds:

- **Prototype in Python, deploy in TypeScript** — Keep your AI/ML workflows, ship to any JS runtime
- **Run anywhere JavaScript runs** — Browsers, Node.js, Deno, Bun, Cloudflare Workers
- **Type safety included** — Python type hints become TypeScript types automatically
- **Clean output** — Generates idiomatic TypeScript, not a mess of runtime hacks

## Installation

```bash
npm install python2ts
# or
pnpm add python2ts
# or
yarn add python2ts
```

## CLI Usage

```bash
# Transpile a file
npx python2ts input.py -o output.ts

# Pipe from stdin
cat script.py | npx python2ts > script.ts

# Preview without runtime import
npx python2ts input.py --no-runtime

# Use custom runtime path
npx python2ts input.py --runtime-path ./my-runtime
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
| `Union[A, B]`                | `A \| B`                              |
| `Callable[[A, B], R]`        | `(arg0: A, arg1: B) => R`             |
| `def fn():`                  | `function fn()`                       |
| `lambda x: x + 1`            | `(x) => x + 1`                        |
| `class Child(Parent):`       | `class Child extends Parent`          |
| `@dataclass`                 | Auto-generated constructor            |
| `for x in items:`            | `for (const x of items)`              |
| `if/elif/else`               | `if/else if/else`                     |
| `match/case`                 | `switch/case`                         |
| `async def` / `await`        | `async function` / `await`            |
| `with open() as f:`          | `using` declaration                   |
| `//` (floor div)             | `floordiv()` (Python semantics)       |
| `%` (modulo)                 | `mod()` (Python semantics)            |
| `**` (power)                 | `pow()`                               |
| `arr[1:-1]` (slicing)        | `slice()` (full support)              |
| `f"Hello {name}"`            | `` `Hello ${name}` ``                 |
| `"""docstring"""`            | `/** JSDoc */`                        |

## Type Hints Preserved

```python
from typing import Optional, Callable, TypeVar, Generic

T = TypeVar('T')

class Container(Generic[T]):
    def __init__(self, value: T) -> None:
        self.value = value

def process(
    items: list[T],
    callback: Callable[[T, int], bool],
    default: Optional[str] = None
) -> dict[str, T]:
    ...
```

Becomes:

```typescript
class Container<T> {
  value: T

  constructor(value: T) {
    this.value = value
  }
}

function process<T>(
  items: T[],
  callback: (arg0: T, arg1: number) => boolean,
  default_: string | null = null
): Record<string, T> {
  // ...
}
```

## Advanced Features

### Dataclasses

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"
```

```typescript
class Point {
  constructor(
    public x: number,
    public y: number,
    public label: string = "origin"
  ) {}
}
```

### NamedTuple

```python
from typing import NamedTuple

class Coordinate(NamedTuple):
    x: float
    y: float
```

```typescript
interface Coordinate {
  readonly x: number
  readonly y: number
}

function Coordinate(x: number, y: number): Coordinate {
  return { x, y }
}
```

### Pattern Matching

```python
match command:
    case "quit":
        exit()
    case "help":
        show_help()
    case _:
        unknown_command()
```

```typescript
switch (command) {
  case "quit":
    exit()
    break
  case "help":
    show_help()
    break
  default:
    unknown_command()
}
```

## Advanced API

```typescript
import { parse, transform, generate, generateAsync } from "python2ts"

// Step-by-step transformation
const parseResult = parse(pythonCode)
const transformed = transform(parseResult)
const { code, usedRuntimeFunctions } = generate(transformed, {
  includeRuntime: true,
  runtimeImportPath: "pythonlib"
})

// Async version with Prettier formatting
const formatted = await generateAsync(pythonCode)
```

## Runtime Library

python2ts uses [pythonlib](https://www.npmjs.com/package/pythonlib) for Python standard library
functions. It's automatically included as a dependency.

```typescript
// Generated imports (grouped by module)
import { range, enumerate, len } from "pythonlib"
import { chain, combinations } from "pythonlib/itertools"
import { Counter } from "pythonlib/collections"
```

## Requirements

- **Node.js** >= 22.0.0

## Related Projects

- [**pythonlib**](https://www.npmjs.com/package/pythonlib) — Python standard library for TypeScript
  (standalone runtime)
- [**Documentation**](https://sebastian-software.github.io/python2ts/) — Full API reference and
  guides

## Contributing

We welcome contributions! Please see our
[GitHub repository](https://github.com/sebastian-software/python2ts) for:

- [Issue tracker](https://github.com/sebastian-software/python2ts/issues)
- [Architecture Decision Records](https://github.com/sebastian-software/python2ts/tree/main/docs/adr)

## License

MIT © [Sebastian Software GmbH](https://sebastian-software.de)
