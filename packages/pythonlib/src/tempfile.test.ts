import { describe, it, expect } from "vitest"
import { access, readFile, rmdir, stat, unlink } from "node:fs/promises"
import {
  gettempdir,
  mktemp,
  mkstemp,
  mkdtemp,
  NamedTemporaryFile,
  TemporaryDirectory
} from "./tempfile.js"

describe("tempfile module", () => {
  describe("gettempdir()", () => {
    it("should return a temp directory path", () => {
      const tmp = gettempdir()
      expect(typeof tmp).toBe("string")
      expect(tmp.length).toBeGreaterThan(0)
    })
  })

  describe("mktemp()", () => {
    it("should generate a unique temp path", () => {
      const path1 = mktemp()
      const path2 = mktemp()
      expect(path1).not.toBe(path2)
    })

    it("should support suffix and prefix", () => {
      const path = mktemp(".txt", "test-")
      expect(path).toContain("test-")
      expect(path).toContain(".txt")
    })
  })

  describe("mkstemp()", () => {
    it("should create a temp file and return handle and path", async () => {
      const [handle, path] = await mkstemp()
      expect(handle).toBeDefined()
      expect(typeof handle.fd).toBe("number")
      await expect(access(path)).resolves.toBeUndefined()
      await handle.close()
      await unlink(path)
    })
  })

  describe("mkdtemp()", () => {
    it("should create a temp directory", async () => {
      const dir = await mkdtemp()
      await expect(access(dir)).resolves.toBeUndefined()
      expect((await stat(dir)).isDirectory()).toBe(true)
      await rmdir(dir)
    })

    it("should support prefix", async () => {
      const dir = await mkdtemp("myprefix-")
      expect(dir).toContain("myprefix-")
      await rmdir(dir)
    })
  })

  describe("NamedTemporaryFile", () => {
    it("should create a temp file that can be written to", async () => {
      const tmp = await NamedTemporaryFile.create({ delete: false })
      await tmp.write("hello world")
      await tmp.close()
      expect(await readFile(tmp.name, "utf-8")).toBe("hello world")
      await unlink(tmp.name)
    })

    it("should auto-delete when delete option is true", async () => {
      const tmp = await NamedTemporaryFile.create({ delete: true })
      const name = tmp.name
      await tmp.write("test")
      await tmp.close()
      await expect(access(name)).rejects.toThrow()
    })
  })

  describe("TemporaryDirectory", () => {
    it("should create a temp directory", async () => {
      const tmp = await TemporaryDirectory.create()
      await expect(access(tmp.name)).resolves.toBeUndefined()
      await tmp.cleanup()
      await expect(access(tmp.name)).rejects.toThrow()
    })
  })
})
