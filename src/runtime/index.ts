/**
 * Python Runtime Library for TypeScript
 *
 * Provides Python-compatible functions and operations
 * that don't have direct JavaScript equivalents.
 */

export const py = {
  // ============================================================
  // Arithmetic Operations (Python semantics)
  // ============================================================

  /**
   * Floor division (Python //)
   * Always rounds towards negative infinity, unlike Math.floor for negatives
   */
  floordiv(a: number, b: number): number {
    return Math.floor(a / b)
  },

  /**
   * Power operator (Python **)
   */
  pow(base: number, exp: number): number {
    return Math.pow(base, exp)
  },

  /**
   * Modulo (Python %)
   * Python's % always returns a result with the same sign as the divisor
   */
  mod(a: number, b: number): number {
    return ((a % b) + b) % b
  },

  // ============================================================
  // Slicing
  // ============================================================

  /**
   * Python-style slice operation
   * Supports negative indices and step
   */
  slice<T>(obj: string | T[], start?: number, stop?: number, step?: number): string | T[] {
    const len = obj.length
    const actualStep = step ?? 1

    if (actualStep === 0) {
      throw new Error("slice step cannot be zero")
    }

    // Normalize start and stop
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
  },

  /**
   * Python-style index access with support for negative indices
   * @param obj - Array or string to access
   * @param index - Index (can be negative to count from end)
   * @returns Element at the specified index
   */
  at<T>(obj: string | T[], index: number): T | string {
    const len = obj.length
    const normalizedIndex = index < 0 ? len + index : index
    if (normalizedIndex < 0 || normalizedIndex >= len) {
      throw new Error("IndexError: list index out of range")
    }
    return (obj as T[])[normalizedIndex] as T
  },

  /**
   * Python-style string/array repetition
   * @param obj - String or array to repeat
   * @param count - Number of times to repeat
   * @returns Repeated string or array
   */
  repeat<T>(obj: string | T[], count: number): string | T[] {
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
  },

  // ============================================================
  // Iterables
  // ============================================================

  /**
   * Python range() function
   */
  range(startOrStop: number, stop?: number, step?: number): Iterable<number> {
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
  },

  /**
   * Python enumerate() function
   */
  enumerate<T>(iterable: Iterable<T>, start = 0): Iterable<[number, T]> {
    return {
      *[Symbol.iterator]() {
        let index = start
        for (const item of iterable) {
          yield [index++, item] as [number, T]
        }
      }
    }
  },

  /**
   * Python zip() function
   */
  zip<T extends unknown[][]>(...iterables: { [K in keyof T]: Iterable<T[K]> }): Iterable<T> {
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
  },

  // ============================================================
  // Collections
  // ============================================================

  /**
   * Convert to list (array)
   */
  list<T>(iterable?: Iterable<T>): T[] {
    if (iterable === undefined) {
      return []
    }
    return Array.from(iterable)
  },

  /**
   * Create a Map (Python dict)
   */
  dict<K, V>(entries?: Iterable<[K, V]>): Map<K, V> {
    return new Map(entries)
  },

  /**
   * Create a Set
   */
  set<T>(iterable?: Iterable<T>): Set<T> {
    return new Set(iterable)
  },

  /**
   * Create a tuple (readonly array)
   */
  tuple<T extends unknown[]>(...items: T): Readonly<T> {
    return Object.freeze([...items]) as Readonly<T>
  },

  // ============================================================
  // Built-in Functions
  // ============================================================

  /**
   * Python len() function
   */
  len(obj: string | unknown[] | Map<unknown, unknown> | Set<unknown> | { length: number }): number {
    if (typeof obj === "string" || Array.isArray(obj)) {
      return obj.length
    }
    if (obj instanceof Map || obj instanceof Set) {
      return obj.size
    }
    // Handle objects with length property (e.g., NodeList, arguments)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof obj === "object" && obj !== null && "length" in obj) {
      return obj.length
    }
    throw new TypeError("object has no len()")
  },

  /**
   * Python abs() function
   */
  abs(x: number): number {
    return Math.abs(x)
  },

  /**
   * Python min() function
   */
  min<T>(...args: T[] | [Iterable<T>]): T {
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
  },

  /**
   * Python max() function
   */
  max<T>(...args: T[] | [Iterable<T>]): T {
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
  },

  /**
   * Python sum() function
   */
  sum(iterable: Iterable<number>, start = 0): number {
    let total = start
    for (const item of iterable) {
      total += item
    }
    return total
  },

  /**
   * Python sorted() function
   */
  sorted<T>(iterable: Iterable<T>, options?: { key?: (x: T) => unknown; reverse?: boolean }): T[] {
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
  },

  /**
   * Python reversed() function
   */
  reversed<T>(iterable: Iterable<T>): Iterable<T> {
    const arr = Array.from(iterable)
    return {
      *[Symbol.iterator]() {
        for (let i = arr.length - 1; i >= 0; i--) {
          yield arr[i] as T
        }
      }
    }
  },

  // ============================================================
  // Type Conversions
  // ============================================================

  /**
   * Python int() function
   */
  int(x: string | number | boolean, base?: number): number {
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
  },

  /**
   * Python float() function
   */
  float(x: string | number): number {
    if (typeof x === "number") {
      return x
    }
    const parsed = parseFloat(x)
    if (isNaN(parsed)) {
      throw new Error(`could not convert string to float: '${x}'`)
    }
    return parsed
  },

  /**
   * Python str() function
   */
  str(x: unknown): string {
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
      return "[" + x.map((item) => py.repr(item)).join(", ") + "]"
    }
    if (x instanceof Map) {
      const entries = Array.from(x.entries())
        .map(([k, v]) => `${py.repr(k)}: ${py.repr(v)}`)
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
          .map((item) => py.repr(item))
          .join(", ") +
        "}"
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return String(x)
  },

  /**
   * Python repr() function
   */
  repr(x: unknown): string {
    if (typeof x === "string") {
      return `'${x}'`
    }
    return py.str(x)
  },

  /**
   * Python bool() function
   */
  bool(x: unknown): boolean {
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
  },

  // ============================================================
  // Membership Testing
  // ============================================================

  /**
   * Python 'in' operator
   */
  in<T>(item: T, container: Iterable<T> | string | Map<T, unknown> | Set<T>): boolean {
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
  },

  /**
   * Python 'is' operator (identity comparison)
   */
  is(a: unknown, b: unknown): boolean {
    return a === b
  },

  // ============================================================
  // String Methods
  // ============================================================

  string: {
    /**
     * Python str.join()
     */
    join(sep: string, iterable: Iterable<string>): string {
      return Array.from(iterable).join(sep)
    },

    /**
     * Python str.split()
     */
    split(s: string, sep?: string, maxsplit?: number): string[] {
      if (sep === undefined) {
        // Split on whitespace
        const result = s.trim().split(/\s+/)
        if (maxsplit !== undefined && maxsplit >= 0) {
          if (result.length > maxsplit + 1) {
            const limited = result.slice(0, maxsplit)
            limited.push(result.slice(maxsplit).join(" "))
            return limited
          }
        }
        return result
      }

      if (maxsplit !== undefined && maxsplit >= 0) {
        const parts = s.split(sep)
        if (parts.length > maxsplit + 1) {
          const limited = parts.slice(0, maxsplit)
          limited.push(parts.slice(maxsplit).join(sep))
          return limited
        }
        return parts
      }

      return s.split(sep)
    },

    /**
     * Python str.strip()
     */
    strip(s: string, chars?: string): string {
      if (chars === undefined) {
        return s.trim()
      }
      const regex = new RegExp(`^[${escapeRegex(chars)}]+|[${escapeRegex(chars)}]+$`, "g")
      return s.replace(regex, "")
    },

    /**
     * Python str.upper()
     */
    upper(s: string): string {
      return s.toUpperCase()
    },

    /**
     * Python str.lower()
     */
    lower(s: string): string {
      return s.toLowerCase()
    },

    /**
     * Python str.startswith()
     */
    startswith(s: string, prefix: string, start?: number, end?: number): boolean {
      const substr = s.slice(start, end)
      return substr.startsWith(prefix)
    },

    /**
     * Python str.endswith()
     */
    endswith(s: string, suffix: string, start?: number, end?: number): boolean {
      const substr = s.slice(start, end)
      return substr.endsWith(suffix)
    },

    /**
     * Python str.replace()
     */
    replace(s: string, old: string, newStr: string, count?: number): string {
      if (count === undefined || count < 0) {
        return s.split(old).join(newStr)
      }

      let result = s
      for (let i = 0; i < count; i++) {
        const index = result.indexOf(old)
        if (index === -1) break
        result = result.slice(0, index) + newStr + result.slice(index + old.length)
      }
      return result
    },

    /**
     * Python str.find()
     */
    find(s: string, sub: string, start?: number, end?: number): number {
      const substr = s.slice(start, end)
      const index = substr.indexOf(sub)
      if (index === -1) return -1
      return (start ?? 0) + index
    },

    /**
     * Python str.count()
     */
    count(s: string, sub: string, start?: number, end?: number): number {
      const substr = s.slice(start, end)
      if (sub.length === 0) return substr.length + 1

      let count = 0
      let pos = 0
      while ((pos = substr.indexOf(sub, pos)) !== -1) {
        count++
        pos += sub.length
      }
      return count
    },

    /**
     * Python str.format()
     */
    format(s: string, ...args: unknown[]): string {
      let index = 0
      return s.replace(/\{(\d*)\}/g, (_, num: string) => {
        const i = num === "" ? index++ : parseInt(num, 10)
        return String(args[i])
      })
    }
  },

  // ============================================================
  // Other Built-ins
  // ============================================================

  /**
   * Python isinstance() - simplified version
   */
  isinstance(obj: unknown, classInfo: unknown): boolean {
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
  },

  /**
   * Python type() - simplified version
   */
  type(obj: unknown): string {
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
  },

  /**
   * Python input() - for Node.js (sync version using readline)
   */
  input(prompt?: string): string {
    // Note: This is a simplified sync version for Node.js
    // In a real implementation, you'd want to use readline or similar
    if (prompt) {
      process.stdout.write(prompt)
    }
    // For now, return empty string - proper implementation needs readline
    throw new Error("input() requires async implementation")
  },

  /**
   * Python ord()
   */
  ord(char: string): number {
    if (char.length !== 1) {
      throw new Error("ord() expected a character")
    }
    return char.charCodeAt(0)
  },

  /**
   * Python chr()
   */
  chr(code: number): string {
    return String.fromCharCode(code)
  },

  /**
   * Python all()
   */
  all(iterable: Iterable<unknown>): boolean {
    for (const item of iterable) {
      if (!py.bool(item)) return false
    }
    return true
  },

  /**
   * Python any()
   */
  any(iterable: Iterable<unknown>): boolean {
    for (const item of iterable) {
      if (py.bool(item)) return true
    }
    return false
  },

  /**
   * Python map()
   */
  map<T, U>(fn: (x: T) => U, iterable: Iterable<T>): Iterable<U> {
    return {
      *[Symbol.iterator]() {
        for (const item of iterable) {
          yield fn(item)
        }
      }
    }
  },

  /**
   * Python filter()
   */
  filter<T>(fn: ((x: T) => boolean) | null, iterable: Iterable<T>): Iterable<T> {
    return {
      *[Symbol.iterator]() {
        for (const item of iterable) {
          if (fn === null ? py.bool(item) : fn(item)) {
            yield item
          }
        }
      }
    }
  },

  /**
   * Python round()
   */
  round(number: number, ndigits?: number): number {
    if (ndigits === undefined || ndigits === 0) {
      // Python uses banker's rounding (round half to even)
      const rounded = Math.round(number)
      if (Math.abs(number % 1) === 0.5) {
        return rounded % 2 === 0 ? rounded : rounded - Math.sign(number)
      }
      return rounded
    }

    const factor = Math.pow(10, ndigits)
    return Math.round(number * factor) / factor
  },

  /**
   * Python divmod()
   */
  divmod(a: number, b: number): [number, number] {
    return [py.floordiv(a, b), py.mod(a, b)]
  },

  /**
   * Python hex()
   */
  hex(x: number): string {
    const prefix = x < 0 ? "-0x" : "0x"
    return prefix + Math.abs(Math.trunc(x)).toString(16)
  },

  /**
   * Python oct()
   */
  oct(x: number): string {
    const prefix = x < 0 ? "-0o" : "0o"
    return prefix + Math.abs(Math.trunc(x)).toString(8)
  },

  /**
   * Python bin()
   */
  bin(x: number): string {
    const prefix = x < 0 ? "-0b" : "0b"
    return prefix + Math.abs(Math.trunc(x)).toString(2)
  },

  /**
   * Python ascii() - returns ASCII representation, escaping non-ASCII chars
   */
  ascii(x: unknown): string {
    const s = py.repr(x)
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
  },

  /**
   * Python format() - formats a value according to format spec
   * Supports: [[fill]align][sign][#][0][width][,][.precision][type]
   */
  format(value: unknown, spec: string): string {
    if (spec === "") {
      return py.str(value)
    }

    // Parse format spec
    const match = spec.match(
      /^(.?[<>=^])?([+\- ])?([#])?(0)?(\d+)?([,_])?(?:\.(\d+))?([bcdeEfFgGnosxX%])?$/
    )

    if (!match) {
      return py.str(value)
    }

    const [, alignPart, sign, hash, zero, widthStr, grouping, precisionStr, type] = match

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

    // Handle zero-padding
    if (zero && !alignPart) {
      fill = "0"
      align = "="
    }

    // Format the value based on type
    let result: string

    if (type === "s" || (!type && typeof value === "string")) {
      result = py.str(value)
      if (precision !== undefined) {
        result = result.slice(0, precision)
      }
    } else if (type === "d" || (!type && typeof value === "number" && Number.isInteger(value))) {
      const num = typeof value === "number" ? value : py.int(value as string | number | boolean)
      result = formatNumber(num, sign, "", grouping)
    } else if (type === "f" || type === "F") {
      const num = typeof value === "number" ? value : py.float(value as string | number)
      const prec = precision ?? 6
      result = formatNumber(num, sign, "", grouping, prec, false)
      if (type === "F") result = result.toUpperCase()
    } else if (type === "e" || type === "E") {
      const num = typeof value === "number" ? value : py.float(value as string | number)
      const prec = precision ?? 6
      result = num.toExponential(prec)
      if (sign === "+" && num >= 0) result = "+" + result
      else if (sign === " " && num >= 0) result = " " + result
      if (type === "E") result = result.toUpperCase()
    } else if (type === "g" || type === "G") {
      const num = typeof value === "number" ? value : py.float(value as string | number)
      const prec = precision ?? 6
      result = num.toPrecision(prec)
      if (sign === "+" && num >= 0) result = "+" + result
      else if (sign === " " && num >= 0) result = " " + result
      if (type === "G") result = result.toUpperCase()
    } else if (type === "x" || type === "X") {
      const num =
        typeof value === "number" ? Math.trunc(value) : py.int(value as string | number | boolean)
      result = Math.abs(num).toString(16)
      if (hash) result = "0x" + result
      if (num < 0) result = "-" + result
      else if (sign === "+") result = "+" + result
      else if (sign === " ") result = " " + result
      if (type === "X") result = result.toUpperCase()
    } else if (type === "o") {
      const num =
        typeof value === "number" ? Math.trunc(value) : py.int(value as string | number | boolean)
      result = Math.abs(num).toString(8)
      if (hash) result = "0o" + result
      if (num < 0) result = "-" + result
      else if (sign === "+") result = "+" + result
      else if (sign === " ") result = " " + result
    } else if (type === "b") {
      const num =
        typeof value === "number" ? Math.trunc(value) : py.int(value as string | number | boolean)
      result = Math.abs(num).toString(2)
      if (hash) result = "0b" + result
      if (num < 0) result = "-" + result
      else if (sign === "+") result = "+" + result
      else if (sign === " ") result = " " + result
    } else if (type === "c") {
      const code = typeof value === "number" ? value : py.int(value as string | number | boolean)
      result = String.fromCharCode(code)
    } else if (type === "%") {
      const num = typeof value === "number" ? value : py.float(value as string | number)
      const prec = precision ?? 6
      result = (num * 100).toFixed(prec) + "%"
      if (sign === "+" && num >= 0) result = "+" + result
      else if (sign === " " && num >= 0) result = " " + result
    } else if (type === "n") {
      // Locale-aware number - simplified to just using grouping
      const num = typeof value === "number" ? value : py.float(value as string | number)
      result = num.toLocaleString()
    } else {
      result = py.str(value)
    }

    // Apply width and alignment
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
        // Pad after sign
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
}

// Helper functions

function normalizeIndex(index: number, length: number, forNegativeStep = false): number {
  if (index < 0) {
    index = length + index
  }

  if (forNegativeStep) {
    return Math.max(-1, Math.min(length - 1, index))
  }

  return Math.max(0, Math.min(length, index))
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

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

  // Add grouping (thousands separator)
  if (grouping) {
    const sep = grouping === "_" ? "_" : ","
    const parts = result.split(".")
    const intPart = parts[0] as string
    const sign = intPart[0] === "-" ? "-" : ""
    const digits = sign ? intPart.slice(1) : intPart
    const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep)
    parts[0] = sign + grouped
    result = parts.join(".")
  }

  // Add sign
  if (num >= 0) {
    if (sign === "+") {
      result = "+" + result
    } else if (sign === " ") {
      result = " " + result
    }
  }

  return result
}

export default py
