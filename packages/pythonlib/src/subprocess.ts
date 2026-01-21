/**
 * Python subprocess module for TypeScript
 *
 * Provides functions to spawn new processes and connect to their I/O.
 *
 * @see {@link https://docs.python.org/3/library/subprocess.html | Python subprocess documentation}
 * @module
 */

import * as childProcess from "node:child_process"

/**
 * Special constant to indicate that a pipe should be created.
 */
export const PIPE = "pipe" as const

/**
 * Special constant to indicate that the subprocess's stderr should be redirected to stdout.
 */
export const STDOUT = "stdout" as const

/**
 * Special constant to indicate that output should be discarded.
 */
export const DEVNULL = "devnull" as const

/**
 * Result of a completed process.
 */
export interface CompletedProcess {
  /** The arguments used to launch the process */
  args: string[]
  /** Exit status of the process */
  returncode: number
  /** Captured stdout (if PIPE was used) */
  stdout: string | null
  /** Captured stderr (if PIPE was used) */
  stderr: string | null
}

/**
 * Options for subprocess functions.
 */
export interface SubprocessOptions {
  /** Working directory for the command */
  cwd?: string
  /** Environment variables */
  env?: Record<string, string>
  /** Input to send to stdin */
  input?: string | Uint8Array
  /** How to handle stdout */
  stdout?: typeof PIPE | typeof DEVNULL | null
  /** How to handle stderr */
  stderr?: typeof PIPE | typeof STDOUT | typeof DEVNULL | null
  /** Timeout in milliseconds */
  timeout?: number
  /** Shell to use (if true, uses default shell) */
  shell?: boolean | string
  /** Encoding for text mode (default: utf-8) */
  encoding?: BufferEncoding
  /** Whether to capture output as text (default: true) */
  text?: boolean
  /** Whether to raise CalledProcessError on non-zero exit */
  check?: boolean
}

/**
 * Error thrown when a subprocess returns a non-zero exit code.
 */
export class CalledProcessError extends Error {
  readonly returncode: number
  readonly cmd: string[]
  readonly stdout: string | null
  readonly stderr: string | null

  constructor(
    returncode: number,
    cmd: string[],
    stdout: string | null = null,
    stderr: string | null = null
  ) {
    super(`Command '${cmd.join(" ")}' returned non-zero exit status ${String(returncode)}`)
    this.name = "CalledProcessError"
    this.returncode = returncode
    this.cmd = cmd
    this.stdout = stdout
    this.stderr = stderr
  }
}

/**
 * Error thrown when a subprocess times out.
 */
export class TimeoutExpired extends Error {
  readonly cmd: string[]
  readonly timeout: number
  readonly stdout: string | null
  readonly stderr: string | null

  constructor(
    cmd: string[],
    timeout: number,
    stdout: string | null = null,
    stderr: string | null = null
  ) {
    super(`Command '${cmd.join(" ")}' timed out after ${String(timeout)} milliseconds`)
    this.name = "TimeoutExpired"
    this.cmd = cmd
    this.timeout = timeout
    this.stdout = stdout
    this.stderr = stderr
  }
}

/**
 * Run a command and wait for it to complete.
 *
 * @param args - Command and arguments (or a single string if shell=true)
 * @param options - Subprocess options
 * @returns CompletedProcess with exit code and captured output
 *
 * @example
 * ```typescript
 * // Run a simple command
 * const result = run(["ls", "-la"])
 *
 * // Run with shell
 * const result = run("echo hello && echo world", { shell: true })
 *
 * // Capture output
 * const result = run(["git", "status"], { stdout: PIPE })
 * console.log(result.stdout)
 *
 * // Check for errors
 * const result = run(["false"], { check: true }) // Throws CalledProcessError
 * ```
 */
