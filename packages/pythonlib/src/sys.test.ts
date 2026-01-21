import { describe, it, expect } from "vitest"
import * as sys from "./sys.js"

describe("sys module", () => {
  describe("argv", () => {
    it("should be an array", () => {
      expect(Array.isArray(sys.argv)).toBe(true)
    })
  })

  describe("platform", () => {
    it("should return a string identifying the platform", () => {
      expect(typeof sys.platform).toBe("string")
      expect(["darwin", "linux", "win32", "freebsd", "openbsd", "sunos", "aix"]).toContain(
        sys.platform
      )
    })
  })

  describe("version", () => {
    it("should contain version information", () => {
      expect(sys.version).toContain("3.11")
      expect(sys.version).toContain("pythonlib")
    })
  })

  describe("versionInfo", () => {
    it("should have major, minor, micro components", () => {
      expect(sys.versionInfo.major).toBe(3)
      expect(sys.versionInfo.minor).toBe(11)
      expect(sys.versionInfo.micro).toBe(0)
      expect(sys.versionInfo.releaselevel).toBe("final")
    })

    it("should be tuple-like (indexable)", () => {
      expect(sys.versionInfo[0]).toBe(3)
      expect(sys.versionInfo[1]).toBe(11)
      expect(sys.versionInfo[2]).toBe(0)
    })

    it("should be iterable", () => {
      const parts = [...sys.versionInfo]
      expect(parts).toEqual([3, 11, 0, "final", 0])
    })
  })

  describe("executable", () => {
    it("should return path to Node.js executable", () => {
      expect(sys.executable).toContain("node")
    })
  })

  describe("path", () => {
    it("should be an array", () => {
      expect(Array.isArray(sys.path)).toBe(true)
    })
  })

  describe("maxsize", () => {
    it("should equal Number.MAX_SAFE_INTEGER", () => {
      expect(sys.maxsize).toBe(Number.MAX_SAFE_INTEGER)
    })
  })

  describe("stdin/stdout/stderr", () => {
    it("should have stdin", () => {
      expect(sys.stdin).toBe(process.stdin)
    })

    it("should have stdout", () => {
      expect(sys.stdout).toBe(process.stdout)
    })

    it("should have stderr", () => {
      expect(sys.stderr).toBe(process.stderr)
    })
  })

  describe("getRecursionLimit()", () => {
    it("should return a number", () => {
      expect(sys.getRecursionLimit()).toBe(1000)
    })
  })

  describe("setRecursionLimit()", () => {
    it("should not throw", () => {
      expect(() => {
        sys.setRecursionLimit(2000)
      }).not.toThrow()
    })
  })

  describe("getSizeOf()", () => {
    it("should return size for primitives", () => {
      expect(sys.getSizeOf(null)).toBe(0)
      expect(sys.getSizeOf(undefined)).toBe(0)
      expect(sys.getSizeOf(true)).toBe(4)
      expect(sys.getSizeOf(42)).toBe(8)
      expect(sys.getSizeOf("hello")).toBe(10) // 5 chars * 2 bytes
    })

    it("should return size for objects", () => {
      const size = sys.getSizeOf({ a: 1, b: 2 })
      expect(size).toBeGreaterThan(0)
    })

    it("should handle circular references", () => {
      const obj: Record<string, unknown> = { a: 1 }
      obj.self = obj
      expect(() => sys.getSizeOf(obj)).not.toThrow()
    })
  })

  describe("getRefCount()", () => {
    it("should return 1 (placeholder)", () => {
      expect(sys.getRefCount({})).toBe(1)
    })
  })

  describe("getDefaultEncoding()", () => {
    it("should return utf-8", () => {
      expect(sys.getDefaultEncoding()).toBe("utf-8")
    })
  })

  describe("getFilesystemEncoding()", () => {
    it("should return utf-8", () => {
      expect(sys.getFilesystemEncoding()).toBe("utf-8")
    })
  })

  describe("byteorder", () => {
    it("should be little or big", () => {
      expect(["little", "big"]).toContain(sys.byteorder)
    })
  })

  describe("floatInfo", () => {
    it("should have max and min values", () => {
      expect(sys.floatInfo.max).toBe(Number.MAX_VALUE)
      expect(sys.floatInfo.min).toBe(Number.MIN_VALUE)
      expect(sys.floatInfo.epsilon).toBe(Number.EPSILON)
    })
  })

  describe("intInfo", () => {
    it("should have bits and size info", () => {
      expect(sys.intInfo.bitsPerDigit).toBe(30)
      expect(sys.intInfo.sizeofDigit).toBe(4)
    })
  })
})
