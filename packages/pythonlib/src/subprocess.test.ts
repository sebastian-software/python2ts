import { describe, it, expect } from "vitest"
import * as subprocess from "./subprocess.js"

describe("subprocess module", () => {
  describe("run()", () => {
    it("should run a simple command", () => {
      const result = subprocess.run(["echo", "hello"])
      expect(result.returncode).toBe(0)
    })

    it("should capture stdout when PIPE is used", () => {
      const result = subprocess.run(["echo", "hello"], { stdout: subprocess.PIPE })
      expect(result.stdout).toContain("hello")
    })

    it("should capture stderr when PIPE is used", () => {
      const result = subprocess.run("echo error >&2", {
        shell: true,
        stderr: subprocess.PIPE
      })
      expect(result.stderr).toContain("error")
    })

    it("should run shell commands", () => {
      const result = subprocess.run("echo $((1+1))", {
        shell: true,
        stdout: subprocess.PIPE
      })
      expect(result.stdout?.trim()).toBe("2")
    })
  })

  describe("call()", () => {
    it("should return exit code", () => {
      const code = subprocess.call(["true"])
      expect(code).toBe(0)
    })

    it("should return non-zero for failing command", () => {
      const code = subprocess.call(["false"])
      expect(code).not.toBe(0)
    })
  })

  describe("checkCall()", () => {
    it("should not throw for successful command", () => {
      expect(() => subprocess.checkCall(["true"])).not.toThrow()
    })

    it("should throw CalledProcessError for failing command", () => {
      expect(() => subprocess.checkCall(["false"])).toThrow(subprocess.CalledProcessError)
    })
  })

  describe("checkOutput()", () => {
    it("should return stdout", () => {
      const output = subprocess.checkOutput(["echo", "test"])
      expect(output).toContain("test")
    })

    it("should throw for failing command", () => {
      expect(() => subprocess.checkOutput(["false"])).toThrow(subprocess.CalledProcessError)
    })
  })

  describe("getoutput()", () => {
    it("should return command output", () => {
      const output = subprocess.getoutput("echo hello")
      expect(output).toBe("hello")
    })

    it("should return empty string on failure", () => {
      const output = subprocess.getoutput("exit 1")
      expect(output).toBe("")
    })
  })

  describe("getstatusoutput()", () => {
    it("should return status and output", () => {
      const [status, output] = subprocess.getstatusoutput("echo hello")
      expect(status).toBe(0)
      expect(output).toBe("hello")
    })

    it("should return non-zero status for failing command", () => {
      const [status] = subprocess.getstatusoutput("exit 42")
      expect(status).toBe(42)
    })
  })

  describe("constants", () => {
    it("should export PIPE constant", () => {
      expect(subprocess.PIPE).toBe("pipe")
    })

    it("should export DEVNULL constant", () => {
      expect(subprocess.DEVNULL).toBe("devnull")
    })

    it("should export STDOUT constant", () => {
      expect(subprocess.STDOUT).toBe("stdout")
    })
  })

  describe("CalledProcessError", () => {
    it("should contain error details", () => {
      const error = new subprocess.CalledProcessError(1, ["test", "cmd"], "out", "err")
      expect(error.returncode).toBe(1)
      expect(error.cmd).toEqual(["test", "cmd"])
      expect(error.stdout).toBe("out")
      expect(error.stderr).toBe("err")
      expect(error.message).toContain("test cmd")
    })
  })
})
