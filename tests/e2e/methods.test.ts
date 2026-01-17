/**
 * Smoke Tests for Python method call transformations
 *
 * Tests that verify Python methods are correctly mapped to JavaScript equivalents
 * and produce the same output when executed.
 */

import { describe, it } from "vitest"
import { execSync } from "child_process"
import { transpile } from "python2ts"
import * as pythonlib from "pythonlib"

/**
 * Run Python code and return stdout
 */
function runPython(code: string): string {
  try {
    const result = execSync(`python3 -c "${code.replace(/"/g, '\\"')}"`, {
      encoding: "utf-8",
      timeout: 5000
    })
    // Remove trailing newline but preserve other whitespace
    return result.replace(/\n$/, "")
  } catch (error) {
    const err = error as { stderr?: Buffer | string }
    throw new Error(`Python execution failed: ${err.stderr?.toString() ?? String(error)}`)
  }
}

/**
 * Transpile Python to TypeScript and execute it
 */
function runTranspiled(pythonCode: string): string {
  const tsCode = transpile(pythonCode, {
    includeRuntime: false,
    runtimeImportPath: "python2ts/runtime"
  })

  const outputs: string[] = []
  const mockConsole = {
    log: (...args: unknown[]) => {
      outputs.push(args.map((a) => formatOutput(a)).join(" "))
    }
  }

  // Build executable code with runtime available
  // Extract all pythonlib exports into scope (excluding 'default' which is reserved)
  const runtimeExports = Object.keys(pythonlib)
    .filter((k) => k !== "default")
    .join(", ")
  const executableCode = `
    const console = mockConsole;
    const { ${runtimeExports} } = runtime;
    ${tsCode}
  `

  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function("runtime", "mockConsole", executableCode)
    fn(pythonlib, mockConsole)
    return outputs.join("\n")
  } catch (error) {
    throw new Error(`TypeScript execution failed: ${String(error)}\nCode: ${tsCode}`)
  }
}

function formatOutput(value: unknown, inCollection = false): string {
  if (value === null) return "None"
  if (value === undefined) return "None"
  if (value === true) return "True"
  if (value === false) return "False"
  if (Array.isArray(value)) {
    return "[" + value.map((v) => formatOutput(v, true)).join(", ") + "]"
  }
  if (typeof value === "string") {
    // Inside collections, strings are quoted
    return inCollection ? `'${value}'` : value
  }
  if (typeof value === "number" || typeof value === "bigint") return String(value)
  if (value instanceof Set) {
    const items = [...value].map((v) => formatOutput(v, true)).join(", ")
    return `{${items}}`
  }
  if (value instanceof Map) {
    const items = [...value.entries()]
      .map(([k, v]) => `${formatOutput(k, true)}: ${formatOutput(v, true)}`)
      .join(", ")
    return `{${items}}`
  }
  if (typeof value === "object") {
    // Handle tuples (arrays with tuple marker) and plain objects
    const entries = Object.entries(value)
    if (entries.length === 0) return "{}"
    const items = entries.map(([k, v]) => `'${k}': ${formatOutput(v, true)}`).join(", ")
    return `{${items}}`
  }
  return String(value as string | boolean | symbol)
}

function verifyEquivalence(pythonCode: string, description?: string) {
  const pythonOutput = runPython(pythonCode)
  const tsOutput = runTranspiled(pythonCode)

  if (pythonOutput !== tsOutput) {
    const tsCode = transpile(pythonCode, { includeRuntime: false })
    throw new Error(
      `Output mismatch${description ? ` (${description})` : ""}:\n` +
        `Python code: ${pythonCode}\n` +
        `TypeScript:  ${tsCode}\n` +
        `Python output:     "${pythonOutput}"\n` +
        `TypeScript output: "${tsOutput}"`
    )
  }

  return { pythonOutput, tsOutput }
}

