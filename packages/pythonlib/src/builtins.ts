/**
 * Python built-in functions for TypeScript
 *
 * Provides core Python built-in functions like len, range, enumerate, sorted, min, max, etc.
 *
 * @see {@link https://docs.python.org/3/library/functions.html | Python built-in functions documentation}
 */

// ============================================================
// Iterables
// ============================================================

/**
 * Python range() function
 */
export function range(startOrStop: number, stop?: number, step?: number): Iterable<number> {
  let start: number
  let end: number
  let stepVal: number

  if (stop === undefined) {
    start = 0
    end = startOrStop
    stepVal = 1
  } else {
    start = startOrStop
    end = stop
    stepVal = step ?? 1
  }

  if (stepVal === 0) {
    throw new Error("range() arg 3 must not be zero")
  }

  return {
    *[Symbol.iterator]() {
      if (stepVal > 0) {
        for (let i = start; i < end; i += stepVal) {
          yield i
        }
      } else {
        for (let i = start; i > end; i += stepVal) {
          yield i
        }
      }
    }
  }
}

/**
 * Python enumerate() function
 */
export function enumerate<T>(iterable: Iterable<T>, start = 0): Iterable<[number, T]> {
  return {
    *[Symbol.iterator]() {
      let index = start
      for (const item of iterable) {
        yield [index++, item] as [number, T]
      }
    }
  }
}

/**
 * Python zip() function
 */
