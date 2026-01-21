/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import * as fs from "node:fs"
import * as glob from "./glob.node.js"

describe("glob module", () => {
  const testDir = "/tmp/glob-test-" + Date.now()

  beforeAll(() => {
    fs.mkdirSync(testDir + "/subdir", { recursive: true })
    fs.writeFileSync(testDir + "/file1.txt", "test")
    fs.writeFileSync(testDir + "/file2.txt", "test")
    fs.writeFileSync(testDir + "/file.js", "test")
    fs.writeFileSync(testDir + "/subdir/nested.txt", "test")
  })

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true })
  })

  describe("glob()", () => {
    it("should match files with wildcard", async () => {
      const result = await glob.glob(testDir + "/*.txt")
      expect(result.length).toBe(2)
      expect(result.some((p: string) => p.includes("file1.txt"))).toBe(true)
      expect(result.some((p: string) => p.includes("file2.txt"))).toBe(true)
    })

    it("should match files with single char wildcard", async () => {
      const result = await glob.glob(testDir + "/file?.txt")
      expect(result.length).toBe(2)
    })

    it("should return empty array for no matches", async () => {
      const result = await glob.glob(testDir + "/*.xyz")
      expect(result).toEqual([])
    })

    it("should match recursively with **", async () => {
      const result = await glob.glob(testDir + "/**/*.txt")
      expect(result.length).toBeGreaterThanOrEqual(3)
      expect(result.some((p: string) => p.includes("nested.txt"))).toBe(true)
    })
  })

  describe("iglob()", () => {
    it("should return an async iterator", async () => {
      const iter = glob.iglob(testDir + "/*.txt")
      const results: string[] = []
      for await (const p of iter) {
        results.push(p)
      }
      expect(results.length).toBe(2)
    })
  })

  describe("escape()", () => {
    it("should escape special characters", () => {
      expect(glob.escape("file[1].txt")).toBe("file[[]1].txt")
      expect(glob.escape("file*.txt")).toBe("file[*].txt")
      expect(glob.escape("file?.txt")).toBe("file[?].txt")
    })

    it("should leave normal characters unchanged", () => {
      expect(glob.escape("normal.txt")).toBe("normal.txt")
    })
  })

  describe("hasMagic()", () => {
    it("should detect glob patterns", () => {
      expect(glob.hasMagic("*.txt")).toBe(true)
      expect(glob.hasMagic("file?.txt")).toBe(true)
      expect(glob.hasMagic("[abc].txt")).toBe(true)
      expect(glob.hasMagic("normal.txt")).toBe(false)
    })
  })
})
