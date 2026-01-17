import { describe, it, expect } from "vitest"
import { execSync } from "child_process"
import { writeFileSync, unlinkSync, readFileSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

const CLI_PATH = join(__dirname, "..", "packages", "python2ts", "dist", "cli", "index.js")

function runCLI(args: string, input?: string): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execSync(`node ${CLI_PATH} ${args}`, {
      encoding: "utf-8",
      input,
      timeout: 5000
    })
    return { stdout, stderr: "", code: 0 }
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; status?: number }
    return {
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? "",
      code: err.status ?? 1
    }
  }
}

describe("CLI", () => {
  describe("--help", () => {
    it("should display help message", () => {
      const result = runCLI("--help")
      expect(result.code).toBe(0)
      expect(result.stdout).toContain("python2ts")
      expect(result.stdout).toContain("Usage:")
      expect(result.stdout).toContain("--output")
      expect(result.stdout).toContain("--no-runtime")
    })

    it("should display help with -h shorthand", () => {
      const result = runCLI("-h")
      expect(result.code).toBe(0)
      expect(result.stdout).toContain("python2ts")
    })
  })

  describe("--version", () => {
    it("should display version", () => {
      const result = runCLI("--version")
      expect(result.code).toBe(0)
      expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/)
    })

    it("should display version with -v shorthand", () => {
      const result = runCLI("-v")
      expect(result.code).toBe(0)
      expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/)
    })
  })

  describe("file input", () => {
    const testFile = join(tmpdir(), "python2ts-test.py")

    it("should transpile a Python file", () => {
      writeFileSync(testFile, "x = 1 + 2")
      try {
        const result = runCLI(testFile)
        expect(result.code).toBe(0)
        expect(result.stdout).toContain("let x = 1 + 2")
      } finally {
        unlinkSync(testFile)
      }
    })

    it("should include runtime import when needed", () => {
      writeFileSync(testFile, "for i in range(5):\n    print(i)")
      try {
        const result = runCLI(testFile)
        expect(result.code).toBe(0)
        expect(result.stdout).toContain('import { py } from "pythonlib"')
        expect(result.stdout).toContain("py.range(5)")
      } finally {
        unlinkSync(testFile)
      }
    })

    it("should error on non-existent file", () => {
      const result = runCLI("/nonexistent/file.py")
      expect(result.code).toBe(1)
      expect(result.stderr).toContain("File not found")
    })
  })

  describe("--output", () => {
    const testFile = join(tmpdir(), "python2ts-test.py")
    const outputFile = join(tmpdir(), "python2ts-output.ts")

    it("should write output to file", () => {
      writeFileSync(testFile, "x = 1 + 2")
      try {
        const result = runCLI(`${testFile} -o ${outputFile}`)
        expect(result.code).toBe(0)
        const output = readFileSync(outputFile, "utf-8")
        expect(output).toContain("let x = 1 + 2")
      } finally {
        unlinkSync(testFile)
        try {
          unlinkSync(outputFile)
        } catch {
          // ignore if not created
        }
      }
    })
  })

  describe("--no-runtime", () => {
    const testFile = join(tmpdir(), "python2ts-test.py")

    it("should not include runtime import", () => {
      writeFileSync(testFile, "for i in range(5):\n    print(i)")
      try {
        const result = runCLI(`${testFile} --no-runtime`)
        expect(result.code).toBe(0)
        expect(result.stdout).not.toContain("import { py }")
        expect(result.stdout).toContain("py.range(5)")
      } finally {
        unlinkSync(testFile)
      }
    })
  })

  describe("--runtime-path", () => {
    const testFile = join(tmpdir(), "python2ts-test.py")

    it("should use custom runtime path", () => {
      writeFileSync(testFile, "for i in range(5):\n    print(i)")
      try {
        const result = runCLI(`${testFile} --runtime-path ./custom/runtime`)
        expect(result.code).toBe(0)
        expect(result.stdout).toContain('import { py } from "./custom/runtime"')
      } finally {
        unlinkSync(testFile)
      }
    })
  })

  describe("stdin", () => {
    it("should read from stdin", () => {
      const result = runCLI("", "x = 1 + 2")
      expect(result.code).toBe(0)
      expect(result.stdout).toContain("let x = 1 + 2")
    })

    it("should handle multiline input from stdin", () => {
      const result = runCLI("", "x = 1\ny = 2\nprint(x + y)")
      expect(result.code).toBe(0)
      expect(result.stdout).toContain("let x = 1")
      expect(result.stdout).toContain("let y = 2")
      expect(result.stdout).toContain("console.log(x + y)")
    })
  })
})
