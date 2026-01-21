import { describe, it, expect } from "vitest"
import * as json from "./json.js"

describe("json module", () => {
  describe("dumps()", () => {
    it("should serialize objects", () => {
      expect(json.dumps({ a: 1 })).toBe('{"a":1}')
    })

    it("should serialize arrays", () => {
      expect(json.dumps([1, 2, 3])).toBe("[1,2,3]")
    })

    it("should support indent", () => {
      const result = json.dumps({ a: 1 }, { indent: 2 })
      expect(result).toContain("\n")
      expect(result).toContain("  ")
    })

    it("should support sortKeys", () => {
      const result = json.dumps({ b: 2, a: 1 }, { sortKeys: true })
      expect(result.indexOf("a")).toBeLessThan(result.indexOf("b"))
    })

    it("should support separators", () => {
      const result = json.dumps({ a: 1, b: 2 }, { separators: ["; ", " = "] })
      expect(result).toContain(" = ")
    })
  })

  describe("loads()", () => {
    it("should parse objects", () => {
      expect(json.loads('{"a":1}')).toEqual({ a: 1 })
    })

    it("should parse arrays", () => {
      expect(json.loads("[1,2,3]")).toEqual([1, 2, 3])
    })

    it("should parse primitives", () => {
      expect(json.loads("42")).toBe(42)
      expect(json.loads('"hello"')).toBe("hello")
      expect(json.loads("true")).toBe(true)
      expect(json.loads("null")).toBe(null)
    })
  })

  describe("dump()", () => {
    it("should call the file-like write method", () => {
      let written = ""
      const file = { write: (s: string) => (written = s) }
      json.dump({ a: 1 }, file)
      expect(written).toBe('{"a":1}')
    })
  })

  describe("load()", () => {
    it("should call the file-like read method", () => {
      const file = { read: () => '{"a":1}' }
      expect(json.load(file)).toEqual({ a: 1 })
    })
  })

  describe("advanced options", () => {
    it("should support ensureAscii: false", () => {
      const result = json.dumps({ name: "日本語" }, { ensureAscii: false })
      expect(result).toContain("日本語")
    })

    it("should escape non-ASCII by default", () => {
      const result = json.dumps({ name: "日本語" })
      expect(result).toContain("\\u")
    })

    it("should support default function", () => {
      const obj = {
        date: { toJSON: () => "2024-01-15" }
      }
      const result = json.dumps(obj, {
        default: (o: unknown) => {
          if (typeof (o as { toJSON?: () => string }).toJSON === "function") {
            return (o as { toJSON: () => string }).toJSON()
          }
          return String(o)
        }
      })
      expect(result).toContain("2024-01-15")
    })

    it("should use sortKeys with nested objects", () => {
      const result = json.dumps({ b: { d: 1, c: 2 }, a: 1 }, { sortKeys: true })
      expect(result.indexOf("a")).toBeLessThan(result.indexOf("b"))
    })

    it("should throw on invalid JSON parse", () => {
      expect(() => json.loads("{invalid}")).toThrow("JSON decode error")
    })
  })
})