export function zip<T extends unknown[][]>(
  ...iterables: { [K in keyof T]: Iterable<T[K]> }
): Iterable<T> {
  return {
    *[Symbol.iterator]() {
      const iterators = iterables.map((it) => (it as Iterable<unknown>)[Symbol.iterator]())

      for (;;) {
        const results = iterators.map((it) => it.next())

        if (results.some((r) => r.done)) {
          break
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        yield results.map((r) => r.value) as T
      }
    }
  }
}

/**
 * Safe iteration helper for for-in loops
 */
export function iter<T>(
  obj: Iterable<T> | Record<string, unknown> | null | undefined
): Iterable<T> | string[] {
  if (obj === null || obj === undefined) {
    return []
  }
  if (typeof (obj as Iterable<T>)[Symbol.iterator] === "function") {
    return obj as Iterable<T>
  }
  if (typeof obj === "object") {
    return Object.keys(obj)
  }
  return []
}

/**
 * Python reversed() function
 */
export function reversed<T>(iterable: Iterable<T>): Iterable<T> {
  const arr = Array.from(iterable)
  return {
    *[Symbol.iterator]() {
      for (let i = arr.length - 1; i >= 0; i--) {
        yield arr[i] as T
      }
    }
  }
}

/**
 * Python sorted() function
 */
export function sorted<T>(
  iterable: Iterable<T>,
  options?: { key?: (x: T) => unknown; reverse?: boolean }
): T[] {
  const arr = Array.from(iterable)
  const key = options?.key ?? ((x: T) => x)
  const reverse = options?.reverse ?? false

  arr.sort((a, b) => {
    const aKey = key(a)
    const bKey = key(b)

    let cmp: number
    if (typeof aKey === "string" && typeof bKey === "string") {
      cmp = aKey.localeCompare(bKey)
    } else {
      cmp = (aKey as number) - (bKey as number)
    }

    return reverse ? -cmp : cmp
  })

  return arr
}

/**
 * Python map() function
 */
export function map<T, U>(fn: (x: T) => U, iterable: Iterable<T>): Iterable<U> {
  return {
    *[Symbol.iterator]() {
      for (const item of iterable) {
        yield fn(item)
      }
    }
  }
}

/**
 * Python filter() function
 */
export function filter<T>(fn: ((x: T) => boolean) | null, iterable: Iterable<T>): Iterable<T> {
  return {
    *[Symbol.iterator]() {
      for (const item of iterable) {
        if (fn === null ? bool(item) : fn(item)) {
          yield item
        }
      }
    }
  }
}

// ============================================================
// Collections Constructors
// ============================================================

/**
 * Convert to list (array)
 */
export function list<T>(iterable?: Iterable<T>): T[] {
  if (iterable === undefined) {
    return []
  }
  return Array.from(iterable)
}

/**
 * Create a Map (Python dict)
 */
export function dict<K, V>(entries?: Iterable<[K, V]>): Map<K, V> {
  return new Map(entries)
}

/**
 * Create a Set
 */
export function set<T>(iterable?: Iterable<T>): Set<T> {
  return new Set(iterable)
}

/**
 * Create a tuple (readonly array)
 */
export function tuple<T extends unknown[]>(...items: T): Readonly<T> {
  return Object.freeze([...items]) as Readonly<T>
}

// ============================================================
// Built-in Functions
// ============================================================

/**
 * Python len() function
 */
export function len(
  obj: string | unknown[] | Map<unknown, unknown> | Set<unknown> | { length: number }
): number {
  if (typeof obj === "string" || Array.isArray(obj)) {
    return obj.length
  }
  if (obj instanceof Map || obj instanceof Set) {
    return obj.size
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof obj === "object" && obj !== null && "length" in obj) {
    return obj.length
  }
  throw new TypeError("object has no len()")
}

/**
 * Python abs() function
 */
export function abs(x: number): number {
  return Math.abs(x)
}

/**
 * Python min() function
 */
export function min<T>(...args: T[] | [Iterable<T>]): T {
  const first = args[0]
  if (
    args.length === 1 &&
    typeof first === "object" &&
    first !== null &&
    Symbol.iterator in first
  ) {
    const arr = [...first]
    if (arr.length === 0) {
      throw new Error("min() arg is an empty sequence")
    }
    return arr.reduce((a, b) => (a < b ? a : b))
  }

  if (args.length === 0) {
    throw new Error("min expected at least 1 argument, got 0")
  }

  return (args as T[]).reduce((a, b) => (a < b ? a : b))
}

/**
 * Python max() function
 */
export function max<T>(...args: T[] | [Iterable<T>]): T {
  const first = args[0]
  if (
    args.length === 1 &&
    typeof first === "object" &&
    first !== null &&
    Symbol.iterator in first
  ) {
    const arr = [...first]
    if (arr.length === 0) {
      throw new Error("max() arg is an empty sequence")
    }
    return arr.reduce((a, b) => (a > b ? a : b))
  }

  if (args.length === 0) {
    throw new Error("max expected at least 1 argument, got 0")
  }

  return (args as T[]).reduce((a, b) => (a > b ? a : b))
}

/**
 * Python sum() function
 */
export function sum(iterable: Iterable<number>, start = 0): number {
  let total = start
  for (const item of iterable) {
    total += item
  }
  return total
}

/**
 * Python all() function
 */
export function all(iterable: Iterable<unknown>): boolean {
  for (const item of iterable) {
    if (!bool(item)) return false
  }
  return true
}

/**
 * Python any() function
 */
export function any(iterable: Iterable<unknown>): boolean {
  for (const item of iterable) {
    if (bool(item)) return true
  }
  return false
}

/**
 * Python round() function
 */
export function round(number: number, ndigits?: number): number {
  if (ndigits === undefined || ndigits === 0) {
    const rounded = Math.round(number)
    if (Math.abs(number % 1) === 0.5) {
      return rounded % 2 === 0 ? rounded : rounded - Math.sign(number)
    }
    return rounded
  }

  const factor = Math.pow(10, ndigits)
  return Math.round(number * factor) / factor
}

/**
 * Python ord()
 */
export function ord(char: string): number {
  if (char.length !== 1) {
    throw new Error("ord() expected a character")
  }
  return char.charCodeAt(0)
}

/**
 * Python chr()
 */
export function chr(code: number): string {
  return String.fromCharCode(code)
}

/**
 * Python hex()
 */
export function hex(x: number): string {
  const prefix = x < 0 ? "-0x" : "0x"
  return prefix + Math.abs(Math.trunc(x)).toString(16)
}

/**
 * Python oct()
 */
export function oct(x: number): string {
  const prefix = x < 0 ? "-0o" : "0o"
  return prefix + Math.abs(Math.trunc(x)).toString(8)
}

/**
 * Python bin()
 */
export function bin(x: number): string {
  const prefix = x < 0 ? "-0b" : "0b"
  return prefix + Math.abs(Math.trunc(x)).toString(2)
}

// ============================================================
// Type Conversions
// ============================================================

/**
 * Python int() function
 */
export function int(x: string | number | boolean, base?: number): number {
  if (typeof x === "boolean") {
    return x ? 1 : 0
  }
  if (typeof x === "number") {
    return Math.trunc(x)
  }
  const parsed = base !== undefined ? parseInt(x, base) : parseInt(x, 10)
  if (isNaN(parsed)) {
    throw new Error(`invalid literal for int(): '${x}'`)
  }
  return parsed
}

/**
 * Python float() function
 */
export function float(x: string | number): number {
  if (typeof x === "number") {
    return x
  }
  const parsed = parseFloat(x)
  if (isNaN(parsed)) {
    throw new Error(`could not convert string to float: '${x}'`)
  }
  return parsed
}

/**
 * Python str() function
 */
export function str(x: unknown): string {
  if (x === null) {
    return "None"
  }
  if (x === undefined) {
    return "None"
  }
  if (typeof x === "boolean") {
    return x ? "True" : "False"
  }
  if (Array.isArray(x)) {
    return "[" + x.map((item) => repr(item)).join(", ") + "]"
  }
  if (x instanceof Map) {
    const entries = Array.from(x.entries())
      .map(([k, v]) => `${repr(k)}: ${repr(v)}`)
      .join(", ")
    return "{" + entries + "}"
  }
  if (x instanceof Set) {
    if (x.size === 0) {
      return "set()"
    }
    return (
      "{" +
      Array.from(x)
        .map((item) => repr(item))
        .join(", ") +
      "}"
    )
  }
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return String(x)
}

/**
 * Python repr() function
 */
export function repr(x: unknown): string {
  if (typeof x === "string") {
    return `'${x}'`
  }
  return str(x)
}

/**
 * Python bool() function
 */
export function bool(x: unknown): boolean {
  if (x === null || x === undefined) {
    return false
  }
  if (typeof x === "boolean") {
    return x
  }
  if (typeof x === "number") {
    return x !== 0
  }
  if (typeof x === "string") {
    return x.length > 0
  }
  if (Array.isArray(x)) {
    return x.length > 0
  }
  if (x instanceof Map || x instanceof Set) {
    return x.size > 0
  }
  return true
}

/**
 * Python ascii() - returns ASCII representation
 */
export function ascii(x: unknown): string {
  const s = repr(x)
  let result = ""
  for (const char of s) {
    const code = char.charCodeAt(0)
    if (code > 127) {
      if (code > 0xffff) {
        result += `\\U${code.toString(16).padStart(8, "0")}`
      } else {
        result += `\\u${code.toString(16).padStart(4, "0")}`
      }
    } else {
      result += char
    }
  }
  return result
}

/**
 * Python isinstance() - simplified version
 */
export function isinstance(obj: unknown, classInfo: unknown): boolean {
  if (classInfo === Number || classInfo === "int" || classInfo === "float") {
    return typeof obj === "number"
  }
  if (classInfo === String || classInfo === "str") {
    return typeof obj === "string"
  }
  if (classInfo === Boolean || classInfo === "bool") {
    return typeof obj === "boolean"
  }
  if (classInfo === Array || classInfo === "list") {
    return Array.isArray(obj)
  }
  if (classInfo === Map || classInfo === "dict") {
    return obj instanceof Map
  }
  if (classInfo === Set || classInfo === "set") {
    return obj instanceof Set
  }
  if (typeof classInfo === "function") {
    return obj instanceof classInfo
  }
  return false
}

/**
 * Python type() - simplified version
 */
export function type(obj: unknown): string {
  if (obj === null) return "NoneType"
  if (typeof obj === "number") {
    return Number.isInteger(obj) ? "int" : "float"
  }
  if (typeof obj === "string") return "str"
  if (typeof obj === "boolean") return "bool"
  if (Array.isArray(obj)) return "list"
  if (obj instanceof Map) return "dict"
  if (obj instanceof Set) return "set"
  return typeof obj
}

/**
 * Python input() - for Node.js
 */
export function input(prompt?: string): string {
  if (prompt) {
    process.stdout.write(prompt)
  }
  throw new Error("input() requires async implementation")
}

// ============================================================
// Format Function
// ============================================================

function formatNumber(
  num: number,
  sign: string | undefined,
  _hash: string | undefined,
  grouping: string | undefined,
  precision?: number,
  isInteger = true
): string {
  let result: string

  if (isInteger) {
    result = Math.trunc(num).toString()
  } else {
    result = num.toFixed(precision ?? 6)
  }

  if (grouping) {
    const sep = grouping === "_" ? "_" : ","
    const parts = result.split(".")
    const intPart = parts[0] as string
    const signChar = intPart[0] === "-" ? "-" : ""
    const digits = signChar ? intPart.slice(1) : intPart
    const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep)
    parts[0] = signChar + grouped
    result = parts.join(".")
  }

  if (num >= 0) {
    if (sign === "+") {
      result = "+" + result
    } else if (sign === " ") {
      result = " " + result
    }
  }

  return result
}

