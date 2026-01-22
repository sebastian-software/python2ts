---
title: "ADR-0003: Preserve Python Operator Semantics"
description: Architecture Decision Record
---

# ADR-0003: Preserve Python Operator Semantics

## Status

Accepted

## Context

Several Python operators behave differently from their JavaScript counterparts:

### Floor Division (`//`)

```python
# Python
10 // 3   # = 3
-10 // 3  # = -4 (rounds toward negative infinity)
```

```javascript
// JavaScript
Math.floor(10 / 3) // = 3
Math.floor(-10 / 3) // = -4 (same, but coincidental)
Math.trunc(-10 / 3) // = -3 (what // would mean if rounding toward zero)
```

### Modulo (`%`)

```python
# Python - result has sign of divisor
-7 % 3   # = 2
7 % -3   # = -2
```

```javascript
// JavaScript - result has sign of dividend
;-7 % 3 // = -1
7 % -3 // = 1
```

We must decide: Should we prioritize **JavaScript idioms** or **Python correctness**?

## Decision

We will **preserve Python semantics** for all operators.

Rationale:

1. **Primary use case**: Converting Python code that relies on Python behavior
2. **Principle of least surprise**: Code should behave identically after conversion
3. **Debugging**: Differences would create subtle, hard-to-find bugs
4. **Mathematical correctness**: Python's modulo is mathematically consistent (Euclidean)

Implementation:

```typescript
// floorDiv - Python's //
function floorDiv(a: number, b: number): number {
  return Math.floor(a / b)
}

// mod - Python's %
function mod(a: number, b: number): number {
  return ((a % b) + b) % b
}

// pow - Python's **
function pow(base: number, exp: number): number {
  return Math.pow(base, exp)
}
```

## Consequences

### Positive

- Converted code behaves identically to Python
- No subtle bugs from operator differences
- Users can trust the transpiler for numerical code

### Negative

- Runtime function call overhead (negligible)
- Generated code is longer (`mod(a, b)` vs `a % b`)
- Users familiar with JS might be confused by `mod` behavior

### Operators Affected

| Python | JavaScript                   | Our Solution             |
| ------ | ---------------------------- | ------------------------ |
| `//`   | `Math.floor(a/b)`            | `floorDiv(a, b)`         |
| `%`    | `a % b`                      | `mod(a, b)`              |
| `**`   | `Math.pow(a, b)` or `a ** b` | `pow(a, b)`              |
| `in`   | N/A                          | `contains(container, x)` |

### Not Affected (Same Semantics)

- `+`, `-`, `*`, `/` (standard arithmetic)
- `<`, `>`, `<=`, `>=`, `==`, `!=` (comparisons)
- `and` → `&&`, `or` → `||`, `not` → `!` (logical)
