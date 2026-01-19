---
sidebar_position: 4
---

# Runtime Library (pythonlib)

The runtime library provides Python-compatible implementations of standard library modules.

**Naming Convention:** All function names use **camelCase** to feel native in TypeScript. For
example, Python's `zip_longest` becomes `zipLongest`, and `lru_cache` becomes `lruCache`. See
[ADR-0011](https://github.com/sebastian-software/python2ts/blob/main/docs/adr/0011-camelcase-api-convention.md)
for the complete naming rationale.

## Installation

```bash
npm install pythonlib
```

## Import Architecture

pythonlib uses **subpath exports** for clean, tree-shakeable imports:

```typescript
// Builtins from main export
import { range, enumerate, zip, len, sorted } from "pythonlib"

// Module functions from subpaths
import { chain, combinations } from "pythonlib/itertools"
import { Counter, defaultdict } from "pythonlib/collections"
import { partial, reduce } from "pythonlib/functools"
```

See
[ADR-0009](https://github.com/sebastian-software/python2ts/blob/main/docs/adr/0009-subpath-exports-architecture.md)
for the architectural rationale.

## Builtins (pythonlib)

The main export provides Python's built-in functions:

```typescript
import { range, enumerate, zip, len, sum, min, max, sorted, reversed } from "pythonlib"

// Iteration
for (const i of range(10)) {
}
for (const [i, v] of enumerate(items)) {
}
for (const [a, b] of zip(list1, list2)) {
}

// Built-ins
len([1, 2, 3]) // 3
sum([1, 2, 3]) // 6
min([1, 2, 3]) // 1
max([1, 2, 3]) // 3
sorted([3, 1, 2]) // [1, 2, 3]
reversed([1, 2, 3]) // [3, 2, 1]
```

## itertools (pythonlib/itertools)

Iterator building blocks:

```typescript
import {
  combinations,
  permutations,
  product,
  chain,
  groupby,
  zipLongest,
  accumulate
} from "pythonlib/itertools"

// Combinations & Permutations
combinations([1, 2, 3], 2)
// → [[1,2], [1,3], [2,3]]

permutations([1, 2, 3], 2)
// → [[1,2], [1,3], [2,1], [2,3], [3,1], [3,2]]

// Cartesian product
product([1, 2], ["a", "b"])
// → [[1,"a"], [1,"b"], [2,"a"], [2,"b"]]

// Chaining
chain([1, 2], [3, 4])
// → [1, 2, 3, 4]

// Grouping
groupby([1, 1, 2, 2, 3])
// → [[1, [1,1]], [2, [2,2]], [3, [3]]]

// Zip with fill
zipLongest([1, 2, 3], ["a", "b"], { fillvalue: "-" })
// → [[1,"a"], [2,"b"], [3,"-"]]

// Accumulate
accumulate([1, 2, 3, 4, 5])
// → [1, 3, 6, 10, 15]
```

## functools (pythonlib/functools)

Higher-order functions:

```typescript
import { partial, reduce, lruCache, attrGetter, itemGetter } from "pythonlib/functools"

// Partial application
const add = (a: number, b: number) => a + b
const add5 = partial(add, 5)
add5(3) // → 8

// Reduce
reduce((a, b) => a + b, [1, 2, 3, 4, 5])
// → 15

// LRU Cache
const expensive = lruCache((n: number) => {
  console.log(`Computing ${n}`)
  return n * 2
})
expensive(5) // logs "Computing 5", returns 10
expensive(5) // returns 10 (cached, no log)

// Cache info
expensive.cacheInfo()
// → { hits: 1, misses: 1, maxsize: 128, currsize: 1 }

// Attribute/Item getters
const getName = attrGetter("name")
getName({ name: "John" }) // → "John"

const getSecond = itemGetter(1)
getSecond([10, 20, 30]) // → 20
```

## collections (pythonlib/collections)

Specialized container types:

```typescript
import { Counter, defaultdict, deque } from "pythonlib/collections"

// Counter
const counter = new Counter("mississippi")
counter.get("i") // → 4
counter.get("s") // → 4
counter.mostCommon(2) // → [["i", 4], ["s", 4]]

// defaultdict
const dd = defaultdict(() => [])
dd.get("key").push(1)
dd.get("key").push(2)
dd.get("key") // → [1, 2]

// deque (double-ended queue)
const d = new deque([1, 2, 3])
d.appendLeft(0) // [0, 1, 2, 3]
d.append(4) // [0, 1, 2, 3, 4]
d.popLeft() // → 0
d.pop() // → 4
```

## datetime (pythonlib/datetime)

Date and time handling:

```typescript
import { datetime, date, time, timedelta } from "pythonlib/datetime"

const now = datetime.now()
now.strftime("%Y-%m-%d %H:%M:%S") // → "2024-01-15 14:30:45"

const d = new date(2024, 1, 15)
const t = new time(14, 30, 45)

// Timedelta
const delta = new timedelta({ days: 7, hours: 3 })
delta.totalSeconds() // → 615600
```

## re (pythonlib/re)

Python-style regex with named groups:

```typescript
import { search, findAll, split, sub } from "pythonlib/re"

// Search
const m = search("(?P<name>\\w+)@(?P<domain>\\w+)", "user@example")
m?.group("name") // → "user"
m?.group("domain") // → "example"

// Find all
findAll("\\d+", "a1b2c3") // → ["1", "2", "3"]

// Split
split("[,;]", "a,b;c") // → ["a", "b", "c"]

// Substitute
sub("\\d", "X", "a1b2c3") // → "aXbXcX"
```

## math (pythonlib/math)

Mathematical functions:

```typescript
import { sqrt, factorial, gcd, lcm, sin, log, pi, e } from "pythonlib/math"

sqrt(16) // → 4
factorial(5) // → 120
gcd(12, 8) // → 4
lcm(4, 6) // → 12
sin(pi / 2) // → 1
log(e) // → 1
```

## random (pythonlib/random)

Random number generation:

```typescript
import { randInt, choice, shuffle, sample, uniform } from "pythonlib/random"

randInt(1, 10) // Random integer 1-10
choice(["a", "b"]) // Random element
shuffle([1, 2, 3]) // Shuffle in place
sample([1, 2, 3], 2) // Random sample
uniform(0, 1) // Random float 0-1
```

## json (pythonlib/json)

JSON handling (Python-style API):

```typescript
import { dumps, loads } from "pythonlib/json"

dumps({ a: 1 }) // → '{"a":1}'
loads('{"a":1}') // → { a: 1 }
```

## string (pythonlib/string)

String constants and utilities:

```typescript
import {
  asciiLowercase,
  asciiUppercase,
  digits,
  punctuation,
  capWords,
  Template
} from "pythonlib/string"

asciiLowercase // "abcdefghijklmnopqrstuvwxyz"
asciiUppercase // "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
digits // "0123456789"
punctuation // "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"

capWords("hello world") // "Hello World"

// Template strings
const t = new Template("Hello, $name!")
t.substitute({ name: "World" }) // "Hello, World!"
```
