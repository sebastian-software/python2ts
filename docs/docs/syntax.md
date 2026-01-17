---
sidebar_position: 3
---

# Syntax Reference

python2ts supports comprehensive Python syntax conversion to TypeScript.

## Literals & Operators

| Python                    | TypeScript                | Notes                                   |
| ------------------------- | ------------------------- | --------------------------------------- |
| `True` / `False` / `None` | `true` / `false` / `null` |                                         |
| `x // y`                  | `py.floordiv(x, y)`       | Python semantics (rounds toward -∞)     |
| `x ** y`                  | `py.pow(x, y)`            |                                         |
| `x % y`                   | `py.mod(x, y)`            | Python semantics (follows divisor sign) |
| `x in items`              | `py.in(x, items)`         |                                         |
| `arr[1:3]` / `arr[::-1]`  | `py.slice(...)`           | Full slice support                      |

## Control Flow

| Python                 | TypeScript                    |
| ---------------------- | ----------------------------- |
| `if/elif/else`         | `if/else if/else`             |
| `for x in items:`      | `for (const x of items)`      |
| `for x, y in items:`   | `for (const [x, y] of items)` |
| `match x:` / `case _:` | `switch` / `default:`         |

## Functions

| Python                 | TypeScript                 |
| ---------------------- | -------------------------- |
| `def fn(*args):`       | `function fn(...args)`     |
| `def fn(**kwargs):`    | `function fn(kwargs)`      |
| `lambda x: x + 1`      | `(x) => (x + 1)`           |
| `async def` / `await`  | `async function` / `await` |
| `yield` / `yield from` | `yield` / `yield*`         |

## Classes

| Python                           | TypeScript                   |
| -------------------------------- | ---------------------------- |
| `class Child(Parent):`           | `class Child extends Parent` |
| `def __init__(self):`            | `constructor()`              |
| `self.x`                         | `this.x`                     |
| `super().__init__()`             | `super()`                    |
| `@dataclass`                     | Auto-generated constructor   |
| `@staticmethod` / `@classmethod` | `static`                     |
| `@property` / `@x.setter`        | `get` / `set`                |

## Type Hints

| Python                 | TypeScript                 |
| ---------------------- | -------------------------- |
| `x: List[int]`         | `x: number[]`              |
| `x: Dict[str, T]`      | `x: Record<string, T>`     |
| `x: Optional[str]`     | `x: string \| null`        |
| `Callable[[int], str]` | `(arg0: number) => string` |
| `Generic[T]`           | `<T>`                      |
| `Protocol`             | `interface`                |
| `TypedDict`            | `interface`                |
| `Final[T]`             | `const` / `readonly`       |
| `ClassVar[T]`          | `static`                   |
| `Literal["a", "b"]`    | `"a" \| "b"`               |

## Comprehensions

```python
# List comprehension
[x * 2 for x in items]
# → items.map(x => x * 2)

# With filter
[x for x in items if x > 0]
# → items.filter(x => x > 0)

# Dict comprehension
{k: v for k, v in pairs}
# → Object.fromEntries(pairs.map(([k, v]) => [k, v]))

# Set comprehension
{x * 2 for x in items}
# → new Set(items.map(x => x * 2))
```

## Imports

| Python                | TypeScript                  |
| --------------------- | --------------------------- |
| `import os`           | `import * as os from "os"`  |
| `from os import path` | `import { path } from "os"` |
| `from . import utils` | `import * from "./utils"`   |

Runtime module imports (`itertools`, `functools`, `collections`, etc.) are automatically handled by
the runtime.

## Exception Handling

```python
try:
    risky_operation()
except ValueError as e:
    handle_error(e)
finally:
    cleanup()
```

Becomes:

```typescript
try {
  risky_operation()
} catch (e) {
  if (e instanceof Error) {
    handle_error(e)
  }
} finally {
  cleanup()
}
```

## Docstrings

Python docstrings (Google, NumPy, or simple styles) are converted to JSDoc:

```python
def calculate(x: int, y: int) -> int:
    """Calculate the sum of two numbers.

    Args:
        x: First number
        y: Second number

    Returns:
        The sum of x and y
    """
    return x + y
```

Becomes:

```typescript
/**
 * Calculate the sum of two numbers.
 *
 * @param x - First number
 * @param y - Second number
 * @returns The sum of x and y
 */
function calculate(x: number, y: number): number {
  return x + y
}
```
