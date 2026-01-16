import { describe, it, expect } from "vitest"
import { transpile } from "../../src/index.js"

describe("E2E: TypeAlias", () => {
  describe("Basic Type Aliases", () => {
    it("should transform list type alias", () => {
      const python = `from typing import TypeAlias

Vector: TypeAlias = list[float]`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("type Vector = number[]")
    })

    it("should transform tuple type alias", () => {
      const python = `from typing import TypeAlias

Point: TypeAlias = tuple[int, int]`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("type Point = [number, number]")
    })

    it("should transform dict type alias", () => {
      const python = `from typing import TypeAlias

Mapping: TypeAlias = dict[str, int]`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("type Mapping = Record<string, number>")
    })
  })

  describe("Complex Type Aliases", () => {
    it("should transform Union type alias", () => {
      const python = `from typing import TypeAlias, Union

StringOrInt: TypeAlias = Union[str, int]`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("type StringOrInt = string | number")
    })

    it("should transform Optional type alias", () => {
      const python = `from typing import TypeAlias, Optional

MaybeStr: TypeAlias = Optional[str]`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("type MaybeStr = string | null")
    })

    it("should transform nested type alias", () => {
      const python = `from typing import TypeAlias

Matrix: TypeAlias = list[list[float]]`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("type Matrix = number[][]")
    })
  })

  describe("Multiple Type Aliases", () => {
    it("should handle multiple type aliases", () => {
      const python = `from typing import TypeAlias

Name: TypeAlias = str
Age: TypeAlias = int
Names: TypeAlias = list[str]`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("type Name = string")
      expect(result).toContain("type Age = number")
      expect(result).toContain("type Names = string[]")
    })
  })
})
