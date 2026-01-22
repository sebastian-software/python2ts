/**
 * NumPy-like ndarray operations for TypeScript
 *
 * This module provides basic ndarray operations for supporting Python code
 * that uses NumPy-style multi-dimensional array indexing.
 *
 * @see {@link https://numpy.org/doc/stable/reference/arrays.indexing.html | NumPy Array Indexing}
 * @module
 */

/**
 * Slice specification: { start?, stop?, step? } or undefined for full slice
 */
export interface SliceSpec {
  start?: number | undefined
  stop?: number | undefined
  step?: number | undefined
}

/**
 * Dimension index: either a number (single index) or a slice spec
 */
export type DimIndex = number | SliceSpec | undefined

/**
 * Create a slice specification for multi-dimensional array indexing
 *
 * @example
 * ```typescript
 * // Python: arr[:, 0]
 * ndarray.set(arr, [slice(undefined, undefined), 0], value)
 *
 * // Python: arr[1:3, :]
 * ndarray.set(arr, [slice(1, 3), slice(undefined, undefined)], value)
 * ```
 */
export function slice(start?: number, stop?: number, step?: number): SliceSpec {
  return { start, stop, step }
}

/**
 * Set values in a multi-dimensional array using NumPy-style indexing
 *
 * @example
 * ```typescript
 * const arr = [[1, 2, 3], [4, 5, 6]]
 * // arr[:, 0] = 10  (set first column to 10)
 * ndarray.set(arr, [slice(undefined, undefined), 0], 10)
 * // arr is now [[10, 2, 3], [10, 5, 6]]
 * ```
 */
export function set<T>(arr: T[][], indices: DimIndex[], value: T | T[] | T[][]): void {
  if (indices.length === 0) {
    return
  }

  const firstIndex = indices[0]
  const remainingIndices = indices.slice(1)

  // Handle based on the type of firstIndex
  if (typeof firstIndex === "object") {
    // firstIndex is a slice spec (object with start/stop/step)
    const start = firstIndex.start ?? 0
    const stop = firstIndex.stop ?? arr.length
    const step = firstIndex.step ?? 1

    for (let i = start; i < stop; i += step) {
      const row = arr[i]
      if (row !== undefined) {
        if (remainingIndices.length === 0) {
          // Setting entire row
          if (Array.isArray(value)) {
            arr[i] = value as T[]
          }
        } else {
          // Recurse into next dimension
          setRow(row, remainingIndices, value)
        }
      }
    }
  } else if (typeof firstIndex === "number") {
    // firstIndex is a number - direct index
    const row = arr[firstIndex]
    if (row !== undefined) {
      if (remainingIndices.length === 0) {
        // Setting entire row at index
        if (Array.isArray(value)) {
          arr[firstIndex] = value as T[]
        }
      } else {
        // Recurse into next dimension
        setRow(row, remainingIndices, value)
      }
    }
  } else {
    // firstIndex is undefined - means full slice (:)
    for (let i = 0; i < arr.length; i++) {
      const row = arr[i]
      if (row !== undefined) {
        if (remainingIndices.length === 0) {
          if (Array.isArray(value)) {
            arr[i] = value as T[]
          }
        } else {
          setRow(row, remainingIndices, value)
        }
      }
    }
  }
}

/**
 * Helper to broadcast a scalar value to array indices
 */
function broadcastScalar(
  row: unknown[],
  value: unknown,
  start: number,
  stop: number,
  step: number
): void {
  for (let i = start; i < stop; i += step) {
    row[i] = value
  }
}

/**
 * Helper to set values in a 1D row based on remaining indices
 */
function setRow<T>(row: T[], indices: DimIndex[], value: T | T[] | T[][]): void {
  if (indices.length === 0) {
    return
  }

  const firstIndex = indices[0]
  const remainingIndices = indices.slice(1)

  if (typeof firstIndex === "object") {
    // Slice on this dimension
    const start = firstIndex.start ?? 0
    const stop = firstIndex.stop ?? row.length
    const step = firstIndex.step ?? 1

    if (remainingIndices.length === 0) {
      // Setting values in this slice
      if (Array.isArray(value)) {
        let valueIdx = 0
        const valueArr = value as T[]
        for (let i = start; i < stop; i += step) {
          const val = valueArr[valueIdx++]
          if (val !== undefined) {
            row[i] = val
          }
        }
      } else {
        // Broadcast scalar value
        broadcastScalar(row, value, start, stop, step)
      }
    }
  } else if (typeof firstIndex === "number") {
    // Direct index
    if (remainingIndices.length === 0) {
      row[firstIndex] = value as T
    }
  } else {
    // Full slice - set all values (firstIndex is undefined)
    if (remainingIndices.length === 0) {
      if (Array.isArray(value)) {
        const valueArr = value as T[]
        for (let i = 0; i < row.length && i < valueArr.length; i++) {
          const val = valueArr[i]
          if (val !== undefined) {
            row[i] = val
          }
        }
      } else {
        // Broadcast scalar value
        broadcastScalar(row, value, 0, row.length, 1)
      }
    }
  }
}

export const ndarray = {
  set,
  slice
}
