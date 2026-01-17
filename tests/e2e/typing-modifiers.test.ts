import { describe, it, expect } from "vitest"
import { transpile } from "../../src/index"

describe("E2E: Typing Modifiers", () => {
  describe("Final[T]", () => {
    it("should transform module-level Final to const", () => {
      const python = `
from typing import Final

PI: Final[float] = 3.14
`
      const result = transpile(python)
      expect(result).toContain("const PI: number = 3.14")
    })

    it("should transform class-level Final to readonly", () => {
      const python = `
from typing import Final

class Config:
    MAX_SIZE: Final[int] = 100
`
      const result = transpile(python)
      expect(result).toContain("readonly MAX_SIZE: number = 100")
    })

    it("should handle Final with string type", () => {
      const python = `
from typing import Final

APP_NAME: Final[str] = "MyApp"
`
      const result = transpile(python)
      expect(result).toContain('const APP_NAME: string = "MyApp"')
    })

    it("should handle Final with complex types", () => {
      const python = `
from typing import Final, List

DEFAULTS: Final[List[int]] = [1, 2, 3]
`
      const result = transpile(python)
      expect(result).toContain("const DEFAULTS: number[] = [1, 2, 3]")
    })

    it("should handle Final without explicit type argument", () => {
      const python = `
from typing import Final

VALUE: Final = 42
`
      const result = transpile(python)
      expect(result).toContain("const VALUE")
    })
  })

  describe("ClassVar[T]", () => {
    it("should transform ClassVar to static", () => {
      const python = `
from typing import ClassVar

class Counter:
    count: ClassVar[int] = 0
`
      const result = transpile(python)
      expect(result).toContain("static count: number = 0")
    })

    it("should handle ClassVar with complex types", () => {
      const python = `
from typing import ClassVar, Dict

class Registry:
    items: ClassVar[Dict[str, int]] = {}
`
      const result = transpile(python)
      expect(result).toContain("static items: Record<string, number>")
      // The value could be {} or {  } depending on formatting
      expect(result).toMatch(/static items: Record<string, number> = \{\s*\}/)
    })

    it("should handle multiple ClassVar fields", () => {
      const python = `
from typing import ClassVar

class Stats:
    count: ClassVar[int] = 0
    total: ClassVar[float] = 0.0
`
      const result = transpile(python)
      expect(result).toContain("static count: number = 0")
      expect(result).toContain("static total: number = 0.0")
    })
  })

  describe("Combined Modifiers", () => {
    it("should handle regular properties alongside Final/ClassVar", () => {
      const python = `
from typing import Final, ClassVar

class Config:
    MAX: Final[int] = 100
    instance_count: ClassVar[int] = 0
    name: str = "default"
`
      const result = transpile(python)
      expect(result).toContain("readonly MAX: number = 100")
      expect(result).toContain("static instance_count: number = 0")
      expect(result).toContain('name: string = "default"')
      // Regular property should NOT have readonly or static
      expect(result).not.toContain("readonly name")
      expect(result).not.toContain("static name")
    })

    it("should handle type-only declarations with modifiers", () => {
      const python = `
from typing import ClassVar

class Example:
    shared: ClassVar[int]
`
      const result = transpile(python)
      expect(result).toContain("static shared: number")
    })
  })
})
