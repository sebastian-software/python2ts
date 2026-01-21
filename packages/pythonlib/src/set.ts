/**
 * Python set methods for TypeScript
 * Usage: py.set.intersection(), py.set.union(), etc.
 *
 * Uses ES2024 native Set methods where available for optimal performance.
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
   * Uses ES2024 Set.prototype.union()
   */
  union<T>(a: Set<T>, ...others: Iterable<T>[]): Set<T> {
    let result: Set<T> = new Set(a)
    for (const other of others) {
      result = result.union(other instanceof Set ? other : new Set(other)) as Set<T>
    }
    return result
  },

  /**
   * Python set.intersection() - returns new set with common elements
   * Uses ES2024 Set.prototype.intersection()
   */
  intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
    return a.intersection(b)
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
   * Uses ES2024 Set.prototype.difference()
   */
  difference<T>(a: Set<T>, b: Set<T>): Set<T> {
    return a.difference(b)
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
   * Uses ES2024 Set.prototype.symmetricDifference()
   */
  symmetricDifference<T>(a: Set<T>, b: Set<T>): Set<T> {
    return a.symmetricDifference(b)
  },

  /**
   * Python set.symmetric_difference_update() - update with symmetric difference
   * Uses ES2024 Set.prototype.symmetricDifference()
   */
  symmetricDifferenceUpdate<T>(a: Set<T>, b: Set<T>): void {
    const result = a.symmetricDifference(b)
    a.clear()
    for (const item of result) a.add(item)
  },

  /**
   * Python set.isSubset() - test if all elements are in other
   * Uses ES2024 Set.prototype.isSubsetOf()
   */
  isSubset<T>(a: Set<T>, b: Set<T>): boolean {
    return a.isSubsetOf(b)
  },

  /**
   * Python set.isSuperset() - test if all other elements are in this set
   * Uses ES2024 Set.prototype.isSupersetOf()
   */
  isSuperset<T>(a: Set<T>, b: Set<T>): boolean {
    return a.isSupersetOf(b)
  },

  /**
   * Python set.isDisjoint() - test if no common elements
   * Uses ES2024 Set.prototype.isDisjointFrom()
   */
  isDisjoint<T>(a: Set<T>, b: Set<T>): boolean {
    return a.isDisjointFrom(b)
  }
}
