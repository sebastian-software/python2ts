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

## Quick Start

```bash
npm install pythonlib
```

```typescript
import { range, enumerate, sorted } from "pythonlib"
import { combinations } from "pythonlib/itertools"
import { Counter } from "pythonlib/collections"
import { lruCache } from "pythonlib/functools"

// Python-style iteration
for (const i of range(10)) {
  console.log(i)
}

// Combinatorics
for (const combo of combinations([1, 2, 3], 2)) {
  console.log(combo) // [1,2], [1,3], [2,3]
}

// Count occurrences
const counter = new Counter("mississippi")
counter.mostCommon(2) // [["i", 4], ["s", 4]]

// Memoization
const fib = lruCache((n: number): number => (n <= 1 ? n : fib(n - 1) + fib(n - 2)))
```

## Available Modules

| Import Path             | Contents                                           |
| ----------------------- | -------------------------------------------------- |
| `pythonlib`             | Builtins: `len`, `range`, `sorted`, `enumerate`... |
| `pythonlib/itertools`   | `chain`, `combinations`, `zipLongest`, `takeWhile` |
| `pythonlib/functools`   | `partial`, `reduce`, `lruCache`, `pipe`            |
| `pythonlib/collections` | `Counter`, `defaultdict`, `deque`                  |
| `pythonlib/math`        | `sqrt`, `floor`, `ceil`, `factorial`, `pi`, `e`    |
| `pythonlib/random`      | `randInt`, `choice`, `shuffle`, `sample`           |
| `pythonlib/datetime`    | `datetime`, `date`, `time`, `timedelta`            |
| `pythonlib/json`        | `loads`, `dumps`                                   |
| `pythonlib/re`          | `search`, `match`, `findAll`, `sub`, `compile`     |
| `pythonlib/string`      | `Template`, `capWords`, `asciiLowercase`           |

> All function names use **camelCase** to feel native in TypeScript.

## Documentation

For comprehensive documentation and API reference:

**[📚 View Full Documentation](https://sebastian-software.github.io/python2ts/)**

- [Runtime Library Guide](https://sebastian-software.github.io/python2ts/docs/runtime)
- [API Reference](https://sebastian-software.github.io/python2ts/docs/api)

## Runtime Support

Tested on every commit: **Node.js** (v22, v24) · **Bun** · **Deno** · **Browsers**

Also works in Cloudflare Workers, AWS Lambda, and other JS environments.

## Related

- [**python2ts**](https://www.npmjs.com/package/python2ts) — Transpile Python to TypeScript
- [**GitHub**](https://github.com/sebastian-software/python2ts) — Source code and issue tracker

## License

MIT © [Sebastian Software GmbH](https://sebastian-software.de)
