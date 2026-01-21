import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

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

        }"
      `)
    })

    it("should convert function with boolean default", () => {
      const python = `def fetch(url, cache=True):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function fetch(url, cache = true) {

        }"
      `)
    })

    it("should convert function with list default", () => {
      const python = `def append_to(item, target=[]):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function append_to(item, target = []) {

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
        "import { list, map } from "pythonlib"

        list(map((x) => (x * 2), items));"
      `)
    })

    it("should convert lambda in filter()", () => {
      const python = "list(filter(lambda x: x > 0, items))"
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { filter, list } from "pythonlib"

        list(filter((x) => (x > 0), items));"
      `)
    })

    it("should convert lambda in sorted() with key", () => {
      const python = "sorted(items, key=lambda x: x.name)"
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { sorted } from "pythonlib"

        sorted(items, { key: (x) => x.name });"
      `)
    })

    it("should convert lambda with conditional expression", () => {
      const python = "f = lambda x: 1 if x > 0 else -1"
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let f = (x) => (x > 0 ? 1 : (-1));"`
      )
    })
  })

  describe("*args (Rest Parameters)", () => {
    it("should convert function with *args", () => {
      const python = `def sum_all(*args):
    return sum(args)`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { sum } from "pythonlib"

        function sum_all(...args) {
          return sum(args);
        }"
      `)
    })

    it("should convert function with positional and *args", () => {
      const python = `def greet(greeting, *names):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function greet(greeting, ...names) {

        }"
      `)
    })

    it("should convert function with *args and default", () => {
      const python = `def log(level="INFO", *messages):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function log(level = "INFO", ...messages) {

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

        }"
      `)
    })

    it("should convert function with positional and **kwargs", () => {
      const python = `def create(name, **options):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function create(name, options: Record<string, unknown> = {}) {

        }"
      `)
    })

    it("should convert function with *args and **kwargs", () => {
      const python = `def flexible(*args, **kwargs):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function flexible(kwargs: Record<string, unknown> = {}, ...args) {

        }"
      `)
    })
  })

  describe("Keyword-only Parameters (*)", () => {
    it("should convert bare * to options object", () => {
      const python = `def func(a, *, b, c=10):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function func(a, { b, c = 10 }: { b?: unknown; c?: unknown } = {}) {

        }"
      `)
    })

    it("should convert keyword-only with types", () => {
      const python = `def fetch(url: str, *, timeout: int = 30, retries: int = 3):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function fetch(url: string, { timeout = 30, retries = 3 }: { timeout?: number; retries?: number } = {}) {

        }"
      `)
    })

    it("should handle positional-only (/) and keyword-only (*) together", () => {
      const python = `def func(a, /, b, *, c, d=1):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function func(a, b, { c, d = 1 }: { c?: unknown; d?: unknown } = {}) {

        }"
      `)
    })

    it("should convert keyword-only after *args", () => {
      const python = `def func(*args, keyword_only=True):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function func({ keyword_only = true }: { keyword_only?: unknown } = {}, ...args) {

        }"
      `)
    })

    it("should handle keyword-only with **kwargs", () => {
      const python = `def func(*, option=True, **kwargs):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function func({ option = true }: { option?: unknown } = {}, kwargs: Record<string, unknown> = {}) {

        }"
      `)
    })
  })

  describe("Combined Advanced Features", () => {
    it("should handle function with all parameter types", () => {
      const python = `def complex_func(a, b=1, *args, **kwargs):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function complex_func(a, b = 1, kwargs: Record<string, unknown> = {}, ...args) {

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

        })"
      `)
    })

    it("should convert decorator with arguments", () => {
      const python = `@my_decorator(arg1, arg2)
def func():
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const func = my_decorator(arg1, arg2)(function func() {

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

        })"
      `)
    })

    it("should handle decorators with function default params", () => {
      const python = `@validate
def process(data, timeout=30):
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "const process = validate(function process(data, timeout = 30) {

        })"
      `)
    })
  })
})
