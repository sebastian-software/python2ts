---
title: "ADR-0006: Python Type Hints to TypeScript Types"
description: Architecture Decision Record
---

# ADR-0006: Python Type Hints to TypeScript Types

## Status

Accepted

## Context

Python 3.5+ supports type hints (PEP 484) that provide static type information. Since we're
generating TypeScript (a statically typed language), we have a unique opportunity to preserve this
type information rather than discarding it.

Key questions:

1. Should we emit TypeScript types at all, or just `any`?
2. How do we map Python's type system to TypeScript's?
3. How do we handle Python-specific types (`Optional`, `Union`, `List`, `Dict`)?
4. What about complex generics and nested types?

Options considered:

1. **Ignore type hints**: Emit all types as `any`
   - Pro: Simple implementation
   - Con: Loses valuable type information, poor TypeScript experience

2. **Basic mapping only**: Map primitives, use `any` for complex types
   - Pro: Easy to implement
   - Con: Incomplete, frustrating for users with typed Python code

3. **Full type mapping**: Comprehensive mapping of Python types to TypeScript
   - Pro: Preserves developer intent, enables TypeScript tooling
   - Con: More complex implementation

## Decision

We will implement **full type mapping** from Python type hints to TypeScript types.

### Type Mapping Table

| Python Type                 | TypeScript Type           |
| --------------------------- | ------------------------- |
| `str`                       | `string`                  |
| `int`                       | `number`                  |
| `float`                     | `number`                  |
| `bool`                      | `boolean`                 |
| `None`                      | `null`                    |
| `bytes`                     | `Uint8Array`              |
| `Any`                       | `any`                     |
| `object`                    | `object`                  |
| `List[T]` / `list[T]`       | `T[]`                     |
| `Dict[K, V]` / `dict[K, V]` | `Record<K, V>`            |
| `Set[T]` / `set[T]`         | `Set<T>`                  |
| `Tuple[A, B, C]`            | `[A, B, C]`               |
| `Optional[T]`               | `T \| null`               |
| `Union[A, B]`               | `A \| B`                  |
| `Callable[[A, B], R]`       | `(arg0: A, arg1: B) => R` |
| `Iterable[T]`               | `Iterable<T>`             |
| `Iterator[T]`               | `Iterator<T>`             |
| `Generator[Y, S, R]`        | `Generator<Y, R, S>`      |

### Implementation Strategy

1. **Function signatures**: Type hints on parameters and return types are preserved

   ```python
   def greet(name: str, count: int = 1) -> str:
       return name * count
   ```

   ```typescript
   function greet(name: string, count: number = 1): string {
     return name.repeat(count)
   }
   ```

2. **Variable annotations**: Standalone type annotations become TypeScript declarations

   ```python
   x: int = 5
   names: List[str] = []
   ```

   ```typescript
   let x: number = 5
   let names: string[] = []
   ```

3. **Class attributes**: Type annotations in class bodies become typed properties

   ```python
   class User:
       name: str
       age: int
   ```

   ```typescript
   class User {
     name: string
     age: number
   }
   ```

4. **Generic type parameters**: Preserved where TypeScript supports them

   ```python
   def first(items: List[T]) -> T: ...
   ```

   ```typescript
   function first<T>(items: T[]): T { ... }
   ```

### Fallback Behavior

- Unknown types default to `unknown` (safer than `any`)
- Custom classes are emitted as-is (assuming they'll be defined)
- Complex nested generics are simplified if too deep

## Consequences

### Positive

- **Type safety**: Generated code benefits from TypeScript's type checking
- **IDE support**: Autocomplete, refactoring, and error detection work properly
- **Documentation**: Types serve as inline documentation
- **Refactoring confidence**: Type errors catch bugs during transpilation review

### Negative

- **Not all types map perfectly**: Python's structural typing differs from TypeScript's
- **Runtime behavior unchanged**: Types are compile-time only, runtime uses `py.*` functions
- **Generic complexity**: Some Python generic patterns don't translate directly

### Example

```python
from typing import List, Optional, Dict

def process_users(
    users: List[Dict[str, Any]],
    filter_fn: Optional[Callable[[Dict], bool]] = None
) -> List[str]:
    result: List[str] = []
    for user in users:
        if filter_fn is None or filter_fn(user):
            result.append(user["name"])
    return result
```

```typescript
import { py } from "python2ts/runtime"

function process_users(
  users: Record<string, any>[],
  filter_fn: ((arg0: Record<string, unknown>) => boolean) | null = null
): string[] {
  let result: string[] = []
  for (const user of users) {
    if (filter_fn === null || filter_fn(user)) {
      result.push(user["name"])
    }
  }
  return result
}
```
