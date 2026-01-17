import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { py } from "pythonlib"

describe("E2E: json module", () => {
  describe("Import Handling", () => {
    it("should strip import json", () => {
      const result = transpile("import json", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })

    it("should strip from json import", () => {
      const result = transpile("from json import loads, dumps", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })
  })

  describe("Function Transformations", () => {
    it("should transform json.loads", () => {
      const result = transpile("x = json.loads('{\"a\": 1}')", { includeRuntime: false })
      expect(result).toContain("py.json.loads")
    })

    it("should transform json.dumps", () => {
      const result = transpile("x = json.dumps(data)", { includeRuntime: false })
      expect(result).toContain("py.json.dumps(data)")
    })

    it("should transform bare loads call", () => {
      const result = transpile("x = loads('{\"a\": 1}')", { includeRuntime: false })
      expect(result).toContain("py.json.loads")
    })

    it("should transform bare dumps call", () => {
      const result = transpile("x = dumps(data)", { includeRuntime: false })
      expect(result).toContain("py.json.dumps(data)")
    })
  })

  describe("Runtime Functions", () => {
    describe("py.json.loads", () => {
      it("should parse simple JSON object", () => {
        const result = py.json.loads('{"a": 1, "b": 2}')
        expect(result).toEqual({ a: 1, b: 2 })
      })

      it("should parse JSON array", () => {
        const result = py.json.loads("[1, 2, 3]")
        expect(result).toEqual([1, 2, 3])
      })

      it("should parse nested JSON", () => {
        const result = py.json.loads('{"a": {"b": [1, 2, 3]}}')
        expect(result).toEqual({ a: { b: [1, 2, 3] } })
      })

      it("should parse JSON with various types", () => {
        const result = py.json.loads('{"str": "hello", "num": 42, "bool": true, "null": null}')
        expect(result).toEqual({ str: "hello", num: 42, bool: true, null: null })
      })

      it("should throw on invalid JSON", () => {
        expect(() => py.json.loads("invalid")).toThrow()
      })
    })

    describe("py.json.dumps", () => {
      it("should serialize simple object", () => {
        const result = py.json.dumps({ a: 1, b: 2 })
        expect(JSON.parse(result)).toEqual({ a: 1, b: 2 })
      })

      it("should serialize array", () => {
        const result = py.json.dumps([1, 2, 3])
        expect(result).toBe("[1,2,3]")
      })

      it("should serialize with indent", () => {
        const result = py.json.dumps({ a: 1 }, { indent: 2 })
        expect(result).toContain("\n")
        expect(result).toContain("  ")
      })

      it("should serialize with sort_keys", () => {
        const result = py.json.dumps({ c: 3, a: 1, b: 2 }, { sort_keys: true })
        const parsed = JSON.parse(result) as Record<string, number>
        expect(Object.keys(parsed)).toEqual(["a", "b", "c"])
      })

      it("should handle ensure_ascii", () => {
        const result = py.json.dumps({ name: "日本語" }, { ensure_ascii: true })
        expect(result).not.toContain("日")
        expect(result).toContain("\\u")
      })

      it("should not escape non-ASCII when ensure_ascii is false", () => {
        const result = py.json.dumps({ name: "日本語" }, { ensure_ascii: false })
        expect(result).toContain("日本語")
      })

      it("should serialize nested structures", () => {
        const obj = { a: { b: { c: [1, 2, 3] } } }
        const result = py.json.dumps(obj)
        expect(JSON.parse(result)).toEqual(obj)
      })
    })

    describe("py.json.dump and py.json.load", () => {
      it("py.json.dump should write to file-like object", () => {
        let written = ""
        const fp = { write: (s: string) => (written = s) }
        py.json.dump({ a: 1 }, fp)
        expect(JSON.parse(written)).toEqual({ a: 1 })
      })

      it("py.json.load should read from file-like object", () => {
        const fp = { read: () => '{"a": 1}' }
        const result = py.json.load(fp)
        expect(result).toEqual({ a: 1 })
      })
    })
  })
})
