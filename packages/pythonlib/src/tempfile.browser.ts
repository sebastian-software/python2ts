/**
 * Python tempfile module for TypeScript - Browser version
 *
 * Browser stub - temporary file operations are not available.
 *
 * @see {@link https://docs.python.org/3/library/tempfile.html | Python tempfile documentation}
 * @module
 */

/* v8 ignore start -- browser stubs @preserve */
/* eslint-disable @typescript-eslint/require-await */

/**
 * Return the name of the directory used for temporary files.
 */
export function getTempDir(): string {
  return "/tmp"
}

/**
 * Return the default prefix for temporary names.
 */
export function getPrefix(): string {
  return "tmp"
}

/**
 * Generate a unique temporary file path (does not create the file).
 * Browser stub - returns a path that would be used in Node.js.
 */
export function mktemp(suffix = "", prefix = "tmp", dir?: string): string {
  const tempDir = dir ?? getTempDir()
  const randomPart = Math.random().toString(36).slice(2, 10)
  return `${tempDir}/${prefix}${randomPart}${suffix}`
}

/**
 * Create a temporary file and return [handle, path].
 * Browser stub - throws error.
 */
export async function mkstemp(
  _suffix = "",
  _prefix = "tmp",
  _dir?: string
): Promise<[unknown, string]> {
  throw new Error("mkstemp is not supported in browser environment")
}

/**
 * Create a temporary directory and return its path.
 * Browser stub - throws error.
 */
export async function mkdtemp(_suffix = "", _prefix = "tmp", _dir?: string): Promise<string> {
  throw new Error("mkdtemp is not supported in browser environment")
}

/**
 * Named temporary file - Browser stub.
 */
export class NamedTemporaryFile {
  readonly name: string = ""
  readonly deleteOnClose: boolean = true

  private constructor() {
    throw new Error("NamedTemporaryFile is not supported in browser environment")
  }

  static async create(_options?: {
    mode?: string
    suffix?: string
    prefix?: string
    dir?: string
    delete?: boolean
  }): Promise<NamedTemporaryFile> {
    throw new Error("NamedTemporaryFile is not supported in browser environment")
  }

  async write(_data: string | Uint8Array): Promise<number> {
    throw new Error("Not supported in browser")
  }

  async read(_size?: number): Promise<Uint8Array> {
    throw new Error("Not supported in browser")
  }

  async flush(): Promise<void> {
    throw new Error("Not supported in browser")
  }

  async close(): Promise<void> {
    throw new Error("Not supported in browser")
  }
}

/**
 * Temporary directory - Browser stub.
 */
export class TemporaryDirectory {
  readonly name: string = ""

  private constructor() {
    throw new Error("TemporaryDirectory is not supported in browser environment")
  }

  static async create(_options?: {
    suffix?: string
    prefix?: string
    dir?: string
  }): Promise<TemporaryDirectory> {
    throw new Error("TemporaryDirectory is not supported in browser environment")
  }

  async cleanup(): Promise<void> {
    throw new Error("Not supported in browser")
  }
}

/* v8 ignore stop */
