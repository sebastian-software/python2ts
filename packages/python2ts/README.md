# python2ts

<div align="center">

**Transpile Python to TypeScript — Automatically**

[![npm version](https://img.shields.io/npm/v/python2ts.svg)](https://www.npmjs.com/package/python2ts)
[![npm downloads](https://img.shields.io/npm/dm/python2ts.svg)](https://www.npmjs.com/package/python2ts)
[![CI](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastian-software/python2ts/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/python2ts.svg)](https://github.com/sebastian-software/python2ts/blob/main/LICENSE)

</div>

---

Stop rewriting Python code by hand. **python2ts** transforms your Python into clean, idiomatic
TypeScript — with full type preservation.

## Install

```bash
npm install -g python2ts
```

## Usage

```bash
# Transpile a file
python2ts algorithm.py -o algorithm.ts

# Transpile to stdout
python2ts script.py

# Pipe from stdin
cat utils.py | python2ts > utils.ts
```

## What It Does

<table>
<tr>
<td width="50%">

**Your Python**

```python
from dataclasses import dataclass
from collections import Counter

@dataclass
class WordStats:
    text: str

    def word_count(self) -> dict[str, int]:
        words = self.text.lower().split()
        return dict(Counter(words))

    def most_common(self, n: int = 5):
        counts = Counter(self.word_count())
        return counts.most_common(n)
```

</td>
<td width="50%">

**Clean TypeScript**

```typescript
import { Counter } from "pythonlib/collections"

class WordStats {
  constructor(public text: string) {}

  wordCount(): Map<string, number> {
    const words = this.text.toLowerCase().split(/\s+/)
    return new Map(new Counter(words))
  }

  mostCommon(n: number = 5) {
    const counts = new Counter(this.wordCount())
    return counts.mostCommon(n)
  }
}
```

</td>
</tr>
</table>

## Supported Python Features

| Feature                  | Example                       | Output                                        |
| ------------------------ | ----------------------------- | --------------------------------------------- |
| **Type hints**           | `def foo(x: int) -> str:`     | `function foo(x: number): string`             |
| **Dataclasses**          | `@dataclass class Point:`     | `class Point { constructor... }`              |
| **List comprehensions**  | `[x*2 for x in items]`        | `items.map(x => x * 2)`                       |
| **Dict comprehensions**  | `{k: v for k, v in pairs}`    | `new Map(pairs.map(...))`                     |
| **Pattern matching**     | `match x: case 1: ...`        | `switch/if statements`                        |
| **f-strings**            | `f"Hello {name}!"`            | `` `Hello ${name}!` ``                        |
| **Async/await**          | `async def fetch():`          | `async function fetch()`                      |
| **Decorators**           | `@lru_cache def fib(n):`      | Transformed decorators                        |
| **Context managers**     | `with open(f) as file:`       | `try/finally` blocks                          |
| **Generators**           | `yield from items`            | `yield* items`                                |
| **Walrus operator**      | `if (n := len(x)) > 0:`       | `let n; if ((n = len(x)) > 0)`                |
| **Multiple inheritance** | `class C(A, B):`              | Mixins                                        |
| **Standard library**     | `from itertools import chain` | `import { chain } from "pythonlib/itertools"` |

## CLI Options

```
Usage: python2ts [options] [file]

Arguments:
  file                    Python file to transpile (reads from stdin if omitted)

Options:
  -o, --output <file>     Write output to file instead of stdout
  -r, --runtime <path>    Custom runtime library path (default: "pythonlib")
  --no-runtime            Don't add runtime imports
  -v, --version           Show version number
  -h, --help              Show help
```

## Programmatic API

```typescript
import { transpile } from "python2ts"

const python = `
def greet(name: str) -> str:
    return f"Hello, {name}!"
`

const typescript = transpile(python)
console.log(typescript)
// function greet(name: string): string {
//   return `Hello, ${name}!`
// }
```

## Runtime Library

The transpiled code uses [**pythonlib**](https://www.npmjs.com/package/pythonlib) for Python
standard library functions. Install it as a dependency in your project:

```bash
npm install pythonlib
```

## Documentation

| Resource                                                                       | Description                    |
| ------------------------------------------------------------------------------ | ------------------------------ |
| [Homepage](https://sebastian-software.github.io/python2ts/)                    | Project overview and features  |
| [Getting Started](https://sebastian-software.github.io/python2ts/docs/)        | Installation and first steps   |
| [Syntax Reference](https://sebastian-software.github.io/python2ts/docs/syntax) | Complete transformation rules  |
| [API Reference](https://sebastian-software.github.io/python2ts/docs/api)       | Programmatic API documentation |

## Runtime Support

Transpiled code runs everywhere JavaScript runs:

- **Node.js** (v22, v24)
- **Bun**
- **Deno**
- **Browsers**
- **Edge** (Cloudflare Workers, AWS Lambda, Vercel)

## Related

- [**pythonlib**](https://www.npmjs.com/package/pythonlib) — Python standard library for TypeScript
- [**GitHub**](https://github.com/sebastian-software/python2ts) — Source code, issues, contributions
  welcome

## License

MIT © [Sebastian Software GmbH](https://sebastian-software.de)
