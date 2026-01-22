import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"

describe("E2E: Exception Handling", () => {
  describe("Try/Except", () => {
    it("should convert simple try/except", () => {
      const python = `try:
    x = 1
except:
    x = 0`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "try {
          let x = 1;
        } catch (e) {
          let x = 0;
        }"
      `)
    })

    it("should convert try/except with exception type", () => {
      const python = `try:
    x = int(s)
except ValueError:
    x = 0`
      expect(transpile(python)).toMatchInlineSnapshot(`
        "import { int } from "pythonlib"

        try {
          let x = int(s);
        } catch (e) {
          let x = 0;
        }"
      `)
    })

    it("should convert try/except with as clause", () => {
      const python = `try:
    x = 1
except ValueError as err:
    print(err)`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "try {
          let x = 1;
        } catch (err) {
          console.log(err);
        }"
      `)
    })

    it("should convert try/except/finally", () => {
      const python = `try:
    x = 1
except:
    x = 0
finally:
    cleanup()`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "try {
          let x = 1;
        } catch (e) {
          let x = 0;
        } finally {
          cleanup();
        }"
      `)
    })

    it("should convert try/finally without except", () => {
      const python = `try:
    x = 1
finally:
    cleanup()`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "try {
          let x = 1;
        } finally {
          cleanup();
        }"
      `)
    })

    it("should convert try with multiple statements", () => {
      const python = `try:
    x = 1
    y = 2
    z = x + y
except:
    z = 0`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "try {
          let x = 1;
          let y = 2;
          let z = (x + y);
        } catch (e) {
          let z = 0;
        }"
      `)
    })
  })

  describe("Raise Statement", () => {
    it("should convert raise with ValueError", () => {
      const python = `raise ValueError("invalid value")`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"throw new Error("invalid value");"`
      )
    })

    it("should convert raise with Exception", () => {
      const python = `raise Exception("error")`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"throw new Error("error");"`
      )
    })

    it("should convert raise without argument", () => {
      const python = `raise`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`"throw e;"`)
    })

    it("should convert raise with TypeError", () => {
      const python = `raise TypeError("wrong type")`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"throw new Error("wrong type");"`
      )
    })

    it("should convert raise without message", () => {
      const python = `raise ValueError()`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(
        `"throw new Error();"`
      )
    })
  })

  describe("Nested Exception Handling", () => {
    it("should convert nested try/except", () => {
      const python = `try:
    try:
        x = 1
    except:
        x = 2
except:
    x = 0`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "try {
          try {
            let x = 1;
          } catch (e) {
            let x = 2;
          }
        } catch (e) {
          let x = 0;
        }"
      `)
    })

    it("should convert try/except in function", () => {
      const python = `def safe_divide(a, b):
    try:
        return a / b
    except:
        return 0`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function safe_divide(a, b) {
          try {
            return (a / b);
          } catch (e) {
            return 0;
          }
        }"
      `)
    })
  })

  describe("Real-world Examples", () => {
    it("should convert file operation pattern", () => {
      const python = `try:
    data = read_file(path)
except:
    data = None
finally:
    close()`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "try {
          let data = read_file(path);
        } catch (e) {
          let data = null;
        } finally {
          close();
        }"
      `)
    })

    it("should convert error handling with raise", () => {
      const python = `def validate(x):
    if x < 0:
        raise ValueError("must be positive")`
      expect(transpile(python, { includeRuntime: false })).toMatchInlineSnapshot(`
        "function validate(x) {
          if (x < 0) {
            throw new Error("must be positive");
        }
        }"
      `)
    })
  })

  describe("Exception Types", () => {
    it("should handle KeyError", () => {
      const result = transpile("raise KeyError('key')", { includeRuntime: false })
      expect(result).toContain("Error")
    })

    it("should handle IndexError", () => {
      const result = transpile("raise IndexError('index')", { includeRuntime: false })
      expect(result).toContain("Error")
    })

    it("should handle custom exception", () => {
      const result = transpile("raise CustomError('msg')", { includeRuntime: false })
      expect(result).toContain("CustomError")
    })

    it("should handle bare raise (re-raise)", () => {
      const code = "try:\n    x = 1\nexcept:\n    raise"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("throw")
    })

    it("should handle try/except with multiple except clauses", () => {
      const code = "try:\n    x = 1\nexcept ValueError:\n    y = 2\nexcept TypeError:\n    z = 3"
      const result = transpile(code, { includeRuntime: false })
      expect(result).toContain("try")
      expect(result).toContain("catch")
    })
  })
})
