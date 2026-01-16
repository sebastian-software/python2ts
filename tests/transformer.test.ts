import { describe, it, expect } from "vitest"
import { transform } from "../src/transformer/index.js"

describe("Transformer", () => {
  describe("Literals", () => {
    it("should transform integers", () => {
      const result = transform("42")
      expect(result.code).toBe("42;")
    })

    it("should transform floats", () => {
      const result = transform("3.14")
      expect(result.code).toBe("3.14;")
    })

    it("should transform True to true", () => {
      const result = transform("True")
      expect(result.code).toBe("true;")
    })

    it("should transform False to false", () => {
      const result = transform("False")
      expect(result.code).toBe("false;")
    })

    it("should transform None to null", () => {
      const result = transform("None")
      expect(result.code).toBe("null;")
    })

    it("should transform strings", () => {
      const result = transform('"hello"')
      expect(result.code).toBe('"hello";')
    })

    it("should handle numbers with underscores", () => {
      const result = transform("1_000_000")
      expect(result.code).toBe("1000000;")
    })

    it("should handle triple-quoted strings", () => {
      const result = transform('"""multi\nline"""')
      expect(result.code).toContain("`")
    })
  })

  describe("Variables and Assignments", () => {
    it("should transform simple assignment", () => {
      const result = transform("x = 42")
      expect(result.code).toBe("let x = 42;")
    })

    it("should transform variable names", () => {
      const result = transform("my_var")
      expect(result.code).toBe("my_var;")
    })
  })

  describe("Arithmetic Operators", () => {
    it("should transform addition", () => {
      const result = transform("1 + 2")
      expect(result.code).toBe("(1 + 2);")
    })

    it("should transform subtraction", () => {
      const result = transform("5 - 3")
      expect(result.code).toBe("(5 - 3);")
    })

    it("should transform multiplication", () => {
      const result = transform("4 * 2")
      expect(result.code).toBe("(4 * 2);")
    })

    it("should transform division", () => {
      const result = transform("10 / 2")
      expect(result.code).toBe("(10 / 2);")
    })

    it("should transform floor division to py.floordiv", () => {
      const result = transform("10 // 3")
      expect(result.code).toBe("py.floordiv(10, 3);")
      expect(result.usesRuntime.has("floordiv")).toBe(true)
    })

    it("should transform power to py.pow", () => {
      const result = transform("2 ** 8")
      expect(result.code).toBe("py.pow(2, 8);")
      expect(result.usesRuntime.has("pow")).toBe(true)
    })

    it("should transform modulo to py.mod", () => {
      const result = transform("7 % 3")
      expect(result.code).toBe("py.mod(7, 3);")
      expect(result.usesRuntime.has("mod")).toBe(true)
    })
  })

  describe("Comparison Operators", () => {
    it("should transform equality", () => {
      const result = transform("x == y")
      expect(result.code).toBe("(x == y);")
    })

    it("should transform inequality", () => {
      const result = transform("x != y")
      expect(result.code).toBe("(x != y);")
    })

    it("should transform less than", () => {
      const result = transform("x < y")
      expect(result.code).toBe("(x < y);")
    })

    it("should transform greater than", () => {
      const result = transform("x > y")
      expect(result.code).toBe("(x > y);")
    })

    it("should transform less than or equal", () => {
      const result = transform("x <= y")
      expect(result.code).toBe("(x <= y);")
    })

    it("should transform greater than or equal", () => {
      const result = transform("x >= y")
      expect(result.code).toBe("(x >= y);")
    })
  })

  describe("Logical Operators", () => {
    it("should transform and to &&", () => {
      const result = transform("x and y")
      expect(result.code).toBe("(x && y);")
    })

    it("should transform or to ||", () => {
      const result = transform("x or y")
      expect(result.code).toBe("(x || y);")
    })

    it("should transform not to !", () => {
      const result = transform("not x")
      expect(result.code).toBe("(!x);")
    })
  })

  describe("Built-in Functions", () => {
    it("should transform print to console.log", () => {
      const result = transform('print("hello")')
      expect(result.code).toBe('console.log("hello");')
    })

    it("should transform len to py.len", () => {
      const result = transform("len([1, 2, 3])")
      expect(result.code).toContain("py.len")
      expect(result.usesRuntime.has("len")).toBe(true)
    })

    it("should transform range to py.range", () => {
      const result = transform("range(10)")
      expect(result.code).toContain("py.range")
      expect(result.usesRuntime.has("range")).toBe(true)
    })

    it("should transform int to py.int", () => {
      const result = transform('int("42")')
      expect(result.code).toContain("py.int")
      expect(result.usesRuntime.has("int")).toBe(true)
    })

    it("should transform str to py.str", () => {
      const result = transform("str(42)")
      expect(result.code).toContain("py.str")
      expect(result.usesRuntime.has("str")).toBe(true)
    })

    it("should transform abs to py.abs", () => {
      const result = transform("abs(-5)")
      expect(result.code).toContain("py.abs")
      expect(result.usesRuntime.has("abs")).toBe(true)
    })

    it("should transform min to py.min", () => {
      const result = transform("min(1, 2, 3)")
      expect(result.code).toContain("py.min")
      expect(result.usesRuntime.has("min")).toBe(true)
    })

    it("should transform max to py.max", () => {
      const result = transform("max(1, 2, 3)")
      expect(result.code).toContain("py.max")
      expect(result.usesRuntime.has("max")).toBe(true)
    })
  })

  describe("Control Flow", () => {
    it("should transform if statement", () => {
      const result = transform("if x:\n    y = 1")
      expect(result.code).toContain("if (x)")
      expect(result.code).toContain("{")
      expect(result.code).toContain("}")
    })

    it("should transform if-else statement", () => {
      const result = transform("if x:\n    y = 1\nelse:\n    y = 2")
      expect(result.code).toContain("if (x)")
      expect(result.code).toContain("else")
    })

    it("should transform while loop", () => {
      const result = transform("while x > 0:\n    x = x - 1")
      expect(result.code).toContain("while")
      expect(result.code).toContain("(x > 0)")
    })

    it("should transform for loop", () => {
      const result = transform("for i in items:\n    print(i)")
      expect(result.code).toContain("for (const i of items)")
    })

    it("should transform break", () => {
      const result = transform("while True:\n    break")
      expect(result.code).toContain("break;")
    })

    it("should transform continue", () => {
      const result = transform("while True:\n    continue")
      expect(result.code).toContain("continue;")
    })

    it("should transform pass to comment", () => {
      const result = transform("if x:\n    pass")
      expect(result.code).toContain("/* pass */")
    })
  })

  describe("Functions", () => {
    it("should transform function definition", () => {
      const result = transform("def foo():\n    return 42")
      expect(result.code).toContain("function foo()")
      expect(result.code).toContain("return 42")
    })

    it("should transform function with parameters", () => {
      const result = transform("def add(a, b):\n    return a + b")
      expect(result.code).toContain("function add(a, b)")
    })

    it("should transform return statement", () => {
      const result = transform("def foo():\n    return")
      expect(result.code).toContain("return;")
    })

    it("should transform return with value", () => {
      const result = transform("def foo():\n    return 42")
      expect(result.code).toContain("return 42;")
    })
  })

  describe("Collections", () => {
    it("should transform lists", () => {
      const result = transform("[1, 2, 3]")
      expect(result.code).toBe("[1, 2, 3];")
    })

    it("should transform empty list", () => {
      const result = transform("[]")
      expect(result.code).toBe("[];")
    })

    it("should transform dictionaries", () => {
      const result = transform('{"a": 1}')
      expect(result.code).toContain('"a": 1')
    })
  })

  describe("Comments", () => {
    it("should transform Python comments to JS comments", () => {
      const result = transform("# this is a comment\nx = 1")
      expect(result.code).toContain("// this is a comment")
    })
  })

  describe("Runtime tracking", () => {
    it("should track used runtime functions", () => {
      const result = transform("x = 10 // 3\ny = len([1,2,3])")
      expect(result.usesRuntime.has("floordiv")).toBe(true)
      expect(result.usesRuntime.has("len")).toBe(true)
    })
  })
})
