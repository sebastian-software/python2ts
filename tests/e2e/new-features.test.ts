/**
 * Smoke Tests for newly added Python-to-TypeScript transformations
 *
 * Tests covering:
 * - Special attributes (__name__ -> .name)
 * - Spread operators in calls (*args -> ...args)
 * - Generator functions (function*)
 * - Type hints → TypeScript types
 * - Property setters (@x.setter -> set x())
 * - %-style string formatting
 * - .format() method
 * - *args/**kwargs parameters
 * - match/case -> switch
 */

import { describe, it, expect } from "vitest"
import { execSync } from "child_process"
import { transpile } from "../../src/generator/index.js"
import { py } from "../../src/runtime/index.js"

/**
 * Strip TypeScript type annotations for JavaScript execution
 */
function stripTypes(code: string): string {
  return (
    code
      // Remove `: Type` annotations (but not in ternary operators)
      .replace(
        /:\s*(?:string|number|boolean|null|void|unknown|any|never|\w+(?:<[^>]+>)?(?:\s*\|\s*\w+(?:<[^>]+>)?)*(?:\[\])?)\s*(?=[=,)\n{])/g,
        " "
      )
      // Remove `?: Type` optional annotations
      .replace(
        /\?:\s*(?:string|number|boolean|null|void|unknown|any|never|\w+(?:<[^>]+>)?(?:\s*\|\s*\w+(?:<[^>]+>)?)*(?:\[\])?)\s*(?=[=,)\n{])/g,
        "? "
      )
      // Clean up extra spaces
      .replace(/\s+=/g, " =")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
  )
}

/**
 * Run Python code and return stdout
 */
