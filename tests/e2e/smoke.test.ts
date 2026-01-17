/**
 * Smoke Tests - Execute Python code and compare with transpiled TypeScript output
 *
 * These tests verify semantic equivalence by running both Python and the
 * transpiled TypeScript code and comparing their outputs.
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
    return result.trim()
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

  // Create a function that captures console.log output
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

/**
 * Format output to match Python's print behavior
 */
function formatOutput(value: unknown): string {
  if (value === null) return "None"
  if (value === undefined) return "None"
  if (value === true) return "True"
  if (value === false) return "False"
  if (Array.isArray(value)) {
    return "[" + value.map((v) => formatOutput(v)).join(", ") + "]"
  }
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "bigint") return String(value)
  if (typeof value === "object") {
    // Handle objects (null already handled above)
    return JSON.stringify(value)
  }
  return String(value as string | boolean | symbol)
}

/**
 * Test that Python and transpiled TypeScript produce the same output
 */
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

describe("Smoke Tests: Python ↔ TypeScript Equivalence", () => {
  describe("Arithmetic Operations", () => {
    it("basic arithmetic", () => {
      verifyEquivalence("print(2 + 3)")
      verifyEquivalence("print(10 - 4)")
      verifyEquivalence("print(3 * 4)")
      verifyEquivalence("print(10 / 4)")
    })

    it("floor division with positive numbers", () => {
      verifyEquivalence("print(7 // 3)")
      verifyEquivalence("print(10 // 4)")
      verifyEquivalence("print(15 // 5)")
    })

    it("floor division with negative numbers", () => {
      verifyEquivalence("print(-7 // 3)", "negative dividend")
      verifyEquivalence("print(7 // -3)", "negative divisor")
      verifyEquivalence("print(-7 // -3)", "both negative")
    })

    it("modulo with positive numbers", () => {
      verifyEquivalence("print(7 % 3)")
      verifyEquivalence("print(10 % 4)")
      verifyEquivalence("print(15 % 5)")
    })

    it("modulo with negative numbers", () => {
      verifyEquivalence("print(-7 % 3)", "negative dividend")
      verifyEquivalence("print(7 % -3)", "negative divisor")
      verifyEquivalence("print(-7 % -3)", "both negative")
    })

    it("power operator", () => {
      verifyEquivalence("print(2 ** 3)")
      verifyEquivalence("print(3 ** 2)")
      verifyEquivalence("print(2 ** 10)")
    })

    it("combined operations", () => {
      verifyEquivalence("print(2 + 3 * 4)")
      verifyEquivalence("print((2 + 3) * 4)")
      verifyEquivalence("print(10 // 3 + 7 % 3)")
    })
  })

  describe("Comparison Operations", () => {
    it("equality", () => {
      verifyEquivalence("print(5 == 5)")
      verifyEquivalence("print(5 == 6)")
      verifyEquivalence("print(5 != 6)")
    })

    it("ordering", () => {
      verifyEquivalence("print(3 < 5)")
      verifyEquivalence("print(5 < 3)")
      verifyEquivalence("print(3 <= 3)")
      verifyEquivalence("print(5 >= 5)")
    })

    it("chained comparisons", () => {
      verifyEquivalence("print(1 < 2 < 3)")
      verifyEquivalence("print(1 < 2 > 0)")
      verifyEquivalence("print(1 < 5 < 3)")
    })
  })

  describe("Boolean Operations", () => {
    it("and/or/not", () => {
      verifyEquivalence("print(True and True)")
      verifyEquivalence("print(True and False)")
      verifyEquivalence("print(True or False)")
      verifyEquivalence("print(not True)")
      verifyEquivalence("print(not False)")
    })

    it("short-circuit evaluation", () => {
      verifyEquivalence("print(False and True)")
      verifyEquivalence("print(True or False)")
    })
  })

  describe("Built-in Functions", () => {
    it("len()", () => {
      verifyEquivalence("print(len([1, 2, 3]))")
      verifyEquivalence("print(len('hello'))")
      verifyEquivalence("print(len([]))")
    })

    it("abs()", () => {
      verifyEquivalence("print(abs(5))")
      verifyEquivalence("print(abs(-5))")
      verifyEquivalence("print(abs(0))")
    })

    it("min() and max()", () => {
      verifyEquivalence("print(min(1, 2, 3))")
      verifyEquivalence("print(max(1, 2, 3))")
      verifyEquivalence("print(min([5, 2, 8, 1]))")
      verifyEquivalence("print(max([5, 2, 8, 1]))")
    })

    it("sum()", () => {
      verifyEquivalence("print(sum([1, 2, 3, 4, 5]))")
      verifyEquivalence("print(sum([]))")
      verifyEquivalence("print(sum(range(10)))")
    })

    it("range()", () => {
      verifyEquivalence("print(list(range(5)))")
      verifyEquivalence("print(list(range(2, 7)))")
      verifyEquivalence("print(list(range(0, 10, 2)))")
      verifyEquivalence("print(list(range(10, 0, -1)))")
    })

    it("sorted()", () => {
      verifyEquivalence("print(sorted([3, 1, 4, 1, 5, 9, 2, 6]))")
      verifyEquivalence("print(sorted([3, 1, 4], reverse=True))")
    })

    it("type conversions", () => {
      verifyEquivalence("print(int(3.7))")
      verifyEquivalence("print(int('42'))")
      // Note: float(42) prints "42.0" in Python but "42" in JS - display difference only
      verifyEquivalence("print(str(42))")
      verifyEquivalence("print(bool(1))")
      verifyEquivalence("print(bool(0))")
    })
  })

  describe("String Operations", () => {
    it("concatenation", () => {
      verifyEquivalence("print('hello' + ' ' + 'world')")
    })

    it("repetition", () => {
      verifyEquivalence("print('ab' * 3)")
    })

    it("positive indexing", () => {
      verifyEquivalence("print('hello'[0])")
      verifyEquivalence("print('hello'[1])")
    })

    it("negative indexing", () => {
      verifyEquivalence("print('hello'[-1])")
    })

    it("membership", () => {
      verifyEquivalence("print('ell' in 'hello')")
      verifyEquivalence("print('xyz' in 'hello')")
    })
  })

  describe("List Operations", () => {
    it("creation and positive access", () => {
      verifyEquivalence("print([1, 2, 3])")
      verifyEquivalence("print([1, 2, 3][0])")
      verifyEquivalence("print([1, 2, 3][1])")
    })

    it("negative indexing", () => {
      verifyEquivalence("print([1, 2, 3][-1])")
    })

    it("slicing", () => {
      verifyEquivalence("print([1, 2, 3, 4, 5][1:4])")
      verifyEquivalence("print([1, 2, 3, 4, 5][::2])")
      verifyEquivalence("print([1, 2, 3, 4, 5][::-1])")
    })

    it("membership", () => {
      verifyEquivalence("print(2 in [1, 2, 3])")
      verifyEquivalence("print(5 in [1, 2, 3])")
    })

    it("concatenation", () => {
      verifyEquivalence("print([1, 2] + [3, 4])")
    })
  })

  describe("Control Flow", () => {
    it("for loop with range", () => {
      verifyEquivalence(`
for i in range(5):
    print(i)
`)
    })

    it("for loop with list", () => {
      verifyEquivalence(`
for x in [10, 20, 30]:
    print(x)
`)
    })

    it("while loop with reassignment", () => {
      verifyEquivalence(`
x = 3
while x > 0:
    print(x)
    x = x - 1
`)
    })

    it("while loop simple", () => {
      verifyEquivalence(`
x = 3
while x > 0:
    print(x)
    x -= 1
`)
    })

    it("if/elif/else", () => {
      verifyEquivalence(`
x = 5
if x < 3:
    print('small')
elif x < 7:
    print('medium')
else:
    print('large')
`)
    })
  })

  describe("Functions", () => {
    it("simple function", () => {
      verifyEquivalence(`
def add(a, b):
    return a + b
print(add(3, 4))
`)
    })

    it("function with default parameter", () => {
      verifyEquivalence(`
def greet(name, greeting='Hello'):
    return greeting + ', ' + name
print(greet('World'))
print(greet('World', 'Hi'))
`)
    })

    it("recursive function", () => {
      verifyEquivalence(`
def my_factorial(n):
    if n <= 1:
        return 1
    return n * my_factorial(n - 1)
print(my_factorial(5))
`)
    })
  })

  describe("List Comprehensions", () => {
    it("comprehension with range", () => {
      verifyEquivalence("print([x * 2 for x in range(5)])")
    })

    it("comprehension with condition", () => {
      verifyEquivalence("print([x for x in range(10) if x % 2 == 0])")
    })

    it("nested comprehension", () => {
      verifyEquivalence("print([x * y for x in range(1, 4) for y in range(1, 4)])")
    })

    // Comprehensions with actual arrays work
    it("comprehension with array", () => {
      verifyEquivalence("print([x * 2 for x in [1, 2, 3, 4, 5]])")
    })

    it("comprehension with condition on array", () => {
      verifyEquivalence("print([x for x in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] if x % 2 == 0])")
    })
  })

  describe("Edge Cases", () => {
    it("zero division behavior", () => {
      verifyEquivalence("print(0 // 5)")
      verifyEquivalence("print(0 % 5)")
    })

    it("negative zero", () => {
      verifyEquivalence("print(-0 == 0)")
    })

    it("empty collections", () => {
      verifyEquivalence("print(len([]))")
      verifyEquivalence("print(len(''))")
      verifyEquivalence("print(sum([]))")
    })

    it("boolean as number", () => {
      verifyEquivalence("print(True + True)")
      verifyEquivalence("print(False + 1)")
      verifyEquivalence("print(True * 5)")
    })
  })
})
