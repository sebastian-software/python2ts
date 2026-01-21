/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect } from "vitest"
import * as functools from "./functools"

describe("functools module", () => {
  describe("partial()", () => {
    it("should partially apply arguments", () => {
      const add = (a: number, b: number) => a + b
      const add5 = functools.partial(add, 5)
      expect(add5(3)).toBe(8)
    })
  })

  describe("reduce()", () => {
    it("should reduce an iterable", () => {
      const result = functools.reduce((a: number, b: number) => a + b, [1, 2, 3, 4, 5])
      expect(result).toBe(15)
    })

    it("should support initial value", () => {
      const result = functools.reduce((a: number, b: number) => a + b, [1, 2, 3], 10)
      expect(result).toBe(16)
    })

    it("should throw for empty iterable without initial", () => {
      expect(() => functools.reduce((a: number, b: number) => a + b, [])).toThrow()
    })
  })

  describe("lruCache()", () => {
    it("should cache function results", () => {
      let callCount = 0
      const fn = functools.lruCache((n: number) => {
        callCount++
        return n * 2
      })
      expect(fn(5)).toBe(10)
      expect(fn(5)).toBe(10)
      expect(callCount).toBe(1) // Only called once due to cache
    })

    it("should provide cacheInfo", () => {
      const fn = functools.lruCache((n: number) => n * 2)
      fn(1)
      fn(1)
      fn(2)
      const info = fn.cacheInfo()
      expect(info.hits).toBe(1)
      expect(info.misses).toBe(2)
    })

    it("should provide cacheClear", () => {
      const fn = functools.lruCache((n: number) => n * 2)
      fn(1)
      fn.cacheClear()
      const info = fn.cacheInfo()
      expect(info.currsize).toBe(0)
    })
  })

  describe("attrGetter()", () => {
    it("should get attribute from object", () => {
      const getName = functools.attrGetter("name")
      expect(getName({ name: "John" })).toBe("John")
    })

    it("should support nested attributes", () => {
      const getCity = functools.attrGetter("address.city")
      expect(getCity({ address: { city: "NYC" } })).toBe("NYC")
    })

    it("should support multiple attributes", () => {
      const getNameAge = functools.attrGetter("name", "age")
      expect(getNameAge({ name: "John", age: 30 })).toEqual(["John", 30])
    })
  })

  describe("itemGetter()", () => {
    it("should get item from array", () => {
      const getSecond = functools.itemGetter(1)
      expect(getSecond([10, 20, 30])).toBe(20)
    })

    it("should get item from object", () => {
      const getA = functools.itemGetter("a")
      expect(getA({ a: 1, b: 2 })).toBe(1)
    })

    it("should support multiple items", () => {
      const getItems = functools.itemGetter(0, 2)
      expect(getItems([10, 20, 30])).toEqual([10, 30])
    })
  })

  describe("cmpToKey()", () => {
    it("should convert comparison function to key function", () => {
      const cmp = (a: number, b: number) => a - b
      const key = functools.cmpToKey(cmp)
      const arr = [3, 1, 2]
      arr.sort((a, b) => {
        const ka = key(a)
        const kb = key(b)
        // Uses __lt__ for comparison
        if (ka.__lt__(kb)) return -1
        if (kb.__lt__(ka)) return 1
        return 0
      })
      expect(arr).toEqual([1, 2, 3])
    })
  })

  describe("pipe()", () => {
    it("should pipe value through functions", () => {
      const result = functools.pipe(
        5,
        (x: number) => x * 2,
        (x: number) => x + 1
      )
      expect(result).toBe(11)
    })

    it("should return value unchanged with no functions", () => {
      expect(functools.pipe(42)).toBe(42)
    })
  })

  describe("cache()", () => {
    it("should cache function results", () => {
      let callCount = 0
      const fn = functools.cache((n: number) => {
        callCount++
        return n * 2
      })
      expect(fn(5)).toBe(10)
      expect(fn(5)).toBe(10)
      expect(callCount).toBe(1)
    })
  })

  describe("identity()", () => {
    it("should return the same value", () => {
      expect(functools.identity(42)).toBe(42)
      expect(functools.identity("hello")).toBe("hello")
    })
  })

  describe("methodCaller()", () => {
    it("should call method on object", () => {
      const splitter = functools.methodCaller("split", ",")
      expect(splitter("a,b,c")).toEqual(["a", "b", "c"])
    })

    it("should throw for non-existent method", () => {
      const caller = functools.methodCaller("nonexistent")
      expect(() => caller({})).toThrow()
    })
  })

  describe("wraps()", () => {
    it("should copy function name", () => {
      function original() {
        return 1
      }
      const wrapped = functools.wraps(original)(() => 2)
      expect(wrapped.name).toBe("original")
    })
  })

  describe("singleDispatch()", () => {
    it("should dispatch based on first argument type", () => {
      const fn = functools.singleDispatch((x: unknown) => `default: ${String(x)}`)
      fn.register("number", (x: unknown) => `number: ${String(x)}`)
      fn.register("string", (x: unknown) => `string: ${String(x)}`)

      expect(fn(42)).toBe("number: 42")
      expect(fn("hello")).toBe("string: hello")
      expect(fn({})).toBe("default: [object Object]")
    })

    it("should handle null and array types", () => {
      const fn = functools.singleDispatch((x: unknown) => `default: ${String(x)}`)
      fn.register("null", () => "null value")
      fn.register("array", () => "array value")

      expect(fn(null)).toBe("null value")
      expect(fn([1, 2, 3])).toBe("array value")
    })

    it("should handle no arguments", () => {
      const fn = functools.singleDispatch(() => "no args")
      expect(fn()).toBe("no args")
    })
  })

  describe("lruCache eviction", () => {
    it("should evict oldest entries when maxsize reached", () => {
      const fn = functools.lruCache((n: number) => n * 2, 2)
      fn(1)
      fn(2)
      fn(3) // Should evict 1
      const info = fn.cacheInfo()
      expect(info.currsize).toBe(2)
    })
  })
})
