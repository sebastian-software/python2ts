import { describe, it, expect } from "vitest"
import { transpile } from "python2ts"
import { os } from "pythonlib"

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
      const result = transpile("x = os.path.join('a', 'b')")
      expect(result).toContain('from "pythonlib/os"')
      expect(result).toContain("path.join(")
    })

    it("should transform os.getcwd", () => {
      const result = transpile("x = os.getcwd()")
      expect(result).toContain('from "pythonlib/os"')
      expect(result).toContain("getCwd()")
    })

    it("should transform os.sep", () => {
      const result = transpile("x = os.sep")
      expect(result).toContain('from "pythonlib/os"')
      expect(result).toContain("sep")
    })
  })

  describe("Runtime: os.path", () => {
    describe("join", () => {
      it("should join paths", () => {
        expect(os.path.join("a", "b", "c")).toBe("a/b/c")
      })

      it("should handle absolute paths", () => {
        expect(os.path.join("a", "/b", "c")).toBe("/b/c")
      })

      it("should handle empty parts", () => {
        expect(os.path.join("", "a", "b")).toBe("a/b")
      })
    })

    describe("basename", () => {
      it("should return base name", () => {
        expect(os.path.basename("/foo/bar/baz.txt")).toBe("baz.txt")
      })

      it("should handle trailing slashes", () => {
        expect(os.path.basename("/foo/bar/")).toBe("bar")
      })

      it("should remove suffix", () => {
        expect(os.path.basename("/foo/bar.txt", ".txt")).toBe("bar")
      })
    })

    describe("dirname", () => {
      it("should return directory name", () => {
        expect(os.path.dirname("/foo/bar/baz.txt")).toBe("/foo/bar")
      })

      it("should handle no directory", () => {
        expect(os.path.dirname("baz.txt")).toBe("")
      })

      it("should handle root", () => {
        expect(os.path.dirname("/foo")).toBe("/")
      })
    })

    describe("split", () => {
      it("should split path into head and tail", () => {
        expect(os.path.split("/foo/bar/baz.txt")).toEqual(["/foo/bar", "baz.txt"])
      })

      it("should handle no directory", () => {
        expect(os.path.split("baz.txt")).toEqual(["", "baz.txt"])
      })
    })

    describe("splitext", () => {
      it("should split extension", () => {
        expect(os.path.splitExt("/foo/bar.txt")).toEqual(["/foo/bar", ".txt"])
      })

      it("should handle no extension", () => {
        expect(os.path.splitExt("/foo/bar")).toEqual(["/foo/bar", ""])
      })

      it("should handle hidden files", () => {
        expect(os.path.splitExt("/foo/.hidden")).toEqual(["/foo/.hidden", ""])
      })
    })

    describe("isabs", () => {
      it("should detect absolute paths", () => {
        expect(os.path.isAbs("/foo/bar")).toBe(true)
        expect(os.path.isAbs("foo/bar")).toBe(false)
      })
    })

    describe("normpath", () => {
      it("should normalize path", () => {
        expect(os.path.normPath("/foo/./bar/../baz")).toBe("/foo/baz")
      })

      it("should handle empty path", () => {
        expect(os.path.normPath("")).toBe(".")
      })
    })

    describe("relpath", () => {
      it("should compute relative path", () => {
        expect(os.path.relPath("/foo/bar/baz", "/foo")).toBe("bar/baz")
      })
    })

    describe("commonpath", () => {
      it("should find common path prefix", () => {
        expect(os.path.commonPath(["/foo/bar/a", "/foo/bar/b"])).toBe("/foo/bar")
      })

      it("should throw on empty sequence", () => {
        expect(() => os.path.commonPath([])).toThrow()
      })
    })
  })

  describe("Runtime: os constants", () => {
    it("should have sep", () => {
      expect(os.sep).toBe("/")
    })

    it("should have curdir", () => {
      expect(os.curDir).toBe(".")
    })

    it("should have pardir", () => {
      expect(os.parDir).toBe("..")
    })

    it("should have extsep", () => {
      expect(os.extSep).toBe(".")
    })
  })

  describe("Runtime: os functions", () => {
    it("getcwd should return a path", () => {
      const cwd = os.getCwd()
      expect(typeof cwd).toBe("string")
    })
  })
})
