/**
 * Python functools module for TypeScript
 *
 * Provides higher-order functions and operations on callable objects,
 * including partial application, function caching (lru_cache), and reduce.
 *
 * @see {@link https://docs.python.org/3/library/functools.html | Python functools documentation}
 * @module
 */

/**
 * Create a partial function application
 * partial(func, arg1, arg2) returns a function that calls func with arg1, arg2 prepended
 *
 * Example:
 *   const add = (a: number, b: number) => a + b
 *   const add5 = partial(add, 5)
 *   add5(3) // returns 8
 */
export function partial<T extends (...args: unknown[]) => unknown>(
  func: T,
  ...partialArgs: unknown[]
): (...args: unknown[]) => ReturnType<T> {
  return (...args: unknown[]): ReturnType<T> => {
    return func(...partialArgs, ...args) as ReturnType<T>
  }
}

/**
 * Apply a function of two arguments cumulatively to the items of an iterable
 * reduce((x, y) => x + y, [1, 2, 3, 4, 5]) returns 15
 * reduce((x, y) => x + y, [1, 2, 3, 4, 5], 10) returns 25
 */
export function reduce<T, U = T>(
  func: (acc: U, val: T) => U,
  iterable: Iterable<T>,
  initializer?: U
): U {
  const arr = [...iterable]

  if (arr.length === 0) {
    if (initializer === undefined) {
      throw new TypeError("reduce() of empty sequence with no initial value")
    }
    return initializer
  }

  let acc: U
  let startIdx: number

  if (initializer !== undefined) {
    acc = initializer
    startIdx = 0
  } else {
    acc = arr[0] as unknown as U
    startIdx = 1
  }

  for (let i = startIdx; i < arr.length; i++) {
    acc = func(acc, arr[i] as T)
  }

  return acc
}

/**
 * Simple LRU cache decorator (returns a memoized version of the function)
 * Note: This is a simplified implementation that caches based on JSON-stringified arguments
 *
 * Example:
 *   const fib = lruCache((n: number): number => n <= 1 ? n : fib(n - 1) + fib(n - 2))
 */
export function lruCache<T extends (...args: unknown[]) => unknown>(
  func: T,
  maxsize: number = 128
): T & {
  cacheInfo: () => { hits: number; misses: number; maxsize: number; currsize: number }
  cacheClear: () => void
} {
  const cache = new Map<string, ReturnType<T>>()
  const order: string[] = []
  let hits = 0
  let misses = 0

  const cached = ((...args: unknown[]): ReturnType<T> => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      hits++
      // Move to end (most recently used)
      const idx = order.indexOf(key)
      if (idx > -1) {
        order.splice(idx, 1)
        order.push(key)
      }
      return cache.get(key) as ReturnType<T>
    }

    misses++
    const result = func(...args) as ReturnType<T>

    // Evict oldest if at max size
    if (maxsize > 0 && cache.size >= maxsize) {
      const oldest = order.shift()
      if (oldest !== undefined) {
        cache.delete(oldest)
      }
    }

    cache.set(key, result)
    order.push(key)

    return result
  }) as T & {
    cacheInfo: () => { hits: number; misses: number; maxsize: number; currsize: number }
    cacheClear: () => void
  }

  cached.cacheInfo = () => ({
    hits,
    misses,
    maxsize,
    currsize: cache.size
  })

  cached.cacheClear = () => {
    cache.clear()
    order.length = 0
    hits = 0
    misses = 0
  }

  return cached
}

/**
 * Cache decorator that caches all calls (no size limit)
 * Equivalent to lru_cache(maxsize=None)
 */
export function cache<T extends (...args: unknown[]) => unknown>(func: T): T {
  const cacheMap = new Map<string, ReturnType<T>>()

  return ((...args: unknown[]): ReturnType<T> => {
    const key = JSON.stringify(args)
    if (cacheMap.has(key)) {
      return cacheMap.get(key) as ReturnType<T>
    }
    const result = func(...args) as ReturnType<T>
    cacheMap.set(key, result)
    return result
  }) as T
}

