import { describe, it, expect } from "vitest"
import {
  parse,
  transform,
  generate,
  transpile,
  debugTree,
  getNodeText,
  getChildren
} from "python2ts"
import { floorDiv, mod, slice, range, len, int, float, str, bool } from "pythonlib"
import { pow } from "pythonlib"

describe("Integration Tests", () => {
  describe("Main exports", () => {
    it("should export parse function", () => {
      expect(typeof parse).toBe("function")
    })

    it("should export transform function", () => {
      expect(typeof transform).toBe("function")
    })

    it("should export generate function", () => {
      expect(typeof generate).toBe("function")
    })

    it("should export transpile function", () => {
      expect(typeof transpile).toBe("function")
    })

    it("should export debugTree function", () => {
      expect(typeof debugTree).toBe("function")
    })

    it("should export getNodeText function", () => {
      expect(typeof getNodeText).toBe("function")
    })

    it("should export getChildren function", () => {
      expect(typeof getChildren).toBe("function")
    })
  })

  describe("End-to-end pipeline", () => {
    it("should parse, transform, and generate code", () => {
      const python = "x = 1 + 2"

      // Parse
      const parseResult = parse(python)
      expect(parseResult.tree).toBeDefined()
      expect(parseResult.source).toBe(python)

      // Transform
      const transformResult = transform(parseResult)
      expect(transformResult.code).toBeDefined()

      // Generate
      const generateResult = generate(python)
      expect(generateResult.code).toBeDefined()

      // Transpile (shortcut)
      const code = transpile(python)
      expect(code).toContain("let x = (1 + 2)")
    })

    it("should handle complex Python code", () => {
      const python = `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

result = fibonacci(10)
print(result)
`

      const ts = transpile(python, { includeRuntime: false })

      expect(ts).toContain("function fibonacci(n)")
      expect(ts).toContain("if (n <= 1)")
      expect(ts).toContain("return n")
      expect(ts).toContain("return (fibonacci((n - 1)) + fibonacci((n - 2)))")
      expect(ts).toContain("let result = fibonacci(10)")
      expect(ts).toContain("console.log(result)")
    })

    it("should track runtime dependencies correctly", () => {
      const python = `
x = 10 // 3
y = 2 ** 8
z = len([1, 2, 3])
for i in range(10):
    print(i)
`

      const result = generate(python)

      expect(result.usedRuntimeFunctions).toContain("floorDiv")
      expect(result.usedRuntimeFunctions).toContain("pow")
      expect(result.usedRuntimeFunctions).toContain("len")
      expect(result.usedRuntimeFunctions).toContain("range")
    })

    it("should include runtime import when needed", () => {
      const python = "x = len([1, 2, 3])"
      const result = generate(python)

      expect(result.runtimeImport).not.toBeNull()
      expect(result.code).toContain("import { len }")
    })

    it("should not include runtime import when not needed", () => {
      const python = "x = 1 + 2"
      const result = generate(python)

      expect(result.runtimeImport).toBeNull()
      expect(result.code).not.toContain("import")
    })
  })

  describe("Runtime verification", () => {
    it("should execute Python semantics correctly", () => {
      // Test floor division
      expect(floorDiv(7, 2)).toBe(3)
      expect(floorDiv(-7, 2)).toBe(-4) // Python rounds towards -infinity

      // Test modulo
      expect(mod(-7, 3)).toBe(2) // Python semantics

      // Test power
      expect(pow(2, 10)).toBe(1024)

      // Test slicing
      const arr = [0, 1, 2, 3, 4]
      expect(slice(arr, 1, 4)).toEqual([1, 2, 3])
      expect(slice(arr, -2)).toEqual([3, 4])
      expect(slice(arr, undefined, undefined, -1)).toEqual([4, 3, 2, 1, 0])

      // Test range
      expect([...range(5)]).toEqual([0, 1, 2, 3, 4])
      expect([...range(2, 5)]).toEqual([2, 3, 4])
      expect([...range(0, 10, 2)]).toEqual([0, 2, 4, 6, 8])

      // Test collections
      expect(len([1, 2, 3])).toBe(3)
      expect(len("hello")).toBe(5)

      // Test conversions
      expect(int("42")).toBe(42)
      expect(float("3.14")).toBe(3.14)
      expect(str(42)).toBe("42")
      expect(bool(0)).toBe(false)
      expect(bool(1)).toBe(true)
    })
  })

  describe("Parser utilities", () => {
    it("should provide debug tree output", () => {
      const result = parse("x = 1 + 2")
      const debug = debugTree(result.tree, result.source)

      expect(debug).toContain("Script")
      expect(debug).toContain("AssignStatement")
      expect(debug).toContain("BinaryExpression")
    })

    it("should get node text correctly", () => {
      const result = parse("hello")
      const text = getNodeText(result.tree.topNode, result.source)
      expect(text).toBe("hello")
    })

    it("should get children correctly", () => {
      const result = parse("x = 1")
      const children = getChildren(result.tree.topNode)
      expect(children.length).toBeGreaterThan(0)
    })
  })
})
