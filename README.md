# python2ts

<div align="center">

<img src=".github/assets/python.svg" alt="Python" width="80" height="80" />
&nbsp;&nbsp;&nbsp;
<strong style="font-size: 2em">→</strong>
&nbsp;&nbsp;&nbsp;
<img src=".github/assets/typescript.svg" alt="TypeScript" width="80" height="80" />

**Write Python. Ship TypeScript. Run Everywhere.**

[![CI](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml)
[![python2ts coverage](https://img.shields.io/codecov/c/github/sebastian-software/python2ts?flag=python2ts&label=python2ts)](https://codecov.io/gh/sebastian-software/python2ts/flags)
[![pythonlib coverage](https://img.shields.io/codecov/c/github/sebastian-software/python2ts?flag=pythonlib&label=pythonlib)](https://codecov.io/gh/sebastian-software/python2ts/flags)
[![License](https://img.shields.io/npm/l/python2ts.svg)](https://github.com/sebastian-software/python2ts/blob/main/LICENSE)

[Homepage](https://sebastian-software.github.io/python2ts/) ·
[Documentation](https://sebastian-software.github.io/python2ts/docs/) ·
[API Reference](https://sebastian-software.github.io/python2ts/docs/api)

</div>

---

## The Bridge Between Two Worlds

Python dominates AI, ML, and data science. TypeScript powers modern web applications. Until now,
these worlds rarely met.

**python2ts** changes that — transpile Python to production-ready TypeScript with full type safety.
Your Python algorithms, data structures, and business logic can now run anywhere JavaScript runs.

## Packages

| Package                               | Description                               | Version                                                                                       |
| ------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| [**python2ts**](./packages/python2ts) | AST-based Python to TypeScript transpiler | [![npm](https://img.shields.io/npm/v/python2ts.svg)](https://www.npmjs.com/package/python2ts) |
| [**pythonlib**](./packages/pythonlib) | Python standard library for TypeScript    | [![npm](https://img.shields.io/npm/v/pythonlib.svg)](https://www.npmjs.com/package/pythonlib) |

## See It In Action

<table>
<tr>
<td width="50%">

**Python** (your algorithm)

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class TreeNode:
    value: int
    left: Optional["TreeNode"] = None
    right: Optional["TreeNode"] = None

def max_depth(node: Optional[TreeNode]) -> int:
    if node is None:
        return 0
    return 1 + max(
        max_depth(node.left),
        max_depth(node.right)
    )
```

</td>
<td width="50%">

**TypeScript** (ready to ship)

```typescript
class TreeNode {
  constructor(
    public value: number,
    public left: TreeNode | null = null,
    public right: TreeNode | null = null
  ) {}
}

function maxDepth(node: TreeNode | null): number {
  if (node === null) {
    return 0
  }
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right))
}
```

</td>
</tr>
</table>

## Why python2ts?

### For AI/ML Teams

- **Bring models to the browser** — Run inference directly on the client
- **Share code with your frontend** — Same algorithms, same behavior, zero translation errors
- **Edge deployment** — Cloudflare Workers, AWS Lambda@Edge, Vercel Edge Functions

### For Full-Stack Developers

- **Python prototyping → TypeScript production** — Iterate fast, ship faster
- **No more manual rewrites** — Automated, deterministic transpilation
- **Type safety preserved** — Python type hints become TypeScript types

### For Everyone

- **2000+ tests** — Battle-tested on real code patterns
- **Complete standard library** — itertools, functools, collections, datetime, re, and more
- **Run anywhere** — Browsers, Node.js, Deno, Bun, Workers

## Runtime Support

Tested on every commit across all major JavaScript runtimes:

<p>
  <img src=".github/assets/nodejs.svg" alt="Node.js" height="28" />
  &nbsp;&nbsp;
  <img src=".github/assets/bun.svg" alt="Bun" height="28" />
  &nbsp;&nbsp;
  <img src=".github/assets/deno.svg" alt="Deno" height="28" />
  &nbsp;&nbsp;
  <img src=".github/assets/playwright.svg" alt="Browsers" height="28" />
</p>

**Node.js** (v22, v24) · **Bun** · **Deno** · **Browsers** (Chrome, Firefox, Safari via Playwright)

## What Gets Transpiled?

| Python Feature               | TypeScript Output        | Status |
| ---------------------------- | ------------------------ | :----: |
| Functions & type hints       | Typed functions          |   ✅   |
| Classes & dataclasses        | Classes                  |   ✅   |
| List/dict/set comprehensions | `filter`/`map` chains    |   ✅   |
| Pattern matching (`match`)   | `switch`/`if` statements |   ✅   |
| `async`/`await`              | Native async/await       |   ✅   |
| Decorators                   | Transformed decorators   |   ✅   |
| `with` statements            | Try/finally blocks       |   ✅   |
| f-strings                    | Template literals        |   ✅   |
| Standard library             | pythonlib imports        |   ✅   |

## Quick Start

```bash
# Install
npm install -g python2ts

# Transpile a file
python2ts algorithm.py -o algorithm.ts

# Or pipe it
cat script.py | python2ts > script.ts
```

## Documentation

| Resource                                                                       | Description                              |
| ------------------------------------------------------------------------------ | ---------------------------------------- |
| [Homepage](https://sebastian-software.github.io/python2ts/)                    | Project overview and features            |
| [Getting Started](https://sebastian-software.github.io/python2ts/docs/)        | Installation and first steps             |
| [Syntax Reference](https://sebastian-software.github.io/python2ts/docs/syntax) | Python → TypeScript transformation rules |
| [Runtime Library](https://sebastian-software.github.io/python2ts/docs/runtime) | Using pythonlib modules                  |
| [API Reference](https://sebastian-software.github.io/python2ts/docs/api)       | Complete API documentation               |

## Development

```bash
pnpm install    # Install dependencies
pnpm build      # Build all packages
pnpm test       # Run tests (2000+ tests)
pnpm lint       # Lint code
```

## Architecture

Key design decisions are documented in [docs/adr/](./docs/adr/):

- [ADR-0001](./docs/adr/0001-use-lezer-python-parser.md) — Lezer Python Parser
- [ADR-0009](./docs/adr/0009-subpath-exports-architecture.md) — Subpath Exports
- [ADR-0010](./docs/adr/0010-monorepo-package-structure.md) — Monorepo Structure

## Requirements

- Node.js >= 22.0.0
- pnpm >= 9.0.0

## License

MIT © [Sebastian Software GmbH](https://sebastian-software.de)