/**
 * Return a new partial object which behaves like func called with keyword arguments
 * In TypeScript, we simulate this with an options object as the last argument
 */
export function partialMethod<T extends (...args: unknown[]) => unknown>(
  func: T,
  ...partialArgs: unknown[]
): (...args: unknown[]) => ReturnType<T> {
  return partial(func, ...partialArgs)
}

/**
 * Transform a function into a single-dispatch generic function
 * This is a simplified version - full singleDispatch would require runtime type checking
 */
export function singleDispatch<T extends (...args: unknown[]) => unknown>(
  func: T
): T & { register: (type: string, impl: T) => void } {
  const registry = new Map<string, T>()
  registry.set("object", func)

  const dispatcher = ((...args: unknown[]): ReturnType<T> => {
    if (args.length === 0) {
      return func(...args) as ReturnType<T>
    }

    const firstArg = args[0]
    let typeName: string

    if (firstArg === null) {
      typeName = "null"
    } else if (Array.isArray(firstArg)) {
      typeName = "array"
    } else {
      typeName = typeof firstArg
    }

    const impl = registry.get(typeName) ?? func
    return impl(...args) as ReturnType<T>
  }) as T & { register: (type: string, impl: T) => void }

  dispatcher.register = (type: string, impl: T) => {
    registry.set(type, impl)
  }

  return dispatcher
}

/**
 * Decorator to update a wrapper function to look like the wrapped function
 * In TypeScript, this just returns the wrapper as-is (metadata is handled differently)
 */
export function wraps<T extends (...args: unknown[]) => unknown>(
  wrapped: T
): (wrapper: (...args: unknown[]) => unknown) => T {
  return (wrapper: (...args: unknown[]) => unknown): T => {
    // Copy function name if possible
    Object.defineProperty(wrapper, "name", { value: wrapped.name, writable: false })
    return wrapper as T
  }
}

/**
 * Return a callable object that fetches attr from its operand
 * attrGetter('name') returns a function that gets the 'name' attribute
 */
export function attrGetter<T>(...attrs: string[]): (obj: unknown) => T | T[] {
  if (attrs.length === 1) {
    const attr = attrs[0] as string
    const parts = attr.split(".")
    return (obj: unknown): T => {
      let result: unknown = obj
      for (const part of parts) {
        result = (result as Record<string, unknown>)[part]
      }
      return result as T
    }
  }

  return (obj: unknown): T[] => {
    return attrs.map((attr) => {
      const parts = attr.split(".")
      let result: unknown = obj
      for (const part of parts) {
        result = (result as Record<string, unknown>)[part]
      }
      return result as T
    })
  }
}

/**
 * Return a callable object that fetches item from its operand
 * itemGetter(1) returns a function that gets index 1
 * itemGetter('key') returns a function that gets the 'key' property
 */
export function itemGetter<T>(...items: (string | number)[]): (obj: unknown) => T | T[] {
  if (items.length === 1) {
    const item = items[0] as string | number
    return (obj: unknown): T => {
      if (Array.isArray(obj) && typeof item === "number") {
        return obj[item] as T
      }
      return (obj as Record<string | number, T>)[item] as T
    }
  }

  return (obj: unknown): T[] => {
    return items.map((item): T => {
      if (Array.isArray(obj) && typeof item === "number") {
        return obj[item] as T
      }
      return (obj as Record<string | number, T>)[item] as T
    })
  }
}

/**
 * Return a callable object that calls the method name on its operand
 * methodCaller('split', ' ') returns a function that calls .split(' ')
 */
export function methodCaller(name: string, ...args: unknown[]): (obj: unknown) => unknown {
  return (obj: unknown): unknown => {
    const method = (obj as Record<string, (...a: unknown[]) => unknown>)[name]
    if (typeof method !== "function") {
      throw new TypeError(`'${typeof obj}' object has no method '${name}'`)
    }
    return method.apply(obj, args)
  }
}

