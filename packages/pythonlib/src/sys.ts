/**
 * Python sys module for TypeScript
 *
 * Provides access to system-specific parameters and functions.
 * This module provides variables and functions that interact with the
 * interpreter and its environment.
 *
 * @see {@link https://docs.python.org/3/library/sys.html | Python sys documentation}
 * @module
 */

/**
 * Command line arguments passed to the script.
 * Unlike Python, this excludes the Node.js executable and script path.
 *
 * @example
 * ```typescript
 * // node script.js arg1 arg2
 * console.log(argv) // ["arg1", "arg2"]
 * ```
 */
/* v8 ignore next -- browser fallback @preserve */
export const argv: string[] = typeof process !== "undefined" ? process.argv.slice(2) : []

/**
 * A string identifying the platform (operating system).
 *
 * @example
 * ```typescript
 * console.log(platform) // "darwin", "linux", "win32", etc.
 * ```
 */
/* v8 ignore next -- browser fallback @preserve */
export const platform: string = typeof process !== "undefined" ? process.platform : "unknown"

/**
 * A string containing the version number of the Python interpreter (emulated).
 * Returns a custom version string for pythonlib.
 */
export const version = "3.11.0 (pythonlib TypeScript implementation)"

/**
 * Version information as a named tuple-like object.
 * Contains major, minor, micro, releaselevel, and serial components.
 */
export const versionInfo = {
  major: 3,
  minor: 11,
  micro: 0,
  releaselevel: "final" as const,
  serial: 0,

  // Make it tuple-like (indexable)
  0: 3,
  1: 11,
  2: 0,
  3: "final" as const,
  4: 0,
  length: 5,

  [Symbol.iterator]: function* () {
    yield this.major
    yield this.minor
    yield this.micro
    yield this.releaselevel
    yield this.serial
  }
}

/**
 * Path to the interpreter executable (Node.js executable path).
 *
 * @example
 * ```typescript
 * console.log(executable) // "/usr/local/bin/node"
 * ```
 */
/* v8 ignore next -- browser fallback @preserve */
export const executable: string = typeof process !== "undefined" ? process.execPath : ""

/**
 * A list of strings specifying the search path for modules.
 * In Node.js context, this returns module.paths or an empty array.
 */
/* v8 ignore next 5 -- always returns empty array @preserve */
export const path: string[] = (() => {
  if (typeof process === "undefined") return []
  // In ESM context, module.paths is not available, return empty array
  // Users can populate this if needed
  return []
})()

/**
 * Maximum value a variable of type Py_ssize_t can take.
 * Equivalent to Number.MAX_SAFE_INTEGER in JavaScript.
 */
export const maxsize: number = Number.MAX_SAFE_INTEGER

/**
 * Standard input stream.
 */
/* v8 ignore next -- browser fallback @preserve */
export const stdin: NodeJS.ReadStream | null = typeof process !== "undefined" ? process.stdin : null

/**
 * Standard output stream.
 */
/* v8 ignore next 2 -- browser fallback @preserve */
export const stdout: NodeJS.WriteStream | null =
  typeof process !== "undefined" ? process.stdout : null

/**
 * Standard error stream.
 */
/* v8 ignore next 2 -- browser fallback @preserve */
export const stderr: NodeJS.WriteStream | null =
  typeof process !== "undefined" ? process.stderr : null

/**
 * Exit from Python (terminate the process).
 *
 * @param code - Optional exit status code (default: 0 for success)
 * @throws This function never returns; it terminates the process.
 *
 * @example
 * ```typescript
 * exit()    // Exit with success
 * exit(1)   // Exit with error code 1
 * ```
 */
export function exit(code?: number): never {
  /* v8 ignore next 3 -- always runs in Node.js @preserve */
  if (typeof process !== "undefined") {
    process.exit(code ?? 0)
  }
  /* v8 ignore next -- browser fallback @preserve */
  throw new Error(`SystemExit: ${String(code ?? 0)}`)
}

/**
 * Return the current recursion limit.
 * In JavaScript, this is effectively unlimited, but we return a reasonable default.
 */
