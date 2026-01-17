import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import * as pythonlib from "pythonlib"
const {
  py,
  len,
  range,
  floordiv,
  mod,
  pow,
  slice,
  at,
  contains,
  repeatValue,
  string,
  list,
  dict,
  set,
  tuple,
  itertools,
  functools,
  math,
  random,
  json,
  os,
  datetime,
  re,
  collections,
  enumerate,
  zip,
  sorted,
  reversed,
  map,
  filter,
  min,
  max,
  sum,
  abs,
  all,
  any,
  int,
  float,
  str,
  bool,
  repr,
  round,
  ord,
  chr,
  hex,
  oct,
  bin,
  isinstance,
  type,
  format,
  ascii
} = pythonlib

describe("E2E: F-Strings", () => {
  describe("Basic F-Strings", () => {
    it("should convert simple f-string", () => {
      const python = `x = f"Hello {name}"`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let x = \`Hello \${name}\`;"`
      )
    })

    it("should convert f-string with expression", () => {
      const python = `x = f"Value: {x + 1}"`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let x = \`Value: \${(x + 1)}\`;"`
      )
    })

    it("should convert f-string with multiple replacements", () => {
      const python = `x = f"Hello {first} and {second}"`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let x = \`Hello \${first} and \${second}\`;"`
      )
    })

    it("should convert f-string with single quotes", () => {
      const python = `x = f'Hello {name}'`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let x = \`Hello \${name}\`;"`
      )
    })
  })

  describe("Escaped Braces", () => {
    it("should handle escaped braces", () => {
      const python = `x = f"{{escaped}}"`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let x = \`{escaped}\`;"`
      )
    })

    it("should handle mixed escaped and replacements", () => {
      const python = `x = f"{{literal}} {var} {{another}}"`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let x = \`{literal} \${var} {another}\`;"`
      )
    })
  })

  describe("Format Specifiers", () => {
    it("should convert f-string with float precision", () => {
      const python = `x = f"{value:.2f}"`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { format } from "pythonlib"

        let x = \`\${format(value, ".2f")}\`;"
      `)
    })

    it("should convert f-string with width", () => {
      const python = `x = f"{value:10}"`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { format } from "pythonlib"

        let x = \`\${format(value, "10")}\`;"
      `)
    })

    it("should convert f-string with alignment", () => {
      const python = `x = f"{value:>10}"`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { format } from "pythonlib"

        let x = \`\${format(value, ">10")}\`;"
      `)
    })

    it("should convert f-string with center alignment", () => {
      const python = `x = f"{value:^10}"`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { format } from "pythonlib"

        let x = \`\${format(value, "^10")}\`;"
      `)
    })
  })

  describe("Conversion Flags", () => {
    it("should convert f-string with !r (repr)", () => {
      const python = `x = f"{name!r}"`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { repr } from "pythonlib"

        let x = \`\${repr(name)}\`;"
      `)
    })

    it("should convert f-string with !s (str)", () => {
      const python = `x = f"{value!s}"`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { str } from "pythonlib"

        let x = \`\${str(value)}\`;"
      `)
    })

    it("should convert f-string with !a (ascii)", () => {
      const python = `x = f"{text!a}"`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { ascii } from "pythonlib"

        let x = \`\${ascii(text)}\`;"
      `)
    })
  })

  describe("Complex Expressions", () => {
    it("should handle method calls in f-string", () => {
      const python = `x = f"Result: {obj.method()}"`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let x = \`Result: \${obj.method()}\`;"`
      )
    })

    it("should handle nested expressions", () => {
      const python = `x = f"Sum: {a + b + c}"`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let x = \`Sum: \${((a + b) + c)}\`;"`
      )
    })

    it("should handle function calls in f-string", () => {
      const python = `x = f"Length: {len(items)}"`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { len } from "pythonlib"

        let x = \`Length: \${len(items)}\`;"
      `)
    })
  })

  describe("Real-world Examples", () => {
    it("should convert greeting message", () => {
      const python = `message = f"Hello, {name}! You have {count} messages."`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let message = \`Hello, \${name}! You have \${count} messages.\`;"`
      )
    })

    it("should convert formatted number output", () => {
      const python = 'output = f"Price: {price:.2f}"'
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { format } from "pythonlib"

        let output = \`Price: \${format(price, ".2f")}\`;"
      `)
    })

    it("should convert debug output with repr", () => {
      const python = `debug = f"Value of x: {x!r}"`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { repr } from "pythonlib"

        let debug = \`Value of x: \${repr(x)}\`;"
      `)
    })
  })
})

describe("Runtime: format()", () => {
  describe("String formatting", () => {
    it("should format string with width", () => {
      expect(format("hello", "10")).toBe("     hello")
    })

    it("should format string with left alignment", () => {
      expect(format("hello", "<10")).toBe("hello     ")
    })

    it("should format string with center alignment", () => {
      expect(format("hello", "^10")).toBe("  hello   ")
    })

    it("should format string with precision (truncation)", () => {
      expect(format("hello world", ".5s")).toBe("hello")
    })
  })

  describe("Integer formatting", () => {
    it("should format integer with width", () => {
      expect(format(42, "5d")).toBe("   42")
    })

    it("should format integer with zero padding", () => {
      expect(format(42, "05d")).toBe("00042")
    })

    it("should format integer with sign", () => {
      expect(format(42, "+d")).toBe("+42")
      expect(format(-42, "+d")).toBe("-42")
    })

    it("should format integer as hex", () => {
      expect(format(255, "x")).toBe("ff")
      expect(format(255, "X")).toBe("FF")
      expect(format(255, "#x")).toBe("0xff")
    })

    it("should format integer as binary", () => {
      expect(format(10, "b")).toBe("1010")
      expect(format(10, "#b")).toBe("0b1010")
    })

    it("should format integer as octal", () => {
      expect(format(64, "o")).toBe("100")
      expect(format(64, "#o")).toBe("0o100")
    })
  })

  describe("Float formatting", () => {
    it("should format float with precision", () => {
      expect(format(3.14159, ".2f")).toBe("3.14")
      expect(format(3.14159, ".4f")).toBe("3.1416")
    })

    it("should format float with width and precision", () => {
      expect(format(3.14, "8.2f")).toBe("    3.14")
    })

    it("should format float in exponential notation", () => {
      expect(format(1234.5, ".2e")).toBe("1.23e+3")
      expect(format(1234.5, ".2E")).toBe("1.23E+3")
    })

    it("should format float as percentage", () => {
      expect(format(0.25, ".0%")).toBe("25%")
      expect(format(0.256, ".1%")).toBe("25.6%")
    })
  })

  describe("Grouping", () => {
    it("should format number with comma grouping", () => {
      expect(format(1234567, ",d")).toBe("1,234,567")
    })

    it("should format number with underscore grouping", () => {
      expect(format(1234567, "_d")).toBe("1_234_567")
    })
  })
})

describe("Runtime: ascii()", () => {
  it("should return ASCII string unchanged", () => {
    expect(ascii("hello")).toBe("'hello'")
  })

  it("should escape non-ASCII characters", () => {
    expect(ascii("cafe")).toBe("'cafe'")
  })
})

describe("Runtime: repr()", () => {
  it("should add quotes to strings", () => {
    expect(repr("hello")).toBe("'hello'")
  })

  it("should convert numbers", () => {
    expect(repr(42)).toBe("42")
  })

  it("should convert booleans Python-style", () => {
    expect(repr(true)).toBe("True")
    expect(repr(false)).toBe("False")
  })

  it("should convert null to None", () => {
    expect(repr(null)).toBe("None")
  })
})
