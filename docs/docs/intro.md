---
sidebar_position: 1
slug: /
---

# Introduction

**python2ts** bridges the gap between AI's favorite language and the world's largest ecosystem.

Python dominates AI, ML, and data science. TypeScript powers modern web applications with the npm
ecosystem of 3+ million packages. **python2ts** brings them together — transpile Python to
production-ready TypeScript with full type safety.

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

| Package       | Description                                         |
| ------------- | --------------------------------------------------- |
| **python2ts** | The transpiler CLI and API                          |
| **pythonlib** | Python standard library for TypeScript (standalone) |

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
import { py } from "pythonlib"

/**
 * Generate Fibonacci sequence.
 */
function fibonacci(n: number): number[] {
  let [a, b] = [0, 1]
  let result: number[] = []
  for (const _ of py.range(n)) {
    result.push(a)
    ;[a, b] = [b, a + b]
  }
  return result
}

console.log(fibonacci(10))
```
