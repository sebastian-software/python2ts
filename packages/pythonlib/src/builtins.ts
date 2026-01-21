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
 * Return a sequence of numbers from start to stop (exclusive) by step.
 *
 * @param startOrStop - If only one argument, this is stop (start defaults to 0). Otherwise, this is start.
 * @param stop - The end value (exclusive)
 * @param step - The increment (default: 1)
 * @returns An iterable of numbers
 * @see {@link https://docs.python.org/3/library/functions.html#func-range | Python range()}
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
 * Return an iterable of tuples containing (index, value) pairs.
 *
 * @param iterable - The sequence to enumerate
 * @param start - The starting index (default: 0)
 * @returns An iterable of [index, value] tuples
 * @see {@link https://docs.python.org/3/library/functions.html#enumerate | Python enumerate()}
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
 * Iterate over multiple iterables in parallel, yielding tuples.
 *
 * Stops when the shortest iterable is exhausted.
 *
 * @param iterables - The iterables to zip together
 * @returns An iterable of tuples containing elements from each input
 * @see {@link https://docs.python.org/3/library/functions.html#zip | Python zip()}
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
 * Return an iterator object for the given iterable.
 *
 * For objects without Symbol.iterator, returns the object's keys.
 *
 * @param obj - The object to iterate over
 * @returns An iterable
 * @see {@link https://docs.python.org/3/library/functions.html#iter | Python iter()}
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
 * Return a reversed iterator over the values of the given sequence.
 *
 * Uses ES2023 Array.prototype.toReversed() for immutable reversal.
 *
 * @param iterable - The sequence to reverse
 * @returns An iterable yielding elements in reverse order
 * @see {@link https://docs.python.org/3/library/functions.html#reversed | Python reversed()}
 */
export function reversed<T>(iterable: Iterable<T>): Iterable<T> {
  // toReversed() already returns a new array, so no need to copy first if already an array
  const arr: T[] = Array.isArray(iterable) ? (iterable as T[]) : Array.from(iterable)
  return arr.toReversed()
}

/**
 * Return a new sorted list from the items in the iterable.
 *
 * Uses ES2023 Array.prototype.toSorted() for immutable sorting.
 *
 * @param iterable - The sequence to sort
 * @param options - Sorting options: key function and/or reverse flag
 * @returns A new sorted array
 * @see {@link https://docs.python.org/3/library/functions.html#sorted | Python sorted()}
 */
export function sorted<T>(
  iterable: Iterable<T>,
  options?: { key?: (x: T) => unknown; reverse?: boolean }
): T[] {
  const key = options?.key ?? ((x: T) => x)
  const reverse = options?.reverse ?? false

  // toSorted() already returns a new array, so no need to copy first if already an array
  const arr: T[] = Array.isArray(iterable) ? (iterable as T[]) : Array.from(iterable)
  return arr.toSorted((a, b) => {
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
}

// ES2024 Iterator Helpers interface (TypeScript doesn't have built-in types yet)
interface IteratorHelpers<T> extends Iterator<T>, Iterable<T> {
  map<U>(fn: (x: T) => U): IteratorHelpers<U>
  filter(fn: (x: T) => boolean): IteratorHelpers<T>
  take(n: number): IteratorHelpers<T>
  drop(n: number): IteratorHelpers<T>
  flatMap<U>(fn: (x: T) => Iterable<U>): IteratorHelpers<U>
  toArray(): T[]
}

/** Get iterator with ES2024 Iterator Helpers */
function getIterator<T>(iterable: Iterable<T>): IteratorHelpers<T> {
  return iterable[Symbol.iterator]() as IteratorHelpers<T>
}

/**
 * Apply a function to every item of the iterable and yield the results.
 *
 * Uses ES2024 Iterator.prototype.map() for lazy evaluation.
 *
 * @param fn - The function to apply to each element
 * @param iterable - The input iterable
 * @returns An iterable of transformed values
 * @see {@link https://docs.python.org/3/library/functions.html#map | Python map()}
 */
export function map<T, U>(fn: (x: T) => U, iterable: Iterable<T>): Iterable<U> {
  return getIterator(iterable).map(fn)
}

/**
 * Return an iterable yielding items where the function returns true.
 *
 * If function is null, return items that are truthy.
 * Uses ES2024 Iterator.prototype.filter() for lazy evaluation.
 *
 * @param fn - The predicate function (or null for truthiness check)
 * @param iterable - The input iterable
 * @returns An iterable of filtered values
 * @see {@link https://docs.python.org/3/library/functions.html#filter | Python filter()}
 */
export function filter<T>(fn: ((x: T) => boolean) | null, iterable: Iterable<T>): Iterable<T> {
  // Python's filter(None, iterable) filters by truthiness
  const predicate = fn ?? ((x: T) => bool(x))
  return getIterator(iterable).filter(predicate)
}

// ============================================================
// Collections Constructors
// ============================================================

/**
 * Convert an iterable to a list (array).
 *
 * @param iterable - The iterable to convert (optional, defaults to empty list)
 * @returns A new array containing the iterable's elements
 * @see {@link https://docs.python.org/3/library/functions.html#func-list | Python list()}
 */
export function list<T>(iterable?: Iterable<T>): T[] {
  if (iterable === undefined) {
    return []
  }
  return Array.from(iterable)
}

/**
 * Create a new dictionary (Map) from key-value pairs.
 *
 * @param entries - Optional iterable of [key, value] pairs
 * @returns A new Map
 * @see {@link https://docs.python.org/3/library/functions.html#func-dict | Python dict()}
 */
export function dict<K, V>(entries?: Iterable<[K, V]>): Map<K, V> {
  return new Map(entries)
}

/**
 * Create a new set from an iterable.
 *
 * @param iterable - Optional iterable of elements
 * @returns A new Set
 * @see {@link https://docs.python.org/3/library/functions.html#func-set | Python set()}
 */
export function set<T>(iterable?: Iterable<T>): Set<T> {
  return new Set(iterable)
}

/**
 * Create an immutable tuple (frozen array).
 *
 * @param items - The elements to include in the tuple
 * @returns A frozen (readonly) array
 * @see {@link https://docs.python.org/3/library/functions.html#func-tuple | Python tuple()}
 */
export function tuple<T extends unknown[]>(...items: T): Readonly<T> {
  return Object.freeze([...items]) as Readonly<T>
}

// ============================================================
// Built-in Functions
// ============================================================

/**
 * Return the number of items in an object.
 *
 * Works with strings, arrays, Maps, Sets, and objects with a length property.
 *
 * @param obj - The object to measure
 * @returns The number of items
 * @see {@link https://docs.python.org/3/library/functions.html#len | Python len()}
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
 * Return the absolute value of a number.
 *
 * @param x - The number
 * @returns The absolute value
 * @see {@link https://docs.python.org/3/library/functions.html#abs | Python abs()}
 */
export function abs(x: number): number {
  return Math.abs(x)
}

/**
 * Return the smallest item in an iterable or the smallest of two or more arguments.
 *
 * @param args - An iterable, or multiple values to compare
 * @returns The minimum value
 * @see {@link https://docs.python.org/3/library/functions.html#min | Python min()}
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
 * Return the largest item in an iterable or the largest of two or more arguments.
 *
 * @param args - An iterable, or multiple values to compare
 * @returns The maximum value
 * @see {@link https://docs.python.org/3/library/functions.html#max | Python max()}
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
 * Return the sum of all items in the iterable plus an optional start value.
 *
 * @param iterable - The numbers to sum
 * @param start - The initial value (default: 0)
 * @returns The sum
 * @see {@link https://docs.python.org/3/library/functions.html#sum | Python sum()}
 */
export function sum(iterable: Iterable<number>, start = 0): number {
  let total = start
  for (const item of iterable) {
    total += item
  }
  return total
}

/**
 * Return True if all elements of the iterable are truthy (or if empty).
 *
 * @param iterable - The elements to test
 * @returns True if all elements are truthy
 * @see {@link https://docs.python.org/3/library/functions.html#all | Python all()}
 */
export function all(iterable: Iterable<unknown>): boolean {
  for (const item of iterable) {
    if (!bool(item)) return false
  }
  return true
}

/**
 * Return True if any element of the iterable is truthy.
 *
 * @param iterable - The elements to test
 * @returns True if any element is truthy
 * @see {@link https://docs.python.org/3/library/functions.html#any | Python any()}
 */
export function any(iterable: Iterable<unknown>): boolean {
  for (const item of iterable) {
    if (bool(item)) return true
  }
  return false
}

/**
 * Round a number to a given precision in decimal digits.
 *
 * Uses banker's rounding (round half to even) for values exactly halfway.
 *
 * @param number - The number to round
 * @param ndigits - Number of decimal places (default: 0)
 * @returns The rounded number
 * @see {@link https://docs.python.org/3/library/functions.html#round | Python round()}
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
 * Return the Unicode code point for a one-character string.
 *
 * @param char - A single character
 * @returns The Unicode code point
 * @see {@link https://docs.python.org/3/library/functions.html#ord | Python ord()}
 */
export function ord(char: string): number {
  if (char.length !== 1) {
    throw new Error("ord() expected a character")
  }
  return char.charCodeAt(0)
}

/**
 * Return the string representing a character at the given Unicode code point.
 *
 * @param code - The Unicode code point
 * @returns A single-character string
 * @see {@link https://docs.python.org/3/library/functions.html#chr | Python chr()}
 */
export function chr(code: number): string {
  return String.fromCharCode(code)
}

/**
 * Convert an integer to a lowercase hexadecimal string prefixed with "0x".
 *
 * @param x - The integer to convert
 * @returns Hexadecimal string (e.g., "0xff")
 * @see {@link https://docs.python.org/3/library/functions.html#hex | Python hex()}
 */
export function hex(x: number): string {
  const prefix = x < 0 ? "-0x" : "0x"
  return prefix + Math.abs(Math.trunc(x)).toString(16)
}

/**
 * Convert an integer to an octal string prefixed with "0o".
 *
 * @param x - The integer to convert
 * @returns Octal string (e.g., "0o17")
 * @see {@link https://docs.python.org/3/library/functions.html#oct | Python oct()}
 */
export function oct(x: number): string {
  const prefix = x < 0 ? "-0o" : "0o"
  return prefix + Math.abs(Math.trunc(x)).toString(8)
}

/**
 * Convert an integer to a binary string prefixed with "0b".
 *
 * @param x - The integer to convert
 * @returns Binary string (e.g., "0b1010")
 * @see {@link https://docs.python.org/3/library/functions.html#bin | Python bin()}
 */
export function bin(x: number): string {
  const prefix = x < 0 ? "-0b" : "0b"
  return prefix + Math.abs(Math.trunc(x)).toString(2)
}

// ============================================================
// Type Conversions
// ============================================================

/**
 * Convert a value to an integer.
 *
 * Truncates floats toward zero. Parses strings in the given base.
 *
 * @param x - The value to convert
 * @param base - The base for string conversion (default: 10)
 * @returns The integer value
 * @see {@link https://docs.python.org/3/library/functions.html#int | Python int()}
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
 * Convert a value to a floating-point number.
 *
 * @param x - The value to convert
 * @returns The float value
 * @see {@link https://docs.python.org/3/library/functions.html#float | Python float()}
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
 * Convert a value to its string representation.
 *
 * Uses Python-style formatting for booleans (True/False), None, and collections.
 *
 * @param x - The value to convert
 * @returns The string representation
 * @see {@link https://docs.python.org/3/library/functions.html#func-str | Python str()}
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
 * Return a string containing a printable representation of an object.
 *
 * Strings are quoted, other types use str() representation.
 *
 * @param x - The value to represent
 * @returns A printable representation
 * @see {@link https://docs.python.org/3/library/functions.html#repr | Python repr()}
 */
export function repr(x: unknown): string {
  if (typeof x === "string") {
    return `'${x}'`
  }
  return str(x)
}

/**
 * Convert a value to a boolean using Python's truthiness rules.
 *
 * False values: null, undefined, false, 0, empty strings, empty arrays, empty Maps/Sets.
 *
 * @param x - The value to convert
 * @returns The boolean value
 * @see {@link https://docs.python.org/3/library/functions.html#bool | Python bool()}
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
 * Return a string containing a printable ASCII representation.
 *
 * Non-ASCII characters are escaped using \\xhh, \\uhhhh, or \\Uhhhhhhhh.
 *
 * @param x - The value to represent
 * @returns ASCII-safe printable representation
 * @see {@link https://docs.python.org/3/library/functions.html#ascii | Python ascii()}
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
 * Return True if the object is an instance of the specified class.
 *
 * Supports JavaScript constructors (Number, String, etc.) and Python type names.
 *
 * @param obj - The object to check
 * @param classInfo - The class or type name to check against
 * @returns True if obj is an instance of classInfo
 * @see {@link https://docs.python.org/3/library/functions.html#isinstance | Python isinstance()}
 */
export function isinstance(obj: unknown, classInfo: unknown): boolean {
  // Handle tuple of types (array)
  if (Array.isArray(classInfo)) {
    return classInfo.some((cls) => isinstance(obj, cls))
  }
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
 * Return the type name of an object as a string.
 *
 * Returns Python-style type names: 'int', 'float', 'str', 'bool', 'list', 'dict', 'set'.
 *
 * @param obj - The object to check
 * @returns The type name
 * @see {@link https://docs.python.org/3/library/functions.html#type | Python type()}
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
 * Read a line of input from the user.
 *
 * Note: This function requires async implementation in JavaScript environments.
 *
 * @param prompt - Optional prompt string to display
 * @returns The input string
 * @see {@link https://docs.python.org/3/library/functions.html#input | Python input()}
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
    const [intPart = ""] = parts
    const signChar = intPart.startsWith("-") ? "-" : ""
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
 * Convert a value to a formatted representation using a format specification.
 *
 * Supports Python format spec mini-language for numbers and strings.
 *
 * @param value - The value to format
 * @param spec - The format specification string
 * @returns The formatted string
 * @see {@link https://docs.python.org/3/library/functions.html#format | Python format()}
 */
export function format(value: unknown, spec: string): string {
  if (spec === "") {
    return str(value)
  }

  const match =
    /^(.?[<>=^])?([+\- ])?([#])?(0)?(\d+)?([,_])?(?:\.(\d+))?([bcdeEfFgGnosxX%])?$/.exec(spec)

  if (!match) {
    return str(value)
  }

  const [, alignPart, sign, hash, zero, widthStr, grouping, precisionStr, typeChar] = match

  let fill = " "
  let align = ""
  if (alignPart) {
    if (alignPart.length === 2) {
      fill = alignPart.charAt(0)
      align = alignPart.charAt(1)
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
    /* v8 ignore next -- fallback for unrecognized format types @preserve */
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
      const signMatch = /^([+\- ]|0[xXoObB])?(.*)$/.exec(result)
      if (signMatch) {
        const signPart = signMatch[1] ?? ""
        const numPart = signMatch[2] ?? ""
        result = signPart + padding + numPart
      }
    }
  }

  return result
}

// ============================================================
// Attribute Access
// ============================================================

/**
 * Python getattr() function - get an attribute from an object
 *
 * @param obj - The object to get the attribute from
 * @param name - The name of the attribute
 * @param defaultValue - Optional default value if attribute doesn't exist
 * @returns The attribute value or default value
 */
export function getattr<T>(obj: unknown, name: string, defaultValue?: T): T | undefined {
  if (obj === null || obj === undefined) {
    if (arguments.length >= 3) {
      return defaultValue
    }
    throw new TypeError(
      `'${obj === null ? "NoneType" : "undefined"}' object has no attribute '${name}'`
    )
  }

  const target = obj as Record<string, unknown>
  if (name in target) {
    return target[name] as T
  }

  if (arguments.length >= 3) {
    return defaultValue
  }

  throw new TypeError(`'${typeof obj}' object has no attribute '${name}'`)
}

/**
 * Python hasattr() function - check if an object has an attribute
 *
 * @param obj - The object to check
 * @param name - The name of the attribute
 * @returns True if the attribute exists, false otherwise
 */
export function hasattr(obj: unknown, name: string): boolean {
  if (obj === null || obj === undefined) {
    return false
  }
  return name in (obj as Record<string, unknown>)
}

/**
 * Python setattr() function - set an attribute on an object
 *
 * @param obj - The object to set the attribute on
 * @param name - The name of the attribute
 * @param value - The value to set
 */
export function setattr(obj: unknown, name: string, value: unknown): void {
  if (obj === null || obj === undefined) {
    throw new TypeError(
      `'${obj === null ? "NoneType" : "undefined"}' object has no attribute '${name}'`
    )
  }
  ;(obj as Record<string, unknown>)[name] = value
}
