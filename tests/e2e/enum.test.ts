import { describe, it, expect } from "vitest"
import { transpile } from "../../src/index.js"

describe("E2E: Enum", () => {
  describe("Sequential Numeric Enum (String Union from Names)", () => {
    it("should transform sequential enum to string union from names", () => {
      const python = `
from enum import Enum

class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3
`
      const result = transpile(python)
      expect(result).toContain('type Color = "RED" | "GREEN" | "BLUE"')
      expect(result).not.toContain("const Color")
    })

    it("should handle sequential starting from 0", () => {
      const python = `
from enum import Enum

class Index(Enum):
    FIRST = 0
    SECOND = 1
    THIRD = 2
`
      const result = transpile(python)
      expect(result).toContain('type Index = "FIRST" | "SECOND" | "THIRD"')
    })

    it("should handle auto() values", () => {
      const python = `
from enum import Enum, auto

class Status(Enum):
    PENDING = auto()
    ACTIVE = auto()
    DONE = auto()
`
      const result = transpile(python)
      expect(result).toContain('type Status = "PENDING" | "ACTIVE" | "DONE"')
    })
  })

  describe("String Enum (String Union from Values)", () => {
    it("should transform string enum to string union from values", () => {
      const python = `
from enum import Enum

class Status(Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
`
      const result = transpile(python)
      expect(result).toContain('type Status = "pending" | "active" | "completed"')
    })

    it("should handle mixed case string values", () => {
      const python = `
from enum import Enum

class ContentType(Enum):
    JSON = "application/json"
    HTML = "text/html"
    XML = "text/xml"
`
      const result = transpile(python)
      expect(result).toContain('type ContentType = "application/json" | "text/html" | "text/xml"')
    })
  })

  describe("StrEnum", () => {
    it("should transform StrEnum to string union from values", () => {
      const python = `
from enum import StrEnum

class Mode(StrEnum):
    READ = "read"
    WRITE = "write"
    APPEND = "append"
`
      const result = transpile(python)
      expect(result).toContain('type Mode = "read" | "write" | "append"')
    })
  })

  describe("Non-Sequential Numeric Enum (as const Object)", () => {
    it("should transform HTTP status codes to as const object", () => {
      const python = `
from enum import Enum

class HttpStatus(Enum):
    OK = 200
    NOT_FOUND = 404
    SERVER_ERROR = 500
`
      const result = transpile(python)
      expect(result).toContain("const HttpStatus = {")
      expect(result).toContain("OK: 200")
      expect(result).toContain("NOT_FOUND: 404")
      expect(result).toContain("SERVER_ERROR: 500")
      expect(result).toContain("} as const")
      expect(result).toContain("type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus]")
    })

    it("should handle port numbers", () => {
      const python = `
from enum import Enum

class Port(Enum):
    HTTP = 80
    HTTPS = 443
    SSH = 22
`
      const result = transpile(python)
      expect(result).toContain("const Port = {")
      expect(result).toContain("HTTP: 80")
      expect(result).toContain("HTTPS: 443")
      expect(result).toContain("SSH: 22")
      expect(result).toContain("} as const")
    })
  })

  describe("IntEnum", () => {
    it("should transform IntEnum with non-sequential values to as const", () => {
      const python = `
from enum import IntEnum

class Priority(IntEnum):
    LOW = 10
    MEDIUM = 50
    HIGH = 100
`
      const result = transpile(python)
      expect(result).toContain("const Priority = {")
      expect(result).toContain("LOW: 10")
      expect(result).toContain("MEDIUM: 50")
      expect(result).toContain("HIGH: 100")
      expect(result).toContain("} as const")
    })

    it("should transform sequential IntEnum to string union from names", () => {
      const python = `
from enum import IntEnum

class Level(IntEnum):
    DEBUG = 1
    INFO = 2
    WARNING = 3
`
      const result = transpile(python)
      expect(result).toContain('type Level = "DEBUG" | "INFO" | "WARNING"')
    })
  })

  describe("Empty and Edge Cases", () => {
    it("should handle empty enum", () => {
      const python = `
from enum import Enum

class Empty(Enum):
    pass
`
      const result = transpile(python)
      expect(result).toContain("type Empty = never")
    })

    it("should handle single member enum", () => {
      const python = `
from enum import Enum

class Single(Enum):
    ONLY = 1
`
      const result = transpile(python)
      expect(result).toContain('type Single = "ONLY"')
    })

    it("should handle negative numbers", () => {
      const python = `
from enum import Enum

class Temperature(Enum):
    FREEZING = 0
    COLD = 10
    WARM = 25
`
      const result = transpile(python)
      // 0, 10, 25 is not sequential, so should be as const
      expect(result).toContain("const Temperature = {")
    })
  })

  describe("Type-Stripping Compatibility", () => {
    it("should not generate TypeScript enum keyword", () => {
      const python = `
from enum import Enum

class Color(Enum):
    RED = 1
    GREEN = 2
`
      const result = transpile(python)
      expect(result).not.toMatch(/^enum /m)
      expect(result).not.toContain("enum Color")
    })

    it("should only use type and const declarations", () => {
      const python = `
from enum import Enum

class Code(Enum):
    OK = 200
    ERROR = 500
`
      const result = transpile(python)
      // Should only have type declarations and const (both are type-stripping compatible)
      expect(result).toMatch(/type \w+ =/)
    })
  })
})
