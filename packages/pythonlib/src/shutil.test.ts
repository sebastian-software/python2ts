/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import * as fs from "node:fs"
import * as shutil from "./shutil.node.js"

describe("shutil module", () => {
  const testDir = "/tmp/shutil-test-" + Date.now()

  beforeAll(() => {
    fs.mkdirSync(testDir + "/src", { recursive: true })
    fs.writeFileSync(testDir + "/src/file.txt", "test content")
  })

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true })
  })

  describe("copy()", () => {
    it("should copy a file", async () => {
      const src = testDir + "/src/file.txt"
      const dst = testDir + "/copied.txt"
      await shutil.copy(src, dst)
      expect(fs.existsSync(dst)).toBe(true)
      expect(fs.readFileSync(dst, "utf-8")).toBe("test content")
    })
  })

  describe("copy2()", () => {
    it("should copy a file with metadata", async () => {
      const src = testDir + "/src/file.txt"
      const dst = testDir + "/copied2.txt"
      await shutil.copy2(src, dst)
      expect(fs.existsSync(dst)).toBe(true)
    })
  })

  describe("copytree()", () => {
    it("should copy a directory tree", async () => {
      const src = testDir + "/src"
      const dst = testDir + "/dst"
      await shutil.copytree(src, dst)
      expect(fs.existsSync(dst + "/file.txt")).toBe(true)
    })
  })

  describe("move()", () => {
    it("should move a file", async () => {
      const src = testDir + "/to-move.txt"
      const dst = testDir + "/moved.txt"
      fs.writeFileSync(src, "move me")
      await shutil.move(src, dst)
      expect(fs.existsSync(dst)).toBe(true)
      expect(fs.existsSync(src)).toBe(false)
    })
  })

  describe("rmtree()", () => {
    it("should remove a directory tree", async () => {
      const dir = testDir + "/to-remove"
      fs.mkdirSync(dir + "/nested", { recursive: true })
      fs.writeFileSync(dir + "/nested/file.txt", "test")
      await shutil.rmtree(dir)
      expect(fs.existsSync(dir)).toBe(false)
    })
  })

  describe("which()", () => {
    it("should find executable in PATH", async () => {
      const result = await shutil.which("node")
      expect(result).not.toBeNull()
      expect(result).toContain("node")
    })

    it("should return null for non-existent command", async () => {
      const result = await shutil.which("nonexistent-command-12345")
      expect(result).toBeNull()
    })
  })

  describe("diskUsage()", () => {
    it("should return disk usage information", async () => {
      const usage = await shutil.diskUsage("/")
      expect(usage.total).toBeGreaterThan(0)
      expect(usage.used).toBeGreaterThanOrEqual(0)
      expect(usage.free).toBeGreaterThanOrEqual(0)
    })
  })

  describe("getTerminalSize()", () => {
    it("should return terminal size", () => {
      const size = shutil.getTerminalSize()
      expect(size.columns).toBeGreaterThan(0)
      expect(size.lines).toBeGreaterThan(0)
    })
  })

  describe("copymode()", () => {
    it("should copy file mode", async () => {
      const src = testDir + "/src/file.txt"
      const dst = testDir + "/copymode-dst.txt"
      fs.writeFileSync(dst, "test")
      await shutil.copymode(src, dst)
      // Just check it doesn't throw
      expect(fs.existsSync(dst)).toBe(true)
    })
  })

  describe("copystat()", () => {
    it("should copy file stats", async () => {
      const src = testDir + "/src/file.txt"
      const dst = testDir + "/copystat-dst.txt"
      fs.writeFileSync(dst, "test")
      await shutil.copystat(src, dst)
      expect(fs.existsSync(dst)).toBe(true)
    })
  })

  describe("copyfile()", () => {
    it("should copy file content", async () => {
      const src = testDir + "/src/file.txt"
      const dst = testDir + "/copyfile-dst.txt"
      await shutil.copyfile(src, dst)
      expect(fs.readFileSync(dst, "utf-8")).toBe("test content")
    })
  })

  describe("copy() to directory", () => {
    it("should copy file into directory", async () => {
      const src = testDir + "/src/file.txt"
      const dstDir = testDir + "/copy-dst-dir"
      fs.mkdirSync(dstDir, { recursive: true })
      const result = await shutil.copy(src, dstDir)
      expect(result).toBe(dstDir + "/file.txt")
      expect(fs.existsSync(result)).toBe(true)
    })
  })

  describe("move() into directory", () => {
    it("should move file into directory", async () => {
      const src = testDir + "/move-into-dir.txt"
      const dstDir = testDir + "/move-dst-dir"
      fs.writeFileSync(src, "move me")
      fs.mkdirSync(dstDir, { recursive: true })
      const result = await shutil.move(src, dstDir)
      expect(result).toBe(dstDir + "/move-into-dir.txt")
      expect(fs.existsSync(result)).toBe(true)
    })
  })

  describe("copytree() with options", () => {
    it("should support dirsExistOk option", async () => {
      const src = testDir + "/src"
      const dst = testDir + "/copytree-existok"
      fs.mkdirSync(dst, { recursive: true })
      await shutil.copytree(src, dst, { dirsExistOk: true })
      expect(fs.existsSync(dst + "/file.txt")).toBe(true)
    })

    it("should support ignore option", async () => {
      const src = testDir + "/src"
      const dst = testDir + "/copytree-ignore"
      await shutil.copytree(src, dst, {
        ignore: () => ["file.txt"]
      })
      expect(fs.existsSync(dst + "/file.txt")).toBe(false)
    })
  })

  describe("rmtree() with options", () => {
    it("should support ignoreErrors option", async () => {
      await shutil.rmtree("/nonexistent-path-12345", { ignoreErrors: true })
      // Should not throw
    })
  })

  describe("makeArchive() and unpackArchive()", () => {
    it("makeArchive should throw not implemented", () => {
      expect(() => shutil.makeArchive("test", "zip", "/tmp")).toThrow("not implemented")
    })

    it("unpackArchive should throw not implemented", () => {
      expect(() => {
        shutil.unpackArchive("test.zip")
      }).toThrow("not implemented")
    })
  })
})
