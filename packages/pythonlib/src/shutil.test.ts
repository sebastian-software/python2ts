/* eslint-disable @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import * as fs from "node:fs"
import * as shutil from "./shutil"

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
    it("should copy a file", () => {
      const src = testDir + "/src/file.txt"
      const dst = testDir + "/copied.txt"
      shutil.copy(src, dst)
      expect(fs.existsSync(dst)).toBe(true)
      expect(fs.readFileSync(dst, "utf-8")).toBe("test content")
    })
  })

  describe("copy2()", () => {
    it("should copy a file with metadata", () => {
      const src = testDir + "/src/file.txt"
      const dst = testDir + "/copied2.txt"
      shutil.copy2(src, dst)
      expect(fs.existsSync(dst)).toBe(true)
    })
  })

  describe("copytree()", () => {
    it("should copy a directory tree", () => {
      const src = testDir + "/src"
      const dst = testDir + "/dst"
      shutil.copytree(src, dst)
      expect(fs.existsSync(dst + "/file.txt")).toBe(true)
    })
  })

  describe("move()", () => {
    it("should move a file", () => {
      const src = testDir + "/to-move.txt"
      const dst = testDir + "/moved.txt"
      fs.writeFileSync(src, "move me")
      shutil.move(src, dst)
      expect(fs.existsSync(dst)).toBe(true)
      expect(fs.existsSync(src)).toBe(false)
    })
  })

  describe("rmtree()", () => {
    it("should remove a directory tree", () => {
      const dir = testDir + "/to-remove"
      fs.mkdirSync(dir + "/nested", { recursive: true })
      fs.writeFileSync(dir + "/nested/file.txt", "test")
      shutil.rmtree(dir)
      expect(fs.existsSync(dir)).toBe(false)
    })
  })

  describe("which()", () => {
    it("should find executable in PATH", () => {
      const result = shutil.which("node")
      expect(result).not.toBeNull()
      expect(result).toContain("node")
    })

    it("should return null for non-existent command", () => {
      const result = shutil.which("nonexistent-command-12345")
      expect(result).toBeNull()
    })
  })

  describe("diskUsage()", () => {
    it("should return disk usage information", () => {
      const usage = shutil.diskUsage("/")
      expect(usage.total).toBeGreaterThan(0)
      expect(usage.used).toBeGreaterThanOrEqual(0)
      expect(usage.free).toBeGreaterThanOrEqual(0)
    })
  })
})
