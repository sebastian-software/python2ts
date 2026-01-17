import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

describe("E2E: Generic Classes", () => {
  describe("Single Type Parameter", () => {
    it("should transform Generic[T] to class<T>", () => {
      const python = `
from typing import Generic, TypeVar

T = TypeVar("T")

class Box(Generic[T]):
    value: T
`
      const result = transpile(python)
      expect(result).toContain("class Box<T>")
      expect(result).toContain("value: T")
      expect(result).not.toContain("extends Generic")
    })

    it("should preserve methods with generic types", () => {
      const python = `
from typing import Generic, TypeVar

T = TypeVar("T")

class Container(Generic[T]):
    def get(self) -> T:
        pass

    def set(self, value: T):
        pass
`
      const result = transpile(python)
      expect(result).toContain("class Container<T>")
      expect(result).toContain("get()")
      expect(result).toContain("set(value)")
    })
  })

  describe("Multiple Type Parameters", () => {
    it("should handle two type parameters", () => {
      const python = `
from typing import Generic, TypeVar

K = TypeVar("K")
V = TypeVar("V")

class Mapping(Generic[K, V]):
    pass
`
      const result = transpile(python)
      expect(result).toContain("class Mapping<K, V>")
    })

    it("should handle three type parameters", () => {
      const python = `
from typing import Generic, TypeVar

A = TypeVar("A")
B = TypeVar("B")
C = TypeVar("C")

class Triple(Generic[A, B, C]):
    pass
`
      const result = transpile(python)
      expect(result).toContain("class Triple<A, B, C>")
    })
  })

  describe("Generic with Inheritance", () => {
    it("should handle generic class extending another class", () => {
      const python = `
from typing import Generic, TypeVar

T = TypeVar("T")

class Base:
    pass

class Child(Base, Generic[T]):
    value: T
`
      const result = transpile(python)
      expect(result).toContain("class Child<T> extends Base")
      expect(result).toContain("value: T")
    })
  })

  describe("Generic Class Body", () => {
    it("should transform constructor", () => {
      const python = `
from typing import Generic, TypeVar

T = TypeVar("T")

class Box(Generic[T]):
    def __init__(self, value: T):
        self.value = value
`
      const result = transpile(python)
      expect(result).toContain("class Box<T>")
      expect(result).toContain("constructor(value)")
      expect(result).toContain("this.value = value")
    })

    it("should handle generic fields", () => {
      const python = `
from typing import Generic, TypeVar

T = TypeVar("T")

class Stack(Generic[T]):
    items: T
`
      const result = transpile(python)
      expect(result).toContain("class Stack<T>")
      expect(result).toContain("items: T")
    })
  })

  describe("Empty Generic Class", () => {
    it("should handle empty generic class with pass", () => {
      const python = `
from typing import Generic, TypeVar

T = TypeVar("T")

class Empty(Generic[T]):
    pass
`
      const result = transpile(python)
      expect(result).toContain("class Empty<T>")
    })
  })

  describe("Literal Type (already implemented)", () => {
    it("should transform Literal to union type", () => {
      const python = `
from typing import Literal

def handle(status: Literal["success", "error"]):
    pass
`
      const result = transpile(python)
      expect(result).toContain('"success" | "error"')
    })
  })
})
