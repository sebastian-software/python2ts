# ADR-0002: Runtime Namespace Design (py.*)

## Status

Accepted

## Context

Python has many operations and built-in functions that don't have direct JavaScript equivalents:

- Floor division `//` (Python rounds toward negative infinity)
- Modulo `%` (Python result has sign of divisor)
- Slicing with negative indices and step
- `range()`, `enumerate()`, `zip()` as iterables
- Type conversion functions (`int()`, `str()`, etc.)
- String methods with Python-specific behavior

We need to decide how to handle these in the generated TypeScript code.

Options considered:

1. **Inline code generation**: Generate equivalent JS code inline
   - Pro: No runtime dependency
   - Con: Verbose output, complex for features like slicing

2. **Individual function imports**: `import { floordiv, slice } from 'python2ts'`
   - Pro: Tree-shakeable
   - Con: Many imports, cluttered generated code

3. **Single namespace object**: `import { py } from 'python2ts/runtime'`
   - Pro: Clean, discoverable API, single import
   - Con: Slightly larger bundle if not all functions used

## Decision

We will use a **single namespace object** called `py` that contains all Python-compatible helper functions.

```typescript
import { py } from 'python2ts/runtime';

py.floordiv(10, 3);  // 3
py.slice(arr, 1, 4); // Slicing
py.range(10);        // Iterable
```

Design principles:

1. **Namespace prefix**: All Python-specific operations use `py.*`
2. **Semantic naming**: Function names match Python's (`floordiv`, not `floorDivide`)
3. **Grouped by category**: Arithmetic, collections, iterables, etc.
4. **Nested namespaces**: `py.string.*` for string-specific methods

## Consequences

### Positive

- **Discoverability**: IDE autocomplete shows all available functions
- **Clean imports**: Single import statement regardless of features used
- **Readable output**: `py.floordiv(a, b)` is self-documenting
- **Runtime tracking**: Generator knows which runtime functions are used

### Negative

- Bundle includes unused functions (mitigated by bundler tree-shaking)
- Extra indirection for function calls (negligible performance impact)

### Generated Code Example

```python
# Python
x = 10 // 3
items = [1, 2, 3]
for i, v in enumerate(items):
    print(i, v)
```

```typescript
// Generated TypeScript
import { py } from 'python2ts/runtime';

let x = py.floordiv(10, 3);
let items = [1, 2, 3];
for (const [i, v] of py.enumerate(items)) {
  console.log(i, v);
}
```
