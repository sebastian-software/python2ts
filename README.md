# python2ts

[![CI](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/sebastian-software/python2ts/graph/badge.svg)](https://codecov.io/gh/sebastian-software/python2ts)
[![npm version](https://img.shields.io/npm/v/python2ts.svg)](https://www.npmjs.com/package/python2ts)
[![License](https://img.shields.io/npm/l/python2ts.svg)](https://github.com/sebastian-software/python2ts/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)

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

## CLI

Transpile Python files from the command line:

```bash
# Transpile and print to stdout
npx python2ts input.py

# Transpile to a file
npx python2ts input.py -o output.ts

# Read from stdin
cat input.py | npx python2ts

# Without runtime import
npx python2ts input.py --no-runtime

# Custom runtime path
npx python2ts input.py --runtime-path ./my/runtime
```

### CLI Options

| Option                  | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `[file]`                | Input Python file (reads from stdin if omitted) |
| `-o, --output <file>`   | Write output to file (stdout if omitted)        |
| `--no-runtime`          | Don't include runtime import statement          |
| `--runtime-path <path>` | Custom runtime import path                      |
| `-h, --help`            | Show help message                               |
| `-v, --version`         | Show version number                             |

## Programmatic Usage

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

### Runtime Namespaces

The runtime is organized into namespaces for better organization:

```typescript
// py.string.* - String methods
py.string.join(", ", ["a", "b", "c"]) // "a, b, c"
py.string.split("a,b,c", ",") // ["a", "b", "c"]
py.string.strip("  hello  ") // "hello"
py.string.upper("hello") // "HELLO"
py.string.replace("hello", "l", "L") // "heLLo"
py.string.startswith("hello", "he") // true
py.string.find("hello", "ll") // 2

// py.list.* - List methods
const arr = [3, 1, 2]
py.list.sort(arr) // arr is now [1, 2, 3]
py.list.reverse(arr) // arr is now [3, 2, 1]
py.list.append(arr, 4) // arr is now [3, 2, 1, 4]
py.list.remove(arr, 2) // arr is now [3, 1, 4]
py.list.index(arr, 1) // 1
py.list.count([1, 1, 2], 1) // 2

// py.dict.* - Dict methods
const obj = { a: 1, b: 2 }
py.dict.get(obj, "a") // 1
py.dict.get(obj, "c", 0) // 0 (default)
py.dict.keys(obj) // ["a", "b"]
py.dict.values(obj) // [1, 2]
py.dict.items(obj) // [["a", 1], ["b", 2]]

// py.set.* - Set methods
const s1 = new Set([1, 2, 3])
const s2 = new Set([2, 3, 4])
py.set.intersection(s1, s2) // Set {2, 3}
py.set.union(s1, s2) // Set {1, 2, 3, 4}
py.set.difference(s1, s2) // Set {1}
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

### Phase 3 (Advanced Functions & Decorators)

| Python                 | TypeScript                                  | Notes               |
| ---------------------- | ------------------------------------------- | ------------------- |
| `def fn(x=1):`         | `function fn(x = 1)`                        | Default parameters  |
| `def fn(*args):`       | `function fn(...args)`                      | Rest parameters     |
| `def fn(**kwargs):`    | `function fn(kwargs)`                       | Keyword args        |
| `lambda x: x + 1`      | `(x) => (x + 1)`                            | Lambda expressions  |
| `fn(key=val)`          | `fn({ key: val })`                          | Keyword arguments   |
| `@decorator def fn():` | `const fn = decorator(function fn() {...})` | Function decorator  |
| `@decorator class C:`  | `const C = decorator(class C {...})`        | Class decorator     |
| `@app.route("/api")`   | `app.route("/api")(class ...)`              | Decorator with args |

### Phase 4 (Classes)

| Python                   | TypeScript                     | Notes                 |
| ------------------------ | ------------------------------ | --------------------- |
| `class Dog:`             | `class Dog {`                  | Class definition      |
| `class Child(Parent):`   | `class Child extends Parent {` | Inheritance           |
| `def __init__(self, x):` | `constructor(x) {`             | Constructor           |
| `def method(self, x):`   | `method(x) {`                  | Instance methods      |
| `self.x`                 | `this.x`                       | Instance attributes   |
| `super().__init__(x)`    | `super(x)`                     | Super calls           |
| `def __str__(self):`     | `toString() {`                 | String representation |
| `@staticmethod`          | `static`                       | Static methods        |
| `@classmethod`           | `static`                       | Class methods         |
| `@property`              | `get`                          | Property getter       |
| `@x.setter`              | `set`                          | Property setter       |
| `__name__`               | `.name`                        | Special attributes    |

### Phase 5 (Exception Handling)

| Python                    | TypeScript                  | Notes              |
| ------------------------- | --------------------------- | ------------------ |
| `try: ... except: ...`    | `try { ... } catch { ... }` | Exception handling |
| `except ValueError:`      | `catch (e) {`               | Typed exception    |
| `except ValueError as e:` | `catch (e) {`               | Named exception    |
| `finally:`                | `finally {`                 | Finally block      |
| `raise ValueError("msg")` | `throw new Error("msg")`    | Raise exception    |
| `raise`                   | `throw`                     | Re-throw           |

### Phase 6 (Modules & Imports)

| Python                        | TypeScript                          | Notes           |
| ----------------------------- | ----------------------------------- | --------------- |
| `import os`                   | `import * as os from "os"`          | Module import   |
| `import numpy as np`          | `import * as np from "numpy"`       | Import alias    |
| `from os import path`         | `import { path } from "os"`         | Named import    |
| `from os import path, getcwd` | `import { path, getcwd } from "os"` | Multiple        |
| `from x import y as z`        | `import { y as z } from "x"`        | Import alias    |
| `from math import *`          | `import * as math from "math"`      | Star import     |
| `from . import utils`         | `import * as utils from "./utils"`  | Relative        |
| `from ..utils import helper`  | `import { helper } from "../utils"` | Parent relative |

### Phase 7 (Async/Await & Context Managers)

| Python                  | TypeScript                                   | Notes           |
| ----------------------- | -------------------------------------------- | --------------- |
| `async def fn():`       | `async function fn() {`                      | Async function  |
| `await expr`            | `await expr`                                 | Await           |
| `with open(f) as x:`    | `const x = open(f); try {...} finally {...}` | Context manager |
| `async with expr as x:` | Same with `await` in finally                 | Async context   |

### F-Strings

| Python            | TypeScript                         | Notes            |
| ----------------- | ---------------------------------- | ---------------- |
| `f"Hello {name}"` | `` `Hello ${name}` ``              | Basic f-string   |
| `f"{value:.2f}"`  | `` `${py.format(value, ".2f")}` `` | Format specifier |
| `f"{name!r}"`     | `` `${py.repr(name)}` ``           | Repr conversion  |
| `f"{value!s}"`    | `` `${py.str(value)}` ``           | Str conversion   |
| `f"{text!a}"`     | `` `${py.ascii(text)}` ``          | ASCII conversion |
| `f"{{escaped}}"`  | `` `{escaped}` ``                  | Escaped braces   |

### Walrus Operator

| Python                  | TypeScript                 | Notes               |
| ----------------------- | -------------------------- | ------------------- |
| `(n := expr)`           | `(n = expr)`               | Assignment expr     |
| `if (n := len(a)) > 0:` | `if ((n = py.len(a)) > 0)` | In conditionals     |
| `while (x := next()):`  | `while ((x = next()))`     | In while loops      |
| `[y := f(x), y*2]`      | `[y = f(x), y * 2]`        | In list expressions |

### String Formatting

| Python                          | TypeScript                           | Notes                |
| ------------------------------- | ------------------------------------ | -------------------- |
| `"Hello %s" % name`             | `py.sprintf("Hello %s", name)`       | %-style formatting   |
| `"%s is %d" % (name, age)`      | `py.sprintf("%s is %d", [...])`      | Multiple values      |
| `"Hello {}".format(name)`       | `py.strFormat("Hello {}", name)`     | .format() method     |
| `"{0} {1}".format(a, b)`        | `py.strFormat("{0} {1}", a, b)`      | Indexed placeholders |
| `"{name}".format(name="World")` | `py.strFormat("{name}", {name:...})` | Named placeholders   |

### Generators

| Python               | TypeScript              | Notes              |
| -------------------- | ----------------------- | ------------------ |
| `def gen(): yield x` | `function* gen() {...}` | Generator function |
| `yield value`        | `yield value`           | Yield expression   |

### Match Statement (Python 3.10+)

| Python          | TypeScript      | Notes            |
| --------------- | --------------- | ---------------- |
| `match x:`      | `switch (x) {`  | Match statement  |
| `case 1:`       | `case 1:`       | Literal pattern  |
| `case "hello":` | `case "hello":` | String pattern   |
| `case _:`       | `default:`      | Wildcard pattern |

### Docstrings → JSDoc

| Python                            | TypeScript                         | Notes             |
| --------------------------------- | ---------------------------------- | ----------------- |
| `"""Docstring"""`                 | `/** JSDoc */`                     | Basic docstring   |
| `Args: name: description`         | `@param name - description`        | Parameter docs    |
| `Returns: description`            | `@returns description`             | Return value docs |
| `Raises: ValueError: description` | `@throws {ValueError} description` | Exception docs    |

Example:

```python
def greet(name):
    """Greet a person.

    Args:
        name: The person's name.

    Returns:
        A greeting string.
    """
    return f"Hello, {name}"
```

→

```typescript
/**
 * Greet a person.
 *
 * @param name - The person's name.
 * @returns A greeting string.
 */
function greet(name) {
  return `Hello, ${name}`
}
```

### @dataclass

| Python                        | TypeScript                             | Notes           |
| ----------------------------- | -------------------------------------- | --------------- |
| `@dataclass class Person:`    | `class Person { constructor(...) {} }` | Basic dataclass |
| `name: str`                   | `name: string;`                        | Typed field     |
| `age: int = 0`                | `age: number = 0;`                     | Default value   |
| `@dataclass(frozen=True)`     | `readonly` + `Object.freeze(this)`     | Immutable       |
| `field(default_factory=list)` | `= []`                                 | Factory default |

Example:

```python
@dataclass
class Person:
    name: str
    age: int
    email: str = ""
```

→

```typescript
class Person {
  name: string
  age: number
  email: string = ""

  constructor(name: string, age: number, email: string = "") {
    this.name = name
    this.age = age
    this.email = email
  }
}
```

### Type Hints

| Python                   | TypeScript                       | Notes               |
| ------------------------ | -------------------------------- | ------------------- |
| `x: int = 5`             | `let x: number = 5`              | Basic types         |
| `x: str = "hi"`          | `let x: string = "hi"`           | String type         |
| `x: List[int]`           | `x: number[]`                    | Generic list        |
| `x: Dict[str, int]`      | `x: Record<string, number>`      | Generic dict        |
| `x: Optional[str]`       | `x: string \| null`              | Optional type       |
| `def fn(x: int) -> str:` | `function fn(x: number): string` | Function signatures |

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
- [x] **Phase 2**: List/dict/set comprehensions
- [x] **Phase 3**: Advanced functions (`*args`, `**kwargs`, lambda, decorators)
- [x] **Phase 4**: Classes, inheritance, `@staticmethod`, `@property`, `@setter`
- [x] **Phase 5**: Exception handling (`try`/`except`/`finally`, `raise`)
- [x] **Phase 6**: Module imports (`import`, `from...import`, relative imports)
- [x] **Phase 7**: Async/await, context managers (`with` statement)
- [x] **F-Strings**: Template literals with format specifiers and conversions
- [x] **Walrus Operator**: Assignment expressions (`:=`)
- [x] **String Formatting**: `%`-style and `.format()` method
- [x] **Generators**: `function*` syntax with `yield`
- [x] **Match Statement**: Python 3.10+ `match`/`case` to `switch`
- [x] **Type Hints**: Python types → TypeScript types
- [x] **Docstrings**: Google/NumPy-style docstrings → JSDoc comments
- [x] **Class Decorators**: `@decorator class C:` → `const C = decorator(class C {})`
- [x] **@dataclass**: Automatic constructor generation with typed fields

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
