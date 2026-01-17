import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

describe("E2E: TypedDict", () => {
  describe("Basic TypedDict", () => {
    it("should transform TypedDict to interface", () => {
      const python = `
from typing import TypedDict

class Config(TypedDict):
    host: str
    port: int
`
      const result = transpile(python)
      expect(result).toContain("interface Config {")
      expect(result).toContain("host: string")
      expect(result).toContain("port: number")
      expect(result).not.toContain("extends TypedDict")
    })

    it("should handle multiple fields", () => {
      const python = `
from typing import TypedDict

class User(TypedDict):
    name: str
    age: int
    email: str
    active: bool
`
      const result = transpile(python)
      expect(result).toContain("interface User {")
      expect(result).toContain("name: string")
      expect(result).toContain("age: number")
      expect(result).toContain("email: string")
      expect(result).toContain("active: boolean")
    })
  })

  describe("TypedDict with total=False", () => {
    it("should make all fields optional", () => {
      const python = `
from typing import TypedDict

class Config(TypedDict, total=False):
    host: str
    port: int
`
      const result = transpile(python)
      expect(result).toContain("interface Config {")
      expect(result).toContain("host?: string")
      expect(result).toContain("port?: number")
    })
  })

  describe("TypedDict with Nested Types", () => {
    it("should handle List types", () => {
      const python = `
from typing import TypedDict, List

class Config(TypedDict):
    hosts: List[str]
    ports: List[int]
`
      const result = transpile(python)
      expect(result).toContain("hosts: string[]")
      expect(result).toContain("ports: number[]")
    })

    it("should handle Dict types", () => {
      const python = `
from typing import TypedDict, Dict

class Config(TypedDict):
    metadata: Dict[str, str]
`
      const result = transpile(python)
      expect(result).toContain("metadata: Record<string, string>")
    })

    it("should handle Optional types", () => {
      const python = `
from typing import TypedDict, Optional

class Config(TypedDict):
    host: str
    port: Optional[int]
`
      const result = transpile(python)
      expect(result).toContain("host: string")
      expect(result).toContain("port: number | null")
    })
  })

  describe("Empty TypedDict", () => {
    it("should handle empty TypedDict", () => {
      const python = `
from typing import TypedDict

class Empty(TypedDict):
    pass
`
      const result = transpile(python)
      expect(result).toContain("interface Empty {}")
    })
  })

  describe("TypedDict Output Format", () => {
    it("should not include class keyword", () => {
      const python = `
from typing import TypedDict

class Config(TypedDict):
    host: str
`
      const result = transpile(python)
      expect(result).not.toMatch(/class Config/)
      expect(result).toContain("interface Config")
    })

    it("should not include constructor", () => {
      const python = `
from typing import TypedDict

class Config(TypedDict):
    host: str
`
      const result = transpile(python)
      expect(result).not.toContain("constructor")
    })
  })
})
