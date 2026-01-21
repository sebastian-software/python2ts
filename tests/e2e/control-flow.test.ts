import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

describe("E2E: Control Flow", () => {
  describe("If Statements", () => {
    it("should convert simple if", () => {
      const python = `if x > 0:
    y = 1`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "if (x > 0) {
          let y = 1;
        }"
      `)
    })

    it("should convert if-else", () => {
      const python = `if x > 0:
    y = 1
else:
    y = -1`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "if (x > 0) {
          let y = 1;
        } else {
          let y = (-1);
        }"
      `)
    })

    it("should convert if-elif-else", () => {
      const python = `if x > 0:
    y = 1
elif x < 0:
    y = -1
else:
    y = 0`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "if (x > 0) {
          let y = 1;
        } else if (x < 0) {
          let y = (-1);
        } else {
          let y = 0;
        }"
      `)
    })

    it("should handle nested if statements", () => {
      const python = `if x > 0:
    if y > 0:
        z = 1`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "if (x > 0) {
          if (y > 0) {
            let z = 1;
        }
        }"
      `)
    })
  })

  describe("While Loops", () => {
    it("should convert while loop", () => {
      const python = `while x > 0:
    x = x - 1`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "while (x > 0) {
          let x = (x - 1);
        }"
      `)
    })

    it("should convert while True", () => {
      const python = `while True:
    break`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "while (true) {
          break;
        }"
      `)
    })

    it("should handle break statement", () => {
      const python = `while True:
    if done:
        break`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "while (true) {
          if (done) {
            break;
        }
        }"
      `)
    })

    it("should handle continue statement", () => {
      const python = `while True:
    if skip:
        continue`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "while (true) {
          if (skip) {
            continue;
        }
        }"
      `)
    })
  })

  describe("For Loops", () => {
    it("should convert for-in loop", () => {
      const python = `for item in items:
    print(item)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "for (const item of iter(items)) {
          console.log(item);
        }"
      `)
    })

    it("should convert for-range loop", () => {
      const python = `for i in range(10):
    print(i)`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { range } from "pythonlib"

        for (const i of range(10)) {
          console.log(i);
        }"
      `)
    })

    it("should convert for-enumerate loop", () => {
      const python = `for i, item in enumerate(items):
    print(i, item)`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { enumerate } from "pythonlib"

        for (const [i, item] of enumerate(items)) {
          console.log(i, item);
        }"
      `)
    })

    it("should handle tuple unpacking in for loop", () => {
      const python = `for x, y in pairs:
    print(x, y)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "for (const [x, y] of iter(pairs)) {
          console.log(x, y);
        }"
      `)
    })

    it("should handle nested tuple unpacking in for loop", () => {
      const python = `for i, (a, b) in items:
    print(i, a, b)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "for (const [i, [a, b]] of iter(items)) {
          console.log(i, a, b);
        }"
      `)
    })

    it("should handle triple unpacking", () => {
      const python = `for a, b, c in triples:
    print(a, b, c)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "for (const [a, b, c] of iter(triples)) {
          console.log(a, b, c);
        }"
      `)
    })

    it("should handle dict.items() unpacking", () => {
      const python = `for key, value in d.items():
    print(key, value)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "for (const [key, value] of Object.entries(d)) {
          console.log(key, value);
        }"
      `)
    })

    it("should handle zip unpacking", () => {
      const python = `for a, b in zip(list1, list2):
    print(a, b)`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { zip } from "pythonlib"

        for (const [a, b] of zip(list1, list2)) {
          console.log(a, b);
        }"
      `)
    })

    it("should handle break in for loop", () => {
      const python = `for i in items:
    if found:
        break`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "for (const i of iter(items)) {
          if (found) {
            break;
        }
        }"
      `)
    })

    it("should handle continue in for loop", () => {
      const python = `for i in items:
    if skip:
        continue`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "for (const i of iter(items)) {
          if (skip) {
            continue;
        }
        }"
      `)
    })
  })

  describe("Pass Statement", () => {
    it("should convert pass to comment", () => {
      const python = `if x:
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "if (x) {

        }"
      `)
    })

    it("should convert pass in function", () => {
      const python = `def foo():
    pass`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function foo() {

        }"
      `)
    })
  })

  describe("Conditional Expressions (Ternary)", () => {
    it("should convert conditional expression", () => {
      const python = "y = 1 if x > 0 else -1"
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"let y = (x > 0 ? 1 : (-1));"`
      )
    })
  })

  describe("Nested Control Flow", () => {
    it("should handle nested loops", () => {
      const python = `for i in range(3):
    for j in range(3):
        print(i, j)`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { range } from "pythonlib"

        for (const i of range(3)) {
          for (const j of range(3)) {
            console.log(i, j);
        }
        }"
      `)
    })

    it("should handle loop inside if", () => {
      const python = `if items:
    for item in items:
        print(item)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "if (items) {
          for (const item of iter(items)) {
            console.log(item);
        }
        }"
      `)
    })

    it("should handle if inside loop", () => {
      const python = `for item in items:
    if item > 0:
        print(item)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "for (const item of iter(items)) {
          if (item > 0) {
            console.log(item);
        }
        }"
      `)
    })
  })
})
