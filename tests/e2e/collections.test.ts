import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { collections } from "pythonlib"

describe("E2E: collections", () => {
  describe("Transformer", () => {
    it("should strip collections imports", () => {
      const python = `
from collections import Counter, defaultdict, deque
`
      const result = transpile(python, { includeRuntime: false })
      expect(result.trim()).toBe("")
    })

    it("should transform Counter call", () => {
      const python = `
from collections import Counter
c = Counter("abracadabra")
`
      const result = transpile(python)
      expect(result).toContain('from "pythonlib/collections"')
      expect(result).toContain("new Counter(")
    })

    it("should transform defaultdict call", () => {
      const python = `
from collections import defaultdict
d = defaultdict(int)
`
      const result = transpile(python)
      expect(result).toContain('from "pythonlib/collections"')
      expect(result).toContain("defaultdict(")
    })

    it("should transform deque call", () => {
      const python = `
from collections import deque
q = deque([1, 2, 3])
`
      const result = transpile(python)
      expect(result).toContain('from "pythonlib/collections"')
      expect(result).toContain("new deque(")
    })
  })

  describe("Runtime - Counter", () => {
    it("should count elements from string", () => {
      const counter = new collections.Counter("abracadabra")
      expect(counter.get("a")).toBe(5)
      expect(counter.get("b")).toBe(2)
      expect(counter.get("r")).toBe(2)
    })

    it("should count elements from array", () => {
      const counter = new collections.Counter([1, 1, 2, 3, 3, 3])
      expect(counter.get(1)).toBe(2)
      expect(counter.get(2)).toBe(1)
      expect(counter.get(3)).toBe(3)
    })

    it("should return 0 for missing keys", () => {
      const counter = new collections.Counter("abc")
      expect(counter.get("z")).toBe(0)
    })

    it("should increment counts", () => {
      const counter = new collections.Counter<string>()
      counter.increment("a")
      counter.increment("a")
      counter.increment("b")
      expect(counter.get("a")).toBe(2)
      expect(counter.get("b")).toBe(1)
    })

    it("should return most common elements", () => {
      const counter = new collections.Counter("abracadabra")
      const common = counter.mostCommon(2)
      expect(common).toEqual([
        ["a", 5],
        ["b", 2]
      ])
    })

    it("should iterate elements", () => {
      const counter = new collections.Counter("aab")
      const result = [...counter.elements()]
      expect(result.sort()).toEqual(["a", "a", "b"])
    })

    it("should calculate total", () => {
      const counter = new collections.Counter("abc")
      expect(counter.total()).toBe(3)
    })

    it("should subtract counts", () => {
      const counter = new collections.Counter("abracadabra")
      counter.subtract("aaa")
      expect(counter.get("a")).toBe(2)
    })

    it("should subtract counts from another Counter", () => {
      const counter1 = new collections.Counter("aaabbc")
      const counter2 = new collections.Counter("ab")
      counter1.subtract(counter2)
      expect(counter1.get("a")).toBe(2) // 3 - 1
      expect(counter1.get("b")).toBe(1) // 2 - 1
      expect(counter1.get("c")).toBe(1) // 1 - 0
    })

    it("should update counts", () => {
      const counter = new collections.Counter("abc")
      counter.update("aaa")
      expect(counter.get("a")).toBe(4)
    })

    it("should update counts from another Counter", () => {
      const counter1 = new collections.Counter("abc")
      const counter2 = new collections.Counter("aab")
      counter1.update(counter2)
      expect(counter1.get("a")).toBe(3) // 1 + 2
      expect(counter1.get("b")).toBe(2) // 1 + 1
    })
  })

  describe("Runtime - defaultdict", () => {
    it("should provide default values for missing keys", () => {
      const d = collections.defaultdict(() => 0)
      expect(d.get("missing")).toBe(0)
    })

    it("should use factory for new values", () => {
      const d = collections.defaultdict(() => [])
      d.get("a").push(1)
      d.get("a").push(2)
      d.get("b").push(3)
      expect(d.get("a")).toEqual([1, 2])
      expect(d.get("b")).toEqual([3])
    })

    it("should work with Map methods", () => {
      const d = collections.defaultdict(() => 0)
      d.set("a", 5)
      expect(d.get("a")).toBe(5)
      expect(d.has("a")).toBe(true)
      expect(d.has("b")).toBe(false)
    })

    it("should support iteration with forEach", () => {
      const d = collections.defaultdict(() => 0)
      d.get("a")
      d.get("b")
      const keys: string[] = []
      d.forEach((_, key) => keys.push(key))
      expect(keys.sort()).toEqual(["a", "b"])
    })
  })

  describe("Runtime - deque", () => {
    it("should append to right", () => {
      const d = new collections.deque([1, 2])
      d.append(3)
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it("should append to left", () => {
      const d = new collections.deque([1, 2])
      d.appendLeft(0)
      expect(d.toArray()).toEqual([0, 1, 2])
    })

    it("should pop from right", () => {
      const d = new collections.deque([1, 2, 3])
      expect(d.pop()).toBe(3)
      expect(d.toArray()).toEqual([1, 2])
    })

    it("should pop from left", () => {
      const d = new collections.deque([1, 2, 3])
      expect(d.popLeft()).toBe(1)
      expect(d.toArray()).toEqual([2, 3])
    })

    it("should respect maxlen", () => {
      const d = new collections.deque([1, 2, 3], 3)
      d.append(4)
      expect(d.toArray()).toEqual([2, 3, 4])
    })

    it("should truncate initial items to maxlen", () => {
      const d = new collections.deque([1, 2, 3, 4, 5], 3)
      expect(d.toArray()).toEqual([3, 4, 5])
    })

    it("should respect maxlen on appendLeft", () => {
      const d = new collections.deque([1, 2, 3], 3)
      d.appendLeft(0)
      expect(d.toArray()).toEqual([0, 1, 2])
    })

    it("should rotate right", () => {
      const d = new collections.deque([1, 2, 3, 4, 5])
      d.rotate(2)
      expect(d.toArray()).toEqual([4, 5, 1, 2, 3])
    })

    it("should rotate left with negative", () => {
      const d = new collections.deque([1, 2, 3, 4, 5])
      d.rotate(-2)
      expect(d.toArray()).toEqual([3, 4, 5, 1, 2])
    })

    it("should extend from right", () => {
      const d = new collections.deque([1])
      d.extend([2, 3])
      expect(d.toArray()).toEqual([1, 2, 3])
    })

    it("should extend from left", () => {
      const d = new collections.deque([1])
      d.extendLeft([2, 3])
      expect(d.toArray()).toEqual([3, 2, 1])
    })

    it("should be iterable", () => {
      const d = new collections.deque([1, 2, 3])
      expect([...d]).toEqual([1, 2, 3])
    })

    it("should clear all elements", () => {
      const d = new collections.deque([1, 2, 3])
      d.clear()
      expect(d.length).toBe(0)
    })
  })
})
