import { describe, it, expect } from "vitest"
import * as itertools from "./itertools.js"

describe("itertools module", () => {
  describe("chain()", () => {
    it("should chain iterables", () => {
      expect(itertools.chain([1, 2], [3, 4], [5])).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe("combinations()", () => {
    it("should return combinations", () => {
      expect(itertools.combinations([1, 2, 3], 2)).toEqual([
        [1, 2],
        [1, 3],
        [2, 3]
      ])
    })

    it("should return empty for r > n", () => {
      expect(itertools.combinations([1, 2], 3)).toEqual([])
    })

    it("should return empty for negative r", () => {
      expect(itertools.combinations([1, 2], -1)).toEqual([])
    })
  })

  describe("permutations()", () => {
    it("should return permutations", () => {
      expect(itertools.permutations([1, 2, 3], 2)).toEqual([
        [1, 2],
        [1, 3],
        [2, 1],
        [2, 3],
        [3, 1],
        [3, 2]
      ])
    })

    it("should default to full length", () => {
      expect(itertools.permutations([1, 2])).toEqual([
        [1, 2],
        [2, 1]
      ])
    })
  })

  describe("product()", () => {
    it("should return cartesian product", () => {
      expect(itertools.product<number | string>([1, 2], ["a", "b"])).toEqual([
        [1, "a"],
        [1, "b"],
        [2, "a"],
        [2, "b"]
      ])
    })

    it("should return empty array for empty input", () => {
      expect(itertools.product([1, 2], [])).toEqual([])
    })

    it("should return [[]] for no arguments", () => {
      expect(itertools.product()).toEqual([[]])
    })
  })

  describe("cycle()", () => {
    it("should cycle through elements", () => {
      const gen = itertools.cycle([1, 2, 3])
      const result: number[] = []
      for (let i = 0; i < 7; i++) {
        result.push(gen.next().value as number)
      }
      expect(result).toEqual([1, 2, 3, 1, 2, 3, 1])
    })

    it("should handle empty iterable", () => {
      const gen = itertools.cycle([])
      expect(gen.next().done).toBe(true)
    })
  })

  describe("repeat()", () => {
    it("should repeat with count", () => {
      expect(itertools.repeat("x", 3)).toEqual(["x", "x", "x"])
    })

    it("should return infinite generator without count", () => {
      const gen = itertools.repeat("x") as Generator<string>
      const result: string[] = []
      for (let i = 0; i < 5; i++) {
        result.push(gen.next().value as string)
      }
      expect(result).toEqual(["x", "x", "x", "x", "x"])
    })
  })

  describe("islice()", () => {
    it("should slice iterable", () => {
      expect(itertools.islice([1, 2, 3, 4, 5], 1, 4)).toEqual([2, 3, 4])
    })

    it("should handle single argument as stop", () => {
      expect(itertools.islice([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3])
    })

    it("should support step", () => {
      expect(itertools.islice([1, 2, 3, 4, 5, 6], 0, 6, 2)).toEqual([1, 3, 5])
    })

    it("should throw for step < 1", () => {
      expect(() => itertools.islice([1, 2, 3], 0, 2, 0)).toThrow()
    })
  })

  describe("takeWhile()", () => {
    it("should take while predicate is true", () => {
      expect(itertools.takeWhile((x: number) => x < 5, [1, 4, 6, 4, 1])).toEqual([1, 4])
    })
  })

  describe("dropWhile()", () => {
    it("should drop while predicate is true", () => {
      expect(itertools.dropWhile((x: number) => x < 5, [1, 4, 6, 4, 1])).toEqual([6, 4, 1])
    })
  })

  describe("zipLongest()", () => {
    it("should zip with fill value", () => {
      expect(
        itertools.zipLongest<number | string>([1, 2, 3], ["a", "b"], { fillvalue: "-" })
      ).toEqual([
        [1, "a"],
        [2, "b"],
        [3, "-"]
      ])
    })

    it("should work without options", () => {
      expect(itertools.zipLongest<number | string>([1, 2], ["a"])).toEqual([
        [1, "a"],
        [2, undefined]
      ])
    })

    it("should return empty for no iterables", () => {
      expect(itertools.zipLongest()).toEqual([])
    })
  })

  describe("compress()", () => {
    it("should compress with selectors", () => {
      expect(itertools.compress([1, 2, 3, 4, 5], [1, 0, 1, 0, 1])).toEqual([1, 3, 5])
    })
  })

  describe("filterFalse()", () => {
    it("should filter falsey values", () => {
      expect(itertools.filterFalse((x: number) => x % 2, [1, 2, 3, 4, 5])).toEqual([2, 4])
    })
  })

  describe("accumulate()", () => {
    it("should accumulate with default sum", () => {
      expect(itertools.accumulate([1, 2, 3, 4, 5])).toEqual([1, 3, 6, 10, 15])
    })

    it("should accumulate with custom function", () => {
      expect(itertools.accumulate([1, 2, 3, 4, 5], (x: number, y: number) => x * y)).toEqual([
        1, 2, 6, 24, 120
      ])
    })

    it("should support initial value", () => {
      expect(itertools.accumulate([1, 2, 3], (x: number, y: number) => x + y, 10)).toEqual([
        10, 11, 13, 16
      ])
    })

    it("should handle empty iterable", () => {
      expect(itertools.accumulate([])).toEqual([])
    })

    it("should return initial for empty iterable with initial", () => {
      expect(itertools.accumulate([], undefined, 10)).toEqual([10])
    })
  })

  describe("groupby()", () => {
    it("should group consecutive elements", () => {
      const result = itertools.groupby([1, 1, 2, 2, 2, 3, 1, 1])
      expect(result).toEqual([
        [1, [1, 1]],
        [2, [2, 2, 2]],
        [3, [3]],
        [1, [1, 1]]
      ])
    })

    it("should support key function", () => {
      const result = itertools.groupby([1, 2, 3, 4, 5], (x: number) => x % 2)
      expect(result.length).toBe(5)
    })
  })

  describe("count()", () => {
    it("should count from start with step", () => {
      const gen = itertools.count(10, 2)
      const result: number[] = []
      for (let i = 0; i < 5; i++) {
        result.push(gen.next().value as number)
      }
      expect(result).toEqual([10, 12, 14, 16, 18])
    })

    it("should default to 0 and 1", () => {
      const gen = itertools.count()
      expect(gen.next().value).toBe(0)
      expect(gen.next().value).toBe(1)
    })
  })

  describe("tee()", () => {
    it("should create independent copies", () => {
      const [a, b] = itertools.tee([1, 2, 3])
      expect(a).toEqual([1, 2, 3])
      expect(b).toEqual([1, 2, 3])
    })
  })

  describe("pairwise()", () => {
    it("should return overlapping pairs", () => {
      expect(itertools.pairwise([1, 2, 3, 4])).toEqual([
        [1, 2],
        [2, 3],
        [3, 4]
      ])
    })
  })

  describe("productRepeat()", () => {
    it("should repeat product", () => {
      expect(itertools.productRepeat([0, 1], 2)).toEqual([
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1]
      ])
    })

    it("should return [[]] for repeat 0", () => {
      expect(itertools.productRepeat([1, 2], 0)).toEqual([[]])
    })

    it("should return [] for empty input", () => {
      expect(itertools.productRepeat([], 2)).toEqual([])
    })
  })

  describe("combinationsWithReplacement()", () => {
    it("should return combinations with replacement", () => {
      expect(itertools.combinationsWithReplacement([1, 2, 3], 2)).toEqual([
        [1, 1],
        [1, 2],
        [1, 3],
        [2, 2],
        [2, 3],
        [3, 3]
      ])
    })

    it("should return [[]] for r=0", () => {
      expect(itertools.combinationsWithReplacement([1, 2], 0)).toEqual([[]])
    })

    it("should return [] for empty input with r>0", () => {
      expect(itertools.combinationsWithReplacement([], 2)).toEqual([])
    })
  })

  describe("chunk()", () => {
    it("should split into chunks", () => {
      expect(itertools.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })

    it("should throw for size < 1", () => {
      expect(() => itertools.chunk([1, 2, 3], 0)).toThrow()
    })
  })

  describe("partition()", () => {
    it("should partition by predicate", () => {
      expect(itertools.partition([1, 2, 3, 4], (x: number) => x % 2 === 0)).toEqual([
        [2, 4],
        [1, 3]
      ])
    })
  })
})
