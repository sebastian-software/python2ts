# Python to TypeScript Converter - Project Plan

## Overview

An AST-based transpiler that converts Python code to TypeScript. The parser is based on
`@lezer/python`, and Python-specific operations are delegated to runtime helpers under the `py`
namespace.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Python Code   │────▶│  Lezer Parser   │────▶│   Lezer AST     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ TypeScript Code │◀────│  Code Generator │◀────│   Transformer   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  py.* Runtime   │
                        └─────────────────┘
```

## Core Components

### 1. Parser (`src/parser/`)

- Wrapper around `@lezer/python`
- AST traversal and node types
- See [ADR-0001](./docs/adr/0001-use-lezer-python-parser.md)

### 2. Transformer (`src/transformer/`)

- Converts Lezer AST to TypeScript
- Handlers for each Python node type

### 3. Code Generator (`src/generator/`)

- Generates TypeScript code from transformed AST
- Manages runtime imports

### 4. Runtime Library (`src/runtime/`)

- `py.*` helper functions for Python-specific operations
- See [ADR-0002](./docs/adr/0002-runtime-namespace-design.md)

## Implementation Phases

### Phase 1: Foundation (MVP) ✅ COMPLETED

- [x] Project setup (TypeScript, Vitest, ESLint, tsup)
- [x] Lezer parser integration
- [x] Base transformer structure
- [x] Code generator
- [x] Runtime library foundation
- [x] 944+ tests with 93%+ coverage

**Supported Syntax:**

- [x] Literals: `int`, `float`, `str`, `bool`, `None`
- [x] Variables and assignments
- [x] Arithmetic operators: `+`, `-`, `*`, `/`, `//`, `%`, `**`
- [x] Comparison operators: `==`, `!=`, `<`, `>`, `<=`, `>=`
- [x] Logical operators: `and`, `or`, `not`
- [x] Control flow: `if`/`elif`/`else`, `while`, `for-in`
- [x] `break`, `continue`, `pass`
- [x] Function definitions and calls
- [x] Lists, dictionaries, tuples
- [x] Slicing with `py.slice()`
- [x] Built-in functions: `print`, `len`, `range`, `enumerate`, `zip`, etc.

### Phase 2: Comprehensions & Advanced Data Structures ✅ COMPLETED

- [x] List comprehensions → `.map()` / `.filter()` / `.flatMap()`
- [x] Dict comprehensions → `py.dict()`
- [x] Set comprehensions → `py.set()`
- [x] Generator expressions → `(function*() { ... })()`
- [x] Tuple unpacking in for loops → `for (const [x, y] of ...)`
- [x] Multiple assignment (`a, b = 1, 2`) → `let [a, b] = [1, 2]`

### Phase 3: Advanced Functions ✅ COMPLETED

- [x] Default parameter values (`def foo(x=1)` → `function foo(x = 1)`)
- [x] `*args` (rest parameters) → `...args`
- [x] `**kwargs` → regular parameter
- [x] Lambda expressions (`lambda x: x + 1` → `(x) => (x + 1)`)
- [x] Keyword arguments in calls (`fn(key=val)` → `fn({ key: val })`)
- [x] Decorators (basic support) (`@dec def fn()` → `const fn = dec(function fn())`)

### Phase 4: Classes ✅ COMPLETED

- [x] Class definitions (`class Dog:` → `class Dog {`)
- [x] `__init__` → constructor
- [x] Instance methods (removes `self` parameter, replaces `self.` with `this.`)
- [x] Inheritance (`class Child(Parent):` → `class Child extends Parent {`)
- [x] `super().__init__(...)` → `super(...)`
- [x] `__str__`, `__repr__` → `toString()`
- [x] `@property` decorator → `get` accessor
- [x] `@x.setter` decorator → `set` accessor
- [x] `@staticmethod`, `@classmethod` → `static` method
- [x] Special attributes (`__name__` → `.name`)

### Phase 5: Exception Handling ✅ COMPLETED

- [x] `try`/`except`/`finally` → `try`/`catch`/`finally`
- [x] `try`/`except` with exception type (`except ValueError:`)
- [x] `try`/`except` with `as` clause (`except ValueError as e:`)
- [x] `raise` → `throw`
- [x] `raise ExceptionType("message")` → `throw new Error("message")`
- [x] Exception types mapping (ValueError, TypeError, etc. → Error)

