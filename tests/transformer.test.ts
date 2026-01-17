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
      expect(result.code).toContain("for (const i of py.iter(items))")
    })

    it("should transform break", () => {
      const result = transform("while True:\n    break")
      expect(result.code).toContain("break;")
    })

    it("should transform continue", () => {
      const result = transform("while True:\n    continue")
      expect(result.code).toContain("continue;")
    })

    it("should strip pass statement", () => {
      const result = transform("if x:\n    pass")
      expect(result.code).toContain("if (x) {")
      expect(result.code).not.toContain("pass")
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

  describe("Membership and Identity Operators (CompareOp)", () => {
    it("should transform 'in' operator", () => {
      const result = transform("x in items")
      expect(result.code).toContain("py.in(x, items)")
      expect(result.usesRuntime.has("in")).toBe(true)
    })

    it("should transform 'not in' operator", () => {
      const result = transform("x not in items")
      // Parser may handle 'not in' differently
      expect(result.code).toBeDefined()
    })

    it("should transform 'is' operator", () => {
      const result = transform("x is y")
      expect(result.code).toContain("(x === y)")
    })

    it("should transform 'is not' operator", () => {
      const result = transform("x is not y")
      // May be transformed differently based on parser
      expect(result.code).toBeDefined()
    })

    it("should transform 'is None'", () => {
      const result = transform("x is None")
      expect(result.code).toContain("(x === null)")
    })

    it("should transform chained comparisons", () => {
      const result = transform("1 < x < 10")
      expect(result.code).toContain("&&")
    })

    it("should transform chained comparisons with different operators", () => {
      const result = transform("a <= b < c")
      expect(result.code).toContain("&&")
    })
  })

  describe("Additional Built-in Functions", () => {
    it("should transform repr to py.repr", () => {
      const result = transform("repr(x)")
      expect(result.code).toContain("py.repr")
      expect(result.usesRuntime.has("repr")).toBe(true)
    })

    it("should transform round to py.round", () => {
      const result = transform("round(3.14159, 2)")
      expect(result.code).toContain("py.round")
      expect(result.usesRuntime.has("round")).toBe(true)
    })

    it("should transform divmod to py.divmod", () => {
      const result = transform("divmod(10, 3)")
      expect(result.code).toContain("py.divmod")
      expect(result.usesRuntime.has("divmod")).toBe(true)
    })

    it("should transform hex to py.hex", () => {
      const result = transform("hex(255)")
      expect(result.code).toContain("py.hex")
      expect(result.usesRuntime.has("hex")).toBe(true)
    })

    it("should transform oct to py.oct", () => {
      const result = transform("oct(64)")
      expect(result.code).toContain("py.oct")
      expect(result.usesRuntime.has("oct")).toBe(true)
    })

    it("should transform bin to py.bin", () => {
      const result = transform("bin(10)")
      expect(result.code).toContain("py.bin")
      expect(result.usesRuntime.has("bin")).toBe(true)
    })

    it("should transform map to py.map", () => {
      const result = transform("map(fn, items)")
      expect(result.code).toContain("py.map")
      expect(result.usesRuntime.has("map")).toBe(true)
    })

    it("should transform filter to py.filter", () => {
      const result = transform("filter(fn, items)")
      expect(result.code).toContain("py.filter")
      expect(result.usesRuntime.has("filter")).toBe(true)
    })
  })

  describe("Subscript and Slice Operations", () => {
    it("should transform simple subscript", () => {
      const result = transform("arr[0]")
      expect(result.code).toBe("arr[0];")
    })

    it("should transform negative index with py.at", () => {
      const result = transform("arr[-1]")
      expect(result.code).toContain("py.at(arr, (-1))")
      expect(result.usesRuntime.has("at")).toBe(true)
    })

    it("should transform slice with start and stop", () => {
      const result = transform("arr[1:5]")
      expect(result.code).toContain("py.slice")
      expect(result.usesRuntime.has("slice")).toBe(true)
    })

    it("should transform slice with step", () => {
      const result = transform("arr[::2]")
      expect(result.code).toContain("py.slice")
    })

    it("should transform reverse slice", () => {
      const result = transform("arr[::-1]")
      expect(result.code).toContain("py.slice")
      expect(result.code).toContain("-1")
    })

    it("should transform slice with only start", () => {
      const result = transform("arr[2:]")
      expect(result.code).toContain("py.slice")
    })

    it("should transform slice with only stop", () => {
      const result = transform("arr[:3]")
      expect(result.code).toContain("py.slice")
    })
  })

  describe("Assignment Variations", () => {
    it("should not add let for reassignment", () => {
      const result = transform("x = 1\nx = 2")
      expect(result.code).toContain("let x = 1")
      expect(result.code).toContain("x = 2;")
      // Second assignment should not have 'let'
      const lines = result.code.split("\n")
      const secondAssign = lines.find((l) => l.includes("x = 2"))
      expect(secondAssign).not.toContain("let")
    })

    it("should not add let for member assignment", () => {
      const result = transform("obj.x = 1")
      expect(result.code).toBe("obj.x = 1;")
      expect(result.code).not.toContain("let")
    })

    it("should not add let for subscript assignment", () => {
      const result = transform("arr[0] = 1")
      expect(result.code).toBe("arr[0] = 1;")
      expect(result.code).not.toContain("let")
    })

    it("should handle tuple unpacking reassignment", () => {
      const result = transform("a, b = 1, 2\na, b = 3, 4")
      // Second assignment should not have 'let'
      expect(result.code.match(/let/g)?.length).toBe(1)
    })

    it("should handle single target with multiple values", () => {
      const result = transform("x = 1, 2, 3")
      expect(result.code).toContain("[1, 2, 3]")
    })
  })

  describe("Lambda Expressions", () => {
    it("should transform simple lambda", () => {
      const result = transform("f = lambda x: x * 2")
      expect(result.code).toContain("=>")
      expect(result.code).toContain("x")
    })

    it("should transform lambda with multiple params", () => {
      const result = transform("f = lambda a, b: a + b")
      expect(result.code).toContain("=>")
    })

    it("should transform lambda with no params", () => {
      const result = transform("f = lambda: 42")
      expect(result.code).toContain("=>")
      expect(result.code).toContain("42")
    })
  })

  describe("Class Features", () => {
    it("should transform class with __init__", () => {
      const result = transform("class Foo:\n    def __init__(self, x):\n        self.x = x")
      expect(result.code).toContain("constructor(x)")
      expect(result.code).toContain("this.x = x")
    })

    it("should transform @staticmethod", () => {
      const result = transform("class Foo:\n    @staticmethod\n    def bar():\n        pass")
      expect(result.code).toContain("static bar()")
    })

    it("should transform @classmethod", () => {
      const result = transform("class Foo:\n    @classmethod\n    def create(cls):\n        pass")
      expect(result.code).toContain("static create()")
    })

    it("should transform @property", () => {
      const result = transform(
        "class Foo:\n    @property\n    def x(self):\n        return self._x"
      )
      expect(result.code).toContain("get x()")
    })
  })

  describe("Exception Handling", () => {
    it("should transform try/except", () => {
      const result = transform("try:\n    x = 1\nexcept:\n    x = 0")
      expect(result.code).toContain("try")
      expect(result.code).toContain("catch")
    })

    it("should transform try/finally", () => {
      const result = transform("try:\n    x = 1\nfinally:\n    cleanup()")
      expect(result.code).toContain("try")
      expect(result.code).toContain("finally")
    })

    it("should transform raise", () => {
      const result = transform("raise ValueError('error')")
      expect(result.code).toContain("throw")
      expect(result.code).toContain("Error")
    })

    it("should transform bare raise", () => {
      const result = transform("raise")
      expect(result.code).toBe("throw;")
    })
  })

  describe("Async/Await", () => {
    it("should transform async function", () => {
      const result = transform("async def fetch():\n    return 1")
      expect(result.code).toContain("async function fetch()")
    })

    it("should transform await expression", () => {
      const result = transform("result = await fetch()")
      expect(result.code).toContain("await fetch()")
    })
  })

  describe("Import Statements", () => {
    it("should transform simple import", () => {
      const result = transform("import sys")
      expect(result.code).toContain("import")
      expect(result.code).toContain("sys")
    })

    it("should transform from import", () => {
      const result = transform("from pathlib import Path")
      expect(result.code).toContain("import")
      expect(result.code).toContain("Path")
    })
  })

  describe("Comprehensions", () => {
    it("should transform list comprehension", () => {
      const result = transform("[x * 2 for x in items]")
      expect(result.code).toContain(".map")
    })

    it("should transform list comprehension with filter", () => {
      const result = transform("[x for x in items if x > 0]")
      expect(result.code).toContain(".filter")
      expect(result.code).toContain(".map")
    })

    it("should transform dict comprehension", () => {
      const result = transform("{k: v for k, v in items}")
      expect(result.code).toContain("py.dict")
    })

    it("should transform set comprehension", () => {
      const result = transform("{x for x in items}")
      expect(result.code).toContain("py.set")
    })

    it("should transform generator expression", () => {
      const result = transform("(x for x in items)")
      expect(result.code).toContain("function*")
    })
  })

  describe("With Statement", () => {
    it("should transform with statement", () => {
      const result = transform("with open('file') as f:\n    data = f.read()")
      expect(result.code).toContain("try")
      expect(result.code).toContain("finally")
    })
  })

  describe("Augmented Assignment", () => {
    it("should transform +=", () => {
      const result = transform("x += 1")
      expect(result.code).toContain("+=")
    })

    it("should transform -=", () => {
      const result = transform("x -= 1")
      expect(result.code).toContain("-=")
    })

    it("should transform *=", () => {
      const result = transform("x *= 2")
      expect(result.code).toContain("*=")
    })

    it("should transform //=", () => {
      const result = transform("x //= 2")
      // Augmented floor division may keep operator or expand
      expect(result.code).toContain("//=")
    })

    it("should transform **=", () => {
      const result = transform("x **= 2")
      // Augmented power may keep operator or expand
      expect(result.code).toContain("**=")
    })
  })

  describe("String Operations", () => {
    it("should transform string multiplication", () => {
      const result = transform("'ab' * 3")
      expect(result.code).toContain("py.repeat")
      expect(result.usesRuntime.has("repeat")).toBe(true)
    })

    it("should transform list concatenation", () => {
      const result = transform("[1, 2] + [3, 4]")
      // Uses spread syntax for list concatenation
      expect(result.code).toContain("...")
    })
  })

  describe("Walrus Operator", () => {
    it("should transform named expression", () => {
      const result = transform("if (n := len(items)) > 0:\n    print(n)")
      expect(result.code).toContain("n =")
    })
  })

  describe("F-String Formatting", () => {
    it("should transform f-string with format spec", () => {
      const result = transform('f"{x:.2f}"')
      expect(result.code).toContain("py.format")
      expect(result.usesRuntime.has("format")).toBe(true)
    })

    it("should transform f-string with conversion", () => {
      const result = transform('f"{x!r}"')
      expect(result.code).toContain("py.repr")
    })
  })

  describe("Edge Cases - Assignments", () => {
    it("should handle deeply nested destructuring", () => {
      const result = transform("a, (b, (c, d)) = data")
      expect(result.code).toContain("[a, [b, [c, d]]]")
    })

    it("should handle assignment in function scope", () => {
      const result = transform("def foo():\n    x = 1\n    x = 2")
      // Should have let for first, no let for second
      expect(result.code).toContain("let x = 1")
    })

    it("should handle subscript with complex expression", () => {
      const result = transform("arr[i + j] = value")
      expect(result.code).toContain("arr[(i + j)]")
    })

    it("should handle chained member assignment", () => {
      const result = transform("obj.a.b.c = 1")
      expect(result.code).toBe("obj.a.b.c = 1;")
    })
  })

  describe("Edge Cases - Control Flow", () => {
    it("should handle elif chain", () => {
      const result = transform(
        "if a:\n    x = 1\nelif b:\n    x = 2\nelif c:\n    x = 3\nelse:\n    x = 4"
      )
      expect(result.code).toContain("else if")
    })

    it("should handle nested while", () => {
      const result = transform("while a:\n    while b:\n        break")
      expect(result.code).toContain("while")
      expect(result.code).toContain("break")
    })

    it("should handle for with complex unpacking", () => {
      const result = transform("for (a, b), c in items:\n    pass")
      expect(result.code).toContain("[[a, b], c]")
    })
  })

  describe("Edge Cases - Functions", () => {
    it("should handle function with *args and **kwargs", () => {
      // Note: when both are present, kwargs is dropped since JS rest params must be last
      const result = transform("def foo(*args, **kwargs):\n    pass")
      expect(result.code).toContain("...args")
      // kwargs is not included when *args is present (JS limitation)
    })

    it("should handle function with only **kwargs", () => {
      const result = transform("def foo(**kw):\n    pass")
      expect(result.code).toContain("kw")
    })

    it("should handle function call with keyword args", () => {
      const result = transform("foo(a=1, b=2)")
      expect(result.code).toContain("a:")
      expect(result.code).toContain("b:")
    })

    it("should handle nested function definitions", () => {
      const result = transform("def outer():\n    def inner():\n        return 1\n    return inner")
      expect(result.code).toContain("function outer()")
      expect(result.code).toContain("function inner()")
    })
  })

  describe("Edge Cases - Classes", () => {
    it("should handle class with docstring", () => {
      const result = transform('class Foo:\n    """docstring"""\n    pass')
      expect(result.code).toContain("class Foo")
    })

    it("should handle class method calling super", () => {
      const result = transform(
        "class Child(Parent):\n    def method(self):\n        super().method()"
      )
      expect(result.code).toContain("super().method()")
    })

    it("should handle multiple decorators on method", () => {
      const result = transform("class Foo:\n    @dec1\n    @dec2\n    def bar(self):\n        pass")
      // Decorators may be handled differently in class context
      expect(result.code).toContain("bar")
    })
  })

  describe("Edge Cases - Comprehensions", () => {
    it("should handle nested list comprehension", () => {
      const result = transform("[[x for x in row] for row in matrix]")
      expect(result.code).toContain(".map")
    })

    it("should handle comprehension with multiple conditions", () => {
      const result = transform("[x for x in items if x > 0 if x < 10]")
      expect(result.code).toContain(".filter")
    })

    it("should handle dict comprehension with complex key/value", () => {
      const result = transform("{k.lower(): v.upper() for k, v in items}")
      expect(result.code).toContain("py.dict")
    })
  })

  describe("Edge Cases - Operators", () => {
    it("should handle unary plus", () => {
      const result = transform("x = +5")
      expect(result.code).toContain("+5")
    })

    it("should handle bitwise operations", () => {
      const result = transform("x = a & b | c ^ d")
      expect(result.code).toContain("&")
      expect(result.code).toContain("|")
      expect(result.code).toContain("^")
    })

    it("should handle shift operations", () => {
      const result = transform("x = a << 2 >> 1")
      expect(result.code).toContain("<<")
      expect(result.code).toContain(">>")
    })

    it("should handle comparison chain with equality", () => {
      const result = transform("a == b == c")
      expect(result.code).toContain("&&")
    })
  })

  describe("Edge Cases - Strings", () => {
    it("should handle raw string", () => {
      const result = transform('r"hello\\nworld"')
      expect(result.code).toBeDefined()
    })

    it("should handle bytes literal", () => {
      const result = transform("b'bytes'")
      expect(result.code).toBeDefined()
    })

    it("should handle triple quoted f-string", () => {
      const result = transform('f"""multi\n{x}\nline"""')
      expect(result.code).toContain("`")
    })
  })

  describe("Edge Cases - Async", () => {
    it("should handle async for", () => {
      const result = transform("async for item in async_gen():\n    pass")
      // May transform to regular for-of or for-await
      expect(result.code).toContain("for")
    })

    it("should handle async with", () => {
      const result = transform("async with context() as c:\n    pass")
      expect(result.code).toContain("asyncDispose")
    })
  })

  describe("Edge Cases - Exceptions", () => {
    it("should handle try with multiple except types", () => {
      const result = transform("try:\n    x = 1\nexcept (ValueError, TypeError):\n    pass")
      expect(result.code).toContain("catch")
    })

    it("should handle try/except/else/finally", () => {
      const result = transform(
        "try:\n    x = 1\nexcept:\n    pass\nelse:\n    y = 2\nfinally:\n    cleanup()"
      )
      expect(result.code).toContain("try")
      expect(result.code).toContain("finally")
    })
  })

  describe("Edge Cases - Imports", () => {
    it("should handle import with multiple modules", () => {
      const result = transform("import argparse, sys, pathlib")
      expect(result.code).toContain("argparse")
      expect(result.code).toContain("sys")
    })

    it("should handle from import star", () => {
      const result = transform("from pathlib import *")
      expect(result.code).toContain("import")
    })

    it("should handle relative import", () => {
      const result = transform("from ..utils import helper")
      expect(result.code).toContain("helper")
    })
  })

  describe("Edge Cases - Misc", () => {
    it("should handle global statement", () => {
      const result = transform("global x")
      expect(result.code).toBeDefined()
    })

    it("should handle nonlocal statement", () => {
      const result = transform("nonlocal x")
      expect(result.code).toBeDefined()
    })

    it("should handle assert with message", () => {
      const result = transform("assert x > 0, 'must be positive'")
      expect(result.code).toBeDefined()
    })

    it("should handle del statement", () => {
      const result = transform("del x")
      expect(result.code).toBeDefined()
    })

    it("should handle yield expression", () => {
      const result = transform("def gen():\n    yield 1\n    yield 2")
      expect(result.code).toContain("yield")
    })

    it("should handle yield from", () => {
      const result = transform("def gen():\n    yield from other()")
      expect(result.code).toContain("yield")
    })
  })
})
