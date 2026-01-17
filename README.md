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

// py.itertools.* - Iterator tools
py.itertools.chain([1, 2], [3, 4]) // [1, 2, 3, 4]
py.itertools.combinations([1, 2, 3], 2) // [[1,2], [1,3], [2,3]]
py.itertools.permutations([1, 2, 3], 2) // [[1,2], [1,3], [2,1], ...]
py.itertools.zip_longest([1, 2], ["a"]) // [[1,"a"], [2,undefined]]

// py.functools.* - Higher-order functions
const add5 = py.functools.partial((a, b) => a + b, 5)
add5(3) // 8
py.functools.reduce((a, b) => a + b, [1, 2, 3, 4, 5]) // 15

// py.collections - Specialized containers
const counter = new py.Counter("abracadabra")
counter.mostCommon(3) // [["a", 5], ["b", 2], ["r", 2]]
const dd = py.defaultdict(() => [])
dd.get("key").push(1) // Creates [] automatically

// py.math.* - Math functions
py.math.sqrt(16) // 4
py.math.gcd(12, 8) // 4
py.math.factorial(5) // 120

// py.random.* - Random functions
py.random.randint(1, 10) // Random integer 1-10
py.random.choice(["a", "b", "c"]) // Random element
py.random.shuffle([1, 2, 3]) // Shuffles in place

// py.datetime.* - Date/time classes
const now = py.datetime.datetime.now()
const d = new py.datetime.date(2024, 1, 15)
d.isoformat() // "2024-01-15"

// py.re.* - Regular expressions
const m = py.re.search("\\d+", "abc123")
m?.group() // "123"
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

