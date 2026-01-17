import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

describe("E2E: Abstract Classes", () => {
  describe("Basic ABC", () => {
    it("should transform ABC to abstract class", () => {
      const python = `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("abstract class Shape {")
      expect(result).toContain("abstract area(): number")
    })

    it("should not include ABC in extends", () => {
      const python = `from abc import ABC

class Base(ABC):
    pass`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("abstract class Base {")
      expect(result).not.toContain("extends ABC")
    })
  })

  describe("Abstract Methods", () => {
    it("should transform @abstractmethod with return type", () => {
      const python = `from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def speak(self) -> str: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("abstract speak(): string")
    })

    it("should transform @abstractmethod with parameters", () => {
      const python = `from abc import ABC, abstractmethod

class Calculator(ABC):
    @abstractmethod
    def compute(self, x: int, y: int) -> int: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("abstract compute(x: number, y: number): number")
    })

    it("should transform @abstractmethod with None return type as void", () => {
      const python = `from abc import ABC, abstractmethod

class Logger(ABC):
    @abstractmethod
    def log(self, message: str) -> None: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("abstract log(message: string): void")
    })
  })

  describe("Mixed Methods", () => {
    it("should handle both abstract and concrete methods", () => {
      const python = `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

    def describe(self):
        return "A shape"`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("abstract class Shape {")
      expect(result).toContain("abstract area(): number")
      expect(result).toContain("describe() {")
      expect(result).toContain('return "A shape"')
    })
  })

  describe("ABC with Inheritance", () => {
    it("should handle ABC with other parent class", () => {
      const python = `from abc import ABC, abstractmethod

class Base:
    pass

class Child(Base, ABC):
    @abstractmethod
    def method(self) -> None: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("abstract class Child extends Base {")
      expect(result).toContain("abstract method(): void")
    })
  })

  describe("Multiple Abstract Methods", () => {
    it("should handle multiple abstract methods", () => {
      const python = `from abc import ABC, abstractmethod

class Repository(ABC):
    @abstractmethod
    def get(self, id: int) -> str: ...

    @abstractmethod
    def save(self, item: str) -> None: ...

    @abstractmethod
    def delete(self, id: int) -> bool: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("abstract class Repository {")
      expect(result).toContain("abstract get(id: number): string")
      expect(result).toContain("abstract save(item: string): void")
      expect(result).toContain("abstract delete(id: number): boolean")
    })
  })

  describe("ABC Import Stripping", () => {
    it("should strip abc imports", () => {
      const python = `from abc import ABC, abstractmethod

class Shape(ABC):
    pass`
      const result = transpile(python, { includeRuntime: false })
      expect(result).not.toContain("import")
      expect(result).not.toContain("abc")
    })
  })
})
