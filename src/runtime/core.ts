/**
 * Core Python operations for TypeScript
 * Arithmetic operations with Python semantics, slicing, etc.
 */

// ============================================================
// Arithmetic Operations (Python semantics)
// ============================================================

/**
 * Floor division (Python //)
 * Always rounds towards negative infinity, unlike Math.floor for negatives
 */
export function floordiv(a: number, b: number): number {
  return Math.floor(a / b)
}

/**
 * Power operator (Python **)
 */
export function pow(base: number, exp: number): number {
  return Math.pow(base, exp)
}

/**
 * Modulo (Python %)
 * Python's % always returns a result with the same sign as the divisor
 */
export function mod(a: number, b: number): number {
  return ((a % b) + b) % b
}

/**
 * Python divmod()
 */
export function divmod(a: number, b: number): [number, number] {
  return [floordiv(a, b), mod(a, b)]
}

// ============================================================
// String Formatting
// ============================================================

/**
 * Python %-style string formatting
 * Handles %s, %d, %i, %f, %r, %x, %o, etc.
 */
export function sprintf(template: string, args: unknown): string {
  const values = Array.isArray(args) ? args : [args]
  let index = 0
  return template.replace(
    /%([+-]?\d*\.?\d*)([sdifxXorec%])/g,
    (match: string, flags: string, type: string) => {
      if (type === "%") return "%"
      if (index >= values.length) return match
      const value: unknown = values[index++]
      switch (type) {
        case "s":
          return String(value)
        case "d":
        case "i":
          return String(Math.floor(Number(value)))
        case "f":
          if (flags && flags.includes(".")) {
            const precision = parseInt(flags.split(".")[1] ?? "6", 10)
            return Number(value).toFixed(precision)
          }
          return String(Number(value))
        case "x":
          return Math.floor(Number(value)).toString(16)
        case "X":
          return Math.floor(Number(value)).toString(16).toUpperCase()
        case "o":
          return Math.floor(Number(value)).toString(8)
        case "r":
          return JSON.stringify(value)
        case "e":
          return Number(value).toExponential()
        case "c":
          return String.fromCharCode(Number(value))
        default:
          return String(value)
      }
    }
  )
}

/**
 * Python str.format() style string formatting
 * Handles {} positional and {name} named placeholders
 */
export function strFormat(template: string, ...args: unknown[]): string {
  let positionalIndex = 0
  const lastArg = args[args.length - 1]
  const namedParams =
    lastArg && typeof lastArg === "object" && !Array.isArray(lastArg)
      ? (lastArg as Record<string, unknown>)
      : {}

  return template.replace(/\{([^}]*)\}/g, (match, key: string) => {
    if (key === "") {
      if (positionalIndex < args.length) {
        return String(args[positionalIndex++])
      }
      return match
    }

    const numIndex = parseInt(key, 10)
    if (!isNaN(numIndex) && numIndex < args.length) {
      return String(args[numIndex])
    }

    if (key in namedParams) {
      return String(namedParams[key])
    }

    return match
  })
}

// ============================================================
// Slicing
// ============================================================

function normalizeIndex(index: number, length: number, forNegativeStep = false): number {
  if (index < 0) {
    index = length + index
  }

  if (forNegativeStep) {
    return Math.max(-1, Math.min(length - 1, index))
  }

  return Math.max(0, Math.min(length, index))
}

/**
 * Python-style slice operation
 * Supports negative indices and step
 */
export function slice<T>(
  obj: string | T[],
  start?: number,
  stop?: number,
  step?: number
): string | T[] {
  const len = obj.length
  const actualStep = step ?? 1

  if (actualStep === 0) {
    throw new Error("slice step cannot be zero")
  }

  let actualStart: number
  let actualStop: number

  if (actualStep > 0) {
    actualStart = start === undefined ? 0 : normalizeIndex(start, len)
    actualStop = stop === undefined ? len : normalizeIndex(stop, len)
  } else {
    actualStart = start === undefined ? len - 1 : normalizeIndex(start, len, true)
    actualStop = stop === undefined ? -1 : normalizeIndex(stop, len, true)
  }

  const result: T[] = []

  if (actualStep > 0) {
    for (let i = actualStart; i < actualStop; i += actualStep) {
      if (i >= 0 && i < len) {
        result.push((obj as T[])[i] as T)
      }
    }
  } else {
    for (let i = actualStart; i > actualStop; i += actualStep) {
      if (i >= 0 && i < len) {
        result.push((obj as T[])[i] as T)
      }
    }
  }

  if (typeof obj === "string") {
    return result.join("")
  }

  return result
}

/**
 * Python-style index access with support for negative indices
 */
export function at<T>(obj: string | T[], index: number): T | string {
  const len = obj.length
  const normalizedIndex = index < 0 ? len + index : index
  if (normalizedIndex < 0 || normalizedIndex >= len) {
    throw new Error("IndexError: list index out of range")
  }
  return (obj as T[])[normalizedIndex] as T
}

/**
 * Python-style string/array repetition
 */
export function repeat<T>(obj: string | T[], count: number): string | T[] {
  if (count <= 0) {
    return typeof obj === "string" ? "" : []
  }
  if (typeof obj === "string") {
    return obj.repeat(count)
  }
  const result: T[] = []
  for (let i = 0; i < count; i++) {
    result.push(...obj)
  }
  return result
}

// ============================================================
// Membership & Identity
// ============================================================

/**
 * Python 'in' operator
 */
export function contains<T>(
  item: T,
  container: Iterable<T> | string | Map<T, unknown> | Set<T>
): boolean {
  if (typeof container === "string") {
    return container.includes(item as unknown as string)
  }
  if (container instanceof Map) {
    return container.has(item)
  }
  if (container instanceof Set) {
    return container.has(item)
  }
  if (Array.isArray(container)) {
    return container.includes(item)
  }
  for (const element of container) {
    if (element === item) {
      return true
    }
  }
  return false
}

/**
 * Python 'is' operator (identity comparison)
 */
export function is(a: unknown, b: unknown): boolean {
  return a === b
}
