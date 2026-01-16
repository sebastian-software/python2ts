import { describe, it, expect } from "vitest"
import { transpile } from "../../src/index.js"

describe("E2E: Function Overloads", () => {
  describe("Basic Overloads", () => {
    it("should transform @overload to function signature", () => {
      const python = `from typing import overload

@overload
def process(x: int) -> int: ...
@overload
def process(x: str) -> str: ...
def process(x):
    return x`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("function process(x: number): number")
      expect(result).toContain("function process(x: string): string")
      expect(result).toContain("function process(x) {")
      expect(result).toContain("return x")
    })

    it("should not wrap @overload in const", () => {
      const python = `from typing import overload

@overload
def foo(x: int) -> int: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("function foo(x: number): number")
      expect(result).not.toContain("const foo =")
    })
  })

  describe("Overload Return Types", () => {
    it("should handle None return type as void", () => {
      const python = `from typing import overload

@overload
def log(x: str) -> None: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("function log(x: string): void")
    })

    it("should handle complex return types", () => {
      const python = `from typing import overload, List

@overload
def get_items(count: int) -> List[str]: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("function get_items(count: number): string[]")
    })
  })

  describe("Multiple Parameters", () => {
    it("should handle overloads with multiple parameters", () => {
      const python = `from typing import overload

@overload
def add(a: int, b: int) -> int: ...
@overload
def add(a: str, b: str) -> str: ...
def add(a, b):
    return a + b`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("function add(a: number, b: number): number")
      expect(result).toContain("function add(a: string, b: string): string")
    })
  })

  describe("Three or More Overloads", () => {
    it("should handle three overloads", () => {
      const python = `from typing import overload

@overload
def convert(x: int) -> str: ...
@overload
def convert(x: str) -> int: ...
@overload
def convert(x: float) -> str: ...
def convert(x):
    if isinstance(x, int):
        return str(x)
    elif isinstance(x, str):
        return int(x)
    else:
        return str(x)`
      const result = transpile(python, { includeRuntime: false })
      expect(result).toContain("function convert(x: number): string")
      expect(result).toContain("function convert(x: string): number")
      // float maps to number in TS
      expect(result.match(/function convert\(x: number\)/g)?.length).toBe(2)
    })
  })

  describe("Overload Import Stripping", () => {
    it("should strip typing imports", () => {
      const python = `from typing import overload

@overload
def foo(x: int) -> int: ...`
      const result = transpile(python, { includeRuntime: false })
      expect(result).not.toContain("import")
      expect(result).not.toContain("overload")
    })
  })
})
