/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { describe, it, expect } from "vitest"
import * as fs from "node:fs"
import * as os from "./os.node.js"

describe("os module", () => {
  describe("path functions", () => {
    it("join should join path components", () => {
      expect(os.path.join("a", "b", "c")).toBe("a/b/c")
      expect(os.path.join("/a", "b")).toBe("/a/b")
    })

    it("basename should return the final component", () => {
      expect(os.path.basename("/path/to/file.txt")).toBe("file.txt")
    })

    it("dirname should return the directory part", () => {
      expect(os.path.dirname("/path/to/file.txt")).toBe("/path/to")
    })

    it("split should split path into head and tail", () => {
      const [head, tail] = os.path.split("/path/to/file.txt")
      expect(head).toBe("/path/to")
      expect(tail).toBe("file.txt")
    })

    it("splitExt should split extension", () => {
      const [root, ext] = os.path.splitExt("/path/to/file.txt")
      expect(root).toBe("/path/to/file")
      expect(ext).toBe(".txt")
    })

    it("isAbs should check if path is absolute", () => {
      expect(os.path.isAbs("/absolute/path")).toBe(true)
      expect(os.path.isAbs("relative/path")).toBe(false)
    })

    it("normPath should normalize path", () => {
      expect(os.path.normPath("a/b/../c")).toBe("a/c")
      expect(os.path.normPath("a//b")).toBe("a/b")
    })

    it("absPath should return absolute normalized path", () => {
      const result = os.path.absPath("a/../b")
      // In Node.js, absPath returns cwd + relative path
      expect(os.path.isAbs(result)).toBe(true)
      expect(/[/\\]b$/.test(result)).toBe(true)
    })

    it("relPath should return relative path", () => {
      expect(os.path.relPath("/a/b/c", "/a")).toBe("b/c")
    })

    it("commonPath should return common path prefix", () => {
      expect(os.path.commonPath(["/a/b/c", "/a/b/d"])).toBe("/a/b")
    })
  })

  describe("environment", () => {
    it("getenv should return environment variable or undefined in browser", () => {
      const path = os.getenv("PATH")
      // In Node.js, PATH is defined; in browser, environ is empty
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const isNode = typeof process !== "undefined" && process.env !== undefined
      if (isNode) {
        expect(path).toBeDefined()
      } else {
        expect(path).toBeUndefined()
      }
    })

    it("getenv should return default for missing variable", () => {
      expect(os.getenv("NONEXISTENT_VAR_12345", "default")).toBe("default")
    })

    it("getCwd should return current directory", () => {
      const cwd = os.getCwd()
      expect(typeof cwd).toBe("string")
      expect(cwd.length).toBeGreaterThan(0)
    })
  })

  describe("constants", () => {
    it("should export sep", () => {
      expect(os.sep).toBe("/")
    })

    it("should export lineSep", () => {
      expect(os.lineSep).toBe("\n")
    })

    it("should export name", () => {
      expect(["posix", "nt"]).toContain(os.name)
    })
  })

  describe("filesystem operations (Node.js)", () => {
    const testDir = "/tmp/pythonlib-test-" + Date.now()

    it("mkdir should create directory", () => {
      os.mkdir(testDir)
      expect(os.path.isDir(testDir)).toBe(true)
    })

    it("listDir should list directory contents", () => {
      const contents = os.listDir(testDir)
      expect(Array.isArray(contents)).toBe(true)
    })

    it("listDir should return empty array for nonexistent directory", () => {
      const contents = os.listDir("/nonexistent-path-12345")
      expect(contents).toEqual([])
    })

    it("makeDirs should create nested directories", () => {
      const nested = testDir + "/a/b/c"
      os.makeDirs(nested)
      expect(os.path.isDir(nested)).toBe(true)
    })

    it("makeDirs with existOk should not throw on existing directory", () => {
      expect(() => {
        os.makeDirs(testDir, 0o777, true)
      }).not.toThrow()
    })

    it("path.exists should detect existing paths", () => {
      expect(os.path.exists(testDir)).toBe(true)
      expect(os.path.exists(testDir + "/nonexistent")).toBe(false)
    })

    it("path.isFile should detect files", () => {
      const filePath = testDir + "/testfile.txt"
      fs.writeFileSync(filePath, "test content")
      expect(os.path.isFile(filePath)).toBe(true)
      expect(os.path.isFile(testDir)).toBe(false)
      expect(os.path.isFile("/nonexistent-12345")).toBe(false)
    })

    it("path.isLink should detect symbolic links", () => {
      const filePath = testDir + "/testfile.txt"
      const linkPath = testDir + "/testlink"
      fs.symlinkSync(filePath, linkPath)
      expect(os.path.isLink(linkPath)).toBe(true)
      expect(os.path.isLink(filePath)).toBe(false)
      expect(os.path.isLink("/nonexistent-12345")).toBe(false)
      fs.unlinkSync(linkPath)
    })

    it("path.isDir should return false for nonexistent paths", () => {
      expect(os.path.isDir("/nonexistent-12345")).toBe(false)
    })

    it("path.getSize should return file size", () => {
      const filePath = testDir + "/testfile.txt"
      const size = os.path.getSize(filePath)
      expect(size).toBe(12) // "test content" = 12 bytes
    })

    it("path.getSize should return 0 for nonexistent file", () => {
      expect(os.path.getSize("/nonexistent-12345")).toBe(0)
    })

    it("path.getMtime should return modification time", () => {
      const filePath = testDir + "/testfile.txt"
      const mtime = os.path.getMtime(filePath)
      expect(mtime).toBeGreaterThan(0)
    })

    it("path.getMtime should return 0 for nonexistent file", () => {
      expect(os.path.getMtime("/nonexistent-12345")).toBe(0)
    })

    it("path.getAtime should return access time", () => {
      const filePath = testDir + "/testfile.txt"
      const atime = os.path.getAtime(filePath)
      expect(atime).toBeGreaterThan(0)
    })

    it("path.getAtime should return 0 for nonexistent file", () => {
      expect(os.path.getAtime("/nonexistent-12345")).toBe(0)
    })

    it("path.getCtime should return creation time", () => {
      const filePath = testDir + "/testfile.txt"
      const ctime = os.path.getCtime(filePath)
      expect(ctime).toBeGreaterThan(0)
    })

    it("path.getCtime should return 0 for nonexistent file", () => {
      expect(os.path.getCtime("/nonexistent-12345")).toBe(0)
    })

    it("path.realPath should resolve symlinks", () => {
      const filePath = testDir + "/testfile.txt"
      const realPath = os.path.realPath(filePath)
      expect(realPath).toContain("testfile.txt")
    })

    it("path.realPath should fall back to absPath for nonexistent", () => {
      const result = os.path.realPath("./nonexistent-path")
      expect(os.path.isAbs(result)).toBe(true)
    })

    it("stat should return file statistics", () => {
      const filePath = testDir + "/testfile.txt"
      const s = os.stat(filePath)
      expect(s.st_size).toBe(12)
      expect(s.st_mtime).toBeGreaterThan(0)
      expect(s.st_atime).toBeGreaterThan(0)
      expect(s.st_ctime).toBeGreaterThan(0)
      expect(s.st_mode).toBeGreaterThan(0)
    })

    it("stat should return zeros for nonexistent file", () => {
      const s = os.stat("/nonexistent-12345")
      expect(s.st_size).toBe(0)
      expect(s.st_mtime).toBe(0)
    })

    it("rename should rename file", () => {
      const oldPath = testDir + "/testfile.txt"
      const newPath = testDir + "/renamed.txt"
      os.rename(oldPath, newPath)
      expect(os.path.exists(oldPath)).toBe(false)
      expect(os.path.exists(newPath)).toBe(true)
    })

    it("replace should atomically replace file", () => {
      const src = testDir + "/src.txt"
      const dst = testDir + "/dst.txt"
      fs.writeFileSync(src, "source")
      fs.writeFileSync(dst, "destination")
      os.replace(src, dst)
      expect(os.path.exists(src)).toBe(false)
      expect(os.path.exists(dst)).toBe(true)
    })

    it("renames should create destination directory", () => {
      const src = testDir + "/renamed.txt"
      const dst = testDir + "/new-dir/new-file.txt"
      os.renames(src, dst)
      expect(os.path.exists(dst)).toBe(true)
    })

    it("walk should traverse directory tree", () => {
      const results: [string, string[], string[]][] = []
      for (const entry of os.walk(testDir)) {
        results.push(entry)
      }
      expect(results.length).toBeGreaterThan(0)
      const firstResult = results[0]
      expect(firstResult).toBeDefined()
      expect(firstResult?.[0]).toBe(testDir)
    })

    it("walk with topdown=false should yield bottom-up", () => {
      const results: [string, string[], string[]][] = []
      for (const entry of os.walk(testDir, { topdown: false })) {
        results.push(entry)
      }
      expect(results.length).toBeGreaterThan(0)
      // Last entry should be the root
      const lastResult = results[results.length - 1]
      expect(lastResult?.[0]).toBe(testDir)
    })

    it("walk should handle nonexistent directory", () => {
      const results: [string, string[], string[]][] = []
      for (const entry of os.walk("/nonexistent-path-12345")) {
        results.push(entry)
      }
      expect(results).toEqual([])
    })

    it("walk with followlinks=true should follow symlink to directory", () => {
      // Create a subdirectory and a symlink to it
      const subDir = testDir + "/link-target-dir"
      const linkPath = testDir + "/symlink-to-dir"
      os.mkdir(subDir)
      fs.symlinkSync(subDir, linkPath)

      const results: [string, string[], string[]][] = []
      for (const entry of os.walk(testDir, { followlinks: true })) {
        results.push(entry)
      }

      // The first entry should be the testDir with symlink-to-dir in dirs
      const firstResult = results[0]
      expect(firstResult).toBeDefined()
      expect(firstResult?.[1]).toContain("symlink-to-dir")
      expect(firstResult?.[1]).toContain("link-target-dir")

      // Cleanup
      fs.unlinkSync(linkPath)
      fs.rmdirSync(subDir)
    })

    it("walk with followlinks=true should follow symlink to file", () => {
      // Create a file and a symlink to it
      const filePath = testDir + "/link-target-file.txt"
      const linkPath = testDir + "/symlink-to-file"
      fs.writeFileSync(filePath, "content")
      fs.symlinkSync(filePath, linkPath)

      const results: [string, string[], string[]][] = []
      for (const entry of os.walk(testDir, { followlinks: true })) {
        results.push(entry)
      }

      // The first entry should have the symlink in files
      const firstResult = results[0]
      expect(firstResult).toBeDefined()
      expect(firstResult?.[2]).toContain("symlink-to-file")
      expect(firstResult?.[2]).toContain("link-target-file.txt")

      // Cleanup
      fs.unlinkSync(linkPath)
      fs.unlinkSync(filePath)
    })

    it("walk with followlinks=true should handle broken symlink", () => {
      // Create a symlink to a nonexistent target
      const linkPath = testDir + "/broken-symlink"
      fs.symlinkSync("/nonexistent-target-12345", linkPath)

      const results: [string, string[], string[]][] = []
      for (const entry of os.walk(testDir, { followlinks: true })) {
        results.push(entry)
      }

      // Broken symlink should be in files (catch branch)
      const firstResult = results[0]
      expect(firstResult).toBeDefined()
      expect(firstResult?.[2]).toContain("broken-symlink")

      // Cleanup
      fs.unlinkSync(linkPath)
    })

    it("walk with followlinks=false should treat symlinks as files", () => {
      // Create a directory and a symlink to it
      const subDir = testDir + "/dir-for-symlink"
      const linkPath = testDir + "/symlink-no-follow"
      os.mkdir(subDir)
      fs.symlinkSync(subDir, linkPath)

      const results: [string, string[], string[]][] = []
      for (const entry of os.walk(testDir, { followlinks: false })) {
        results.push(entry)
      }

      // With followlinks=false, symlink should be in files not dirs
      const firstResult = results[0]
      expect(firstResult).toBeDefined()
      expect(firstResult?.[2]).toContain("symlink-no-follow")
      expect(firstResult?.[1]).toContain("dir-for-symlink")
      expect(firstResult?.[1]).not.toContain("symlink-no-follow")

      // Cleanup
      fs.unlinkSync(linkPath)
      fs.rmdirSync(subDir)
    })

    it("makeDirs should handle permission errors", () => {
      // Try to create directory in a location that should fail
      // (Note: mkdirSync with recursive:true doesn't throw EEXIST)
      expect(() => {
        os.makeDirs("/root/no-permission-12345")
      }).toThrow()
    })

    it("remove should delete file (unlink alias)", () => {
      const filePath = testDir + "/to-delete.txt"
      fs.writeFileSync(filePath, "delete me")
      os.unlink(filePath)
      expect(os.path.exists(filePath)).toBe(false)
    })

    it("rmdir should remove empty directory", () => {
      const emptyDir = testDir + "/empty"
      os.mkdir(emptyDir)
      os.rmdir(emptyDir)
      expect(os.path.exists(emptyDir)).toBe(false)
    })

    it("removeDirs should remove directory and empty parents", () => {
      const nested = testDir + "/remove-test/nested"
      os.makeDirs(nested)
      os.removeDirs(nested)
      expect(os.path.exists(nested)).toBe(false)
    })

    // Cleanup
    it("cleanup: remove test directory", () => {
      fs.rmSync(testDir, { recursive: true, force: true })
      expect(os.path.exists(testDir)).toBe(false)
    })
  })

  describe("shared path functions", () => {
    it("pathJoin should join paths", () => {
      expect(os.pathJoin("a", "b")).toBe("a/b")
      expect(os.pathJoin("/a", "b")).toBe("/a/b")
      expect(os.pathJoin("a", "/b")).toBe("/b") // absolute path resets
    })

    it("pathJoin should handle edge cases", () => {
      expect(os.pathJoin()).toBe("")
      expect(os.pathJoin("a")).toBe("a")
      expect(os.pathJoin("", "b")).toBe("b")
      expect(os.pathJoin("a/", "b")).toBe("a/b")
    })

    it("pathBasename should extract basename", () => {
      expect(os.pathBasename("/a/b/c.txt")).toBe("c.txt")
      expect(os.pathBasename("/a/b/c.txt", ".txt")).toBe("c")
    })

    it("pathDirname should extract dirname", () => {
      expect(os.pathDirname("/a/b/c.txt")).toBe("/a/b")
    })

    it("pathSplitFn should split path", () => {
      expect(os.pathSplitFn("/a/b/c.txt")).toEqual(["/a/b", "c.txt"])
    })

    it("pathSplitExt should split extension", () => {
      expect(os.pathSplitExt("/a/b/c.txt")).toEqual(["/a/b/c", ".txt"])
      expect(os.pathSplitExt("/a/b/.hidden")).toEqual(["/a/b/.hidden", ""])
    })

    it("pathExtName should return extension", () => {
      expect(os.pathExtName("/a/b/c.txt")).toBe(".txt")
    })

    it("pathIsAbs should detect absolute paths", () => {
      expect(os.pathIsAbs("/a/b")).toBe(true)
      expect(os.pathIsAbs("a/b")).toBe(false)
    })

    it("pathNormPath should normalize paths", () => {
      expect(os.pathNormPath("a/b/../c")).toBe("a/c")
      expect(os.pathNormPath("")).toBe(".")
    })

    it("pathRelPath should compute relative path", () => {
      expect(os.pathRelPath("/a/b/c", "/a")).toBe("b/c")
    })

    it("pathCommonPath should find common prefix", () => {
      expect(os.pathCommonPath(["/a/b/c", "/a/b/d"])).toBe("/a/b")
    })

    it("pathExpandUser should expand tilde", () => {
      const result = os.pathExpandUser("~/test")
      expect(result).not.toContain("~")
    })

    it("pathExpandUser should not expand ~user format", () => {
      // ~username format is not supported, returns unchanged
      const result = os.pathExpandUser("~otheruser/test")
      expect(result).toBe("~otheruser/test")
    })

    it("pathExpandUser should expand standalone ~", () => {
      const result = os.pathExpandUser("~")
      expect(result).not.toBe("~")
      expect(result.length).toBeGreaterThan(1)
    })

    it("pathExpandUser should not expand when no tilde", () => {
      expect(os.pathExpandUser("/absolute/path")).toBe("/absolute/path")
      expect(os.pathExpandUser("relative/path")).toBe("relative/path")
    })

    it("pathExpandVars should expand environment variables", () => {
      process.env.TEST_VAR_12345 = "expanded"
      expect(os.pathExpandVars("$TEST_VAR_12345/path")).toBe("expanded/path")
      expect(os.pathExpandVars("${TEST_VAR_12345}/path")).toBe("expanded/path")
      delete process.env.TEST_VAR_12345
    })
  })
})
