/**
 * Python set methods for TypeScript
 * Usage: py.set.intersection(), py.set.union(), etc.
 */

export const set = {
  /**
   * Python set.add() - add element
   */
  add<T>(s: Set<T>, item: T): void {
    s.add(item)
  },

  /**
   * Python set.remove() - remove element, raises error if not found
   */
  remove<T>(s: Set<T>, item: T): void {
    if (!s.has(item)) {
      throw new Error("KeyError")
    }
    s.delete(item)
  },

  /**
   * Python set.discard() - remove element if present
   */
  discard<T>(s: Set<T>, item: T): void {
    s.delete(item)
  },

  /**
   * Python set.pop() - remove and return arbitrary element
   */
  pop<T>(s: Set<T>): T {
    if (s.size === 0) {
      throw new Error("pop from an empty set")
    }
    const item = s.values().next().value as T
    s.delete(item)
    return item
  },

  /**
   * Python set.clear() - remove all elements
   */
  clear<T>(s: Set<T>): void {
    s.clear()
  },

  /**
   * Python set.copy() - shallow copy
   */
  copy<T>(s: Set<T>): Set<T> {
    return new Set(s)
  },

  /**
   * Python set.update() - add elements from iterable
   */
  update<T>(s: Set<T>, ...iterables: Iterable<T>[]): void {
    for (const iterable of iterables) {
      for (const item of iterable) {
        s.add(item)
      }
    }
  },

  /**
   * Python set.union() - returns new set with all elements
   */
  union<T>(a: Set<T>, ...others: Iterable<T>[]): Set<T> {
    const result = new Set(a)
    for (const other of others) {
      for (const item of other) {
        result.add(item)
      }
    }
    return result
  },

  /**
   * Python set.intersection() - returns new set with common elements
   */
  intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
    const result = new Set<T>()
    for (const item of a) {
      if (b.has(item)) result.add(item)
    }
    return result
  },

  /**
   * Python set.intersection_update() - keep only common elements
   */
  intersectionUpdate<T>(a: Set<T>, b: Set<T>): void {
    for (const item of a) {
      if (!b.has(item)) a.delete(item)
    }
  },

  /**
   * Python set.difference() - returns new set with elements in a but not in b
   */
  difference<T>(a: Set<T>, b: Set<T>): Set<T> {
    const result = new Set<T>()
    for (const item of a) {
      if (!b.has(item)) result.add(item)
    }
    return result
  },

  /**
   * Python set.difference_update() - remove elements found in b
   */
  differenceUpdate<T>(a: Set<T>, b: Set<T>): void {
    for (const item of b) {
      a.delete(item)
    }
  },

  /**
   * Python set.symmetric_difference() - returns new set with elements in either but not both
   */
  symmetricDifference<T>(a: Set<T>, b: Set<T>): Set<T> {
    const result = new Set<T>()
    for (const item of a) {
      if (!b.has(item)) result.add(item)
    }
    for (const item of b) {
      if (!a.has(item)) result.add(item)
    }
    return result
  },

  /**
   * Python set.symmetric_difference_update() - update with symmetric difference
   */
  symmetricDifferenceUpdate<T>(a: Set<T>, b: Set<T>): void {
    const toAdd: T[] = []
    const toRemove: T[] = []
    for (const item of a) {
      if (b.has(item)) toRemove.push(item)
    }
    for (const item of b) {
      if (!a.has(item)) toAdd.push(item)
    }
    for (const item of toRemove) a.delete(item)
    for (const item of toAdd) a.add(item)
  },

  /**
   * Python set.issubset() - test if all elements are in other
   */
  issubset<T>(a: Set<T>, b: Set<T>): boolean {
    for (const item of a) {
      if (!b.has(item)) return false
    }
    return true
  },

  /**
   * Python set.issuperset() - test if all other elements are in this set
   */
  issuperset<T>(a: Set<T>, b: Set<T>): boolean {
    for (const item of b) {
      if (!a.has(item)) return false
    }
    return true
  },

  /**
   * Python set.isdisjoint() - test if no common elements
   */
  isdisjoint<T>(a: Set<T>, b: Set<T>): boolean {
    for (const item of a) {
      if (b.has(item)) return false
    }
    return true
  }
}
