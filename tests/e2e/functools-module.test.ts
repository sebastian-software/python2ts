import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { functools } from "pythonlib"

describe("E2E: functools module", () => {
  describe("Import Handling", () => {
    it("should strip import functools", () => {
      const result = transpile("import functools", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })

    it("should strip from functools import partial", () => {
      const result = transpile("from functools import partial", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })
  })

  describe("Transpilation", () => {
    it("should convert partial", () => {
      const python = `from functools import partial
add5 = partial(add, 5)`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { partial } from "pythonlib/functools"

        let add5 = partial(add, 5);"
      `)
    })

    it("should convert reduce", () => {
      const python = `from functools import reduce
result = reduce(lambda x, y: x + y, [1, 2, 3, 4, 5])`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { reduce } from "pythonlib/functools"

        let result = reduce((x, y) => (x + y), [1, 2, 3, 4, 5]);"
      `)
    })

    it("should convert lruCache decorator", () => {
      const python = `from functools import lruCache
@lruCache(maxsize=128)
def fib(n):
    return n`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "const fib = lruCache({ maxsize: 128 })(function fib(n) {
          return n;
        })"
      `)
    })

    it("should convert functools.reduce", () => {
      const python = `import functools
result = functools.reduce(add, numbers)`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { reduce } from "pythonlib/functools"

        let result = reduce(add, numbers);"
      `)
    })
  })

  describe("Runtime: partial", () => {
    it("should create partial function", () => {
      const add = (a: number, b: number) => a + b
      const add5 = functools.partial(add, 5)
      expect(add5(3)).toBe(8)
    })

    it("should support multiple partial args", () => {
      const greet = (greeting: string, name: string, punctuation: string) =>
        `${greeting}, ${name}${punctuation}`
      const sayHello = functools.partial(greet, "Hello")
      expect(sayHello("World", "!")).toBe("Hello, World!")
    })
  })

  describe("Runtime: reduce", () => {
    it("should reduce with function", () => {
      const result = functools.reduce((x: number, y: number) => x + y, [1, 2, 3, 4, 5])
      expect(result).toBe(15)
    })

    it("should reduce with initializer", () => {
      const result = functools.reduce((x: number, y: number) => x + y, [1, 2, 3, 4, 5], 10)
      expect(result).toBe(25)
    })

    it("should throw on empty sequence without initializer", () => {
      expect(() => functools.reduce((x: number, y: number) => x + y, [])).toThrow()
    })

    it("should return initializer for empty sequence", () => {
      const result = functools.reduce((x: number, y: number) => x + y, [], 42)
      expect(result).toBe(42)
    })
  })

  describe("Runtime: lruCache", () => {
    it("should cache function results", () => {
      let callCount = 0
      const expensive = functools.lruCache((n: number) => {
        callCount++
        return n * 2
      })

      expect(expensive(5)).toBe(10)
      expect(expensive(5)).toBe(10)
      expect(callCount).toBe(1)

      expect(expensive(6)).toBe(12)
      expect(callCount).toBe(2)
    })

    it("should provide cacheInfo", () => {
      const cached = functools.lruCache((n: number) => n * 2)
      cached(1)
      cached(1)
      cached(2)

      const info = cached.cacheInfo()
      expect(info.hits).toBe(1)
      expect(info.misses).toBe(2)
      expect(info.currsize).toBe(2)
    })

    it("should clear cache", () => {
      let callCount = 0
      const cached = functools.lruCache((n: number) => {
        callCount++
        return n
      })

      cached(1)
      cached(1)
      expect(callCount).toBe(1)

      cached.cacheClear()
      cached(1)
      expect(callCount).toBe(2)
    })
  })

  describe("Runtime: cache", () => {
    it("should cache all results", () => {
      let callCount = 0
      const cached = functools.cache((n: number) => {
        callCount++
        return n * 2
      })

      expect(cached(5)).toBe(10)
      expect(cached(5)).toBe(10)
      expect(callCount).toBe(1)
    })
  })

  describe("Runtime: attrGetter", () => {
    it("should get single attribute", () => {
      const getName = functools.attrGetter<string>("name")
      expect(getName({ name: "John", age: 30 })).toBe("John")
    })

    it("should get nested attribute", () => {
      const getCity = functools.attrGetter<string>("address.city")
      expect(getCity({ address: { city: "NYC" } })).toBe("NYC")
    })

    it("should get multiple attributes", () => {
      const getNameAge = functools.attrGetter<string | number>("name", "age")
      expect(getNameAge({ name: "John", age: 30 })).toEqual(["John", 30])
    })
  })

  describe("Runtime: itemGetter", () => {
    it("should get single item by index", () => {
      const getSecond = functools.itemGetter<number>(1)
      expect(getSecond([10, 20, 30])).toBe(20)
    })

    it("should get single item by key", () => {
      const getName = functools.itemGetter<string>("name")
      expect(getName({ name: "John" })).toBe("John")
    })

    it("should get multiple items", () => {
      const getItems = functools.itemGetter<number>(0, 2)
      expect(getItems([10, 20, 30])).toEqual([10, 30])
    })
  })

  describe("Runtime: methodCaller", () => {
    it("should call method without args", () => {
      const upper = functools.methodCaller("toUpperCase")
      expect(upper("hello")).toBe("HELLO")
    })

    it("should call method with args", () => {
      const split = functools.methodCaller("split", ",")
      expect(split("a,b,c")).toEqual(["a", "b", "c"])
    })
  })

  describe("Runtime: identity", () => {
    it("should return the same value", () => {
      expect(functools.identity(42)).toBe(42)
      expect(functools.identity("hello")).toBe("hello")
      const obj = { a: 1 }
      expect(functools.identity(obj)).toBe(obj)
    })
  })

  describe("Runtime: cmpToKey", () => {
    it("should convert comparison function to key", () => {
      const compare = (a: number, b: number) => a - b
      const key = functools.cmpToKey(compare)
      const k1 = key(5)
      const k2 = key(3)
      expect(k1.__lt__(k2)).toBe(false)
      expect(k2.__lt__(k1)).toBe(true)
    })
  })
})
