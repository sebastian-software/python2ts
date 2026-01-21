/**
 * Python tempfile module for TypeScript
 *
 * Provides async functions for creating temporary files and directories.
 * All filesystem operations use the async fs/promises API.
 *
 * @see {@link https://docs.python.org/3/library/tempfile.html | Python tempfile documentation}
 * @module
 */

import type { FileHandle } from "node:fs/promises"
import { mkdir, open, rm, unlink } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { randomBytes } from "node:crypto"

/**
 * Return the default directory for temporary files.
 *
 * @returns The temporary directory path
 */
export function gettempdir(): string {
  return tmpdir()
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
  const randomPart = randomBytes(8).toString("hex")
  return join(tempDir, `${prefix}${randomPart}${suffix}`)
}

/**
 * Create a temporary file and return a tuple of (handle, path).
 *
 * @param suffix - Optional suffix for the filename
 * @param prefix - Optional prefix for the filename (default: "tmp")
 * @param dir - Optional directory (default: system temp dir)
 * @param text - If true, open in text mode (default: false)
 * @returns Promise of tuple [FileHandle, path]
 *
 * @example
 * ```typescript
 * const [handle, path] = await mkstemp(".txt", "myapp-")
 * await handle.write(Buffer.from("data"))
 * await handle.close()
 * ```
 */
export async function mkstemp(
  suffix = "",
  prefix = "tmp",
  dir?: string,

  _text = false
): Promise<[FileHandle, string]> {
  const tempDir = dir ?? gettempdir()
  const randomPart = randomBytes(8).toString("hex")
  const path = join(tempDir, `${prefix}${randomPart}${suffix}`)

  const handle = await open(path, "w+", 0o600)
  return [handle, path]
}

/**
 * Create a temporary directory and return its path.
 *
 * @param suffix - Optional suffix for the directory name
 * @param prefix - Optional prefix for the directory name (default: "tmp")
 * @param dir - Optional parent directory (default: system temp dir)
 * @returns Promise of path to the created directory
 *
 * @example
 * ```typescript
 * const dir = await mkdtemp("", "myapp-")
 * // Use directory...
 * await rm(dir, { recursive: true })
 * ```
 */
export async function mkdtemp(suffix = "", prefix = "tmp", dir?: string): Promise<string> {
  const tempDir = dir ?? gettempdir()
  const randomPart = randomBytes(8).toString("hex")
  const path = join(tempDir, `${prefix}${randomPart}${suffix}`)

  await mkdir(path, { mode: 0o700 })
  return path
}

/**
 * A named temporary file with async operations.
 *
 * Use the static `create()` method to instantiate (constructors cannot be async).
 *
 * @example
 * ```typescript
 * const tmp = await NamedTemporaryFile.create({ suffix: ".txt" })
 * await tmp.write("hello world")
 * await tmp.close() // File is deleted if deleteOnClose is true
 * ```
 */
export class NamedTemporaryFile {
  /** The file handle */
  readonly handle: FileHandle
  /** The file path */
  readonly name: string
  /** Whether to delete the file on close */
  readonly deleteOnClose: boolean

  private _closed = false

  private constructor(handle: FileHandle, name: string, deleteOnClose: boolean) {
    this.handle = handle
    this.name = name
    this.deleteOnClose = deleteOnClose
  }

  /**
   * Create a new NamedTemporaryFile.
   */
  static async create(options?: {
    suffix?: string
    prefix?: string
    dir?: string
    delete?: boolean
    mode?: string
  }): Promise<NamedTemporaryFile> {
    const suffix = options?.suffix ?? ""
    const prefix = options?.prefix ?? "tmp"
    const dir = options?.dir
    const deleteOnClose = options?.delete ?? true

    const [handle, path] = await mkstemp(suffix, prefix, dir)
    return new NamedTemporaryFile(handle, path, deleteOnClose)
  }

  /**
   * Write data to the file.
   */
  async write(data: string | Uint8Array): Promise<number> {
    const result = await this.handle.write(typeof data === "string" ? Buffer.from(data) : data)
    return result.bytesWritten
  }

  /**
   * Read data from the file.
   */
  async read(size?: number): Promise<Buffer> {
    const fileSize = size ?? (await this.handle.stat()).size
    const buffer = Buffer.alloc(fileSize)
    await this.handle.read(buffer, 0, buffer.length, 0)
    return buffer
  }

  /**
   * Seek to a position in the file.
   */

  seek(_offset: number, _whence = 0): void {
    // Node.js doesn't have a direct seek, we track position manually
    // For simplicity, this is a no-op
  }

  /**
   * Flush the file buffer.
   */
  async flush(): Promise<void> {
    await this.handle.sync()
  }

  /**
   * Close the file.
   */
  async close(): Promise<void> {
    if (!this._closed) {
      await this.handle.close()
      if (this.deleteOnClose) {
        try {
          await unlink(this.name)
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
 *
 * Use the static `create()` method to instantiate (constructors cannot be async).
 *
 * @example
 * ```typescript
 * const tmp = await TemporaryDirectory.create({ prefix: "myapp-" })
 * // Use tmp.name as directory path...
 * await tmp.cleanup() // Removes directory and contents
 * ```
 */
export class TemporaryDirectory {
  /** The directory path */
  readonly name: string

  private _cleaned = false

  private constructor(name: string) {
    this.name = name
  }

  /**
   * Create a new TemporaryDirectory.
   */
  static async create(options?: {
    suffix?: string
    prefix?: string
    dir?: string
  }): Promise<TemporaryDirectory> {
    const name = await mkdtemp(options?.suffix, options?.prefix, options?.dir)
    return new TemporaryDirectory(name)
  }

  /**
   * Remove the temporary directory and its contents.
   */
  async cleanup(): Promise<void> {
    if (!this._cleaned) {
      try {
        await rm(this.name, { recursive: true, force: true })
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
 * @returns Promise of NamedTemporaryFile object
 */
export async function namedTemporaryFile(options?: {
  suffix?: string
  prefix?: string
  dir?: string
  delete?: boolean
  mode?: string
}): Promise<NamedTemporaryFile> {
  return NamedTemporaryFile.create(options)
}

/**
 * Create a temporary directory that is automatically cleaned up.
 *
 * @param options - Options for creating the directory
 * @returns Promise of TemporaryDirectory object
 */
export async function temporaryDirectory(options?: {
  suffix?: string
  prefix?: string
  dir?: string
}): Promise<TemporaryDirectory> {
  return TemporaryDirectory.create(options)
}

/**
 * Return the name of the file used to store temporary file names.
 * This is platform-specific and may not exist on all systems.
 */
export function gettempprefix(): string {
  return "tmp"
}
