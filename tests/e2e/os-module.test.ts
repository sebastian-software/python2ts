import { describe, it, expect } from "vitest"
import { transpile } from "../../src/generator/index.js"
import { py } from "../../src/runtime/index.js"

describe("E2E: os module", () => {
  describe("Import Handling", () => {
    it("should strip import os", () => {
      const result = transpile("import os", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })

    it("should strip from os import path", () => {
      const result = transpile("from os import path, getcwd", { includeRuntime: false })
      expect(result.trim()).toBe("")
    })
  })

  describe("Function Transformations", () => {
    it("should transform os.path.join", () => {
      const result = transpile("x = os.path.join('a', 'b')", { includeRuntime: false })
      expect(result).toContain("py.os.path.join")
    })

    it("should transform os.getcwd", () => {
      const result = transpile("x = os.getcwd()", { includeRuntime: false })
      expect(result).toContain("py.os.getcwd()")
    })

    it("should transform os.sep", () => {
      const result = transpile("x = os.sep", { includeRuntime: false })
      expect(result).toContain("py.os.sep")
    })
  })

  describe("Runtime: os.path", () => {
    describe("join", () => {
      it("should join paths", () => {
        expect(py.os.path.join("a", "b", "c")).toBe("a/b/c")
      })

      it("should handle absolute paths", () => {
        expect(py.os.path.join("a", "/b", "c")).toBe("/b/c")
      })

      it("should handle empty parts", () => {
        expect(py.os.path.join("", "a", "b")).toBe("a/b")
      })
    })

    describe("basename", () => {
      it("should return base name", () => {
        expect(py.os.path.basename("/foo/bar/baz.txt")).toBe("baz.txt")
      })

      it("should handle trailing slashes", () => {
        expect(py.os.path.basename("/foo/bar/")).toBe("bar")
      })

      it("should remove suffix", () => {
        expect(py.os.path.basename("/foo/bar.txt", ".txt")).toBe("bar")
      })
    })

    describe("dirname", () => {
      it("should return directory name", () => {
        expect(py.os.path.dirname("/foo/bar/baz.txt")).toBe("/foo/bar")
      })

      it("should handle no directory", () => {
        expect(py.os.path.dirname("baz.txt")).toBe("")
      })

      it("should handle root", () => {
        expect(py.os.path.dirname("/foo")).toBe("/")
      })
    })

    describe("split", () => {
      it("should split path into head and tail", () => {
        expect(py.os.path.split("/foo/bar/baz.txt")).toEqual(["/foo/bar", "baz.txt"])
      })

      it("should handle no directory", () => {
        expect(py.os.path.split("baz.txt")).toEqual(["", "baz.txt"])
      })
    })

    describe("splitext", () => {
      it("should split extension", () => {
        expect(py.os.path.splitext("/foo/bar.txt")).toEqual(["/foo/bar", ".txt"])
      })

      it("should handle no extension", () => {
        expect(py.os.path.splitext("/foo/bar")).toEqual(["/foo/bar", ""])
      })

      it("should handle hidden files", () => {
        expect(py.os.path.splitext("/foo/.hidden")).toEqual(["/foo/.hidden", ""])
      })
    })

    describe("isabs", () => {
      it("should detect absolute paths", () => {
        expect(py.os.path.isabs("/foo/bar")).toBe(true)
        expect(py.os.path.isabs("foo/bar")).toBe(false)
      })
    })

    describe("normpath", () => {
      it("should normalize path", () => {
        expect(py.os.path.normpath("/foo/./bar/../baz")).toBe("/foo/baz")
      })

      it("should handle empty path", () => {
        expect(py.os.path.normpath("")).toBe(".")
      })
    })

    describe("relpath", () => {
      it("should compute relative path", () => {
        expect(py.os.path.relpath("/foo/bar/baz", "/foo")).toBe("bar/baz")
      })
    })

    describe("commonpath", () => {
      it("should find common path prefix", () => {
        expect(py.os.path.commonpath(["/foo/bar/a", "/foo/bar/b"])).toBe("/foo/bar")
      })

      it("should throw on empty sequence", () => {
        expect(() => py.os.path.commonpath([])).toThrow()
      })
    })
  })

  describe("Runtime: os constants", () => {
    it("should have sep", () => {
      expect(py.os.sep).toBe("/")
    })

    it("should have curdir", () => {
      expect(py.os.curdir).toBe(".")
    })

    it("should have pardir", () => {
      expect(py.os.pardir).toBe("..")
    })

    it("should have extsep", () => {
      expect(py.os.extsep).toBe(".")
    })
  })

  describe("Runtime: os functions", () => {
    it("getcwd should return a path", () => {
      const cwd = py.os.getcwd()
      expect(typeof cwd).toBe("string")
    })
  })
})
