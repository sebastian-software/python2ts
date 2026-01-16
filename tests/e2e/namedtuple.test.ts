import { describe, it, expect } from "vitest"
import { transpile } from "../../src/index.js"

describe("E2E: NamedTuple", () => {
  describe("Basic NamedTuple", () => {
    it("should transform NamedTuple with typed fields", () => {
      const python = `
from typing import NamedTuple

class Point(NamedTuple):
    x: int
    y: int
`
      const result = transpile(python)
      expect(result).toContain("class Point {")
      expect(result).toContain("readonly x: number")
      expect(result).toContain("readonly y: number")
      expect(result).toContain("constructor(x: number, y: number)")
      expect(result).toContain("this.x = x")
      expect(result).toContain("this.y = y")
      expect(result).toContain("Object.freeze(this)")
    })

    it("should not extend NamedTuple in output", () => {
      const python = `
from typing import NamedTuple

class Point(NamedTuple):
    x: int
    y: int
`
      const result = transpile(python)
      expect(result).not.toContain("extends NamedTuple")
      expect(result).not.toContain("extends")
    })
  })

  describe("NamedTuple with Defaults", () => {
    it("should handle default values", () => {
      const python = `
from typing import NamedTuple

class Config(NamedTuple):
    host: str
    port: int = 8080
`
      const result = transpile(python)
      expect(result).toContain("readonly host: string")
      expect(result).toContain("readonly port: number")
      expect(result).toContain("port: number = 8080")
    })

    it("should handle multiple defaults", () => {
      const python = `
from typing import NamedTuple

class Settings(NamedTuple):
    name: str
    timeout: int = 30
    retries: int = 3
`
      const result = transpile(python)
      expect(result).toContain(
        "constructor(name: string, timeout: number = 30, retries: number = 3)"
      )
    })

    it("should handle string defaults", () => {
      const python = `
from typing import NamedTuple

class Person(NamedTuple):
    name: str
    title: str = "Unknown"
`
      const result = transpile(python)
      expect(result).toContain('title: string = "Unknown"')
    })
  })

  describe("NamedTuple with Various Types", () => {
    it("should handle bool type", () => {
      const python = `
from typing import NamedTuple

class Feature(NamedTuple):
    name: str
    enabled: bool
`
      const result = transpile(python)
      expect(result).toContain("readonly enabled: boolean")
    })

    it("should handle Optional type", () => {
      const python = `
from typing import NamedTuple, Optional

class Response(NamedTuple):
    status: int
    error: Optional[str]
`
      const result = transpile(python)
      expect(result).toContain("readonly status: number")
      expect(result).toContain("readonly error: string | null")
    })

    it("should handle List type", () => {
      const python = `
from typing import NamedTuple, List

class Container(NamedTuple):
    items: List[int]
`
      const result = transpile(python)
      expect(result).toContain("readonly items: number[]")
    })
  })

  describe("NamedTuple Immutability", () => {
    it("should have Object.freeze in constructor", () => {
      const python = `
from typing import NamedTuple

class Immutable(NamedTuple):
    value: int
`
      const result = transpile(python)
      expect(result).toContain("Object.freeze(this)")
    })

    it("should have all fields readonly", () => {
      const python = `
from typing import NamedTuple

class Triple(NamedTuple):
    a: int
    b: int
    c: int
`
      const result = transpile(python)
      expect(result).toContain("readonly a: number")
      expect(result).toContain("readonly b: number")
      expect(result).toContain("readonly c: number")
    })
  })

  describe("NamedTuple with Methods", () => {
    it("should preserve methods in NamedTuple", () => {
      const python = `
from typing import NamedTuple

class Vector(NamedTuple):
    x: float
    y: float

    def magnitude(self) -> float:
        return (self.x ** 2 + self.y ** 2) ** 0.5
`
      const result = transpile(python)
      expect(result).toContain("readonly x: number")
      expect(result).toContain("readonly y: number")
      expect(result).toContain("magnitude()")
    })
  })

  describe("Empty NamedTuple", () => {
    it("should handle empty NamedTuple", () => {
      const python = `
from typing import NamedTuple

class Empty(NamedTuple):
    pass
`
      const result = transpile(python)
      expect(result).toContain("class Empty {")
      expect(result).toContain("constructor()")
      expect(result).toContain("Object.freeze(this)")
    })
  })
})
