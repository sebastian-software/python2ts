import { describe, it, expect } from "vitest"
import * as copy from "./copy.js"

describe("copy module", () => {
  describe("copy()", () => {
    it("should handle primitives", () => {
      expect(copy.copy(42)).toBe(42)
      expect(copy.copy("hello")).toBe("hello")
      expect(copy.copy(true)).toBe(true)
      expect(copy.copy(null)).toBe(null)
      expect(copy.copy(undefined as unknown)).toBe(undefined)
    })

    it("should shallow copy arrays", () => {
      const original = [1, [2, 3], 4]
      const copied = copy.copy(original)
      expect(copied).toEqual(original)
      expect(copied).not.toBe(original)
      expect(copied[1]).toBe(original[1]) // Nested array is shared
    })

    it("should shallow copy objects", () => {
      const original = { a: 1, b: { c: 2 } }
      const copied = copy.copy(original)
      expect(copied).toEqual(original)
      expect(copied).not.toBe(original)
      expect(copied.b).toBe(original.b) // Nested object is shared
    })

    it("should copy Maps", () => {
      const original = new Map([
        ["a", 1],
        ["b", 2]
      ])
      const copied = copy.copy(original)
      expect(copied).toEqual(original)
      expect(copied).not.toBe(original)
    })

    it("should copy Sets", () => {
      const original = new Set([1, 2, 3])
      const copied = copy.copy(original)
      expect(copied).toEqual(original)
      expect(copied).not.toBe(original)
    })

    it("should copy Dates", () => {
      const original = new Date("2023-01-01")
      const copied = copy.copy(original)
      expect(copied.getTime()).toBe(original.getTime())
      expect(copied).not.toBe(original)
    })

    it("should copy RegExp", () => {
      const original = /test/gi
      const copied = copy.copy(original)
      expect(copied.source).toBe(original.source)
      expect(copied.flags).toBe(original.flags)
      expect(copied).not.toBe(original)
    })
  })

  describe("deepcopy()", () => {
    it("should handle primitives", () => {
      expect(copy.deepcopy(42)).toBe(42)
      expect(copy.deepcopy("hello")).toBe("hello")
      expect(copy.deepcopy(true)).toBe(true)
      expect(copy.deepcopy(null)).toBe(null)
      expect(copy.deepcopy(undefined as unknown)).toBe(undefined)
    })

    it("should deep copy arrays", () => {
      const original = [1, [2, 3], 4]
      const copied = copy.deepcopy(original)
      expect(copied).toEqual(original)
      expect(copied).not.toBe(original)
      expect(copied[1]).not.toBe(original[1]) // Nested array is copied
    })

    it("should deep copy objects", () => {
      const original = { a: 1, b: { c: 2 } }
      const copied = copy.deepcopy(original)
      expect(copied).toEqual(original)
      expect(copied).not.toBe(original)
      expect(copied.b).not.toBe(original.b) // Nested object is copied
    })

    it("should deep copy nested structures", () => {
      const original = {
        arr: [1, [2, 3]],
        obj: { inner: { deep: true } }
      }
      const copied = copy.deepcopy(original)
      expect(copied).toEqual(original)
      expect(copied.arr).not.toBe(original.arr)
      expect(copied.arr[1]).not.toBe(original.arr[1])
      expect(copied.obj).not.toBe(original.obj)
      expect(copied.obj.inner).not.toBe(original.obj.inner)
    })

    it("should deep copy Maps", () => {
      const innerObj = { x: 1 }
      const original = new Map([["key", innerObj]])
      const copied = copy.deepcopy(original)
      expect(copied.get("key")).toEqual(innerObj)
      expect(copied.get("key")).not.toBe(innerObj)
    })

    it("should deep copy Sets", () => {
      const innerObj = { x: 1 }
      const original = new Set([innerObj])
      const copied = copy.deepcopy(original)
      expect([...copied][0]).toEqual(innerObj)
      expect([...copied][0]).not.toBe(innerObj)
    })

    it("should handle circular references", () => {
      const original: Record<string, unknown> = { a: 1 }
      original.self = original
      const copied = copy.deepcopy(original)
      expect(copied.a).toBe(1)
      expect(copied.self).toBe(copied) // Circular reference preserved
      expect(copied.self).not.toBe(original)
    })

    it("should copy Dates deeply", () => {
      const original = { date: new Date("2023-01-01") }
      const copied = copy.deepcopy(original)
      expect(copied.date.getTime()).toBe(original.date.getTime())
      expect(copied.date).not.toBe(original.date)
    })
  })
})
