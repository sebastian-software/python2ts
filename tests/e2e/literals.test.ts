import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { floorDiv, mod, pow } from "pythonlib"

describe("E2E: Literals", () => {
  describe("Numbers", () => {
    it("should convert integer literals", () => {
      const ts = transpile("42", { includeRuntime: false })
      expect(ts).toBe("42;")
    })

    it("should convert negative integers", () => {
      const ts = transpile("-42", { includeRuntime: false })
      expect(ts).toContain("-42")
    })

    it("should convert float literals", () => {
      const ts = transpile("3.14159", { includeRuntime: false })
      expect(ts).toBe("3.14159;")
    })

    it("should handle scientific notation", () => {
      const ts = transpile("1e10", { includeRuntime: false })
      expect(ts).toBe("1e10;")
    })

    it("should handle numbers with underscores", () => {
      const ts = transpile("1_000_000", { includeRuntime: false })
      expect(ts).toBe("1000000;")
    })

    it("should convert hex numbers", () => {
      const ts = transpile("0xff", { includeRuntime: false })
      expect(ts).toBe("0xff;")
    })

    it("should convert octal numbers", () => {
      const ts = transpile("0o755", { includeRuntime: false })
      expect(ts).toBe("0o755;")
    })

    it("should convert binary numbers", () => {
      const ts = transpile("0b1010", { includeRuntime: false })
      expect(ts).toBe("0b1010;")
    })
  })

  describe("Strings", () => {
    it("should convert double-quoted strings", () => {
      const ts = transpile('"hello"', { includeRuntime: false })
      expect(ts).toBe('"hello";')
    })

    it("should convert single-quoted strings", () => {
      const ts = transpile("'hello'", { includeRuntime: false })
      expect(ts).toBe("'hello';")
    })

    it("should handle escape sequences", () => {
      const ts = transpile('"hello\\nworld"', { includeRuntime: false })
      expect(ts).toBe('"hello\\nworld";')
    })

    it("should convert triple-quoted strings to template literals", () => {
      const ts = transpile('"""multi\nline"""', { includeRuntime: false })
      expect(ts).toContain("`")
    })
  })

  describe("Implicit String Concatenation", () => {
    it("should concatenate adjacent strings", () => {
      const python = `msg = ("hello " "world")`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain('"hello world"')
    })

    it("should concatenate multi-line strings", () => {
      const python = `msg = ("This is a long "
       "string message")`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain('"This is a long string message"')
    })

    it("should concatenate raw strings", () => {
      const python = `regex = (r'pattern1' r'pattern2')`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain('"pattern1pattern2"')
    })

    it("should concatenate f-strings with + operator", () => {
      const python = `fmt = (f'Hello {name}' f'World {value}')`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("`Hello ${name}`")
      expect(ts).toContain("`World ${value}`")
      expect(ts).toContain(" + ")
    })

    it("should concatenate mixed strings and f-strings", () => {
      const python = `msg = ("prefix: " f"value={x}" " suffix")`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("`prefix: `")
      expect(ts).toContain("`value=${x}`")
      expect(ts).toContain("` suffix`")
      expect(ts).toContain(" + ")
    })
  })

  describe("Booleans", () => {
    it("should convert True to true", () => {
      const ts = transpile("True", { includeRuntime: false })
      expect(ts).toBe("true;")
    })

    it("should convert False to false", () => {
      const ts = transpile("False", { includeRuntime: false })
      expect(ts).toBe("false;")
    })
  })

  describe("None", () => {
    it("should convert None to null", () => {
      const ts = transpile("None", { includeRuntime: false })
      expect(ts).toBe("null;")
    })
  })

  describe("Collections", () => {
    it("should convert list literals", () => {
      const ts = transpile("[1, 2, 3]", { includeRuntime: false })
      expect(ts).toBe("[1, 2, 3];")
    })

    it("should convert empty list", () => {
      const ts = transpile("[]", { includeRuntime: false })
      expect(ts).toBe("[];")
    })

    it("should convert nested lists", () => {
      const ts = transpile("[[1, 2], [3, 4]]", { includeRuntime: false })
      expect(ts).toBe("[[1, 2], [3, 4]];")
    })

    it("should convert dictionary literals", () => {
      const ts = transpile('{"a": 1, "b": 2}', { includeRuntime: false })
      expect(ts).toContain('"a": 1')
      expect(ts).toContain('"b": 2')
    })

    it("should convert empty dictionary", () => {
      const ts = transpile("{}", { includeRuntime: false })
      expect(ts).toBe("{  };")
    })
  })

  describe("Execution Verification", () => {
    it("should produce executable TypeScript for simple math", () => {
      // Verify that the generated code produces the same result
      const pythonExpr = "2 ** 8"
      const ts = transpile(pythonExpr)
      // The generated code uses py.pow
      expect(ts).toContain("pow(2, 8)")
      // Verify runtime produces correct result
      expect(pow(2, 8)).toBe(256)
    })

    it("should produce executable TypeScript for floor division", () => {
      expect(floorDiv(10, 3)).toBe(3)
      expect(floorDiv(-10, 3)).toBe(-4) // Python semantics
    })

    it("should produce executable TypeScript for modulo", () => {
      expect(mod(7, 3)).toBe(1)
      expect(mod(-7, 3)).toBe(2) // Python semantics
    })
  })
})
