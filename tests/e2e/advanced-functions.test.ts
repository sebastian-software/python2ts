import { describe, it, expect } from "vitest"
import { transpile } from "../../src/generator/index.js"

describe("E2E: Advanced Functions", () => {
  describe("Default Parameter Values", () => {
    it("should convert function with single default parameter", () => {
      const python = `def greet(name="World"):
    print(name)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function greet(name = "World") {
          console.log(name);
        }"
      `)
    })

    it("should convert function with multiple default parameters", () => {
      const python = `def greet(greeting="Hello", name="World"):
    print(greeting, name)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function greet(greeting = "Hello", name = "World") {
          console.log(greeting, name);
        }"
      `)
    })

    it("should convert function with mixed parameters", () => {
      const python = `def greet(greeting, name="World"):
    print(greeting, name)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function greet(greeting, name = "World") {
          console.log(greeting, name);
        }"
      `)
    })

    it("should convert function with numeric default", () => {
      const python = `def increment(x, step=1):
    return x + step`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function increment(x, step = 1) {
          return (x + step);
        }"
      `)
    })

    it("should convert function with None default", () => {
      const python = `def process(data, callback=None):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function process(data, callback = null) {
          /* pass */;
        }"
      `)
    })

    it("should convert function with boolean default", () => {
      const python = `def fetch(url, cache=True):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function fetch(url, cache = true) {
          /* pass */;
        }"
      `)
    })

    it("should convert function with list default", () => {
      const python = `def append_to(item, target=[]):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function append_to(item, target = []) {
          /* pass */;
        }"
      `)
    })
  })

  describe("Lambda Expressions", () => {
    it("should convert simple lambda", () => {
      const python = "f = lambda x: x + 1"
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let f = (x) => (x + 1);"`
      )
    })

    it("should convert lambda with multiple parameters", () => {
      const python = "add = lambda x, y: x + y"
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let add = (x, y) => (x + y);"`
      )
    })

    it("should convert lambda with no parameters", () => {
      const python = "get_value = lambda: 42"
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let get_value = () => 42;"`
      )
    })

    it("should convert lambda in map()", () => {
      const python = "list(map(lambda x: x * 2, items))"
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.list(py.map((x) => (x * 2), items));"
      `)
    })

    it("should convert lambda in filter()", () => {
      const python = "list(filter(lambda x: x > 0, items))"
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.list(py.filter((x) => (x > 0), items));"
      `)
    })

    it("should convert lambda in sorted() with key", () => {
      const python = "sorted(items, key=lambda x: x.name)"
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.sorted(items, { key: (x) => x.name });"
      `)
    })

    it("should convert lambda with conditional expression", () => {
      const python = "f = lambda x: 1 if x > 0 else -1"
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let f = (x) => ((x > 0) ? 1 : (-1));"`
      )
    })
  })

  describe("*args (Rest Parameters)", () => {
    it("should convert function with *args", () => {
      const python = `def sum_all(*args):
    return sum(args)`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        function sum_all(...args) {
          return py.sum(args);
        }"
      `)
    })

    it("should convert function with positional and *args", () => {
      const python = `def greet(greeting, *names):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function greet(greeting, ...names) {
          /* pass */;
        }"
      `)
    })

    it("should convert function with *args and default", () => {
      const python = `def log(level="INFO", *messages):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function log(level = "INFO", ...messages) {
          /* pass */;
        }"
      `)
    })
  })

  describe("**kwargs", () => {
    it("should convert function with **kwargs", () => {
      const python = `def config(**kwargs):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function config(kwargs: Record<string, unknown> = {}) {
          /* pass */;
        }"
      `)
    })

    it("should convert function with positional and **kwargs", () => {
      const python = `def create(name, **options):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function create(name, options: Record<string, unknown> = {}) {
          /* pass */;
        }"
      `)
    })

    it("should convert function with *args and **kwargs", () => {
      const python = `def flexible(*args, **kwargs):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function flexible(...args) {
          /* pass */;
        }"
      `)
    })
  })

  describe("Combined Advanced Features", () => {
    it("should handle function with all parameter types", () => {
      const python = `def complex_func(a, b=1, *args, **kwargs):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function complex_func(a, b = 1, ...args) {
          /* pass */;
        }"
      `)
    })

    it("should handle lambda assigned and called", () => {
      const python = `double = lambda x: x * 2
result = double(5)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "let double = (x) => (x * 2);
        let result = double(5);"
      `)
    })
  })

  describe("Decorators", () => {
    it("should convert simple decorator", () => {
      const python = `@my_decorator
def func():
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const func = my_decorator(function func() {
          /* pass */;
        })"
      `)
    })

    it("should convert decorator with arguments", () => {
      const python = `@my_decorator(arg1, arg2)
def func():
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const func = my_decorator(arg1, arg2)(function func() {
          /* pass */;
        })"
      `)
    })

    it("should convert multiple decorators", () => {
      const python = `@decorator1
@decorator2
def func():
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const func = decorator1(decorator2(function func() {
          /* pass */;
        }))"
      `)
    })

    it("should convert decorator on function with parameters", () => {
      const python = `@log_calls
def greet(name):
    print(name)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const greet = log_calls(function greet(name) {
          console.log(name);
        })"
      `)
    })

    it("should convert decorator with keyword arguments", () => {
      const python = `@cache(maxsize=100)
def expensive():
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const expensive = cache({ maxsize: 100 })(function expensive() {
          /* pass */;
        })"
      `)
    })

    it("should handle decorators with function default params", () => {
      const python = `@validate
def process(data, timeout=30):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const process = validate(function process(data, timeout = 30) {
          /* pass */;
        })"
      `)
    })
  })
})
