import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

describe("E2E: @dataclass", () => {
  describe("basic dataclass", () => {
    it("should transform dataclass with typed fields", () => {
      const python = `@dataclass
class Person:
    name: str
    age: int`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("class Person")
      expect(result).toContain("name: string;")
      expect(result).toContain("age: number;")
      expect(result).toContain("constructor(name: string, age: number)")
      expect(result).toContain("this.name = name;")
      expect(result).toContain("this.age = age;")
    })

    it("should handle dataclasses.dataclass import form", () => {
      const python = `@dataclasses.dataclass
class Point:
    x: float
    y: float`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("class Point")
      expect(result).toContain("x: number;")
      expect(result).toContain("y: number;")
    })
  })

  describe("default values", () => {
    it("should handle fields with default values", () => {
      const python = `@dataclass
class Config:
    debug: bool = False
    timeout: int = 30
    name: str = "default"`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("debug: boolean = false;")
      expect(result).toContain("timeout: number = 30;")
      expect(result).toContain('name: string = "default";')
      expect(result).toContain(
        "constructor(debug: boolean = false, timeout: number = 30, name: string = "
      )
    })

    it("should handle mixed required and optional fields", () => {
      const python = `@dataclass
class User:
    id: int
    name: str = "Anonymous"`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("id: number;")
      expect(result).toContain('name: string = "Anonymous";')
      expect(result).toContain('constructor(id: number, name: string = "Anonymous")')
    })
  })

  describe("frozen dataclass", () => {
    it("should add readonly modifier and Object.freeze", () => {
      const python = `@dataclass(frozen=True)
class Point:
    x: int
    y: int`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("readonly x: number;")
      expect(result).toContain("readonly y: number;")
      expect(result).toContain("Object.freeze(this);")
    })
  })

  describe("field with default_factory", () => {
    it("should transform field(default_factory=list)", () => {
      const python = `@dataclass
class Container:
    items: list[str] = field(default_factory=list)`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("items: string[];")
      expect(result).toContain("constructor(items: string[] = [])")
    })

    it("should transform field(default_factory=dict)", () => {
      const python = `@dataclass
class Cache:
    data: dict[str, int] = field(default_factory=dict)`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("data: Record<string, number>;")
      expect(result).toContain("constructor(data: Record<string, number> = {})")
    })

    it("should transform field(default_factory=set)", () => {
      const python = `@dataclass
class Tags:
    values: set[str] = field(default_factory=set)`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("values: Set<string>;")
      expect(result).toContain("constructor(values: Set<string> = new Set())")
    })
  })

  describe("inheritance", () => {
    it("should handle dataclass with inheritance", () => {
      const python = `@dataclass
class Employee(Person):
    salary: float`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("class Employee extends Person")
      expect(result).toContain("salary: number;")
      expect(result).toContain("super();")
    })
  })

  describe("methods", () => {
    it("should preserve additional methods", () => {
      const python = `@dataclass
class Point:
    x: int
    y: int

    def distance(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("x: number;")
      expect(result).toContain("y: number;")
      expect(result).toContain("distance()")
      expect(result).toContain("this.x")
    })

    it("should handle static methods in dataclass", () => {
      const python = `@dataclass
class Point:
    x: int
    y: int

    @staticmethod
    def origin():
        return Point(0, 0)`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("static origin()")
    })
  })

  describe("docstrings", () => {
    it("should convert class docstring to JSDoc", () => {
      const python = `@dataclass
class Person:
    """Represents a person."""
    name: str
    age: int`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("/**")
      expect(result).toContain("Represents a person.")
      expect(result).toContain("*/")
    })
  })

  describe("complex types", () => {
    it("should handle Optional types", () => {
      const python = `@dataclass
class Response:
    data: str
    error: Optional[str] = None`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("data: string;")
      expect(result).toContain("error: string | null = null;")
    })

    it("should handle nested generic types", () => {
      const python = `@dataclass
class Data:
    matrix: list[list[int]]`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("matrix: number[][];")
    })
  })

  describe("edge cases", () => {
    it("should handle empty dataclass", () => {
      const python = `@dataclass
class Empty:
    pass`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("class Empty")
      expect(result).toContain("constructor()")
    })

    it("should skip fields without type annotations", () => {
      const python = `@dataclass
class Mixed:
    typed: str
    untyped = "ignored"
    another_typed: int`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("typed: string;")
      expect(result).toContain("another_typed: number;")
      expect(result).not.toContain("untyped")
    })
  })
})
