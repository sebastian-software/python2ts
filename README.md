# python2ts

A TypeScript-based Python to TypeScript transpiler using real AST transformation.

## Features

- **AST-based transformation** using [@lezer/python](https://github.com/lezer-parser/python)
- **Python-compatible runtime** (`py.*`) for Python-specific operations
- **Preserves Python semantics** for operators like `//`, `%`, `**`
- **Comprehensive slicing support** with negative indices and step
- **Built-in function mapping** (`print` → `console.log`, etc.)

## Installation

```bash
npm install python2ts
```

## Usage

### Basic Transpilation

```typescript
import { transpile } from "python2ts"

const python = `
def greet(name):
    print("Hello, " + name)

for i in range(5):
    greet("World")
`

const typescript = transpile(python)
console.log(typescript)
```

Output:

```typescript
import { py } from "python2ts/runtime"

function greet(name) {
  console.log("Hello, " + name)
}
for (const i of py.range(5)) {
  greet("World")
}
```

### Using the Runtime

```typescript
import { py } from "python2ts/runtime"

// Python-style floor division (rounds toward negative infinity)
py.floordiv(7, 3) // 2
py.floordiv(-7, 3) // -3 (not -2 like JS Math.floor)

// Python-style modulo (result has sign of divisor)
py.mod(-7, 3) // 2 (not -1 like JS %)

// Slicing
py.slice([0, 1, 2, 3, 4], 1, 4) // [1, 2, 3]
py.slice([0, 1, 2, 3, 4], undefined, undefined, -1) // [4, 3, 2, 1, 0]

// Iterables
;[...py.range(5)] // [0, 1, 2, 3, 4]
;[...py.enumerate(["a", "b", "c"])] // [[0, 'a'], [1, 'b'], [2, 'c']]
;[...py.zip([1, 2], ["a", "b"])] // [[1, 'a'], [2, 'b']]
```

### Advanced API

```typescript
import { parse, transform, generate } from "python2ts"

// Step 1: Parse Python code
const parseResult = parse("x = 1 + 2")

// Step 2: Transform to TypeScript AST
const transformResult = transform(parseResult)

// Step 3: Generate TypeScript code
const generated = generate(parseResult, {
  includeRuntime: true,
  runtimeImportPath: "python2ts/runtime"
})

console.log(generated.code)
console.log(generated.usedRuntimeFunctions) // ['range', 'len', ...]
```

## Supported Python Syntax

### Phase 1 (Current)

| Python            | TypeScript               | Notes              |
| ----------------- | ------------------------ | ------------------ |
| `True` / `False`  | `true` / `false`         |                    |
| `None`            | `null`                   |                    |
| `x // y`          | `py.floordiv(x, y)`      | Python semantics   |
| `x ** y`          | `py.pow(x, y)`           |                    |
| `x % y`           | `py.mod(x, y)`           | Python semantics   |
| `x and y`         | `x && y`                 |                    |
| `x or y`          | `x \|\| y`               |                    |
| `not x`           | `!x`                     |                    |
| `x in items`      | `py.in(x, items)`        |                    |
| `arr[1:3]`        | `py.slice(arr, 1, 3)`    | Full slice support |
| `print(x)`        | `console.log(x)`         |                    |
| `len(x)`          | `py.len(x)`              |                    |
| `range(n)`        | `py.range(n)`            |                    |
| `for x in items:` | `for (const x of items)` |                    |
| `if/elif/else`    | `if/else if/else`        |                    |
| `while`           | `while`                  |                    |
| `def fn():`       | `function fn()`          |                    |
| `[1, 2, 3]`       | `[1, 2, 3]`              |                    |
| `{"a": 1}`        | `{ "a": 1 }`             |                    |
| `# comment`       | `// comment`             |                    |

### Phase 2 (Comprehensions & Destructuring)

| Python                          | TypeScript                      | Notes                 |
| ------------------------------- | ------------------------------- | --------------------- |
| `[x for x in items]`            | `items.map((x) => x)`           | List comprehension    |
| `[x for x in items if x > 0]`   | `items.filter(...).map(...)`    | With condition        |
| `[x + y for x in a for y in b]` | `a.flatMap((x) => b.map(...))`  | Nested comprehension  |
| `{x: x * 2 for x in items}`     | `py.dict(items.map(...))`       | Dict comprehension    |
| `{x * 2 for x in items}`        | `py.set(items.map(...))`        | Set comprehension     |
| `{1, 2, 3}`                     | `py.set([1, 2, 3])`             | Set literal           |
| `(x for x in items)`            | `(function*() { ... })()`       | Generator expression  |
| `sum(x for x in items)`         | `py.sum((function*() {...})())` | Generator in function |
| `for x, y in items:`            | `for (const [x, y] of items)`   | Tuple unpacking       |
| `a, b = 1, 2`                   | `let [a, b] = [1, 2]`           | Multiple assignment   |
| `a, b = b, a`                   | `let [a, b] = [b, a]`           | Swap pattern          |

### Built-in Functions

| Python                                    | TypeScript                                            |
| ----------------------------------------- | ----------------------------------------------------- |
| `print()`                                 | `console.log()`                                       |
| `len()`                                   | `py.len()`                                            |
| `range()`                                 | `py.range()`                                          |
| `enumerate()`                             | `py.enumerate()`                                      |
| `zip()`                                   | `py.zip()`                                            |
| `sorted()`                                | `py.sorted()`                                         |
| `reversed()`                              | `py.reversed()`                                       |
| `min()` / `max()`                         | `py.min()` / `py.max()`                               |
| `sum()`                                   | `py.sum()`                                            |
| `abs()`                                   | `py.abs()`                                            |
| `int()` / `float()` / `str()` / `bool()`  | `py.int()` / `py.float()` / `py.str()` / `py.bool()`  |
| `list()` / `dict()` / `set()` / `tuple()` | `py.list()` / `py.dict()` / `py.set()` / `py.tuple()` |
| `ord()` / `chr()`                         | `py.ord()` / `py.chr()`                               |
| `all()` / `any()`                         | `py.all()` / `py.any()`                               |
| `map()` / `filter()`                      | `py.map()` / `py.filter()`                            |

## Roadmap

- [x] **Phase 1**: Literals, operators, control flow, functions, built-ins
- [x] **Phase 2**: List/dict/set comprehensions ✓
- [ ] **Phase 3**: Advanced functions (`*args`, `**kwargs`, lambda, decorators)
- [ ] **Phase 4**: Classes, inheritance
- [ ] **Phase 5**: Exception handling (`try`/`except`/`finally`)
- [ ] **Phase 6**: Module imports
- [ ] **Phase 7**: Async/await, type hints

See [PLAN.md](./PLAN.md) for detailed implementation plans.

## Architecture

The transpiler consists of four main components:

1. **Parser** (`src/parser/`) - Wraps @lezer/python for AST generation
2. **Transformer** (`src/transformer/`) - Converts Python AST to TypeScript
3. **Generator** (`src/generator/`) - Produces TypeScript code output
4. **Runtime** (`src/runtime/`) - `py.*` helper functions for Python semantics

See [docs/adr/](./docs/adr/) for architecture decision records.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type check
npm run typecheck

# Lint
npm run lint
```

## Requirements

- Node.js >= 22.0.0
- TypeScript >= 5.6.0

## License

MIT