| Python                                    | TypeScript                                            | Notes                  |
| ----------------------------------------- | ----------------------------------------------------- | ---------------------- |
| **Literals & Operators**                  |                                                       |                        |
| `True` / `False`                          | `true` / `false`                                      |                        |
| `None`                                    | `null`                                                |                        |
| `x // y`                                  | `py.floordiv(x, y)`                                   | Python semantics       |
| `x ** y`                                  | `py.pow(x, y)`                                        |                        |
| `x % y`                                   | `py.mod(x, y)`                                        | Python semantics       |
| `x and y`                                 | `x && y`                                              |                        |
| `x or y`                                  | `x \|\| y`                                            |                        |
| `not x`                                   | `!x`                                                  |                        |
| `x in items`                              | `py.in(x, items)`                                     |                        |
| `arr[1:3]`                                | `py.slice(arr, 1, 3)`                                 | Full slice support     |
| `[1, 2, 3]`                               | `[1, 2, 3]`                                           |                        |
| `{"a": 1}`                                | `{ "a": 1 }`                                          |                        |
| `{1, 2, 3}`                               | `py.set([1, 2, 3])`                                   | Set literal            |
| `# comment`                               | `// comment`                                          |                        |
| **Control Flow**                          |                                                       |                        |
| `if/elif/else`                            | `if/else if/else`                                     |                        |
| `while`                                   | `while`                                               |                        |
| `for x in items:`                         | `for (const x of items)`                              |                        |
| `for x, y in items:`                      | `for (const [x, y] of items)`                         | Tuple unpacking        |
| `match x:`                                | `switch (x) {`                                        | Match statement        |
| `case 1:`                                 | `case 1:`                                             | Literal pattern        |
| `case _:`                                 | `default:`                                            | Wildcard pattern       |
| **Functions**                             |                                                       |                        |
| `def fn():`                               | `function fn()`                                       |                        |
| `def fn(x=1):`                            | `function fn(x = 1)`                                  | Default parameters     |
| `def fn(*args):`                          | `function fn(...args)`                                | Rest parameters        |
| `def fn(**kwargs):`                       | `function fn(kwargs)`                                 | Keyword args           |
| `lambda x: x + 1`                         | `(x) => (x + 1)`                                      | Lambda expressions     |
| `fn(key=val)`                             | `fn({ key: val })`                                    | Keyword arguments      |
| `async def fn():`                         | `async function fn() {`                               | Async function         |
| `await expr`                              | `await expr`                                          | Await                  |
| `def gen(): yield x`                      | `function* gen() {...}`                               | Generator function     |
| `yield value`                             | `yield value`                                         | Yield expression       |
| **Decorators**                            |                                                       |                        |
| `@decorator def fn():`                    | `const fn = decorator(function fn() {...})`           | Function decorator     |
| `@decorator class C:`                     | `const C = decorator(class C {...})`                  | Class decorator        |
| `@app.route("/api")`                      | `app.route("/api")(class ...)`                        | Decorator with args    |
| **Classes**                               |                                                       |                        |
| `class Dog:`                              | `class Dog {`                                         | Class definition       |
| `class Child(Parent):`                    | `class Child extends Parent {`                        | Inheritance            |
| `def __init__(self, x):`                  | `constructor(x) {`                                    | Constructor            |
| `def method(self, x):`                    | `method(x) {`                                         | Instance methods       |
| `self.x`                                  | `this.x`                                              | Instance attributes    |
| `super().__init__(x)`                     | `super(x)`                                            | Super calls            |
| `def __str__(self):`                      | `toString() {`                                        | String representation  |
| `@staticmethod`                           | `static`                                              | Static methods         |
| `@classmethod`                            | `static`                                              | Class methods          |
| `@property`                               | `get`                                                 | Property getter        |
| `@x.setter`                               | `set`                                                 | Property setter        |
| `__name__`                                | `.name`                                               | Special attributes     |
| **@dataclass**                            |                                                       |                        |
| `@dataclass class Person:`                | `class Person { constructor(...) {} }`                | Basic dataclass        |
| `name: str`                               | `name: string;`                                       | Typed field            |
| `age: int = 0`                            | `age: number = 0;`                                    | Default value          |
| `@dataclass(frozen=True)`                 | `readonly` + `Object.freeze(this)`                    | Immutable              |
| `field(default_factory=list)`             | `= []`                                                | Factory default        |
| **NamedTuple**                            |                                                       |                        |
| `class Point(NamedTuple):`                | `class Point { readonly x; ... }`                     | Immutable class        |
| `x: int`                                  | `readonly x: number`                                  | Readonly field         |
| **Enum**                                  |                                                       |                        |
| `class Color(Enum): RED = 1`              | `type Color = "RED" \| ...`                           | Sequential → union     |
| `class Status(Enum): X = "x"`             | `type Status = "x" \| ...`                            | String → union         |
| `class Http(Enum): OK = 200`              | `const Http = { OK: 200 } as const`                   | Values → as const      |
| `class Mode(StrEnum): ...`                | `type Mode = "..." \| ...`                            | StrEnum → union        |
| **Comprehensions**                        |                                                       |                        |
| `[x for x in items]`                      | `items.map((x) => x)`                                 | List comprehension     |
| `[x for x in items if x > 0]`             | `items.filter(...).map(...)`                          | With condition         |
| `[x + y for x in a for y in b]`           | `a.flatMap((x) => b.map(...))`                        | Nested comprehension   |
| `{x: x * 2 for x in items}`               | `py.dict(items.map(...))`                             | Dict comprehension     |
| `{x * 2 for x in items}`                  | `py.set(items.map(...))`                              | Set comprehension      |
| `(x for x in items)`                      | `(function*() { ... })()`                             | Generator expression   |
| `sum(x for x in items)`                   | `py.sum((function*() {...})())`                       | Generator in function  |
| **Assignment**                            |                                                       |                        |
| `a, b = 1, 2`                             | `let [a, b] = [1, 2]`                                 | Multiple assignment    |
| `a, b = b, a`                             | `let [a, b] = [b, a]`                                 | Swap pattern           |
| `(n := expr)`                             | `(n = expr)`                                          | Walrus operator        |
| `if (n := len(a)) > 0:`                   | `if ((n = py.len(a)) > 0)`                            | Walrus in conditionals |
| **Exception Handling**                    |                                                       |                        |
| `try: ... except: ...`                    | `try { ... } catch { ... }`                           | Exception handling     |
| `except ValueError:`                      | `catch (e) {`                                         | Typed exception        |
| `except ValueError as e:`                 | `catch (e) {`                                         | Named exception        |
| `finally:`                                | `finally {`                                           | Finally block          |
| `raise ValueError("msg")`                 | `throw new Error("msg")`                              | Raise exception        |
| `raise`                                   | `throw`                                               | Re-throw               |
| **Context Managers**                      |                                                       |                        |
| `with open(f) as x:`                      | `const x = open(f); try {...} finally {...}`          | Context manager        |
| `async with expr as x:`                   | Same with `await` in finally                          | Async context          |
| **Imports**                               |                                                       |                        |
| `import os`                               | `import * as os from "os"`                            | Module import          |
| `import numpy as np`                      | `import * as np from "numpy"`                         | Import alias           |
| `from os import path`                     | `import { path } from "os"`                           | Named import           |
| `from os import path, getcwd`             | `import { path, getcwd } from "os"`                   | Multiple               |
| `from x import y as z`                    | `import { y as z } from "x"`                          | Import alias           |
| `from math import *`                      | `import * as math from "math"`                        | Star import            |
| `from . import utils`                     | `import * as utils from "./utils"`                    | Relative               |
| `from ..utils import helper`              | `import { helper } from "../utils"`                   | Parent relative        |
| **Type Hints**                            |                                                       |                        |
| `x: int = 5`                              | `let x: number = 5`                                   | Basic types            |
| `x: str = "hi"`                           | `let x: string = "hi"`                                | String type            |
| `x: List[int]`                            | `x: number[]`                                         | Generic list           |
| `x: Dict[str, int]`                       | `x: Record<string, number>`                           | Generic dict           |
| `x: Optional[str]`                        | `x: string \| null`                                   | Optional type          |
| `def fn(x: int) -> str:`                  | `function fn(x: number): string`                      | Function signatures    |
| `Literal["a", "b"]`                       | `"a" \| "b"`                                          | Literal types          |
| `class Config(TypedDict):`                | `interface Config { ... }`                            | TypedDict → interface  |
| `class Box(Generic[T]):`                  | `class Box<T> { ... }`                                | Generic classes        |
| `Vector: TypeAlias = list[float]`         | `type Vector = number[]`                              | Type alias             |
| `class Drawable(Protocol):`               | `interface Drawable { ... }`                          | Protocol → interface   |
| `class Shape(ABC):`                       | `abstract class Shape { ... }`                        | Abstract base class    |
| `@abstractmethod def area():`             | `abstract area(): ...`                                | Abstract method        |
| `@overload def fn(x: int) -> int:`        | `function fn(x: number): number`                      | Function overloads     |
| **F-Strings**                             |                                                       |                        |
| `f"Hello {name}"`                         | `` `Hello ${name}` ``                                 | Basic f-string         |
| `f"{value:.2f}"`                          | `` `${py.format(value, ".2f")}` ``                    | Format specifier       |
| `f"{name!r}"`                             | `` `${py.repr(name)}` ``                              | Repr conversion        |
| `f"{value!s}"`                            | `` `${py.str(value)}` ``                              | Str conversion         |
| `f"{{escaped}}"`                          | `` `{escaped}` ``                                     | Escaped braces         |
| **String Formatting**                     |                                                       |                        |
| `"Hello %s" % name`                       | `py.sprintf("Hello %s", name)`                        | %-style formatting     |
| `"%s is %d" % (name, age)`                | `py.sprintf("%s is %d", [...])`                       | Multiple values        |
| `"Hello {}".format(name)`                 | `py.strFormat("Hello {}", name)`                      | .format() method       |
| `"{0} {1}".format(a, b)`                  | `py.strFormat("{0} {1}", a, b)`                       | Indexed placeholders   |
| `"{name}".format(name="World")`           | `py.strFormat("{name}", {name:...})`                  | Named placeholders     |
| **Docstrings → JSDoc**                    |                                                       |                        |
| `"""Docstring"""`                         | `/** JSDoc */`                                        | Basic docstring        |
| `Args: name: description`                 | `@param name - description`                           | Parameter docs         |
| `Returns: description`                    | `@returns description`                                | Return value docs      |
| `Raises: ValueError: description`         | `@throws {ValueError} description`                    | Exception docs         |
| **Built-in Functions**                    |                                                       |                        |
| `print()`                                 | `console.log()`                                       |                        |
| `len()`                                   | `py.len()`                                            |                        |
| `range()`                                 | `py.range()`                                          |                        |
| `enumerate()`                             | `py.enumerate()`                                      |                        |
| `zip()`                                   | `py.zip()`                                            |                        |
| `sorted()`                                | `py.sorted()`                                         |                        |
| `reversed()`                              | `py.reversed()`                                       |                        |
| `min()` / `max()`                         | `py.min()` / `py.max()`                               |                        |
| `sum()`                                   | `py.sum()`                                            |                        |
| `abs()`                                   | `py.abs()`                                            |                        |
| `int()` / `float()` / `str()` / `bool()`  | `py.int()` / `py.float()` / `py.str()` / `py.bool()`  |                        |
| `list()` / `dict()` / `set()` / `tuple()` | `py.list()` / `py.dict()` / `py.set()` / `py.tuple()` |                        |
| `ord()` / `chr()`                         | `py.ord()` / `py.chr()`                               |                        |
| `all()` / `any()`                         | `py.all()` / `py.any()`                               |                        |
| `map()` / `filter()`                      | `py.map()` / `py.filter()`                            |                        |
| **Standard Library Modules**              |                                                       |                        |
| `from math import sqrt`                   | → uses `py.math.sqrt()`                               | math functions         |
| `from random import randint`              | → uses `py.random.randint()`                          | random functions       |
| `from json import dumps`                  | → uses `py.json.dumps()`                              | JSON operations        |
| `from os.path import join`                | → uses `py.os.path.join()`                            | Path operations        |
| `from datetime import datetime`           | → uses `py.datetime.datetime`                         | Date/time classes      |
| `from re import match`                    | → uses `py.re.match()`                                | Regex operations       |
| `from itertools import chain`             | → uses `py.itertools.chain()`                         | Iterator tools         |
| `from functools import partial`           | → uses `py.functools.partial()`                       | Higher-order functions |
| `from collections import Counter`         | → uses `py.Counter`                                   | Specialized containers |
| `from string import ascii_lowercase`      | → uses `py.ascii_lowercase`                           | String constants       |
| `Final[T]`                                | `const` / `readonly`                                  | Immutable declarations |
| `ClassVar[T]`                             | `static`                                              | Class-level variables  |

