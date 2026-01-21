/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import * as fs from "node:fs"
import { Path } from "./pathlib.js"

describe("pathlib module", () => {
  const testDir = "/tmp/pathlib-test-" + Date.now()

  beforeAll(() => {
    fs.mkdirSync(testDir, { recursive: true })
  })

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true })
  })

  describe("Path constructor", () => {
    it("should create path from string", () => {
      const p = new Path("/a/b/c")
      expect(p.toString()).toBe("/a/b/c")
    })

    it("should join multiple segments", () => {
      const p = new Path("/a", "b", "c")
      expect(p.toString()).toBe("/a/b/c")
    })

    it("should default to current directory", () => {
      const p = new Path()
      expect(p.toString()).toBe(".")
    })
  })

  describe("name", () => {
    it("should return the final component", () => {
      const p = new Path("/a/b/file.txt")
      expect(p.name).toBe("file.txt")
    })
  })

  describe("stem", () => {
    it("should return name without extension", () => {
      const p = new Path("/a/b/file.txt")
      expect(p.stem).toBe("file")
    })
  })

  describe("suffix", () => {
    it("should return the extension", () => {
      const p = new Path("/a/b/file.txt")
      expect(p.suffix).toBe(".txt")
    })
  })

  describe("suffixes", () => {
    it("should return all extensions", () => {
      const p = new Path("/a/b/file.tar.gz")
      expect(p.suffixes).toEqual([".tar", ".gz"])
    })
  })

  describe("parent", () => {
    it("should return parent path", () => {
      const p = new Path("/a/b/c")
      expect(p.parent.toString()).toBe("/a/b")
    })
  })

  describe("parents", () => {
    it("should return all ancestors", () => {
      const p = new Path("/a/b/c")
      const parents = p.parents.map((pp: Path) => pp.toString())
      expect(parents).toContain("/a/b")
      expect(parents).toContain("/a")
    })
  })

  describe("parts", () => {
    it("should return path components", () => {
      const p = new Path("/a/b/c")
      expect(p.parts).toContain("/")
      expect(p.parts).toContain("c")
    })
  })

  describe("isAbsolute()", () => {
    it("should detect absolute paths", () => {
      expect(new Path("/a/b").isAbsolute()).toBe(true)
      expect(new Path("a/b").isAbsolute()).toBe(false)
    })
  })

  describe("joinpath()", () => {
    it("should join path segments", () => {
      const p = new Path("/a").joinpath("b", "c")
      expect(p.toString()).toBe("/a/b/c")
    })
  })

  describe("div()", () => {
    it("should join paths", () => {
      const p = new Path("/a").div("b")
      expect(p.toString()).toBe("/a/b")
    })
  })

  describe("filesystem operations", () => {
    it("exists() should detect existing paths", () => {
      expect(new Path(testDir).exists()).toBe(true)
      expect(new Path(testDir + "/nonexistent").exists()).toBe(false)
    })

    it("isDir() should detect directories", () => {
      expect(new Path(testDir).isDir()).toBe(true)
    })

    it("mkdir() should create directories", () => {
      const p = new Path(testDir, "subdir")
      p.mkdir()
      expect(p.isDir()).toBe(true)
    })

    it("writeText() and readText() should work", () => {
      const p = new Path(testDir, "test.txt")
      p.writeText("hello world")
      expect(p.readText()).toBe("hello world")
    })

    it("writeBytes() and readBytes() should work", () => {
      const p = new Path(testDir, "test.bin")
      const data = new Uint8Array([1, 2, 3, 4, 5])
      p.writeBytes(data)
      expect(p.readBytes()).toEqual(data)
    })

    it("isFile() should detect files", () => {
      const p = new Path(testDir, "test.txt")
      expect(p.isFile()).toBe(true)
    })

    it("iterdir() should list directory contents", () => {
      const p = new Path(testDir)
      const contents = p.iterdir().map((c: Path) => c.name)
      expect(contents).toContain("test.txt")
    })

    it("rename() should rename files", () => {
      const src = new Path(testDir, "rename-test.txt")
      src.writeText("test")
      const dst = src.rename(testDir + "/renamed.txt")
      expect(dst.exists()).toBe(true)
      expect(src.exists()).toBe(false)
    })

    it("resolve() should return absolute path", () => {
      const p = new Path("a/b")
      const resolved = p.resolve()
      expect(resolved.isAbsolute()).toBe(true)
    })

    it("withSuffix() should change extension", () => {
      const p = new Path("/a/b/file.txt")
      expect(p.withSuffix(".md").toString()).toBe("/a/b/file.md")
    })

    it("withName() should change filename", () => {
      const p = new Path("/a/b/file.txt")
      expect(p.withName("other.txt").toString()).toBe("/a/b/other.txt")
    })
  })

  describe("static methods", () => {
    it("cwd() should return current directory", () => {
      const cwd = Path.cwd()
      expect(cwd.isAbsolute()).toBe(true)
    })

    it("home() should return home directory", () => {
      const home = Path.home()
      expect(home.toString().length).toBeGreaterThan(0)
    })
  })
})
