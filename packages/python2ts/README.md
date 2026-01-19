# python2ts

[![npm version](https://img.shields.io/npm/v/python2ts.svg)](https://www.npmjs.com/package/python2ts)
[![npm downloads](https://img.shields.io/npm/dm/python2ts.svg)](https://www.npmjs.com/package/python2ts)
[![CI](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/python2ts.svg)](https://github.com/sebastian-software/python2ts/blob/main/LICENSE)

**AST-based Python to TypeScript transpiler** — Write Python, ship TypeScript.

> Convert Python code to clean, idiomatic TypeScript with full type preservation.

## Quick Start

```bash
npm install python2ts
```

```bash
# Transpile a file
npx python2ts input.py -o output.ts

# Pipe from stdin
cat script.py | npx python2ts > script.ts
```

## Example

```python
def fibonacci(n: int) -> list[int]:
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result
```

Becomes:

```typescript
import { range } from "pythonlib"

function fibonacci(n: number): number[] {
  let [a, b] = [0, 1]
  let result: number[] = []
  for (const _ of range(n)) {
    result.push(a)
    ;[a, b] = [b, a + b]
  }
  return result
}
```

## Documentation

**[📚 View Full Documentation](https://sebastian-software.github.io/python2ts/)**

| Resource                                                                       | Description                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------- |
| [Homepage](https://sebastian-software.github.io/python2ts/)                    | Project overview, features, and quick start |
| [Getting Started](https://sebastian-software.github.io/python2ts/docs/)        | Installation and first steps                |
| [Syntax Reference](https://sebastian-software.github.io/python2ts/docs/syntax) | Python → TypeScript transformation rules    |
| [Runtime Library](https://sebastian-software.github.io/python2ts/docs/runtime) | Using pythonlib for Python standard library |
| [API Reference](https://sebastian-software.github.io/python2ts/docs/api)       | Complete API documentation                  |

## Runtime Support

Tested on every commit: **Node.js** (v22, v24) · **Bun** · **Deno** · **Browsers**

## Related

- [**pythonlib**](https://www.npmjs.com/package/pythonlib) — Python standard library for TypeScript
- [**GitHub**](https://github.com/sebastian-software/python2ts) — Source code and issue tracker

## License

MIT © [Sebastian Software GmbH](https://sebastian-software.de)
