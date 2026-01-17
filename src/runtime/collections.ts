/**
 * Python collections module for TypeScript
 *
 * Provides specialized container datatypes.
 */

/**
 * Counter: a dict subclass for counting hashable objects
 *
 * Elements are stored as keys and their counts are stored as values.
 */
export class Counter<T> extends Map<T, number> {
  constructor(iterable?: Iterable<T>) {
    super()
    if (iterable) {
      for (const item of iterable) {
        this.increment(item)
      }
    }
  }

  /**
   * Increment the count for a key
   */
  increment(key: T, n: number = 1): void {
    this.set(key, (super.get(key) ?? 0) + n)
  }

  /**
   * Get the count for a key (returns 0 for missing keys)
   */
  get(key: T): number {
    return super.get(key) ?? 0
  }

  /**
   * List the n most common elements and their counts
   * If n is undefined, list all elements from most common to least
   */
  mostCommon(n?: number): [T, number][] {
    const sorted = [...this.entries()].sort((a, b) => b[1] - a[1])
    return n !== undefined ? sorted.slice(0, n) : sorted
  }

  /**
   * Iterate over elements, repeating each as many times as its count
   */
  *elements(): Generator<T> {
    for (const [key, count] of this) {
      for (let i = 0; i < count; i++) {
        yield key
      }
    }
  }

  /**
   * Subtract counts from another iterable or Counter
   */
  subtract(iterable: Iterable<T> | Counter<T>): void {
    if (iterable instanceof Counter) {
      for (const [key, count] of iterable) {
        this.set(key, (super.get(key) ?? 0) - count)
      }
    } else {
      for (const item of iterable) {
        this.set(item, (super.get(item) ?? 0) - 1)
      }
    }
  }

  /**
   * Add counts from another iterable or Counter
   */
  update(iterable: Iterable<T> | Counter<T>): void {
    if (iterable instanceof Counter) {
      for (const [key, count] of iterable) {
        this.increment(key, count)
      }
    } else {
      for (const item of iterable) {
        this.increment(item)
      }
    }
  }

  /**
   * Return total count of all elements
   */
  total(): number {
    let sum = 0
    for (const count of this.values()) {
      sum += count
    }
    return sum
  }
}

/**
 * defaultdict: a dict that provides default values for missing keys
 *
 * Uses a Proxy to automatically call the factory function for missing keys.
 */
export function defaultdict<K, V>(factory: () => V): Map<K, V> & { get(key: K): V } {
  const map = new Map<K, V>()
  return new Proxy(map, {
    get(target, prop, receiver) {
      if (prop === "get") {
        return (key: K): V => {
          if (!target.has(key)) {
            target.set(key, factory())
          }
          return target.get(key)!
        }
      }
      const val = Reflect.get(target, prop, receiver)
      return typeof val === "function" ? val.bind(target) : val
    }
  }) as Map<K, V> & { get(key: K): V }
}

/**
 * deque: double-ended queue with O(1) append and pop from both ends
 */
export class deque<T> {
  private items: T[]
  private maxlen: number | null

  constructor(iterable?: Iterable<T>, maxlen?: number) {
    this.items = iterable ? [...iterable] : []
    this.maxlen = maxlen ?? null
    if (this.maxlen !== null && this.items.length > this.maxlen) {
      this.items = this.items.slice(-this.maxlen)
    }
  }

  /**
   * Add element to the right end
   */
  append(x: T): void {
    this.items.push(x)
    if (this.maxlen !== null && this.items.length > this.maxlen) {
      this.items.shift()
    }
  }

  /**
   * Add element to the left end
   */
  appendleft(x: T): void {
    this.items.unshift(x)
    if (this.maxlen !== null && this.items.length > this.maxlen) {
      this.items.pop()
    }
  }

  /**
   * Remove and return element from the right end
   */
  pop(): T | undefined {
    return this.items.pop()
  }

  /**
   * Remove and return element from the left end
   */
  popleft(): T | undefined {
    return this.items.shift()
  }

  /**
   * Extend the right side with elements from iterable
   */
  extend(iterable: Iterable<T>): void {
    for (const x of iterable) {
      this.append(x)
    }
  }

  /**
   * Extend the left side with elements from iterable
   */
  extendleft(iterable: Iterable<T>): void {
    for (const x of iterable) {
      this.appendleft(x)
    }
  }

  /**
   * Rotate the deque n steps to the right (negative n rotates left)
   */
  rotate(n: number = 1): void {
    if (this.items.length === 0) return
    n = n % this.items.length
    if (n > 0) {
      for (let i = 0; i < n; i++) {
        this.appendleft(this.pop()!)
      }
    } else if (n < 0) {
      for (let i = 0; i < -n; i++) {
        this.append(this.popleft()!)
      }
    }
  }

  /**
   * Remove all elements
   */
  clear(): void {
    this.items = []
  }

  /**
   * Number of elements
   */
  get length(): number {
    return this.items.length
  }

  /**
   * Make iterable
   */
  *[Symbol.iterator](): Generator<T> {
    yield* this.items
  }

  /**
   * Convert to array
   */
  toArray(): T[] {
    return [...this.items]
  }
}