### Docstrings Example

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

### @dataclass Example

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
- [x] **NamedTuple**: Immutable classes with readonly fields and Object.freeze
- [x] **Enum**: Type-safe enums → string unions or `as const` objects
- [x] **TypedDict**: TypedDict classes → TypeScript interfaces
- [x] **Generic[T]**: Generic classes with type parameters
- [x] **TypeAlias**: Type aliases → TypeScript type declarations
- [x] **Protocol**: Protocol classes → TypeScript interfaces
- [x] **ABC/@abstractmethod**: Abstract base classes → TypeScript abstract classes
- [x] **@overload**: Function overloads → TypeScript function signatures
- [x] **Final[T]/ClassVar[T]**: Immutable and class-level type modifiers
- [x] **Enhanced Callable**: `Callable[[int, str], bool]` →
      `(arg0: number, arg1: string) => boolean`
- [x] **Runtime Modules**: math, random, json, os, datetime, re, itertools, functools, collections,
      string

## Architecture

The transpiler consists of four main components:

1. **Parser** (`src/parser/`) - Wraps @lezer/python for AST generation
2. **Transformer** (`src/transformer/`) - Converts Python AST to TypeScript
3. **Generator** (`src/generator/`) - Produces TypeScript code output
4. **Runtime** (`src/runtime/`) - `py.*` helper functions for Python semantics

### Architecture Decision Records

- [ADR-0001](./docs/adr/0001-use-lezer-python-parser.md) - Use @lezer/python as Parser
- [ADR-0002](./docs/adr/0002-runtime-namespace-design.md) - Runtime Namespace Design (py.\*)
- [ADR-0003](./docs/adr/0003-python-operator-semantics.md) - Preserve Python Operator Semantics
- [ADR-0004](./docs/adr/0004-testing-strategy.md) - Testing Strategy with Vitest
- [ADR-0005](./docs/adr/0005-esm-only-distribution.md) - ESM-Only Distribution
- [ADR-0006](./docs/adr/0006-type-hints-to-typescript.md) - Python Type Hints to TypeScript
- [ADR-0007](./docs/adr/0007-dataclass-transformation.md) - @dataclass Transformation Strategy

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
