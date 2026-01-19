/**
 * Python json module for TypeScript
 *
 * Provides JSON encoding and decoding functions matching Python's json module.
 * Maps directly to JavaScript's JSON object with Python-compatible options.
 *
 * @see {@link https://docs.python.org/3/library/json.html | Python json documentation}
 */

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
type JsonReplacer = (key: string, value: unknown) => unknown
type JsonReviver = (key: string, value: unknown) => unknown

interface DumpsOptions {
  /** If specified, use this many spaces for indentation */
  indent?: number
  /** Separators for items and key-value pairs [item_sep, key_sep] */
  separators?: [string, string]
  /** Sort dictionary keys */
  sortKeys?: boolean
  /** If false, non-ASCII characters are escaped. Default true */
  ensureAscii?: boolean
  /** Custom serialization function */
  default?: (obj: unknown) => JsonValue
}

interface LoadsOptions {
  /** Custom deserialization function */
  objectHook?: (obj: Record<string, unknown>) => unknown
  /** Parse floats with this function */
  parseFloatFn?: (s: string) => number
  /** Parse integers with this function */
  parseIntFn?: (s: string) => number
}

/**
 * Serialize obj to a JSON formatted string.
 *
 * @param obj - The object to serialize
 * @param options - Serialization options
 * @returns JSON string
 */
export function dumps(obj: unknown, options?: DumpsOptions): string {
  const indent = options?.indent
  const sortKeys = options?.sortKeys ?? false
  const defaultFn = options?.default
  const ensureAscii = options?.ensureAscii ?? true

  const replacer: JsonReplacer | undefined = sortKeys
    ? (_key, value) => {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const sorted: Record<string, unknown> = {}
          for (const k of Object.keys(value as Record<string, unknown>).sort()) {
            sorted[k] = (value as Record<string, unknown>)[k]
          }
          return sorted
        }
        return value
      }
    : undefined

  let result: string

  try {
    if (defaultFn) {
      // Custom serialization with default function
      result = JSON.stringify(
        obj,
        (key, value: unknown) => {
          const processed: unknown = replacer ? replacer(key, value) : value
          try {
            // Try default serialization first
            JSON.stringify(processed)
            return processed as JsonValue
          } catch {
            // If it fails, use the default function
            return defaultFn(processed)
          }
        },
        indent
      )
    } else {
      result = JSON.stringify(obj, replacer, indent)
    }
  } catch (e) {
    const error = e as Error
    throw new Error(`Object of type ${typeof obj} is not JSON serializable: ${error.message}`)
  }

  // Handle separators if specified
  if (options?.separators) {
    const [itemSep, keySep] = options.separators
    // This is a simplified implementation - full separator support would require custom serialization
    if (itemSep !== ", " || keySep !== ": ") {
      result = result.replace(/,\s*/g, itemSep).replace(/:\s*/g, keySep)
    }
  }

  // Handle ensureAscii
  if (ensureAscii) {
    result = result.replace(/[\u007f-\uffff]/g, (char) => {
      return "\\u" + ("0000" + char.charCodeAt(0).toString(16)).slice(-4)
    })
  }

  return result
}

/**
 * Deserialize a JSON string to a Python object.
 *
 * @param s - JSON string to parse
 * @param options - Deserialization options
 * @returns Parsed object
 */
export function loads(s: string, options?: LoadsOptions): unknown {
  const objectHook = options?.objectHook
  const parseFloat = options?.parseFloatFn
  const parseInt = options?.parseIntFn

  let reviver: JsonReviver | undefined

  if (objectHook || parseFloat || parseInt) {
    reviver = (key, value) => {
      if (typeof value === "number") {
        const str = String(value)
        if (str.includes(".") || str.includes("e") || str.includes("E")) {
          return parseFloat ? parseFloat(str) : value
        }
        return parseInt ? parseInt(str) : value
      }
      if (objectHook && value && typeof value === "object" && !Array.isArray(value) && key === "") {
        return objectHook(value as Record<string, unknown>)
      }
      return value
    }
  }

  try {
    return JSON.parse(s, reviver)
  } catch (e) {
    const error = e as Error
    throw new Error(`JSON decode error: ${error.message}`)
  }
}

/**
 * Serialize obj to a JSON formatted string and write to file.
 * Note: This is a no-op in browser environments.
 *
 * @param obj - The object to serialize
 * @param fp - File-like object with write method
 * @param options - Serialization options
 */
export function dump(
  obj: unknown,
  fp: { write: (s: string) => void },
  options?: DumpsOptions
): void {
  const s = dumps(obj, options)
  fp.write(s)
}

/**
 * Deserialize a JSON string from file to a Python object.
 * Note: This is a no-op in browser environments.
 *
 * @param fp - File-like object with read method
 * @param options - Deserialization options
 * @returns Parsed object
 */
export function load(fp: { read: () => string }, options?: LoadsOptions): unknown {
  const s = fp.read()
  return loads(s, options)
}
