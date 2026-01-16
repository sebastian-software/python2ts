import { describe, it, expect } from "vitest"
import { transpile } from "../../src/generator/index.js"

describe("E2E: Comprehensions", () => {
  describe("List Comprehensions", () => {
    it("should transform simple list comprehension", () => {
      expect(transpile("[x * 2 for x in items]", { includeRuntime: false })).toMatchInlineSnapshot(
        `"items.map((x) => (x * 2));"`
      )
    })

    it("should transform list comprehension with variable expression", () => {
      expect(transpile("[x for x in items]", { includeRuntime: false })).toMatchInlineSnapshot(
        `"items.map((x) => x);"`
      )
    })

    it("should transform list comprehension with condition", () => {
      expect(
        transpile("[x for x in items if x > 0]", { includeRuntime: false })
      ).toMatchInlineSnapshot(`"items.filter((x) => (x > 0)).map((x) => x);"`)
    })

    it("should transform list comprehension with multiple conditions", () => {
      expect(
        transpile("[x for x in items if x > 0 if x < 10]", { includeRuntime: false })
      ).toMatchInlineSnapshot(
        `"items.filter((x) => (x > 0)).filter((x) => (x < 10)).map((x) => x);"`
      )
    })

    it("should transform nested list comprehension (two for clauses)", () => {
      expect(
        transpile("[x + y for x in a for y in b]", { includeRuntime: false })
      ).toMatchInlineSnapshot(`"a.flatMap((x) => b.map((y) => (x + y)));"`)
    })

    it("should transform list comprehension with function call", () => {
      expect(transpile("[len(x) for x in items]")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        items.map((x) => py.len(x));"
      `)
    })

    it("should transform list comprehension with range", () => {
      expect(transpile("[x ** 2 for x in range(10)]")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        [...py.range(10)].map((x) => py.pow(x, 2));"
      `)
    })

    it("should transform list comprehension assigned to variable", () => {
      expect(
        transpile("squares = [x * x for x in numbers]", { includeRuntime: false })
      ).toMatchInlineSnapshot(`"let squares = numbers.map((x) => (x * x));"`)
    })

    it("should transform list comprehension with complex expression", () => {
      expect(transpile("[x + 1 for x in items if x % 2 == 0]")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        items.filter((x) => (py.mod(x, 2) == 0)).map((x) => (x + 1));"
      `)
    })
  })

  describe("Dict Comprehensions", () => {
    it("should transform simple dict comprehension", () => {
      expect(transpile("{x: x * 2 for x in items}")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.dict(items.map((x) => [x, (x * 2)]));"
      `)
    })

    it("should transform dict comprehension with condition", () => {
      expect(transpile("{x: x ** 2 for x in items if x > 0}")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.dict(items.filter((x) => (x > 0)).map((x) => [x, py.pow(x, 2)]));"
      `)
    })

    it("should transform dict comprehension with range", () => {
      expect(transpile("{i: i * i for i in range(5)}")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.dict([...py.range(5)].map((i) => [i, (i * i)]));"
      `)
    })
  })

  describe("Set Comprehensions", () => {
    it("should transform simple set comprehension", () => {
      expect(transpile("{x * 2 for x in items}")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.set(items.map((x) => (x * 2)));"
      `)
    })

    it("should transform set comprehension with condition", () => {
      expect(transpile("{x for x in items if x > 0}")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.set(items.filter((x) => (x > 0)).map((x) => x));"
      `)
    })

    it("should transform set comprehension with function", () => {
      expect(transpile("{len(s) for s in strings}")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.set(strings.map((s) => py.len(s)));"
      `)
    })
  })

  describe("Set Expressions", () => {
    it("should transform set literal", () => {
      expect(transpile("{1, 2, 3}")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.set([1, 2, 3]);"
      `)
    })

    it("should transform empty set constructor", () => {
      expect(transpile("s = set()")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let s = py.set();"
      `)
    })
  })

  describe("Comprehension Edge Cases", () => {
    it("should handle comprehension with method call on item", () => {
      expect(
        transpile("[s.strip() for s in strings]", { includeRuntime: false })
      ).toMatchInlineSnapshot(`"strings.map((s) => s.trim());"`)
    })

    it("should handle comprehension with nested function calls", () => {
      expect(transpile("[str(int(x)) for x in items]")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        items.map((x) => py.str(py.int(x)));"
      `)
    })

    it("should handle comprehension with arithmetic in condition", () => {
      expect(
        transpile("[x for x in items if x + 1 > 5]", { includeRuntime: false })
      ).toMatchInlineSnapshot(`"items.filter((x) => ((x + 1) > 5)).map((x) => x);"`)
    })
  })

  describe("Real-world Examples", () => {
    it("should transform filtering even numbers", () => {
      expect(transpile("evens = [x for x in numbers if x % 2 == 0]")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let evens = numbers.filter((x) => (py.mod(x, 2) == 0)).map((x) => x);"
      `)
    })

    it("should transform mapping with transformation", () => {
      expect(
        transpile("upper_words = [word.upper() for word in words]", { includeRuntime: false })
      ).toMatchInlineSnapshot(`"let upper_words = words.map((word) => word.toUpperCase());"`)
    })

    it("should transform flattening nested lists", () => {
      expect(
        transpile("flat = [item for sublist in nested for item in sublist]", {
          includeRuntime: false
        })
      ).toMatchInlineSnapshot(
        `"let flat = nested.flatMap((sublist) => sublist.map((item) => item));"`
      )
    })

    it("should transform creating pairs", () => {
      expect(transpile("pairs = [(x, y) for x in a for y in b]")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        let pairs = a.flatMap((x) => b.map((y) => py.tuple(x, y)));"
      `)
    })
  })

  describe("Generator Expressions", () => {
    it("should transform simple generator expression", () => {
      expect(transpile("(x for x in items)", { includeRuntime: false })).toMatchInlineSnapshot(
        `"(function*() { for (const x of items) yield x; })();"`
      )
    })

    it("should transform generator with expression", () => {
      expect(transpile("(x * 2 for x in items)", { includeRuntime: false })).toMatchInlineSnapshot(
        `"(function*() { for (const x of items) yield (x * 2); })();"`
      )
    })

    it("should transform generator with condition", () => {
      expect(
        transpile("(x for x in items if x > 0)", { includeRuntime: false })
      ).toMatchInlineSnapshot(`"(function*() { for (const x of items) if ((x > 0)) yield x; })();"`)
    })

    it("should transform generator inside sum()", () => {
      expect(transpile("sum(x for x in items)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.sum((function*() { for (const x of items) yield x; })());"
      `)
    })

    it("should transform generator inside any()", () => {
      expect(transpile("any(x > 0 for x in items)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.any((function*() { for (const x of items) yield (x > 0); })());"
      `)
    })

    it("should transform generator inside all()", () => {
      expect(transpile("all(x > 0 for x in items)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.all((function*() { for (const x of items) yield (x > 0); })());"
      `)
    })

    it("should transform generator with nested loops", () => {
      expect(transpile("((x, y) for x in a for y in b)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        (function*() { for (const x of a)   for (const y of b) yield py.tuple(x, y); })();"
      `)
    })

    it("should transform generator with range", () => {
      expect(transpile("sum(x ** 2 for x in range(10))")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.sum((function*() { for (const x of py.range(10)) yield py.pow(x, 2); })());"
      `)
    })

    it("should transform max with generator", () => {
      expect(transpile("max(len(s) for s in strings)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.max((function*() { for (const s of strings) yield py.len(s); })());"
      `)
    })

    it("should transform min with generator and condition", () => {
      expect(transpile("min(x for x in numbers if x > 0)")).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        py.min((function*() { for (const x of numbers) if ((x > 0)) yield x; })());"
      `)
    })
  })
})
