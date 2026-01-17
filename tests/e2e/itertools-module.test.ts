import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { py } from "pythonlib"

describe("E2E: itertools module", () => {
  describe("Import Handling", () => {
    it("should strip import itertools", () => {
      const result = transpile("import itertools", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })

    it("should strip from itertools import chain", () => {
      const result = transpile("from itertools import chain", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })
  })

  describe("Transpilation", () => {
    it("should convert chain", () => {
      const python = `from itertools import chain
result = list(chain([1, 2], [3, 4]))`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'pythonlib';

        let result = py.list(py.itertools.chain([1, 2], [3, 4]));"
      `)
    })

    it("should convert zip_longest", () => {
      const python = `from itertools import zip_longest
result = list(zip_longest([1, 2, 3], ['a', 'b']))`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'pythonlib';

        let result = py.list(py.itertools.zip_longest([1, 2, 3], ['a', 'b']));"
      `)
    })

    it("should convert combinations", () => {
      const python = `from itertools import combinations
result = list(combinations([1, 2, 3], 2))`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'pythonlib';

        let result = py.list(py.itertools.combinations([1, 2, 3], 2));"
      `)
    })

    it("should convert permutations", () => {
      const python = `from itertools import permutations
result = list(permutations([1, 2, 3], 2))`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'pythonlib';

        let result = py.list(py.itertools.permutations([1, 2, 3], 2));"
      `)
    })

    it("should convert groupby", () => {
      const python = `from itertools import groupby
result = list(groupby([1, 1, 2, 2, 3]))`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'pythonlib';

        let result = py.list(py.itertools.groupby([1, 1, 2, 2, 3]));"
      `)
    })
  })

  describe("Runtime: chain", () => {
    it("should chain iterables", () => {
      const result = py.itertools.chain([1, 2], [3, 4])
      expect(result).toEqual([1, 2, 3, 4])
    })

    it("should handle empty iterables", () => {
      const result = py.itertools.chain([], [1, 2], [])
      expect(result).toEqual([1, 2])
    })
  })

  describe("Runtime: combinations", () => {
    it("should return combinations", () => {
      const result = py.itertools.combinations([1, 2, 3], 2)
      expect(result).toEqual([
        [1, 2],
        [1, 3],
        [2, 3]
      ])
    })

    it("should return empty for r > n", () => {
      const result = py.itertools.combinations([1, 2], 3)
      expect(result).toEqual([])
    })
  })

  describe("Runtime: permutations", () => {
    it("should return permutations", () => {
      const result = py.itertools.permutations([1, 2, 3], 2)
      expect(result).toEqual([
        [1, 2],
        [1, 3],
        [2, 1],
        [2, 3],
        [3, 1],
        [3, 2]
      ])
    })
  })

  describe("Runtime: product", () => {
    it("should return cartesian product", () => {
      const result = py.itertools.product([1, 2], ["a", "b"])
      expect(result).toEqual([
        [1, "a"],
        [1, "b"],
        [2, "a"],
        [2, "b"]
      ])
    })
  })

  describe("Runtime: zip_longest", () => {
    it("should zip with fill value", () => {
      const result = py.itertools.zip_longest([1, 2, 3], ["a", "b"], { fillvalue: "-" })
      expect(result).toEqual([
        [1, "a"],
        [2, "b"],
        [3, "-"]
      ])
    })

    it("should zip without fill value", () => {
      const result = py.itertools.zip_longest([1, 2, 3], ["a", "b"])
      expect(result).toEqual([
        [1, "a"],
        [2, "b"],
        [3, undefined]
      ])
    })
  })

  describe("Runtime: islice", () => {
    it("should slice iterable", () => {
      const result = py.itertools.islice([1, 2, 3, 4, 5], 1, 4)
      expect(result).toEqual([2, 3, 4])
    })

    it("should slice with just stop", () => {
      const result = py.itertools.islice([1, 2, 3, 4, 5], 3)
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe("Runtime: takewhile", () => {
    it("should take while predicate is true", () => {
      const result = py.itertools.takewhile((x: number) => x < 5, [1, 4, 6, 4, 1])
      expect(result).toEqual([1, 4])
    })
  })

  describe("Runtime: dropwhile", () => {
    it("should drop while predicate is true", () => {
      const result = py.itertools.dropwhile((x: number) => x < 5, [1, 4, 6, 4, 1])
      expect(result).toEqual([6, 4, 1])
    })
  })

  describe("Runtime: compress", () => {
    it("should filter by selectors", () => {
      const result = py.itertools.compress([1, 2, 3, 4, 5], [1, 0, 1, 0, 1])
      expect(result).toEqual([1, 3, 5])
    })
  })

  describe("Runtime: filterfalse", () => {
    it("should filter where predicate is false", () => {
      const result = py.itertools.filterfalse((x: number) => x % 2, [1, 2, 3, 4, 5])
      expect(result).toEqual([2, 4])
    })
  })

  describe("Runtime: accumulate", () => {
    it("should accumulate sums", () => {
      const result = py.itertools.accumulate([1, 2, 3, 4, 5])
      expect(result).toEqual([1, 3, 6, 10, 15])
    })

    it("should accumulate with custom function", () => {
      const result = py.itertools.accumulate([1, 2, 3, 4, 5], (x: number, y: number) => x * y)
      expect(result).toEqual([1, 2, 6, 24, 120])
    })
  })

  describe("Runtime: groupby", () => {
    it("should group consecutive equal elements", () => {
      const result = py.itertools.groupby([1, 1, 2, 2, 2, 3, 1, 1])
      expect(result).toEqual([
        [1, [1, 1]],
        [2, [2, 2, 2]],
        [3, [3]],
        [1, [1, 1]]
      ])
    })

    it("should group with key function", () => {
      const result = py.itertools.groupby(["aa", "ab", "ba", "bb"], (s: string) => s[0])
      expect(result).toEqual([
        ["a", ["aa", "ab"]],
        ["b", ["ba", "bb"]]
      ])
    })
  })

  describe("Runtime: pairwise", () => {
    it("should return successive pairs", () => {
      const result = py.itertools.pairwise([1, 2, 3, 4, 5])
      expect(result).toEqual([
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5]
      ])
    })
  })

  describe("Runtime: tee", () => {
    it("should return independent copies", () => {
      const result = py.itertools.tee([1, 2, 3], 2)
      expect(result).toEqual([
        [1, 2, 3],
        [1, 2, 3]
      ])
    })
  })

  describe("Runtime: combinations_with_replacement", () => {
    it("should return combinations with replacement", () => {
      const result = py.itertools.combinations_with_replacement([1, 2, 3], 2)
      expect(result).toEqual([
        [1, 1],
        [1, 2],
        [1, 3],
        [2, 2],
        [2, 3],
        [3, 3]
      ])
    })
  })
})
