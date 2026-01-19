# ADR-0011: camelCase API Convention

## Status

Accepted

## Context

Python uses `snake_case` for function names (e.g., `lru_cache`, `zip_longest`, `ascii_lowercase`),
while JavaScript/TypeScript conventions use `camelCase` (e.g., `lruCache`, `zipLongest`,
`asciiLowercase`).

When building a Python standard library for TypeScript developers, we face a design choice:

1. **Keep Python naming** — familiar for Python developers, but feels foreign in TypeScript
2. **Use TypeScript naming** — idiomatic for TypeScript, but requires learning new names

## Decision

We adopt **camelCase naming** throughout pythonlib, providing a truly TypeScript-native experience:

### Naming Transformations

| Python (snake_case) | TypeScript (camelCase) |
| ------------------- | ---------------------- |
| `lru_cache`         | `lruCache`             |
| `zip_longest`       | `zipLongest`           |
| `cache_info`        | `cacheInfo`            |
| `total_seconds`     | `totalSeconds`         |
| `ascii_lowercase`   | `asciiLowercase`       |
| `startswith`        | `startsWith`           |
| `groupdict`         | `groupDict`            |

### Implementation

1. **Central Name Mapping**: A `name-mappings.ts` file provides the canonical Python→JS name
   mapping:

   ```typescript
   export const PYTHON_TO_JS_NAMES: Record<string, string> = {
     lru_cache: "lruCache",
     zip_longest: "zipLongest"
     // ...
   }

   export function toJsName(pythonName: string): string {
     return PYTHON_TO_JS_NAMES[pythonName] ?? pythonName
   }
   ```

2. **Transformer Integration**: The transpiler automatically converts Python snake_case calls to
   JavaScript camelCase:

   ```python
   # Python input
   from functools import lru_cache
   @lru_cache
   def fib(n): return n
   ```

   ```typescript
   // TypeScript output
   import { lruCache } from "pythonlib/functools"
   const fib = lruCache((n) => n)
   ```

### Complete Mapping by Module

**functools:**

- `lru_cache` → `lruCache`, `cache_info` → `cacheInfo`, `cache_clear` → `cacheClear`
- `partial_method` → `partialMethod`, `single_dispatch` → `singleDispatch`
- `attr_getter` → `attrGetter`, `item_getter` → `itemGetter`, `method_caller` → `methodCaller`
- `cmp_to_key` → `cmpToKey`, `total_ordering` → `totalOrdering`

**itertools:**

- `zip_longest` → `zipLongest`, `takewhile` → `takeWhile`, `dropwhile` → `dropWhile`
- `filterfalse` → `filterFalse`, `combinations_with_replacement` → `combinationsWithReplacement`

**collections:**

- `appendleft` → `appendLeft`, `popleft` → `popLeft`, `extendleft` → `extendLeft`

**datetime:**

- `total_seconds` → `totalSeconds`, `isoformat` → `isoFormat`
- `fromisoformat` → `fromIsoFormat`, `fromtimestamp` → `fromTimestamp`
- `isoweekday` → `isoWeekday`, `isocalendar` → `isoCalendar`

**random:**

- `randint` → `randInt`, `randrange` → `randRange`
- `betavariate` → `betaVariate`, `expovariate` → `expoVariate` (and other \*variate functions)

**string:**

- `ascii_lowercase` → `asciiLowercase`, `ascii_uppercase` → `asciiUppercase`
- `startswith` → `startsWith`, `endswith` → `endsWith`
- `safe_substitute` → `safeSubstitute`, `get_identifiers` → `getIdentifiers`

**os:**

- `getcwd` → `getCwd`, `splitext` → `splitExt`, `normpath` → `normPath`
- `isabs` → `isAbs`, `relpath` → `relPath`, `commonpath` → `commonPath`

**re:**

- `fullmatch` → `fullMatch`, `findall` → `findAll`, `finditer` → `findIter`
- `groupdict` → `groupDict`

**json:**

- `sort_keys` → `sortKeys`, `ensure_ascii` → `ensureAscii`

**dict/set:**

- `setdefault` → `setDefault`, `popitem` → `popItem`, `fromkeys` → `fromKeys`
- `issubset` → `isSubset`, `issuperset` → `isSuperset`, `isdisjoint` → `isDisjoint`

**core:**

- `floordiv` → `floorDiv`, `divmod` → `divMod`

## Consequences

### Positive

- **Idiomatic TypeScript**: Code feels native to TypeScript developers
- **IDE Support**: Better autocomplete with standard JS naming conventions
- **Consistency**: All pythonlib APIs follow the same camelCase pattern
- **Marketing**: "Python's powerful APIs, TypeScript's familiar style"

### Negative

- **Learning Curve for Python Developers**: Must learn new names initially
- **Breaking Change**: Existing code using snake_case must be updated

### Example

**Python:**

```python
from functools import lru_cache
from itertools import zip_longest

@lru_cache(maxsize=128)
def process(items):
    return list(zip_longest(items, fillvalue=0))
```

**TypeScript:**

```typescript
import { lruCache } from "pythonlib/functools"
import { zipLongest } from "pythonlib/itertools"

const process = lruCache(
  (items) => {
    return zipLongest(items, { fillvalue: 0 })
  },
  { maxsize: 128 }
)
```

## Related Decisions

- [ADR-0009: Subpath Exports Architecture](./0009-subpath-exports-architecture.md)
