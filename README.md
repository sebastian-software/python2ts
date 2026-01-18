# python2ts

[![CI](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/sebastian-software/python2ts/graph/badge.svg)](https://codecov.io/gh/sebastian-software/python2ts)
[![License](https://img.shields.io/npm/l/python2ts.svg)](https://github.com/sebastian-software/python2ts/blob/main/LICENSE)

**Bridge the gap between AI's favorite language and the world's largest ecosystem.**

Python dominates AI, ML, and data science. TypeScript powers modern web applications. **python2ts**
brings them together — transpile Python to production-ready TypeScript with full type safety.

## Packages

This monorepo contains two npm packages:

| Package                               | Description                                                | npm                                                                                           |
| ------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [**python2ts**](./packages/python2ts) | AST-based Python to TypeScript transpiler                  | [![npm](https://img.shields.io/npm/v/python2ts.svg)](https://www.npmjs.com/package/python2ts) |
| [**pythonlib**](./packages/pythonlib) | Python standard library for TypeScript (zero dependencies) | [![npm](https://img.shields.io/npm/v/pythonlib.svg)](https://www.npmjs.com/package/pythonlib) |

### python2ts

The transpiler converts Python code to clean, idiomatic TypeScript:

```bash
npm install python2ts
```

```typescript
import { transpile } from "python2ts"

const typescript = transpile(`
def fibonacci(n: int) -> list[int]:
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result
`)
```

See [packages/python2ts/README.md](./packages/python2ts/README.md) for full documentation.

### pythonlib

The runtime library provides Python standard library functions — usable standalone or as the runtime
for transpiled code:

```bash
npm install pythonlib
```

```typescript
import { range, enumerate, sorted } from "pythonlib"
import { combinations } from "pythonlib/itertools"
import { Counter } from "pythonlib/collections"

for (const combo of combinations([1, 2, 3], 2)) {
  console.log(combo) // [1,2], [1,3], [2,3]
}

const counter = new Counter("mississippi")
counter.mostCommon(2) // [["i", 4], ["s", 4]]
```

See [packages/pythonlib/README.md](./packages/pythonlib/README.md) for full documentation.

## Why python2ts?

- **Prototype in Python, deploy in TypeScript** — Keep your AI/ML workflows, ship to any JS runtime
- **Run anywhere JavaScript runs** — Browsers, Node.js, Deno, Bun, Cloudflare Workers, AWS Lambda
- **Type safety included** — Python type hints become TypeScript types automatically
- **Full standard library** — itertools, functools, collections, datetime, re, and more

## Project Structure

```
python2ts/
├── packages/
│   ├── python2ts/       # Transpiler package
│   │   ├── src/
│   │   │   ├── parser/      # Lezer-based Python parser
│   │   │   ├── transformer/ # AST transformation
│   │   │   ├── generator/   # TypeScript code generation
│   │   │   └── cli/         # Command-line interface
│   │   └── README.md
│   │
│   └── pythonlib/       # Runtime library package
│       ├── src/
│       │   ├── index.ts     # Builtins (len, range, sorted, etc.)
│       │   ├── itertools.ts # pythonlib/itertools
│       │   ├── functools.ts # pythonlib/functools
│       │   ├── collections.ts
│       │   └── ...
│       └── README.md
│
├── tests/               # Shared test suite (1400+ tests)
├── docs/                # Documentation & ADRs
└── package.json         # Workspace root
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint & format
pnpm lint
pnpm format
```

## Architecture Decision Records

Key design decisions are documented in [docs/adr/](./docs/adr/):

| ADR                                                         | Title                        |
| ----------------------------------------------------------- | ---------------------------- |
| [ADR-0001](./docs/adr/0001-use-lezer-python-parser.md)      | Use @lezer/python as Parser  |
| [ADR-0009](./docs/adr/0009-subpath-exports-architecture.md) | Subpath Exports Architecture |
| [ADR-0010](./docs/adr/0010-monorepo-package-structure.md)   | Monorepo Package Structure   |

## Requirements

- Node.js >= 22.0.0
- pnpm >= 9.0.0

## Contributing

Contributions welcome! See the [ADRs](./docs/adr/) for design context.

## License

MIT

---

**python2ts** — Write Python. Ship TypeScript. Run Everywhere.
