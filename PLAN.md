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
- [x] 412 tests with 89%+ coverage

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
- [x] `@staticmethod`, `@classmethod` → `static` method

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

### Phase 7: Advanced Features

- [ ] Context managers (`with` statement)
- [ ] Async/await
- [ ] Type hints → TypeScript types
- [ ] f-strings → template literals
- [ ] Walrus operator (`:=`)

## py.\* Runtime API

```typescript
export const py = {
  // Arithmetic (Python semantics)
  floordiv(a: number, b: number): number,  // //
  pow(base: number, exp: number): number,   // **
  mod(a: number, b: number): number,        // %

  // Slicing
  slice<T>(obj: string | T[], start?: number, stop?: number, step?: number): string | T[],

  // Iterables
  range(stop: number): Iterable<number>,
  range(start: number, stop: number, step?: number): Iterable<number>,
  enumerate<T>(iterable: Iterable<T>, start?: number): Iterable<[number, T]>,
  zip<T, U>(a: Iterable<T>, b: Iterable<U>): Iterable<[T, U]>,

  // Collections
  list<T>(iterable?: Iterable<T>): T[],
  dict<K, V>(entries?: Iterable<[K, V]>): Map<K, V>,
  set<T>(iterable?: Iterable<T>): Set<T>,
  tuple<T extends any[]>(...items: T): Readonly<T>,

  // Built-ins
  len(obj: string | any[] | Map<any, any> | Set<any>): number,
  abs(x: number): number,
  min<T>(...args: T[]): T,
  max<T>(...args: T[]): T,
  sum(iterable: Iterable<number>, start?: number): number,
  sorted<T>(iterable: Iterable<T>, options?: { key?: (x: T) => any, reverse?: boolean }): T[],
  reversed<T>(iterable: Iterable<T>): Iterable<T>,
  all(iterable: Iterable<unknown>): boolean,
  any(iterable: Iterable<unknown>): boolean,
  map<T, U>(fn: (x: T) => U, iterable: Iterable<T>): Iterable<U>,
  filter<T>(fn: ((x: T) => boolean) | null, iterable: Iterable<T>): Iterable<T>,

  // Type Conversions
  int(x: string | number | boolean, base?: number): number,
  float(x: string | number): number,
  str(x: any): string,
  bool(x: any): boolean,
  repr(x: any): string,

  // String operations
  string: {
    join(sep: string, iterable: Iterable<string>): string,
    split(s: string, sep?: string, maxsplit?: number): string[],
    strip(s: string, chars?: string): string,
    upper(s: string): string,
    lower(s: string): string,
    replace(s: string, old: string, new_: string, count?: number): string,
    startswith(s: string, prefix: string): boolean,
    endswith(s: string, suffix: string): boolean,
    find(s: string, sub: string, start?: number, end?: number): number,
    count(s: string, sub: string): number,
    format(s: string, ...args: unknown[]): string,
  },

  // Membership & Identity
  in<T>(item: T, container: Iterable<T> | string): boolean,

  // Math utilities
  round(x: number, ndigits?: number): number,
  divmod(a: number, b: number): [number, number],
  hex(x: number): string,
  oct(x: number): string,
  bin(x: number): string,
  ord(char: string): number,
  chr(code: number): string,
};
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
│       └── index.ts          # py.* namespace
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
│       ├── builtins.test.ts
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
- **Coverage Target**: 85%+ (currently at 89%)

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
| Tests    | 538        |
| Coverage | 89%+       |
| Phase    | 6 Complete |

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
15. **Phase 7: Advanced Features** ← Next

---

_Last updated: 2026-01-16_
