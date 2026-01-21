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

    it("should work with default null values", () => {
      const error = new subprocess.CalledProcessError(1, ["cmd"])
      expect(error.stdout).toBe(null)
      expect(error.stderr).toBe(null)
    })
  })

  describe("TimeoutExpired", () => {
    it("should contain timeout details", () => {
      const error = new subprocess.TimeoutExpired(["slow", "cmd"], 5000, "partial", "err")
      expect(error.cmd).toEqual(["slow", "cmd"])
      expect(error.timeout).toBe(5000)
      expect(error.stdout).toBe("partial")
      expect(error.stderr).toBe("err")
      expect(error.message).toContain("timed out")
    })

    it("should work with default null values", () => {
      const error = new subprocess.TimeoutExpired(["cmd"], 1000)
      expect(error.stdout).toBe(null)
      expect(error.stderr).toBe(null)
    })
  })

  describe("run() edge cases", () => {
    it("should handle stderr to STDOUT redirection", () => {
      const result = subprocess.run("echo out && echo err >&2", {
        shell: true,
        stdout: subprocess.PIPE,
        stderr: subprocess.STDOUT
      })
      expect(result.stdout).toContain("out")
      expect(result.stderr).toContain("err")
    })

    it("should handle DEVNULL for stdout", () => {
      const result = subprocess.run(["echo", "hello"], {
        stdout: subprocess.DEVNULL
      })
      expect(result.returncode).toBe(0)
      expect(result.stdout).toBe(null)
    })

    it("should handle DEVNULL for stderr", () => {
      const result = subprocess.run("echo error >&2", {
        shell: true,
        stderr: subprocess.DEVNULL
      })
      expect(result.returncode).toBe(0)
    })

    it("should handle input option", () => {
      const result = subprocess.run(["cat"], {
        input: "hello world",
        stdout: subprocess.PIPE
      })
      expect(result.stdout).toBe("hello world")
    })

    it("should handle string command with shell", () => {
      const result = subprocess.run("echo hello", {
        shell: true,
        stdout: subprocess.PIPE
      })
      expect(result.stdout?.trim()).toBe("hello")
    })

    it("should handle custom env", () => {
      const result = subprocess.run("echo $TEST_VAR", {
        shell: true,
        stdout: subprocess.PIPE,
        env: { TEST_VAR: "custom_value" }
      })
      expect(result.stdout?.trim()).toBe("custom_value")
    })
  })

  describe("Popen", () => {
    it("should create a process", async () => {
      const proc = new subprocess.Popen(["echo", "hello"], {
        stdout: subprocess.PIPE
      })
      expect(proc.pid).toBeDefined()
      const code = await proc.wait()
      expect(code).toBe(0)
    })

    it("should return poll() result", async () => {
      const proc = new subprocess.Popen(["echo", "hello"], {
        stdout: subprocess.PIPE
      })
      await proc.wait()
      expect(proc.poll()).toBe(0)
    })

    it("should have returncode getter", async () => {
      const proc = new subprocess.Popen(["echo", "hello"], {
        stdout: subprocess.PIPE
      })
      await proc.wait()
      expect(proc.returncode).toBe(0)
    })

    it("should have args property", () => {
      const proc = new subprocess.Popen(["echo", "hello"])
      expect(proc.args).toEqual(["echo", "hello"])
    })

    it("should handle string command", () => {
      const proc = new subprocess.Popen("echo hello")
      expect(proc.args).toEqual(["echo hello"])
    })
  })
})
