---
title: "ADR-0008: itertools - Eager Arrays vs. Lazy Generators"
description: Architecture Decision Record
---

# ADR-0008: itertools - Eager Arrays vs. Lazy Generators

## Status

Accepted

## Context

Python's `itertools` module provides iterator building blocks that are inherently lazy (generators).
When implementing these in TypeScript, we need to decide between:

1. **Generators** (`function*`): Lazy evaluation, memory efficient for large sequences
2. **Async Generators** (`async function*`): Similar to generators but with async/await syntax
3. **Eager Arrays**: Immediate evaluation, returns complete array

### Considerations

**Generator functions** in TypeScript:

- Less familiar to many developers
- Harder to debug (state is hidden in generator object)
- Perceived as "exotic" or uncommon
- Performance is good but not always intuitive

**Async/Await** was considered but rejected because:

- `itertools` operations are synchronous (no I/O)
- Async adds Promise overhead per iteration (~10x slower)
- Semantically incorrect - async implies "might wait" but nothing waits here
- "Infectious" - all consuming code must become async

**Eager Arrays**:

- Familiar to all JavaScript/TypeScript developers
- Easy to debug (inspect array in DevTools)
- Often faster for small to medium datasets
- Cannot handle infinite sequences

### The Infinity Problem

Some `itertools` functions can produce **infinite sequences**:

- `cycle([1, 2, 3])` → 1, 2, 3, 1, 2, 3, ... (forever)
- `repeat('x')` → 'x', 'x', 'x', ... (forever)

These MUST remain lazy (generators) - eager evaluation would cause infinite loops.

## Decision

Use **eager arrays by default**, with **generators only for infinite sequences**.

| Function       | Implementation | Rationale                     |
| -------------- | -------------- | ----------------------------- |
| `chain`        | Array          | Concatenation, usually small  |
| `combinations` | Array          | Finite, often iterated fully  |
| `permutations` | Array          | Finite, often iterated fully  |
| `product`      | Array          | Finite cartesian product      |
| `cycle`        | **Generator**  | Infinite!                     |
| `repeat(x)`    | **Generator**  | Infinite when no count given  |
| `repeat(x, n)` | Array          | Finite when count specified   |
| `islice`       | Array          | Materializes slice anyway     |
| `takewhile`    | Array          | Result usually small          |
| `dropwhile`    | Array          | Result usually consumed fully |

## Consequences

### Positive

- More familiar API for TypeScript developers
- Easier debugging - arrays visible in DevTools
- Better IDE support (array methods available)
- Often better performance for typical use cases

### Negative

- Higher memory usage for large sequences
- Breaking change if users relied on lazy evaluation
- Must document that `cycle()` and `repeat()` without count are infinite generators

### Migration Path

If performance issues arise with large datasets, we could:

1. Add lazy variants: `lazyChain()`, `lazyCombinations()`, etc.
2. Or add an options parameter: `combinations(items, r, { lazy: true })`

### Usage Example

```typescript
import { py } from "python2ts/runtime"

// Eager (returns array immediately)
const combos = py.itertools.combinations([1, 2, 3], 2)
// combos is [1,2], [1,3], [2,3] - a real array

// Lazy (infinite - must use generator)
const infinite = py.itertools.cycle([1, 2, 3])
// Must consume with for...of or .next()
```
