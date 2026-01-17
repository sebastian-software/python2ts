/**
 * Python list methods for TypeScript
 * Usage: py.list.remove(), py.list.sort(), etc.
 */

export const list = {
  /**
   * Python list.append() - modifies array in place
   */
  append<T>(arr: T[], item: T): void {
    arr.push(item)
  },

  /**
   * Python list.extend() - modifies array in place
   */
  extend<T>(arr: T[], items: Iterable<T>): void {
    arr.push(...items)
  },

  /**
   * Python list.insert() - modifies array in place
   */
  insert<T>(arr: T[], index: number, item: T): void {
    arr.splice(index, 0, item)
  },

  /**
   * Python list.remove() - removes first occurrence, modifies in place
   */
  remove<T>(arr: T[], value: T): void {
    const index = arr.indexOf(value)
    if (index === -1) {
      throw new Error("list.remove(x): x not in list")
    }
    arr.splice(index, 1)
  },

  /**
   * Python list.pop() - removes and returns item at index
   */
  pop<T>(arr: T[], index?: number): T {
    if (arr.length === 0) {
      throw new Error("pop from empty list")
    }
    const i = index ?? arr.length - 1
    const normalizedIndex = i < 0 ? arr.length + i : i
    if (normalizedIndex < 0 || normalizedIndex >= arr.length) {
      throw new Error("pop index out of range")
    }
    return arr.splice(normalizedIndex, 1)[0] as T
  },

  /**
   * Python list.clear() - removes all items
   */
  clear(arr: unknown[]): void {
    arr.length = 0
  },

  /**
   * Python list.index() - finds first occurrence
   */
  index<T>(arr: T[], value: T, start?: number, end?: number): number {
    const searchStart = start ?? 0
    const searchEnd = end ?? arr.length
    for (let i = searchStart; i < searchEnd; i++) {
      if (arr[i] === value) {
        return i
      }
    }
    throw new Error("x not in list")
  },

  /**
   * Python list.count() - counts occurrences
   */
  count<T>(arr: T[], value: T): number {
    let count = 0
    for (const item of arr) {
      if (item === value) count++
    }
    return count
  },

  /**
   * Python list.sort() with key function - modifies in place
   */
  sort<T>(arr: T[], options?: { key?: (x: T) => unknown; reverse?: boolean }): void {
    const key = options?.key ?? ((x: T) => x as unknown)
    const reverse = options?.reverse ?? false
    arr.sort((a, b) => {
      const aKey = key(a) as string | number
      const bKey = key(b) as string | number
      let cmp = 0
      if (aKey < bKey) cmp = -1
      else if (aKey > bKey) cmp = 1
      return reverse ? -cmp : cmp
    })
  },

  /**
   * Python list.reverse() - reverses in place
   */
  reverse(arr: unknown[]): void {
    arr.reverse()
  },

  /**
   * Python list.copy() - shallow copy
   */
  copy<T>(arr: T[]): T[] {
    return [...arr]
  },

  /**
   * Python slice assignment: arr[start:end:step] = values
   * Replaces a slice of the array with new values, modifying in place
   */
  sliceAssign<T>(
    arr: T[],
    start: number | undefined,
    end: number | undefined,
    step: number | undefined,
    values: T[]
  ): void {
    const len = arr.length
    const actualStep = step ?? 1

    // Normalize start and end
    let actualStart = start ?? (actualStep > 0 ? 0 : len - 1)
    let actualEnd = end ?? (actualStep > 0 ? len : -len - 1)

    // Handle negative indices
    if (actualStart < 0) actualStart = Math.max(0, len + actualStart)
    if (actualEnd < 0) actualEnd = Math.max(0, len + actualEnd)

    // Clamp to array bounds
    actualStart = Math.min(actualStart, len)
    actualEnd = Math.min(actualEnd, len)

    if (actualStep === 1) {
      // Simple case: contiguous slice
      const deleteCount = Math.max(0, actualEnd - actualStart)
      arr.splice(actualStart, deleteCount, ...values)
    } else {
      // Extended slice with step
      // Collect indices that will be replaced
      const indices: number[] = []
      if (actualStep > 0) {
        for (let i = actualStart; i < actualEnd; i += actualStep) {
          indices.push(i)
        }
      } else {
        for (let i = actualStart; i > actualEnd; i += actualStep) {
          indices.push(i)
        }
      }

      // For extended slices, lengths must match
      if (indices.length !== values.length) {
        throw new Error(
          `attempt to assign sequence of size ${String(values.length)} to extended slice of size ${String(indices.length)}`
        )
      }

      // Replace values at each index
      for (let i = 0; i < indices.length; i++) {
        const idx = indices[i]
        if (idx !== undefined) {
          arr[idx] = values[i] as T
        }
      }
    }
  }
}
