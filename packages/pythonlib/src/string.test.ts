/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect } from "vitest"
import * as string from "./string"

describe("string module", () => {
  describe("constants", () => {
    it("should have asciiLowercase", () => {
      expect(string.asciiLowercase).toBe("abcdefghijklmnopqrstuvwxyz")
    })

    it("should have asciiUppercase", () => {
      expect(string.asciiUppercase).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    })

    it("should have asciiLetters", () => {
      expect(string.asciiLetters).toBe(string.asciiLowercase + string.asciiUppercase)
    })

    it("should have digits", () => {
      expect(string.digits).toBe("0123456789")
    })

    it("should have hexDigits", () => {
      expect(string.hexDigits).toBe("0123456789abcdefABCDEF")
    })

    it("should have octDigits", () => {
      expect(string.octDigits).toBe("01234567")
    })

    it("should have punctuation", () => {
      expect(string.punctuation).toContain("!")
      expect(string.punctuation).toContain("@")
    })

    it("should have whitespace", () => {
      expect(string.whitespace).toContain(" ")
      expect(string.whitespace).toContain("\t")
      expect(string.whitespace).toContain("\n")
    })

    it("should have printable", () => {
      expect(string.printable).toContain("a")
      expect(string.printable).toContain("1")
      expect(string.printable).toContain(" ")
    })
  })

  describe("Template", () => {
    it("should substitute variables", () => {
      const t = new string.Template("Hello $name!")
      expect(t.substitute({ name: "World" })).toBe("Hello World!")
    })

    it("should support ${var} syntax", () => {
      const t = new string.Template("Hello ${name}!")
      expect(t.substitute({ name: "World" })).toBe("Hello World!")
    })

    it("should escape $$ as $", () => {
      const t = new string.Template("Price: $$100")
      expect(t.substitute()).toBe("Price: $100")
    })

    it("should throw on missing key", () => {
      const t = new string.Template("Hello $name!")
      expect(() => t.substitute()).toThrow("KeyError")
    })

    it("should safeSubstitute missing keys", () => {
      const t = new string.Template("Hello $name!")
      expect(t.safeSubstitute()).toBe("Hello $name!")
    })

    it("should getIdentifiers", () => {
      const t = new string.Template("$a and ${b} and $c")
      expect(t.getIdentifiers()).toEqual(["a", "b", "c"])
    })
  })

  describe("capWords()", () => {
    it("should capitalize each word", () => {
      expect(string.capWords("hello world")).toBe("Hello World")
    })

    it("should support custom separator", () => {
      expect(string.capWords("hello-world", "-")).toBe("Hello-World")
    })
  })

  describe("string namespace", () => {
    it("join should join strings", () => {
      expect(string.string.join(", ", ["a", "b", "c"])).toBe("a, b, c")
    })

    it("split should split string", () => {
      expect(string.string.split("a,b,c", ",")).toEqual(["a", "b", "c"])
    })

    it("split should handle whitespace default", () => {
      expect(string.string.split("  a  b  c  ")).toEqual(["a", "b", "c"])
    })

    it("split should support maxsplit", () => {
      expect(string.string.split("a,b,c,d", ",", 2)).toEqual(["a", "b", "c,d"])
    })

    it("split on whitespace with maxsplit", () => {
      expect(string.string.split("a b c d", undefined, 2)).toEqual(["a", "b", "c d"])
    })

    it("rSplit should split from right", () => {
      expect(string.string.rSplit("a,b,c,d", ",", 2)).toEqual(["a,b", "c", "d"])
    })

    it("rSplit on whitespace", () => {
      expect(string.string.rSplit("a b c d", undefined, 2)).toEqual(["a b", "c", "d"])
    })

    it("rSplit with maxsplit 0", () => {
      expect(string.string.rSplit("a b c", undefined, 0)).toEqual(["a b c"])
    })

    it("strip should remove characters", () => {
      expect(string.string.strip("  hello  ")).toBe("hello")
      expect(string.string.strip("xxhelloxx", "x")).toBe("hello")
    })

    it("lStrip should remove from left", () => {
      expect(string.string.lStrip("  hello")).toBe("hello")
      expect(string.string.lStrip("xxhello", "x")).toBe("hello")
    })

    it("rStrip should remove from right", () => {
      expect(string.string.rStrip("hello  ")).toBe("hello")
      expect(string.string.rStrip("helloxx", "x")).toBe("hello")
    })

    it("upper/lower should change case", () => {
      expect(string.string.upper("hello")).toBe("HELLO")
      expect(string.string.lower("HELLO")).toBe("hello")
    })

    it("capitalize should capitalize first letter", () => {
      expect(string.string.capitalize("hello WORLD")).toBe("Hello world")
      expect(string.string.capitalize("")).toBe("")
    })

    it("title should title case", () => {
      expect(string.string.title("hello world")).toBe("Hello World")
    })

    it("swapCase should swap case", () => {
      expect(string.string.swapCase("Hello World")).toBe("hELLO wORLD")
    })

    it("startsWith should check prefix", () => {
      expect(string.string.startsWith("hello world", "hello")).toBe(true)
      expect(string.string.startsWith("hello world", "world")).toBe(false)
      expect(string.string.startsWith("hello world", "world", 6)).toBe(true)
    })

    it("endsWith should check suffix", () => {
      expect(string.string.endsWith("hello world", "world")).toBe(true)
      expect(string.string.endsWith("hello world", "hello")).toBe(false)
      expect(string.string.endsWith("hello world", "hello", 0, 5)).toBe(true)
    })

    it("find/rFind should find substring", () => {
      expect(string.string.find("hello", "l")).toBe(2)
      expect(string.string.find("hello", "x")).toBe(-1)
      expect(string.string.rFind("hello", "l")).toBe(3)
      expect(string.string.find("hello world", "o", 5)).toBe(7)
    })

    it("index/rIndex should find or throw", () => {
      expect(string.string.index("hello", "l")).toBe(2)
      expect(() => string.string.index("hello", "x")).toThrow("substring not found")
      expect(string.string.rIndex("hello", "l")).toBe(3)
      expect(() => string.string.rIndex("hello", "x")).toThrow("substring not found")
    })

    it("count should count occurrences", () => {
      expect(string.string.count("hello", "l")).toBe(2)
      expect(string.string.count("hello", "x")).toBe(0)
      expect(string.string.count("hello", "")).toBe(6)
    })

    it("replace should replace substring", () => {
      expect(string.string.replace("hello", "l", "L")).toBe("heLLo")
      expect(string.string.replace("hello", "l", "L", 1)).toBe("heLlo")
    })

    it("zFill should pad with zeros", () => {
      expect(string.string.zFill("42", 5)).toBe("00042")
      expect(string.string.zFill("-42", 5)).toBe("-0042")
      expect(string.string.zFill("+42", 5)).toBe("+0042")
      expect(string.string.zFill("12345", 3)).toBe("12345")
    })

    it("center/lJust/rJust should align", () => {
      expect(string.string.center("hi", 6)).toBe("  hi  ")
      expect(string.string.center("hi", 7, "-")).toBe("--hi---")
      expect(string.string.lJust("hi", 5)).toBe("hi   ")
      expect(string.string.rJust("hi", 5)).toBe("   hi")
      expect(string.string.center("hello", 3)).toBe("hello")
    })

    it("partition/rPartition should split on separator", () => {
      expect(string.string.partition("a=b=c", "=")).toEqual(["a", "=", "b=c"])
      expect(string.string.partition("abc", "=")).toEqual(["abc", "", ""])
      expect(string.string.rPartition("a=b=c", "=")).toEqual(["a=b", "=", "c"])
      expect(string.string.rPartition("abc", "=")).toEqual(["", "", "abc"])
    })

    it("isAlpha/isDigit/isAlnum should check content", () => {
      expect(string.string.isAlpha("abc")).toBe(true)
      expect(string.string.isAlpha("abc123")).toBe(false)
      expect(string.string.isAlpha("")).toBe(false)
      expect(string.string.isDigit("123")).toBe(true)
      expect(string.string.isDigit("12a")).toBe(false)
      expect(string.string.isAlnum("abc123")).toBe(true)
      expect(string.string.isAlnum("abc!")).toBe(false)
    })

    it("isSpace should check whitespace", () => {
      expect(string.string.isSpace("   ")).toBe(true)
      expect(string.string.isSpace("  a  ")).toBe(false)
      expect(string.string.isSpace("")).toBe(false)
    })

    it("isUpper/isLower should check case", () => {
      expect(string.string.isUpper("HELLO")).toBe(true)
      expect(string.string.isUpper("Hello")).toBe(false)
      expect(string.string.isUpper("123")).toBe(false)
      expect(string.string.isLower("hello")).toBe(true)
      expect(string.string.isLower("Hello")).toBe(false)
    })

    it("format should format string", () => {
      expect(string.string.format("{} {}", "hello", "world")).toBe("hello world")
      expect(string.string.format("{0} {1} {0}", "a", "b")).toBe("a b a")
    })
  })
})
