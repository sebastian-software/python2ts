/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect } from "vitest"
import { transpile } from "../../src/generator/index.js"
import { py } from "../../src/runtime/index.js"

describe("E2E: re module", () => {
  describe("Import Handling", () => {
    it("should strip import re", () => {
      const result = transpile("import re", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })

    it("should strip from re import", () => {
      const result = transpile("from re import search, match, compile", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })
  })

  describe("Function Transformations", () => {
    it("should transform re.search", () => {
      const result = transpile("m = re.search(r'\\d+', text)", { includeRuntime: false })
      expect(result).toContain("py.re.search")
    })

    it("should transform re.match", () => {
      const result = transpile("m = re.match(r'^hello', text)", { includeRuntime: false })
      expect(result).toContain("py.re.match")
    })

    it("should transform re.compile", () => {
      const result = transpile("pattern = re.compile(r'\\d+')", { includeRuntime: false })
      expect(result).toContain("py.re.compile")
    })

    it("should transform re.IGNORECASE", () => {
      const result = transpile("flags = re.IGNORECASE", { includeRuntime: false })
      expect(result).toContain("py.re.IGNORECASE")
    })
  })

  describe("Runtime: compile and Pattern", () => {
    it("should compile a pattern", () => {
      const pattern = py.re.compile("\\d+")
      expect(pattern.pattern).toBe("\\d+")
    })

    it("should compile with flags", () => {
      const pattern = py.re.compile("hello", py.re.IGNORECASE)
      expect(pattern.flags).toBe(py.re.IGNORECASE)
    })
  })

  describe("Runtime: search", () => {
    it("should find a match", () => {
      const m = py.re.search("\\d+", "abc123def")
      expect(m).not.toBeNull()
      expect(m!.group()).toBe("123")
    })

    it("should return null if no match", () => {
      const m = py.re.search("\\d+", "abcdef")
      expect(m).toBeNull()
    })

    it("should find at any position", () => {
      const m = py.re.search("world", "hello world")
      expect(m).not.toBeNull()
      expect(m!.start()).toBe(6)
    })
  })

  describe("Runtime: match", () => {
    it("should match at start", () => {
      const m = py.re.match("hello", "hello world")
      expect(m).not.toBeNull()
      expect(m!.group()).toBe("hello")
    })

    it("should not match if not at start", () => {
      const m = py.re.match("world", "hello world")
      expect(m).toBeNull()
    })
  })

  describe("Runtime: fullmatch", () => {
    it("should match entire string", () => {
      const m = py.re.fullmatch("\\d+", "123")
      expect(m).not.toBeNull()
    })

    it("should not match partial string", () => {
      const m = py.re.fullmatch("\\d+", "123abc")
      expect(m).toBeNull()
    })
  })

  describe("Runtime: findall", () => {
    it("should find all matches", () => {
      const result = py.re.findall("\\d+", "abc123def456ghi789")
      expect(result).toEqual(["123", "456", "789"])
    })

    it("should return empty array if no matches", () => {
      const result = py.re.findall("\\d+", "abcdef")
      expect(result).toEqual([])
    })

    it("should return groups if pattern has groups", () => {
      const result = py.re.findall("(\\d)(\\d)", "12 34 56")
      expect(result).toEqual([
        ["1", "2"],
        ["3", "4"],
        ["5", "6"]
      ])
    })
  })

  describe("Runtime: split", () => {
    it("should split by pattern", () => {
      const result = py.re.split("\\s+", "hello world  foo")
      expect(result).toEqual(["hello", "world", "foo"])
    })

    it("should respect maxsplit", () => {
      const result = py.re.split("\\s+", "a b c d", 2)
      expect(result).toEqual(["a", "b", "c d"])
    })
  })

  describe("Runtime: sub", () => {
    it("should replace matches", () => {
      const result = py.re.sub("\\d+", "X", "abc123def456")
      expect(result).toBe("abcXdefX")
    })

    it("should respect count", () => {
      const result = py.re.sub("\\d+", "X", "abc123def456", 1)
      expect(result).toBe("abcXdef456")
    })
  })

  describe("Runtime: Match object", () => {
    it("should return groups", () => {
      const m = py.re.search("(\\d+)-(\\d+)", "abc123-456def")
      expect(m).not.toBeNull()
      expect(m!.group(0)).toBe("123-456")
      expect(m!.group(1)).toBe("123")
      expect(m!.group(2)).toBe("456")
      expect(m!.groups()).toEqual(["123", "456"])
    })

    it("should support named groups", () => {
      const m = py.re.search("(?P<first>\\d+)-(?P<second>\\d+)", "abc123-456def")
      expect(m).not.toBeNull()
      expect(m!.group("first")).toBe("123")
      expect(m!.group("second")).toBe("456")
      expect(m!.groupdict()).toEqual({ first: "123", second: "456" })
    })

    it("should return span", () => {
      const m = py.re.search("\\d+", "abc123def")
      expect(m).not.toBeNull()
      expect(m!.span()).toEqual([3, 6])
    })
  })

  describe("Runtime: escape", () => {
    it("should escape special characters", () => {
      const result = py.re.escape("hello.world*")
      expect(result).toBe("hello\\.world\\*")
    })
  })

  describe("Runtime: flags", () => {
    it("should have IGNORECASE flag", () => {
      expect(py.re.IGNORECASE).toBe(2)
      expect(py.re.I).toBe(2)
    })

    it("should have MULTILINE flag", () => {
      expect(py.re.MULTILINE).toBe(8)
      expect(py.re.M).toBe(8)
    })

    it("should have DOTALL flag", () => {
      expect(py.re.DOTALL).toBe(16)
      expect(py.re.S).toBe(16)
    })
  })

  describe("Runtime: case insensitive", () => {
    it("should match case insensitively", () => {
      const m = py.re.search("hello", "HELLO WORLD", py.re.IGNORECASE)
      expect(m).not.toBeNull()
      expect(m!.group()).toBe("HELLO")
    })
  })
})
