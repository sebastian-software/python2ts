# pythonlib

[![npm version](https://img.shields.io/npm/v/pythonlib.svg)](https://www.npmjs.com/package/pythonlib)
[![npm downloads](https://img.shields.io/npm/dm/pythonlib.svg)](https://www.npmjs.com/package/pythonlib)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/pythonlib)](https://bundlephobia.com/package/pythonlib)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/pythonlib.svg)](https://github.com/sebastian-software/python2ts/blob/main/LICENSE)

**Python's powerful standard library, TypeScript's familiar style** — itertools, functools,
collections, and more.

> Zero dependencies · Full TypeScript support · Tree-shakeable · camelCase API · Works everywhere JS
> runs

## Why pythonlib?

Python has an incredibly powerful standard library. Now you can use familiar Python patterns in
TypeScript — with **idiomatic camelCase naming** that feels native:

- **Intuitive iteration** — `range()`, `enumerate()`, `zip()` instead of manual loops
- **Powerful combinatorics** — `combinations()`, `permutations()`, `product()`
- **Functional tools** — `reduce()`, `partial()`, `lruCache()`
- **Smart collections** — `Counter`, `defaultdict`, `deque`
- **TypeScript-native API** — `zipLongest()`, `randInt()`, `fromIsoFormat()` (not snake_case!)
- **And much more** — datetime, regex, math, random

## Installation

```bash
npm install pythonlib
# or
pnpm add pythonlib
# or
yarn add pythonlib
```

## Quick Start

```typescript
import { range, enumerate, sorted, len } from "pythonlib"
import { combinations } from "pythonlib/itertools"
import { Counter } from "pythonlib/collections"

// Python-style iteration
for (const i of range(10)) {
  console.log(i)
}

// Combinatorics made easy
for (const combo of combinations([1, 2, 3], 2)) {
  console.log(combo) // [1,2], [1,3], [2,3]
}

// Count occurrences
const counter = new Counter("mississippi")
console.log(counter.mostCommon(2)) // [["i", 4], ["s", 4]]
```

## Import Structure

pythonlib uses **subpath exports** for optimal tree-shaking. Import only what you need:

| Import Path             | Contents                                           |
| ----------------------- | -------------------------------------------------- |
| `pythonlib`             | Builtins: `len`, `range`, `sorted`, `enumerate`... |
| `pythonlib/itertools`   | `chain`, `combinations`, `zipLongest`, `takeWhile` |
| `pythonlib/functools`   | `partial`, `reduce`, `lruCache`, `pipe`            |
| `pythonlib/collections` | `Counter`, `defaultdict`, `deque`                  |
| `pythonlib/math`        | `sqrt`, `floor`, `ceil`, `factorial`, `pi`, `e`    |
| `pythonlib/random`      | `randInt`, `choice`, `shuffle`, `sample`           |
| `pythonlib/datetime`    | `datetime`, `date`, `time`, `timedelta`            |
| `pythonlib/json`        | `loads`, `dumps`, `load`, `dump`                   |
| `pythonlib/re`          | `search`, `match`, `findAll`, `sub`, `compile`     |
| `pythonlib/os`          | `path`, `getCwd`, `sep`                            |
| `pythonlib/string`      | `Template`, `capWords`, `asciiLowercase`           |

> All function names use **camelCase** to feel native in TypeScript.

## Module Examples

### Builtins

```typescript
import { range, enumerate, zip, len, sorted, reversed, sum, min, max } from "pythonlib"

// range() - Python's beloved iterator
for (const i of range(5)) {
} // 0, 1, 2, 3, 4
for (const i of range(1, 5)) {
} // 1, 2, 3, 4
for (const i of range(0, 10, 2)) {
} // 0, 2, 4, 6, 8

// enumerate() - index + value in one go
for (const [i, v] of enumerate(["a", "b", "c"])) {
} // [0,"a"], [1,"b"], [2,"c"]

// zip() - iterate multiple sequences together
for (const [a, b] of zip([1, 2], ["x", "y"])) {
} // [1,"x"], [2,"y"]

// Familiar built-ins
len([1, 2, 3]) // 3
sorted([3, 1, 2]) // [1, 2, 3]
reversed([1, 2, 3]) // [3, 2, 1]
sum([1, 2, 3]) // 6
min([1, 2, 3]) // 1
max([1, 2, 3]) // 3
```

### itertools

```typescript
import { chain, combinations, permutations, product, groupby } from "pythonlib/itertools"

// Combine iterables
chain([1, 2], [3, 4]) // [1, 2, 3, 4]

// Combinations without repetition
combinations([1, 2, 3], 2) // [[1,2], [1,3], [2,3]]

// All possible orderings
permutations([1, 2, 3], 2) // [[1,2], [1,3], [2,1], [2,3], [3,1], [3,2]]

// Cartesian product
product([1, 2], ["a", "b"]) // [[1,"a"], [1,"b"], [2,"a"], [2,"b"]]
```

### functools

```typescript
import { partial, reduce, lruCache, pipe } from "pythonlib/functools"

// Partial application
const add5 = partial((a, b) => a + b, 5)
add5(3) // 8

// Reduce with initial value
reduce((a, b) => a + b, [1, 2, 3, 4, 5]) // 15

// LRU Cache with automatic memoization
const cached = lruCache((n: number) => expensiveComputation(n))
cached(5) // computes
cached(5) // returns cached result instantly
cached.cacheInfo() // { hits: 1, misses: 1, maxsize: 128, currsize: 1 }

// Pipe value through functions (inspired by Remeda/Ramda)
pipe(
  5,
  (x) => x * 2,
  (x) => x + 1
) // 11
```

### collections

```typescript
import { Counter, defaultdict, deque } from "pythonlib/collections"

// Count occurrences
const counter = new Counter("abracadabra")
counter.get("a") // 5
counter.mostCommon(2) // [["a", 5], ["b", 2]]

// Dict with default factory
const dd = defaultdict(() => [])
dd.get("key").push(1) // auto-creates array if missing

// Double-ended queue
const d = new deque([1, 2, 3])
d.appendLeft(0) // [0, 1, 2, 3]
d.pop() // 3
```

### datetime

```typescript
import { datetime, date, timedelta } from "pythonlib/datetime"

const now = datetime.now()
now.strftime("%Y-%m-%d %H:%M:%S") // "2024-06-15 14:30:00"

const d = new date(2024, 6, 15)
d.isoFormat() // "2024-06-15"

const delta = new timedelta({ days: 7 })
delta.totalSeconds() // 604800
```

### re (Regular Expressions)

```typescript
import { search, findAll, sub, compile } from "pythonlib/re"

// Named groups support
const m = search("(?P<name>\\w+)@(?P<domain>\\w+)", "user@example")
m?.group("name") // "user"
m?.groupDict() // { name: "user", domain: "example" }

findAll("\\d+", "a1b2c3") // ["1", "2", "3"]
sub("\\d", "X", "a1b2") // "aXbX"
```

### math

```typescript
import { sqrt, factorial, gcd, lcm, pi, e } from "pythonlib/math"

sqrt(16) // 4
factorial(5) // 120
gcd(12, 8) // 4
lcm(4, 6) // 12
```

### random

```typescript
import { randInt, choice, shuffle, sample } from "pythonlib/random"

randInt(1, 10) // random integer 1-10
choice(["a", "b", "c"]) // random element
shuffle([1, 2, 3]) // shuffles in place
sample([1, 2, 3, 4, 5], 3) // 3 unique random elements
```

## Runtime Support

pythonlib is tested on every commit across multiple JavaScript runtimes:

<table>
  <tr>
    <td align="center" width="150">
      <img src="https://raw.githubusercontent.com/sebastian-software/python2ts/main/.github/assets/nodejs.svg" width="60" height="60" alt="Node.js"><br>
      <b>Node.js</b><br>
      <sub>v22, v24</sub>
    </td>
    <td align="center" width="150">
      <img src="https://raw.githubusercontent.com/sebastian-software/python2ts/main/.github/assets/bun.svg" width="60" height="60" alt="Bun"><br>
      <b>Bun</b><br>
      <sub>latest</sub>
    </td>
    <td align="center" width="150">
      <img src="https://raw.githubusercontent.com/sebastian-software/python2ts/main/.github/assets/deno.svg" width="60" height="60" alt="Deno"><br>
      <b>Deno</b><br>
      <sub>v2.x</sub>
    </td>
    <td align="center" width="150">
      <img src="https://raw.githubusercontent.com/sebastian-software/python2ts/main/.github/assets/playwright.svg" width="60" height="60" alt="Playwright"><br>
      <b>Browser</b><br>
      <sub>Playwright</sub>
    </td>
  </tr>
  <tr>
    <td align="center">✅ Full test suite</td>
    <td align="center">✅ Full test suite</td>
    <td align="center">✅ Full test suite</td>
    <td align="center">✅ Runtime tests</td>
  </tr>
</table>

Also works in **Cloudflare Workers**, **AWS Lambda**, and other JS environments.

## Related Projects

- [**python2ts**](https://www.npmjs.com/package/python2ts) — Transpile Python to TypeScript (uses
  pythonlib as runtime)
- [**Documentation**](https://sebastian-software.github.io/python2ts/) — Full API reference and
  guides

## Contributing

We welcome contributions! Please see our
[GitHub repository](https://github.com/sebastian-software/python2ts) for:

- [Issue tracker](https://github.com/sebastian-software/python2ts/issues)
- [Architecture Decision Records](https://github.com/sebastian-software/python2ts/tree/main/docs/adr)

## License

MIT © [Sebastian Software GmbH](https://sebastian-software.de)
