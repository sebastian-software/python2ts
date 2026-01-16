import { describe, it, expect } from "vitest"
import { transpile } from "../../src/generator/index.js"

describe("E2E: Functions", () => {
  describe("Function Definitions", () => {
    it("should convert simple function", () => {
      const python = `def greet():
    print("Hello")`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function greet() {
          console.log("Hello");
        }"
      `)
    })

    it("should convert function with parameters", () => {
      const python = `def add(a, b):
    return a + b`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function add(a, b) {
          return (a + b);
        }"
      `)
    })

    it("should convert function with default parameters", () => {
      const python = `def greet(name, greeting = "Hello"):
    print(greeting, name)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function greet(name, greeting = "Hello") {
          console.log(greeting, name);
        }"
      `)
    })

    it("should convert function with return", () => {
      const python = `def square(x):
    return x * x`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function square(x) {
          return (x * x);
        }"
      `)
    })

    it("should convert function with empty return", () => {
      const python = `def early_return():
    return`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function early_return() {
          return;
        }"
      `)
    })

    it("should convert function with multiple statements", () => {
      const python = `def process(x):
    y = x + 1
    z = y * 2
    return z`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function process(x) {
          let y = (x + 1);
          let z = (y * 2);
          return z;
        }"
      `)
    })
  })

  describe("Function Calls", () => {
    it("should convert simple function call", () => {
      expect(transpile("greet()", { includeRuntime: false })).toMatchInlineSnapshot(`"greet();"`)
    })

    it("should convert function call with arguments", () => {
      expect(transpile("add(1, 2)", { includeRuntime: false })).toMatchInlineSnapshot(
        `"add(1, 2);"`
      )
    })

    it("should convert nested function calls", () => {
      expect(transpile("outer(inner(x))", { includeRuntime: false })).toMatchInlineSnapshot(
        `"outer(inner(x));"`
      )
    })

    it("should convert chained method calls", () => {
      expect(transpile("obj.method1().method2()", { includeRuntime: false })).toMatchInlineSnapshot(
        `"obj.method1().method2();"`
      )
    })
  })

  describe("Built-in Functions", () => {
    it("should convert print with multiple arguments", () => {
      expect(
        transpile('print("Hello", name, "!")', { includeRuntime: false })
      ).toMatchInlineSnapshot(`"console.log("Hello", name, "!");"`)
    })

    it("should convert len", () => {
      expect(transpile("n = len(items)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let n = py.len(items);"
      `)
    })

    it("should convert range with one argument", () => {
      expect(transpile("r = range(10)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let r = py.range(10);"
      `)
    })

    it("should convert range with two arguments", () => {
      expect(transpile("r = range(1, 10)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let r = py.range(1, 10);"
      `)
    })

    it("should convert range with three arguments", () => {
      expect(transpile("r = range(0, 10, 2)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let r = py.range(0, 10, 2);"
      `)
    })

    it("should convert enumerate", () => {
      expect(transpile("e = enumerate(items)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let e = py.enumerate(items);"
      `)
    })

    it("should convert zip", () => {
      expect(transpile("z = zip(a, b)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let z = py.zip(a, b);"
      `)
    })

    it("should convert sorted", () => {
      expect(transpile("s = sorted(items)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let s = py.sorted(items);"
      `)
    })

    it("should convert reversed", () => {
      expect(transpile("r = reversed(items)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let r = py.reversed(items);"
      `)
    })

    it("should convert abs", () => {
      expect(transpile("a = abs(-5)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let a = py.abs((-5));"
      `)
    })

    it("should convert min", () => {
      expect(transpile("m = min(1, 2, 3)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let m = py.min(1, 2, 3);"
      `)
    })

    it("should convert max", () => {
      expect(transpile("m = max(1, 2, 3)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let m = py.max(1, 2, 3);"
      `)
    })

    it("should convert sum", () => {
      expect(transpile("s = sum(numbers)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let s = py.sum(numbers);"
      `)
    })

    it("should convert int", () => {
      expect(transpile('i = int("42")')).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let i = py.int("42");"
      `)
    })

    it("should convert float", () => {
      expect(transpile('f = float("3.14")')).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let f = py.float("3.14");"
      `)
    })

    it("should convert str", () => {
      expect(transpile("s = str(42)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let s = py.str(42);"
      `)
    })

    it("should convert bool", () => {
      expect(transpile("b = bool(x)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let b = py.bool(x);"
      `)
    })

    it("should convert list", () => {
      expect(transpile("l = list(items)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let l = py.list(items);"
      `)
    })

    it("should convert dict", () => {
      expect(transpile("d = dict(entries)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let d = py.dict(entries);"
      `)
    })

    it("should convert set", () => {
      expect(transpile("s = set(items)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let s = py.set(items);"
      `)
    })

    it("should convert tuple", () => {
      expect(transpile("t = tuple(items)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let t = py.tuple(items);"
      `)
    })

    it("should convert isinstance", () => {
      expect(transpile("isinstance(x, int)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.isinstance(x, int);"
      `)
    })

    it("should convert type", () => {
      expect(transpile("type(x)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.type(x);"
      `)
    })

    it("should convert ord", () => {
      expect(transpile('ord("A")')).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.ord("A");"
      `)
    })

    it("should convert chr", () => {
      expect(transpile("chr(65)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.chr(65);"
      `)
    })

    it("should convert input", () => {
      expect(transpile("input('prompt')")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.input('prompt');"
      `)
    })
  })

  describe("Variadic Arguments", () => {
    it("should convert function with *args", () => {
      const result = transpile("def fn(*args):\n    pass", { includeRuntime: false })
      expect(result).toContain("...args")
    })

    it("should convert function with **kwargs", () => {
      const result = transpile("def fn(**kwargs):\n    pass", { includeRuntime: false })
      expect(result).toContain("kwargs")
    })

    it("should convert function with multiple default params", () => {
      const result = transpile("def fn(a=1, b=2, c=3):\n    pass", { includeRuntime: false })
      expect(result).toContain("a = 1")
      expect(result).toContain("b = 2")
      expect(result).toContain("c = 3")
    })

    it("should handle starred expression in call", () => {
      const code = "fn(*args)"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("args")
    })

    it("should handle double starred expression in call", () => {
      const code = "fn(**kwargs)"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("kwargs")
    })

    it("should handle keyword arguments in function call", () => {
      const result = transpile("sorted(items, reverse=True)")
      expect(result).toContain("reverse:")
    })
  })

  describe("Lambda Expressions", () => {
    it("should convert lambda with multiple params", () => {
      const result = transpile("f = lambda a, b, c: a + b + c", { includeRuntime: false })
      expect(result).toContain("=>")
    })
  })

  describe("Decorators", () => {
    it("should handle decorator with arguments", () => {
      const code = "@decorator(arg1, arg2)\ndef fn():\n    pass"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("decorator")
    })

    it("should handle multiple decorators", () => {
      const code = "@dec1\n@dec2\ndef fn():\n    pass"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("dec1")
      expect(result).toContain("dec2")
    })

    it("should handle member expression decorator", () => {
      const code = "@app.route('/home')\ndef home():\n    pass"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("route")
    })
  })

  describe("Generator Functions", () => {
    it("should handle yield expression", () => {
      const code = "def gen():\n    yield 1"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("yield")
    })

    it("should handle yield from", () => {
      const code = "def gen():\n    yield from other_gen()"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("yield")
    })

    it("should handle async generator", () => {
      const code = "async def gen():\n    yield 1"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("async")
      expect(result).toContain("yield")
    })

    it("should handle generator expression in function call", () => {
      const result = transpile("sum(x * 2 for x in items)")
      expect(result).toContain("function*")
    })
  })
})
