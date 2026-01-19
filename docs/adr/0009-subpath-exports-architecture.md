# ADR-0009: Subpath Exports Architecture

## Status

Accepted (supersedes [ADR-0002](./0002-runtime-namespace-design.md))

## Context

In [ADR-0002](./0002-runtime-namespace-design.md), we decided to use a single `py.*` namespace
object for all runtime functions. While this provided discoverability, it had drawbacks:

1. **Global namespace pollution**: Functions like `dump`, `loads`, `match` in a flat namespace are
   ambiguous - which module do they come from?
2. **Poor tree-shaking**: Even though individual modules are tree-shakeable, the generated code
   imported everything via the `py` namespace
3. **Non-idiomatic TypeScript**: Modern TypeScript prefers explicit, granular imports over namespace
   objects
4. **Bundle size concerns**: Users importing `py` get all modules, even if only using `itertools`

The Node.js ecosystem has evolved with
[subpath exports](https://nodejs.org/api/packages.html#subpath-exports), allowing packages to expose
multiple entry points cleanly.

## Decision

We adopt a **subpath exports architecture** where:

1. **Module functions are imported from subpaths**:

   ```typescript
   import { chain, combinations } from "pythonlib/itertools"
   import { loads, dumps } from "pythonlib/json"
   import { search, match } from "pythonlib/re"
   ```

2. **Builtins remain in the main export**:

   ```typescript
   import { len, range, sorted, enumerate, zip } from "pythonlib"
   ```

3. **Generated code uses direct function calls** (not namespace-prefixed):

   ```typescript
   // Before (ADR-0002)
   import { py } from "pythonlib"
   let result = py.itertools.chain([1, 2], [3, 4])

   // After (ADR-0009)
   import { chain } from "pythonlib/itertools"
   let result = chain([1, 2], [3, 4])
   ```

4. **Module namespace imports** provide an alternative style:
   ```typescript
   import { itertools, json, re } from "pythonlib"
   itertools.chain([1, 2], [3, 4])
   ```

### Import Categories

| Category         | Import Path             | Examples                                 |
| ---------------- | ----------------------- | ---------------------------------------- |
| Builtins         | `pythonlib`             | `len`, `range`, `sorted`, `enumerate`    |
| Core operations  | `pythonlib`             | `floorDiv`, `mod`, `pow`, `slice`        |
| Collection types | `pythonlib`             | `list`, `dict`, `set`, `tuple`           |
| itertools        | `pythonlib/itertools`   | `chain`, `combinations`, `zipLongest`    |
| functools        | `pythonlib/functools`   | `partial`, `reduce`, `lruCache`          |
| collections      | `pythonlib/collections` | `Counter`, `defaultdict`, `deque`        |
| math             | `pythonlib/math`        | `sqrt`, `floor`, `ceil`, `pi`, `e`       |
| random           | `pythonlib/random`      | `randInt`, `choice`, `shuffle`           |
| datetime         | `pythonlib/datetime`    | `datetime`, `date`, `time`, `timedelta`  |
| json             | `pythonlib/json`        | `loads`, `dumps`, `load`, `dump`         |
| re               | `pythonlib/re`          | `search`, `match`, `findAll`, `sub`      |
| os               | `pythonlib/os`          | `path`, `getCwd`, `sep`                  |
| string           | `pythonlib/string`      | `Template`, `capWords`, `asciiLowercase` |

> **Note:** All function names use **camelCase** to follow TypeScript conventions. See
> [ADR-0011](./0011-camelcase-api-convention.md) for the naming rationale.

### Generator Implementation

The generator tracks used functions with a `module/function` format:

```typescript
// Internal tracking
ctx.usesRuntime.add("itertools/chain")
ctx.usesRuntime.add("json/loads")
ctx.usesRuntime.add("len") // Builtins without prefix

// Generated imports (grouped by module)
import { len, range } from "pythonlib"
import { chain, combinations } from "pythonlib/itertools"
import { loads } from "pythonlib/json"
```

## Consequences

### Positive

- **Explicit dependencies**: Clear which module each function comes from
- **Better tree-shaking**: Bundlers can eliminate unused modules entirely
- **Smaller bundles**: Import only what you use
- **Idiomatic TypeScript**: Matches modern ES module conventions
- **IDE support**: Better autocomplete and go-to-definition
- **Cleaner generated code**: No `py.` prefix everywhere

### Negative

- **More import statements**: Generated code may have multiple imports
- **Learning curve**: Users need to know which subpath contains which function

### Example Transformation

**Python:**

```python
from itertools import chain
from json import loads
result = list(chain([1, 2], loads("[3, 4]")))
```

**Generated TypeScript:**

```typescript
import { list } from "pythonlib"
import { chain } from "pythonlib/itertools"
import { loads } from "pythonlib/json"

let result = list(chain([1, 2], loads("[3, 4]")))
```
