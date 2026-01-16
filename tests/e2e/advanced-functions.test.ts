import { describe, it, expect } from "vitest"
import { transpile } from "../../src/generator/index.js"

describe("E2E: Advanced Functions", () => {
  describe("Default Parameter Values", () => {
    it("should convert function with single default parameter", () => {
      const python = `def greet(name="World"):
    print(name)`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain('function greet(name = "World")')
    })

    it("should convert function with multiple default parameters", () => {
      const python = `def greet(greeting="Hello", name="World"):
    print(greeting, name)`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain('function greet(greeting = "Hello", name = "World")')
    })

    it("should convert function with mixed parameters", () => {
      const python = `def greet(greeting, name="World"):
    print(greeting, name)`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain('function greet(greeting, name = "World")')
    })

    it("should convert function with numeric default", () => {
      const python = `def increment(x, step=1):
    return x + step`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("function increment(x, step = 1)")
    })

    it("should convert function with None default", () => {
      const python = `def process(data, callback=None):
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("function process(data, callback = null)")
    })

    it("should convert function with boolean default", () => {
      const python = `def fetch(url, cache=True):
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("function fetch(url, cache = true)")
    })

    it("should convert function with list default", () => {
      const python = `def append_to(item, target=[]):
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("function append_to(item, target = [])")
    })
  })

  describe("Lambda Expressions", () => {
    it("should convert simple lambda", () => {
      const python = "f = lambda x: x + 1"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("(x) => (x + 1)")
    })

    it("should convert lambda with multiple parameters", () => {
      const python = "add = lambda x, y: x + y"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("(x, y) => (x + y)")
    })

    it("should convert lambda with no parameters", () => {
      const python = "get_value = lambda: 42"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("() => 42")
    })

    it("should convert lambda in map()", () => {
      const python = "list(map(lambda x: x * 2, items))"
      const ts = transpile(python)
      expect(ts).toContain("py.map((x) => (x * 2), items)")
    })

    it("should convert lambda in filter()", () => {
      const python = "list(filter(lambda x: x > 0, items))"
      const ts = transpile(python)
      expect(ts).toContain("py.filter((x) => (x > 0), items)")
    })

    it("should convert lambda in sorted() with key", () => {
      const python = "sorted(items, key=lambda x: x.name)"
      const ts = transpile(python)
      expect(ts).toContain("py.sorted(items, { key: (x) => x.name })")
    })

    it("should convert lambda with conditional expression", () => {
      const python = "f = lambda x: 1 if x > 0 else -1"
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("=>")
      expect(ts).toContain("?")
    })
  })

  describe("*args (Rest Parameters)", () => {
    it("should convert function with *args", () => {
      const python = `def sum_all(*args):
    return sum(args)`
      const ts = transpile(python)
      expect(ts).toContain("function sum_all(...args)")
    })

    it("should convert function with positional and *args", () => {
      const python = `def greet(greeting, *names):
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("function greet(greeting, ...names)")
    })

    it("should convert function with *args and default", () => {
      const python = `def log(level="INFO", *messages):
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain('function log(level = "INFO", ...messages)')
    })
  })

  describe("**kwargs", () => {
    it("should convert function with **kwargs", () => {
      const python = `def config(**kwargs):
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("function config(kwargs)")
    })

    it("should convert function with positional and **kwargs", () => {
      const python = `def create(name, **options):
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("function create(name, options)")
    })

    it("should convert function with *args and **kwargs", () => {
      const python = `def flexible(*args, **kwargs):
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("function flexible(...args, kwargs)")
    })
  })

  describe("Combined Advanced Features", () => {
    it("should handle function with all parameter types", () => {
      const python = `def complex_func(a, b=1, *args, **kwargs):
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("function complex_func(a, b = 1, ...args, kwargs)")
    })

    it("should handle lambda assigned and called", () => {
      const python = `double = lambda x: x * 2
result = double(5)`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("(x) => (x * 2)")
      expect(ts).toContain("double(5)")
    })
  })

  describe("Decorators", () => {
    it("should convert simple decorator", () => {
      const python = `@my_decorator
def func():
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("const func = my_decorator(function func()")
    })

    it("should convert decorator with arguments", () => {
      const python = `@my_decorator(arg1, arg2)
def func():
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("const func = my_decorator(arg1, arg2)(function func()")
    })

    it("should convert multiple decorators", () => {
      const python = `@decorator1
@decorator2
def func():
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("const func = decorator1(decorator2(function func()")
    })

    it("should convert decorator on function with parameters", () => {
      const python = `@log_calls
def greet(name):
    print(name)`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("const greet = log_calls(function greet(name)")
    })

    it("should convert decorator with keyword arguments", () => {
      const python = `@cache(maxsize=100)
def expensive():
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("const expensive = cache({ maxsize: 100 })(function expensive()")
    })

    it("should handle decorators with function default params", () => {
      const python = `@validate
def process(data, timeout=30):
    pass`
      const ts = transpile(python, { includeRuntime: false })
      expect(ts).toContain("const process = validate(function process(data, timeout = 30)")
    })
  })
})