function runPython(code: string): string {
  try {
    const result = execSync(`python3 -c "${code.replace(/"/g, '\\"')}"`, {
      encoding: "utf-8",
      timeout: 5000
    })
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

  // Strip TypeScript types for JavaScript execution
  const jsCode = stripTypes(tsCode)
  const executableCode = `
    const console = mockConsole;
    ${jsCode}
  `

  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function("py", "mockConsole", executableCode)
    fn(py, mockConsole)
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

describe("New Feature Transformations: Python <-> TypeScript Equivalence", () => {
  describe("Generator Functions", () => {
    it("simple generator with yield", () => {
      verifyEquivalence(`
def gen():
    yield 1
    yield 2
    yield 3

result = list(gen())
print(result)
`)
    })

    it("generator with loop", () => {
      verifyEquivalence(`
def squares(n):
    for i in range(n):
        yield i * i

print(list(squares(5)))
`)
    })
  })

  describe("String Formatting", () => {
    it("%-style formatting with %s", () => {
      verifyEquivalence(`
name = "World"
print("Hello %s" % name)
`)
    })

    it("%-style formatting with multiple values", () => {
      verifyEquivalence(`
name = "Alice"
age = 30
print("%s is %d years old" % (name, age))
`)
    })

    it("%-style formatting with %f", () => {
      verifyEquivalence(`
pi = 3.14159
print("Pi is %.2f" % pi)
`)
    })

    it(".format() with positional args", () => {
      verifyEquivalence(`
print("Hello {}".format("World"))
`)
    })

    it(".format() with multiple positional args", () => {
      verifyEquivalence(`
print("{} + {} = {}".format(1, 2, 3))
`)
    })

    it(".format() with indexed args", () => {
      verifyEquivalence(`
print("{0} {1} {0}".format("hello", "world"))
`)
    })
  })

  describe("Property Decorators", () => {
    it("@property getter", () => {
      verifyEquivalence(`
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

c = Circle(5)
print(c.radius)
`)
    })

    it("@property with @setter", () => {
      verifyEquivalence(`
class Point:
    def __init__(self, x):
        self._x = x

    @property
    def x(self):
        return self._x

    @x.setter
    def x(self, value):
        self._x = value

p = Point(10)
print(p.x)
p.x = 20
print(p.x)
`)
    })
  })

  describe("Function Parameters", () => {
    it("*args parameter", () => {
      verifyEquivalence(`
def sum_all(*args):
    total = 0
    for arg in args:
        total = total + arg
    return total

print(sum_all(1, 2, 3, 4, 5))
`)
    })

    it("**kwargs parameter", () => {
      verifyEquivalence(`
def greet(**kwargs):
    name = kwargs.get("name", "stranger")
    return "Hello " + name

print(greet(name="Alice"))
`)
    })

    it("regular params with *args", () => {
      verifyEquivalence(`
def func(first, *rest):
    return first + sum(rest)

print(func(1, 2, 3, 4))
`)
    })
  })

  describe("Spread in Function Calls", () => {
    it("*args spread in call", () => {
      verifyEquivalence(`
def add(a, b, c):
    return a + b + c

args = [1, 2, 3]
print(add(*args))
`)
    })

    it("mixed args with spread", () => {
      verifyEquivalence(`
def func(a, b, c, d):
    return a + b + c + d

args = [2, 3]
print(func(1, *args, 4))
`)
    })
  })

  describe("Type Hints", () => {
    it("variable with type hint", () => {
      verifyEquivalence(`
x: int = 42
print(x)
`)
    })

    it("multiple variables with type hints", () => {
      verifyEquivalence(`
x: int = 1
y: str = "hello"
z: bool = True
print(x, y, z)
`)
    })
  })

  describe("Match/Case Statement", () => {
    it("simple match with literals", () => {
      verifyEquivalence(`
def http_status(status):
    match status:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case _:
            return "Unknown"

print(http_status(200))
print(http_status(404))
print(http_status(999))
`)
    })

    it("match with string patterns", () => {
      verifyEquivalence(`
def greet(lang):
    match lang:
        case "en":
            return "Hello"
        case "de":
            return "Hallo"
        case "fr":
            return "Bonjour"
        case _:
            return "Hi"

print(greet("en"))
print(greet("de"))
print(greet("es"))
`)
    })
  })
})

describe("Runtime Functions", () => {
  describe("py.sprintf", () => {
    it("formats %s correctly", () => {
      expect(py.sprintf("Hello %s", "World")).toBe("Hello World")
    })

    it("formats %d correctly", () => {
      expect(py.sprintf("Count: %d", 42)).toBe("Count: 42")
    })

    it("formats multiple values", () => {
      expect(py.sprintf("%s is %d years old", ["Alice", 30])).toBe("Alice is 30 years old")
    })

    it("formats %.2f correctly", () => {
      expect(py.sprintf("Pi: %.2f", 3.14159)).toBe("Pi: 3.14")
    })

    it("formats %x (hex) correctly", () => {
      expect(py.sprintf("Hex: %x", 255)).toBe("Hex: ff")
    })

    it("formats %X (HEX) correctly", () => {
      expect(py.sprintf("Hex: %X", 255)).toBe("Hex: FF")
    })

    it("handles %% escape", () => {
      expect(py.sprintf("100%% complete")).toBe("100% complete")
    })
  })

  describe("py.strFormat", () => {
    it("formats {} positional args", () => {
      expect(py.strFormat("Hello {}", "World")).toBe("Hello World")
    })

    it("formats multiple {} args", () => {
      expect(py.strFormat("{} + {} = {}", 1, 2, 3)).toBe("1 + 2 = 3")
    })

    it("formats {0} indexed args", () => {
      expect(py.strFormat("{0} {1} {0}", "a", "b")).toBe("a b a")
    })

    it("formats {name} named args", () => {
      expect(py.strFormat("Hello {name}", { name: "Alice" })).toBe("Hello Alice")
    })

    it("handles mixed positional and named", () => {
      expect(py.strFormat("{} is {age}", "Alice", { age: 30 })).toBe("Alice is 30")
    })
  })
})
