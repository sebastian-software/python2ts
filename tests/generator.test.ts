import { describe, it, expect } from "vitest"
import { generate, transpile } from "python2ts"

describe("Generator", () => {
  describe("generate()", () => {
    it("should return generated code structure", () => {
      const result = generate("x = 42")
      expect(result).toHaveProperty("code")
      expect(result).toHaveProperty("runtimeImport")
      expect(result).toHaveProperty("usedRuntimeFunctions")
    })

    it("should include runtime import when runtime functions are used", () => {
      const result = generate("x = 10 // 3")
      expect(result.runtimeImport).toContain("import { py }")
      expect(result.code).toContain("import { py }")
    })

    it("should not include runtime import when no runtime functions are used", () => {
      const result = generate("x = 1 + 2")
      expect(result.runtimeImport).toBeNull()
    })

    it("should track used runtime functions", () => {
      const result = generate("x = 10 // 3\ny = len([1, 2])")
      expect(result.usedRuntimeFunctions).toContain("floordiv")
      expect(result.usedRuntimeFunctions).toContain("len")
    })

    it("should use custom runtime import path", () => {
      const result = generate("x = 10 // 3", { runtimeImportPath: "./my-runtime" })
      expect(result.runtimeImport).toContain("./my-runtime")
    })

    it("should optionally exclude runtime import", () => {
      const result = generate("x = 10 // 3", { includeRuntime: false })
      expect(result.runtimeImport).toBeNull()
      expect(result.code).not.toContain("import")
    })
  })

  describe("transpile()", () => {
    it("should return code string directly", () => {
      const result = transpile("x = 42")
      expect(typeof result).toBe("string")
      expect(result).toContain("let x = 42")
    })

    it("should include runtime import by default", () => {
      const result = transpile("x = len([1, 2, 3])")
      expect(result).toContain("import { py }")
      expect(result).toContain("py.len")
    })
  })

  describe("End-to-End transformations", () => {
    it("should generate valid TypeScript for simple assignment", () => {
      const ts = transpile("x = 42", { includeRuntime: false })
      expect(ts).toBe("let x = 42;")
    })

    it("should generate valid TypeScript for print", () => {
      const ts = transpile('print("Hello, World!")', { includeRuntime: false })
      expect(ts).toBe('console.log("Hello, World!");')
    })

    it("should generate valid TypeScript for arithmetic", () => {
      const ts = transpile("result = 1 + 2 * 3", { includeRuntime: false })
      expect(ts).toContain("let result = ")
    })

    it("should generate valid TypeScript for function definition", () => {
      const ts = transpile("def greet(name):\n    print(name)", { includeRuntime: false })
      expect(ts).toContain("function greet(name)")
      expect(ts).toContain("console.log(name)")
    })

    it("should generate valid TypeScript for if-else", () => {
      const ts = transpile("if x > 0:\n    y = 1\nelse:\n    y = -1", { includeRuntime: false })
      expect(ts).toContain("if ((x > 0))")
      expect(ts).toContain("else")
    })

    it("should generate valid TypeScript for for-loop with range", () => {
      const ts = transpile("for i in range(10):\n    print(i)")
      expect(ts).toContain("for (const i of py.range(10))")
    })

    it("should generate valid TypeScript for while-loop", () => {
      const ts = transpile("while x > 0:\n    x = x - 1", { includeRuntime: false })
      expect(ts).toContain("while ((x > 0))")
    })

    it("should generate valid TypeScript for list operations", () => {
      const ts = transpile("items = [1, 2, 3]\nn = len(items)")
      expect(ts).toContain("[1, 2, 3]")
      expect(ts).toContain("py.len(items)")
    })

    it("should generate valid TypeScript for multiple statements", () => {
      const python = `
x = 10
y = 20
z = x + y
print(z)
`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("let x = 10")
      expect(ts).toContain("let y = 20")
      expect(ts).toContain("let z = (x + y)")
      expect(ts).toContain("console.log(z)")
    })
  })

  describe("Runtime Import Options", () => {
    it("should use default runtime import path when includeRuntime is true but runtimeImportPath is not set", () => {
      const result = transpile("print(len([1, 2, 3]))", { includeRuntime: true })
      expect(result).toContain("import { py }")
      expect(result).toContain("pythonlib")
    })

    it("should use custom runtime import path when specified", () => {
      const result = transpile("print(len([1, 2, 3]))", {
        includeRuntime: true,
        runtimeImportPath: "./my-runtime"
      })
      expect(result).toContain("import { py }")
      expect(result).toContain("my-runtime")
    })
  })
})
