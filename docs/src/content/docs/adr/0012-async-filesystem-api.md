---
title: "ADR-0012: Async Filesystem API"
description: Architecture Decision Record
---

# ADR-0012: Async Filesystem API

## Status

Accepted

## Context

Python's filesystem APIs (`os`, `pathlib`, `shutil`, `glob`, `tempfile`) are synchronous by design.
Node.js offers both synchronous (`*Sync`) and asynchronous (`fs/promises`) variants.

When transpiling Python code to TypeScript, we must decide which pattern to use:

1. **Synchronous API** — Direct port of Python's blocking behavior
2. **Asynchronous API** — Idiomatic TypeScript/JavaScript using `async/await`

JavaScript and TypeScript strongly favor non-blocking I/O. Synchronous filesystem operations block
the event loop, which is particularly problematic in:

- Server applications (Express, Fastify, etc.)
- Browser environments (where sync APIs are often unavailable)
- Applications requiring high concurrency

## Decision

We adopt **async/await patterns** for all filesystem operations in pythonlib:

### Affected Modules

| Module     | Operations                                              |
| ---------- | ------------------------------------------------------- |
| `os`       | `listDir`, `mkdir`, `remove`, `rename`, `walk`, `stat`  |
| `os.path`  | `exists`, `isFile`, `isDir`, `isLink`, `realPath`       |
| `pathlib`  | `exists`, `isFile`, `isDir`, `read*`, `write*`, `mkdir` |
| `glob`     | `glob`, `iglob`, `rglob`                                |
| `shutil`   | `copy`, `copy2`, `copytree`, `move`, `rmtree`           |
| `tempfile` | `mkstemp`, `mkdtemp`, `NamedTemporaryFile`, `cleanup`   |

### Implementation Patterns

**Functions return Promises:**

```typescript
// Before (sync)
function listDir(path: string): string[]

// After (async)
async function listDir(path: string): Promise<string[]>
```

**Classes use static factory methods** (since constructors cannot be async):

```typescript
// Before (sync constructor)
const tmp = new NamedTemporaryFile({ suffix: ".txt" })

// After (async factory)
const tmp = await NamedTemporaryFile.create({ suffix: ".txt" })
```

**Class methods are async:**

```typescript
class NamedTemporaryFile {
  async write(data: string | Uint8Array): Promise<number>
  async read(size?: number): Promise<Buffer>
  async flush(): Promise<void>
  async close(): Promise<void>
}
```

### External Tool Dependencies Removed

Functions that relied on external CLI tools (`tar`, `zip`, `unzip`, `wmic`) now throw
`Error("not implemented")` instead:

- `shutil.makeArchive()` — required `tar`/`zip`
- `shutil.unpackArchive()` — required `tar`/`unzip`
- `shutil.diskUsage()` on Windows — required `wmic` (Unix uses native `statfs`)

This ensures pythonlib has no external dependencies beyond Node.js built-ins.

### Unchanged (Intentionally Sync)

Some operations remain synchronous where appropriate:

- `subprocess.run()` — Synchronous process execution (matches Python's `subprocess.run`)
- `hashlib.pbkdf2Hmac()`, `hashlib.scrypt()` — CPU-bound crypto operations
- Pure path manipulation (`os.path.join`, `pathlib.Path.stem`, etc.)

## Consequences

### Positive

- **Idiomatic TypeScript**: Follows JavaScript best practices for I/O
- **Non-blocking**: Enables high-performance concurrent applications
- **Better compatibility**: Works in environments where sync APIs are restricted
- **Consistent API**: All filesystem operations follow the same async pattern

### Negative

- **API breaking change**: Existing code must add `await` to filesystem calls
- **Verbosity**: `await` required for every operation
- **Learning curve**: Python developers must understand async/await

### Migration Example

**Before (sync):**

```typescript
const tmp = new NamedTemporaryFile()
tmp.write("data")
tmp.close()
```

**After (async):**

```typescript
const tmp = await NamedTemporaryFile.create()
await tmp.write("data")
await tmp.close()
```

## Related Decisions

- [ADR-0009: Subpath Exports Architecture](./0009-subpath-exports-architecture.md)
- [ADR-0011: camelCase API Convention](./0011-camelcase-api-convention.md)