### Phase 6: Modules & Imports ✅ COMPLETED

- [x] `import module` → `import * as module from "module"`
- [x] `from module import name` → `import { name } from "module"`
- [x] `from module import name as alias` → `import { name as alias } from "module"`
- [x] `from module import *` → `import * as module from "module"`
- [x] Relative imports (`from . import`, `from .. import`, `from ...`)
- [x] Module aliasing (`import x as y` → `import * as y from "x"`)

### Phase 7: Advanced Features ✅ COMPLETED

- [x] `async def` → `async function`
- [x] `await` expression
- [x] `async with` statement
- [x] Context managers (`with` statement) → `try/finally` with `Symbol.dispose`
- [x] f-strings → template literals with format specifiers and conversions
- [x] Walrus operator (`:=`) → assignment expressions
- [x] Type hints → TypeScript types (configurable via `emitTypes` option)
- [x] %-style string formatting (`"Hello %s" % name` → `py.sprintf(...)`)
- [x] `.format()` method (`"{} {}".format(a, b)` → `py.strFormat(...)`)
- [x] Generator functions (`yield` → `function*`)
- [x] Match/case statements → `switch`/`case`
- [x] Spread in calls (`fn(*args)` → `fn(...args)`)

## py.\* Runtime API

The runtime is organized into namespaces for better organization. Each namespace is also callable as
a constructor:

```typescript
export const py = {
  // Namespaced methods (also callable as constructors)
  string: { join, split, strip, upper, lower, replace, ... },
  list: { remove, sort, index, count, ... },      // py.list([1,2,3]) or py.list.remove(arr, x)
  dict: { get, keys, values, items, ... },        // py.dict() or py.dict.get(obj, key)
  set: { intersection, difference, union, ... },  // py.set() or py.set.intersection(a, b)

  // Arithmetic (Python semantics)
  floordiv(a: number, b: number): number,  // //
  pow(base: number, exp: number): number,   // **
  mod(a: number, b: number): number,        // %

  // Slicing
  slice<T>(obj: string | T[], start?: number, stop?: number, step?: number): string | T[],

  // Iterables
  range(stop: number): Iterable<number>,
  enumerate<T>(iterable: Iterable<T>, start?: number): Iterable<[number, T]>,
  zip<T, U>(a: Iterable<T>, b: Iterable<U>): Iterable<[T, U]>,
  reversed<T>(iterable: Iterable<T>): Iterable<T>,
  sorted<T>(iterable: Iterable<T>, options?: { key?, reverse? }): T[],

  // Built-ins
  len, abs, min, max, sum, all, any, map, filter, round,
  ord, chr, hex, oct, bin, divmod,

  // Type Conversions
  int, float, str, bool, repr, ascii,

  // String Formatting
  sprintf(format: string, args: unknown): string,   // %-style: "Hello %s" % name
  strFormat(format: string, ...args): string,       // .format(): "{} {}".format(a, b)

  // Membership & Identity
  in<T>(item: T, container: Iterable<T> | string): boolean,
  is(a: unknown, b: unknown): boolean,
};
```

### Namespaced Methods

```typescript
// py.string.* - String methods
py.string.join(sep, iterable)           // "sep".join(list)
py.string.split(s, sep?, maxsplit?)     // s.split(sep)
py.string.strip(s, chars?)              // s.strip()
py.string.upper(s) / lower(s)           // s.upper() / s.lower()
py.string.replace(s, old, new, count?)  // s.replace(old, new)
py.string.find(s, sub) / rfind / index / rindex
py.string.count(s, sub)
py.string.startswith(s, prefix) / endswith(s, suffix)
py.string.capitalize(s) / title(s) / swapcase(s)
py.string.zfill(s, width) / center(s, width)
py.string.partition(s, sep) / rpartition(s, sep)

// py.list.* - List methods
py.list.remove(arr, value)              // arr.remove(value)
py.list.sort(arr, { key?, reverse? })   // arr.sort(key=..., reverse=...)
py.list.index(arr, value)               // arr.index(value)
py.list.count(arr, value)               // arr.count(value)
py.list.append / extend / insert / pop / clear / copy / reverse

// py.dict.* - Dict methods
py.dict.get(obj, key, default?)         // obj.get(key, default)
py.dict.setdefault(obj, key, default)   // obj.setdefault(key, default)
py.dict.fromkeys(keys, value?)          // dict.fromkeys(keys, value)
py.dict.keys / values / items / pop / popitem / update / clear / copy

// py.set.* - Set methods
py.set.intersection(a, b)               // a.intersection(b)
py.set.difference(a, b)                 // a.difference(b)
py.set.symmetricDifference(a, b)        // a.symmetric_difference(b)
py.set.issubset(a, b) / issuperset(a, b)
py.set.union / add / remove / discard / pop / clear / copy
```

