---
sidebar_position: 1
slug: /
---

# Introduction

**python2ts** bridges the gap between AI's favorite language and the world's largest ecosystem.

Python dominates AI, ML, and data science. TypeScript powers modern web applications with the npm
ecosystem of 3+ million packages. **python2ts** brings them together — transpile Python to
production-ready TypeScript with full type safety.

## The Numbers

| Metric                 | Value                           |
| ---------------------- | ------------------------------- |
| **Tests**              | 2000+                           |
| **Python Modules**     | 20+                             |
| **Dependencies**       | 0 (pythonlib)                   |
| **Runtimes Supported** | 4 (Node.js, Bun, Deno, Browser) |
| **Python Features**    | 15+ major constructs            |

## Why python2ts?

### The AI Era Demands Language Interoperability

Python has become the lingua franca of artificial intelligence. From TensorFlow to PyTorch, from
Jupyter notebooks to LangChain — if it's AI, it's probably Python. But production applications live
in a different world: browsers, serverless functions, edge computing, React frontends.

**python2ts bridges this gap:**

- **Prototype in Python, deploy in TypeScript** — Keep your AI/ML workflows, ship to any JavaScript
  runtime
- **Leverage the npm ecosystem** — Access 3+ million packages without leaving Python semantics
  behind
- **Run anywhere JavaScript runs** — Browsers, Node.js, Deno, Bun, Cloudflare Workers, AWS Lambda
- **Type safety included** — Python type hints become TypeScript types automatically

### Two Packages, One Solution

| Package       | Description                                          | Dependencies |
| ------------- | ---------------------------------------------------- | ------------ |
| **python2ts** | The transpiler CLI and API                           | Minimal      |
| **pythonlib** | Python standard library for TypeScript (20+ modules) | **Zero**     |

Use them together or separately — `pythonlib` works standalone if you just want Python's itertools,
functools, or collections in TypeScript.

## Quick Example

```python
def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence."""
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print(fibonacci(10))
```

Becomes:

```typescript
import { range } from "pythonlib"

/**
 * Generate Fibonacci sequence.
 */
function fibonacci(n: number): number[] {
  let [a, b] = [0, 1]
  let result: number[] = []
  for (const _ of range(n)) {
    result.push(a)
    ;[a, b] = [b, a + b]
  }
  return result
}

console.log(fibonacci(10))
```

## What's in pythonlib?

A comprehensive implementation of Python's most useful modules:

### Core Utilities

| Module          | Highlights                                                             |
| --------------- | ---------------------------------------------------------------------- |
| **itertools**   | `combinations`, `permutations`, `product`, `chain`, `cycle`, `groupby` |
| **functools**   | `lruCache`, `partial`, `reduce`, `pipe`, `compose`                     |
| **collections** | `Counter`, `defaultdict`, `deque`, `OrderedDict`                       |

### Data & Time

| Module       | Highlights                                                   |
| ------------ | ------------------------------------------------------------ |
| **datetime** | `datetime`, `date`, `time`, `timedelta` with full arithmetic |
| **json**     | `loads`, `dumps` with Python-compatible semantics            |
| **re**       | `search`, `match`, `findAll`, `sub` with named groups        |

### Math & Random

| Module     | Highlights                                             |
| ---------- | ------------------------------------------------------ |
| **math**   | `sqrt`, `floor`, `ceil`, `factorial`, `gcd`, `pi`, `e` |
| **random** | `randInt`, `choice`, `shuffle`, `sample`, `uniform`    |

### File System

| Module       | Highlights                                          |
| ------------ | --------------------------------------------------- |
| **os**       | `path.join`, `environ`, `getcwd`, `listdir`, `walk` |
| **pathlib**  | `Path` class with `readText`, `writeText`, `glob`   |
| **glob**     | Pattern matching for files                          |
| **shutil**   | `copy`, `move`, `rmtree`                            |
| **tempfile** | `NamedTemporaryFile`, `TemporaryDirectory`          |

### Security & Encoding

| Module      | Highlights                                  |
| ----------- | ------------------------------------------- |
| **hashlib** | `md5`, `sha256`, `sha512`                   |
| **base64**  | `b64encode`, `b64decode`, URL-safe variants |
| **uuid**    | `uuid4`, `uuid1`, `UUID` class              |

### More

| Module         | Highlights                              |
| -------------- | --------------------------------------- |
| **string**     | `Template`, `capWords`, ASCII constants |
| **subprocess** | `run`, `call`, `checkOutput`            |
| **urllib**     | `urlparse`, `urljoin`, `quote`          |
| **logging**    | `getLogger`, `basicConfig`, handlers    |
| **sys**        | `argv`, `platform`, `exit`              |
| **time**       | `sleep`, `time`, `strftime`             |
| **copy**       | `copy`, `deepcopy`                      |

## Supported Python Features

| Feature                         | Status |
| ------------------------------- | :----: |
| Functions & type hints          |   ✅   |
| Classes & inheritance           |   ✅   |
| Dataclasses                     |   ✅   |
| Generics (`TypeVar`, `Generic`) |   ✅   |
| Protocols                       |   ✅   |
| TypedDict                       |   ✅   |
| List/dict/set comprehensions    |   ✅   |
| Pattern matching (`match`)      |   ✅   |
| Async/await                     |   ✅   |
| Decorators                      |   ✅   |
| Context managers (`with`)       |   ✅   |
| f-strings                       |   ✅   |
| Generators                      |   ✅   |
| Walrus operator (`:=`)          |   ✅   |
| Multiple inheritance            |   ✅   |

## Runtime Support

Tested on every commit:

- **Node.js** v22, v24
- **Bun** latest
- **Deno** v2.x
- **Browsers** via Playwright (Chrome, Firefox, Safari)

Also works in: Cloudflare Workers, AWS Lambda, Vercel Edge Functions, and any other JavaScript
runtime.