/**
 * Python format() - formats a value according to format spec
 */
export function format(value: unknown, spec: string): string {
  if (spec === "") {
    return str(value)
  }

  const match = spec.match(
    /^(.?[<>=^])?([+\- ])?([#])?(0)?(\d+)?([,_])?(?:\.(\d+))?([bcdeEfFgGnosxX%])?$/
  )

  if (!match) {
    return str(value)
  }

  const [, alignPart, sign, hash, zero, widthStr, grouping, precisionStr, typeChar] = match

  let fill = " "
  let align = ""
  if (alignPart) {
    if (alignPart.length === 2) {
      fill = alignPart[0] as string
      align = alignPart[1] as string
    } else {
      align = alignPart
    }
  }

  const width = widthStr ? parseInt(widthStr, 10) : 0
  const precision = precisionStr !== undefined ? parseInt(precisionStr, 10) : undefined

  if (zero && !alignPart) {
    fill = "0"
    align = "="
  }

  let result: string

  if (typeChar === "s" || (!typeChar && typeof value === "string")) {
    result = str(value)
    if (precision !== undefined) {
      result = result.slice(0, precision)
    }
  } else if (
    typeChar === "d" ||
    (!typeChar && typeof value === "number" && Number.isInteger(value))
  ) {
    const num = typeof value === "number" ? value : int(value as string | number | boolean)
    result = formatNumber(num, sign, "", grouping)
  } else if (typeChar === "f" || typeChar === "F") {
    const num = typeof value === "number" ? value : float(value as string | number)
    const prec = precision ?? 6
    result = formatNumber(num, sign, "", grouping, prec, false)
    if (typeChar === "F") result = result.toUpperCase()
  } else if (typeChar === "e" || typeChar === "E") {
    const num = typeof value === "number" ? value : float(value as string | number)
    const prec = precision ?? 6
    result = num.toExponential(prec)
    if (sign === "+" && num >= 0) result = "+" + result
    else if (sign === " " && num >= 0) result = " " + result
    if (typeChar === "E") result = result.toUpperCase()
  } else if (typeChar === "g" || typeChar === "G") {
    const num = typeof value === "number" ? value : float(value as string | number)
    const prec = precision ?? 6
    result = num.toPrecision(prec)
    if (sign === "+" && num >= 0) result = "+" + result
    else if (sign === " " && num >= 0) result = " " + result
    if (typeChar === "G") result = result.toUpperCase()
  } else if (typeChar === "x" || typeChar === "X") {
    const num =
      typeof value === "number" ? Math.trunc(value) : int(value as string | number | boolean)
    result = Math.abs(num).toString(16)
    if (hash) result = "0x" + result
    if (num < 0) result = "-" + result
    else if (sign === "+") result = "+" + result
    else if (sign === " ") result = " " + result
    if (typeChar === "X") result = result.toUpperCase()
  } else if (typeChar === "o") {
    const num =
      typeof value === "number" ? Math.trunc(value) : int(value as string | number | boolean)
    result = Math.abs(num).toString(8)
    if (hash) result = "0o" + result
    if (num < 0) result = "-" + result
    else if (sign === "+") result = "+" + result
    else if (sign === " ") result = " " + result
  } else if (typeChar === "b") {
    const num =
      typeof value === "number" ? Math.trunc(value) : int(value as string | number | boolean)
    result = Math.abs(num).toString(2)
    if (hash) result = "0b" + result
    if (num < 0) result = "-" + result
    else if (sign === "+") result = "+" + result
    else if (sign === " ") result = " " + result
  } else if (typeChar === "c") {
    const code = typeof value === "number" ? value : int(value as string | number | boolean)
    result = String.fromCharCode(code)
  } else if (typeChar === "%") {
    const num = typeof value === "number" ? value : float(value as string | number)
    const prec = precision ?? 6
    result = (num * 100).toFixed(prec) + "%"
    if (sign === "+" && num >= 0) result = "+" + result
    else if (sign === " " && num >= 0) result = " " + result
  } else if (typeChar === "n") {
    const num = typeof value === "number" ? value : float(value as string | number)
    result = num.toLocaleString()
  } else {
    /* c8 ignore next - fallback for unrecognized format types */
    result = str(value)
  }

  if (width > result.length) {
    const padding = fill.repeat(width - result.length)
    if (align === "<") {
      result = result + padding
    } else if (align === ">" || align === "") {
      result = padding + result
    } else if (align === "^") {
      const leftPad = Math.floor((width - result.length) / 2)
      const rightPad = width - result.length - leftPad
      result = fill.repeat(leftPad) + result + fill.repeat(rightPad)
    } else if (align === "=") {
      const signMatch = result.match(/^([+\- ]|0[xXoObB])?(.*)$/)
      if (signMatch) {
        const signPart = signMatch[1] ?? ""
        const numPart = signMatch[2] ?? ""
        result = signPart + padding + numPart
      }
    }
  }

  return result
}