export function run(args: string[] | string, options?: SubprocessOptions): CompletedProcess {
  const encoding = options?.encoding ?? "utf-8"
  const text = options?.text ?? true

  let command: string
  let cmdArgs: string[]

  if (typeof args === "string") {
    command = args
    cmdArgs = [args]
  } else {
    command = args[0] ?? ""
    cmdArgs = args.slice(1)
  }

  const spawnOptions: childProcess.SpawnSyncOptions = {
    cwd: options?.cwd,
    env: options?.env ? { ...process.env, ...options.env } : undefined,
    input: options?.input,
    timeout: options?.timeout,
    shell: options?.shell,
    encoding: text ? encoding : "buffer",
    stdio: [
      options?.input !== undefined ? "pipe" : "inherit",
      options?.stdout === PIPE ? "pipe" : options?.stdout === DEVNULL ? "ignore" : "inherit",
      options?.stderr === PIPE
        ? "pipe"
        : options?.stderr === STDOUT
          ? "pipe"
          : options?.stderr === DEVNULL
            ? "ignore"
            : "inherit"
    ]
  }

  let result: childProcess.SpawnSyncReturns<string | Buffer>

  if (typeof args === "string" || options?.shell) {
    result = childProcess.spawnSync(typeof args === "string" ? args : args.join(" "), [], {
      ...spawnOptions,
      shell: true
    })
  } else {
    result = childProcess.spawnSync(command, cmdArgs, spawnOptions)
  }

  // Check for timeout
  if (result.error && (result.error as NodeJS.ErrnoException).code === "ETIMEDOUT") {
    throw new TimeoutExpired(
      typeof args === "string" ? [args] : args,
      options?.timeout ?? 0,
      result.stdout ? result.stdout.toString() : null,
      result.stderr ? result.stderr.toString() : null
    )
  }

  const stdout = result.stdout ? (text ? result.stdout.toString() : result.stdout.toString()) : null
  const stderr = result.stderr ? (text ? result.stderr.toString() : result.stderr.toString()) : null
  const returncode = result.status ?? -1

  // Check for non-zero exit code
  if (options?.check && returncode !== 0) {
    throw new CalledProcessError(
      returncode,
      typeof args === "string" ? [args] : args,
      stdout,
      stderr
    )
  }

  return {
    args: typeof args === "string" ? [args] : args,
    returncode,
    stdout,
    stderr
  }
}

/**
 * Run a command and return its exit code.
 *
 * @param args - Command and arguments
 * @param options - Subprocess options
 * @returns Exit code
 */
export function call(args: string[] | string, options?: SubprocessOptions): number {
  const result = run(args, options)
  return result.returncode
}

/**
 * Run a command and raise CalledProcessError if it returns non-zero.
 *
 * @param args - Command and arguments
 * @param options - Subprocess options
 * @returns Exit code (always 0 if no exception)
 */
export function checkCall(args: string[] | string, options?: SubprocessOptions): number {
  const result = run(args, { ...options, check: true })
  return result.returncode
}

/**
 * Run a command and return its output, raising CalledProcessError if it returns non-zero.
 *
 * @param args - Command and arguments
 * @param options - Subprocess options
 * @returns Captured stdout
 */
export function checkOutput(args: string[] | string, options?: SubprocessOptions): string {
  const result = run(args, { ...options, stdout: PIPE, check: true })
  return result.stdout ?? ""
}

/**
 * Get the output of a shell command (convenience function).
 *
 * @param cmd - Shell command to run
 * @returns Command output as string
 */
export function getoutput(cmd: string): string {
  try {
    const result = run(cmd, { shell: true, stdout: PIPE, stderr: DEVNULL })
    return result.stdout?.trim() ?? ""
  } catch {
    return ""
  }
}

/**
 * Get the exit status and output of a shell command.
 *
 * @param cmd - Shell command to run
 * @returns Tuple of [exit_status, output]
 */
export function getstatusoutput(cmd: string): [number, string] {
  const result = run(cmd, { shell: true, stdout: PIPE, stderr: STDOUT })
  return [result.returncode, result.stdout?.trim() ?? ""]
}

