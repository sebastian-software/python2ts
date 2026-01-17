import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { py } from "pythonlib"

describe("E2E: string module", () => {
  describe("Import Handling", () => {
    it("should strip import string", () => {
      const result = transpile("import string", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })

    it("should strip from string import", () => {
      const result = transpile("from string import ascii_lowercase, Template", {
        includeRuntime: false
      })
      expect(result.trim()).toBe("")
    })
  })

  describe("Function Transformations", () => {
    it("should transform string.ascii_lowercase", () => {
      const result = transpile("letters = string.ascii_lowercase", { includeRuntime: false })
      expect(result).toContain("py.ascii_lowercase")
    })

    it("should transform string.digits", () => {
      const result = transpile("nums = string.digits", { includeRuntime: false })
      expect(result).toContain("py.digits")
    })

    it("should transform Template", () => {
      const result = transpile("t = Template('Hello $name')", { includeRuntime: false })
      expect(result).toContain("new py.Template")
    })

    it("should transform capwords", () => {
      const result = transpile("s = capwords('hello world')", { includeRuntime: false })
      expect(result).toContain("py.capwords")
    })
  })

  describe("Runtime: String Constants", () => {
    it("ascii_lowercase should be all lowercase letters", () => {
      expect(py.ascii_lowercase).toBe("abcdefghijklmnopqrstuvwxyz")
    })

    it("ascii_uppercase should be all uppercase letters", () => {
      expect(py.ascii_uppercase).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    })

    it("ascii_letters should be all letters", () => {
      expect(py.ascii_letters).toBe("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
    })

    it("digits should be all digits", () => {
      expect(py.digits).toBe("0123456789")
    })

    it("hexdigits should be hex digits", () => {
      expect(py.hexdigits).toBe("0123456789abcdefABCDEF")
    })

    it("octdigits should be octal digits", () => {
      expect(py.octdigits).toBe("01234567")
    })

    it("punctuation should contain punctuation marks", () => {
      expect(py.punctuation).toContain("!")
      expect(py.punctuation).toContain(".")
      expect(py.punctuation).toContain(",")
    })

    it("whitespace should contain whitespace characters", () => {
      expect(py.whitespace).toContain(" ")
      expect(py.whitespace).toContain("\t")
      expect(py.whitespace).toContain("\n")
    })

    it("printable should contain all printable characters", () => {
      expect(py.printable).toContain("a")
      expect(py.printable).toContain("1")
      expect(py.printable).toContain("!")
      expect(py.printable).toContain(" ")
    })
  })

  describe("Runtime: Template class", () => {
    it("should substitute variables", () => {
      const t = new py.Template("Hello $name!")
      const result = t.substitute({ name: "World" })
      expect(result).toBe("Hello World!")
    })

    it("should substitute multiple variables", () => {
      const t = new py.Template("$greeting $name!")
      const result = t.substitute({ greeting: "Hello", name: "World" })
      expect(result).toBe("Hello World!")
    })

    it("should handle braced variables", () => {
      const t = new py.Template("Hello ${name}!")
      const result = t.substitute({ name: "World" })
      expect(result).toBe("Hello World!")
    })

    it("should escape dollar sign", () => {
      const t = new py.Template("Price: $$100")
      const result = t.substitute({})
      expect(result).toBe("Price: $100")
    })

    it("should throw on missing key", () => {
      const t = new py.Template("Hello $name!")
      expect(() => t.substitute({})).toThrow("KeyError")
    })

    it("safe_substitute should not throw on missing key", () => {
      const t = new py.Template("Hello $name!")
      const result = t.safe_substitute({})
      expect(result).toBe("Hello $name!")
    })

    it("should get identifiers", () => {
      const t = new py.Template("Hello $name, you have $count messages")
      const ids = t.get_identifiers()
      expect(ids).toContain("name")
      expect(ids).toContain("count")
    })
  })

  describe("Runtime: capwords", () => {
    it("should capitalize words", () => {
      expect(py.capwords("hello world")).toBe("Hello World")
    })

    it("should handle multiple spaces", () => {
      expect(py.capwords("hello   world")).toBe("Hello   World")
    })

    it("should handle custom separator", () => {
      expect(py.capwords("hello-world", "-")).toBe("Hello-World")
    })

    it("should lowercase other letters", () => {
      expect(py.capwords("hELLO wORLD")).toBe("Hello World")
    })
  })
})
