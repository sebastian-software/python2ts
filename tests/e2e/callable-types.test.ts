import { describe, it, expect } from "vitest"
import { transpile } from "../../src/index"

describe("E2E: Callable Types", () => {
  describe("Enhanced Callable Transformation", () => {
    it("should transform Callable with parameter types", () => {
      const python = `
from typing import Callable

def run(f: Callable[[int, str], bool]):
    pass
`
      const result = transpile(python)
      expect(result).toContain("(arg0: number, arg1: string) => boolean")
    })

    it("should transform Callable with single parameter", () => {
      const python = `
from typing import Callable

def execute(handler: Callable[[int], str]):
    pass
`
      const result = transpile(python)
      expect(result).toContain("(arg0: number) => string")
    })

    it("should transform Callable with no parameters", () => {
      const python = `
from typing import Callable

def trigger(callback: Callable[[], None]):
    pass
`
      const result = transpile(python)
      expect(result).toContain("() => null")
    })

    it("should transform Callable with complex parameter types in function", () => {
      const python = `
from typing import Callable, List, Dict

def process(handler: Callable[[List[int], Dict[str, bool]], None]):
    pass
`
      const result = transpile(python)
      expect(result).toContain("(arg0: number[], arg1: Record<string, boolean>) => null")
    })

    it("should handle Callable in function signatures", () => {
      const python = `
from typing import Callable

def apply(func: Callable[[int], int], value: int) -> int:
    return func(value)
`
      const result = transpile(python)
      expect(result).toContain("func: (arg0: number) => number")
      expect(result).toContain("value: number")
    })

    it("should handle nested Callable types in function", () => {
      const python = `
from typing import Callable

def create(factory: Callable[[], Callable[[int], str]]):
    pass
`
      const result = transpile(python)
      expect(result).toContain("() => (arg0: number) => string")
    })

    it("should fallback for bare Callable in function", () => {
      const python = `
from typing import Callable

def run(callback: Callable):
    pass
`
      const result = transpile(python)
      // Bare Callable without type args maps to basic function type
      expect(result).toContain("callback: Callable")
    })
  })
})
