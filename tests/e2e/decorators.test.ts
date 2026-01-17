import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

describe("E2E: Class Decorators", () => {
  describe("single decorator", () => {
    it("should wrap class with single decorator", () => {
      const python = `@decorator
class MyClass:
    pass`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("const MyClass = decorator(class MyClass")
    })

    it("should wrap class with decorator having arguments", () => {
      const python = `@register("plugin")
class Plugin:
    pass`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain('const Plugin = register("plugin")(class Plugin')
    })

    it("should handle member expression decorator", () => {
      const python = `@app.route("/api")
class Handler:
    pass`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain('const Handler = app.route("/api")(class Handler')
    })
  })

  describe("multiple decorators", () => {
    it("should apply decorators from bottom to top", () => {
      const python = `@outer
@inner
class MyClass:
    pass`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("const MyClass = outer(inner(class MyClass")
    })

    it("should handle multiple decorators with arguments", () => {
      const python = `@register("a")
@configure(enabled=True)
class Service:
    pass`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain('register("a")')
      expect(result).toContain("configure(")
    })
  })

  describe("decorated class with members", () => {
    it("should preserve class methods", () => {
      const python = `@decorator
class MyClass:
    def method(self):
        return 42`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("const MyClass = decorator(class MyClass")
      expect(result).toContain("method()")
      expect(result).toContain("return 42")
    })

    it("should preserve class with constructor", () => {
      const python = `@decorator
class MyClass:
    def __init__(self, x):
        self.x = x`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("constructor(x)")
      expect(result).toContain("this.x = x")
    })

    it("should preserve class docstring", () => {
      const python = `@decorator
class MyClass:
    """This is my class."""
    pass`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("/**")
      expect(result).toContain("This is my class")
      expect(result).toContain("*/")
    })
  })

  describe("decorated class with inheritance", () => {
    it("should preserve extends clause", () => {
      const python = `@decorator
class Child(Parent):
    pass`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("class Child extends Parent")
      expect(result).toContain("const Child = decorator(")
    })
  })
})
