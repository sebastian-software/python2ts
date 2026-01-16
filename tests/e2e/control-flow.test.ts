import { describe, it, expect } from "vitest"
import { transpile } from "../../src/generator/index.js"

describe("E2E: Control Flow", () => {
  describe("If Statements", () => {
    it("should convert simple if", () => {
      const python = `if x > 0:
    y = 1`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("if ((x > 0))")
      expect(ts).toContain("let y = 1;")
    })

    it("should convert if-else", () => {
      const python = `if x > 0:
    y = 1
else:
    y = -1`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("if ((x > 0))")
      expect(ts).toContain("else")
    })

    it("should convert if-elif-else", () => {
      const python = `if x > 0:
    y = 1
elif x < 0:
    y = -1
else:
    y = 0`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("if ((x > 0))")
      expect(ts).toContain("else if ((x < 0))")
      expect(ts).toContain("else")
    })

    it("should handle nested if statements", () => {
      const python = `if x > 0:
    if y > 0:
        z = 1`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("if ((x > 0))")
      expect(ts).toContain("if ((y > 0))")
    })
  })

  describe("While Loops", () => {
    it("should convert while loop", () => {
      const python = `while x > 0:
    x = x - 1`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("while ((x > 0))")
      expect(ts).toContain("let x = (x - 1);")
    })

    it("should convert while True", () => {
      const python = `while True:
    break`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("while (true)")
      expect(ts).toContain("break;")
    })

    it("should handle break statement", () => {
      const python = `while True:
    if done:
        break`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("break;")
    })

    it("should handle continue statement", () => {
      const python = `while True:
    if skip:
        continue`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("continue;")
    })
  })

  describe("For Loops", () => {
    it("should convert for-in loop", () => {
      const python = `for item in items:
    print(item)`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("for (const item of items)")
    })

    it("should convert for-range loop", () => {
      const python = `for i in range(10):
    print(i)`
      const ts = transpile(python)
      expect(ts).toContain("for (const i of py.range(10))")
    })

    it("should convert for-enumerate loop", () => {
      const python = `for i, item in enumerate(items):
    print(i, item)`
      const ts = transpile(python)
      expect(ts).toContain("for (const [i, item] of py.enumerate(items))")
    })

    it("should handle tuple unpacking in for loop", () => {
      const python = `for x, y in pairs:
    print(x, y)`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("for (const [x, y] of pairs)")
    })

    it("should handle nested tuple unpacking in for loop", () => {
      const python = `for i, (a, b) in items:
    print(i, a, b)`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("for (const [i, [a, b]] of items)")
    })

    it("should handle triple unpacking", () => {
      const python = `for a, b, c in triples:
    print(a, b, c)`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("for (const [a, b, c] of triples)")
    })

    it("should handle dict.items() unpacking", () => {
      const python = `for key, value in d.items():
    print(key, value)`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("for (const [key, value] of d.items())")
    })

    it("should handle zip unpacking", () => {
      const python = `for a, b in zip(list1, list2):
    print(a, b)`
      const ts = transpile(python)
      expect(ts).toContain("for (const [a, b] of py.zip(list1, list2))")
    })

    it("should handle break in for loop", () => {
      const python = `for i in items:
    if found:
        break`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("break;")
    })

    it("should handle continue in for loop", () => {
      const python = `for i in items:
    if skip:
        continue`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("continue;")
    })
  })

  describe("Pass Statement", () => {
    it("should convert pass to comment", () => {
      const python = `if x:
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("/* pass */")
    })

    it("should convert pass in function", () => {
      const python = `def foo():
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("/* pass */")
    })
  })

  describe("Conditional Expressions (Ternary)", () => {
    it("should convert conditional expression", () => {
      const python = "y = 1 if x > 0 else -1"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("?")
      expect(ts).toContain(":")
    })
  })

  describe("Nested Control Flow", () => {
    it("should handle nested loops", () => {
      const python = `for i in range(3):
    for j in range(3):
        print(i, j)`
      const ts = transpile(python)
      expect(ts).toContain("for (const i of py.range(3))")
      expect(ts).toContain("for (const j of py.range(3))")
    })

    it("should handle loop inside if", () => {
      const python = `if items:
    for item in items:
        print(item)`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("if (items)")
      expect(ts).toContain("for (const item of items)")
    })

    it("should handle if inside loop", () => {
      const python = `for item in items:
    if item > 0:
        print(item)`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("for (const item of items)")
      expect(ts).toContain("if ((item > 0))")
    })
  })
})
