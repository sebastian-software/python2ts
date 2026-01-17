---
sidebar_position: 4
---

# Runtime Library (pythonlib)

The runtime library provides Python-compatible implementations of standard library modules.

## Installation

```bash
npm install pythonlib
```

## Core Module (`py`)

The main export bundles all functionality:

```typescript
import { py } from "pythonlib"

// Iteration
for (const i of py.range(10)) {
}
for (const [i, v] of py.enumerate(items)) {
}
for (const [a, b] of py.zip(list1, list2)) {
}

// Built-ins
py.len([1, 2, 3]) // 3
py.sum([1, 2, 3]) // 6
py.min([1, 2, 3]) // 1
py.max([1, 2, 3]) // 3
py.sorted([3, 1, 2]) // [1, 2, 3]
py.reversed([1, 2, 3]) // [3, 2, 1]
```

## itertools

Iterator building blocks:

```typescript
import { py } from "pythonlib"
// or: import * as itertools from "pythonlib/itertools"

// Combinations & Permutations
py.itertools.combinations([1, 2, 3], 2)
// → [[1,2], [1,3], [2,3]]

py.itertools.permutations([1, 2, 3], 2)
// → [[1,2], [1,3], [2,1], [2,3], [3,1], [3,2]]

// Cartesian product
py.itertools.product([1, 2], ["a", "b"])
// → [[1,"a"], [1,"b"], [2,"a"], [2,"b"]]

// Chaining
py.itertools.chain([1, 2], [3, 4])
// → [1, 2, 3, 4]

// Grouping
py.itertools.groupby([1, 1, 2, 2, 3])
// → [[1, [1,1]], [2, [2,2]], [3, [3]]]

// Zip with fill
py.itertools.zip_longest([1, 2, 3], ["a", "b"], { fillvalue: "-" })
// → [[1,"a"], [2,"b"], [3,"-"]]

// Accumulate
py.itertools.accumulate([1, 2, 3, 4, 5])
// → [1, 3, 6, 10, 15]
```

## functools

Higher-order functions:

```typescript
import { py } from "pythonlib"

// Partial application
const add = (a: number, b: number) => a + b
const add5 = py.functools.partial(add, 5)
add5(3) // → 8

// Reduce
py.functools.reduce((a, b) => a + b, [1, 2, 3, 4, 5])
// → 15

// LRU Cache
const expensive = py.functools.lru_cache((n: number) => {
  console.log(`Computing ${n}`)
  return n * 2
})
expensive(5) // logs "Computing 5", returns 10
expensive(5) // returns 10 (cached, no log)

// Cache info
expensive.cache_info()
// → { hits: 1, misses: 1, maxsize: 128, currsize: 1 }

// Attribute/Item getters
const getName = py.functools.attrgetter("name")
getName({ name: "John" }) // → "John"

const getSecond = py.functools.itemgetter(1)
getSecond([10, 20, 30]) // → 20
```

## collections

Specialized container types:

```typescript
import { py } from "pythonlib"

// Counter
const counter = new py.Counter("mississippi")
counter.get("i") // → 4
counter.get("s") // → 4
counter.mostCommon(2) // → [["i", 4], ["s", 4]]

// defaultdict
const dd = py.defaultdict(() => [])
dd.get("key").push(1)
dd.get("key").push(2)
dd.get("key") // → [1, 2]

// deque (double-ended queue)
const d = new py.deque([1, 2, 3])
d.appendleft(0) // [0, 1, 2, 3]
d.append(4) // [0, 1, 2, 3, 4]
d.popleft() // → 0
d.pop() // → 4
```

## datetime

Date and time handling:

```typescript
import { py } from "pythonlib"

const now = py.datetime.datetime.now()
now.strftime("%Y-%m-%d %H:%M:%S") // → "2024-01-15 14:30:45"

const date = py.datetime.date(2024, 1, 15)
const time = py.datetime.time(14, 30, 45)

// Timedelta
const delta = py.datetime.timedelta({ days: 7, hours: 3 })
delta.totalSeconds() // → 615600
```

## re (Regular Expressions)

Python-style regex with named groups:

```typescript
import { py } from "pythonlib"

// Search
const m = py.re.search("(?P<name>\\w+)@(?P<domain>\\w+)", "user@example")
m?.group("name") // → "user"
m?.group("domain") // → "example"

// Find all
py.re.findall("\\d+", "a1b2c3") // → ["1", "2", "3"]

// Split
py.re.split("[,;]", "a,b;c") // → ["a", "b", "c"]

// Substitute
py.re.sub("\\d", "X", "a1b2c3") // → "aXbXcX"
```

## math

Mathematical functions:

```typescript
import { py } from "pythonlib"

py.math.sqrt(16) // → 4
py.math.factorial(5) // → 120
py.math.gcd(12, 8) // → 4
py.math.lcm(4, 6) // → 12
py.math.sin(Math.PI / 2) // → 1
py.math.log(Math.E) // → 1
```

## random

Random number generation:

```typescript
import { py } from "pythonlib"

py.random.randint(1, 10) // Random integer 1-10
py.random.choice(["a", "b"]) // Random element
py.random.shuffle([1, 2, 3]) // Shuffle in place
py.random.sample([1, 2, 3], 2) // Random sample
py.random.uniform(0, 1) // Random float 0-1
```

## json

JSON handling (Python-style API):

```typescript
import { py } from "pythonlib"

py.json.dumps({ a: 1 }) // → '{"a":1}'
py.json.loads('{"a":1}') // → { a: 1 }
```

## string

String constants and utilities:

```typescript
import { py } from "pythonlib"

py.ascii_lowercase // "abcdefghijklmnopqrstuvwxyz"
py.ascii_uppercase // "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
py.digits // "0123456789"
py.punctuation // "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"

py.capwords("hello world") // "Hello World"

// Template strings
const t = new py.Template("Hello, $name!")
t.substitute({ name: "World" }) // "Hello, World!"
```
