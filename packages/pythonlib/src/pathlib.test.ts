/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import * as fs from "node:fs"
import { Path } from "./pathlib.node.js"

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

    it("should create path using of() factory", () => {
      const p = Path.of("/a/b/c")
      expect(p.toString()).toBe("/a/b/c")
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

    it("should return full name if no extension", () => {
      const p = new Path("/a/b/file")
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

  describe("anchor/root/drive", () => {
    it("should return anchor for absolute paths", () => {
      const p = new Path("/a/b/c")
      expect(p.anchor).toBe("/")
      expect(p.root).toBe("/")
    })

    it("should return empty for relative paths", () => {
      const p = new Path("a/b/c")
      expect(p.anchor).toBe("")
    })

    it("drive should be empty on Unix", () => {
      const p = new Path("/a/b/c")
      expect(p.drive).toBe("")
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
    it("should join paths with string", () => {
      const p = new Path("/a").div("b")
      expect(p.toString()).toBe("/a/b")
    })

    it("should join paths with Path", () => {
      const p = new Path("/a").div(new Path("b/c"))
      expect(p.toString()).toBe("/a/b/c")
    })
  })

  describe("asPosix() and asUri()", () => {
    it("asPosix() should return POSIX style path", () => {
      const p = new Path("/a/b/c")
      expect(p.asPosix()).toBe("/a/b/c")
    })

    it("asUri() should return file URI", () => {
      const p = new Path("/a/b/c")
      expect(p.asUri()).toMatch(/^file:\/\//)
    })
  })

  describe("filesystem operations", () => {
    it("exists() should detect existing paths", async () => {
      expect(await new Path(testDir).exists()).toBe(true)
      expect(await new Path(testDir + "/nonexistent").exists()).toBe(false)
    })

    it("isDir() should detect directories", async () => {
      expect(await new Path(testDir).isDir()).toBe(true)
    })

    it("mkdir() should create directories", async () => {
      const p = new Path(testDir, "subdir")
      await p.mkdir()
      expect(await p.isDir()).toBe(true)
    })

    it("writeText() and readText() should work", async () => {
      const p = new Path(testDir, "test.txt")
      await p.writeText("hello world")
      expect(await p.readText()).toBe("hello world")
    })

    it("writeBytes() and readBytes() should work", async () => {
      const p = new Path(testDir, "test.bin")
      const data = new Uint8Array([1, 2, 3, 4, 5])
      await p.writeBytes(data)
      expect(await p.readBytes()).toEqual(data)
    })

    it("isFile() should detect files", async () => {
      const p = new Path(testDir, "test.txt")
      expect(await p.isFile()).toBe(true)
    })

    it("iterdir() should list directory contents", async () => {
      const p = new Path(testDir)
      const contents = (await p.iterdir()).map((c: Path) => c.name)
      expect(contents).toContain("test.txt")
    })

    it("rename() should rename files", async () => {
      const src = new Path(testDir, "rename-test.txt")
      await src.writeText("test")
      const dst = await src.rename(testDir + "/renamed.txt")
      expect(await dst.exists()).toBe(true)
      expect(await src.exists()).toBe(false)
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

    it("withStem() should change stem keeping suffix", () => {
      const p = new Path("/a/b/file.txt")
      expect(p.withStem("other").toString()).toBe("/a/b/other.txt")
    })

    it("isFile() should return false for non-existent", async () => {
      const p = new Path(testDir, "nonexistent-file.txt")
      expect(await p.isFile()).toBe(false)
    })

    it("isDir() should return false for non-existent", async () => {
      const p = new Path(testDir, "nonexistent-dir")
      expect(await p.isDir()).toBe(false)
    })

    it("mkdir() with parents option", async () => {
      const p = new Path(testDir, "deep/nested/dir")
      await p.mkdir({ parents: true })
      expect(await p.isDir()).toBe(true)
    })

    it("mkdir() with existOk option", async () => {
      const p = new Path(testDir, "subdir")
      // Should not throw even if exists
      await p.mkdir({ existOk: true })
      expect(await p.isDir()).toBe(true)
    })

    it("replace() should rename file", async () => {
      const src = new Path(testDir, "replace-src.txt")
      await src.writeText("test")
      const dst = await src.replace(testDir + "/replace-dst.txt")
      expect(await dst.exists()).toBe(true)
    })

    it("absolute() should return absolute path", () => {
      const p = new Path("a/b")
      expect(p.absolute().isAbsolute()).toBe(true)
    })

    it("relativeTo() should return relative path", () => {
      const p = new Path("/a/b/c/d")
      const rel = p.relativeTo("/a/b")
      expect(rel.toString()).toBe("c/d")
    })

    it("match() should match glob patterns", () => {
      const p = new Path("/a/b/file.txt")
      expect(p.match("*.txt")).toBe(true)
      expect(p.match("*.md")).toBe(false)
    })

    it("unlink() should delete files", async () => {
      const p = new Path(testDir, "to-delete.txt")
      await p.writeText("delete me")
      await p.unlink()
      expect(await p.exists()).toBe(false)
    })

    it("rmdir() should delete empty directories", async () => {
      const p = new Path(testDir, "to-delete-dir")
      await p.mkdir()
      await p.rmdir()
      expect(await p.exists()).toBe(false)
    })

    it("touch() should create files", async () => {
      const p = new Path(testDir, "touched.txt")
      await p.touch()
      expect(await p.exists()).toBe(true)
    })

    it("touch() should update times on existing file", async () => {
      const p = new Path(testDir, "touched.txt")
      await p.touch(new Date(), new Date())
      expect(await p.exists()).toBe(true)
    })

    it("stat() should return file stats", async () => {
      const p = new Path(testDir, "test.txt")
      const stats = await p.stat()
      expect(stats.isFile()).toBe(true)
    })

    it("lstat() should return stats", async () => {
      const p = new Path(testDir, "test.txt")
      const stats = await p.lstat()
      expect(stats.isFile()).toBe(true)
    })

    it("chmod() should change permissions", async () => {
      const p = new Path(testDir, "chmod-test.txt")
      await p.writeText("test")
      await p.chmod(0o644)
      expect(await p.exists()).toBe(true)
    })

    it("glob() should find matching files", async () => {
      const p = new Path(testDir)
      const matches = await p.glob("*.txt")
      expect(matches.length).toBeGreaterThan(0)
    })

    it("rglob() should find matching files recursively", async () => {
      const p = new Path(testDir)
      const matches = await p.rglob("*.txt")
      expect(matches.length).toBeGreaterThan(0)
    })

    it("isSymlink() should detect symlinks", async () => {
      const p = new Path(testDir, "not-a-symlink.txt")
      await p.writeText("not a symlink")
      expect(await p.isSymlink()).toBe(false)
    })

    it("isSymlink() should return false for non-existent", async () => {
      const p = new Path(testDir, "nonexistent-symlink")
      expect(await p.isSymlink()).toBe(false)
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
