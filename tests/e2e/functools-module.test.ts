import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { py } from "pythonlib"

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
        "import { py } from 'pythonlib';

        let add5 = py.functools.partial(add, 5);"
      `)
    })

    it("should convert reduce", () => {
      const python = `from functools import reduce
result = reduce(lambda x, y: x + y, [1, 2, 3, 4, 5])`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'pythonlib';

        let result = py.functools.reduce((x, y) => (x + y), [1, 2, 3, 4, 5]);"
      `)
    })

    it("should convert lru_cache decorator", () => {
      const python = `from functools import lru_cache
@lru_cache(maxsize=128)
def fib(n):
    return n`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "const fib = lru_cache({ maxsize: 128 })(function fib(n) {
          return n;
        })"
      `)
    })

    it("should convert functools.reduce", () => {
      const python = `import functools
result = functools.reduce(add, numbers)`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'pythonlib';

        let result = py.functools.reduce(add, numbers);"
      `)
    })
  })

  describe("Runtime: partial", () => {
    it("should create partial function", () => {
      const add = (a: number, b: number) => a + b
      const add5 = py.functools.partial(add, 5)
      expect(add5(3)).toBe(8)
    })

    it("should support multiple partial args", () => {
      const greet = (greeting: string, name: string, punctuation: string) =>
        `${greeting}, ${name}${punctuation}`
      const sayHello = py.functools.partial(greet, "Hello")
      expect(sayHello("World", "!")).toBe("Hello, World!")
    })
  })

  describe("Runtime: reduce", () => {
    it("should reduce with function", () => {
      const result = py.functools.reduce((x: number, y: number) => x + y, [1, 2, 3, 4, 5])
      expect(result).toBe(15)
    })

    it("should reduce with initializer", () => {
      const result = py.functools.reduce((x: number, y: number) => x + y, [1, 2, 3, 4, 5], 10)
      expect(result).toBe(25)
    })

    it("should throw on empty sequence without initializer", () => {
      expect(() => py.functools.reduce((x: number, y: number) => x + y, [])).toThrow()
    })

    it("should return initializer for empty sequence", () => {
      const result = py.functools.reduce((x: number, y: number) => x + y, [], 42)
      expect(result).toBe(42)
    })
  })

  describe("Runtime: lru_cache", () => {
    it("should cache function results", () => {
      let callCount = 0
      const expensive = py.functools.lru_cache((n: number) => {
        callCount++
        return n * 2
      })

      expect(expensive(5)).toBe(10)
      expect(expensive(5)).toBe(10)
      expect(callCount).toBe(1)

      expect(expensive(6)).toBe(12)
      expect(callCount).toBe(2)
    })

    it("should provide cache_info", () => {
      const cached = py.functools.lru_cache((n: number) => n * 2)
      cached(1)
      cached(1)
      cached(2)

      const info = cached.cache_info()
      expect(info.hits).toBe(1)
      expect(info.misses).toBe(2)
      expect(info.currsize).toBe(2)
    })

    it("should clear cache", () => {
      let callCount = 0
      const cached = py.functools.lru_cache((n: number) => {
        callCount++
        return n
      })

      cached(1)
      cached(1)
      expect(callCount).toBe(1)

      cached.cache_clear()
      cached(1)
      expect(callCount).toBe(2)
    })
  })

  describe("Runtime: cache", () => {
    it("should cache all results", () => {
      let callCount = 0
      const cached = py.functools.cache((n: number) => {
        callCount++
        return n * 2
      })

      expect(cached(5)).toBe(10)
      expect(cached(5)).toBe(10)
      expect(callCount).toBe(1)
    })
  })

  describe("Runtime: attrgetter", () => {
    it("should get single attribute", () => {
      const getName = py.functools.attrgetter<string>("name")
      expect(getName({ name: "John", age: 30 })).toBe("John")
    })

    it("should get nested attribute", () => {
      const getCity = py.functools.attrgetter<string>("address.city")
      expect(getCity({ address: { city: "NYC" } })).toBe("NYC")
    })

    it("should get multiple attributes", () => {
      const getNameAge = py.functools.attrgetter<string | number>("name", "age")
      expect(getNameAge({ name: "John", age: 30 })).toEqual(["John", 30])
    })
  })

  describe("Runtime: itemgetter", () => {
    it("should get single item by index", () => {
      const getSecond = py.functools.itemgetter<number>(1)
      expect(getSecond([10, 20, 30])).toBe(20)
    })

    it("should get single item by key", () => {
      const getName = py.functools.itemgetter<string>("name")
      expect(getName({ name: "John" })).toBe("John")
    })

    it("should get multiple items", () => {
      const getItems = py.functools.itemgetter<number>(0, 2)
      expect(getItems([10, 20, 30])).toEqual([10, 30])
    })
  })

  describe("Runtime: methodcaller", () => {
    it("should call method without args", () => {
      const upper = py.functools.methodcaller("toUpperCase")
      expect(upper("hello")).toBe("HELLO")
    })

    it("should call method with args", () => {
      const split = py.functools.methodcaller("split", ",")
      expect(split("a,b,c")).toEqual(["a", "b", "c"])
    })
  })

  describe("Runtime: identity", () => {
    it("should return the same value", () => {
      expect(py.functools.identity(42)).toBe(42)
      expect(py.functools.identity("hello")).toBe("hello")
      const obj = { a: 1 }
      expect(py.functools.identity(obj)).toBe(obj)
    })
  })

  describe("Runtime: cmp_to_key", () => {
    it("should convert comparison function to key", () => {
      const compare = (a: number, b: number) => a - b
      const key = py.functools.cmp_to_key(compare)
      const k1 = key(5)
      const k2 = key(3)
      expect(k1.__lt__(k2)).toBe(false)
      expect(k2.__lt__(k1)).toBe(true)
    })
  })
})