describe("Method Transformations: Python ↔ TypeScript Equivalence", () => {
  describe("String Methods", () => {
    it("upper() and lower()", () => {
      verifyEquivalence("print('hello'.upper())")
      verifyEquivalence("print('HELLO'.lower())")
    })

    it("strip(), lstrip(), rstrip()", () => {
      verifyEquivalence("print('  hello  '.strip())")
      verifyEquivalence("print('  hello  '.lstrip())")
      verifyEquivalence("print('  hello  '.rstrip())")
    })

    it("startswith() and endswith()", () => {
      verifyEquivalence("print('hello'.startswith('he'))")
      verifyEquivalence("print('hello'.startswith('lo'))")
      verifyEquivalence("print('hello'.endswith('lo'))")
      verifyEquivalence("print('hello'.endswith('he'))")
    })

    it("find() and rfind()", () => {
      verifyEquivalence("print('hello world'.find('o'))")
      verifyEquivalence("print('hello world'.rfind('o'))")
      verifyEquivalence("print('hello'.find('xyz'))")
    })

    it("split() and join()", () => {
      verifyEquivalence("print('a,b,c'.split(','))")
      verifyEquivalence("print('-'.join(['a', 'b', 'c']))")
    })

    it("replace()", () => {
      verifyEquivalence("print('hello world'.replace('world', 'python'))")
      verifyEquivalence("print('aaa'.replace('a', 'b', 2))")
    })

    it("capitalize() and title()", () => {
      verifyEquivalence("print('hello world'.capitalize())")
      verifyEquivalence("print('hello world'.title())")
    })

    it("isalpha(), isdigit(), isalnum()", () => {
      verifyEquivalence("print('hello'.isalpha())")
      verifyEquivalence("print('hello123'.isalpha())")
      verifyEquivalence("print('123'.isdigit())")
      verifyEquivalence("print('hello123'.isalnum())")
    })

    it("zfill()", () => {
      verifyEquivalence("print('42'.zfill(5))")
      verifyEquivalence("print('-42'.zfill(5))")
    })

    it("center(), ljust(), rjust()", () => {
      verifyEquivalence("print('hi'.center(6))")
      verifyEquivalence("print('hi'.ljust(6))")
      verifyEquivalence("print('hi'.rjust(6))")
    })

    it("partition() and rpartition()", () => {
      // partition returns tuples in Python, arrays in JS
      // Test by accessing the elements
      verifyEquivalence(`
result = 'hello-world-test'.partition('-')
print(result[0])
print(result[1])
print(result[2])
`)
      verifyEquivalence(`
result = 'hello-world-test'.rpartition('-')
print(result[0])
print(result[1])
print(result[2])
`)
    })

    it("count()", () => {
      verifyEquivalence("print('hello'.count('l'))")
      verifyEquivalence("print('hello'.count('ll'))")
    })
  })

  describe("List Methods", () => {
    it("append()", () => {
      verifyEquivalence(`
items = [1, 2, 3]
items.append(4)
print(items)
`)
    })

    it("extend()", () => {
      verifyEquivalence(`
items = [1, 2]
items.extend([3, 4])
print(items)
`)
    })

    it("pop() - last element", () => {
      verifyEquivalence(`
items = [1, 2, 3]
x = items.pop()
print(x)
print(items)
`)
    })

    it("pop(0) - first element", () => {
      verifyEquivalence(`
items = [1, 2, 3]
x = items.pop(0)
print(x)
print(items)
`)
    })

    it("reverse()", () => {
      verifyEquivalence(`
items = [1, 2, 3]
items.reverse()
print(items)
`)
    })

    it("copy()", () => {
      verifyEquivalence(`
items = [1, 2, 3]
copied = items.copy()
items.append(4)
print(copied)
`)
    })
  })

  describe("Dict Methods", () => {
    it("keys()", () => {
      verifyEquivalence(`
d = {"a": 1, "b": 2}
print(sorted(d.keys()))
`)
    })

    it("values()", () => {
      verifyEquivalence(`
d = {"a": 1, "b": 2}
print(sorted(d.values()))
`)
    })

    it("items() - access values", () => {
      // Note: Python items() returns tuples, JS Object.entries returns arrays
      // We test the values rather than the tuple representation
      verifyEquivalence(`
d = {"a": 1, "b": 2}
for k, v in d.items():
    print(k, v)
`)
    })

    it("get() with default", () => {
      verifyEquivalence(`
d = {"a": 1}
print(d.get("a", 0))
print(d.get("b", 0))
`)
    })

    it("update()", () => {
      // Test the effect of update rather than printing items
      verifyEquivalence(`
d = {"a": 1}
d.update({"b": 2})
print(sorted(d.keys()))
print(d["a"])
print(d["b"])
`)
    })
  })

  describe("Dict Iteration", () => {
    it("iterating over dict keys", () => {
      verifyEquivalence(`
d = {"a": 1, "b": 2}
result = []
for k in d:
    result.append(k)
print(sorted(result))
`)
    })

    it("iterating over dict.items()", () => {
      verifyEquivalence(`
d = {"a": 1, "b": 2}
result = []
for k, v in d.items():
    result.append(k + str(v))
print(sorted(result))
`)
    })
  })

  describe("Class Instantiation", () => {
    it("simple class with __init__", () => {
      verifyEquivalence(`
class MyCounter:
    def __init__(self, start):
        self.value = start
    def increment(self):
        self.value = self.value + 1

c = MyCounter(0)
c.increment()
c.increment()
print(c.value)
`)
    })

    it("class with method returning value", () => {
      verifyEquivalence(`
class Greeter:
    def __init__(self, name):
        self.name = name
    def greet(self):
        return "Hello, " + self.name

g = Greeter("World")
print(g.greet())
`)
    })
  })
})
