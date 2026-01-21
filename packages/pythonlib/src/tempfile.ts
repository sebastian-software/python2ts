/**
 * Python tempfile module for TypeScript
 *
 * Provides functions for creating temporary files and directories.
 *
 * @see {@link https://docs.python.org/3/library/tempfile.html | Python tempfile documentation}
 * @module
 */

import * as fs from "node:fs"
import * as nodePath from "node:path"
import * as os from "node:os"
import * as crypto from "node:crypto"

/**
 * Return the default directory for temporary files.
 *
 * @returns The temporary directory path
 */
export function gettempdir(): string {
  return os.tmpdir()
}

/**
 * Generate a unique temporary file path (but don't create the file).
 *
 * Note: This is deprecated in Python but still useful in some cases.
 * Consider using mkstemp() or NamedTemporaryFile() instead.
 *
 * @param suffix - Optional suffix for the filename
 * @param prefix - Optional prefix for the filename (default: "tmp")
 * @param dir - Optional directory (default: system temp dir)
 * @returns Path to the temporary file
 */
export function mktemp(suffix = "", prefix = "tmp", dir?: string): string {
  const tempDir = dir ?? gettempdir()
  const randomPart = crypto.randomBytes(8).toString("hex")
  return nodePath.join(tempDir, `${prefix}${randomPart}${suffix}`)
}

/**
 * Create a temporary file and return a tuple of (fd, path).
 *
 * @param suffix - Optional suffix for the filename
 * @param prefix - Optional prefix for the filename (default: "tmp")
 * @param dir - Optional directory (default: system temp dir)
 * @param text - If true, open in text mode (default: false)
 * @returns Tuple of [file descriptor, path]
 */
export function mkstemp(
  suffix = "",
  prefix = "tmp",
  dir?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _text = false
): [number, string] {
  const tempDir = dir ?? gettempdir()
  const randomPart = crypto.randomBytes(8).toString("hex")
  const path = nodePath.join(tempDir, `${prefix}${randomPart}${suffix}`)

  const fd = fs.openSync(path, "w+", 0o600)
  return [fd, path]
}

/**
 * Create a temporary directory and return its path.
 *
 * @param suffix - Optional suffix for the directory name
 * @param prefix - Optional prefix for the directory name (default: "tmp")
 * @param dir - Optional parent directory (default: system temp dir)
 * @returns Path to the created directory
 */
export function mkdtemp(suffix = "", prefix = "tmp", dir?: string): string {
  const tempDir = dir ?? gettempdir()
  const randomPart = crypto.randomBytes(8).toString("hex")
  const path = nodePath.join(tempDir, `${prefix}${randomPart}${suffix}`)

  fs.mkdirSync(path, { mode: 0o700 })
  return path
}

/**
 * A named temporary file.
 */
export class NamedTemporaryFile {
  /** The file descriptor */
  readonly fd: number
  /** The file path */
  readonly name: string
  /** Whether to delete the file on close */
  readonly deleteOnClose: boolean

  private _closed = false

  constructor(options?: {
    suffix?: string
    prefix?: string
    dir?: string
    delete?: boolean
    mode?: string
  }) {
    const suffix = options?.suffix ?? ""
    const prefix = options?.prefix ?? "tmp"
    const dir = options?.dir
    this.deleteOnClose = options?.delete ?? true

    const [fd, path] = mkstemp(suffix, prefix, dir)
    this.fd = fd
    this.name = path
  }

  /**
   * Write data to the file.
   */
  write(data: string | Uint8Array): number {
    return fs.writeSync(this.fd, data)
  }

  /**
   * Read data from the file.
   */
  read(size?: number): Buffer {
    const buffer = Buffer.alloc(size ?? fs.fstatSync(this.fd).size)
    fs.readSync(this.fd, buffer, 0, buffer.length, 0)
    return buffer
  }

  /**
   * Seek to a position in the file.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  seek(_offset: number, _whence = 0): void {
    // Node.js doesn't have a direct seek, we track position manually
    // For simplicity, this is a no-op
  }

  /**
   * Flush the file buffer.
   */
  flush(): void {
    fs.fsyncSync(this.fd)
  }

  /**
   * Close the file.
   */
  close(): void {
    if (!this._closed) {
      fs.closeSync(this.fd)
      if (this.deleteOnClose) {
        try {
          fs.unlinkSync(this.name)
        } catch {
          // Ignore errors on cleanup
        }
      }
      this._closed = true
    }
  }

  /**
   * Check if the file is closed.
   */
  get closed(): boolean {
    return this._closed
  }
}

/**
 * A temporary directory that cleans itself up.
 */
export class TemporaryDirectory {
  /** The directory path */
  readonly name: string

  private _cleaned = false

  constructor(options?: { suffix?: string; prefix?: string; dir?: string }) {
    this.name = mkdtemp(options?.suffix, options?.prefix, options?.dir)
  }

  /**
   * Remove the temporary directory and its contents.
   */
  cleanup(): void {
    if (!this._cleaned) {
      try {
        fs.rmSync(this.name, { recursive: true, force: true })
      } catch {
        // Ignore errors on cleanup
      }
      this._cleaned = true
    }
  }
}

/**
 * Create a temporary file that is automatically deleted when closed.
 *
 * @param options - Options for creating the file
 * @returns A NamedTemporaryFile object
 */
export function namedTemporaryFile(options?: {
  suffix?: string
  prefix?: string
  dir?: string
  delete?: boolean
  mode?: string
}): NamedTemporaryFile {
  return new NamedTemporaryFile(options)
}

/**
 * Create a temporary directory that is automatically cleaned up.
 *
 * @param options - Options for creating the directory
 * @returns A TemporaryDirectory object
 */
export function temporaryDirectory(options?: {
  suffix?: string
  prefix?: string
  dir?: string
}): TemporaryDirectory {
  return new TemporaryDirectory(options)
}

/**
 * Return the name of the file used to store temporary file names.
 * This is platform-specific and may not exist on all systems.
 */
export function gettempprefix(): string {
  return "tmp"
}
