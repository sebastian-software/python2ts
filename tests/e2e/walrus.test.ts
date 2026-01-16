import { describe, it, expect } from "vitest"
import { transpile } from "../../src/generator/index.js"

describe("E2E: Walrus Operator (:=)", () => {
  describe("Basic Usage", () => {
    it("should convert walrus in assignment", () => {
      const python = `x = (y := 5)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let x = (y = 5);"`
      )
    })

    it("should convert walrus with expression", () => {
      const python = `x = (y := a + b)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let x = (y = (a + b));"`
      )
    })
  })

  describe("In Conditionals", () => {
    it("should convert walrus in if condition", () => {
      const python = `if (n := len(a)) > 10:
    print(n)`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        if (((n = py.len(a)) > 10)) {
          console.log(n);
        }"
      `)
    })

    it("should convert walrus in while condition", () => {
      const python = `while (line := input()):
    print(line)`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { py } from 'python2ts/runtime';

        while ((line = py.input())) {
          console.log(line);
        }"
      `)
    })
  })

  describe("In List Expressions", () => {
    it("should convert walrus in list literal", () => {
      const python = `result = [y := f(x), y * 2, y * 3]`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let result = [y = f(x), (y * 2), (y * 3)];"`
      )
    })
  })

  describe("With Function Calls", () => {
    it("should convert walrus with function result", () => {
      const python = `if (match := pattern.search(text)):
    print(match)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "if ((match = pattern.search(text))) {
          console.log(match);
        }"
      `)
    })

    it("should convert walrus with method call", () => {
      const python = `if (data := file.read()):
    process(data)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "if ((data = file.read())) {
          process(data);
        }"
      `)
    })
  })

  describe("Nested Usage", () => {
    it("should convert nested walrus expressions", () => {
      const python = `x = (a := (b := 5))`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let x = (a = (b = 5));"`
      )
    })
  })

  describe("Real-world Examples", () => {
    it("should convert file reading pattern", () => {
      const python = `while (chunk := file.read(1024)):
    process(chunk)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "while ((chunk = file.read(1024))) {
          process(chunk);
        }"
      `)
    })

    it("should convert regex matching pattern", () => {
      const python = `if (m := re.match(pattern, string)):
    print(m.group())`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "if ((m = re.match(pattern, string))) {
          console.log(m.group());
        }"
      `)
    })

    it("should convert list processing with reuse", () => {
      const python = `filtered = [y for x in data if (y := process(x))]`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let filtered = data.filter((x) => (y = process(x))).map((x) => y);"`
      )
    })
  })
})
