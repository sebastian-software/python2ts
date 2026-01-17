import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { floordiv, mod, pow, contains, slice, at, repeatValue } from "pythonlib"

describe("E2E: Operators", () => {
  describe("Arithmetic Operators", () => {
    it("should convert addition", () => {
      const ts = transpile("x = 1 + 2", { includeRuntime: false })
      expect(ts).toBe("let x = (1 + 2);")
    })

    it("should convert subtraction", () => {
      const ts = transpile("x = 5 - 3", { includeRuntime: false })
      expect(ts).toBe("let x = (5 - 3);")
    })

    it("should convert multiplication", () => {
      const ts = transpile("x = 4 * 2", { includeRuntime: false })
      expect(ts).toBe("let x = (4 * 2);")
    })

    it("should convert division", () => {
      const ts = transpile("x = 10 / 2", { includeRuntime: false })
      expect(ts).toBe("let x = (10 / 2);")
    })

    it("should convert floor division with py.floordiv", () => {
      const ts = transpile("x = 10 // 3")
      expect(ts).toContain("floordiv(10, 3)")
    })

    it("should convert power with py.pow", () => {
      const ts = transpile("x = 2 ** 8")
      expect(ts).toContain("pow(2, 8)")
    })

    it("should convert modulo with py.mod", () => {
      const ts = transpile("x = 7 % 3")
      expect(ts).toContain("mod(7, 3)")
    })

    it("should handle nested arithmetic", () => {
      const ts = transpile("x = (1 + 2) * 3", { includeRuntime: false })
      expect(ts).toContain("(1 + 2)")
      expect(ts).toContain("* 3")
    })
  })

  describe("Comparison Operators", () => {
    it("should convert equality", () => {
      const ts = transpile("x == y", { includeRuntime: false })
      expect(ts).toBe("(x == y);")
    })

    it("should convert inequality", () => {
      const ts = transpile("x != y", { includeRuntime: false })
      expect(ts).toBe("(x != y);")
    })

    it("should convert less than", () => {
      const ts = transpile("x < y", { includeRuntime: false })
      expect(ts).toBe("(x < y);")
    })

    it("should convert greater than", () => {
      const ts = transpile("x > y", { includeRuntime: false })
      expect(ts).toBe("(x > y);")
    })

    it("should convert less than or equal", () => {
      const ts = transpile("x <= y", { includeRuntime: false })
      expect(ts).toBe("(x <= y);")
    })

    it("should convert greater than or equal", () => {
      const ts = transpile("x >= y", { includeRuntime: false })
      expect(ts).toBe("(x >= y);")
    })
  })

  describe("Logical Operators", () => {
    it("should convert and to &&", () => {
      const ts = transpile("x and y", { includeRuntime: false })
      expect(ts).toBe("(x && y);")
    })

    it("should convert or to ||", () => {
      const ts = transpile("x or y", { includeRuntime: false })
      expect(ts).toBe("(x || y);")
    })

    it("should convert not to !", () => {
      const ts = transpile("not x", { includeRuntime: false })
      expect(ts).toBe("(!x);")
    })

    it("should handle compound logical expressions", () => {
      const ts = transpile("x and y or z", { includeRuntime: false })
      expect(ts).toContain("&&")
      expect(ts).toContain("||")
    })
  })

  describe("Unary Operators", () => {
    it("should convert negative", () => {
      const ts = transpile("-x", { includeRuntime: false })
      expect(ts).toBe("(-x);")
    })

    it("should convert positive", () => {
      const ts = transpile("+x", { includeRuntime: false })
      expect(ts).toBe("(+x);")
    })

    it("should convert not", () => {
      const ts = transpile("not True", { includeRuntime: false })
      expect(ts).toBe("(!true);")
    })
  })

  describe("Membership Operators", () => {
    it("should convert in with py.in", () => {
      const ts = transpile("x in items")
      expect(ts).toContain("contains(x, items)")
    })
  })

  describe("Runtime Verification", () => {
    describe("Floor Division (Python semantics)", () => {
      it("positive // positive", () => {
        expect(floordiv(10, 3)).toBe(3)
        expect(floordiv(9, 3)).toBe(3)
      })

      it("negative // positive", () => {
        expect(floordiv(-10, 3)).toBe(-4)
        expect(floordiv(-9, 3)).toBe(-3)
      })

      it("positive // negative", () => {
        expect(floordiv(10, -3)).toBe(-4)
      })

      it("negative // negative", () => {
        expect(floordiv(-10, -3)).toBe(3)
      })
    })

    describe("Modulo (Python semantics)", () => {
      it("positive % positive", () => {
        expect(mod(7, 3)).toBe(1)
        expect(mod(9, 3)).toBe(0)
      })

      it("negative % positive (result has sign of divisor)", () => {
        expect(mod(-7, 3)).toBe(2)
        expect(mod(-1, 3)).toBe(2)
      })

      it("positive % negative", () => {
        expect(mod(7, -3)).toBe(-2)
      })

      it("negative % negative", () => {
        expect(mod(-7, -3)).toBe(-1)
      })
    })

    describe("Power", () => {
      it("integer powers", () => {
        expect(pow(2, 0)).toBe(1)
        expect(pow(2, 1)).toBe(2)
        expect(pow(2, 8)).toBe(256)
        expect(pow(3, 3)).toBe(27)
      })

      it("negative exponents", () => {
        expect(pow(2, -1)).toBe(0.5)
        expect(pow(4, -1)).toBe(0.25)
      })
    })

    describe("Membership (in)", () => {
      it("array membership", () => {
        expect(contains(2, [1, 2, 3])).toBe(true)
        expect(contains(5, [1, 2, 3])).toBe(false)
      })

      it("string membership", () => {
        expect(contains("el", "hello")).toBe(true)
        expect(contains("xyz", "hello")).toBe(false)
      })

      it("set membership", () => {
        const s = new Set([1, 2, 3])
        expect(contains(2, s)).toBe(true)
        expect(contains(5, s)).toBe(false)
      })

      it("map key membership", () => {
        const m = new Map([
          ["a", 1],
          ["b", 2]
        ])
        expect(contains("a", m)).toBe(true)
        expect(contains("c", m)).toBe(false)
      })
    })
  })

  describe("Identity Operators", () => {
    it("should handle 'is' with None", () => {
      const result = transpile("x is None", { includeRuntime: false })
      expect(result).toBe("(x === null);")
    })

    it("should handle identity comparison", () => {
      const result = transpile("a is b", { includeRuntime: false })
      expect(result).toBe("(a === b);")
    })

    it("should handle negated identity comparison", () => {
      const result = transpile("x is not None", { includeRuntime: false })
      expect(result).toBeDefined()
    })
  })

  describe("Chained Comparisons", () => {
    it("should handle chained comparison with >=", () => {
      const result = transpile("1 <= x <= 10", { includeRuntime: false })
      expect(result).toContain("&&")
    })

    it("should handle chained comparison with !=", () => {
      const result = transpile("a != b != c", { includeRuntime: false })
      expect(result).toContain("&&")
    })
  })

  describe("Bitwise Operators", () => {
    it("should handle bitwise and", () => {
      const result = transpile("x = a & b", { includeRuntime: false })
      expect(result).toContain("&")
    })

    it("should handle bitwise or", () => {
      const result = transpile("x = a | b", { includeRuntime: false })
      expect(result).toContain("|")
    })

    it("should handle bitwise xor", () => {
      const result = transpile("x = a ^ b", { includeRuntime: false })
      expect(result).toContain("^")
    })

    it("should handle left shift", () => {
      const result = transpile("x = a << 2", { includeRuntime: false })
      expect(result).toContain("<<")
    })

    it("should handle right shift", () => {
      const result = transpile("x = a >> 2", { includeRuntime: false })
      expect(result).toContain(">>")
    })

    it("should handle bitwise not", () => {
      const result = transpile("x = ~y", { includeRuntime: false })
      expect(result).toContain("~")
    })
  })

  describe("Repetition Operators", () => {
    it("should handle number * string repetition (reversed)", () => {
      const result = transpile("x = 3 * 'ab'")
      expect(result).toContain("py.repeat")
    })

    it("should handle number * array repetition (reversed)", () => {
      const result = transpile("x = 3 * [1, 2]")
      expect(result).toContain("py.repeat")
    })
  })

  describe("Augmented Assignment Operators", () => {
    it("should handle augmented assignment", () => {
      const result = transpile("x += 1", { includeRuntime: false })
      expect(result).toContain("+=")
    })

    it("should handle floor division augmented assignment", () => {
      const result = transpile("x //= 2", { includeRuntime: false })
      expect(result).toContain("//=")
    })

    it("should handle power augmented assignment", () => {
      const result = transpile("x **= 2", { includeRuntime: false })
      expect(result).toContain("**=")
    })

    it("should handle modulo augmented assignment", () => {
      const result = transpile("x %= 2", { includeRuntime: false })
      expect(result).toContain("%=")
    })
  })
})