## Project Structure

```
python2ts/
├── src/
│   ├── index.ts              # Main exports
│   ├── parser/
│   │   ├── index.ts          # Parser wrapper
│   │   └── types.ts          # AST types
│   ├── transformer/
│   │   └── index.ts          # Main transformer
│   ├── generator/
│   │   └── index.ts          # Code generator
│   └── runtime/
│       ├── index.ts          # Main exports, composes py
│       ├── core.ts           # Arithmetic, slice, formatting
│       ├── builtins.ts       # len, range, enumerate, etc.
│       ├── string.ts         # py.string.* methods
│       ├── list.ts           # py.list.* methods
│       ├── dict.ts           # py.dict.* methods
│       └── set.ts            # py.set.* methods
├── tests/
│   ├── parser.test.ts
│   ├── transformer.test.ts
│   ├── generator.test.ts
│   ├── runtime.test.ts
│   ├── integration.test.ts
│   └── e2e/
│       ├── literals.test.ts
│       ├── operators.test.ts
│       ├── control-flow.test.ts
│       ├── functions.test.ts
│       ├── advanced.test.ts
│       ├── advanced-functions.test.ts
│       ├── builtins.test.ts
│       ├── classes.test.ts
│       ├── comprehensions.test.ts
│       ├── exceptions.test.ts
│       ├── fstrings.test.ts
│       ├── imports.test.ts
│       ├── async-with.test.ts
│       ├── walrus.test.ts
│       ├── methods.test.ts
│       ├── new-features.test.ts
│       ├── smoke.test.ts
│       └── edge-cases.test.ts
├── docs/
│   └── adr/                  # Architecture Decision Records
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── PLAN.md
```

## Testing Strategy

See [ADR-0004](./docs/adr/0004-testing-strategy.md) for details.

- **Unit Tests**: Individual component testing
- **Integration Tests**: Full pipeline testing
- **E2E Tests**: Real Python code conversion verification
- **Coverage Target**: 90%+ (currently at ~93%)

## Conventions

### Git Commits (Conventional Commits)

```
feat: add list comprehension support
fix: handle nested slicing correctly
test: add comprehension edge case tests
refactor: extract visitor pattern for expressions
docs: update README with new features
chore: upgrade dependencies
```

### Code Style

- ESLint with TypeScript rules
- Strict TypeScript settings (`strict: true`)
- ESM-only distribution (see [ADR-0005](./docs/adr/0005-esm-only-distribution.md))

## Current Status

| Metric   | Value      |
| -------- | ---------- |
| Tests    | 944+       |
| Coverage | 93%+       |
| Phase    | 7 Complete |

## Next Steps

1. ~~Project setup~~ ✅
2. ~~Parser integration~~ ✅
3. ~~Base transformer~~ ✅
4. ~~Code generator~~ ✅
5. ~~E2E tests~~ ✅
6. ~~List comprehensions~~ ✅
7. ~~Dict/Set comprehensions~~ ✅
8. ~~Generator expressions~~ ✅
9. ~~Tuple unpacking~~ ✅
10. ~~Multiple assignment~~ ✅
11. ~~Phase 3: Advanced Functions~~ ✅
12. ~~Phase 4: Classes~~ ✅
13. ~~Phase 5: Exception Handling~~ ✅
14. ~~Phase 6: Modules & Imports~~ ✅
15. ~~Phase 7: Advanced Features~~ ✅
16. ~~F-Strings~~ ✅
17. ~~Walrus Operator~~ ✅
18. ~~Type Hints~~ ✅ (stripped from output)
19. ~~String Formatting~~ ✅ (%-style and .format())
20. ~~Generators~~ ✅
21. ~~Match/Case~~ ✅

---

_Last updated: 2026-01-16_
