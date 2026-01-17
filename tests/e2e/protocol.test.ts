import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

describe("E2E: Protocol", () => {
  describe("Basic Protocol", () => {
    it("should transform Protocol with method to interface", () => {
      const python = `from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("interface Drawable {")
      expect(result).toContain("draw(): void")
      expect(result).not.toContain("class")
    })

    it("should transform Protocol with field to interface", () => {
      const python = `from typing import Protocol

class Sized(Protocol):
    size: int`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("interface Sized {")
      expect(result).toContain("size: number")
    })

    it("should transform Protocol with both fields and methods", () => {
      const python = `from typing import Protocol

class Named(Protocol):
    name: str
    def get_name(self) -> str: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("interface Named {")
      expect(result).toContain("name: string")
      expect(result).toContain("get_name(): string")
    })
  })

  describe("Protocol with Parameters", () => {
    it("should transform method with parameters", () => {
      const python = `from typing import Protocol

class Comparable(Protocol):
    def compare(self, other: int) -> bool: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("interface Comparable {")
      expect(result).toContain("compare(other: number): boolean")
    })

    it("should transform method with multiple parameters", () => {
      const python = `from typing import Protocol

class Calculator(Protocol):
    def add(self, a: int, b: int) -> int: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("add(a: number, b: number): number")
    })
  })

  describe("Generic Protocol", () => {
    it("should transform generic Protocol", () => {
      const python = `from typing import Protocol, Generic, TypeVar

T = TypeVar("T")

class Container(Protocol, Generic[T]):
    def get(self) -> T: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("interface Container<T> {")
      expect(result).toContain("get(): T")
    })
  })

  describe("Empty Protocol", () => {
    it("should handle empty Protocol", () => {
      const python = `from typing import Protocol

class Empty(Protocol):
    pass`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("interface Empty {}")
    })
  })

  describe("Protocol Return Types", () => {
    it("should handle None return type as void", () => {
      const python = `from typing import Protocol

class Logger(Protocol):
    def log(self, message: str) -> None: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("log(message: string): void")
    })

    it("should handle complex return types", () => {
      const python = `from typing import Protocol, List

class Collector(Protocol):
    def collect(self) -> List[str]: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("collect(): string[]")
    })
  })
})