/**
 * A subprocess.Popen-like class for more control over process execution.
 */
export class Popen {
  readonly args: string[]
  private readonly process: childProcess.ChildProcess
  private _returncode: number | null = null
  private _stdout: string | null = null
  private _stderr: string | null = null

  constructor(args: string[] | string, options?: SubprocessOptions) {
    this.args = typeof args === "string" ? [args] : args

    const command = typeof args === "string" ? args : (args[0] ?? "")
    const cmdArgs = typeof args === "string" ? [] : args.slice(1)

    const spawnOptions: childProcess.SpawnOptions = {
      cwd: options?.cwd,
      env: options?.env ? { ...process.env, ...options.env } : undefined,
      shell: options?.shell,
      stdio: [
        options?.input !== undefined ? "pipe" : "inherit",
        options?.stdout === PIPE ? "pipe" : options?.stdout === DEVNULL ? "ignore" : "inherit",
        options?.stderr === PIPE
          ? "pipe"
          : options?.stderr === STDOUT
            ? "pipe"
            : options?.stderr === DEVNULL
              ? "ignore"
              : "inherit"
      ]
    }

    if (typeof args === "string" || options?.shell) {
      this.process = childProcess.spawn(typeof args === "string" ? args : args.join(" "), [], {
        ...spawnOptions,
        shell: true
      })
    } else {
      this.process = childProcess.spawn(command, cmdArgs, spawnOptions)
    }

    // Write input if provided
    if (options?.input !== undefined && this.process.stdin) {
      this.process.stdin.write(options.input)
      this.process.stdin.end()
    }

    // Capture stdout
    if (this.process.stdout) {
      let data = ""
      this.process.stdout.on("data", (chunk: Buffer) => {
        data += chunk.toString()
      })
      this.process.stdout.on("end", () => {
        this._stdout = data
      })
    }

    // Capture stderr
    if (this.process.stderr) {
      let data = ""
      this.process.stderr.on("data", (chunk: Buffer) => {
        data += chunk.toString()
      })
      this.process.stderr.on("end", () => {
        this._stderr = data
      })
    }

    this.process.on("exit", (code) => {
      this._returncode = code ?? -1
    })
  }

  /**
   * Wait for the process to complete.
   */
  wait(): Promise<number> {
    return new Promise((resolve) => {
      if (this._returncode !== null) {
        resolve(this._returncode)
      } else {
        this.process.on("exit", (code) => {
          resolve(code ?? -1)
        })
      }
    })
  }

  /**
   * Get the exit code (or null if still running).
   */
  poll(): number | null {
    return this._returncode
  }

  /**
   * Communicate with the process and return stdout/stderr.
   */
  async communicate(input?: string | Uint8Array): Promise<[string | null, string | null]> {
    if (input !== undefined && this.process.stdin) {
      this.process.stdin.write(input)
      this.process.stdin.end()
    }
    await this.wait()
    return [this._stdout, this._stderr]
  }

  /* v8 ignore start -- process control methods are hard to test reliably @preserve */

  /**
   * Send a signal to the process.
   */
  send_signal(signal: number | NodeJS.Signals): boolean {
    return this.process.kill(signal)
  }

  /**
   * Terminate the process.
   */
  terminate(): boolean {
    return this.process.kill("SIGTERM")
  }

  /**
   * Kill the process.
   */
  kill(): boolean {
    return this.process.kill("SIGKILL")
  }

  /* v8 ignore stop */

  /**
   * The process ID.
   */
  get pid(): number | undefined {
    return this.process.pid
  }

  /**
   * The exit code (or null if still running).
   */
  get returncode(): number | null {
    return this._returncode
  }

  /**
   * The captured stdout.
   */
  get stdout(): string | null {
    return this._stdout
  }

  /**
   * The captured stderr.
   */
  get stderr(): string | null {
    return this._stderr
  }
}