/**
 * Return the same object passed in (identity function)
 */
export function identity<T>(x: T): T {
  return x
}

/**
 * Compare two objects for ordering (returns -1, 0, or 1)
 * Used for sorting with a key function
 */
export function cmpToKey<T>(
  mycmp: (a: T, b: T) => number
): (x: T) => { value: T; __lt__: (other: { value: T }) => boolean } {
  return (x: T) => ({
    value: x,
    __lt__(other: { value: T }): boolean {
      return mycmp(x, other.value) < 0
    }
  })
}

/**
 * Return total ordering for a class that has __lt__, __le__, __gt__, or __ge__
 * This is typically used as a class decorator in Python
 * In TypeScript, we provide helper comparisons
 */
/* v8 ignore start -- complex utility rarely used directly @preserve */
export function totalOrdering<
  T extends {
    __lt__?: (other: T) => boolean
    __le__?: (other: T) => boolean
    __gt__?: (other: T) => boolean
    __ge__?: (other: T) => boolean
    __eq__?: (other: T) => boolean
  }
>(
  obj: T
): T & {
  __lt__: (other: T) => boolean
  __le__: (other: T) => boolean
  __gt__: (other: T) => boolean
  __ge__: (other: T) => boolean
} {
  const lt = obj.__lt__?.bind(obj)
  const le = obj.__le__?.bind(obj)
  const gt = obj.__gt__?.bind(obj)
  const ge = obj.__ge__?.bind(obj)
  const eq = obj.__eq__?.bind(obj) ?? ((other: T) => obj === other)

  const result = obj as T & {
    __lt__: (other: T) => boolean
    __le__: (other: T) => boolean
    __gt__: (other: T) => boolean
    __ge__: (other: T) => boolean
  }

  if (lt) {
    result.__lt__ = lt
    result.__le__ = (other: T) => lt(other) || eq(other)
    result.__gt__ = (other: T) => !lt(other) && !eq(other)
    result.__ge__ = (other: T) => !lt(other)
  } else if (le) {
    result.__le__ = le
    result.__lt__ = (other: T) => le(other) && !eq(other)
    result.__gt__ = (other: T) => !le(other)
    result.__ge__ = (other: T) => !le(other) || eq(other)
  } else if (gt) {
    result.__gt__ = gt
    result.__ge__ = (other: T) => gt(other) || eq(other)
    result.__lt__ = (other: T) => !gt(other) && !eq(other)
    result.__le__ = (other: T) => !gt(other)
  } else if (ge) {
    result.__ge__ = ge
    result.__gt__ = (other: T) => ge(other) && !eq(other)
    result.__le__ = (other: T) => !ge(other) || eq(other)
    result.__lt__ = (other: T) => !ge(other)
  }

  return result
}
/* v8 ignore stop */

/**
 * Pipe a value through a series of functions.
 * @inspired Remeda, Ramda
 *
 * Example:
 *   pipe(5, x => x * 2, x => x + 1) // returns 11
 */
export function pipe<T>(value: T): T
export function pipe<T, A>(value: T, fn1: (x: T) => A): A
export function pipe<T, A, B>(value: T, fn1: (x: T) => A, fn2: (x: A) => B): B
export function pipe<T, A, B, C>(value: T, fn1: (x: T) => A, fn2: (x: A) => B, fn3: (x: B) => C): C
export function pipe<T, A, B, C, D>(
  value: T,
  fn1: (x: T) => A,
  fn2: (x: A) => B,
  fn3: (x: B) => C,
  fn4: (x: C) => D
): D
export function pipe<T, A, B, C, D, E>(
  value: T,
  fn1: (x: T) => A,
  fn2: (x: A) => B,
  fn3: (x: B) => C,
  fn4: (x: C) => D,
  fn5: (x: D) => E
): E
export function pipe(value: unknown, ...fns: ((x: unknown) => unknown)[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), value)
}
