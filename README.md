# python2ts

[![CI](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/sebastian-software/python2ts/graph/badge.svg)](https://codecov.io/gh/sebastian-software/python2ts)
[![npm version](https://img.shields.io/npm/v/python2ts.svg)](https://www.npmjs.com/package/python2ts)
[![License](https://img.shields.io/npm/l/python2ts.svg)](https://github.com/sebastian-software/python2ts/blob/main/LICENSE)

**Bridge the gap between AI's favorite language and the world's largest ecosystem.**

Python dominates AI, ML, and data science. TypeScript powers modern web applications with the npm
ecosystem of 3+ million packages. **python2ts** brings them together — transpile Python to
production-ready TypeScript with full type safety.

## Why python2ts?

### The AI Era Demands Language Interoperability

Python has become the lingua franca of artificial intelligence. From TensorFlow to PyTorch, from
Jupyter notebooks to LangChain — if it's AI, it's probably Python. But production applications live
in a different world: browsers, serverless functions, edge computing, React frontends.

**python2ts bridges this gap:**

- **Prototype in Python, deploy in TypeScript** — Keep your AI/ML workflows, ship to any JavaScript
  runtime
- **Leverage the npm ecosystem** — Access 3+ million packages without leaving Python semantics
  behind
- **Run anywhere JavaScript runs** — Browsers, Node.js, Deno, Bun, Cloudflare Workers, AWS Lambda
- **Type safety included** — Python type hints become TypeScript types automatically

### Performance Where It Matters

The V8 engine (Chrome, Node.js, Deno) is one of the most optimized runtimes ever built. Your
transpiled Python code benefits from:

- **JIT compilation** — Code gets faster the more it runs
- **Instant startup** — No interpreter initialization overhead
- **Smaller bundles** — Tree-shaking eliminates unused code
- **Native async** — First-class Promise support throughout

### Full Python Standard Library Support

Not just syntax — we include runtime implementations of Python's most-used modules:

| Module        | Functions                                                              |
| ------------- | ---------------------------------------------------------------------- |
| `math`        | `sqrt`, `sin`, `cos`, `log`, `factorial`, `gcd`, `lcm`, ...            |
| `random`      | `randint`, `choice`, `shuffle`, `sample`, `uniform`, ...               |
| `datetime`    | `date`, `time`, `datetime`, `timedelta`, `strftime`, ...               |
| `re`          | `match`, `search`, `findall`, `sub`, `split`, `compile`, ...           |
| `json`        | `dumps`, `loads`, `dump`, `load`                                       |
| `os.path`     | `join`, `basename`, `dirname`, `splitext`, `normpath`, ...             |
| `itertools`   | `chain`, `combinations`, `permutations`, `groupby`, `zip_longest`, ... |
| `functools`   | `partial`, `reduce`, `lru_cache`, `cache`, ...                         |
| `collections` | `Counter`, `defaultdict`, `deque`                                      |
| `string`      | `ascii_lowercase`, `digits`, `Template`, `capwords`, ...               |

## Quick Start

```bash
npm install python2ts
```

Transform Python to TypeScript in one line:

```typescript
import { transpile } from "python2ts"

const typescript = transpile(`
def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence."""
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print(fibonacci(10))
`)
```

**Output:**

```typescript
import { range } from "pythonlib"

/**
 * Generate Fibonacci sequence.
 */
function fibonacci(n: number): number[] {
  let [a, b] = [0, 1]
  let result: number[] = []
  for (const _ of range(n)) {
    result.push(a)
    ;[a, b] = [b, a + b]
  }
  return result
}

console.log(fibonacci(10))
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

## What Gets Transpiled?

### Complete Language Coverage

| Category         | Python                                      | TypeScript                               |
| ---------------- | ------------------------------------------- | ---------------------------------------- |
| **Types**        | `int`, `str`, `bool`, `None`                | `number`, `string`, `boolean`, `null`    |
| **Operators**    | `//`, `**`, `%`, `in`, `is`                 | Python-semantics preserved via runtime   |
| **Control Flow** | `if/elif/else`, `for/while`, `match/case`   | `if/else`, `for...of`, `switch`          |
| **Functions**    | `def`, `lambda`, `*args`, `**kwargs`        | `function`, arrow functions, rest/spread |
| **Classes**      | `class`, `@dataclass`, `NamedTuple`, `Enum` | ES6 classes with full inheritance        |
| **Async**        | `async def`, `await`, generators            | `async function`, `await`, `function*`   |
| **Types**        | `List[T]`, `Dict[K,V]`, `Optional[T]`       | `T[]`, `Record<K,V>`, `T \| null`        |
| **Advanced**     | `Protocol`, `Generic[T]`, `TypedDict`       | Interfaces, generics, type literals      |

### Pythonic Semantics Preserved

```python
# Floor division rounds toward negative infinity (not toward zero!)
-7 // 3  # Python: -3, JavaScript Math.floor: -2

# Modulo follows divisor's sign
-7 % 3   # Python: 2, JavaScript %: -1

# Slicing with negative indices and step
arr[::-1]  # Reverse array
arr[1:-1]  # All but first and last
```

All these work correctly in the transpiled TypeScript.

### Type Hints Become TypeScript Types

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

## Runtime Library

The included runtime provides Python-compatible implementations via subpath exports:

```typescript
// Builtins from main export
import { range, enumerate, zip, len, sorted } from "pythonlib"

for (const i of range(10)) {
}
for (const [i, v] of enumerate(items)) {
}
for (const [a, b] of zip(list1, list2)) {
}

// Collections from pythonlib/collections
import { Counter, defaultdict } from "pythonlib/collections"

const counter = new Counter("mississippi")
counter.mostCommon(2) // [["i", 4], ["s", 4]]

const dd = defaultdict(() => [])
dd.get("key").push(value) // Auto-creates array

// Functional from pythonlib/functools
import { partial, reduce } from "pythonlib/functools"

const add5 = partial((a, b) => a + b, 5)
reduce((a, b) => a + b, numbers)

// Math & Random
import { factorial } from "pythonlib/math"
import { shuffle, choice } from "pythonlib/random"

factorial(10)
shuffle(array)
choice(options)

// Date/Time
import { datetime } from "pythonlib/datetime"

const now = datetime.now()
now.strftime("%Y-%m-%d %H:%M:%S")

// Regex (Python syntax supported)
import { search } from "pythonlib/re"

const m = search("(?P<name>\\w+)", text)
m?.group("name")
```

## Use Cases

### AI/ML Deployment

Train models in Python, deploy inference in TypeScript:

```python
# Python: training script
model = train_model(data)
model.save("model.json")

# Python: inference logic (transpile this!)
def predict(input_data: list[float]) -> str:
    preprocessed = normalize(input_data)
    result = model.predict(preprocessed)
    return decode_label(result)
```

### Share Logic Between Backend and Frontend

Write validation, business logic, or algorithms once in Python:

```python
def validate_email(email: str) -> bool:
    import re
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))

def calculate_price(items: list[dict], discount: float) -> float:
    subtotal = sum(item['price'] * item['quantity'] for item in items)
    return subtotal * (1 - discount)
```

Use in React, Vue, Svelte, or any frontend framework.

### Serverless & Edge Computing

Python code → TypeScript → runs on Cloudflare Workers, Vercel Edge, Deno Deploy:

```python
async def handle_request(request: Request) -> Response:
    data = await request.json()
    result = process_data(data)
    return Response(json.dumps(result))
```

### LLM-Generated Code

AI assistants often generate Python. Now you can execute it anywhere:

```typescript
import { transpile } from "python2ts"

const pythonFromLLM = await askClaude("Write a function to...")
const typescript = transpile(pythonFromLLM)
const result = eval(typescript) // Or use a safer sandbox
```

## Advanced API

```typescript
import { parse, transform, generate } from "python2ts"

// Step-by-step transformation
const ast = parse(pythonCode)
const transformed = transform(ast)
const { code, usedRuntimeFunctions } = generate(ast, {
  includeRuntime: true,
  runtimeImportPath: "python2ts/runtime"
})
```

## Comprehensive Syntax Support

<details>
<summary><strong>Click to expand full syntax table</strong></summary>

| Python                           | TypeScript                    | Notes              |
| -------------------------------- | ----------------------------- | ------------------ |
| **Literals & Operators**         |                               |                    |
| `True` / `False` / `None`        | `true` / `false` / `null`     |                    |
| `x // y`                         | `floordiv(x, y)`              | Python semantics   |
| `x ** y`                         | `pow(x, y)`                   |                    |
| `x % y`                          | `mod(x, y)`                   | Python semantics   |
| `x in items`                     | `contains(x, items)`          |                    |
| `arr[1:3]` / `arr[::-1]`         | `slice(...)`                  | Full slice support |
| **Control Flow**                 |                               |                    |
| `if/elif/else`                   | `if/else if/else`             |                    |
| `for x in items:`                | `for (const x of items)`      |                    |
| `for x, y in items:`             | `for (const [x, y] of items)` | Tuple unpacking    |
| `match x:` / `case _:`           | `switch` / `default:`         | Match statement    |
| **Functions**                    |                               |                    |
| `def fn(*args):`                 | `function fn(...args)`        | Rest parameters    |
| `def fn(**kwargs):`              | `function fn(kwargs)`         | Keyword args       |
| `lambda x: x + 1`                | `(x) => (x + 1)`              |                    |
| `async def` / `await`            | `async function` / `await`    |                    |
| `yield` / `yield from`           | `yield` / `yield*`            |                    |
| **Decorators**                   |                               |                    |
| `@decorator def fn():`           | `decorator(function fn())`    |                    |
| `@dataclass`                     | Auto-generated constructor    |                    |
| `@staticmethod` / `@classmethod` | `static`                      |                    |
| `@property` / `@x.setter`        | `get` / `set`                 |                    |
| **Classes**                      |                               |                    |
| `class Child(Parent):`           | `class Child extends Parent`  |                    |
| `def __init__(self):`            | `constructor()`               |                    |
| `self.x`                         | `this.x`                      |                    |
| `super().__init__()`             | `super()`                     |                    |
| `NamedTuple`                     | Readonly class + freeze       |                    |
| `Enum` / `StrEnum`               | Union types or `as const`     |                    |
| **Comprehensions**               |                               |                    |
| `[x for x in items]`             | `items.map(x => x)`           |                    |
| `[x for x in items if x > 0]`    | `items.filter().map()`        |                    |
| `{k: v for k, v in items}`       | `py.dict(items.map())`        |                    |
| **Type Hints**                   |                               |                    |
| `x: List[int]`                   | `x: number[]`                 |                    |
| `x: Dict[str, T]`                | `x: Record<string, T>`        |                    |
| `x: Optional[str]`               | `x: string \| null`           |                    |
| `Callable[[int], str]`           | `(arg0: number) => string`    |                    |
| `Generic[T]`                     | `<T>`                         |                    |
| `Protocol`                       | `interface`                   |                    |
| `TypedDict`                      | `interface`                   |                    |
| `Final[T]`                       | `const` / `readonly`          |                    |
| `ClassVar[T]`                    | `static`                      |                    |
| **Imports**                      |                               |                    |
| `import os`                      | `import * as os from "os"`    |                    |
| `from os import path`            | `import { path } from "os"`   |                    |
| `from . import utils`            | `import * from "./utils"`     | Relative           |
| **Exception Handling**           |                               |                    |
| `try/except/finally`             | `try/catch/finally`           |                    |
| `raise ValueError()`             | `throw new Error()`           |                    |
| **Docstrings**                   |                               |                    |
| `"""Google/NumPy style"""`       | `/** JSDoc */`                | Full conversion    |

</details>

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     python2ts                            │
├─────────────┬─────────────┬─────────────┬───────────────┤
│   Parser    │ Transformer │  Generator  │    Runtime    │
│ (@lezer/py) │  AST→AST    │   →code     │   py.*        │
└─────────────┴─────────────┴─────────────┴───────────────┘
```

- **Parser**: Lezer-based Python parser for accurate AST
- **Transformer**: Intelligent AST-to-AST conversion
- **Generator**: Clean TypeScript code output
- **Runtime**: Python standard library in TypeScript

## Development

```bash
npm install     # Install dependencies
npm run build   # Build the project
npm test        # Run 1400+ tests
npm run lint    # Check code quality
```

## Requirements

- Node.js >= 22.0.0
- TypeScript >= 5.6.0

## Contributing

Contributions welcome! See the [Architecture Decision Records](./docs/adr/) for design context.

## License

MIT - Use freely in personal and commercial projects.

---

**python2ts** — Write Python. Ship TypeScript. Run Everywhere.
