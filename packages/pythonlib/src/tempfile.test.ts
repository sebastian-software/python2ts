import { describe, it, expect } from "vitest"
import * as fs from "node:fs"
import * as tempfile from "./tempfile.js"

describe("tempfile module", () => {
  describe("gettempdir()", () => {
    it("should return a temp directory path", () => {
      const tmp = tempfile.gettempdir()
      expect(typeof tmp).toBe("string")
      expect(tmp.length).toBeGreaterThan(0)
    })
  })

  describe("mktemp()", () => {
    it("should generate a unique temp path", () => {
      const path1 = tempfile.mktemp()
      const path2 = tempfile.mktemp()
      expect(path1).not.toBe(path2)
    })

    it("should support suffix and prefix", () => {
      const path = tempfile.mktemp(".txt", "test-")
      expect(path).toContain("test-")
      expect(path).toContain(".txt")
    })
  })

  describe("mkstemp()", () => {
    it("should create a temp file and return fd and path", () => {
      const [fd, path] = tempfile.mkstemp()
      expect(typeof fd).toBe("number")
      expect(fs.existsSync(path)).toBe(true)
      fs.closeSync(fd)
      fs.unlinkSync(path)
    })
  })

  describe("mkdtemp()", () => {
    it("should create a temp directory", () => {
      const dir = tempfile.mkdtemp()
      expect(fs.existsSync(dir)).toBe(true)
      expect(fs.statSync(dir).isDirectory()).toBe(true)
      fs.rmdirSync(dir)
    })

    it("should support prefix", () => {
      const dir = tempfile.mkdtemp("myprefix-")
      expect(dir).toContain("myprefix-")
      fs.rmdirSync(dir)
    })
  })

  describe("NamedTemporaryFile", () => {
    it("should create a temp file that can be written to", () => {
      const tmp = new tempfile.NamedTemporaryFile({ delete: false })
      tmp.write("hello world")
      tmp.close()
      expect(fs.readFileSync(tmp.name, "utf-8")).toBe("hello world")
      fs.unlinkSync(tmp.name)
    })

    it("should auto-delete when delete option is true", () => {
      const tmp = new tempfile.NamedTemporaryFile({ delete: true })
      const name = tmp.name
      tmp.write("test")
      tmp.close()
      expect(fs.existsSync(name)).toBe(false)
    })
  })

  describe("TemporaryDirectory", () => {
    it("should create a temp directory", () => {
      const tmp = new tempfile.TemporaryDirectory()
      expect(fs.existsSync(tmp.name)).toBe(true)
      tmp.cleanup()
      expect(fs.existsSync(tmp.name)).toBe(false)
    })
  })
})
