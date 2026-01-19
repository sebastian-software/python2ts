import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { string } from "pythonlib"

describe("E2E: string module", () => {
  describe("Import Handling", () => {
    it("should strip import string", () => {
      const result = transpile("import string", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })

    it("should strip from string import", () => {
      const result = transpile("from string import asciiLowercase, Template", {
        includeRuntime: false
      })
      expect(result.trim()).toBe("")
    })
  })

  describe("Function Transformations", () => {
    it("should transform string.asciiLowercase", () => {
      const result = transpile("letters = string.asciiLowercase")
      expect(result).toContain('from "pythonlib/string"')
      expect(result).toContain("asciiLowercase")
    })

    it("should transform string.digits", () => {
      const result = transpile("nums = string.digits")
      expect(result).toContain('from "pythonlib/string"')
      expect(result).toContain("digits")
    })

    it("should transform Template", () => {
      const result = transpile("t = Template('Hello $name')")
      expect(result).toContain('from "pythonlib/string"')
      expect(result).toContain("new Template(")
    })

    it("should transform capwords", () => {
      const result = transpile("s = capwords('hello world')")
      expect(result).toContain('from "pythonlib/string"')
      expect(result).toContain("capWords(")
    })
  })

  describe("Runtime: String Constants", () => {
    it("asciiLowercase should be all lowercase letters", () => {
      expect(string.asciiLowercase).toBe("abcdefghijklmnopqrstuvwxyz")
    })

    it("asciiUppercase should be all uppercase letters", () => {
      expect(string.asciiUppercase).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    })

    it("asciiLetters should be all letters", () => {
      expect(string.asciiLetters).toBe("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
    })

    it("digits should be all digits", () => {
      expect(string.digits).toBe("0123456789")
    })

    it("hexDigits should be hex digits", () => {
      expect(string.hexDigits).toBe("0123456789abcdefABCDEF")
    })

    it("octDigits should be octal digits", () => {
      expect(string.octDigits).toBe("01234567")
    })

    it("punctuation should contain punctuation marks", () => {
      expect(string.punctuation).toContain("!")
      expect(string.punctuation).toContain(".")
      expect(string.punctuation).toContain(",")
    })

    it("whitespace should contain whitespace characters", () => {
      expect(string.whitespace).toContain(" ")
      expect(string.whitespace).toContain("\t")
      expect(string.whitespace).toContain("\n")
    })

    it("printable should contain all printable characters", () => {
      expect(string.printable).toContain("a")
      expect(string.printable).toContain("1")
      expect(string.printable).toContain("!")
      expect(string.printable).toContain(" ")
    })
  })

  describe("Runtime: Template class", () => {
    it("should substitute variables", () => {
      const t = new string.Template("Hello $name!")
      const result = t.substitute({ name: "World" })
      expect(result).toBe("Hello World!")
    })

    it("should substitute multiple variables", () => {
      const t = new string.Template("$greeting $name!")
      const result = t.substitute({ greeting: "Hello", name: "World" })
      expect(result).toBe("Hello World!")
    })

    it("should handle braced variables", () => {
      const t = new string.Template("Hello ${name}!")
      const result = t.substitute({ name: "World" })
      expect(result).toBe("Hello World!")
    })

    it("should escape dollar sign", () => {
      const t = new string.Template("Price: $$100")
      const result = t.substitute({})
      expect(result).toBe("Price: $100")
    })

    it("should throw on missing key", () => {
      const t = new string.Template("Hello $name!")
      expect(() => t.substitute({})).toThrow("KeyError")
    })

    it("safeSubstitute should not throw on missing key", () => {
      const t = new string.Template("Hello $name!")
      const result = t.safeSubstitute({})
      expect(result).toBe("Hello $name!")
    })

    it("should get identifiers", () => {
      const t = new string.Template("Hello $name, you have $count messages")
      const ids = t.getIdentifiers()
      expect(ids).toContain("name")
      expect(ids).toContain("count")
    })
  })

  describe("Runtime: capwords", () => {
    it("should capitalize words", () => {
      expect(string.capWords("hello world")).toBe("Hello World")
    })

    it("should handle multiple spaces", () => {
      expect(string.capWords("hello   world")).toBe("Hello   World")
    })

    it("should handle custom separator", () => {
      expect(string.capWords("hello-world", "-")).toBe("Hello-World")
    })

    it("should lowercase other letters", () => {
      expect(string.capWords("hELLO wORLD")).toBe("Hello World")
    })
  })
})
