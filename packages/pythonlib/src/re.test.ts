import { describe, it, expect } from "vitest"
import * as re from "./re.js"

describe("re module", () => {
  describe("search()", () => {
    it("should find a match", () => {
      const m = re.search("world", "hello world")
      expect(m).not.toBeNull()
      expect(m?.group(0)).toBe("world")
    })

    it("should return null if no match", () => {
      const m = re.search("xyz", "hello world")
      expect(m).toBeNull()
    })

    it("should support named groups", () => {
      const m = re.search("(?<name>\\w+)@(?<domain>\\w+)", "user@example")
      expect(m?.group("name")).toBe("user")
      expect(m?.group("domain")).toBe("example")
    })
  })

  describe("match()", () => {
    it("should match at start of string", () => {
      const m = re.match("hello", "hello world")
      expect(m).not.toBeNull()
      expect(m?.group(0)).toBe("hello")
    })

    it("should return null if not at start", () => {
      const m = re.match("world", "hello world")
      expect(m).toBeNull()
    })
  })

  describe("fullMatch()", () => {
    it("should match entire string", () => {
      const m = re.fullMatch("\\d+", "12345")
      expect(m).not.toBeNull()
    })

    it("should return null for partial match", () => {
      const m = re.fullMatch("\\d+", "123abc")
      expect(m).toBeNull()
    })
  })

  describe("findAll()", () => {
    it("should find all matches", () => {
      const matches = re.findAll("\\d+", "a1b2c3")
      expect(matches).toEqual(["1", "2", "3"])
    })

    it("should return empty array for no matches", () => {
      const matches = re.findAll("\\d+", "abc")
      expect(matches).toEqual([])
    })
  })

  describe("findIter()", () => {
    it("should iterate over matches", () => {
      const matches = [...re.findIter("\\d+", "a1b2c3")]
      expect(matches).toHaveLength(3)
      expect(matches[0]?.group(0)).toBe("1")
    })
  })

  describe("split()", () => {
    it("should split by pattern", () => {
      const parts = re.split("[,;]", "a,b;c")
      expect(parts).toEqual(["a", "b", "c"])
    })

    it("should support maxsplit", () => {
      const parts = re.split(",", "a,b,c,d", 2)
      expect(parts).toEqual(["a", "b", "c,d"])
    })
  })

  describe("sub()", () => {
    it("should replace matches", () => {
      expect(re.sub("\\d", "X", "a1b2c3")).toBe("aXbXcX")
    })

    it("should support count", () => {
      expect(re.sub("\\d", "X", "a1b2c3", 2)).toBe("aXbXc3")
    })

    it("should support function replacement", () => {
      const result = re.sub(
        "\\d",
        (m: re.Match) => String(parseInt(m.group(0) ?? "0") * 2),
        "a1b2c3"
      )
      expect(result).toBe("a2b4c6")
    })
  })

  describe("subn()", () => {
    it("should return replacement count", () => {
      const [result, count] = re.subn("\\d", "X", "a1b2c3")
      expect(result).toBe("aXbXcX")
      expect(count).toBe(3)
    })
  })

  describe("compile()", () => {
    it("should create a compiled pattern", () => {
      const pattern = re.compile("\\d+")
      const m = pattern.search("abc123")
      expect(m?.group(0)).toBe("123")
    })
  })

  describe("escape()", () => {
    it("should escape special characters", () => {
      expect(re.escape("a.b*c?")).toBe("a\\.b\\*c\\?")
    })
  })

  describe("purge()", () => {
    it("should be callable (no-op)", () => {
      expect(() => {
        re.purge()
      }).not.toThrow()
    })
  })

  describe("flags", () => {
    it("should support IGNORECASE", () => {
      const m = re.search("hello", "HELLO WORLD", re.IGNORECASE)
      expect(m).not.toBeNull()
    })

    it("should support MULTILINE", () => {
      const m = re.search("^world", "hello\nworld", re.MULTILINE)
      expect(m).not.toBeNull()
    })

    it("should support DOTALL", () => {
      const m = re.search("a.b", "a\nb", re.DOTALL)
      expect(m).not.toBeNull()
    })

    it("should expose flag aliases", () => {
      expect(re.I).toBe(re.IGNORECASE)
      expect(re.M).toBe(re.MULTILINE)
      expect(re.S).toBe(re.DOTALL)
      expect(re.U).toBe(re.UNICODE)
      expect(re.A).toBe(re.ASCII)
    })
  })

  describe("Match object", () => {
    it("should provide groups()", () => {
      const m = re.search("(\\w+)@(\\w+)", "user@example")
      expect(m?.groups()).toEqual(["user", "example"])
    })

    it("should provide groups() with default value", () => {
      const m = re.search("(\\w+)(?:@(\\w+))?", "user")
      const groups = m?.groups("default")
      expect(groups).toBeDefined()
    })

    it("should provide groupDict()", () => {
      const m = re.search("(?<name>\\w+)@(?<domain>\\w+)", "user@example")
      expect(m?.groupDict()).toEqual({ name: "user", domain: "example" })
    })

    it("should provide groupDict() with default value", () => {
      const m = re.search("(?<name>\\w+)", "user")
      expect(m?.groupDict("default")).toEqual({ name: "user" })
    })

    it("should provide start() and end()", () => {
      const m = re.search("world", "hello world")
      expect(m?.start()).toBe(6)
      expect(m?.end()).toBe(11)
    })

    it("should provide start/end for groups", () => {
      const m = re.search("(\\w+)@(\\w+)", "test user@example")
      expect(m?.start(1)).toBeGreaterThanOrEqual(0)
      expect(m?.end(1)).toBeGreaterThan(0)
    })

    it("should return -1 for non-matched groups", () => {
      const m = re.search("(a)|(b)", "b")
      expect(m?.start(1)).toBe(-1)
      expect(m?.end(1)).toBe(-1)
    })

    it("should provide span()", () => {
      const m = re.search("world", "hello world")
      const [start, end] = m?.span() ?? [-1, -1]
      expect(start).toBe(6)
      expect(end).toBe(11)
    })

    it("should provide pos and endpos", () => {
      const p = re.compile("\\w+")
      const m = p.search("hello world", 2, 8)
      expect(m?.pos).toBe(2)
      expect(m?.endpos).toBe(8)
    })

    it("should provide lastIndex", () => {
      const m = re.search("(\\w+)(\\d+)", "abc123")
      expect(m?.lastIndex).toBe(2)
    })

    it("should provide lastGroup", () => {
      const m = re.search("(?<word>\\w+)(?<num>\\d+)", "abc123")
      expect(m?.lastGroup).toBe("num")
    })

    it("should provide re property", () => {
      const p = re.compile("\\w+")
      const m = p.search("hello")
      expect(m?.re).toBe(p)
    })

    it("should provide string property", () => {
      const m = re.search("\\w+", "hello world")
      expect(m?.string).toBe("hello world")
    })

    it("should expand templates", () => {
      const m = re.search("(\\w+)@(\\w+)", "user@example")
      expect(m?.expand("Name: \\1, Domain: \\2")).toBe("Name: user, Domain: example")
    })

    it("should expand named group templates", () => {
      const m = re.search("(?<name>\\w+)@(?<domain>\\w+)", "user@example")
      expect(m?.expand("\\g<name> at \\g<domain>")).toBe("user at example")
    })

    it("should be iterable", () => {
      const m = re.search("(\\w+)@(\\w+)", "user@example")
      const parts = [...(m ?? [])]
      expect(parts).toEqual(["user@example", "user", "example"])
    })

    it("should convert to string", () => {
      const m = re.search("world", "hello world")
      expect(m?.toString()).toContain("span=")
      expect(m?.toString()).toContain("match=")
    })
  })

  describe("Pattern object", () => {
    it("should have pattern property", () => {
      const p = re.compile("\\w+")
      expect(p.pattern).toBe("\\w+")
    })

    it("should have flags property", () => {
      const p = re.compile("\\w+", re.IGNORECASE)
      expect(p.flags).toBe(re.IGNORECASE)
    })

    it("should count groups", () => {
      const p = re.compile("(\\w+)@(\\w+)")
      expect(p.groups).toBe(2)
    })

    it("should count named groups", () => {
      const p = re.compile("(?<name>\\w+)@(?<domain>\\w+)")
      expect(p.groups).toBe(2)
    })

    it("should provide groupIndex", () => {
      const p = re.compile("(?<name>\\w+)@(?<domain>\\w+)")
      expect(p.groupIndex).toEqual({ name: 1, domain: 2 })
    })

    it("should convert to string", () => {
      const p = re.compile("\\w+")
      expect(p.toString()).toContain("re.compile")
    })

    it("should support search with pos/endpos", () => {
      const p = re.compile("\\w+")
      const m = p.search("  hello world  ", 2, 7)
      expect(m?.group()).toBe("hello")
    })

    it("should support match with pos/endpos", () => {
      const p = re.compile("\\w+")
      const m = p.match("  hello", 2)
      expect(m?.group()).toBe("hello")
    })

    it("should support fullMatch with pos/endpos", () => {
      const p = re.compile("\\d+")
      const m = p.fullMatch("  123  ", 2, 5)
      expect(m?.group()).toBe("123")
    })

    it("should split with captured groups", () => {
      const p = re.compile("(,)")
      const parts = p.split("a,b,c")
      expect(parts).toContain(",")
    })

    it("should findAll with groups", () => {
      const p = re.compile("(\\w)(\\d)")
      const matches = p.findAll("a1b2c3")
      expect(matches.length).toBe(3)
    })

    it("should findAll returning single group", () => {
      const p = re.compile("(\\w)\\d")
      const matches = p.findAll("a1b2c3")
      expect(matches).toEqual(["a", "b", "c"])
    })

    it("should support findIter with pos/endpos", () => {
      const p = re.compile("\\d+")
      const matches = [...p.findIter("a1b22c333", 2, 7)]
      expect(matches.length).toBeGreaterThan(0)
    })

    it("should support sub with function and count", () => {
      const p = re.compile("\\d")
      let called = 0
      p.sub(
        () => {
          called++
          return "X"
        },
        "a1b2c3",
        2
      )
      expect(called).toBeGreaterThan(0)
    })

    it("should support sub with backreferences", () => {
      const p = re.compile("(\\w+)@(\\w+)")
      const result = p.sub("\\2-\\1", "user@host")
      expect(result).toBe("host-user")
    })

    it("should support sub with limited count", () => {
      const p = re.compile("\\d")
      const result = p.sub("X", "a1b2c3", 1)
      expect(result).toBe("aXb2c3")
    })

    it("should support subn with function", () => {
      const p = re.compile("\\d")
      const [result, count] = p.subn(
        (m: re.Match) => String(parseInt(m.group(0) ?? "0") * 2),
        "a1b2"
      )
      expect(result).toBe("a2b4")
      expect(count).toBe(2)
    })

    it("should convert Python named groups to JS", () => {
      const p = re.compile("(?P<name>\\w+)")
      const m = p.search("hello")
      expect(m?.group("name")).toBe("hello")
    })
  })
})
