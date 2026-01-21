/**
 * Python copy module for TypeScript
 *
 * Provides shallow and deep copy operations.
 *
 * @see {@link https://docs.python.org/3/library/copy.html | Python copy documentation}
 * @module
 */

/**
 * Create a shallow copy of an object.
 *
 * For primitive types, returns the value as-is.
 * For arrays, returns a new array with the same elements.
 * For objects, returns a new object with the same properties.
 * For Maps and Sets, returns new instances with the same entries.
 *
 * @param x - The object to copy
 * @returns A shallow copy of x
 *
 * @example
 * ```typescript
 * const original = [1, [2, 3], 4]
 * const copied = copy(original)
 * copied[0] = 99
 * console.log(original[0]) // 1 (unchanged)
 * copied[1][0] = 99
 * console.log(original[1][0]) // 99 (nested array is shared)
 * ```
 */
export function copy<T>(x: T): T {
  // Handle null and undefined
  if (x === null || x === undefined) {
    return x
  }

  // Handle primitives (they are already values, not references)
  const type = typeof x
  if (
    type === "number" ||
    type === "string" ||
    type === "boolean" ||
    type === "bigint" ||
    type === "symbol"
  ) {
    return x
  }

  // Handle Date
  if (x instanceof Date) {
    return new Date(x.getTime()) as T
  }

  // Handle RegExp
  if (x instanceof RegExp) {
    return new RegExp(x.source, x.flags) as T
  }

  // Handle Array
  if (Array.isArray(x)) {
    return [...x] as T
  }

  // Handle Map
  if (x instanceof Map) {
    return new Map(x) as T
  }

  // Handle Set
  if (x instanceof Set) {
    return new Set(x) as T
  }

  // Handle typed arrays
  if (ArrayBuffer.isView(x) && !(x instanceof DataView)) {
    const TypedArrayConstructor = x.constructor as new (buffer: ArrayBuffer) => T
    const typedArray = x as unknown as { buffer: ArrayBuffer }
    return new TypedArrayConstructor(typedArray.buffer.slice(0))
  }

  // Handle DataView
  if (x instanceof DataView) {
    return new DataView(x.buffer.slice(0), x.byteOffset, x.byteLength) as T
  }

  // Handle ArrayBuffer
  if (x instanceof ArrayBuffer) {
    return x.slice(0) as T
  }

  // Handle plain objects
  if (type === "object") {
    const proto = Object.getPrototypeOf(x) as object | null
    if (proto === Object.prototype || proto === null) {
      return { ...x }
    }
    // For custom class instances, create new object with same prototype
    const result = Object.create(proto) as T
    return Object.assign(result, x)
  }

  // For functions and other types, return as-is
  return x
}

/**
 * Create a deep copy of an object.
 *
 * Creates a complete independent copy of the object and all nested objects.
 * Uses structuredClone when available, with a fallback for older environments.
 *
 * Note: Functions cannot be deep copied and will be shared between copies.
 *
 * @param x - The object to deep copy
 * @param memo - Internal map for circular reference handling (optional)
 * @returns A deep copy of x
 *
 * @example
 * ```typescript
 * const original = { a: 1, b: { c: 2 } }
 * const copied = deepcopy(original)
 * copied.b.c = 99
 * console.log(original.b.c) // 2 (unchanged)
 * ```
 */
export function deepcopy<T>(x: T, memo?: Map<unknown, unknown>): T {
  // Try to use structuredClone if available (modern browsers and Node.js 17+)
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(x)
    } catch {
      // structuredClone doesn't support functions or symbols
      // Fall through to manual implementation
    }
  }

  // Handle null and undefined
  if (x === null || x === undefined) {
    return x
  }

  // Handle primitives
  const type = typeof x
  if (
    type === "number" ||
    type === "string" ||
    type === "boolean" ||
    type === "bigint" ||
    type === "symbol"
  ) {
    return x
  }

  // Initialize memo for circular reference handling
  if (!memo) {
    memo = new Map()
  }

  // Check if we've already copied this object (circular reference)
  if (memo.has(x)) {
    return memo.get(x) as T
  }

  // Handle Date
  if (x instanceof Date) {
    const result = new Date(x.getTime()) as T
    memo.set(x, result)
    return result
  }

  // Handle RegExp
  if (x instanceof RegExp) {
    const result = new RegExp(x.source, x.flags) as T
    memo.set(x, result)
    return result
  }

  // Handle Array
  if (Array.isArray(x)) {
    const result: unknown[] = []
    memo.set(x, result)
    for (const item of x) {
      result.push(deepcopy(item, memo))
    }
    return result as T
  }

  // Handle Map
  if (x instanceof Map) {
    const result = new Map()
    memo.set(x, result)
    for (const [key, value] of x) {
      result.set(deepcopy(key, memo), deepcopy(value, memo))
    }
    return result as T
  }

  // Handle Set
  if (x instanceof Set) {
    const result = new Set()
    memo.set(x, result)
    for (const item of x) {
      result.add(deepcopy(item, memo))
    }
    return result as T
  }

  // Handle typed arrays
  if (ArrayBuffer.isView(x) && !(x instanceof DataView)) {
    const TypedArrayConstructor = x.constructor as new (buffer: ArrayBuffer) => T
    const typedArray = x as unknown as { buffer: ArrayBuffer }
    const result = new TypedArrayConstructor(typedArray.buffer.slice(0))
    memo.set(x, result)
    return result
  }

  // Handle DataView
  if (x instanceof DataView) {
    const result = new DataView(x.buffer.slice(0), x.byteOffset, x.byteLength) as T
    memo.set(x, result)
    return result
  }

  // Handle ArrayBuffer
  if (x instanceof ArrayBuffer) {
    const result = x.slice(0) as T
    memo.set(x, result)
    return result
  }

  // Handle functions (cannot be deep copied, return as-is)
  if (type === "function") {
    return x
  }

  // Handle plain objects and class instances
  if (type === "object") {
    const proto = Object.getPrototypeOf(x) as object | null
    const result = Object.create(proto) as T & Record<string, unknown>
    memo.set(x, result)

    // Copy own enumerable properties
    for (const key of Object.keys(x as object)) {
      result[key] = deepcopy((x as Record<string, unknown>)[key], memo)
    }

    // Copy symbol properties
    for (const sym of Object.getOwnPropertySymbols(x as object)) {
      const descriptor = Object.getOwnPropertyDescriptor(x, sym)
      if (descriptor?.enumerable) {
        ;(result as Record<symbol, unknown>)[sym] = deepcopy(
          (x as Record<symbol, unknown>)[sym],
          memo
        )
      }
    }

    return result
  }

  return x
}
