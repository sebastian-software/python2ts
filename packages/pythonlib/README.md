# pythonlib

<div align="center">

**Python's Beloved Standard Library — Now in TypeScript**

[![npm version](https://img.shields.io/npm/v/pythonlib.svg)](https://www.npmjs.com/package/pythonlib)
[![npm downloads](https://img.shields.io/npm/dm/pythonlib.svg)](https://www.npmjs.com/package/pythonlib)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.com/package/pythonlib?activeTab=dependencies)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A522-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/Bun-compatible-f9f1e1?logo=bun&logoColor=black)](https://bun.sh/)
[![License](https://img.shields.io/npm/l/pythonlib.svg)](https://github.com/sebastian-software/python2ts/blob/main/LICENSE)

</div>

---

Miss `itertools.combinations`? Love `collections.Counter`? Wish you had `functools.lru_cache` in
JavaScript?

**pythonlib** brings Python's most powerful utilities to TypeScript — zero dependencies, full type
safety, tree-shakeable.

## Install

```bash
npm install pythonlib
```

## Why pythonlib?

| What You Get                | Why It Matters                                    |
| --------------------------- | ------------------------------------------------- |
| **Zero dependencies**       | No supply chain bloat, minimal attack surface     |
| **Full TypeScript support** | Generics, type inference, autocomplete everywhere |
| **Tree-shakeable**          | Bundle only what you use                          |
| **camelCase API**           | Feels native in TypeScript                        |
| **Works everywhere**        | Browsers, Node.js, Deno, Bun, Workers             |

## Quick Examples

### itertools — Combinatorics Made Easy

```typescript
import { combinations, permutations, product } from "pythonlib/itertools"

// All 2-element combinations
[...combinations([1, 2, 3], 2)]
// → [[1, 2], [1, 3], [2, 3]]

// Cartesian product
[...product(["a", "b"], [1, 2])]
// → [["a", 1], ["a", 2], ["b", 1], ["b", 2]]
```

### collections — Data Structures That Just Work

```typescript
import { Counter, defaultdict, deque } from "pythonlib/collections"

// Count anything
const votes = new Counter(["alice", "bob", "alice", "alice"])
votes.mostCommon(1) // → [["alice", 3]]

// No more "undefined" checks
const graph = defaultdict(() => [])
graph.get("node1").push("node2") // Just works!

// Double-ended queue with O(1) operations
const dq = new deque([1, 2, 3])
dq.appendLeft(0) // [0, 1, 2, 3]
dq.pop() // [0, 1, 2]
```

### functools — Functional Programming Utilities

```typescript
import { lruCache, partial, reduce } from "pythonlib/functools"

// Memoization with one line
const fib = lruCache((n: number): number => (n <= 1 ? n : fib(n - 1) + fib(n - 2)))
fib(100) // Instant, even for large values

// Partial application
const greet = (greeting: string, name: string) => `${greeting}, ${name}!`
const sayHello = partial(greet, "Hello")
sayHello("World") // → "Hello, World!"
```

### Builtins — Python's Greatest Hits

```typescript
import { range, enumerate, zip, sorted, reversed } from "pythonlib"

// Python-style range
for (const i of range(5)) {
} // 0, 1, 2, 3, 4
for (const i of range(1, 10, 2)) {
} // 1, 3, 5, 7, 9

// Enumerate with index
for (const [i, item] of enumerate(["a", "b", "c"])) {
  console.log(i, item) // 0 "a", 1 "b", 2 "c"
}

// Zip multiple iterables
;[...zip([1, 2, 3], ["a", "b", "c"])]
// → [[1, "a"], [2, "b"], [3, "c"]]
```

## Available Modules

| Module                  | Highlights                                                  | Docs                                                                     |
| ----------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| `pythonlib`             | `range`, `enumerate`, `zip`, `sorted`, `len`, `min`, `max`  | [→](https://sebastian-software.github.io/python2ts/docs/api/index)       |
| `pythonlib/itertools`   | `chain`, `combinations`, `permutations`, `product`, `cycle` | [→](https://sebastian-software.github.io/python2ts/docs/api/itertools)   |
| `pythonlib/functools`   | `lruCache`, `partial`, `reduce`, `pipe`, `compose`          | [→](https://sebastian-software.github.io/python2ts/docs/api/functools)   |
| `pythonlib/collections` | `Counter`, `defaultdict`, `deque`, `OrderedDict`            | [→](https://sebastian-software.github.io/python2ts/docs/api/collections) |
| `pythonlib/math`        | `sqrt`, `floor`, `ceil`, `factorial`, `gcd`, `pi`           | [→](https://sebastian-software.github.io/python2ts/docs/api/math)        |
| `pythonlib/random`      | `randInt`, `choice`, `shuffle`, `sample`, `random`          | [→](https://sebastian-software.github.io/python2ts/docs/api/random)      |
| `pythonlib/datetime`    | `datetime`, `date`, `time`, `timedelta`                     | [→](https://sebastian-software.github.io/python2ts/docs/api/datetime)    |
| `pythonlib/re`          | `search`, `match`, `findAll`, `sub`, `compile`              | [→](https://sebastian-software.github.io/python2ts/docs/api/re)          |
| `pythonlib/json`        | `loads`, `dumps` with Python semantics                      | [→](https://sebastian-software.github.io/python2ts/docs/api/json)        |
| `pythonlib/string`      | `Template`, `capWords`, `ascii_lowercase`                   | [→](https://sebastian-software.github.io/python2ts/docs/api/string)      |
| `pythonlib/os`          | `path.join`, `environ`, `getcwd`                            | [→](https://sebastian-software.github.io/python2ts/docs/api/os)          |
| `pythonlib/pathlib`     | `Path` class for filesystem operations                      | [→](https://sebastian-software.github.io/python2ts/docs/api/pathlib)     |
| `pythonlib/glob`        | File pattern matching                                       | [→](https://sebastian-software.github.io/python2ts/docs/api/glob)        |
| `pythonlib/hashlib`     | `md5`, `sha256`, `sha512` hashing                           | [→](https://sebastian-software.github.io/python2ts/docs/api/hashlib)     |
| `pythonlib/base64`      | Base64 encoding/decoding                                    | [→](https://sebastian-software.github.io/python2ts/docs/api/base64)      |
| `pythonlib/uuid`        | UUID generation                                             | [→](https://sebastian-software.github.io/python2ts/docs/api/uuid)        |

## Runtime Support

Works everywhere JavaScript runs:

- **Node.js** (v22, v24)
- **Bun**
- **Deno**
- **Browsers** (Chrome, Firefox, Safari)
- **Edge** (Cloudflare Workers, Vercel, AWS Lambda)

## Documentation

| Resource                                                                     | Description                                |
| ---------------------------------------------------------------------------- | ------------------------------------------ |
| [Homepage](https://sebastian-software.github.io/python2ts/)                  | Project overview and quick start           |
| [Runtime Guide](https://sebastian-software.github.io/python2ts/docs/runtime) | Detailed usage guide                       |
| [API Reference](https://sebastian-software.github.io/python2ts/docs/api)     | Complete API documentation for all modules |

## Related

- [**python2ts**](https://www.npmjs.com/package/python2ts) — Transpile Python to TypeScript
  automatically
- [**GitHub**](https://github.com/sebastian-software/python2ts) — Source code, issues, contributions
  welcome

## License

MIT © [Sebastian Software GmbH](https://sebastian-software.de)