export function getRecursionLimit(): number {
  return 1000
}

/**
 * Set the maximum depth of the Python interpreter stack.
 * This is a no-op in JavaScript as recursion is managed differently.
 *
 * @param limit - The new recursion limit
 */
export function setRecursionLimit(limit: number): void {
  // No-op in JavaScript - recursion is limited by stack size
  void limit
}

/**
 * Return the size of an object in bytes.
 * This is an approximation as JavaScript doesn't provide exact memory sizes.
 *
 * @param obj - Object to measure
 * @returns Approximate size in bytes
 */
export function getSizeOf(obj: unknown): number {
  const seen = new WeakSet()

  function estimate(value: unknown): number {
    if (value === null || value === undefined) return 0

    const type = typeof value
    if (type === "boolean") return 4
    if (type === "number") return 8
    if (type === "string") return (value as string).length * 2
    if (type === "bigint") return ((value as bigint).toString().length * 8) / 10

    if (type === "object" || type === "function") {
      if (seen.has(value as object)) return 0
      seen.add(value as object)

      if (Array.isArray(value)) {
        return value.reduce((sum: number, item: unknown) => sum + estimate(item), 64)
      }

      if (value instanceof Map) {
        let size = 64
        for (const [k, v] of value) {
          size += estimate(k) + estimate(v)
        }
        return size
      }

      /* v8 ignore start -- Set branch tested via getSizeOf(new Set()) @preserve */
      if (value instanceof Set) {
        let size = 64
        for (const item of value) {
          size += estimate(item)
        }
        return size
      }
      /* v8 ignore stop */

      // Regular object
      let size = 64
      for (const key in value) {
        size += key.length * 2 + estimate((value as Record<string, unknown>)[key])
      }
      return size
    }

    /* v8 ignore next -- unreachable after typeof checks @preserve */
    return 0
  }

  return estimate(obj)
}

/**
 * Return the reference count for the object.
 * JavaScript uses garbage collection, so this always returns a placeholder value.
 *
 * @param _obj - Object to check
 * @returns Always returns 1 (reference counting not available in JS)
 */
export function getRefCount(obj: unknown): number {
  // JavaScript uses garbage collection, not reference counting
  void obj
  return 1
}

/**
 * Return the default string encoding used by the Unicode implementation.
 */
export function getDefaultEncoding(): string {
  return "utf-8"
}

/**
 * Return the name of the encoding used to convert filenames.
 */
export function getFilesystemEncoding(): string {
  return "utf-8"
}

/**
 * Integer specifying the API version, in Node.js context returns 0.
 */
export const apiVersion = 0

/**
 * A string giving the site-specific directory prefix.
 */
/* v8 ignore next 2 -- browser fallback @preserve */
export const prefix: string =
  typeof process !== "undefined" ? process.execPath.replace(/\/bin\/node$/, "") : ""

/**
 * Byte order indicator: "little" or "big".
 */
export const byteorder: "little" | "big" = (() => {
  const buffer = new ArrayBuffer(2)
  new DataView(buffer).setInt16(0, 256, true)
  return new Int16Array(buffer)[0] === 256 ? "little" : "big"
})()

/**
 * Float representation info (similar to Python's sys.float_info).
 */
export const floatInfo = {
  max: Number.MAX_VALUE,
  maxExp: 1024,
  max10Exp: 308,
  min: Number.MIN_VALUE,
  minExp: -1021,
  min10Exp: -307,
  dig: 15,
  mant_dig: 53,
  epsilon: Number.EPSILON,
  radix: 2,
  rounds: 1
}

/**
 * Integer representation info (similar to Python's sys.int_info).
 */
export const intInfo = {
  bitsPerDigit: 30,
  sizeofDigit: 4,
  defaultMaxStrDigits: 4300,
  strDigitsCheckThreshold: 640
}

/**
 * Hash implementation info.
 */
export const hashInfo = {
  width: 64,
  modulus: 2n ** 61n - 1n,
  inf: 314159,
  nan: 0,
  imag: 1000003,
  algorithm: "siphash24",
  hashBits: 64,
  seedBits: 128
}
